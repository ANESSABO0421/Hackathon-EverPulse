import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { doctorsAPI, appointmentsAPI, chatAPI } from '../../../services/api';
import { Search, Stethoscope, MapPin, Mail, Phone, Star, Calendar, MessageSquare, Eye, X, PlusCircle } from 'lucide-react';
import './PatientDoctors.css';

const RatingStars = ({ value = 0 }) => (
  <div className="rating-stars">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={16} className={i < value ? 'star filled' : 'star'} />
    ))}
  </div>
);

export default function PatientDoctors() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctors, setDoctors] = useState([]);

  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const [selected, setSelected] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showBook, setShowBook] = useState(false);

  const [appointmentData, setAppointmentData] = useState({ date: '', time: '', notes: '' });
  const [booking, setBooking] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await doctorsAPI.getAll();
      setDoctors(res.doctors || res || []);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const specializations = useMemo(() => {
    const set = new Set((doctors || []).map((d) => d.specialization).filter(Boolean));
    return Array.from(set).sort();
  }, [doctors]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = doctors || [];
    if (term) {
      list = list.filter((d) => {
        const hay = [d.name, d.email, d.specialization, d.hospital].join(' ').toLowerCase();
        return hay.includes(term);
      });
    }
    if (specialization) list = list.filter((d) => (d.specialization || '') === specialization);
    switch (sortBy) {
      case 'name':
        list = [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'experience':
        list = [...list].sort((a, b) => (b.experienceYears || 0) - (a.experienceYears || 0));
        break;
      case 'fee':
        list = [...list].sort((a, b) => (a.consultationFee || 0) - (b.consultationFee || 0));
        break;
      default:
        break;
    }
    return list;
  }, [doctors, search, specialization, sortBy]);

  const openProfile = (d) => {
    setSelected(d);
    setShowProfile(true);
  };

  const openBook = (d) => {
    setSelected(d);
    setAppointmentData({ date: '', time: '', notes: '' });
    setShowBook(true);
  };

  const bookAppointment = async () => {
    if (!selected?._id) return;
    if (!appointmentData.date || !appointmentData.time) {
      toast.warn('Please select date and time');
      return;
    }
    try {
      setBooking(true);
      const payload = {
        doctorId: selected._id,
        date: appointmentData.date,
        time: appointmentData.time,
        notes: appointmentData.notes?.trim() || undefined,
      };
      await appointmentsAPI.create(payload);
      toast.success('Appointment requested successfully');
      setShowBook(false);
      setAppointmentData({ date: '', time: '', notes: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
  };

  const startChat = async (doctorId) => {
    try {
      setStartingChat(true);
      const chat = await chatAPI.getOrCreateChat(doctorId);
      const chatId = chat?.chat?._id || chat?._id || chat?.data?.chat?._id;
      toast.success('Chat ready');
      if (chatId) {
        navigate(`/dashboard/patient/chat?chatId=${encodeURIComponent(chatId)}`);
      } else {
        navigate('/dashboard/patient/chat');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to start chat');
    } finally {
      setStartingChat(false);
    }
  };

  return (
    <div className="pd-container">
      <div className="pd-header">
        <div>
          <h1>Find Doctors</h1>
          <p>Search and connect with specialists</p>
        </div>
        <div className="actions">
          <button className="btn" onClick={fetchDoctors}><PlusCircle size={16} /> Refresh</button>
        </div>
      </div>

      <div className="pd-toolbar">
        <div className="search">
          <Search size={18} />
          <input placeholder="Search by name, email, specialization, hospital" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="filters">
          <select value={specialization} onChange={(e) => setSpecialization(e.target.value)}>
            <option value="">All Specializations</option>
            {specializations.map((s) => (
              <option value={s} key={s}>{s}</option>
            ))}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Sort by Name</option>
            <option value="experience">Sort by Experience</option>
            <option value="fee">Sort by Fee</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /><p>Loading doctors...</p></div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="grid">
          {filtered.length === 0 ? (
            <div className="empty">No doctors found</div>
          ) : (
            filtered.map((d) => (
              <div className="card" key={d._id}>
                <div className="card-header">
                  <div className="avatar"><Stethoscope size={22} /></div>
                  <div className="title">
                    <div className="name">Dr. {d.name}</div>
                    <div className="spec">{d.specialization || 'General'}</div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="meta">
                    {d.hospital && <div className="row"><MapPin size={16} /> <span>{d.hospital}</span></div>}
                    {d.email && <div className="row"><Mail size={16} /> <span>{d.email}</span></div>}
                    {d.phone && <div className="row"><Phone size={16} /> <span>{d.phone}</span></div>}
                  </div>
                  <div className="extras">
                    <div className="chip">Experience: {d.experienceYears || 0}y</div>
                    <div className="chip">Fee: ₹{d.consultationFee || 0}</div>
                    <RatingStars value={Math.round(d.rating || 0)} />
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn btn-outline" onClick={() => openProfile(d)}><Eye size={16} /> View</button>
                  <button className="btn btn-primary" onClick={() => openBook(d)} disabled={booking}><Calendar size={16} /> {booking && selected?._id === d._id ? 'Booking...' : 'Book'}</button>
                  <button className="btn btn-secondary" onClick={() => startChat(d._id)} disabled={startingChat}><MessageSquare size={16} /> {startingChat ? 'Starting...' : 'Message'}</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showProfile && selected && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Doctor Profile</h2>
              <button className="close" onClick={() => setShowProfile(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="profile">
                <div className="avatar big"><Stethoscope size={28} /></div>
                <div className="col">
                  <div className="name">Dr. {selected.name}</div>
                  <div className="spec">{selected.specialization}</div>
                  <div className="meta">
                    {selected.hospital && <div className="row"><MapPin size={16} /> <span>{selected.hospital}</span></div>}
                    {selected.email && <div className="row"><Mail size={16} /> <span>{selected.email}</span></div>}
                    {selected.phone && <div className="row"><Phone size={16} /> <span>{selected.phone}</span></div>}
                  </div>
                  <div className="extras">
                    <div className="chip">Experience: {selected.experienceYears || 0}y</div>
                    <div className="chip">Fee: ₹{selected.consultationFee || 0}</div>
                    <RatingStars value={Math.round(selected.rating || 0)} />
                  </div>
                </div>
              </div>
              {selected.bio && (
                <div className="section">
                  <h3>About</h3>
                  <p>{selected.bio}</p>
                </div>
              )}
              {Array.isArray(selected.qualifications) && selected.qualifications.length > 0 && (
                <div className="section">
                  <h3>Qualifications</h3>
                  <ul className="bullets">
                    {selected.qualifications.map((q, i) => (<li key={i}>{q}</li>))}
                  </ul>
                </div>
              )}
              {Array.isArray(selected.services) && selected.services.length > 0 && (
                <div className="section">
                  <h3>Services</h3>
                  <ul className="chips">
                    {selected.services.map((s, i) => (<li key={i} className="chip">{s}</li>))}
                  </ul>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => startChat(selected._id)} disabled={startingChat}><MessageSquare size={16} /> {startingChat ? 'Starting...' : 'Message'}</button>
              <button className="btn btn-primary" onClick={() => openBook(selected)} disabled={booking}><Calendar size={16} /> {booking ? 'Booking...' : 'Book'}</button>
            </div>
          </div>
        </div>
      )}

      {showBook && selected && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Book Appointment with Dr. {selected.name}</h2>
              <button className="close" onClick={() => setShowBook(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form">
                <div className="form-row">
                  <label>Date</label>
                  <input type="date" value={appointmentData.date} onChange={(e) => setAppointmentData((p) => ({ ...p, date: e.target.value }))} />
                </div>
                <div className="form-row">
                  <label>Time</label>
                  <input type="time" value={appointmentData.time} onChange={(e) => setAppointmentData((p) => ({ ...p, time: e.target.value }))} />
                </div>
                <div className="form-row">
                  <label>Notes</label>
                  <textarea rows={3} value={appointmentData.notes} onChange={(e) => setAppointmentData((p) => ({ ...p, notes: e.target.value }))} placeholder="Reason for visit, symptoms, etc." />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowBook(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={bookAppointment} disabled={booking}>{booking ? 'Creating...' : 'Confirm Booking'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}