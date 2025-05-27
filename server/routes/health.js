import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : 'disconnected';

    // Check memory usage
    const memoryUsage = process.memoryUsage();
    const memoryStatus = memoryUsage.heapUsed < 1024 * 1024 * 512; 

    // Overall health status
    const healthy = dbState === 1 && memoryStatus;

    res.json({
      status: healthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: dbStatus,
          latency: await checkDbLatency(),
        },
        memory: {
          status: memoryStatus ? 'ok' : 'high',
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        },
      },
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

async function checkDbLatency() {
  const start = Date.now();
  await mongoose.connection.db.admin().ping();
  return Date.now() - start;
}

export default router;