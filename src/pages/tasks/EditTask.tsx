import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertCircle } from 'lucide-react';
import { getTaskById, updateTask } from '../../services/taskService';
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

const EditTask: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingTask, setLoadingTask] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<CreateTaskFormInputs>({
    resolver: zodResolver(taskSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingTask(true);
        setLoadingMembers(true);
        setError(null);
        
        // Fetch in parallel for better performance
        const [taskData, membersData] = await Promise.all([
          getTaskById(id!),
          getOrganizationMembers()
        ]);
        
        setMembers(membersData);
        
        // Format date for input[type="date"]
        const formattedDueDate = new Date(taskData.dueDate).toISOString().split('T')[0];
        
        reset({
          title: taskData.title,
          description: taskData.description || '',
          category: taskData.category,
          priority: taskData.priority,
          dueDate: formattedDueDate,
          assignedTo: taskData.assignedTo?._id || '',
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load task data. Please try again later.');
      } finally {
        setLoadingTask(false);
        setLoadingMembers(false);
      }
    };

    fetchData();
  }, [id, reset]);

  const onSubmit = async (data: CreateTaskFormInputs) => {
    try {
      setLoading(true);
      setError(null);
      await updateTask(id!, data);
      navigate('/tasks', { state: { message: 'Task updated successfully!' } });
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loadingTask) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
        <span className="ml-2 text-lg">Loading task data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Edit Task</h1>
        <button
          onClick={() => navigate('/tasks')}
          className="btn btn-outline"
        >
          Back to Tasks
        </button>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow-sm rounded-lg p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              className={`input ${errors.title ? 'border-red-300' : ''}`}
              placeholder="Task title"
              {...register('title')}
              disabled={loading}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className="input"
              placeholder="Task description"
              {...register('description')}
              disabled={loading}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                className={`input ${errors.category ? 'border-red-300' : ''}`}
                {...register('category')}
                disabled={loading}
              >
                {Object.values(TaskCategory).map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0) + category.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                id="priority"
                className={`input ${errors.priority ? 'border-red-300' : ''}`}
                {...register('priority')}
                disabled={loading}
              >
                {Object.values(TaskPriority).map(priority => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0) + priority.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
              {errors.priority && (
                <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                id="dueDate"
                type="date"
                className={`input ${errors.dueDate ? 'border-red-300' : ''}`}
                {...register('dueDate')}
                disabled={loading}
              />
              {errors.dueDate && (
                <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
                Assign To
              </label>
              {loadingMembers ? (
                <div className="flex items-center">
                  <Loader2 className="h-5 w-5 text-primary-500 animate-spin mr-2" />
                  <span className="text-sm text-gray-500">Loading team members...</span>
                </div>
              ) : (
                <select
                  id="assignedTo"
                  className="input"
                  {...register('assignedTo')}
                  disabled={loading}
                >
                  <option value="">Unassigned</option>
                  {members.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/tasks')}
              className="btn btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !isDirty}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTask;