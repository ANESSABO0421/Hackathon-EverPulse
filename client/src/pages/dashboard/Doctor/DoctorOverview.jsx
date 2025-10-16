import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  Calendar, 
  Users, 
  FileText, 
  Clock, 
  TrendingUp, 
  UserCheck,
  Activity,
  MessageSquare,
  Plus,
  Eye,
  Edit
} from 'lucide-react';
import { doctorAPI } from '../../../services/api';
import './DoctorOverview.css';

const DoctorOverview = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, profileResponse] = await Promise.all([
        doctorAPI.getDashboard(),
        doctorAPI.getProfile()
      ]);

      setDashboardData(dashboardResponse.dashboard);
      setDoctorProfile(profileResponse.doctor);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      rescheduled: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const StatCard = ({ title, value, icon: Icon, color, onClick }) => (
    <div 
      className={`stat-card ${color} ${onClick ? 'cursor-pointer hover:shadow-lg' : ''}`}
      onClick={onClick}
    >
      <div className="stat-icon">
        <Icon size={24} />
      </div>
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, onClick, color }) => (
    <div className={`quick-action-card ${color}`} onClick={onClick}>
      <div className="quick-action-icon">
        <Icon size={20} />
      </div>
      <div className="quick-action-content">
        <h4 className="quick-action-title">{title}</h4>
        <p className="quick-action-description">{description}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="doctor-overview">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData || !doctorProfile) {
    return (
      <div className="doctor-overview">
        <div className="error-container">
          <p>Failed to load dashboard data</p>
          <button onClick={loadDashboardData} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-overview">
      {/* Header */}
      <div className="overview-header">
        <div className="header-content">
          <h1 className="header-title">Welcome back, Dr. {doctorProfile.name}</h1>
          <p className="header-subtitle">
            {doctorProfile.specialization} • {doctorProfile.hospitalAffiliation || 'Medical Center'}
          </p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={() => navigate('/dashboard/doctor/doctorappointments')}
          >
            <Calendar size={16} />
            View All Appointments
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Today's Appointments"
          value={dashboardData.todayAppointments?.length || 0}
          icon={Calendar}
          color="bg-blue-50 border-blue-200 text-blue-700"
          onClick={() => navigate('/dashboard/doctor/doctorappointments')}
        />
        <StatCard
          title="Total Patients"
          value={dashboardData.totalPatients || 0}
          icon={Users}
          color="bg-green-50 border-green-200 text-green-700"
          onClick={() => navigate('/dashboard/doctor/doctorpatients')}
        />
        <StatCard
          title="Upcoming Appointments"
          value={dashboardData.upcomingAppointments?.length || 0}
          icon={Clock}
          color="bg-purple-50 border-purple-200 text-purple-700"
        />
        <StatCard
          title="Recent Records"
          value={dashboardData.recentRecords?.length || 0}
          icon={FileText}
          color="bg-orange-50 border-orange-200 text-orange-700"
          onClick={() => navigate('/dashboard/doctor/doctorrecords')}
        />
      </div>

      <div className="overview-content">
        {/* Left Column */}
        <div className="overview-left">
          {/* Today's Appointments */}
          <div className="overview-section">
            <div className="section-header">
              <h2 className="section-title">Today's Appointments</h2>
              <button 
                className="view-all-btn"
                onClick={() => navigate('/dashboard/doctor/doctorappointments')}
              >
                View All
              </button>
            </div>
            <div className="appointments-list">
              {dashboardData.todayAppointments?.length > 0 ? (
                dashboardData.todayAppointments.map((appointment) => (
                  <div key={appointment._id} className="appointment-item">
                    <div className="appointment-time">
                      {formatTime(appointment.time)}
                    </div>
                    <div className="appointment-details">
                      <h4 className="patient-name">
                        {appointment.patientId?.name || 'Unknown Patient'}
                      </h4>
                      <p className="appointment-reason">{appointment.reason}</p>
                    </div>
                    <div className="appointment-status">
                      <span className={`status-badge ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <Calendar size={48} className="empty-icon" />
                  <p>No appointments scheduled for today</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="overview-section">
            <div className="section-header">
              <h2 className="section-title">Upcoming Appointments</h2>
            </div>
            <div className="appointments-list">
              {dashboardData.upcomingAppointments?.length > 0 ? (
                dashboardData.upcomingAppointments.map((appointment) => (
                  <div key={appointment._id} className="appointment-item">
                    <div className="appointment-time">
                      <div className="appointment-date">{formatDate(appointment.date)}</div>
                      <div className="appointment-time-text">{formatTime(appointment.time)}</div>
                    </div>
                    <div className="appointment-details">
                      <h4 className="patient-name">
                        {appointment.patientId?.name || 'Unknown Patient'}
                      </h4>
                      <p className="appointment-reason">{appointment.reason}</p>
                    </div>
                    <div className="appointment-status">
                      <span className={`status-badge ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <Clock size={48} className="empty-icon" />
                  <p>No upcoming appointments</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="overview-right">
          {/* Quick Actions */}
          <div className="overview-section">
            <div className="section-header">
              <h2 className="section-title">Quick Actions</h2>
            </div>
            <div className="quick-actions-grid">
              <QuickActionCard
                title="View Patients"
                description="Manage your patient list"
                icon={Users}
                color="bg-blue-50 hover:bg-blue-100"
                onClick={() => navigate('/dashboard/doctor/doctorpatients')}
              />
              <QuickActionCard
                title="Medical Records"
                description="Access patient records"
                icon={FileText}
                color="bg-green-50 hover:bg-green-100"
                onClick={() => navigate('/dashboard/doctor/doctorrecords')}
              />
              <QuickActionCard
                title="Messages"
                description="Chat with patients"
                icon={MessageSquare}
                color="bg-purple-50 hover:bg-purple-100"
                onClick={() => navigate('/dashboard/doctor/doctormessages')}
              />
              <QuickActionCard
                title="AI Insights"
                description="Get AI recommendations"
                icon={Activity}
                color="bg-orange-50 hover:bg-orange-100"
                onClick={() => navigate('/dashboard/doctor/doctorai-insights')}
              />
            </div>
          </div>

          {/* Recent Medical Records */}
          <div className="overview-section">
            <div className="section-header">
              <h2 className="section-title">Recent Medical Records</h2>
              <button 
                className="view-all-btn"
                onClick={() => navigate('/dashboard/doctor/doctorrecords')}
              >
                View All
              </button>
            </div>
            <div className="records-list">
              {dashboardData.recentRecords?.length > 0 ? (
                dashboardData.recentRecords.map((record) => (
                  <div key={record._id} className="record-item">
                    <div className="record-icon">
                      <FileText size={16} />
                    </div>
                    <div className="record-details">
                      <h4 className="record-patient">
                        {record.patientId?.name || 'Unknown Patient'}
                      </h4>
                      <p className="record-diagnosis">{record.diagnosis}</p>
                      <p className="record-date">{formatDate(record.createdAt)}</p>
                    </div>
                    <button 
                      className="view-record-btn"
                      onClick={() => navigate(`/dashboard/doctor/doctorrecords?recordId=${record._id}`)}
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <FileText size={48} className="empty-icon" />
                  <p>No recent medical records</p>
                </div>
              )}
            </div>
          </div>

          {/* Appointment Statistics */}
          {dashboardData.appointmentStats?.length > 0 && (
            <div className="overview-section">
              <div className="section-header">
                <h2 className="section-title">Appointment Statistics</h2>
              </div>
              <div className="stats-list">
                {dashboardData.appointmentStats.map((stat) => (
                  <div key={stat._id} className="stat-item">
                    <div className="stat-label">{stat._id}</div>
                    <div className="stat-number">{stat.count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorOverview;