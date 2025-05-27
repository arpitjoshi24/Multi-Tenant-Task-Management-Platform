// User related types
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  MEMBER = 'member',
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser extends User {
  token: string;
}

// Organization related types
export interface Organization {
  _id: string;
  name: string;
  description?: string;
  code: string;
  settings?: {
    theme: 'light' | 'dark';
  };
  createdAt: string;
  updatedAt: string;
}

// Task related types
export enum TaskCategory {
  BUG = 'bug',
  FEATURE = 'feature',
  IMPROVEMENT = 'improvement',
  DOCUMENTATION = 'documentation',
  OTHER = 'other',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  createdBy: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

// Invitation related types
export interface Invitation {
  _id: string;
  email: string;
  role: UserRole;
  organizationId: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: string;
  expiresAt: string;
}

// Dashboard statistics types
export interface TaskStatistics {
  total: number;
  todoCount: number;
  inProgressCount: number;
  completedCount: number;
  expiredCount: number;
  overdue: number;
  byCategory: Record<TaskCategory, number>;
  byPriority: Record<TaskPriority, number>;
  tasksByUser?: Record<string, number>;
  completedTasksByUser?: Record<string, number>;
}

// Form input types
export interface LoginFormInputs {
  email: string;
  password: string;
}

export interface RegisterFormInputs {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  organizationName?: string;
  joinExisting: boolean;
  inviteToken?: string;
  organizationCode?: string;
  role?: UserRole;
}

export interface CreateTaskFormInputs {
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: string;
  assignedTo?: string;
}

export interface InviteUserFormInputs {
  email: string;
  role: UserRole;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}