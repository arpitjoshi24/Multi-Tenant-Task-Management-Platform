import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'completed', 'expired'],
    default: 'todo',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  category: {
    type: String,
    enum: ['bug', 'feature', 'improvement', 'documentation', 'other'],
    default: 'other',
  },
  dueDate: {
    type: Date,
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
}, { timestamps: true });

// Indexes for efficient queries
TaskSchema.index({ organizationId: 1 });
TaskSchema.index({ assignedTo: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ dueDate: 1 });

const Task = mongoose.model('Task', TaskSchema);

export default Task;