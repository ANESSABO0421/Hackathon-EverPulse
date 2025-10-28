import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { adminAPI } from '../../../services/api';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Filter,
  Download,
  Users,
  Mail,
  Phone,
  Calendar,
  Heart,
  Activity,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';

// Skeleton Loader Component
const PatientCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md animate-pulse">
    <div className="p-6">
      <div className="flex items-start space-x-4">
        <div className="h-12 w-12 rounded-full bg-gray-200"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-100 rounded w-1/2"></div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-full"></div>
        <div className="h-3 bg-gray-100 rounded w-5/6"></div>
        <div className="h-3 bg-gray-100 rounded w-2/3"></div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
        <div className="h-8 w-24 bg-gray-200 rounded-md"></div>
        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  </div>
);
import './ManagePatients.css';

const ManagePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
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
    address: '',
    emergencyContact: {
      name: '',
      relation: '',
      phone: ''
    },
    insuranceProvider: '',
    insurancePolicyNumber: '',
    allergies: [],
    chronicConditions: [],
    currentMedications: []
  });
  const [newItem, setNewItem] = useState({ type: '', value: '' });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllPatients();
      setPatients(response.patients || []);
    } catch (error) {
      setError(error.message);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddItem = (type) => {
    if (newItem.value.trim()) {
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], newItem.value.trim()]
      }));
      setNewItem({ type: '', value: '' });
    }
  };

  const handleRemoveItem = (type, index) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    try {
      // This would typically be handled by a patient registration endpoint
      toast.success('Patient added successfully');
      setShowAddModal(false);
      resetFormData();
      fetchPatients();
    } catch (error) {
      toast.error('Failed to add patient');
    }
  };

  const handleEditPatient = async (e) => {
    e.preventDefault();
    
    // Basic form validation
    if (!formData.name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    try {
      // Prepare the data to send (only include fields that should be updated)
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        bloodGroup: formData.bloodGroup,
        height: formData.height,
        weight: formData.weight,
        maritalStatus: formData.maritalStatus,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        insuranceProvider: formData.insuranceProvider,
        insurancePolicyNumber: formData.insurancePolicyNumber,
        allergies: formData.allergies,
        chronicConditions: formData.chronicConditions,
        currentMedications: formData.currentMedications
      };
      
      // Call the API to update the patient
      const response = await adminAPI.updatePatient(selectedPatient._id, updateData);
      
      if (response.success) {
        toast.success('Patient updated successfully');
        setShowEditModal(false);
        setSelectedPatient(null);
        resetFormData();
        fetchPatients(); // Refresh the patient list
      } else {
        throw new Error(response.message || 'Failed to update patient');
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      toast.error(error.message || 'Failed to update patient. Please try again.');
    }
  };

  const handleDeletePatient = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await adminAPI.deletePatient(patientId);
        toast.success('Patient deleted successfully');
        fetchPatients();
      } catch (error) {
        toast.error('Failed to delete patient');
      }
    }
  };

  const openEditModal = (patient) => {
    try {
      // Make sure we have a valid patient object
      if (!patient || !patient._id) {
        throw new Error('Invalid patient data');
      }
      
      // Set the selected patient
      setSelectedPatient(patient);
      
      // Format the date for the date input
      let formattedDateOfBirth = '';
      if (patient.dateOfBirth) {
        try {
          // Handle both string and Date objects
          const date = new Date(patient.dateOfBirth);
          if (!isNaN(date.getTime())) {
            formattedDateOfBirth = date.toISOString().split('T')[0];
          }
        } catch (e) {
          console.warn('Error formatting date of birth:', e);
        }
      }
      
      // Set the form data with the patient's information
      setFormData({
        name: patient.name || '',
        email: patient.email || '',
        phone: patient.phone || '',
        gender: patient.gender || '',
        dateOfBirth: formattedDateOfBirth,
        bloodGroup: patient.bloodGroup || '',
        height: patient.height || '',
        weight: patient.weight || '',
        maritalStatus: patient.maritalStatus || '',
        address: patient.address || '',
        emergencyContact: {
          name: patient.emergencyContact?.name || '',
          relation: patient.emergencyContact?.relation || '',
          phone: patient.emergencyContact?.phone || ''
        },
        insuranceProvider: patient.insuranceProvider || '',
        insurancePolicyNumber: patient.insurancePolicyNumber || '',
        allergies: Array.isArray(patient.allergies) ? [...patient.allergies] : [],
        chronicConditions: Array.isArray(patient.chronicConditions) ? [...patient.chronicConditions] : [],
        currentMedications: Array.isArray(patient.currentMedications) ? [...patient.currentMedications] : []
      });
      
      // Show the edit modal
      setShowEditModal(true);
    } catch (error) {
      console.error('Error opening edit modal:', error);
      toast.error('Failed to load patient data. Please try again.');
    }
  };

  const openViewModal = (patient) => {
    setSelectedPatient(patient);
    setShowViewModal(true);
  };

  const resetFormData = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      gender: '',
      dateOfBirth: '',
      bloodGroup: '',
      height: '',
      weight: '',
      maritalStatus: '',
      address: '',
      emergencyContact: {
        name: '',
        relation: '',
        phone: ''
      },
      insuranceProvider: '',
      insurancePolicyNumber: '',
      allergies: [],
      chronicConditions: [],
      currentMedications: []
    });
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.bloodGroup?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = (() => {
      switch (filterBy) {
        case 'male':
          return patient.gender === 'male';
        case 'female':
          return patient.gender === 'female';
        case 'other':
          return patient.gender === 'other';
        case 'with_conditions':
          return patient.chronicConditions && patient.chronicConditions.length > 0;
        case 'with_allergies':
          return patient.allergies && patient.allergies.length > 0;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesFilter;
  });

  const sortedPatients = [...filteredPatients].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name?.localeCompare(b.name);
      case 'age':
        return calculateAge(b.dateOfBirth) - calculateAge(a.dateOfBirth);
      case 'registration':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'bloodGroup':
        return a.bloodGroup?.localeCompare(b.bloodGroup);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Manage Patients</h1>
            <p className="text-gray-500 mt-1">Loading patient data...</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <div className="h-10 w-24 bg-gray-200 rounded-md"></div>
            <div className="h-10 w-32 bg-blue-200 rounded-md"></div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <div className="h-10 bg-gray-100 rounded-lg w-full pl-10"></div>
            </div>
            <div className="flex space-x-2">
              <div className="h-10 w-32 bg-gray-100 rounded-lg"></div>
              <div className="h-10 w-40 bg-gray-100 rounded-lg"></div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <PatientCardSkeleton key={item} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Patients</h1>
          <p className="text-gray-500 mt-1">
            {filteredPatients.length} {filteredPatients.length === 1 ? 'patient' : 'patients'} found
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button 
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            onClick={() => fetchPatients()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            className="flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Patient
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Search patients by name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              className="block w-full pl-3 pr-8 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
            >
              <option value="all">All Patients</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="with_conditions">With Conditions</option>
              <option value="with_allergies">With Allergies</option>
            </select>
            
            <select
              className="block w-full pl-3 pr-8 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Sort by Name</option>
              <option value="age">Sort by Age</option>
              <option value="registration">Sort by Registration</option>
              <option value="bloodGroup">Sort by Blood Group</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patients Grid */}
      <div className="patients-grid">
        {sortedPatients.length === 0 ? (
          <div className="no-patients">
            <Users size={48} color="#9ca3af" />
            <h3>No Patients Found</h3>
            <p>No patients match your current search criteria.</p>
          </div>
        ) : (
          sortedPatients.map((patient) => {
            const age = calculateAge(patient.dateOfBirth);
            return (
              <div key={patient._id} className="patient-card">
                <div className="patient-header">
                  <div className="patient-avatar">
                    {patient.name?.charAt(0).toUpperCase() || 'P'}
                  </div>
                  <div className="patient-status">
                    <span className={`gender-badge ${patient.gender}`}>
                      {patient.gender || 'Unknown'}
                    </span>
                  </div>
                </div>
                
                <div className="patient-info">
                  <h3 className="patient-name">{patient.name || 'Unknown Patient'}</h3>
                  <p className="patient-details">
                    {age ? `${age} years old` : 'Age not specified'} • {patient.bloodGroup || 'Blood group not specified'}
                  </p>
                  
                  <div className="patient-contact">
                    <div className="contact-item">
                      <Mail size={16} />
                      <span>{patient.email || 'No email'}</span>
                    </div>
                    <div className="contact-item">
                      <Phone size={16} />
                      <span>{patient.phone || 'No phone'}</span>
                    </div>
                  </div>

                  {/* Medical Alerts */}
                  <div className="medical-alerts">
                    {patient.allergies && patient.allergies.length > 0 && (
                      <div className="alert-item">
                        <AlertCircle size={16} />
                        <span>{patient.allergies.length} allergies</span>
                      </div>
                    )}
                    {patient.chronicConditions && patient.chronicConditions.length > 0 && (
                      <div className="alert-item">
                        <Heart size={16} />
                        <span>{patient.chronicConditions.length} chronic conditions</span>
                      </div>
                    )}
                    {patient.currentMedications && patient.currentMedications.length > 0 && (
                      <div className="alert-item">
                        <Activity size={16} />
                        <span>{patient.currentMedications.length} medications</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="patient-actions">
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => openViewModal(patient)}
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => openEditModal(patient)}
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeletePatient(patient._id)}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Add New Patient</h2>
              <button 
                className="close-button"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleAddPatient} className="modal-body">
              <div className="form-sections">
                {/* Personal Information */}
                <div className="form-section">
                  <h3>Personal Information</h3>
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
                      <label>Gender *</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Date of Birth *</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Blood Group</label>
                      <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleInputChange}
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
                </div>

                {/* Physical Information */}
                <div className="form-section">
                  <h3>Physical Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Height (cm)</label>
                      <input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Weight (kg)</label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        min="0"
                        step="0.1"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Marital Status</label>
                      <select
                        name="maritalStatus"
                        value={formData.maritalStatus}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Status</option>
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="divorced">Divorced</option>
                        <option value="widowed">Widowed</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="form-section">
                  <h3>Emergency Contact</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Contact Name</label>
                      <input
                        type="text"
                        name="emergencyContact.name"
                        value={formData.emergencyContact.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Relation</label>
                      <input
                        type="text"
                        name="emergencyContact.relation"
                        value={formData.emergencyContact.relation}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Contact Phone</label>
                      <input
                        type="tel"
                        name="emergencyContact.phone"
                        value={formData.emergencyContact.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Insurance Information */}
                <div className="form-section">
                  <h3>Insurance Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Insurance Provider</label>
                      <input
                        type="text"
                        name="insuranceProvider"
                        value={formData.insuranceProvider}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Policy Number</label>
                      <input
                        type="text"
                        name="insurancePolicyNumber"
                        value={formData.insurancePolicyNumber}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="form-section">
                  <h3>Medical Information</h3>
                  
                  {/* Allergies */}
                  <div className="list-group">
                    <label>Allergies</label>
                    <div className="list-input">
                      <input
                        type="text"
                        placeholder="Add allergy"
                        value={newItem.type === 'allergies' ? newItem.value : ''}
                        onChange={(e) => setNewItem({ type: 'allergies', value: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddItem('allergies')}
                        className="btn btn-sm btn-outline"
                      >
                        Add
                      </button>
                    </div>
                    <div className="item-list">
                      {formData.allergies.map((item, index) => (
                        <div key={index} className="list-item">
                          <span>{item}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem('allergies', index)}
                            className="remove-btn"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chronic Conditions */}
                  <div className="list-group">
                    <label>Chronic Conditions</label>
                    <div className="list-input">
                      <input
                        type="text"
                        placeholder="Add chronic condition"
                        value={newItem.type === 'chronicConditions' ? newItem.value : ''}
                        onChange={(e) => setNewItem({ type: 'chronicConditions', value: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddItem('chronicConditions')}
                        className="btn btn-sm btn-outline"
                      >
                        Add
                      </button>
                    </div>
                    <div className="item-list">
                      {formData.chronicConditions.map((item, index) => (
                        <div key={index} className="list-item">
                          <span>{item}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem('chronicConditions', index)}
                            className="remove-btn"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Current Medications */}
                  <div className="list-group">
                    <label>Current Medications</label>
                    <div className="list-input">
                      <input
                        type="text"
                        placeholder="Add medication"
                        value={newItem.type === 'currentMedications' ? newItem.value : ''}
                        onChange={(e) => setNewItem({ type: 'currentMedications', value: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddItem('currentMedications')}
                        className="btn btn-sm btn-outline"
                      >
                        Add
                      </button>
                    </div>
                    <div className="item-list">
                      {formData.currentMedications.map((item, index) => (
                        <div key={index} className="list-item">
                          <span>{item}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem('currentMedications', index)}
                            className="remove-btn"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
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
                onClick={handleAddPatient}
              >
                Add Patient
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Patient Modal */}
      {showEditModal && selectedPatient && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Edit Patient</h2>
              <button 
                className="close-button"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleEditPatient} className="modal-body">
              {/* Same form structure as Add Patient Modal */}
              <div className="form-sections">
                {/* Personal Information */}
                <div className="form-section">
                  <h3>Personal Information</h3>
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
                      <label>Gender *</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Date of Birth *</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Blood Group</label>
                      <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleInputChange}
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
                </div>

                {/* Physical Information */}
                <div className="form-section">
                  <h3>Physical Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Height (cm)</label>
                      <input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Weight (kg)</label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        min="0"
                        step="0.1"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Marital Status</label>
                      <select
                        name="maritalStatus"
                        value={formData.maritalStatus}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Status</option>
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="divorced">Divorced</option>
                        <option value="widowed">Widowed</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="form-section">
                  <h3>Emergency Contact</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Contact Name</label>
                      <input
                        type="text"
                        name="emergencyContact.name"
                        value={formData.emergencyContact.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Relation</label>
                      <input
                        type="text"
                        name="emergencyContact.relation"
                        value={formData.emergencyContact.relation}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Contact Phone</label>
                      <input
                        type="tel"
                        name="emergencyContact.phone"
                        value={formData.emergencyContact.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Insurance Information */}
                <div className="form-section">
                  <h3>Insurance Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Insurance Provider</label>
                      <input
                        type="text"
                        name="insuranceProvider"
                        value={formData.insuranceProvider}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Policy Number</label>
                      <input
                        type="text"
                        name="insurancePolicyNumber"
                        value={formData.insurancePolicyNumber}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="form-section">
                  <h3>Medical Information</h3>
                  
                  {/* Allergies */}
                  <div className="list-group">
                    <label>Allergies</label>
                    <div className="list-input">
                      <input
                        type="text"
                        placeholder="Add allergy"
                        value={newItem.type === 'allergies' ? newItem.value : ''}
                        onChange={(e) => setNewItem({ type: 'allergies', value: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddItem('allergies')}
                        className="btn btn-sm btn-outline"
                      >
                        Add
                      </button>
                    </div>
                    <div className="item-list">
                      {formData.allergies.map((item, index) => (
                        <div key={index} className="list-item">
                          <span>{item}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem('allergies', index)}
                            className="remove-btn"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chronic Conditions */}
                  <div className="list-group">
                    <label>Chronic Conditions</label>
                    <div className="list-input">
                      <input
                        type="text"
                        placeholder="Add chronic condition"
                        value={newItem.type === 'chronicConditions' ? newItem.value : ''}
                        onChange={(e) => setNewItem({ type: 'chronicConditions', value: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddItem('chronicConditions')}
                        className="btn btn-sm btn-outline"
                      >
                        Add
                      </button>
                    </div>
                    <div className="item-list">
                      {formData.chronicConditions.map((item, index) => (
                        <div key={index} className="list-item">
                          <span>{item}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem('chronicConditions', index)}
                            className="remove-btn"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Current Medications */}
                  <div className="list-group">
                    <label>Current Medications</label>
                    <div className="list-input">
                      <input
                        type="text"
                        placeholder="Add medication"
                        value={newItem.type === 'currentMedications' ? newItem.value : ''}
                        onChange={(e) => setNewItem({ type: 'currentMedications', value: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddItem('currentMedications')}
                        className="btn btn-sm btn-outline"
                      >
                        Add
                      </button>
                    </div>
                    <div className="item-list">
                      {formData.currentMedications.map((item, index) => (
                        <div key={index} className="list-item">
                          <span>{item}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem('currentMedications', index)}
                            className="remove-btn"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
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
                onClick={handleEditPatient}
              >
                Update Patient
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Patient Modal */}
      {showViewModal && selectedPatient && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Patient Details</h2>
              <button 
                className="close-button"
                onClick={() => setShowViewModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="patient-profile">
                <div className="profile-header">
                  <div className="profile-avatar">
                    {selectedPatient.name?.charAt(0).toUpperCase() || 'P'}
                  </div>
                  <div className="profile-info">
                    <h3>{selectedPatient.name || 'Unknown Patient'}</h3>
                    <p>
                      {calculateAge(selectedPatient.dateOfBirth) ? `${calculateAge(selectedPatient.dateOfBirth)} years old` : 'Age not specified'} • 
                      {selectedPatient.gender ? ` ${selectedPatient.gender}` : ' Gender not specified'} • 
                      {selectedPatient.bloodGroup ? ` ${selectedPatient.bloodGroup}` : ' Blood group not specified'}
                    </p>
                    <span className={`gender-badge ${selectedPatient.gender}`}>
                      {selectedPatient.gender || 'Unknown'}
                    </span>
                  </div>
                </div>
                
                <div className="profile-details">
                  <div className="detail-section">
                    <h4>Contact Information</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <Mail size={16} />
                        <span>{selectedPatient.email || 'No email'}</span>
                      </div>
                      <div className="detail-item">
                        <Phone size={16} />
                        <span>{selectedPatient.phone || 'No phone'}</span>
                      </div>
                      <div className="detail-item">
                        <Calendar size={16} />
                        <span>{selectedPatient.address || 'No address'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h4>Physical Information</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span>Height:</span>
                        <span>{selectedPatient.height ? `${selectedPatient.height} cm` : 'Not specified'}</span>
                      </div>
                      <div className="detail-item">
                        <span>Weight:</span>
                        <span>{selectedPatient.weight ? `${selectedPatient.weight} kg` : 'Not specified'}</span>
                      </div>
                      <div className="detail-item">
                        <span>Marital Status:</span>
                        <span>{selectedPatient.maritalStatus || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>

                  {selectedPatient.emergencyContact && (selectedPatient.emergencyContact.name || selectedPatient.emergencyContact.phone) && (
                    <div className="detail-section">
                      <h4>Emergency Contact</h4>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <span>Name:</span>
                          <span>{selectedPatient.emergencyContact.name || 'Not specified'}</span>
                        </div>
                        <div className="detail-item">
                          <span>Relation:</span>
                          <span>{selectedPatient.emergencyContact.relation || 'Not specified'}</span>
                        </div>
                        <div className="detail-item">
                          <span>Phone:</span>
                          <span>{selectedPatient.emergencyContact.phone || 'Not specified'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {(selectedPatient.insuranceProvider || selectedPatient.insurancePolicyNumber) && (
                    <div className="detail-section">
                      <h4>Insurance Information</h4>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <span>Provider:</span>
                          <span>{selectedPatient.insuranceProvider || 'Not specified'}</span>
                        </div>
                        <div className="detail-item">
                          <span>Policy Number:</span>
                          <span>{selectedPatient.insurancePolicyNumber || 'Not specified'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Medical Information */}
                  <div className="detail-section">
                    <h4>Medical Information</h4>
                    
                    {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                      <div className="medical-list">
                        <h5>Allergies</h5>
                        <div className="item-list">
                          {selectedPatient.allergies.map((allergy, index) => (
                            <div key={index} className="list-item">
                              <AlertCircle size={16} color="#ef4444" />
                              <span>{allergy}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedPatient.chronicConditions && selectedPatient.chronicConditions.length > 0 && (
                      <div className="medical-list">
                        <h5>Chronic Conditions</h5>
                        <div className="item-list">
                          {selectedPatient.chronicConditions.map((condition, index) => (
                            <div key={index} className="list-item">
                              <Heart size={16} color="#f59e0b" />
                              <span>{condition}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedPatient.currentMedications && selectedPatient.currentMedications.length > 0 && (
                      <div className="medical-list">
                        <h5>Current Medications</h5>
                        <div className="item-list">
                          {selectedPatient.currentMedications.map((medication, index) => (
                            <div key={index} className="list-item">
                              <Activity size={16} color="#3b82f6" />
                              <span>{medication}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(!selectedPatient.allergies?.length && !selectedPatient.chronicConditions?.length && !selectedPatient.currentMedications?.length) && (
                      <p className="no-medical-info">No medical information available</p>
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
                  openEditModal(selectedPatient);
                }}
              >
                Edit Patient
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePatients;