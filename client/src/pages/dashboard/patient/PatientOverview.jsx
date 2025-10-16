import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { patientAPI, appointmentsAPI } from '../../../services/api';
import { User, ClipboardList, Calendar, Stethoscope, AlertTriangle, RefreshCw, FileText } from 'lucide-react';
import './PatientOverview.css';

export default function PatientOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [appointments, setAppointments] = useState([]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [pRes, sRes] = await Promise.all([
        patientAPI.getProfile(),
        patientAPI.getRecordsSummary(),
      ]);
      setProfile(pRes.patient || pRes.admin || pRes || null);
      setSummary(sRes.summary || sRes || null);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load overview');
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingAppointments = async (patientId) => {
    try {
      const res = await appointmentsAPI.getByPatient(patientId);
      const upcoming = (res.appointments || res || []).filter((a) => new Date(a.date) >= new Date());
      upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
      setAppointments(upcoming.slice(0, 5));
    } catch (err) {
      // non-blocking
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (profile?._id || profile?.id) {
      fetchUpcomingAppointments(profile._id || profile.id);
    }
  }, [profile]);

  const statCards = useMemo(() => {
    return [
      {
        icon: <ClipboardList size={20} color="#fff" />, label: 'Total Records', value: summary?.totalRecords || 0, color: '#3b82f6'
      },
      {
        icon: <Stethoscope size={20} color="#fff" />, label: 'Doctors Visited', value: summary?.uniqueDoctors || 0, color: '#10b981'
      },
      {
        icon: <Calendar size={20} color="#fff" />, label: 'Appointments', value: summary?.totalAppointments || 0, color: '#f59e0b'
      },
    ];
  }, [summary]);

  return (
    <div className="pov-container">
      <div className="pov-header">
        <div>
          <h1>Welcome{profile?.name ? `, ${profile.name}` : ''}</h1>
          <p>Your health overview at a glance</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={fetchAll}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /><p>Loading...</p></div>
      ) : error ? (
        <div className="error"><AlertTriangle size={18} /> {error}</div>
      ) : (
        <>
          <div className="profile-card">
            <div className="avatar"><User size={28} /></div>
            <div className="info">
              <div className="name">{profile?.name || 'Patient'}</div>
              <div className="meta">
                <span>{profile?.email}</span>
                {profile?.phone && <span>{profile.phone}</span>}
                {profile?.bloodGroup && <span>Blood Group: {profile.bloodGroup}</span>}
              </div>
            </div>
          </div>

          <div className="stats-grid">
            {statCards.map((s, i) => (
              <div className="stat-card" key={i}>
                <div className="stat-icon" style={{ backgroundColor: s.color }}>{s.icon}</div>
                <div className="stat-content">
                  <div className="label">{s.label}</div>
                  <div className="value">{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid">
            <div className="card">
              <div className="card-header"><Calendar size={18} /><h3>Upcoming Appointments</h3></div>
              <div className="card-body">
                {appointments.length === 0 ? (
                  <div className="empty">No upcoming appointments</div>
                ) : (
                  <ul className="list">
                    {appointments.map((a) => (
                      <li key={a._id}>
                        <div className="when">
                          <span className="date">{new Date(a.date).toLocaleDateString()}</span>
                          <span className="time">{a.time ? new Date(a.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                        </div>
                        <div className="who">
                          <span className="doctor">Dr. {a.doctorId?.name || 'Unknown'}</span>
                          <span className="spec">{a.doctorId?.specialization || ''}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header"><FileText size={18} /><h3>Recent Records</h3></div>
              <div className="card-body">
                {!summary?.recentRecords || summary.recentRecords.length === 0 ? (
                  <div className="empty">No recent records</div>
                ) : (
                  <ul className="list">
                    {summary.recentRecords.slice(0, 5).map((r) => (
                      <li key={r._id}>
                        <div className="when">
                          <span className="date">{new Date(r.visitDate || r.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="who">
                          <span className="doctor">Dr. {r.doctor?.name || r.doctorId?.name || 'Unknown'}</span>
                          <span className="spec">{r.doctor?.specialization || r.doctorId?.specialization || ''}</span>
                        </div>
                        <div className="text">{r.diagnosis || r.notes}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}