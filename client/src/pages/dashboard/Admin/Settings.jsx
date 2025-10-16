import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { adminAPI } from '../../../services/api';
import { User, Mail, Phone, Shield, Building2, Save, RefreshCw } from 'lucide-react';
import './Settings.css';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    accessLevel: 'restricted',
    employeeId: ''
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getProfile();
      const admin = res.admin || {};
      setFormData({
        name: admin.name || '',
        email: admin.email || '',
        phone: admin.phone || '',
        department: admin.department || '',
        accessLevel: admin.accessLevel || 'restricted',
        employeeId: admin.employeeId || ''
      });
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await adminAPI.updateProfile(formData);
      toast.success('Profile updated successfully');
      fetchProfile();
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your admin profile and access</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={fetchProfile} disabled={loading}>
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving || loading}>
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner" />
          <p>Loading settings...</p>
        </div>
      ) : (
        <div className="settings-content">
          <div className="tabs">
            <button className={`tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profile</button>
            <button className={`tab ${activeTab === 'access' ? 'active' : ''}`} onClick={() => setActiveTab('access')}>Access</button>
            <button className={`tab ${activeTab === 'organization' ? 'active' : ''}`} onClick={() => setActiveTab('organization')}>Organization</button>
          </div>

          <form className="form" onSubmit={handleSubmit}>
            {activeTab === 'profile' && (
              <div className="card">
                <h2>Profile Information</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Name</label>
                    <div className="input-with-icon">
                      <User size={18} />
                      <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full name" required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <div className="input-with-icon">
                      <Mail size={18} />
                      <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email address" required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <div className="input-with-icon">
                      <Phone size={18} />
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone number" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'access' && (
              <div className="card">
                <h2>Access Control</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Access Level</label>
                    <div className="input-with-icon">
                      <Shield size={18} />
                      <select name="accessLevel" value={formData.accessLevel} onChange={handleChange}>
                        <option value="full">Full Access</option>
                        <option value="restricted">Restricted</option>
                      </select>
                    </div>
                    <small className="help">Full access allows managing doctors, patients, records, and feedback.</small>
                  </div>
                  <div className="form-group">
                    <label>Employee ID</label>
                    <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} placeholder="Employee ID" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'organization' && (
              <div className="card">
                <h2>Organization</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Department</label>
                    <div className="input-with-icon">
                      <Building2 size={18} />
                      <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="Department (e.g., Administration)" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="form-actions">
              <button className="btn btn-primary" type="submit" disabled={saving}>
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}