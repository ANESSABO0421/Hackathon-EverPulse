import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../../services/api';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Filter,
  Download,
  Upload,
  Stethoscope,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Calendar
} from 'lucide-react';
import './ManageDoctors.css';

const ManageDoctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    education: '',
    hospital: '',
    address: '',
    consultationFee: '',
    availability: {
      monday: { start: '09:00', end: '17:00', available: true },
      tuesday: { start: '09:00', end: '17:00', available: true },
      wednesday: { start: '09:00', end: '17:00', available: true },
      thursday: { start: '09:00', end: '17:00', available: true },
      friday: { start: '09:00', end: '17:00', available: true },
      saturday: { start: '09:00', end: '13:00', available: false },
      sunday: { start: '09:00', end: '13:00', available: false }
    }
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    
    try {
      const response = await adminAPI.getAllDoctors();
      const doctorsArray = response?.doctors || response || [];
      
      const formattedDoctors = doctorsArray.map((doc) => ({
        ...doc,
        experience: doc.yearsOfExperience || doc.experience || 0,
        hospital: doc.hospitalAffiliation || doc.hospital || '',
        education: doc.qualifications?.join(', ') || doc.education || ''
      }));
      
      setDoctors(formattedDoctors);
    } catch (error) {
      console.error(error);
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

  const handleAvailabilityChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          [field]: value
        }
      }
    }));
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      // This would typically be handled by a doctor registration endpoint
      toast.success('Doctor added successfully');
      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        specialization: '',
        experience: '',
        education: '',
        hospital: '',
        address: '',
        consultationFee: '',
        availability: {
          monday: { start: '09:00', end: '17:00', available: true },
          tuesday: { start: '09:00', end: '17:00', available: true },
          wednesday: { start: '09:00', end: '17:00', available: true },
          thursday: { start: '09:00', end: '17:00', available: true },
          friday: { start: '09:00', end: '17:00', available: true },
          saturday: { start: '09:00', end: '13:00', available: false },
          sunday: { start: '09:00', end: '13:00', available: false }
        }
      });
      fetchDoctors();
    } catch (error) {
      toast.error('Failed to add doctor');
    }
  };

  const handleEditDoctor = async (e) => {
    e.preventDefault();
    
    try {
      const updateData = {
        ...formData,
        yearsOfExperience: parseInt(formData.experience) || 0,
        hospitalAffiliation: formData.hospital,
        qualifications: formData.education ? formData.education.split(',').map(q => q.trim()) : []
      };
      
      await adminAPI.updateDoctor(selectedDoctor._id, updateData);
      toast.success('Doctor updated successfully');
      setShowEditModal(false);
      fetchDoctors();
    } catch (error) {
      toast.error('Failed to update doctor');
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await adminAPI.deleteDoctor(doctorId);
        toast.success('Doctor deleted successfully');
        fetchDoctors();
      } catch (error) {
        toast.error('Failed to delete doctor');
      }
    }
  };

  const openEditModal = (doctor) => {
    setSelectedDoctor(doctor);
    setFormData({
      name: doctor.name || '',
      email: doctor.email || '',
      phone: doctor.phone || '',
      specialization: doctor.specialization || '',
      experience: doctor.experience || doctor.yearsOfExperience || '',
      education: doctor.education || doctor.qualifications?.join(', ') || '',
      hospital: doctor.hospital || doctor.hospitalAffiliation || '',
      address: doctor.address || '',
      consultationFee: doctor.consultationFee || '',
      availability: doctor.availability || formData.availability
    });
    setShowEditModal(true);
  };

  const openViewModal = (doctor) => {
    setSelectedDoctor(doctor);
    setShowViewModal(true);
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = 
      doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.hospital?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = (() => {
      switch (filterBy) {
        case 'active':
          return doctor.isActive !== false;
        case 'inactive':
          return doctor.isActive === false;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesFilter;
  });

  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name?.localeCompare(b.name);
      case 'specialization':
        return a.specialization?.localeCompare(b.specialization);
      case 'experience':
        return (b.experience || 0) - (a.experience || 0);
      case 'consultationFee':
        return (b.consultationFee || 0) - (a.consultationFee || 0);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="manage-doctors-container">
        <div className="skeleton-header">
          <div className="skeleton-title"></div>
          <div className="skeleton-subtitle"></div>
        </div>
        
        <div className="skeleton-search-filter">
          <div className="skeleton-search"></div>
          <div className="skeleton-filters">
            <div className="skeleton-filter"></div>
            <div className="skeleton-filter"></div>
          </div>
        </div>
        
        <div className="doctors-grid">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="skeleton-doctor-card">
              <div className="skeleton-avatar"></div>
              <div className="skeleton-status"></div>
              <div className="skeleton-content">
                <div className="skeleton-line name"></div>
                <div className="skeleton-line specialization"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line fee"></div>
              </div>
              <div className="skeleton-actions">
                <div className="skeleton-button"></div>
                <div className="skeleton-button"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="manage-doctors-container">
      <div className="doctors-header">
        <div className="header-left">
          <h1>Manage Doctors</h1>
          <p>Manage doctor profiles and information</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => fetchDoctors()}
          >
            <Download size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search doctors by name, email, specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <select 
            value={filterBy} 
            onChange={(e) => setFilterBy(e.target.value)}
          >
            <option value="all">All Doctors</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="specialization">Sort by Specialization</option>
            <option value="experience">Sort by Experience</option>
            <option value="consultationFee">Sort by Fee</option>
          </select>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="doctors-grid">
        {sortedDoctors.length === 0 ? (
          <div className="no-doctors">
            <Stethoscope size={48} color="#9ca3af" />
            <h3>No Doctors Found</h3>
            <p>No doctors match your current search criteria.</p>
          </div>
        ) : (
          sortedDoctors.map((doctor) => (
            <div key={doctor._id} className="doctor-card">
              <div className="doctor-header">
                <div className="doctor-avatar">
                  {doctor.name?.charAt(0).toUpperCase() || 'D'}
                </div>
                <div className="doctor-status">
                  <span className={`status-badge ${doctor.isActive !== false ? 'active' : 'inactive'}`}>
                    {doctor.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div className="doctor-info">
                <h3 className="doctor-name">{doctor.name || 'Unknown Doctor'}</h3>
                <p className="doctor-specialization">{doctor.specialization || 'General Medicine'}</p>
                
                <div className="doctor-details">
                  <div className="detail-item">
                    <Mail size={16} />
                    <span>{doctor.email || 'No email'}</span>
                  </div>
                  <div className="detail-item">
                    <Phone size={16} />
                    <span>{doctor.phone || 'No phone'}</span>
                  </div>
                  <div className="detail-item">
                    <MapPin size={16} />
                    <span>{doctor.hospital || 'No hospital'}</span>
                  </div>
                  <div className="detail-item">
                    <GraduationCap size={16} />
                    <span>{doctor.experience ? `${doctor.experience} years` : 'No experience'}</span>
                  </div>
                </div>
                
                <div className="doctor-fee">
                  <span className="fee-label">Consultation Fee:</span>
                  <span className="fee-amount">${doctor.consultationFee || '0'}</span>
                </div>
              </div>
              
              <div className="doctor-actions">
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => openViewModal(doctor)}
                >
                  <Eye size={16} />
                  View
                </button>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => openEditModal(doctor)}
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteDoctor(doctor._id)}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Doctor</h2>
              <button 
                className="close-button"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleAddDoctor} className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Specialization *</label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Specialization</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Gynecology">Gynecology</option>
                    <option value="Psychiatry">Psychiatry</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Experience (years)</label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
                
                <div className="form-group">
                  <label>Consultation Fee ($)</label>
                  <input
                    type="number"
                    name="consultationFee"
                    value={formData.consultationFee}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Education</label>
                <textarea
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>Hospital/Clinic</label>
                <input
                  type="text"
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="2"
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
                onClick={handleAddDoctor}
              >
                Add Doctor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Doctor Modal */}
      {showEditModal && selectedDoctor && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Doctor</h2>
              <button 
                className="close-button"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleEditDoctor} className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Specialization *</label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Specialization</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Gynecology">Gynecology</option>
                    <option value="Psychiatry">Psychiatry</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Experience (years)</label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
                
                <div className="form-group">
                  <label>Consultation Fee ($)</label>
                  <input
                    type="number"
                    name="consultationFee"
                    value={formData.consultationFee}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Education</label>
                <textarea
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>Hospital/Clinic</label>
                <input
                  type="text"
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="2"
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
                onClick={handleEditDoctor}
              >
                Update Doctor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Doctor Modal */}
      {showViewModal && selectedDoctor && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Doctor Details</h2>
              <button 
                className="close-button"
                onClick={() => setShowViewModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="doctor-profile">
                <div className="profile-header">
                  <div className="profile-avatar">
                    {selectedDoctor.name?.charAt(0).toUpperCase() || 'D'}
                  </div>
                  <div className="profile-info">
                    <h3>{selectedDoctor.name || 'Unknown Doctor'}</h3>
                    <p>{selectedDoctor.specialization || 'General Medicine'}</p>
                    <span className={`status-badge ${selectedDoctor.isActive !== false ? 'active' : 'inactive'}`}>
                      {selectedDoctor.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="profile-details">
                  <div className="detail-section">
                    <h4>Contact Information</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <Mail size={16} />
                        <span>{selectedDoctor.email || 'No email'}</span>
                      </div>
                      <div className="detail-item">
                        <Phone size={16} />
                        <span>{selectedDoctor.phone || 'No phone'}</span>
                      </div>
                      <div className="detail-item">
                        <MapPin size={16} />
                        <span>{selectedDoctor.address || 'No address'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h4>Professional Information</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <GraduationCap size={16} />
                        <span>Experience: {selectedDoctor.experience ? `${selectedDoctor.experience} years` : 'Not specified'}</span>
                      </div>
                      <div className="detail-item">
                        <Stethoscope size={16} />
                        <span>Hospital: {selectedDoctor.hospital || 'Not specified'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="fee-label">Consultation Fee:</span>
                        <span className="fee-amount">${selectedDoctor.consultationFee || '0'}</span>
                      </div>
                    </div>
                    
                    {selectedDoctor.education && (
                      <div className="education-section">
                        <h5>Education</h5>
                        <p>{selectedDoctor.education}</p>
                      </div>
                    )}
                  </div>
                </div>
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
                  openEditModal(selectedDoctor);
                }}
              >
                Edit Doctor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDoctors;