import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import TaskList from '../pages/tasks/TaskList';
import CreateTask from '../pages/tasks/CreateTask';
import { getTasks, createTask, updateTaskStatus } from '../services/taskService';
import { TaskStatus, TaskPriority, TaskCategory } from '../types';

// Mock the task service
vi.mock('../services/taskService', () => ({
  getTasks: vi.fn(),
  createTask: vi.fn(),
  updateTaskStatus: vi.fn(),
}));

describe('Tasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Task List', () => {
    const mockTasks = [
      {
        _id: '1',
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        category: TaskCategory.FEATURE,
        dueDate: new Date().toISOString(),
        createdBy: 'user1',
        organizationId: 'org1',
      },
    ];

    it('should render task list', async () => {
      (getTasks as any).mockResolvedValueOnce(mockTasks);

      render(
        <BrowserRouter>
          <AuthProvider>
            <TaskList />
          </AuthProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Task')).toBeInTheDocument();
      });
    });

    it('should handle task status update', async () => {
      (getTasks as any).mockResolvedValueOnce(mockTasks);
      (updateTaskStatus as any).mockResolvedValueOnce({
        ...mockTasks[0],
        status: TaskStatus.COMPLETED,
      });

      render(
        <BrowserRouter>
          <AuthProvider>
            <TaskList />
          </AuthProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Task')).toBeInTheDocument();
      });

      // Find and click the complete button
      const completeButton = screen.getByTitle('Mark as completed');
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(updateTaskStatus).toHaveBeenCalledWith('1', TaskStatus.COMPLETED);
      });
    });
  });

  describe('Create Task', () => {
    it('should render create task form', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <CreateTask />
          </AuthProvider>
        </BrowserRouter>
      );

      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    });

    it('should handle task creation', async () => {
      const newTask = {
        title: 'New Task',
        description: 'New Description',
        category: TaskCategory.FEATURE,
        priority: TaskPriority.HIGH,
        dueDate: '2024-12-31',
      };

      (createTask as any).mockResolvedValueOnce({
        _id: '2',
        ...newTask,
        status: TaskStatus.TODO,
        createdBy: 'user1',
        organizationId: 'org1',
      });

      render(
        <BrowserRouter>
          <AuthProvider>
            <CreateTask />
          </AuthProvider>
        </BrowserRouter>
      );

      await userEvent.type(screen.getByLabelText(/title/i), newTask.title);
      await userEvent.type(screen.getByLabelText(/description/i), newTask.description);
      
      const categorySelect = screen.getByLabelText(/category/i);
      fireEvent.change(categorySelect, { target: { value: newTask.category } });
      
      const prioritySelect = screen.getByLabelText(/priority/i);
      fireEvent.change(prioritySelect, { target: { value: newTask.priority } });
      
      const dueDateInput = screen.getByLabelText(/due date/i);
      fireEvent.change(dueDateInput, { target: { value: newTask.dueDate } });

      fireEvent.click(screen.getByRole('button', { name: /create task/i }));

      await waitFor(() => {
        expect(createTask).toHaveBeenCalledWith(newTask);
      });
    });
  });
});