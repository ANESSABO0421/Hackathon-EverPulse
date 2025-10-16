import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  User, 
  Phone, 
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Eye,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Activity
} from 'lucide-react';
import { doctorAPI } from '../../../services/api';
import './DoctorAppointments.css';

const DoctorAppointments = () => {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    date: '',
    search: ''
  });
  const [updateForm, setUpdateForm] = useState({
    status: '',
    notes: '',
    diagnosis: '',
    treatment: '',
    prescriptions: ''
  });
  const [viewMode, setViewMode] = useState('all'); // 'all', 'today', 'upcoming'

  useEffect(() => {
    loadAppointments();
    loadTodayAppointments();
    loadUpcomingAppointments();
    loadStats();
  }, [currentPage, filters, viewMode]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await doctorAPI.getAppointments(
        currentPage, 
        10, 
        filters.status, 
        filters.date, 
        filters.search
      );
      setAppointments(response.appointments || []);
      setTotalPages(response.pagination?.pages || 1);
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const loadTodayAppointments = async () => {
    try {
      const response = await doctorAPI.getTodayAppointments();
      setTodayAppointments(response.appointments || []);
    } catch (error) {
      console.error('Error loading today\'s appointments:', error);
    }
  };

  const loadUpcomingAppointments = async () => {
    try {
      const response = await doctorAPI.getUpcomingAppointments(10);
      setUpcomingAppointments(response.appointments || []);
    } catch (error) {
      console.error('Error loading upcoming appointments:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await doctorAPI.getAppointmentStats(30);
      setStats(response);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleUpdateAppointment = async (e) => {
    e.preventDefault();
    try {
      await doctorAPI.updateAppointmentStatus(selectedAppointment._id, updateForm);
      toast.success('Appointment updated successfully');
      setShowUpdateModal(false);
      setUpdateForm({
        status: '',
        notes: '',
        diagnosis: '',
        treatment: '',
        prescriptions: ''
      });
      loadAppointments();
      loadTodayAppointments();
      loadUpcomingAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    }
  };

  const openUpdateModal = (appointment) => {
    setSelectedAppointment(appointment);
    setUpdateForm({
      status: appointment.status || '',
      notes: appointment.notes || '',
      diagnosis: appointment.diagnosis || '',
      treatment: appointment.treatment || '',
      prescriptions: appointment.prescriptions || ''
    });
    setShowUpdateModal(true);
  };

  const openDetailsModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
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

  const getStatusIcon = (status) => {
    const icons = {
      scheduled: <Clock size={16} />,
      confirmed: <CheckCircle size={16} />,
      completed: <CheckCircle size={16} />,
      cancelled: <XCircle size={16} />,
      rescheduled: <AlertCircle size={16} />
    };
    return icons[status] || <Clock size={16} />;
  };

  const AppointmentCard = ({ appointment }) => (
    <div className="appointment-card">
      <div className="appointment-header">
        <div className="appointment-time">
          <Clock size={16} />
          <span>{formatTime(appointment.time)}</span>
        </div>
        <div className="appointment-date">
          <Calendar size={16} />
          <span>{formatDate(appointment.date)}</span>
        </div>
        <span className={`status-badge ${getStatusColor(appointment.status)}`}>
          {getStatusIcon(appointment.status)}
          {appointment.status}
        </span>
      </div>
      
      <div className="appointment-content">
        <div className="patient-info">
          <div className="patient-avatar">
            <User size={20} />
          </div>
          <div className="patient-details">
            <h4 className="patient-name">{appointment.patientId?.name || 'Unknown Patient'}</h4>
            <div className="patient-contact">
              <span><Mail size={14} /> {appointment.patientId?.email}</span>
              <span><Phone size={14} /> {appointment.patientId?.phone}</span>
            </div>
          </div>
        </div>
        
        <div className="appointment-reason">
          <h5>Reason for Visit</h5>
          <p>{appointment.reason}</p>
        </div>
        
        {appointment.notes && (
          <div className="appointment-notes">
            <h5>Notes</h5>
            <p>{appointment.notes}</p>
          </div>
        )}
      </div>
      
      <div className="appointment-actions">
        <button 
          className="action-btn view-btn"
          onClick={() => openDetailsModal(appointment)}
        >
          <Eye size={16} />
          View
        </button>
        <button 
          className="action-btn edit-btn"
          onClick={() => openUpdateModal(appointment)}
        >
          <Edit size={16} />
          Update
        </button>
      </div>
    </div>
  );

  const UpdateModal = () => (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Update Appointment</h3>
          <button 
            className="close-btn"
            onClick={() => setShowUpdateModal(false)}
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleUpdateAppointment} className="update-form">
          <div className="form-group">
            <label>Status *</label>
            <select
              value={updateForm.status}
              onChange={(e) => setUpdateForm(prev => ({ ...prev, status: e.target.value }))}
              required
            >
              <option value="">Select Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={updateForm.notes}
              onChange={(e) => setUpdateForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Add appointment notes..."
            />
          </div>
          
          <div className="form-group">
            <label>Diagnosis</label>
            <input
              type="text"
              value={updateForm.diagnosis}
              onChange={(e) => setUpdateForm(prev => ({ ...prev, diagnosis: e.target.value }))}
              placeholder="Enter diagnosis..."
            />
          </div>
          
          <div className="form-group">
            <label>Treatment</label>
            <textarea
              value={updateForm.treatment}
              onChange={(e) => setUpdateForm(prev => ({ ...prev, treatment: e.target.value }))}
              rows={3}
              placeholder="Describe treatment provided..."
            />
          </div>
          
          <div className="form-group">
            <label>Prescriptions</label>
            <textarea
              value={updateForm.prescriptions}
              onChange={(e) => setUpdateForm(prev => ({ ...prev, prescriptions: e.target.value }))}
              rows={3}
              placeholder="List prescribed medications..."
            />
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={() => setShowUpdateModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Update Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const DetailsModal = () => (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h3>Appointment Details</h3>
          <button 
            className="close-btn"
            onClick={() => setShowDetailsModal(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="appointment-details">
          {selectedAppointment && (
            <>
              <div className="details-section">
                <h4>Patient Information</h4>
                <div className="patient-details-grid">
                  <div className="detail-item">
                    <label>Name</label>
                    <span>{selectedAppointment.patientId?.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email</label>
                    <span>{selectedAppointment.patientId?.email}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phone</label>
                    <span>{selectedAppointment.patientId?.phone}</span>
                  </div>
                </div>
              </div>
              
              <div className="details-section">
                <h4>Appointment Information</h4>
                <div className="appointment-details-grid">
                  <div className="detail-item">
                    <label>Date</label>
                    <span>{formatDate(selectedAppointment.date)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Time</label>
                    <span>{formatTime(selectedAppointment.time)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status</label>
                    <span className={`status-badge ${getStatusColor(selectedAppointment.status)}`}>
                      {selectedAppointment.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Reason</label>
                    <span>{selectedAppointment.reason}</span>
                  </div>
                </div>
              </div>
              
              {selectedAppointment.notes && (
                <div className="details-section">
                  <h4>Notes</h4>
                  <p>{selectedAppointment.notes}</p>
                </div>
              )}
              
              {selectedAppointment.diagnosis && (
                <div className="details-section">
                  <h4>Diagnosis</h4>
                  <p>{selectedAppointment.diagnosis}</p>
                </div>
              )}
              
              {selectedAppointment.treatment && (
                <div className="details-section">
                  <h4>Treatment</h4>
                  <p>{selectedAppointment.treatment}</p>
                </div>
              )}
              
              {selectedAppointment.prescriptions && (
                <div className="details-section">
                  <h4>Prescriptions</h4>
                  <p>{selectedAppointment.prescriptions}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  const getCurrentAppointments = () => {
    switch (viewMode) {
      case 'today':
        return todayAppointments;
      case 'upcoming':
        return upcomingAppointments;
      default:
        return appointments;
    }
  };

  if (loading) {
    return (
      <div className="doctor-appointments">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-appointments">
      {/* Header */}
      <div className="appointments-header">
        <div className="header-content">
          <h1 className="header-title">My Appointments</h1>
          <p className="header-subtitle">Manage your patient appointments and schedules</p>
        </div>
        <div className="header-actions">
          <div className="view-mode-toggle">
            <button 
              className={`mode-btn ${viewMode === 'all' ? 'active' : ''}`}
              onClick={() => setViewMode('all')}
            >
              All Appointments
            </button>
            <button 
              className={`mode-btn ${viewMode === 'today' ? 'active' : ''}`}
              onClick={() => setViewMode('today')}
            >
              Today
            </button>
            <button 
              className={`mode-btn ${viewMode === 'upcoming' ? 'active' : ''}`}
              onClick={() => setViewMode('upcoming')}
            >
              Upcoming
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid">
          {stats.stats?.map((stat) => (
            <div key={stat._id} className="stat-card">
              <div className="stat-icon">
                {getStatusIcon(stat._id)}
              </div>
              <div className="stat-content">
                <h3 className="stat-title">{stat._id}</h3>
                <p className="stat-value">{stat.count}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="search-input">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search appointments..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rescheduled">Rescheduled</option>
          </select>
          
          <input
            type="date"
            value={filters.date}
            onChange={(e) => handleFilterChange('date', e.target.value)}
          />
        </div>
      </div>

      {/* Appointments List */}
      <div className="appointments-content">
        {getCurrentAppointments().length > 0 ? (
          <div className="appointments-grid">
            {getCurrentAppointments().map((appointment) => (
              <AppointmentCard key={appointment._id} appointment={appointment} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Calendar size={64} />
            <h3>No Appointments Found</h3>
            <p>No appointments match your current filters</p>
          </div>
        )}

        {/* Pagination */}
        {viewMode === 'all' && totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showUpdateModal && <UpdateModal />}
      {showDetailsModal && <DetailsModal />}
    </div>
  );
};

export default DoctorAppointments;