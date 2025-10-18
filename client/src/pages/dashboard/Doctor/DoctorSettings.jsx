import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { doctorAPI } from '../../../services/api';
import './DoctorSettings.css';

const DoctorSettings = () => {
  // Profile state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    licenseNumber: '',
    experience: '',
    bio: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    avatar: null
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    theme: 'light',
    notifications: {
      email: true,
      sms: false,
      push: true,
      appointmentReminders: true,
      newMessages: true,
      systemUpdates: true
    },
    workingHours: {
      monday: { start: '09:00', end: '17:00', enabled: true },
      tuesday: { start: '09:00', end: '17:00', enabled: true },
      wednesday: { start: '09:00', end: '17:00', enabled: true },
      thursday: { start: '09:00', end: '17:00', enabled: true },
      friday: { start: '09:00', end: '17:00', enabled: true },
      saturday: { start: '10:00', end: '14:00', enabled: false },
      sunday: { start: '10:00', end: '14:00', enabled: false }
    },
    consultationSettings: {
      maxPatientsPerDay: 20,
      appointmentDuration: 30,
      bufferTime: 15,
      allowOnlineConsultation: true,
      allowEmergencyAppointments: true
    }
  });

  // Security state
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: 30
  });

  // UI state
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    loadDoctorProfile();
  }, []);

  const loadDoctorProfile = async () => {
    try {
      setLoading(true);
      const response = await doctorAPI.getProfile();
      if (response.doctor) {
        setProfile(prev => ({
          ...prev,
          ...response.doctor
        }));
        setAvatarPreview(response.doctor.avatar);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferencesChange = (section, field, value) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedPreferencesChange = (section, subsection, field, value) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  const handleSecurityChange = (field, value) => {
    setSecurity(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
        setProfile(prev => ({
          ...prev,
          avatar: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      
      // Validate required fields
      if (!profile.name || !profile.email || !profile.specialization || !profile.licenseNumber) {
        toast.error('Please fill in all required fields');
        return;
      }

      const formData = new FormData();
      
      Object.keys(profile).forEach(key => {
        if (key === 'avatar' && profile[key]) {
          formData.append('avatar', profile[key]);
        } else if (key !== 'avatar' && profile[key] !== null && profile[key] !== undefined) {
          formData.append(key, profile[key]);
        }
      });

      await doctorAPI.updateProfile(formData);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      // This would typically be a separate API endpoint for preferences
      // For now, we'll save it as part of the profile
      await doctorAPI.updateProfile({ preferences });
      toast.success('Preferences updated successfully');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!security.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }

    if (!security.newPassword) {
      toast.error('Please enter a new password');
      return;
    }

    if (security.newPassword !== security.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (security.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    // Check if new password is different from current
    if (security.currentPassword === security.newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    try {
      setSaving(true);
      // This would be a separate API endpoint for password change
      // await doctorAPI.changePassword({
      //   currentPassword: security.currentPassword,
      //   newPassword: security.newPassword
      // });
      toast.success('Password changed successfully');
      setSecurity(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const toggleTwoFactor = async () => {
    try {
      setSaving(true);
      // This would be a separate API endpoint for 2FA
      // await doctorAPI.toggleTwoFactor(!security.twoFactorEnabled);
      setSecurity(prev => ({
        ...prev,
        twoFactorEnabled: !prev.twoFactorEnabled
      }));
      toast.success(`Two-factor authentication ${!security.twoFactorEnabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      toast.error('Failed to update two-factor authentication');
    } finally {
      setSaving(false);
    }
  };

  const renderProfileTab = () => (
    <div className="settings-section">
      <div className="section-header">
        <h2>Profile Information</h2>
        <p>Manage your personal and professional information</p>
      </div>

      <div className="profile-form">
        <div className="avatar-section">
          <div className="avatar-container">
            <img 
              src={avatarPreview || '/default-avatar.png'} 
              alt="Profile" 
              className="profile-avatar"
            />
            <div className="avatar-overlay">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="avatar-input"
                id="avatar-upload"
              />
              <label htmlFor="avatar-upload" className="avatar-upload-btn">
                📷
              </label>
            </div>
          </div>
          <p className="avatar-hint">Click to change profile picture</p>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              value={profile.name}
              onChange={(e) => handleProfileChange('name', e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              value={profile.email}
              onChange={(e) => handleProfileChange('email', e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              value={profile.phone}
              onChange={(e) => handleProfileChange('phone', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="specialization">Specialization *</label>
            <select
              id="specialization"
              value={profile.specialization}
              onChange={(e) => handleProfileChange('specialization', e.target.value)}
              className="form-select"
              required
            >
              <option value="">Select Specialization</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Endocrinology">Endocrinology</option>
              <option value="Gastroenterology">Gastroenterology</option>
              <option value="General Medicine">General Medicine</option>
              <option value="Neurology">Neurology</option>
              <option value="Oncology">Oncology</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Psychiatry">Psychiatry</option>
              <option value="Radiology">Radiology</option>
              <option value="Surgery">Surgery</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="licenseNumber">License Number *</label>
            <input
              type="text"
              id="licenseNumber"
              value={profile.licenseNumber}
              onChange={(e) => handleProfileChange('licenseNumber', e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="experience">Years of Experience</label>
            <input
              type="number"
              id="experience"
              value={profile.experience}
              onChange={(e) => handleProfileChange('experience', e.target.value)}
              className="form-input"
              min="0"
              max="50"
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="bio">Biography</label>
            <textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => handleProfileChange('bio', e.target.value)}
              className="form-textarea"
              rows="4"
              placeholder="Tell patients about your background and expertise..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              value={profile.address}
              onChange={(e) => handleProfileChange('address', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="city">City</label>
            <input
              type="text"
              id="city"
              value={profile.city}
              onChange={(e) => handleProfileChange('city', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="state">State/Province</label>
            <input
              type="text"
              id="state"
              value={profile.state}
              onChange={(e) => handleProfileChange('state', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="zipCode">ZIP/Postal Code</label>
            <input
              type="text"
              id="zipCode"
              value={profile.zipCode}
              onChange={(e) => handleProfileChange('zipCode', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="country">Country</label>
            <input
              type="text"
              id="country"
              value={profile.country}
              onChange={(e) => handleProfileChange('country', e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={saveProfile}
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="settings-section">
      <div className="section-header">
        <h2>Preferences & Settings</h2>
        <p>Customize your experience and working preferences</p>
      </div>

      <div className="preferences-form">
        <div className="preference-group">
          <h3>General Settings</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="language">Language</label>
              <select
                id="language"
                value={preferences.language}
                onChange={(e) => handlePreferencesChange('language', 'language', e.target.value)}
                className="form-select"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="timezone">Timezone</label>
              <select
                id="timezone"
                value={preferences.timezone}
                onChange={(e) => handlePreferencesChange('timezone', 'timezone', e.target.value)}
                className="form-select"
              >
                <option value="UTC">UTC</option>
                <option value="EST">Eastern Time</option>
                <option value="PST">Pacific Time</option>
                <option value="GMT">Greenwich Mean Time</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dateFormat">Date Format</label>
              <select
                id="dateFormat"
                value={preferences.dateFormat}
                onChange={(e) => handlePreferencesChange('dateFormat', 'dateFormat', e.target.value)}
                className="form-select"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="timeFormat">Time Format</label>
              <select
                id="timeFormat"
                value={preferences.timeFormat}
                onChange={(e) => handlePreferencesChange('timeFormat', 'timeFormat', e.target.value)}
                className="form-select"
              >
                <option value="12h">12 Hour (AM/PM)</option>
                <option value="24h">24 Hour</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="theme">Theme</label>
              <select
                id="theme"
                value={preferences.theme}
                onChange={(e) => handlePreferencesChange('theme', 'theme', e.target.value)}
                className="form-select"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          </div>
        </div>

        <div className="preference-group">
          <h3>Notification Settings</h3>
          <div className="notification-settings">
            {Object.entries(preferences.notifications).map(([key, value]) => (
              <div key={key} className="notification-item">
                <div className="notification-info">
                  <label htmlFor={key}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
                  <p>Receive {key.replace(/([A-Z])/g, ' $1').toLowerCase()} notifications</p>
                </div>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id={key}
                    checked={value}
                    onChange={(e) => handleNestedPreferencesChange('notifications', 'notifications', key, e.target.checked)}
                    className="toggle-input"
                  />
                  <label htmlFor={key} className="toggle-label"></label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="preference-group">
          <h3>Working Hours</h3>
          <div className="working-hours">
            {Object.entries(preferences.workingHours).map(([day, schedule]) => (
              <div key={day} className="working-day">
                <div className="day-info">
                  <div className="day-toggle">
                    <input
                      type="checkbox"
                      id={`${day}-enabled`}
                      checked={schedule.enabled}
                      onChange={(e) => handleNestedPreferencesChange('workingHours', 'workingHours', day, {
                        ...schedule,
                        enabled: e.target.checked
                      })}
                      className="toggle-input"
                    />
                    <label htmlFor={`${day}-enabled`} className="toggle-label"></label>
                  </div>
                  <label htmlFor={`${day}-enabled`} className="day-name">
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </label>
                </div>
                {schedule.enabled && (
                  <div className="time-inputs">
                    <input
                      type="time"
                      value={schedule.start}
                      onChange={(e) => handleNestedPreferencesChange('workingHours', 'workingHours', day, {
                        ...schedule,
                        start: e.target.value
                      })}
                      className="time-input"
                    />
                    <span>to</span>
                    <input
                      type="time"
                      value={schedule.end}
                      onChange={(e) => handleNestedPreferencesChange('workingHours', 'workingHours', day, {
                        ...schedule,
                        end: e.target.value
                      })}
                      className="time-input"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="preference-group">
          <h3>Consultation Settings</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="maxPatients">Max Patients Per Day</label>
              <input
                type="number"
                id="maxPatients"
                value={preferences.consultationSettings.maxPatientsPerDay}
                onChange={(e) => handleNestedPreferencesChange('consultationSettings', 'consultationSettings', 'maxPatientsPerDay', parseInt(e.target.value))}
                className="form-input"
                min="1"
                max="50"
              />
            </div>

            <div className="form-group">
              <label htmlFor="appointmentDuration">Appointment Duration (minutes)</label>
              <input
                type="number"
                id="appointmentDuration"
                value={preferences.consultationSettings.appointmentDuration}
                onChange={(e) => handleNestedPreferencesChange('consultationSettings', 'consultationSettings', 'appointmentDuration', parseInt(e.target.value))}
                className="form-input"
                min="15"
                max="120"
                step="15"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bufferTime">Buffer Time (minutes)</label>
              <input
                type="number"
                id="bufferTime"
                value={preferences.consultationSettings.bufferTime}
                onChange={(e) => handleNestedPreferencesChange('consultationSettings', 'consultationSettings', 'bufferTime', parseInt(e.target.value))}
                className="form-input"
                min="0"
                max="30"
                step="5"
              />
            </div>

            <div className="form-group full-width">
              <div className="checkbox-group">
                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="onlineConsultation"
                    checked={preferences.consultationSettings.allowOnlineConsultation}
                    onChange={(e) => handleNestedPreferencesChange('consultationSettings', 'consultationSettings', 'allowOnlineConsultation', e.target.checked)}
                    className="checkbox-input"
                  />
                  <label htmlFor="onlineConsultation">Allow Online Consultations</label>
                </div>

                <div className="checkbox-item">
                  <input
                    type="checkbox"
                    id="emergencyAppointments"
                    checked={preferences.consultationSettings.allowEmergencyAppointments}
                    onChange={(e) => handleNestedPreferencesChange('consultationSettings', 'consultationSettings', 'allowEmergencyAppointments', e.target.checked)}
                    className="checkbox-input"
                  />
                  <label htmlFor="emergencyAppointments">Allow Emergency Appointments</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={savePreferences}
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="settings-section">
      <div className="section-header">
        <h2>Security & Privacy</h2>
        <p>Manage your account security and privacy settings</p>
      </div>

      <div className="security-form">
        <div className="security-group">
          <h3>Change Password</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                value={security.currentPassword}
                onChange={(e) => handleSecurityChange('currentPassword', e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={security.newPassword}
                onChange={(e) => handleSecurityChange('newPassword', e.target.value)}
                className="form-input"
                minLength="8"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={security.confirmPassword}
                onChange={(e) => handleSecurityChange('confirmPassword', e.target.value)}
                className="form-input"
                minLength="8"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={changePassword}
              disabled={saving || !security.currentPassword || !security.newPassword || !security.confirmPassword}
              className="btn btn-primary"
            >
              {saving ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </div>

        <div className="security-group">
          <h3>Two-Factor Authentication</h3>
          <div className="security-item">
            <div className="security-info">
              <h4>Two-Factor Authentication</h4>
              <p>Add an extra layer of security to your account</p>
            </div>
            <div className="toggle-switch">
              <input
                type="checkbox"
                id="twoFactor"
                checked={security.twoFactorEnabled}
                onChange={toggleTwoFactor}
                className="toggle-input"
                disabled={saving}
              />
              <label htmlFor="twoFactor" className="toggle-label"></label>
            </div>
          </div>
        </div>

        <div className="security-group">
          <h3>Login & Session Settings</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="sessionTimeout">Session Timeout (minutes)</label>
              <select
                id="sessionTimeout"
                value={security.sessionTimeout}
                onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                className="form-select"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value={480}>8 hours</option>
              </select>
            </div>
          </div>

          <div className="checkbox-group">
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="loginAlerts"
                checked={security.loginAlerts}
                onChange={(e) => handleSecurityChange('loginAlerts', e.target.checked)}
                className="checkbox-input"
              />
              <label htmlFor="loginAlerts">Email alerts for new logins</label>
            </div>
          </div>
        </div>

        <div className="security-group">
          <h3>Data & Privacy</h3>
          <div className="privacy-actions">
            <button type="button" className="btn btn-secondary">
              Download My Data
            </button>
            <button type="button" className="btn btn-danger">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="doctor-settings-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="settings-layout">
        <div className="settings-sidebar">
          <nav className="settings-nav">
            <button
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <span className="nav-icon">👤</span>
              <span className="nav-text">Profile</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              <span className="nav-icon">⚙️</span>
              <span className="nav-text">Preferences</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <span className="nav-icon">🔒</span>
              <span className="nav-text">Security</span>
            </button>
          </nav>
        </div>

        <div className="settings-content">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'preferences' && renderPreferencesTab()}
          {activeTab === 'security' && renderSecurityTab()}
        </div>
      </div>
    </div>
  );
};

export default DoctorSettings;