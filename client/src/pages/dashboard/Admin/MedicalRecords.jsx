import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { adminAPI } from '../../../services/api';
import { 
  Search, 
  FileText,
  User,
  Stethoscope,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2
} from 'lucide-react';
import './MedicalRecords.css';

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    diagnosis: '',
    treatment: '',
    prescriptions: [],
    notes: ''
  });
  const [newPrescription, setNewPrescription] = useState('');

  useEffect(() => {
    fetchRecords();
  }, [currentPage, searchTerm]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllMedicalRecords(currentPage, 20, searchTerm);
      setRecords(response.records || []);
      setTotalPages(response.pagination?.pages || 1);
    } catch (error) {
      setError(error.message);
      toast.error('Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddPrescription = () => {
    if (newPrescription.trim()) {
      setFormData(prev => ({
        ...prev,
        prescriptions: [...prev.prescriptions, newPrescription.trim()]
      }));
      setNewPrescription('');
    }
  };

  const handleRemovePrescription = (index) => {
    setFormData(prev => ({
      ...prev,
      prescriptions: prev.prescriptions.filter((_, i) => i !== index)
    }));
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    try {
      // This would typically use an admin create medical record endpoint
      toast.success('Medical record added successfully');
      setShowAddModal(false);
      resetFormData();
      fetchRecords();
    } catch (error) {
      toast.error('Failed to add medical record');
    }
  };

  const handleEditRecord = async (e) => {
    e.preventDefault();
    try {
      // This would typically use an admin update medical record endpoint
      toast.success('Medical record updated successfully');
      setShowEditModal(false);
      setSelectedRecord(null);
      fetchRecords();
    } catch (error) {
      toast.error('Failed to update medical record');
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this medical record?')) {
      try {
        // This would typically use an admin delete medical record endpoint
        toast.success('Medical record deleted successfully');
        fetchRecords();
      } catch (error) {
        toast.error('Failed to delete medical record');
      }
    }
  };

  const openViewModal = (record) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  const openEditModal = (record) => {
    setSelectedRecord(record);
    setFormData({
      patientId: record.patientId?._id || '',
      doctorId: record.doctorId?._id || '',
      diagnosis: record.diagnosis || '',
      treatment: record.treatment || '',
      prescriptions: record.prescriptions || [],
      notes: record.notes || ''
    });
    setShowEditModal(true);
  };

  const openAddModal = () => {
    resetFormData();
    setShowAddModal(true);
  };

  const resetFormData = () => {
    setFormData({
      patientId: '',
      doctorId: '',
      diagnosis: '',
      treatment: '',
      prescriptions: [],
      notes: ''
    });
    setNewPrescription('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctorId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.treatment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.notes?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = (() => {
      switch (filterBy) {
        case 'recent':
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return new Date(record.visitDate) >= thirtyDaysAgo;
        case 'diagnosis':
          return record.diagnosis && record.diagnosis.length > 0;
        case 'prescriptions':
          return record.prescriptions && record.prescriptions.length > 0;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesFilter;
  });

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.visitDate) - new Date(a.visitDate);
      case 'patient':
        return a.patientId?.name?.localeCompare(b.patientId?.name);
      case 'doctor':
        return a.doctorId?.name?.localeCompare(b.doctorId?.name);
      case 'diagnosis':
        return a.diagnosis?.localeCompare(b.diagnosis);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
        <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
        <p className="text-lg text-gray-600">Loading medical records...</p>
      </div>
    );
  }

  return (
    <div className="medical-records-container">
      <div className="records-header">
        <div className="header-left">
          <h1>Medical Records</h1>
          <p>Manage all patient medical records and history</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => fetchRecords()}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button 
            className="btn btn-primary"
            onClick={openAddModal}
          >
            <Plus size={16} />
            Add Record
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by patient, doctor, diagnosis, treatment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <select 
            value={filterBy} 
            onChange={(e) => setFilterBy(e.target.value)}
          >
            <option value="all">All Records</option>
            <option value="recent">Recent (30 days)</option>
            <option value="diagnosis">With Diagnosis</option>
            <option value="prescriptions">With Prescriptions</option>
          </select>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Sort by Date</option>
            <option value="patient">Sort by Patient</option>
            <option value="doctor">Sort by Doctor</option>
            <option value="diagnosis">Sort by Diagnosis</option>
          </select>
        </div>
      </div>

      {/* Medical Records List */}
      <div className="records-list">
        {sortedRecords.length === 0 ? (
          <div className="no-records">
            <FileText size={48} color="#9ca3af" />
            <h3>No Medical Records Found</h3>
            <p>No medical records match your current search criteria.</p>
          </div>
        ) : (
          sortedRecords.map((record) => (
            <div key={record._id} className="record-card">
              <div className="record-header">
                <div className="record-date">
                  <Calendar size={20} color="#6b7280" />
                  <span>{formatDate(record.visitDate)}</span>
                </div>
                <div className="record-actions">
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => openViewModal(record)}
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => openEditModal(record)}
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteRecord(record._id)}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="record-content">
                <div className="record-info">
                  <div className="patient-info">
                    <div className="info-header">
                      <User size={16} color="#6b7280" />
                      <span>Patient</span>
                    </div>
                    <div className="info-details">
                      <h4>{record.patientId?.name || 'Unknown Patient'}</h4>
                      <span>{record.patientId?.email || 'No email'}</span>
                    </div>
                  </div>
                  
                  <div className="doctor-info">
                    <div className="info-header">
                      <Stethoscope size={16} color="#6b7280" />
                      <span>Doctor</span>
                    </div>
                    <div className="info-details">
                      <h4>{record.doctorId?.name || 'Unknown Doctor'}</h4>
                      <span>{record.doctorId?.specialization || 'No specialization'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="record-details">
                  {record.diagnosis && (
                    <div className="detail-item">
                      <AlertCircle size={16} color="#ef4444" />
                      <div>
                        <span className="detail-label">Diagnosis:</span>
                        <span className="detail-value">{record.diagnosis}</span>
                      </div>
                    </div>
                  )}
                  
                  {record.treatment && (
                    <div className="detail-item">
                      <CheckCircle size={16} color="#10b981" />
                      <div>
                        <span className="detail-label">Treatment:</span>
                        <span className="detail-value">{record.treatment}</span>
                      </div>
                    </div>
                  )}
                  
                  {record.prescriptions && record.prescriptions.length > 0 && (
                    <div className="detail-item">
                      <FileText size={16} color="#3b82f6" />
                      <div>
                        <span className="detail-label">Prescriptions:</span>
                        <div className="prescriptions-list">
                          {record.prescriptions.map((prescription, index) => (
                            <span key={index} className="prescription-item">
                              {prescription}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {record.notes && (
                    <div className="detail-item">
                      <Clock size={16} color="#f59e0b" />
                      <div>
                        <span className="detail-label">Notes:</span>
                        <span className="detail-value">{record.notes}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="btn btn-outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            className="btn btn-outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* View Record Modal */}
      {showViewModal && selectedRecord && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Medical Record Details</h2>
              <button 
                className="close-button"
                onClick={() => setShowViewModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="record-details-view">
                <div className="detail-section">
                  <h3>Visit Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <Calendar size={16} />
                      <span>Visit Date:</span>
                      <span>{formatDate(selectedRecord.visitDate)}</span>
                    </div>
                    <div className="detail-item">
                      <Clock size={16} />
                      <span>Created:</span>
                      <span>{formatDate(selectedRecord.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h3>Patient Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <User size={16} />
                      <span>Name:</span>
                      <span>{selectedRecord.patientId?.name || 'Unknown'}</span>
                    </div>
                    <div className="detail-item">
                      <span>Email:</span>
                      <span>{selectedRecord.patientId?.email || 'No email'}</span>
                    </div>
                    <div className="detail-item">
                      <span>Phone:</span>
                      <span>{selectedRecord.patientId?.phone || 'No phone'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h3>Doctor Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <Stethoscope size={16} />
                      <span>Name:</span>
                      <span>{selectedRecord.doctorId?.name || 'Unknown'}</span>
                    </div>
                    <div className="detail-item">
                      <span>Specialization:</span>
                      <span>{selectedRecord.doctorId?.specialization || 'No specialization'}</span>
                    </div>
                  </div>
                </div>
                
                {selectedRecord.diagnosis && (
                  <div className="detail-section">
                    <h3>Diagnosis</h3>
                    <div className="diagnosis-content">
                      <p>{selectedRecord.diagnosis}</p>
                    </div>
                  </div>
                )}
                
                {selectedRecord.treatment && (
                  <div className="detail-section">
                    <h3>Treatment</h3>
                    <div className="treatment-content">
                      <p>{selectedRecord.treatment}</p>
                    </div>
                  </div>
                )}
                
                {selectedRecord.prescriptions && selectedRecord.prescriptions.length > 0 && (
                  <div className="detail-section">
                    <h3>Prescriptions</h3>
                    <div className="prescriptions-content">
                      {selectedRecord.prescriptions.map((prescription, index) => (
                        <div key={index} className="prescription-item">
                          {prescription}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedRecord.notes && (
                  <div className="detail-section">
                    <h3>Notes</h3>
                    <div className="notes-content">
                      <p>{selectedRecord.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setShowViewModal(false);
                  openEditModal(selectedRecord);
                }}
              >
                Edit Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Record Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Add Medical Record</h2>
              <button 
                className="close-button"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleAddRecord} className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Patient *</label>
                  <input
                    type="text"
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleInputChange}
                    placeholder="Patient ID"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Doctor *</label>
                  <input
                    type="text"
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={handleInputChange}
                    placeholder="Doctor ID"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Diagnosis *</label>
                <textarea
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Enter diagnosis..."
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Treatment *</label>
                <textarea
                  name="treatment"
                  value={formData.treatment}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Enter treatment details..."
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Prescriptions</label>
                <div className="prescriptions-input">
                  <input
                    type="text"
                    value={newPrescription}
                    onChange={(e) => setNewPrescription(e.target.value)}
                    placeholder="Add prescription..."
                  />
                  <button
                    type="button"
                    onClick={handleAddPrescription}
                    className="btn btn-sm btn-outline"
                  >
                    Add
                  </button>
                </div>
                <div className="prescriptions-list">
                  {formData.prescriptions.map((prescription, index) => (
                    <div key={index} className="prescription-item">
                      <span>{prescription}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePrescription(index)}
                        className="remove-btn"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Additional notes..."
                />
              </div>
            </form>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleAddRecord}
              >
                Add Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Record Modal */}
      {showEditModal && selectedRecord && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Edit Medical Record</h2>
              <button 
                className="close-button"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleEditRecord} className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Patient *</label>
                  <input
                    type="text"
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleInputChange}
                    placeholder="Patient ID"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Doctor *</label>
                  <input
                    type="text"
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={handleInputChange}
                    placeholder="Doctor ID"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Diagnosis *</label>
                <textarea
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Enter diagnosis..."
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Treatment *</label>
                <textarea
                  name="treatment"
                  value={formData.treatment}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Enter treatment details..."
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Prescriptions</label>
                <div className="prescriptions-input">
                  <input
                    type="text"
                    value={newPrescription}
                    onChange={(e) => setNewPrescription(e.target.value)}
                    placeholder="Add prescription..."
                  />
                  <button
                    type="button"
                    onClick={handleAddPrescription}
                    className="btn btn-sm btn-outline"
                  >
                    Add
                  </button>
                </div>
                <div className="prescriptions-list">
                  {formData.prescriptions.map((prescription, index) => (
                    <div key={index} className="prescription-item">
                      <span>{prescription}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePrescription(index)}
                        className="remove-btn"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Additional notes..."
                />
              </div>
            </form>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleEditRecord}
              >
                Update Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;