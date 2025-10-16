import React from 'react';
import './MedicalRecordDetails.css';

const MedicalRecordDetails = ({ record, onBack, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRecordAge = (dateString) => {
    const recordDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - recordDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  return (
    <div className="medical-record-details-container">
      <div className="details-header">
        <button 
          className="btn btn-secondary back-btn"
          onClick={onBack}
        >
          ← Back to Records
        </button>
        
        <div className="header-actions">
          <button 
            className="btn btn-outline"
            onClick={() => onEdit(record)}
          >
            Edit Record
          </button>
          <button 
            className="btn btn-danger"
            onClick={() => onDelete(record._id)}
          >
            Delete Record
          </button>
        </div>
      </div>

      <div className="record-details-content">
        {/* Record Header */}
        <div className="record-header-section">
          <div className="visit-info">
            <h2>Medical Record</h2>
            <div className="visit-date-info">
              <span className="visit-date">{formatDate(record.visitDate)}</span>
              <span className="visit-time">{formatTime(record.visitDate)}</span>
              <span className="record-age">({getRecordAge(record.visitDate)})</span>
            </div>
          </div>
          
          <div className="record-status">
            <span className="status-badge">Completed</span>
          </div>
        </div>

        {/* Doctor Information */}
        <div className="info-section">
          <h3>Doctor Information</h3>
          <div className="doctor-info-card">
            <div className="doctor-avatar">
              {record.doctorId?.name ? record.doctorId.name.charAt(0).toUpperCase() : 'D'}
            </div>
            <div className="doctor-details">
              <h4>{record.doctorId?.name || 'Unknown Doctor'}</h4>
              <p className="specialization">
                {record.doctorId?.specialization || 'General Medicine'}
              </p>
              <p className="doctor-email">
                {record.doctorId?.email || 'Email not available'}
              </p>
            </div>
          </div>
        </div>

        {/* Diagnosis Section */}
        {record.diagnosis && (
          <div className="info-section">
            <h3>Diagnosis</h3>
            <div className="diagnosis-content">
              <div className="diagnosis-icon">🩺</div>
              <div className="diagnosis-text">
                <p>{record.diagnosis}</p>
              </div>
            </div>
          </div>
        )}

        {/* Treatment Section */}
        {record.treatment && (
          <div className="info-section">
            <h3>Treatment</h3>
            <div className="treatment-content">
              <div className="treatment-icon">💊</div>
              <div className="treatment-text">
                <p>{record.treatment}</p>
              </div>
            </div>
          </div>
        )}

        {/* Prescriptions Section */}
        {record.prescriptions && record.prescriptions.length > 0 && (
          <div className="info-section">
            <h3>Prescriptions</h3>
            <div className="prescriptions-list">
              {record.prescriptions.map((prescription, index) => (
                <div key={index} className="prescription-item">
                  <div className="prescription-number">{index + 1}</div>
                  <div className="prescription-text">{prescription}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Notes Section */}
        {record.notes && (
          <div className="info-section">
            <h3>Additional Notes</h3>
            <div className="notes-content">
              <div className="notes-icon">📝</div>
              <div className="notes-text">
                <p>{record.notes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Record Metadata */}
        <div className="info-section metadata-section">
          <h3>Record Information</h3>
          <div className="metadata-grid">
            <div className="metadata-item">
              <span className="metadata-label">Record ID:</span>
              <span className="metadata-value">{record._id}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Created:</span>
              <span className="metadata-value">{formatDate(record.createdAt)}</span>
            </div>
            {record.updatedAt && record.updatedAt !== record.createdAt && (
              <div className="metadata-item">
                <span className="metadata-label">Last Updated:</span>
                <span className="metadata-value">{formatDate(record.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordDetails;
