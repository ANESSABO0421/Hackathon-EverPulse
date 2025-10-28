import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { doctorAPI } from '../../../services/api';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Briefcase, 
  MapPin, 
  Calendar, 
  Stethoscope, 
  ArrowLeft,
  Plus,
  Info
} from 'lucide-react';

const AdminAddDoctor = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    gender: "male",
    dateOfBirth: "",
    bloodGroup: "",
    specialization: "",
    licenseNumber: "",
    yearsOfExperience: "",
    qualifications: "",
    hospitalAffiliation: "",
    bio: "",
    consultationFee: "",
    address: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        yearsOfExperience: Number(formData.yearsOfExperience) || 0,
        consultationFee: Number(formData.consultationFee) || 0,
        qualifications: formData.qualifications 
          ? formData.qualifications.split(',').map(q => q.trim())
          : [],
        dateOfBirth: formData.dob // Map dob to dateOfBirth
      };

      // Remove the dob field as it's not needed in the final payload
      delete payload.dob;

      await doctorAPI.signup(payload);
      toast.success('Doctor added successfully!');
      navigate('/dashboard/admin/doctors');
    } catch (error) {
      console.error('Error adding doctor:', error);
      toast.error(error.response?.data?.message || 'Failed to add doctor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto p-6"
    >
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Add New Doctor</h1>
          <p className="text-gray-600">Register a new doctor to the system</p>
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="divide-y divide-gray-100">
          <div className="p-8 space-y-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <User className="w-5 h-5" />
                </div>
                <h2 className="ml-3 text-lg font-semibold text-gray-800">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md h-10"
                      placeholder="Dr. John Doe"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md h-10"
                      placeholder="doctor@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md h-10"
                      placeholder="••••••••"
                      required
                      minLength="6"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md h-10"
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                </div>

                {/* DOB */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md h-10"
                      required
                    />
                  </div>
                </div>

                {/* Gender */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md h-10"
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="pt-8 space-y-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h2 className="ml-3 text-lg font-semibold text-gray-800">Professional Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Specialization */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Specialization</label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md h-10"
                      placeholder="Cardiology, Neurology, etc."
                      required
                    />
                  </div>
                </div>

                {/* Years of Experience */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      onChange={handleChange}
                      min="0"
                      max="60"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md h-10"
                      placeholder="5"
                      required
                    />
                  </div>
                </div>

                {/* License Number */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">License Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md h-10 px-3"
                      placeholder="MD12345678"
                      required
                    />
                  </div>
                </div>

                {/* Qualifications */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Qualifications (comma separated)</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="qualifications"
                      value={formData.qualifications}
                      onChange={handleChange}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md h-10 px-3"
                      placeholder="MD, MBBS, etc."
                    />
                  </div>
                </div>

                {/* Hospital Affiliation */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Hospital Affiliation</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="hospitalAffiliation"
                      value={formData.hospitalAffiliation}
                      onChange={handleChange}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md h-10 px-3"
                      placeholder="Hospital Name"
                    />
                  </div>
                </div>

                {/* Blood Group */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md h-10 px-3"
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

                {/* Fee */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Consultation Fee ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <input
                      type="number"
                      name="consultationFee"
                      value={formData.consultationFee}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-8 sm:text-sm border-gray-300 rounded-md h-10"
                      placeholder="100.00"
                      required
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="2"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="123 Medical Center Dr, City, State, ZIP"
                      required
                    ></textarea>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="3"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Brief professional bio..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="bg-gray-50 px-8 py-4 flex justify-end space-x-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowLeft className="-ml-1 mr-2 h-4 w-4" />
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding Doctor...
                </>
              ) : (
                <>
                  <Plus className="-ml-1 mr-2 h-4 w-4" />
                  Add Doctor
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Help Info */}
      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-6">
        <div className="flex">
          <Info className="h-5 w-5 text-blue-400 mt-1" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Need help?</h3>
            <p className="mt-2 text-sm text-blue-700">
              Ensure all information is accurate before submitting. The doctor will receive login credentials via email.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminAddDoctor;
