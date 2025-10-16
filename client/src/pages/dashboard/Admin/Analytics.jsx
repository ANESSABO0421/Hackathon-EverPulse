import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { adminAPI } from '../../../services/api';
import { BarChart2, Users, Stethoscope, ClipboardList, FileText, TrendingUp, RefreshCw, Calendar } from 'lucide-react';
import './Analytics.css';
import './Analytics.css';

const StatCard = ({ icon, label, value, delta, color }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="stat-content">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {typeof delta === 'number' && (
          <div className={`stat-delta ${delta >= 0 ? 'positive' : 'negative'}`}>
            <TrendingUp size={16} />
            <span>{delta >= 0 ? '+' : ''}{delta}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState(30);
  const [analytics, setAnalytics] = useState(null);

  const fetchAnalytics = async (selectedPeriod = period) => {
    try {
      setLoading(true);
      const res = await adminAPI.getAnalytics(selectedPeriod);
      setAnalytics(res.analytics || null);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const overview = analytics?.overview || {};

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <div>
          <h1>Analytics</h1>
          <p>Insights and metrics for your platform</p>
        </div>
        <div className="header-actions">
          <select value={period} onChange={(e) => setPeriod(Number(e.target.value))}>
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button className="btn btn-secondary" onClick={() => fetchAnalytics(period)}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner" />
          <p>Loading analytics...</p>
        </div>
      ) : error ? (
        <div className="error">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard
              icon={<Stethoscope size={22} color="#fff" />}
              label="Total Doctors"
              value={overview.totalDoctors ?? 0}
              delta={overview.recentDoctors ? Math.round((overview.recentDoctors / Math.max(1, overview.totalDoctors)) * 100) : 0}
              color="#3b82f6"
            />
            <StatCard
              icon={<Users size={22} color="#fff" />}
              label="Total Patients"
              value={overview.totalPatients ?? 0}
              delta={overview.recentPatients ? Math.round((overview.recentPatients / Math.max(1, overview.totalPatients)) * 100) : 0}
              color="#10b981"
            />
            <StatCard
              icon={<ClipboardList size={22} color="#fff" />}
              label="Appointments"
              value={overview.totalAppointments ?? 0}
              delta={overview.recentAppointments ? Math.round((overview.recentAppointments / Math.max(1, overview.totalAppointments)) * 100) : 0}
              color="#f59e0b"
            />
            <StatCard
              icon={<FileText size={22} color="#fff" />}
              label="Medical Records"
              value={overview.totalRecords ?? 0}
              delta={overview.recentRecords ? Math.round((overview.recentRecords / Math.max(1, overview.totalRecords)) * 100) : 0}
              color="#ef4444"
            />
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <div className="chart-header">
                <BarChart2 size={18} />
                <h3>Appointments by Status</h3>
              </div>
              <div className="chart-body">
                {(analytics?.appointmentsByStatus || []).length === 0 ? (
                  <p className="empty">No data</p>
                ) : (
                  <ul className="bar-list">
                    {analytics.appointmentsByStatus.map((s) => (
                      <li key={s._id}>
                        <span className="label">{s._id || 'Unknown'}</span>
                        <div className="bar">
                          <div className="fill" style={{ width: `${Math.min(100, s.count)}%` }} />
                        </div>
                        <span className="value">{s.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <Calendar size={18} />
                <h3>Appointments by Month (12m)</h3>
              </div>
              <div className="chart-body">
                {(analytics?.appointmentsByMonth || []).length === 0 ? (
                  <p className="empty">No data</p>
                ) : (
                  <table className="mini-table">
                    <thead>
                      <tr>
                        <th>Year</th>
                        <th>Month</th>
                        <th>Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.appointmentsByMonth.map((m, idx) => (
                        <tr key={idx}>
                          <td>{m._id?.year}</td>
                          <td>{m._id?.month}</td>
                          <td>{m.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <BarChart2 size={18} />
                <h3>Doctor Specializations</h3>
              </div>
              <div className="chart-body">
                {(analytics?.doctorSpecializations || []).length === 0 ? (
                  <p className="empty">No data</p>
                ) : (
                  <ul className="bar-list">
                    {analytics.doctorSpecializations.map((s) => (
                      <li key={s._id}>
                        <span className="label">{s._id || 'N/A'}</span>
                        <div className="bar">
                          <div className="fill" style={{ width: `${Math.min(100, s.count)}%` }} />
                        </div>
                        <span className="value">{s.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <BarChart2 size={18} />
                <h3>Patient Demographics</h3>
              </div>
              <div className="chart-body">
                {(analytics?.patientDemographics || []).length === 0 ? (
                  <p className="empty">No data</p>
                ) : (
                  <ul className="bar-list">
                    {analytics.patientDemographics.map((g) => (
                      <li key={g._id}>
                        <span className="label">{g._id || 'N/A'}</span>
                        <div className="bar">
                          <div className="fill" style={{ width: `${Math.min(100, g.count)}%` }} />
                        </div>
                        <span className="value">{g.count}</span>
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