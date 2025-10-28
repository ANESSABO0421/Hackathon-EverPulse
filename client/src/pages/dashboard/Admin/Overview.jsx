import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { adminAPI } from '../../../services/api';
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Activity,
  Clock,
  CheckCircle,
  BarChart2,
  UserPlus,
  FileCheck,
  MessageSquare
} from 'lucide-react';
import './Overview.css';

// Skeleton Loader Component
const SkeletonLoader = () => (
  <div className="animate-pulse space-y-6 p-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="bg-white rounded-lg shadow p-6">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-100 rounded w-1/3"></div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="h-64 bg-gray-100 rounded"></div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-200 mr-4"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Overview = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, analyticsResponse] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getAnalytics(30)
      ]);
      
      setDashboardData(dashboardResponse.data);
      setAnalytics(analyticsResponse.analytics);
    } catch (error) {
      setError(error.message);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: color }}>
        <Icon size={24} color="white" />
      </div>
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <p className="stat-value">{value?.toLocaleString() || 0}</p>
        {trend && (
          <div className={`stat-trend ${trend > 0 ? 'positive' : 'negative'}`}>
            <TrendingUp size={16} />
            <span>{Math.abs(trendValue)}% from last month</span>
          </div>
        )}
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, color, onClick }) => (
    <div className="quick-action-card" onClick={onClick}>
      <div className="action-icon" style={{ backgroundColor: color }}>
        <Icon size={20} color="white" />
      </div>
      <div className="action-content">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return (
      <div className="admin-overview-container">
        <div className="error-message">
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-overview-container">
      <div className="overview-header">
        <h1>Admin Dashboard Overview</h1>
        <p>Welcome back! Here's what's happening in your healthcare system.</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Doctors"
          value={dashboardData?.totalDoctors}
          icon={Stethoscope}
          color="#3b82f6"
          trend={analytics?.overview?.recentDoctors > 0}
          trendValue={analytics?.overview?.recentDoctors}
        />
        <StatCard
          title="Total Patients"
          value={dashboardData?.totalPatients}
          icon={Users}
          color="#10b981"
          trend={analytics?.overview?.recentPatients > 0}
          trendValue={analytics?.overview?.recentPatients}
        />
        <StatCard
          title="Total Appointments"
          value={dashboardData?.totalAppointments}
          icon={Calendar}
          color="#f59e0b"
          trend={analytics?.overview?.recentAppointments > 0}
          trendValue={analytics?.overview?.recentAppointments}
        />
        <StatCard
          title="Medical Records"
          value={dashboardData?.totalRecords}
          icon={FileText}
          color="#8b5cf6"
          trend={analytics?.overview?.recentRecords > 0}
          trendValue={analytics?.overview?.recentRecords}
        />
      </div>

      {/* Recent Activity */}
      <div className="dashboard-section">
        <h2>Recent Activity (Last 30 Days)</h2>
        <div className="activity-grid">
          <div className="activity-card">
            <div className="activity-header">
              <Clock size={20} color="#6b7280" />
              <span>New Registrations</span>
            </div>
            <div className="activity-stats">
              <div className="activity-item">
                <span className="activity-label">Doctors:</span>
                <span className="activity-value">{analytics?.overview?.recentDoctors || 0}</span>
              </div>
              <div className="activity-item">
                <span className="activity-label">Patients:</span>
                <span className="activity-value">{analytics?.overview?.recentPatients || 0}</span>
              </div>
            </div>
          </div>

          <div className="activity-card">
            <div className="activity-header">
              <Activity size={20} color="#6b7280" />
              <span>Medical Activity</span>
            </div>
            <div className="activity-stats">
              <div className="activity-item">
                <span className="activity-label">Appointments:</span>
                <span className="activity-value">{analytics?.overview?.recentAppointments || 0}</span>
              </div>
              <div className="activity-item">
                <span className="activity-label">Records:</span>
                <span className="activity-value">{analytics?.overview?.recentRecords || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          <QuickActionCard
            title="Manage Doctors"
            description="View, edit, and manage doctor profiles"
            icon={Stethoscope}
            color="#3b82f6"
            onClick={() => window.location.href = '/dashboard/admin/doctors'}
          />
          <QuickActionCard
            title="Manage Patients"
            description="View and manage patient information"
            icon={Users}
            color="#10b981"
            onClick={() => window.location.href = '/dashboard/admin/patients'}
          />
          <QuickActionCard
            title="View Appointments"
            description="Monitor and manage appointments"
            icon={Calendar}
            color="#f59e0b"
            onClick={() => window.location.href = '/dashboard/admin/appointments'}
          />
          <QuickActionCard
            title="Medical Records"
            description="Access and manage medical records"
            icon={FileText}
            color="#8b5cf6"
            onClick={() => window.location.href = '/dashboard/admin/records'}
          />
          <QuickActionCard
            title="Analytics"
            description="View detailed analytics and reports"
            icon={TrendingUp}
            color="#ef4444"
            onClick={() => window.location.href = '/dashboard/admin/analytics'}
          />
          <QuickActionCard
            title="Feedback"
            description="Review patient and doctor feedback"
            icon={CheckCircle}
            color="#06b6d4"
            onClick={() => window.location.href = '/dashboard/admin/feedback'}
          />
        </div>
      </div>

      {/* System Status */}
      <div className="dashboard-section">
        <h2>System Status</h2>
        <div className="system-status">
          <div className="status-item">
            <div className="status-indicator online"></div>
            <span>Database Connection</span>
          </div>
          <div className="status-item">
            <div className="status-indicator online"></div>
            <span>API Services</span>
          </div>
          <div className="status-item">
            <div className="status-indicator online"></div>
            <span>File Storage</span>
          </div>
          <div className="status-item">
            <div className="status-indicator online"></div>
            <span>Email Service</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;