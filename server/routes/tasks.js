import express from 'express';
import Task from '../models/Task.js';
import { authenticate, isManagerOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all tasks for the user's organization
router.get('/', async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const tasks = await Task.find({ organizationId })
                          .populate('assignedTo', 'name email')
                          .populate('createdBy', 'name email')
                          .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error while fetching tasks' });
  }
});

// Get tasks assigned to the current user
router.get('/assigned', async (req, res) => {
  try {
    const userId = req.user._id;
    const organizationId = req.user.organizationId;
    
    const tasks = await Task.find({ 
      organizationId,
      assignedTo: userId
    })
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .sort({ dueDate: 1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching assigned tasks:', error);
    res.status(500).json({ message: 'Server error while fetching assigned tasks' });
  }
});

// Get task statistics
router.get('/statistics', async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    
    // Get all tasks for the organization
    const tasks = await Task.find({ organizationId });
    
    // Calculate statistics
    const now = new Date();
    
    const todoCount = tasks.filter(task => task.status === 'todo').length;
    const inProgressCount = tasks.filter(task => task.status === 'in_progress').length;
    const completedCount = tasks.filter(task => task.status === 'completed').length;
    const expiredCount = tasks.filter(task => task.status === 'expired').length;
    
    // Calculate tasks that are overdue but not marked as expired
    const overdue = tasks.filter(task => 
      (task.status === 'todo' || task.status === 'in_progress') && 
      new Date(task.dueDate) < now
    ).length;
    
    // Calculate by category
    const byCategory = {};
    tasks.forEach(task => {
      byCategory[task.category] = (byCategory[task.category] || 0) + 1;
    });
    
    // Calculate by priority
    const byPriority = {};
    tasks.forEach(task => {
      byPriority[task.priority] = (byPriority[task.priority] || 0) + 1;
    });
    
    res.json({
      total: tasks.length,
      todoCount,
      inProgressCount,
      completedCount,
      expiredCount,
      overdue,
      byCategory,
      byPriority,
    });
    
  } catch (error) {
    console.error('Error fetching task statistics:', error);
    res.status(500).json({ message: 'Server error while fetching task statistics' });
  }
});

// Get a specific task
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id,
      organizationId: req.user.organizationId
    })
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Server error while fetching task' });
  }
});

// Create a new task (only managers and admins)
router.post('/', isManagerOrAdmin, async (req, res) => {
  try {
    const { title, description, category, priority, dueDate, assignedTo } = req.body;
    
    const newTask = new Task({
      title,
      description,
      category,
      priority,
      dueDate,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      organizationId: req.user.organizationId,
    });
    
    const savedTask = await newTask.save();
    
    // Populate user references
    const populatedTask = await Task.findById(savedTask._id)
                                   .populate('assignedTo', 'name email')
                                   .populate('createdBy', 'name email');
    
    res.status(201).json(populatedTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Server error while creating task' });
  }
});

// Update a task (only managers and admins)
router.put('/:id', isManagerOrAdmin, async (req, res) => {
  try {
    const { title, description, category, priority, dueDate, assignedTo } = req.body;
    
    // Find task and check if it belongs to user's organization
    const task = await Task.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Update task fields
    task.title = title || task.title;
    task.description = description !== undefined ? description : task.description;
    task.category = category || task.category;
    task.priority = priority || task.priority;
    task.dueDate = dueDate || task.dueDate;
    task.assignedTo = assignedTo !== undefined ? assignedTo : task.assignedTo;
    
    const updatedTask = await task.save();
    
    // Populate user references
    const populatedTask = await Task.findById(updatedTask._id)
                                   .populate('assignedTo', 'name email')
                                   .populate('createdBy', 'name email');
    
    res.json(populatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Server error while updating task' });
  }
});

// Update task status (accessible to all authenticated users)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    // Find task and check if it belongs to user's organization
    const task = await Task.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user has permission to update this task
    if (req.user.role === 'member' && 
        task.assignedTo && 
        task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Access denied. You can only update tasks assigned to you.' 
      });
    }
    
    // Update status
    task.status = status;
    
    const updatedTask = await task.save();
    
    // Populate user references
    const populatedTask = await Task.findById(updatedTask._id)
                                   .populate('assignedTo', 'name email')
                                   .populate('createdBy', 'name email');
    
    res.json(populatedTask);
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Server error while updating task status' });
  }
});

// Delete a task (only managers and admins)
router.delete('/:id', isManagerOrAdmin, async (req, res) => {
  try {
    const result = await Task.deleteOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error while deleting task' });
  }
});

export default router;