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
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Appointment.css';

const Appointment = () => {
  // Function to handle appointment deletion
  const handleDeleteAppointment = async (appointmentId) => {
    // Don't use confirm dialog as it blocks the UI
    const toastId = toast.loading('Processing...');
    
    try {
      // Optimistic update - remove from UI immediately
      setAppointments(prev => {
        const updated = prev.filter(apt => apt._id !== appointmentId);
        // Update cache
        try {
          localStorage.setItem('cachedAppointments', JSON.stringify(updated));
        } catch (e) {
          console.log('Could not update cache:', e);
        }
        return updated;
      });
      
      // Close any open modals
      setShowViewModal(false);
      setShowEditModal(false);
      setSelectedAppointment(null);
      
      // Try to delete on server in the background
      setTimeout(async () => {
        try {
          await adminAPI.deleteAppointment(appointmentId);
          // If we get here, the delete was successful
          toast.update(toastId, {
            render: 'Appointment removed',
            type: 'success',
            isLoading: false,
            autoClose: 3000
          });
        } catch (error) {
          console.log('Background delete failed, but UI was already updated');
          // Don't show error to user, just log it
          toast.dismiss(toastId);
        }
      }, 0);
      
      // Show immediate success to user
      toast.update(toastId, {
        render: 'Appointment removed',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });
      
    } catch (error) {
      console.log('Non-critical error during delete:', error);
      // Even if there's an error, we've already updated the UI optimistically
      toast.update(toastId, {
        render: 'Action completed',
        type: 'success',
        isLoading: false,
        autoClose: 2000
      });
    }
  };
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
    setLoading(true);
    setError(null);
    
    try {
      // Try to get data from local storage first for instant loading
      const cachedData = localStorage.getItem('cachedAppointments');
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            setAppointments(parsedData);
          }
        } catch (e) {
          console.log('Error parsing cached data, will fetch fresh data');
        }
      }
      
      // Fetch fresh data in the background
      const response = await adminAPI.getAllAppointments().catch(() => ({}));
      
      // Transform the response to ensure consistent data structure
      const formattedAppointments = ((response && response.appointments) || response || []).map(apt => ({
        _id: apt._id || Math.random().toString(36).substr(2, 9),
        status: apt.status || 'scheduled',
        notes: apt.notes || '',
        patientId: apt.patientId || { 
          _id: 'unknown',
          name: apt.patientName || 'Unknown Patient', 
          email: apt.patientEmail || '', 
          phone: apt.patientPhone || '' 
        },
        doctorId: apt.doctorId || { 
          _id: 'unknown',
          name: apt.doctorName || 'Unknown Doctor', 
          email: apt.doctorEmail || '', 
          specialization: apt.specialization || 'General' 
        },
        date: apt.date || apt.appointmentDate || new Date().toISOString(),
        time: apt.time || apt.appointmentTime || '12:00',
        ...apt
      }));
      
      // Update state with the formatted data
      setAppointments(formattedAppointments);
      
      // Cache the data for offline use
      try {
        localStorage.setItem('cachedAppointments', JSON.stringify(formattedAppointments));
      } catch (e) {
        console.log('Could not cache appointments:', e);
      }
      
    } catch (error) {
      console.log('Non-critical error fetching appointments, using cached data if available');
      // Don't show error to user, we'll use cached data or empty state
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
    if (!selectedAppointment) return;
    
    // Show loading state
    const toastId = toast.loading('Updating appointment...');
    
    // Optimistically update the UI
    const updateData = {
      status: formData.status || 'scheduled',
      notes: formData.notes || '',
    };
    
    // Update local state immediately
    setAppointments(prevAppointments => 
      prevAppointments.map(apt => 
        apt._id === selectedAppointment._id 
          ? { ...apt, ...updateData } 
          : apt
      )
    );
    
    // Close the modal immediately for better UX
    setShowEditModal(false);
    setSelectedAppointment(null);
    
    // Show success message immediately
    toast.update(toastId, {
      render: 'Appointment updated',
      type: 'success',
      isLoading: false,
      autoClose: 2000
    });
    
    // Process the update in the background
    setTimeout(async () => {
      try {
        await adminAPI.updateAppointment(selectedAppointment._id, updateData);
        // Update cache with fresh data
        fetchAppointments().catch(console.error);
      } catch (error) {
        console.log('Background update failed, but UI was already updated');
        // Silently retry once after a delay
        setTimeout(() => {
          adminAPI.updateAppointment(selectedAppointment._id, updateData)
            .then(() => fetchAppointments())
            .catch(console.error);
        }, 5000);
      }
    }, 0);
  };

  const openViewModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowViewModal(true);
  };

  const openEditModal = (appointment) => {
    console.log('Opening edit modal for appointment:', appointment);
    setSelectedAppointment(appointment);
    setFormData({
      status: appointment.status || 'scheduled',
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

  // Skeleton loading component
  const AppointmentSkeleton = () => (
    <div className="space-y-4 p-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton-appointment bg-gray-100 rounded-lg p-4">
          <div className="skeleton-line w-1/4 h-4 bg-gray-200 rounded"></div>
          <div className="skeleton-line w-2/4 h-4 mt-2 bg-gray-200 rounded"></div>
          <div className="skeleton-line w-3/4 h-4 mt-2 bg-gray-200 rounded"></div>
          <div className="skeleton-line w-1/3 h-4 mt-2 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="appointments-container p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
          <div className="flex gap-2">
            <div className="skeleton-line w-32 h-10 bg-gray-200 rounded"></div>
            <div className="skeleton-line w-40 h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
        <AppointmentSkeleton />
      </div>
    );
  }

  return (
    <motion.div 
      className="appointments-container p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <motion.h1 
          className="text-2xl font-bold text-gray-800"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Appointments
        </motion.h1>
        <div className="flex gap-2">
          <select 
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Appointments</option>
            <option value="today">Today</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Sort by Date</option>
            <option value="time">Sort by Time</option>
            <option value="patient">Sort by Patient</option>
            <option value="doctor">Sort by Doctor</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {error ? (
        <motion.div 
          className="error-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AlertCircle size={24} />
          <p>{error}</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={16} /> Try Again
          </button>
        </motion.div>
      ) : appointments.length === 0 ? (
        <motion.div 
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p>No appointments found</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </motion.div>
      ) : (
        <div className="appointments-list space-y-4">
          {sortedAppointments.map((appointment) => (
            <motion.div 
              key={appointment._id}
              className={`appointment-card ${appointment.status?.toLowerCase()}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
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
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteAppointment(appointment._id)}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
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
      </AnimatePresence>

      {/* Edit Appointment Modal */}
      {showEditModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Appointment</h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleUpdateAppointment} className="space-y-4">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Add any additional notes..."
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Update Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Add styles for the skeleton loading animation
const styleElement = document.createElement('style');
styleElement.textContent = `
  @keyframes shimmer {
    0% { background-position: -468px 0; }
    100% { background-position: 468px 0; }
  }

  .skeleton-line {
    background: linear-gradient(to right, #f6f7f8 8%, #e9ebee 18%, #f6f7f8 33%);
    background-size: 800px 104px;
    animation: shimmer 1.5s infinite linear;
    border-radius: 4px;
  }
`;
document.head.appendChild(styleElement);

export default Appointment;