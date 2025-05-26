import axios from 'axios';
import { 
  Organization, 
  User, 
  Invitation, 
  InviteUserFormInputs, 
  UserRole 
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

export const getOrganization = async (): Promise<Organization> => {
  try {
    const response = await api.get('/organizations/current');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch organization');
    }
    throw new Error('Network error while fetching organization');
  }
};

export const updateOrganization = async (data: Partial<Organization>): Promise<Organization> => {
  try {
    const response = await api.put('/organizations/current', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to update organization');
    }
    throw new Error('Network error while updating organization');
  }
};

export const getOrganizationMembers = async (): Promise<User[]> => {
  try {
    const response = await api.get('/organizations/members');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch organization members');
    }
    throw new Error('Network error while fetching organization members');
  }
};

export const inviteUser = async (data: InviteUserFormInputs): Promise<Invitation> => {
  try {
    const response = await api.post('/invitations', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to invite user');
    }
    throw new Error('Network error while inviting user');
  }
};

export const getPendingInvitations = async (): Promise<Invitation[]> => {
  try {
    const response = await api.get('/invitations/pending');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch pending invitations');
    }
    throw new Error('Network error while fetching pending invitations');
  }
};

export const cancelInvitation = async (id: string): Promise<void> => {
  try {
    await api.delete(`/invitations/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to cancel invitation');
    }
    throw new Error('Network error while canceling invitation');
  }
};

export const updateUserRole = async (userId: string, role: UserRole): Promise<User> => {
  try {
    const response = await api.patch(`/organizations/members/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to update user role');
    }
    throw new Error('Network error while updating user role');
  }
};

export const removeUser = async (userId: string): Promise<void> => {
  try {
    await api.delete(`/organizations/members/${userId}`);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to remove user');
    }
    throw new Error('Network error while removing user');
  }
};