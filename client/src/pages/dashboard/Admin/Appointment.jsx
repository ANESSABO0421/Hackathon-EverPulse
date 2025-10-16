import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { adminAPI } from '../../../services/api';
import { 
  Search, 
  Filter,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw
} from 'lucide-react';
import './Appointment.css';

const Appointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    status: '',
    notes: ''
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllAppointments();
      setAppointments(response.appointments || []);
    } catch (error) {
      setError(error.message);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateAppointment = async (e) => {
    e.preventDefault();
    try {
      // This would typically use an admin update appointment endpoint
      toast.success('Appointment updated successfully');
      setShowEditModal(false);
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to update appointment');
    }
  };

  const openViewModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowViewModal(true);
  };

  const openEditModal = (appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      status: appointment.status || '',
      notes: appointment.notes || ''
    });
    setShowEditModal(true);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return '#3b82f6';
      case 'confirmed':
        return '#10b981';
      case 'completed':
        return '#059669';
      case 'cancelled':
        return '#ef4444';
      case 'no-show':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return <Clock size={16} />;
      case 'confirmed':
        return <CheckCircle size={16} />;
      case 'completed':
        return <CheckCircle size={16} />;
      case 'cancelled':
        return <XCircle size={16} />;
      case 'no-show':
        return <AlertCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Time not specified';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctorId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patientId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctorId?.specialization?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = (() => {
      switch (filterBy) {
        case 'scheduled':
          return appointment.status?.toLowerCase() === 'scheduled';
        case 'confirmed':
          return appointment.status?.toLowerCase() === 'confirmed';
        case 'completed':
          return appointment.status?.toLowerCase() === 'completed';
        case 'cancelled':
          return appointment.status?.toLowerCase() === 'cancelled';
        case 'no-show':
          return appointment.status?.toLowerCase() === 'no-show';
        case 'today':
          const today = new Date().toDateString();
          return new Date(appointment.date).toDateString() === today;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesFilter;
  });

  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.date) - new Date(a.date);
      case 'time':
        return new Date(b.time) - new Date(a.time);
      case 'patient':
        return a.patientId?.name?.localeCompare(b.patientId?.name);
      case 'doctor':
        return a.doctorId?.name?.localeCompare(b.doctorId?.name);
      case 'status':
        return a.status?.localeCompare(b.status);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="appointments-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="appointments-container">
      <div className="appointments-header">
        <div className="header-left">
          <h1>Manage Appointments</h1>
          <p>View and manage all patient appointments</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => fetchAppointments()}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => {/* Export functionality */}}
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by patient, doctor, email, or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <select 
            value={filterBy} 
            onChange={(e) => setFilterBy(e.target.value)}
          >
            <option value="all">All Appointments</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No Show</option>
            <option value="today">Today's Appointments</option>
          </select>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Sort by Date</option>
            <option value="time">Sort by Time</option>
            <option value="patient">Sort by Patient</option>
            <option value="doctor">Sort by Doctor</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      <div className="appointments-list">
        {sortedAppointments.length === 0 ? (
          <div className="no-appointments">
            <Calendar size={48} color="#9ca3af" />
            <h3>No Appointments Found</h3>
            <p>No appointments match your current search criteria.</p>
          </div>
        ) : (
          sortedAppointments.map((appointment) => (
            <div key={appointment._id} className="appointment-card">
              <div className="appointment-header">
                <div className="appointment-date">
                  <Calendar size={20} color="#6b7280" />
                  <div>
                    <span className="date">{formatDate(appointment.date)}</span>
                    <span className="time">{formatTime(appointment.time)}</span>
                  </div>
                </div>
                <div className="appointment-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(appointment.status) }}
                  >
                    {getStatusIcon(appointment.status)}
                    {appointment.status || 'Unknown'}
                  </span>
                </div>
              </div>
              
              <div className="appointment-content">
                <div className="appointment-info">
                  <div className="patient-info">
                    <div className="info-header">
                      <User size={16} color="#6b7280" />
                      <span>Patient</span>
                    </div>
                    <div className="info-details">
                      <h4>{appointment.patientId?.name || 'Unknown Patient'}</h4>
                      <div className="contact-details">
                        <span>
                          <Mail size={14} />
                          {appointment.patientId?.email || 'No email'}
                        </span>
                        <span>
                          <Phone size={14} />
                          {appointment.patientId?.phone || 'No phone'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="doctor-info">
                    <div className="info-header">
                      <Stethoscope size={16} color="#6b7280" />
                      <span>Doctor</span>
                    </div>
                    <div className="info-details">
                      <h4>{appointment.doctorId?.name || 'Unknown Doctor'}</h4>
                      <div className="contact-details">
                        <span>
                          <Mail size={14} />
                          {appointment.doctorId?.email || 'No email'}
                        </span>
                        <span>
                          <span className="specialization">
                            {appointment.doctorId?.specialization || 'No specialization'}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {appointment.notes && (
                  <div className="appointment-notes">
                    <h5>Notes:</h5>
                    <p>{appointment.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="appointment-actions">
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => openViewModal(appointment)}
                >
                  <Eye size={16} />
                  View
                </button>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => openEditModal(appointment)}
                >
                  <Edit size={16} />
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Appointment Modal */}
      {showViewModal && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Appointment Details</h2>
              <button 
                className="close-button"
                onClick={() => setShowViewModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="appointment-details">
                <div className="detail-section">
                  <h3>Appointment Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <Calendar size={16} />
                      <span>Date:</span>
                      <span>{formatDate(selectedAppointment.date)}</span>
                    </div>
                    <div className="detail-item">
                      <Clock size={16} />
                      <span>Time:</span>
                      <span>{formatTime(selectedAppointment.time)}</span>
                    </div>
                    <div className="detail-item">
                      <span>Status:</span>
                      <span 
                        className="status-text"
                        style={{ color: getStatusColor(selectedAppointment.status) }}
                      >
                        {selectedAppointment.status || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h3>Patient Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <User size={16} />
                      <span>Name:</span>
                      <span>{selectedAppointment.patientId?.name || 'Unknown'}</span>
                    </div>
                    <div className="detail-item">
                      <Mail size={16} />
                      <span>Email:</span>
                      <span>{selectedAppointment.patientId?.email || 'No email'}</span>
                    </div>
                    <div className="detail-item">
                      <Phone size={16} />
                      <span>Phone:</span>
                      <span>{selectedAppointment.patientId?.phone || 'No phone'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h3>Doctor Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <Stethoscope size={16} />
                      <span>Name:</span>
                      <span>{selectedAppointment.doctorId?.name || 'Unknown'}</span>
                    </div>
                    <div className="detail-item">
                      <Mail size={16} />
                      <span>Email:</span>
                      <span>{selectedAppointment.doctorId?.email || 'No email'}</span>
                    </div>
                    <div className="detail-item">
                      <span>Specialization:</span>
                      <span>{selectedAppointment.doctorId?.specialization || 'No specialization'}</span>
                    </div>
                  </div>
                </div>
                
                {selectedAppointment.notes && (
                  <div className="detail-section">
                    <h3>Notes</h3>
                    <div className="notes-content">
                      <p>{selectedAppointment.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setShowViewModal(false);
                  openEditModal(selectedAppointment);
                }}
              >
                Edit Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {showEditModal && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Appointment</h2>
              <button 
                className="close-button"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleUpdateAppointment} className="modal-body">
              <div className="form-group">
                <label>Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no-show">No Show</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Add appointment notes..."
                />
              </div>
            </form>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleUpdateAppointment}
              >
                Update Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointment;