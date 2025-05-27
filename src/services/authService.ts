import axios from 'axios';
import { AuthUser, LoginFormInputs, RegisterFormInputs } from '../types';

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

export const loginUser = async (data: LoginFormInputs): Promise<AuthUser> => {
  try {
    const response = await api.post('/auth/login', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Login failed');
    }
    throw new Error('Network error during login');
  }
};

export const registerUser = async (data: RegisterFormInputs): Promise<AuthUser> => {
  try {
    const response = await api.post('/auth/register', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Registration failed');
    }
    throw new Error('Network error during registration');
  }
};

export const verifyToken = async (token: string): Promise<Omit<AuthUser, 'token'>> => {
  try {
    const response = await api.get('/auth/verify');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Token verification failed');
    }
    throw new Error('Network error during token verification');
  }
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  try {
    await api.post('/auth/request-reset', { email });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Password reset request failed');
    }
    throw new Error('Network error during password reset request');
  }
};

export const resetPassword = async (token: string, password: string): Promise<void> => {
  try {
    await api.post('/auth/reset-password', { token, password });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Password reset failed');
    }
    throw new Error('Network error during password reset');
  }
};

export const checkInvitation = async (token: string): Promise<{ 
  valid: boolean; 
  organization?: { name: string; id: string }; 
  role?: string;
}> => {
  try {
    const response = await api.get(`/invitations/validate/${token}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Invalid invitation');
    }
    throw new Error('Network error validating invitation');
  }
};

export const checkOrganizationCode = async (code: string): Promise<boolean> => {
  try {
    const response = await api.post('/auth/check-organization-code', { code });
    return response.data.valid;
  } catch (error) {
    return false;
  }
};