import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cron from 'node-cron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import organizationRoutes from './routes/organizations.js';
import invitationRoutes from './routes/invitations.js';

// Import services
import { checkExpiredTasks } from './services/taskService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/invitations', invitationRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'));
  });
}

// Schedule cron job to check for expired tasks
// Runs every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running scheduled task: Checking for expired tasks');
  try {
    const result = await checkExpiredTasks();
    console.log(`Updated ${result.count} expired tasks`);
  } catch (error) {
    console.error('Error running expired tasks check:', error);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;