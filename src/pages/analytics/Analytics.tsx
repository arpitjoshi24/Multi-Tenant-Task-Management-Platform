import React, { useEffect, useState } from 'react';
import { getTaskStatistics } from '../../services/taskService';
import { getOrganizationMembers } from '../../services/organizationService';
import { TaskStatistics, User } from '../../types';
import { Loader2, AlertCircle, TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics: React.FC = () => {
  const [stats, setStats] = useState<TaskStatistics | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, membersData] = await Promise.all([
        getTaskStatistics(),
        getOrganizationMembers(),
      ]);
      setStats(statsData);
      setMembers(membersData);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
        <span className="ml-2 text-lg">Loading analytics...</span>
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

  if (!stats) return null;

  const taskStatusData = {
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
          'rgba(96, 165, 250, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(52, 211, 153, 0.8)',
          'rgba(239, 68, 68, 0.8)',
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

  const taskCategoryData = {
    labels: Object.keys(stats.byCategory).map(
      (key) => key.charAt(0).toUpperCase() + key.slice(1)
    ),
    datasets: [
      {
        label: 'Tasks by Category',
        data: Object.values(stats.byCategory),
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: 'rgb(124, 58, 237)',
        borderWidth: 1,
      },
    ],
  };

  const taskPriorityData = {
    labels: Object.keys(stats.byPriority).map(
      (key) => key.charAt(0).toUpperCase() + key.slice(1)
    ),
    datasets: [
      {
        label: 'Tasks by Priority',
        data: Object.values(stats.byPriority),
        backgroundColor: 'rgba(14, 165, 233, 0.8)',
        borderColor: 'rgb(2, 132, 199)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <button
          onClick={fetchData}
          className="btn btn-outline flex items-center"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Tasks</p>
              <p className="text-2xl font-semibold">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-semibold">{stats.completedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <Clock className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Overdue</p>
              <p className="text-2xl font-semibold">{stats.overdue}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Team Members</p>
              <p className="text-2xl font-semibold">{members.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Task Status Distribution</h2>
          <div className="h-64">
            <Pie data={taskStatusData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Tasks by Category</h2>
          <div className="h-64">
            <Bar
              data={taskCategoryData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Tasks by Priority</h2>
          <div className="h-64">
            <Bar
              data={taskPriorityData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Team Performance</h2>
          <div className="space-y-4">
            {members.map((member) => {
              const memberTasksCount = stats.tasksByUser?.[member._id] || 0;
              const completedTasksCount = stats.completedTasksByUser?.[member._id] || 0;
              const completionRate = memberTasksCount > 0
                ? (completedTasksCount / memberTasksCount) * 100
                : 0;

              return (
                <div key={member._id} className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                    {member.name.charAt(0)}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-sm text-gray-500">
                        {completedTasksCount}/{memberTasksCount} tasks
                      </p>
                    </div>
                    <div className="mt-1 h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-primary-500 rounded-full"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;