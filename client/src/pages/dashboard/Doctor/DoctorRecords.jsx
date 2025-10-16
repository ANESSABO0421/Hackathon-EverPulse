import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  Activity,
  TrendingUp,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  Upload
} from 'lucide-react';
import { doctorAPI } from '../../../services/api';
import './DoctorRecords.css';

const DoctorRecords = () => {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    patientId: '',
    diagnosis: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'visitDate',
    sortOrder: 'desc'
  });
  const [recordForm, setRecordForm] = useState({
    patientId: '',
    diagnosis: '',
    treatment: '',
    prescriptions: '',
    notes: '',
    visitDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadRecords();
    loadStats();
  }, [currentPage, filters]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const response = await doctorAPI.getMedicalRecords(
        currentPage,
        10,
        filters.search,
        filters.patientId,
        filters.diagnosis,
        filters.dateFrom,
        filters.dateTo,
        filters.sortBy,
        filters.sortOrder
      );
      setRecords(response.records || []);
      setTotalPages(response.pagination?.pages || 1);
    } catch (error) {
      console.error('Error loading medical records:', error);
      toast.error('Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await doctorAPI.getMedicalRecordsStats(30);
      setStats(response.stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    try {
      await doctorAPI.createMedicalRecord(recordForm.patientId, recordForm);
      toast.success('Medical record created successfully');
      setShowCreateModal(false);
      setRecordForm({
        patientId: '',
        diagnosis: '',
        treatment: '',
        prescriptions: '',
        notes: '',
        visitDate: new Date().toISOString().split('T')[0]
      });
      loadRecords();
      loadStats();
    } catch (error) {
      console.error('Error creating medical record:', error);
      toast.error('Failed to create medical record');
    }
  };

  const handleUpdateRecord = async (e) => {
    e.preventDefault();
    try {
      await doctorAPI.updateMedicalRecord(selectedRecord._id, recordForm);
      toast.success('Medical record updated successfully');
      setShowUpdateModal(false);
      setRecordForm({
        patientId: '',
        diagnosis: '',
        treatment: '',
        prescriptions: '',
        notes: '',
        visitDate: new Date().toISOString().split('T')[0]
      });
      loadRecords();
    } catch (error) {
      console.error('Error updating medical record:', error);
      toast.error('Failed to update medical record');
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this medical record?')) {
      try {
        await doctorAPI.deleteMedicalRecord(recordId);
        toast.success('Medical record deleted successfully');
        loadRecords();
        loadStats();
      } catch (error) {
        console.error('Error deleting medical record:', error);
        toast.error('Failed to delete medical record');
      }
    }
  };

  const openCreateModal = () => {
    setRecordForm({
      patientId: '',
      diagnosis: '',
      treatment: '',
      prescriptions: '',
      notes: '',
      visitDate: new Date().toISOString().split('T')[0]
    });
    setShowCreateModal(true);
  };

  const openUpdateModal = (record) => {
    setSelectedRecord(record);
    setRecordForm({
      patientId: record.patientId._id,
      diagnosis: record.diagnosis || '',
      treatment: record.treatment || '',
      prescriptions: record.prescriptions?.join(', ') || '',
      notes: record.notes || '',
      visitDate: record.visitDate ? new Date(record.visitDate).toISOString().split('T')[0] : ''
    });
    setShowUpdateModal(true);
  };

  const openDetailsModal = (record) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
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

  const RecordCard = ({ record }) => (
    <div className="record-card">
      <div className="record-header">
        <div className="record-date">
          <Calendar size={16} />
          <span>{formatDate(record.visitDate)}</span>
        </div>
        <div className="record-actions">
          <button 
            className="action-btn view-btn"
            onClick={() => openDetailsModal(record)}
          >
            <Eye size={16} />
          </button>
          <button 
            className="action-btn edit-btn"
            onClick={() => openUpdateModal(record)}
          >
            <Edit size={16} />
          </button>
          <button 
            className="action-btn delete-btn"
            onClick={() => handleDeleteRecord(record._id)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <div className="record-content">
        <div className="patient-info">
          <div className="patient-avatar">
            <User size={20} />
          </div>
          <div className="patient-details">
            <h4 className="patient-name">{record.patientId?.name || 'Unknown Patient'}</h4>
            <p className="patient-email">{record.patientId?.email}</p>
          </div>
        </div>
        
        <div className="record-diagnosis">
          <h5>Diagnosis</h5>
          <p>{record.diagnosis || 'No diagnosis recorded'}</p>
        </div>
        
        {record.treatment && (
          <div className="record-treatment">
            <h5>Treatment</h5>
            <p>{record.treatment}</p>
          </div>
        )}
        
        {record.prescriptions?.length > 0 && (
          <div className="record-prescriptions">
            <h5>Prescriptions</h5>
            <ul>
              {record.prescriptions.map((prescription, index) => (
                <li key={index}>{prescription}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  const RecordForm = ({ isUpdate = false }) => (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h3>{isUpdate ? 'Update Medical Record' : 'Create Medical Record'}</h3>
          <button 
            className="close-btn"
            onClick={() => isUpdate ? setShowUpdateModal(false) : setShowCreateModal(false)}
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={isUpdate ? handleUpdateRecord : handleCreateRecord} className="record-form">
          <div className="form-group">
            <label>Patient ID *</label>
            <input
              type="text"
              value={recordForm.patientId}
              onChange={(e) => setRecordForm(prev => ({ ...prev, patientId: e.target.value }))}
              required
              disabled={isUpdate}
              placeholder="Enter patient ID"
            />
          </div>
          
          <div className="form-group">
            <label>Visit Date *</label>
            <input
              type="date"
              value={recordForm.visitDate}
              onChange={(e) => setRecordForm(prev => ({ ...prev, visitDate: e.target.value }))}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Diagnosis *</label>
            <input
              type="text"
              value={recordForm.diagnosis}
              onChange={(e) => setRecordForm(prev => ({ ...prev, diagnosis: e.target.value }))}
              required
              placeholder="Enter diagnosis"
            />
          </div>
          
          <div className="form-group">
            <label>Treatment</label>
            <textarea
              value={recordForm.treatment}
              onChange={(e) => setRecordForm(prev => ({ ...prev, treatment: e.target.value }))}
              rows={4}
              placeholder="Describe treatment provided"
            />
          </div>
          
          <div className="form-group">
            <label>Prescriptions</label>
            <textarea
              value={recordForm.prescriptions}
              onChange={(e) => setRecordForm(prev => ({ ...prev, prescriptions: e.target.value }))}
              rows={3}
              placeholder="List prescriptions (separate with commas)"
            />
          </div>
          
          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={recordForm.notes}
              onChange={(e) => setRecordForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Additional notes"
            />
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={() => isUpdate ? setShowUpdateModal(false) : setShowCreateModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {isUpdate ? 'Update Record' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const DetailsModal = () => (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h3>Medical Record Details</h3>
          <button 
            className="close-btn"
            onClick={() => setShowDetailsModal(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="record-details">
          {selectedRecord && (
            <>
              <div className="details-section">
                <h4>Patient Information</h4>
                <div className="patient-details-grid">
                  <div className="detail-item">
                    <label>Name</label>
                    <span>{selectedRecord.patientId?.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email</label>
                    <span>{selectedRecord.patientId?.email}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phone</label>
                    <span>{selectedRecord.patientId?.phone}</span>
                  </div>
                  <div className="detail-item">
                    <label>Date of Birth</label>
                    <span>{selectedRecord.patientId?.dateOfBirth ? formatDate(selectedRecord.patientId.dateOfBirth) : 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              <div className="details-section">
                <h4>Visit Information</h4>
                <div className="visit-details-grid">
                  <div className="detail-item">
                    <label>Visit Date</label>
                    <span>{formatDate(selectedRecord.visitDate)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Created</label>
                    <span>{formatDate(selectedRecord.createdAt)} at {formatTime(selectedRecord.createdAt)}</span>
                  </div>
                </div>
              </div>
              
              <div className="details-section">
                <h4>Medical Information</h4>
                <div className="medical-details">
                  <div className="detail-item">
                    <label>Diagnosis</label>
                    <span>{selectedRecord.diagnosis || 'No diagnosis recorded'}</span>
                  </div>
                  
                  {selectedRecord.treatment && (
                    <div className="detail-item">
                      <label>Treatment</label>
                      <span>{selectedRecord.treatment}</span>
                    </div>
                  )}
                  
                  {selectedRecord.prescriptions?.length > 0 && (
                    <div className="detail-item">
                      <label>Prescriptions</label>
                      <ul>
                        {selectedRecord.prescriptions.map((prescription, index) => (
                          <li key={index}>{prescription}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedRecord.notes && (
                    <div className="detail-item">
                      <label>Notes</label>
                      <span>{selectedRecord.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="doctor-records">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading medical records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-records">
      {/* Header */}
      <div className="records-header">
        <div className="header-content">
          <h1 className="header-title">Medical Records</h1>
          <p className="header-subtitle">Manage your patient medical records and documentation</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={openCreateModal}
          >
            <Plus size={16} />
            Create Record
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <FileText size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-title">Total Records</h3>
              <p className="stat-value">{stats.totalRecords}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Activity size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-title">This Month</h3>
              <p className="stat-value">{stats.periodRecords}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <User size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-title">Unique Patients</h3>
              <p className="stat-value">{stats.uniquePatients}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <h3 className="stat-title">Most Common</h3>
              <p className="stat-value">{stats.commonDiagnoses?.[0]?._id || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="search-input">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search records..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <input
            type="text"
            placeholder="Patient ID"
            value={filters.patientId}
            onChange={(e) => handleFilterChange('patientId', e.target.value)}
          />
          
          <input
            type="text"
            placeholder="Diagnosis"
            value={filters.diagnosis}
            onChange={(e) => handleFilterChange('diagnosis', e.target.value)}
          />
          
          <input
            type="date"
            placeholder="From Date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
          />
          
          <input
            type="date"
            placeholder="To Date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
          />
          
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            <option value="visitDate">Sort by Date</option>
            <option value="diagnosis">Sort by Diagnosis</option>
            <option value="createdAt">Sort by Created</option>
          </select>
          
          <select
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {/* Records List */}
      <div className="records-content">
        {records.length > 0 ? (
          <div className="records-grid">
            {records.map((record) => (
              <RecordCard key={record._id} record={record} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FileText size={64} />
            <h3>No Medical Records Found</h3>
            <p>No records match your current filters</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && <RecordForm />}
      {showUpdateModal && <RecordForm isUpdate={true} />}
      {showDetailsModal && <DetailsModal />}
    </div>
  );
};

export default DoctorRecords;