import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { appointmentsAPI, doctorsAPI } from '../../../services/api';
import { 
  Calendar, Search, Stethoscope, Clock, CheckCircle, 
  XCircle, AlertCircle, Edit, Trash2, Plus, RefreshCw,
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, User, Clock as TimeIcon
} from 'lucide-react';
import './PatientAppointments.css';
import { format, parseISO, isBefore, isAfter, addDays, subDays } from 'date-fns';

const statusColor = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'scheduled': return '#3b82f6';
    case 'confirmed': return '#10b981';
    case 'completed': return '#059669';
    case 'cancelled': return '#ef4444';
    case 'no-show': return '#f59e0b';
    default: return '#6b7280';
  }
};

const statuses = [
  { value: '', label: 'All Status' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no-show', label: 'No Show' }
];

export default function PatientAppointments() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [tab, setTab] = useState('upcoming');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  
  // Initialize filtered state
  const [filtered, setFiltered] = useState([]);

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ 
    doctorId: '', 
    date: '', 
    time: '', 
    notes: '' 
  });
  
  const [formErrors, setFormErrors] = useState({});

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch appointments and doctors in parallel
      const [appointmentsResponse, doctorsResponse] = await Promise.all([
        appointmentsAPI.getByPatient(),
        doctorsAPI.getAll()
      ]);

      const appointmentsList = appointmentsResponse?.data || [];
      const doctorsList = doctorsResponse?.data || [];
      
      console.log('Fetched appointments:', appointmentsList);
      console.log('Fetched doctors:', doctorsList);
      
      // Map doctor details to appointments
      const appointmentsWithDoctorDetails = appointmentsList.map(appt => {
        const doctor = doctorsList.find(d => d._id === appt.doctorId) || {};
        return {
          ...appt,
          doctorId: {
            _id: doctor._id,
            name: doctor.name || 'Unknown Doctor',
            specialization: doctor.specialization || 'General Practitioner'
          }
        };
      });
      
      setAppointments(appointmentsWithDoctorDetails);
      setDoctors(doctorsList);
      
      // Filter appointments based on current tab and search
      filterAppointments(appointmentsWithDoctorDetails, tab, search, status);
      
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err.message || 'Failed to load appointments. Please log in and try again.');
      toast.error(err.message || 'Failed to load appointments');
      setAppointments([]);
      setDoctors([]);
      
      // If unauthorized, redirect to login
      if (err.message.includes('401') || err.message.includes('token')) {
        // You might want to redirect to login page here
        // navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const filterAppointments = (appts, activeTab = tab, searchTerm = search, statusFilter = status) => {
    if (!appts || !Array.isArray(appts)) {
      console.log('No appointments to filter');
      setFiltered([]);
      return;
    }
    
    console.log('Filtering appointments:', { activeTab, searchTerm, statusFilter });
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Make sure we have valid date objects
    const processedAppts = appts.map(appt => ({
      ...appt,
      dateObj: new Date(appt.date)
    }));
    
    console.log('Processed appointments:', processedAppts);
    
    let result = [...processedAppts];
    
    // Filter by tab (upcoming/past)
    if (activeTab === 'upcoming') {
      result = result.filter(a => a.dateObj >= today);
    } else if (activeTab === 'past') {
      result = result.filter(a => a.dateObj < today);
    }
    
    // Filter by status
    if (statusFilter) {
      result = result.filter(a => 
        (a.status || '').toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    // Filter by search term
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      result = result.filter(a => {
        const doctorName = a.doctorId?.name?.toLowerCase() || '';
        const specialization = a.doctorId?.specialization?.toLowerCase() || '';
        const notes = (a.notes || '').toLowerCase();
        
        return (
          doctorName.includes(term) ||
          specialization.includes(term) ||
          notes.includes(term)
        );
      });
    }
    
    // Sort by date and time
    const sortedResult = [...result].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });
    
    console.log('Sorted result:', sortedResult);
    setFiltered(sortedResult);
    setFilteredAppointments(sortedResult);
  };

  // Initial data fetch
  useEffect(() => {
    fetchAppointments();
  }, []);

  const openCreate = () => {
    setForm({ 
      doctorId: '', 
      date: format(new Date(), 'yyyy-MM-dd'), 
      time: '', 
      notes: '' 
    });
    setFormErrors({});
    setShowCreate(true);
  };
  
  const openEdit = (appointment) => {
    if (!appointment) return;
    
    setSelected(appointment);
    setForm({ 
      doctorId: appointment.doctorId?._id || appointment.doctorId, 
      date: appointment.date?.substring(0, 10) || format(new Date(), 'yyyy-MM-dd'),
      time: appointment.time ? new Date(`2000-01-01T${appointment.time}`).toISOString().substring(11, 16) : '',
      notes: appointment.notes || '' 
    });
    setFormErrors({});
    setShowEdit(true);
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;
    
    if (!form.doctorId) {
      errors.doctorId = 'Please select a doctor';
      isValid = false;
    }
    
    if (!form.date) {
      errors.date = 'Please select a date';
      isValid = false;
    } else {
      const selectedDate = new Date(form.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.date = 'Cannot book appointments in the past';
        isValid = false;
      }
    }
    
    if (!form.time) {
      errors.time = 'Please select a time';
      isValid = false;
    } else {
      // Basic time format validation (HH:MM)
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(form.time)) {
        errors.time = 'Please enter a valid time (HH:MM)';
        isValid = false;
      }
    }
    
    setFormErrors(errors);
    return isValid;
  };

  const createAppointment = async () => {
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      
      const appointmentData = {
        doctorId: form.doctorId,
        date: form.date,
        time: form.time,
        notes: form.notes.trim() || undefined,
        status: 'scheduled' // Default status
      };
      
      const response = await appointmentsAPI.create(appointmentData);
      
      // Update local state with the new appointment
      const newAppointment = {
        ...response.data,
        doctorId: doctors.find(d => d._id === form.doctorId) || { _id: form.doctorId, name: 'Loading...' }
      };
      
      setAppointments(prev => [...prev, newAppointment]);
      filterAppointments([...appointments, newAppointment], tab, search, status);
      
      toast.success('Appointment created successfully', { autoClose: 3000 });
      setShowCreate(false);
    } catch (err) {
      console.error('Error creating appointment:', err);
      toast.error(err.response?.data?.message || 'Failed to create appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateAppointment = async () => {
    if (!selected?._id) return;
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      
      const updateData = {
        date: form.date,
        time: form.time,
        notes: form.notes.trim() || undefined
      };
      
      const response = await appointmentsAPI.update(selected._id, updateData);
      
      // Update the appointment in the local state
      setAppointments(prev => 
        prev.map(appt => 
          appt._id === selected._id 
            ? { ...appt, ...updateData, updatedAt: new Date().toISOString() }
            : appt
        )
      );
      
      // Update filtered appointments
      filterAppointments(
        appointments.map(appt => 
          appt._id === selected._id 
            ? { ...appt, ...updateData, updatedAt: new Date().toISOString() }
            : appt
        ),
        tab, 
        search, 
        status
      );
      
      toast.success('Appointment updated successfully', { autoClose: 3000 });
      setShowEdit(false);
      setSelected(null);
    } catch (err) {
      console.error('Error updating appointment:', err);
      toast.error(err.response?.data?.message || 'Failed to update appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelAppointment = async (appointment) => {
    if (!appointment?._id) return;
    
    const confirmed = window.confirm('Are you sure you want to cancel this appointment? This action cannot be undone.');
    if (!confirmed) return;
    
    try {
      setSubmitting(true);
      
      await appointmentsAPI.update(appointment._id, { status: 'cancelled' });
      
      // Update the appointment status in local state
      setAppointments(prev => 
        prev.map(appt => 
          appt._id === appointment._id 
            ? { ...appt, status: 'cancelled', updatedAt: new Date().toISOString() }
            : appt
        )
      );
      
      // Update filtered appointments
      filterAppointments(
        appointments.map(appt => 
          appt._id === appointment._id 
            ? { ...appt, status: 'cancelled', updatedAt: new Date().toISOString() }
            : appt
        ),
        tab, 
        search, 
        status
      );
      
      toast.success('Appointment cancelled successfully', { autoClose: 3000 });
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      toast.error(err.response?.data?.message || 'Failed to cancel appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const rescheduleAppointment = (appointment) => {
    openEdit(appointment);
  };

  const formatAppointmentDate = (dateStr, timeStr) => {
    if (!dateStr) return 'N/A';
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const formattedDate = format(date, 'MMM d, yyyy');
      
      if (timeStr) {
        const [hours, minutes] = timeStr.split(':');
        const time = new Date();
        time.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        return `${formattedDate} at ${format(time, 'h:mm a')}`;
      }
      
      return formattedDate;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status) => {
    const statusText = status?.toLowerCase() || 'unknown';
    const color = statusColor(statusText);
    
    return (
      <span 
        className="status-badge" 
        style={{ 
          backgroundColor: `${color}15`, 
          color: color,
          border: `1px solid ${color}`,
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: 500,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          textTransform: 'capitalize'
        }}
      >
        {statusText}
      </span>
    );
  };

  const handleDateChange = (increment) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + increment);
    setCurrentDate(newDate);
  };

  const handleTimeSlotClick = (time) => {
    setForm(prev => ({
      ...prev,
      time: format(new Date(`2000-01-01T${time}`), 'HH:mm')
    }));
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  return (
    <div className="pa-container">
      <div className="pa-header">
        <div>
          <h1>My Appointments</h1>
          <p>Manage upcoming and past visits</p>
        </div>
        <div className="actions">
          <button className="btn" onClick={fetchAppointments}><RefreshCw size={16} /> Refresh</button>
          <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Book Appointment</button>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab==='upcoming'?'active':''}`} onClick={() => setTab('upcoming')}>Upcoming</button>
        <button className={`tab ${tab==='past'?'active':''}`} onClick={() => setTab('past')}>Past</button>
      </div>

      <div className="toolbar">
        <div className="search">
          <Search size={18} />
          <input placeholder="Search by doctor or notes" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="filters">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No Show</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /><p>Loading...</p></div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="list">
          {filtered.length === 0 ? (
            <div className="empty">No appointments</div>
          ) : (
            filtered.map((a) => (
              <div className="item" key={a._id}>
                <div className="when">
                  <Calendar size={18} />
                  <div className="col">
                    <div className="date">{new Date(a.date).toLocaleDateString()}</div>
                    <div className="time">{a.time ? new Date(a.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                  </div>
                </div>
                <div className="who">
                  <div className="row"><Stethoscope size={16} /> <span>Dr. {a.doctorId?.name || 'Unknown'}</span></div>
                  {a.doctorId?.specialization && <div className="row"><span className="spec">{a.doctorId.specialization}</span></div>}
                </div>
                <div className="status">
                  <span className="badge" style={{ backgroundColor: statusColor(a.status) }}>{a.status || 'scheduled'}</span>
                </div>
                <div className="actions">
                  <button className="btn btn-outline" onClick={() => openEdit(a)}><Edit size={16} /> Reschedule</button>
                  <button className="btn btn-danger" onClick={() => cancelAppointment(a)}><Trash2 size={16} /> Cancel</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showCreate && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Book Appointment</h2>
              <button className="close" onClick={() => setShowCreate(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form">
                <div className="form-row">
                  <label>Doctor</label>
                  <select value={form.doctorId} onChange={(e) => setForm((p) => ({ ...p, doctorId: e.target.value }))}>
                    <option value="">Select Doctor</option>
                    {doctors.map((d) => (
                      <option key={d._id} value={d._id}>Dr. {d.name} — {d.specialization}</option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <label>Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
                </div>
                <div className="form-row">
                  <label>Time</label>
                  <input type="time" value={form.time} onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))} />
                </div>
                <div className="form-row">
                  <label>Notes</label>
                  <textarea rows={3} value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Reason for visit, symptoms, etc." />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={createAppointment}>Create</button>
            </div>
          </div>
        </div>
      )}

      {showEdit && selected && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Reschedule Appointment</h2>
              <button className="close" onClick={() => setShowEdit(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form">
                <div className="form-row">
                  <label>Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
                </div>
                <div className="form-row">
                  <label>Time</label>
                  <input type="time" value={form.time} onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))} />
                </div>
                <div className="form-row">
                  <label>Notes</label>
                  <textarea rows={3} value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Additional notes" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowEdit(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={updateAppointment}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}