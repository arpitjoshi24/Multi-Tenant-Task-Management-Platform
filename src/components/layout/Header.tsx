import React, { useState } from 'react';
import { Bell, Menu, Settings, LogOut, User as UserIcon, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  return (
    <header className="bg-white border-b border-gray-200 z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
            <div className="hidden lg:block">
              <h1 className="text-xl font-semibold">TaskFlow</h1>
            </div>
          </div>
          
          <div className="flex items-center">
            <button
              type="button"
              className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <Bell className="h-6 w-6" />
            </button>
            
            <div className="ml-3 relative">
              <div>
                <button
                  type="button"
                  className="flex items-center max-w-xs rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </button>
              </div>
              
              {showUserMenu && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <UserIcon className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;