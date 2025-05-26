import React, { useEffect, useState } from 'react';
import { getTaskStatistics } from '../../services/taskService';
import { getOrganization } from '../../services/organizationService';
import { TaskStatistics, Organization } from '../../types';
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TaskStatistics | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAdminOrManager = 
    user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, orgData] = await Promise.all([
          getTaskStatistics(),
          getOrganization(),
        ]);
        setStats(statsData);
        setOrganization(orgData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
        <span className="ml-2 text-lg">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats || !organization) {
    return null;
  }

  // Prepare data for pie chart
  const pieData = {
    labels: ['To Do', 'In Progress', 'Completed', 'Expired'],
    datasets: [
      {
        data: [
          stats.todoCount,
          stats.inProgressCount,
          stats.completedCount,
          stats.expiredCount,
        ],
        backgroundColor: [
          'rgba(96, 165, 250, 0.8)',  // Blue
          'rgba(251, 191, 36, 0.8)',  // Amber
          'rgba(52, 211, 153, 0.8)',  // Emerald
          'rgba(239, 68, 68, 0.8)',   // Red
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(245, 158, 11)',
          'rgb(16, 185, 129)',
          'rgb(220, 38, 38)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for category bar chart
  const categoryLabels = Object.keys(stats.byCategory).map(
    key => key.charAt(0).toUpperCase() + key.slice(1)
  );
  
  const categoryData = {
    labels: categoryLabels,
    datasets: [
      {
        label: 'Tasks by Category',
        data: Object.values(stats.byCategory),
        backgroundColor: 'rgba(139, 92, 246, 0.8)', // Purple
        borderColor: 'rgb(124, 58, 237)',
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for priority bar chart
  const priorityLabels = Object.keys(stats.byPriority).map(
    key => key.charAt(0).toUpperCase() + key.slice(1)
  );
  
  const priorityData = {
    labels: priorityLabels,
    datasets: [
      {
        label: 'Tasks by Priority',
        data: Object.values(stats.byPriority),
        backgroundColor: 'rgba(14, 165, 233, 0.8)', // Sky
        borderColor: 'rgb(2, 132, 199)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{organization.name} Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Tasks</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Completed Tasks</p>
              <p className="text-3xl font-bold">{stats.completedCount}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Overdue Tasks</p>
              <p className="text-3xl font-bold">{stats.overdue}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>
      
      {isAdminOrManager && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Task Status</h2>
            <div className="h-64">
              <Pie data={pieData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Tasks by Category</h2>
            <div className="h-64">
              <Bar 
                data={categoryData} 
                options={{ 
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Tasks by Priority</h2>
            <div className="h-64">
              <Bar 
                data={priorityData} 
                options={{ 
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;