import Task from '../models/Task.js';

// Check for expired tasks and update their status
export const checkExpiredTasks = async () => {
  try {
    const now = new Date();
    
    // Find tasks that are past their due date but not marked as expired or completed
    const result = await Task.updateMany(
      { 
        dueDate: { $lt: now },
        status: { $in: ['todo', 'in_progress'] }
      },
      { 
        $set: { status: 'expired' } 
      }
    );
    
    return { 
      success: true, 
      count: result.modifiedCount 
    };
  } catch (error) {
    console.error('Error checking for expired tasks:', error);
    throw new Error('Failed to check for expired tasks');
  }
};

// Get tasks that are due soon (for notifications)
export const getTasksDueSoon = async (days = 1) => {
  try {
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + days);
    
    // Find tasks that are due within the specified days
    const tasks = await Task.find({
      dueDate: { 
        $gte: now,
        $lte: future
      },
      status: { $in: ['todo', 'in_progress'] }
    })
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');
    
    return tasks;
  } catch (error) {
    console.error(`Error getting tasks due in ${days} days:`, error);
    throw new Error('Failed to get tasks due soon');
  }
};