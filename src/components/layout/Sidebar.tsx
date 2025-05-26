import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  Users, 
  Settings as SettingsIcon, 
  BarChart2, 
  PlusSquare,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  const isManagerOrAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER;

  return (
    <div className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded bg-primary-500 flex items-center justify-center text-white mr-2">
            <CheckSquare className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">TaskFlow</h1>
        </div>
      </div>
      
      <div className="flex-1 px-3 space-y-1">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`
          }
        >
          <Home className="mr-3 h-5 w-5" />
          Dashboard
        </NavLink>
        
        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            `flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`
          }
        >
          <CheckSquare className="mr-3 h-5 w-5" />
          Tasks
        </NavLink>
        
        {isManagerOrAdmin && (
          <NavLink
            to="/tasks/create"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <PlusSquare className="mr-3 h-5 w-5" />
            Create Task
          </NavLink>
        )}
        
        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            `flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`
          }
        >
          <Calendar className="mr-3 h-5 w-5" />
          Calendar
        </NavLink>
        
        {isManagerOrAdmin && (
          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <BarChart2 className="mr-3 h-5 w-5" />
            Analytics
          </NavLink>
        )}
        
        {isAdmin && (
          <NavLink
            to="/members"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <Users className="mr-3 h-5 w-5" />
            Team Members
          </NavLink>
        )}
        
        {isAdmin && (
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <SettingsIcon className="mr-3 h-5 w-5" />
            Settings
          </NavLink>
        )}
      </div>
      
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs font-medium text-gray-500 truncate">
              {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;