import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiChevronRight,
  FiCalendar,
  FiUser,
  FiDroplet,
  FiFileText,
  FiLoader
} from 'react-icons/fi';
import { medicalRecordsAPI, patientAPI } from '../../../services/api';
import MedicalRecordForm from '../../../components/MedicalRecordForm';
import MedicalRecordDetails from '../../../components/MedicalRecordDetails';
import './PatientRecords.css';

const PatientRecords = () => {
  const [records, setRecords] = useState([]);
  const [patientProfile, setPatientProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

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

      const fullRecordsResponse = await medicalRecordsAPI.getByPatient(profileResponse.patient._id);
      setRecords(fullRecordsResponse.records || []);
    } catch (err) {
      setError(err.message);
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
        setRecords(records.filter((record) => record._id !== recordId));
        toast.success('Medical record deleted successfully');
      } catch (err) {
        toast.error('Failed to delete medical record');
      }
    }
  };

  const handleFormSubmit = async (recordData) => {
    try {
      if (editingRecord) {
        const updatedRecord = await medicalRecordsAPI.update(editingRecord._id, recordData);
        setRecords((records) =>
          records.map((r) => (r._id === editingRecord._id ? updatedRecord.record : r))
        );
        toast.success('Medical record updated successfully');
      } else {
        toast.info('Only doctors can create new medical records');
      }
      setViewMode('list');
      setEditingRecord(null);
    } catch {
      toast.error('Failed to save medical record');
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedRecord(null);
    setEditingRecord(null);
  };

  const filteredRecords = records.filter((record) => {
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

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

  // Loading Screen
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-600">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="text-5xl mb-4 text-blue-500"
        >
          <FiLoader />
        </motion.div>
        <p className="text-lg font-medium">Loading your medical records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h2 className="text-2xl font-semibold text-red-600 mb-3">Error Loading Records</h2>
        <p className="text-gray-500 mb-5">{error}</p>
        <button
          onClick={fetchPatientData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Health Records</h1>
          <p className="text-gray-500">
            View and manage your complete medical history in one place
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          onClick={handleAddRecord}
        >
          <FiPlus /> Request New Record
        </button>
      </div>

      {/* Patient Summary */}
      {patientProfile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow p-5 mb-6"
        >
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Patient Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-600">
            <div>
              <p className="text-sm font-medium flex items-center gap-2">
                <FiUser /> Name
              </p>
              <p>{patientProfile.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium flex items-center gap-2">
                <FiCalendar /> Age
              </p>
              <p>{new Date().getFullYear() - new Date(patientProfile.dateOfBirth).getFullYear()} years</p>
            </div>
            <div>
              <p className="text-sm font-medium flex items-center gap-2">
                <FiDroplet /> Blood Group
              </p>
              <p>{patientProfile.bloodGroup || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium flex items-center gap-2">
                <FiFileText /> Total Records
              </p>
              <p>{records.length}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-5 gap-4">
        <div className="relative w-full md:w-1/2">
          <FiSearch className="absolute top-3 left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search records..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-500" />
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
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

      {/* Records List */}
      {viewMode === 'list' && (
        <>
          {filteredRecords.length > 0 ? (
            <motion.div layout className="grid gap-4">
              {filteredRecords.map((record) => (
                <motion.div
                  key={record._id}
                  layout
                  whileHover={{ scale: 1.01 }}
                  className="bg-white p-5 rounded-xl shadow hover:shadow-md transition cursor-pointer"
                  onClick={() => handleViewRecord(record)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      {record.diagnosis || 'Medical Record'}
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {record.treatment ? 'Treatment' : 'Diagnosis'}
                      </span>
                    </h3>
                    <FiChevronRight className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    <FiCalendar className="inline mr-1" />
                    {formatDate(record.visitDate)} •{' '}
                    <FiUser className="inline mr-1" />
                    Dr. {record.doctorId?.name || 'Unknown'}
                  </p>
                  {record.notes && (
                    <p className="text-gray-600 text-sm">
                      {record.notes.length > 150
                        ? `${record.notes.substring(0, 150)}...`
                        : record.notes}
                    </p>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <p className="text-6xl mb-3">📋</p>
              <h3 className="text-xl font-medium mb-2">No Records Found</h3>
              <p>No medical records found matching your search criteria.</p>
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                onClick={handleAddRecord}
              >
                <FiPlus className="inline mr-1" /> Add New Record
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
