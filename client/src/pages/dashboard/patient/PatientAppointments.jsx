import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { appointmentsAPI, doctorsAPI } from '../../../services/api';
import { Calendar, Search, Stethoscope, Clock, CheckCircle, XCircle, AlertCircle, Edit, Trash2, Plus, RefreshCw } from 'lucide-react';
import './PatientAppointments.css';

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

export default function PatientAppointments() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [appointments, setAppointments] = useState([]);
  const [tab, setTab] = useState('upcoming');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ doctorId: '', date: '', time: '', notes: '' });

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [apps, docs] = await Promise.all([
        appointmentsAPI.getAll(), // If you require only patient-specific, replace with getByPatient on backend side
        doctorsAPI.getAll(),
      ]);
      const list = apps.appointments || apps || [];
      setAppointments(list);
      setDoctors(docs.doctors || docs || []);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = useMemo(() => {
    const now = new Date();
    const list = (appointments || []).filter((a) => {
      const isUpcoming = new Date(a.date) >= new Date(now.toDateString());
      if (tab === 'upcoming' && !isUpcoming) return false;
      if (tab === 'past' && isUpcoming) return false;
      if (status && (a.status || '').toLowerCase() !== status) return false;
      const term = search.trim().toLowerCase();
      if (!term) return true;
      const hay = [a.doctorId?.name, a.doctorId?.specialization, a.notes].join(' ').toLowerCase();
      return hay.includes(term);
    });
    return list.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [appointments, tab, status, search]);

  const openCreate = () => { setForm({ doctorId: '', date: '', time: '', notes: '' }); setShowCreate(true); };
  const openEdit = (a) => { setSelected(a); setForm({ doctorId: a.doctorId?._id || a.doctorId, date: a.date?.substring(0,10) || '', time: a.time ? new Date(a.time).toISOString().substring(11,16) : '', notes: a.notes || '' }); setShowEdit(true); };

  const createAppointment = async () => {
    if (!form.doctorId || !form.date || !form.time) return toast.warn('Select doctor, date and time');
    try {
      await appointmentsAPI.create({ doctorId: form.doctorId, date: form.date, time: form.time, notes: form.notes || undefined });
      toast.success('Appointment created');
      setShowCreate(false);
      fetchAll();
    } catch (err) {
      toast.error(err.message || 'Create failed');
    }
  };

  const updateAppointment = async () => {
    if (!selected?._id) return;
    try {
      await appointmentsAPI.update(selected._id, { date: form.date, time: form.time, notes: form.notes || undefined });
      toast.success('Appointment updated');
      setShowEdit(false);
      setSelected(null);
      fetchAll();
    } catch (err) {
      toast.error(err.message || 'Update failed');
    }
  };

  const cancelAppointment = async (a) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await appointmentsAPI.update(a._id, { status: 'cancelled' });
      toast.success('Appointment cancelled');
      fetchAll();
    } catch (err) {
      toast.error(err.message || 'Cancel failed');
    }
  };

  return (
    <div className="pa-container">
      <div className="pa-header">
        <div>
          <h1>My Appointments</h1>
          <p>Manage upcoming and past visits</p>
        </div>
        <div className="actions">
          <button className="btn" onClick={fetchAll}><RefreshCw size={16} /> Refresh</button>
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