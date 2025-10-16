import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { patientAPI } from '../../../services/api';
import './PatientSettings.css';

const PatientSettings = () => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    bloodGroup: '',
    height: '',
    weight: '',
    maritalStatus: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    emergencyContact: {
      name: '',
      relation: '',
      phone: ''
    },
    allergies: [],
    chronicConditions: [],
    currentMedications: []
  });
  const [errors, setErrors] = useState({});
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newMedication, setNewMedication] = useState('');

  useEffect(() => {
    fetchPatientProfile();
  }, []);

  const fetchPatientProfile = async () => {
    try {
      setLoading(true);
      const response = await patientAPI.getProfile();
      const patientData = response.patient;
      
      setPatient(patientData);
      setFormData({
        name: patientData.name || '',
        email: patientData.email || '',
        phone: patientData.phone || '',
        gender: patientData.gender || '',
        dateOfBirth: patientData.dateOfBirth ? new Date(patientData.dateOfBirth).toISOString().split('T')[0] : '',
        bloodGroup: patientData.bloodGroup || '',
        height: patientData.height || '',
        weight: patientData.weight || '',
        maritalStatus: patientData.maritalStatus || '',
        insuranceProvider: patientData.insuranceProvider || '',
        insurancePolicyNumber: patientData.insurancePolicyNumber || '',
        emergencyContact: {
          name: patientData.emergencyContact?.name || '',
          relation: patientData.emergencyContact?.relation || '',
          phone: patientData.emergencyContact?.phone || ''
        },
        allergies: patientData.allergies || [],
        chronicConditions: patientData.chronicConditions || [],
        currentMedications: patientData.currentMedications || []
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddItem = (type, value, setter) => {
    if (value.trim() && !formData[type].includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], value.trim()]
      }));
      setter('');
    }
  };

  const handleRemoveItem = (type, index) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Validate phone format
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Invalid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setSaving(true);
    try {
      const response = await patientAPI.updateProfile(formData);
      setPatient(response.patient);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="patient-settings-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-settings-container">
      <div className="settings-header">
        <h1>Account Settings</h1>
        <p>Manage your personal information and medical history</p>
      </div>

      <div className="settings-content">
        {/* Navigation Tabs */}
        <div className="settings-nav">
          <button
            className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Personal Information
          </button>
          <button
            className={`nav-tab ${activeTab === 'medical' ? 'active' : ''}`}
            onClick={() => setActiveTab('medical')}
          >
            Medical Information
          </button>
          <button
            className={`nav-tab ${activeTab === 'emergency' ? 'active' : ''}`}
            onClick={() => setActiveTab('emergency')}
          >
            Emergency Contact
          </button>
        </div>

        <form onSubmit={handleSaveProfile} className="settings-form">
          {/* Personal Information Tab */}
          {activeTab === 'profile' && (
            <div className="tab-content">
              <h2>Personal Information</h2>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={errors.name ? 'error' : ''}
                    disabled={saving}
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                    disabled={saving}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={errors.phone ? 'error' : ''}
                    disabled={saving}
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="gender">Gender *</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={errors.gender ? 'error' : ''}
                    disabled={saving}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && <span className="error-message">{errors.gender}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="dateOfBirth">Date of Birth *</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className={errors.dateOfBirth ? 'error' : ''}
                    disabled={saving}
                  />
                  {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
                  {formData.dateOfBirth && (
                    <span className="age-display">
                      Age: {calculateAge(formData.dateOfBirth)} years
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="bloodGroup">Blood Group</label>
                  <select
                    id="bloodGroup"
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    disabled={saving}
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="height">Height (cm)</label>
                  <input
                    type="number"
                    id="height"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    min="50"
                    max="250"
                    disabled={saving}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="weight">Weight (kg)</label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    min="10"
                    max="500"
                    step="0.1"
                    disabled={saving}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="maritalStatus">Marital Status</label>
                  <select
                    id="maritalStatus"
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleInputChange}
                    disabled={saving}
                  >
                    <option value="">Select Marital Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Medical Information Tab */}
          {activeTab === 'medical' && (
            <div className="tab-content">
              <h2>Medical Information</h2>
              
              {/* Allergies */}
              <div className="form-section">
                <h3>Allergies</h3>
                <div className="list-management">
                  <div className="add-item">
                    <input
                      type="text"
                      placeholder="Add allergy..."
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('allergies', newAllergy, setNewAllergy))}
                      disabled={saving}
                    />
                    <button
                      type="button"
                      onClick={() => handleAddItem('allergies', newAllergy, setNewAllergy)}
                      disabled={saving}
                      className="btn btn-outline"
                    >
                      Add
                    </button>
                  </div>
                  <div className="item-list">
                    {formData.allergies.map((allergy, index) => (
                      <div key={index} className="list-item">
                        <span>{allergy}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem('allergies', index)}
                          disabled={saving}
                          className="remove-btn"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chronic Conditions */}
              <div className="form-section">
                <h3>Chronic Conditions</h3>
                <div className="list-management">
                  <div className="add-item">
                    <input
                      type="text"
                      placeholder="Add chronic condition..."
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('chronicConditions', newCondition, setNewCondition))}
                      disabled={saving}
                    />
                    <button
                      type="button"
                      onClick={() => handleAddItem('chronicConditions', newCondition, setNewCondition)}
                      disabled={saving}
                      className="btn btn-outline"
                    >
                      Add
                    </button>
                  </div>
                  <div className="item-list">
                    {formData.chronicConditions.map((condition, index) => (
                      <div key={index} className="list-item">
                        <span>{condition}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem('chronicConditions', index)}
                          disabled={saving}
                          className="remove-btn"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Current Medications */}
              <div className="form-section">
                <h3>Current Medications</h3>
                <div className="list-management">
                  <div className="add-item">
                    <input
                      type="text"
                      placeholder="Add current medication..."
                      value={newMedication}
                      onChange={(e) => setNewMedication(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('currentMedications', newMedication, setNewMedication))}
                      disabled={saving}
                    />
                    <button
                      type="button"
                      onClick={() => handleAddItem('currentMedications', newMedication, setNewMedication)}
                      disabled={saving}
                      className="btn btn-outline"
                    >
                      Add
                    </button>
                  </div>
                  <div className="item-list">
                    {formData.currentMedications.map((medication, index) => (
                      <div key={index} className="list-item">
                        <span>{medication}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem('currentMedications', index)}
                          disabled={saving}
                          className="remove-btn"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Insurance Information */}
              <div className="form-section">
                <h3>Insurance Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="insuranceProvider">Insurance Provider</label>
                    <input
                      type="text"
                      id="insuranceProvider"
                      name="insuranceProvider"
                      value={formData.insuranceProvider}
                      onChange={handleInputChange}
                      disabled={saving}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="insurancePolicyNumber">Policy Number</label>
                    <input
                      type="text"
                      id="insurancePolicyNumber"
                      name="insurancePolicyNumber"
                      value={formData.insurancePolicyNumber}
                      onChange={handleInputChange}
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Contact Tab */}
          {activeTab === 'emergency' && (
            <div className="tab-content">
              <h2>Emergency Contact</h2>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="emergencyContact.name">Contact Name</label>
                  <input
                    type="text"
                    id="emergencyContact.name"
                    name="emergencyContact.name"
                    value={formData.emergencyContact.name}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="emergencyContact.relation">Relationship</label>
                  <select
                    id="emergencyContact.relation"
                    name="emergencyContact.relation"
                    value={formData.emergencyContact.relation}
                    onChange={handleInputChange}
                    disabled={saving}
                  >
                    <option value="">Select Relationship</option>
                    <option value="spouse">Spouse</option>
                    <option value="parent">Parent</option>
                    <option value="child">Child</option>
                    <option value="sibling">Sibling</option>
                    <option value="friend">Friend</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="emergencyContact.phone">Phone Number</label>
                  <input
                    type="tel"
                    id="emergencyContact.phone"
                    name="emergencyContact.phone"
                    value={formData.emergencyContact.phone}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientSettings;