import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './MedicalRecordForm.css';

const MedicalRecordForm = ({ record, onSubmit, onCancel, isEditMode = false }) => {
  const [formData, setFormData] = useState({
    diagnosis: '',
    treatment: '',
    prescriptions: [''],
    notes: '',
    visitDate: new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (record && isEditMode) {
      setFormData({
        diagnosis: record.diagnosis || '',
        treatment: record.treatment || '',
        prescriptions: record.prescriptions && record.prescriptions.length > 0 
          ? record.prescriptions 
          : [''],
        notes: record.notes || '',
        visitDate: record.visitDate 
          ? new Date(record.visitDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      });
    }
  }, [record, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePrescriptionChange = (index, value) => {
    const newPrescriptions = [...formData.prescriptions];
    newPrescriptions[index] = value;
    setFormData(prev => ({
      ...prev,
      prescriptions: newPrescriptions
    }));
  };

  const addPrescription = () => {
    setFormData(prev => ({
      ...prev,
      prescriptions: [...prev.prescriptions, '']
    }));
  };

  const removePrescription = (index) => {
    if (formData.prescriptions.length > 1) {
      const newPrescriptions = formData.prescriptions.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        prescriptions: newPrescriptions
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.diagnosis.trim()) {
      newErrors.diagnosis = 'Diagnosis is required';
    }

    if (!formData.treatment.trim()) {
      newErrors.treatment = 'Treatment is required';
    }

    if (!formData.visitDate) {
      newErrors.visitDate = 'Visit date is required';
    }

    // Validate prescriptions - at least one non-empty prescription
    const validPrescriptions = formData.prescriptions.filter(p => p.trim() !== '');
    if (validPrescriptions.length === 0) {
      newErrors.prescriptions = 'At least one prescription is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    
    try {
      // Filter out empty prescriptions
      const filteredPrescriptions = formData.prescriptions.filter(p => p.trim() !== '');
      
      const submitData = {
        ...formData,
        prescriptions: filteredPrescriptions
      };

      await onSubmit(submitData);
    } catch (error) {
      toast.error('Failed to save medical record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="medical-record-form-container">
      <div className="form-header">
        <h2>{isEditMode ? 'Edit Medical Record' : 'Request New Medical Record'}</h2>
        <button 
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="medical-record-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="visitDate">Visit Date *</label>
            <input
              type="date"
              id="visitDate"
              name="visitDate"
              value={formData.visitDate}
              onChange={handleInputChange}
              className={errors.visitDate ? 'error' : ''}
              disabled={loading}
            />
            {errors.visitDate && <span className="error-message">{errors.visitDate}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="diagnosis">Diagnosis *</label>
          <textarea
            id="diagnosis"
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleInputChange}
            className={errors.diagnosis ? 'error' : ''}
            placeholder="Enter the diagnosis..."
            rows="3"
            disabled={loading}
          />
          {errors.diagnosis && <span className="error-message">{errors.diagnosis}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="treatment">Treatment *</label>
          <textarea
            id="treatment"
            name="treatment"
            value={formData.treatment}
            onChange={handleInputChange}
            className={errors.treatment ? 'error' : ''}
            placeholder="Enter the treatment provided..."
            rows="4"
            disabled={loading}
          />
          {errors.treatment && <span className="error-message">{errors.treatment}</span>}
        </div>

        <div className="form-group">
          <label>Prescriptions *</label>
          {formData.prescriptions.map((prescription, index) => (
            <div key={index} className="prescription-input-group">
              <input
                type="text"
                value={prescription}
                onChange={(e) => handlePrescriptionChange(index, e.target.value)}
                placeholder={`Prescription ${index + 1}`}
                className="prescription-input"
                disabled={loading}
              />
              {formData.prescriptions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePrescription(index)}
                  className="btn btn-sm btn-danger prescription-remove"
                  disabled={loading}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={addPrescription}
            className="btn btn-outline add-prescription"
            disabled={loading}
          >
            + Add Prescription
          </button>
          
          {errors.prescriptions && <span className="error-message">{errors.prescriptions}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="notes">Additional Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Enter any additional notes or observations..."
            rows="3"
            disabled={loading}
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (isEditMode ? 'Update Record' : 'Submit Request')}
          </button>
          
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default MedicalRecordForm;
