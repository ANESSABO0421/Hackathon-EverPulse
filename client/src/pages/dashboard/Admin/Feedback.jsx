import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { adminAPI } from '../../../services/api';
import { MessageSquare, Search, Filter, RefreshCw, Eye, Edit, Trash2, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import './Feedback.css';

const RatingStars = ({ value }) => {
  const stars = Array.from({ length: 5 }).map((_, i) => (
    <Star key={i} size={16} className={i < (value || 0) ? 'star filled' : 'star'} />
  ));
  return <div className="rating-stars">{stars}</div>;
};

export default function Feedback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [status, setStatus] = useState('');
  const [rating, setRating] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [stats, setStats] = useState(null);
  const [distribution, setDistribution] = useState([]);

  const [selected, setSelected] = useState(null);
  const [showView, setShowView] = useState(false);
  const [editData, setEditData] = useState({ status: 'reviewed', adminNotes: '', response: '' });

  const fetchFeedback = async (p = page) => {
    try {
      setLoading(true);
      const res = await adminAPI.getFeedback(p, limit, status, rating);
      setItems(res.feedback || []);
      setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
      setStats(res.stats || null);
      setDistribution(res.ratingDistribution || []);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to fetch feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, rating, limit]);

  const openView = (f) => {
    setSelected(f);
    setEditData({ status: f.status || 'pending', adminNotes: f.adminNotes || '', response: f.response || '' });
    setShowView(true);
  };

  const updateFeedback = async () => {
    try {
      await adminAPI.updateFeedback(selected._id, editData);
      toast.success('Feedback updated');
      setShowView(false);
      fetchFeedback(page);
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    }
  };

  const deleteFeedback = async (id) => {
    if (!window.confirm('Delete this feedback?')) return;
    try {
      await adminAPI.deleteFeedback(id);
      toast.success('Feedback deleted');
      fetchFeedback(page);
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((f) => {
      const patient = f.patientId?.name || f.patientId?.email || '';
      const doctor = f.doctorId?.name || f.doctorId?.specialization || '';
      const comments = f.comments || '';
      return [patient, doctor, comments].some((v) => (v || '').toLowerCase().includes(term));
    });
  }, [items, search]);

  return (
    <div className="feedback-container">
      <div className="feedback-header">
        <div>
          <h1>Feedback</h1>
          <p>Review and respond to user feedback</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => fetchFeedback(page)}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />
          <input placeholder="Search by patient, doctor, or comments" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="filters">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="archived">Archived</option>
          </select>
          <select value={rating} onChange={(e) => setRating(e.target.value)}>
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat">
          <div className="stat-title">Average Rating</div>
          <div className="stat-value">{(stats?.averageRating || 0).toFixed(1)}</div>
          <RatingStars value={Math.round(stats?.averageRating || 0)} />
        </div>
        <div className="stat">
          <div className="stat-title">Total Feedback</div>
          <div className="stat-value">{stats?.totalFeedback || 0}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Pending</div>
          <div className="stat-value">{stats?.pendingCount || 0}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Reviewed</div>
          <div className="stat-value">{stats?.reviewedCount || 0}</div>
        </div>
      </div>

      <div className="distribution">
        {(distribution || []).length === 0 ? (
          <div className="empty">No rating distribution data</div>
        ) : (
          <ul>
            {distribution.map((d) => (
              <li key={d._id}>
                <span className="label">{d._id}★</span>
                <div className="bar"><div className="fill" style={{ width: `${Math.min(100, d.count)}%` }} /></div>
                <span className="value">{d.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner" />
          <p>Loading feedback...</p>
        </div>
      ) : (
        <div className="feedback-list">
          {filtered.length === 0 ? (
            <div className="empty">
              <MessageSquare size={40} />
              <p>No feedback found</p>
            </div>
          ) : (
            filtered.map((f) => (
              <div className="feedback-card" key={f._id}>
                <div className="feedback-main">
                  <div className="feedback-meta">
                    <div className="pill status">{f.status || 'pending'}</div>
                    <RatingStars value={f.rating} />
                  </div>
                  <div className="feedback-text">{f.comments}</div>
                  <div className="feedback-refs">
                    {f.patientId && <span className="ref">Patient: {f.patientId?.name || f.patientId?.email}</span>}
                    {f.doctorId && <span className="ref">Doctor: {f.doctorId?.name || f.doctorId?.specialization}</span>}
                    {f.appointmentId && <span className="ref">Appointment: {new Date(f.appointmentId?.date).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="feedback-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => openView(f)}>
                    <Eye size={16} /> View
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => openView(f)}>
                    <Edit size={16} /> Update
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteFeedback(f._id)}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="pagination">
          <button className="btn btn-outline" disabled={pagination.page <= 1} onClick={() => { setPage(pagination.page - 1); fetchFeedback(pagination.page - 1); }}>
            <ChevronLeft size={16} /> Prev
          </button>
          <span className="page-info">Page {pagination.page} of {pagination.pages}</span>
          <button className="btn btn-outline" disabled={pagination.page >= pagination.pages} onClick={() => { setPage(pagination.page + 1); fetchFeedback(pagination.page + 1); }}>
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {showView && selected && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Feedback Details</h2>
              <button className="close-button" onClick={() => setShowView(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail">
                <div className="label">Rating</div>
                <RatingStars value={selected.rating} />
              </div>
              <div className="detail">
                <div className="label">Comments</div>
                <div className="value">{selected.comments}</div>
              </div>
              <div className="detail-grid">
                {selected.patientId && (
                  <div className="detail"><div className="label">Patient</div><div className="value">{selected.patientId?.name || selected.patientId?.email}</div></div>
                )}
                {selected.doctorId && (
                  <div className="detail"><div className="label">Doctor</div><div className="value">{selected.doctorId?.name || selected.doctorId?.specialization}</div></div>
                )}
                {selected.appointmentId && (
                  <div className="detail"><div className="label">Appointment</div><div className="value">{new Date(selected.appointmentId?.date).toLocaleString()}</div></div>
                )}
              </div>

              <div className="form-group">
                <label>Status</label>
                <select value={editData.status} onChange={(e) => setEditData((p) => ({ ...p, status: e.target.value }))}>
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="form-group">
                <label>Admin Notes</label>
                <textarea rows={3} value={editData.adminNotes} onChange={(e) => setEditData((p) => ({ ...p, adminNotes: e.target.value }))} placeholder="Notes for internal review..." />
              </div>

              <div className="form-group">
                <label>Response</label>
                <textarea rows={3} value={editData.response} onChange={(e) => setEditData((p) => ({ ...p, response: e.target.value }))} placeholder="Write a response visible to the user (optional)" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowView(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={updateFeedback}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}