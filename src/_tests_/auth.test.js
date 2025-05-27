import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import { loginUser, registerUser } from '../services/authService';

// Mock the auth service
vi.mock('../services/authService', () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
}));

describe('Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Login', () => {
    it('should render login form', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      );

      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should handle successful login', async () => {
      const mockUser = {
        _id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'member',
        token: 'test-token',
      };

      (loginUser as any).mockResolvedValueOnce(mockUser);

      render(
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      );

      await userEvent.type(screen.getByPlaceholderText(/email/i), 'test@example.com');
      await userEvent.type(screen.getByPlaceholderText(/password/i), 'password123');
      
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(loginUser).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('should display error message on login failure', async () => {
      (loginUser as any).mockRejectedValueOnce(new Error('Invalid credentials'));

      render(
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      );

      await userEvent.type(screen.getByPlaceholderText(/email/i), 'test@example.com');
      await userEvent.type(screen.getByPlaceholderText(/password/i), 'wrongpassword');
      
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });
  });

  describe('Register', () => {
    it('should render registration form', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <Register />
          </AuthProvider>
        </BrowserRouter>
      );

      expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/confirm password/i)).toBeInTheDocument();
    });

    it('should handle successful registration', async () => {
      const mockUser = {
        _id: '1',
        name: 'New User',
        email: 'newuser@example.com',
        role: 'admin',
        token: 'test-token',
      };

      (registerUser as any).mockResolvedValueOnce(mockUser);

      render(
        <BrowserRouter>
          <AuthProvider>
            <Register />
          </AuthProvider>
        </BrowserRouter>
      );

      await userEvent.type(screen.getByPlaceholderText(/full name/i), 'New User');
      await userEvent.type(screen.getByPlaceholderText(/email/i), 'newuser@example.com');
      await userEvent.type(screen.getByPlaceholderText(/^password$/i), 'password123');
      await userEvent.type(screen.getByPlaceholderText(/confirm password/i), 'password123');
      
      // Fill organization details
      await userEvent.type(screen.getByPlaceholderText(/organization.*name/i), 'Test Org');

      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(registerUser).toHaveBeenCalledWith({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          organizationName: 'Test Org',
          joinExisting: false,
        });
      });
    });
  });
});