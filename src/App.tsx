import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

// Layout Components
import AppLayout from './components/layout/AppLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';

// Task Pages
import TaskList from './pages/tasks/TaskList';
import CreateTask from './pages/tasks/CreateTask';

// Organization Pages
import MembersList from './pages/organization/MembersList';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard\" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tasks" element={<TaskList />} />
            <Route path="tasks/create" element={<CreateTask />} />
            <Route path="members" element={<MembersList />} />
          </Route>
          
          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/\" replace />} />
        </Routes>
      </Router>
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;