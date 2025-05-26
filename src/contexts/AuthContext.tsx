import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser } from '../types';
import { loginUser, registerUser, verifyToken } from '../services/authService';
import { LoginFormInputs, RegisterFormInputs } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (data: LoginFormInputs) => Promise<void>;
  register: (data: RegisterFormInputs) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await verifyToken(token);
          setUser({ ...userData, token });
        } catch (err) {
          localStorage.removeItem('token');
          console.error('Token verification failed:', err);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: LoginFormInputs) => {
    setLoading(true);
    setError(null);
    try {
      const response = await loginUser(data);
      const { token, ...userData } = response;
      localStorage.setItem('token', token);
      setUser({ ...userData, token });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during login');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterFormInputs) => {
    setLoading(true);
    setError(null);
    try {
      const response = await registerUser(data);
      const { token, ...userData } = response;
      localStorage.setItem('token', token);
      setUser({ ...userData, token });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during registration');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        error, 
        login, 
        register, 
        logout, 
        clearError 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};