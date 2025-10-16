import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Search, 
  Filter, 
  Users, 
  Calendar, 
  FileText, 
  Eye, 
  Plus,
  Phone,
  Mail,
  MapPin,
  Clock,
  User,
  Heart,
  Activity,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  X
} from 'lucide-react';
import { doctorAPI } from '../../../services/api';
import './DoctorPatients.css';

const DoctorPatients = () => {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedSections, setExpandedSections] = useState({});
  const [showMedicalRecordForm, setShowMedicalRecordForm] = useState(false);
  const [medicalRecordForm, setMedicalRecordForm] = useState({
    diagnosis: '',
    treatment: '',
    prescriptions: '',
    notes: '',
    visitDate: new Date().toISOString().split('T')[0],
    followUpDate: ''
  });

  useEffect(() => {
    loadPatients();
  }, [currentPage, searchTerm]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await doctorAPI.getPatients(currentPage, 10, searchTerm);
      setPatients(response.patients || []);
      setTotalPages(response.pagination?.pages || 1);
    } catch (error) {
      console.error('Error loading patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const loadPatientDetails = async (patientId) => {
    try {
      const response = await doctorAPI.getPatientDetails(patientId);
      setPatientDetails(response);
      setSelectedPatient(patientId);
    } catch (error) {
      console.error('Error loading patient details:', error);
      toast.error('Failed to load patient details');
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCreateMedicalRecord = async (e) => {
    e.preventDefault();
    try {
      await doctorAPI.createMedicalRecord(selectedPatient, medicalRecordForm);
      toast.success('Medical record created successfully');
      setShowMedicalRecordForm(false);
      setMedicalRecordForm({
        diagnosis: '',
        treatment: '',
        prescriptions: '',
        notes: '',
        visitDate: new Date().toISOString().split('T')[0],
        followUpDate: ''
      });
      // Reload patient details to show new record
      if (selectedPatient) {
        loadPatientDetails(selectedPatient);
      }
    } catch (error) {
      console.error('Error creating medical record:', error);
      toast.error('Failed to create medical record');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      rescheduled: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const PatientCard = ({ patient }) => (
    <div 
      className={`patient-card ${selectedPatient === patient._id ? 'selected' : ''}`}
      onClick={() => loadPatientDetails(patient._id)}
    >
      <div className="patient-avatar">
        <User size={24} />
      </div>
      <div className="patient-info">
        <h3 className="patient-name">{patient.name}</h3>
        <p className="patient-email">{patient.email}</p>
        <div className="patient-details">
          <span className="patient-age">Age: {patient.age || 'N/A'}</span>
          <span className="patient-gender">{patient.gender}</span>
        </div>
      </div>
      <div className="patient-actions">
        <ChevronRight size={20} />
      </div>
    </div>
  );

  const MedicalRecordForm = () => (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Create Medical Record</h3>
          <button 
            className="close-btn"
            onClick={() => setShowMedicalRecordForm(false)}
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleCreateMedicalRecord} className="medical-record-form">
          <div className="form-group">
            <label>Diagnosis *</label>
            <input
              type="text"
              value={medicalRecordForm.diagnosis}
              onChange={(e) => setMedicalRecordForm(prev => ({ ...prev, diagnosis: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label>Treatment</label>
            <textarea
              value={medicalRecordForm.treatment}
              onChange={(e) => setMedicalRecordForm(prev => ({ ...prev, treatment: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Prescriptions</label>
            <textarea
              value={medicalRecordForm.prescriptions}
              onChange={(e) => setMedicalRecordForm(prev => ({ ...prev, prescriptions: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={medicalRecordForm.notes}
              onChange={(e) => setMedicalRecordForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Visit Date *</label>
              <input
                type="date"
                value={medicalRecordForm.visitDate}
                onChange={(e) => setMedicalRecordForm(prev => ({ ...prev, visitDate: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Follow-up Date</label>
              <input
                type="date"
                value={medicalRecordForm.followUpDate}
                onChange={(e) => setMedicalRecordForm(prev => ({ ...prev, followUpDate: e.target.value }))}
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => setShowMedicalRecordForm(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="doctor-patients">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-patients">
      {/* Header */}
      <div className="patients-header">
        <div className="header-content">
          <h1 className="header-title">My Patients</h1>
          <p className="header-subtitle">Manage your patient information and medical records</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={() => setShowMedicalRecordForm(true)}
            disabled={!selectedPatient}
          >
            <Plus size={16} />
            Add Medical Record
          </button>
        </div>
      </div>

      <div className="patients-content">
        {/* Left Panel - Patients List */}
        <div className="patients-list-panel">
          <div className="search-section">
            <div className="search-input">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>

          <div className="patients-list">
            {patients.length > 0 ? (
              patients.map((patient) => (
                <PatientCard key={patient._id} patient={patient} />
              ))
            ) : (
              <div className="empty-state">
                <Users size={48} />
                <p>No patients found</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Right Panel - Patient Details */}
        <div className="patient-details-panel">
          {patientDetails ? (
            <div className="patient-details-content">
              {/* Patient Header */}
              <div className="patient-header">
                <div className="patient-avatar-large">
                  <User size={32} />
                </div>
                <div className="patient-header-info">
                  <h2 className="patient-name-large">{patientDetails.patient.name}</h2>
                  <p className="patient-email-large">{patientDetails.patient.email}</p>
                  <div className="patient-contact">
                    <span><Phone size={16} /> {patientDetails.patient.phone}</span>
                    <span><Mail size={16} /> {patientDetails.patient.email}</span>
                  </div>
                </div>
              </div>

              {/* Patient Information */}
              <div className="patient-info-section">
                <div className="section-header" onClick={() => toggleSection('info')}>
                  <h3>Patient Information</h3>
                  {expandedSections.info ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
                {expandedSections.info && (
                  <div className="section-content">
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Age</label>
                        <span>{patientDetails.patient.age || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <label>Gender</label>
                        <span>{patientDetails.patient.gender}</span>
                      </div>
                      <div className="info-item">
                        <label>Blood Group</label>
                        <span>{patientDetails.patient.bloodGroup || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <label>Date of Birth</label>
                        <span>{patientDetails.patient.dateOfBirth ? formatDate(patientDetails.patient.dateOfBirth) : 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <label>Address</label>
                        <span>{patientDetails.patient.address || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <label>Emergency Contact</label>
                        <span>{patientDetails.patient.emergencyContact || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Medical History */}
              <div className="patient-info-section">
                <div className="section-header" onClick={() => toggleSection('medical')}>
                  <h3>Medical History</h3>
                  {expandedSections.medical ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
                {expandedSections.medical && (
                  <div className="section-content">
                    <div className="medical-info">
                      <div className="medical-item">
                        <label>Allergies</label>
                        <span>{patientDetails.patient.allergies?.join(', ') || 'None reported'}</span>
                      </div>
                      <div className="medical-item">
                        <label>Chronic Conditions</label>
                        <span>{patientDetails.patient.chronicConditions?.join(', ') || 'None reported'}</span>
                      </div>
                      <div className="medical-item">
                        <label>Current Medications</label>
                        <span>{patientDetails.patient.currentMedications?.join(', ') || 'None reported'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Appointments */}
              <div className="patient-info-section">
                <div className="section-header" onClick={() => toggleSection('appointments')}>
                  <h3>Recent Appointments</h3>
                  {expandedSections.appointments ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
                {expandedSections.appointments && (
                  <div className="section-content">
                    <div className="appointments-list">
                      {patientDetails.appointments?.length > 0 ? (
                        patientDetails.appointments.map((appointment) => (
                          <div key={appointment._id} className="appointment-item">
                            <div className="appointment-date">
                              <Calendar size={16} />
                              <span>{formatDate(appointment.date)}</span>
                            </div>
                            <div className="appointment-details">
                              <p className="appointment-time">{formatTime(appointment.time)}</p>
                              <p className="appointment-reason">{appointment.reason}</p>
                            </div>
                            <span className={`status-badge ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="no-data">No appointments found</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Medical Records */}
              <div className="patient-info-section">
                <div className="section-header" onClick={() => toggleSection('records')}>
                  <h3>Medical Records</h3>
                  {expandedSections.records ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
                {expandedSections.records && (
                  <div className="section-content">
                    <div className="medical-records-list">
                      {patientDetails.medicalRecords?.length > 0 ? (
                        patientDetails.medicalRecords.map((record) => (
                          <div key={record._id} className="medical-record-item">
                            <div className="record-header">
                              <div className="record-date">
                                <Clock size={16} />
                                <span>{formatDate(record.createdAt)}</span>
                              </div>
                              <button className="view-record-btn">
                                <Eye size={16} />
                              </button>
                            </div>
                            <div className="record-content">
                              <h4 className="record-diagnosis">{record.diagnosis}</h4>
                              <p className="record-treatment">{record.treatment}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="no-data">No medical records found</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="no-patient-selected">
              <Users size={64} />
              <h3>Select a Patient</h3>
              <p>Choose a patient from the list to view their details and medical history</p>
            </div>
          )}
        </div>
      </div>

      {/* Medical Record Form Modal */}
      {showMedicalRecordForm && <MedicalRecordForm />}
    </div>
  );
};

export default DoctorPatients;