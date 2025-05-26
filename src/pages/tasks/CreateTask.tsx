import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertCircle } from 'lucide-react';
import { createTask } from '../../services/taskService';
import { getOrganizationMembers } from '../../services/organizationService';
import { CreateTaskFormInputs, TaskCategory, TaskPriority, User } from '../../types';

const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  category: z.enum([
    TaskCategory.BUG, 
    TaskCategory.FEATURE, 
    TaskCategory.IMPROVEMENT, 
    TaskCategory.DOCUMENTATION, 
    TaskCategory.OTHER
  ]),
  priority: z.enum([TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH]),
  dueDate: z.string().refine(val => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, {
    message: 'Invalid due date',
  }),
  assignedTo: z.string().optional(),
});

const CreateTask: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTaskFormInputs>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      category: TaskCategory.OTHER,
      priority: TaskPriority.MEDIUM,
    },
  });

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoadingMembers(true);
        const membersData = await getOrganizationMembers();
        setMembers(membersData);
      } catch (err) {
        console.error('Error fetching organization members:', err);
        setError('Failed to load team members. Please try again.');
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, []);

  const onSubmit = async (data: CreateTaskFormInputs) => {
    try {
      setLoading(true);
      setError(null);
      await createTask(data);
      navigate('/tasks');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred while creating the task');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Task</h1>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow-sm rounded-lg p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              className={`mt-1 input ${errors.title ? 'border-red-300' : ''}`}
              placeholder="Task title"
              {...register('title')}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className="mt-1 input"
              placeholder="Task description"
              {...register('description')}
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                className={`mt-1 input ${errors.category ? 'border-red-300' : ''}`}
                {...register('category')}
              >
                <option value={TaskCategory.BUG}>Bug</option>
                <option value={TaskCategory.FEATURE}>Feature</option>
                <option value={TaskCategory.IMPROVEMENT}>Improvement</option>
                <option value={TaskCategory.DOCUMENTATION}>Documentation</option>
                <option value={TaskCategory.OTHER}>Other</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                id="priority"
                className={`mt-1 input ${errors.priority ? 'border-red-300' : ''}`}
                {...register('priority')}
              >
                <option value={TaskPriority.LOW}>Low</option>
                <option value={TaskPriority.MEDIUM}>Medium</option>
                <option value={TaskPriority.HIGH}>High</option>
              </select>
              {errors.priority && (
                <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                id="dueDate"
                type="date"
                className={`mt-1 input ${errors.dueDate ? 'border-red-300' : ''}`}
                {...register('dueDate')}
              />
              {errors.dueDate && (
                <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
                Assign To
              </label>
              {loadingMembers ? (
                <div className="mt-1 flex items-center">
                  <Loader2 className="h-5 w-5 text-primary-500 animate-spin" />
                  <span className="ml-2 text-sm text-gray-500">Loading members...</span>
                </div>
              ) : (
                <select
                  id="assignedTo"
                  className="mt-1 input"
                  {...register('assignedTo')}
                >
                  <option value="">Select team member</option>
                  {members.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/tasks')}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;