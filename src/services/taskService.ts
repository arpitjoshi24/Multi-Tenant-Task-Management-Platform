import axios from 'axios';
import { 
  Task, 
  CreateTaskFormInputs, 
  TaskStatistics, 
  TaskStatus, 
  ApiResponse 
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include auth token in requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getTasks = async (): Promise<Task[]> => {
  try {
    const response = await api.get('/tasks');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch tasks');
    }
    throw new Error('Network error while fetching tasks');
  }
};

export const getTaskById = async (id: string): Promise<Task> => {
  try {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch task');
    }
    throw new Error('Network error while fetching task');
  }
};

export const createTask = async (data: CreateTaskFormInputs): Promise<Task> => {
  try {
    const response = await api.post('/tasks', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to create task');
    }
    throw new Error('Network error while creating task');
  }
};

export const updateTask = async (id: string, data: Partial<CreateTaskFormInputs>): Promise<Task> => {
  try {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to update task');
    }
    throw new Error('Network error while updating task');
  }
};

export const updateTaskStatus = async (id: string, status: TaskStatus): Promise<Task> => {
  try {
    const response = await api.patch(`/tasks/${id}/status`, { status });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to update task status');
    }
    throw new Error('Network error while updating task status');
  }
};

export const deleteTask = async (id: string): Promise<void> => {
  try {
    await api.delete(`/tasks/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to delete task');
    }
    throw new Error('Network error while deleting task');
  }
};

export const getTaskStatistics = async (): Promise<TaskStatistics> => {
  try {
    const response = await api.get('/tasks/statistics');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch task statistics');
    }
    throw new Error('Network error while fetching task statistics');
  }
};

export const getAssignedTasks = async (): Promise<Task[]> => {
  try {
    const response = await api.get('/tasks/assigned');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch assigned tasks');
    }
    throw new Error('Network error while fetching assigned tasks');
  }
};