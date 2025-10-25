import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiSearch, FiFilter, FiChevronRight, FiCalendar, FiUser, FiDroplet, FiFileText } from 'react-icons/fi';
import { medicalRecordsAPI, patientAPI } from '../../../services/api';
import MedicalRecordForm from '../../../components/MedicalRecordForm';
import MedicalRecordDetails from '../../../components/MedicalRecordDetails';
import './PatientRecords.css';

const PatientRecords = () => {
  const [records, setRecords] = useState([]);
  const [patientProfile, setPatientProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'details', 'form'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // 'all', 'recent', 'diagnosis', 'treatment'

  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const [profileResponse, recordsResponse] = await Promise.all([
        patientAPI.getProfile(),
        patientAPI.getRecordsSummary()
      ]);
      
      setPatientProfile(profileResponse.patient);
      
      // Get full medical records
      const fullRecordsResponse = await medicalRecordsAPI.getByPatient(profileResponse.patient._id);
      setRecords(fullRecordsResponse.records || []);
    } catch (error) {
      setError(error.message);
      toast.error('Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = () => {
    setEditingRecord(null);
    setViewMode('form');
  };

  const handleEditRecord = (record) => {
    setEditingRecord(record);
    setViewMode('form');
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setViewMode('details');
  };

  const handleDeleteRecord = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this medical record?')) {
      try {
        await medicalRecordsAPI.delete(recordId);
        setRecords(records.filter(record => record._id !== recordId));
        toast.success('Medical record deleted successfully');
      } catch (error) {
        toast.error('Failed to delete medical record');
      }
    }
  };

  const handleFormSubmit = async (recordData) => {
    try {
      if (editingRecord) {
        // Update existing record
        const updatedRecord = await medicalRecordsAPI.update(editingRecord._id, recordData);
        setRecords(records.map(record => 
          record._id === editingRecord._id ? updatedRecord.record : record
        ));
        toast.success('Medical record updated successfully');
      } else {
        // Add new record (this would typically be done by a doctor)
        toast.info('Only doctors can create new medical records');
      }
      setViewMode('list');
      setEditingRecord(null);
    } catch (error) {
      toast.error('Failed to save medical record');
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedRecord(null);
    setEditingRecord(null);
  };

  // Filter and search records
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.treatment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctorId?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = (() => {
      switch (filterBy) {
        case 'recent':
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          return new Date(record.visitDate) >= oneMonthAgo;
        case 'diagnosis':
          return record.diagnosis && record.diagnosis.trim() !== '';
        case 'treatment':
          return record.treatment && record.treatment.trim() !== '';
        default:
          return true;
      }
    })();

    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name) => {
    if (!name) return 'DR';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getRecordType = (record) => {
    if (record.diagnosis) return 'Diagnosis';
    if (record.prescriptions?.length > 0) return 'Prescription';
    if (record.treatment) return 'Treatment';
    return 'General';
  };

  if (loading) {
    return (
      <div className="patient-records-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your medical records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="patient-records-container">
        <div className="error-message">
          <h3>Error Loading Records</h3>
          <p>{error}</p>
          <button onClick={fetchPatientData} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-records-container">
      <div className="records-header">
        <div>
          <h1>My Health Records</h1>
          <p className="page-description">View and manage your complete medical history in one place</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={handleAddRecord}
          >
            <FiPlus className="btn-icon" /> Request New Record
          </button>
        </div>
      </div>

      {viewMode === 'list' && (
        <>
          {/* Patient Summary Card */}
          {patientProfile && (
            <div className="patient-summary-card">
              <div className="summary-header">
                <h3>Patient Information</h3>
              </div>
              <div className="summary-content">
                <div className="summary-item">
                  <span className="label">
                    <FiUser className="summary-icon" /> Name
                  </span>
                  <span className="value">{patientProfile.name}</span>
                </div>
                <div className="summary-item">
                  <span className="label">
                    <FiCalendar className="summary-icon" /> Age
                  </span>
                  <span className="value">
                    {new Date().getFullYear() - new Date(patientProfile.dateOfBirth).getFullYear()} years
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">
                    <FiDroplet className="summary-icon" /> Blood Group
                  </span>
                  <span className={`value ${patientProfile.bloodGroup ? 'blood-group' : ''}`}>
                    {patientProfile.bloodGroup || 'Not specified'}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">
                    <FiFileText className="summary-icon" /> Total Records
                  </span>
                  <span className="value">{records.length}</span>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filter */}
          <div className="search-filter-container">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search records..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-controls">
              <div className="filter-select-wrapper">
                <FiFilter className="filter-icon" />
                <select
                  className="filter-select"
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                >
                  <option value="all">All Records</option>
                  <option value="recent">Recent (Last 30 days)</option>
                  <option value="diagnosis">Diagnosis</option>
                  <option value="treatment">Treatments</option>
                </select>
              </div>
            </div>
          </div>

          {/* Records List */}
          {filteredRecords.length > 0 ? (
            <div className="records-list">
              {filteredRecords.map(record => (
                <div key={record._id} className="record-card" onClick={() => handleViewRecord(record)}>
                  <div className="record-card-header">
                    <div>
                      <h3 className="record-card-title">
                        {record.diagnosis || 'Medical Record'}
                        <span className="record-type-badge">{getRecordType(record)}</span>
                      </h3>
                      <div className="record-meta">
                        <span className="record-date">
                          <FiCalendar className="meta-icon" /> {formatDate(record.visitDate)}
                        </span>
                        {record.doctorId && (
                          <span className="record-doctor">
                            <FiUser className="meta-icon" /> Dr. {record.doctorId.name || 'Unknown'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="record-actions">
                      <button 
                        className="btn-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewRecord(record);
                        }}
                        title="View Details"
                      >
                        <FiChevronRight />
                      </button>
                    </div>
                  </div>
                  
                  <div className="record-card-content">
                    {record.notes && (
                      <div className="record-card-detail">
                        <div className="record-card-label">Notes</div>
                        <p className="record-card-value">
                          {record.notes.length > 150 
                            ? `${record.notes.substring(0, 150)}...` 
                            : record.notes}
                        </p>
                      </div>
                    )}
                    
                    {record.treatment && (
                      <div className="record-treatment">
                        <span className="label">Treatment:</span>
                        <span className="value">{record.treatment}</span>
                      </div>
                    )}
                    
                    {record.prescriptions && record.prescriptions.length > 0 && (
                      <div className="record-prescriptions">
                        <span className="label">Prescriptions:</span>
                        <ul className="prescription-list">
                          {record.prescriptions.map((prescription, index) => (
                            <li key={index}>{prescription}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-records">
              <div className="no-records-icon">📋</div>
              <h3>No Records Found</h3>
              <p>No medical records found matching your search criteria.</p>
              <button 
                className="btn btn-primary"
                onClick={handleAddRecord}
              >
                <FiPlus className="btn-icon" /> Add New Record
              </button>
            </div>
          )}
        </>
      )}

      {viewMode === 'details' && selectedRecord && (
        <MedicalRecordDetails
          record={selectedRecord}
          onBack={handleBackToList}
          onEdit={handleEditRecord}
          onDelete={handleDeleteRecord}
        />
      )}

      {viewMode === 'form' && (
        <MedicalRecordForm
          record={editingRecord}
          onSubmit={handleFormSubmit}
          onCancel={handleBackToList}
          isEditMode={!!editingRecord}
        />
      )}
    </div>
  );
};

export default PatientRecords;