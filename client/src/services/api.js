// const API_BASE_URL = (import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:3000/api');
const API_BASE_URL = 'https://hackathon-everpulse.onrender.com/api';
// Helper function to get auth token
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  console.log('Retrieving auth token:', token ? 'Token found' : 'No token found');
  if (!token) {
    console.log('Available localStorage items:', Object.keys(localStorage));
  }
  return token;
};

// Helper function to create headers
const createHeaders = (includeAuth = true, isFormData = false) => {
  const headers = {};
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const isFormData = options.body instanceof FormData;
  const headers = createHeaders(options.includeAuth !== false, isFormData);
  
  console.log(`Making ${options.method || 'GET'} request to:`, url);
  console.log('Request headers:', headers);
  
  const config = {
    headers,
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type') || '';

    // Prefer JSON but guard against HTML/error pages
    let data;
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      if (!response.ok) {
        throw new Error(text?.slice(0, 200) || 'Request failed');
      }
      // If server returned HTML unexpectedly, surface clearer error
      if (text?.trim().startsWith('<!DOCTYPE') || text?.trim().startsWith('<html')) {
        throw new Error('Received HTML instead of JSON. Check API base URL and server status.');
      }
      // Fallback: try to parse JSON from text if possible
      try { data = JSON.parse(text); } catch {
        data = { message: text };
      }
    }

    if (!response.ok) {
      throw new Error(data?.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Error:', { url, message: error.message });
    throw error;
  }
};

// Patient API functions
export const patientAPI = {
  // Authentication
  login: (credentials) => apiRequest('/patients/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    includeAuth: false
  }),
  
  signup: (patientData) => apiRequest('/patients/signup', {
    method: 'POST',
    body: JSON.stringify(patientData),
    includeAuth: false
  }),

  // Profile management
  getProfile: () => apiRequest('/patients/profile'),
  
  updateProfile: (profileData) => apiRequest('/patients/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  }),

  // Records summary
  getRecordsSummary: () => apiRequest('/patients/records-summary'),
};

// Medical Records API functions
export const medicalRecordsAPI = {
  // Create a new medical record (doctor only)
  create: (recordData) => apiRequest('/medical-records', {
    method: 'POST',
    body: JSON.stringify(recordData)
  }),

  // Get medical records by patient ID
  getByPatient: (patientId) => apiRequest(`/medical-records/patient/${patientId}`),

  // Get medical records by doctor ID
  getByDoctor: (doctorId) => apiRequest(`/medical-records/doctor/${doctorId}`),

  // Get patient's complete medical history
  getPatientHistory: (patientId) => apiRequest(`/medical-records/patient/${patientId}/history`),

  // Get specific medical record by ID
  getById: (recordId) => apiRequest(`/medical-records/${recordId}`),

  // Update medical record
  update: (recordId, updateData) => apiRequest(`/medical-records/${recordId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData)
  }),

  // Delete medical record
  delete: (recordId) => apiRequest(`/medical-records/${recordId}`, {
    method: 'DELETE'
  }),
};

// Doctors API functions
export const doctorsAPI = {
  getAll: () => apiRequest('/doctors'),
  getById: (doctorId) => apiRequest(`/doctors/${doctorId}`),
};

// Appointments API functions
export const appointmentsAPI = {
  getAll: () => apiRequest('/appointments'),
  getByPatient: () => {
    console.log('Fetching appointments without authentication');
    // Return mock data or make an unauthenticated request
    // For now, we'll use the same endpoint but without auth
    return apiRequest('/appointments/patient/current', { includeAuth: false });
  },
  create: (appointmentData) => apiRequest('/appointments', {
    method: 'POST',
    body: JSON.stringify(appointmentData)
  }),
  update: (appointmentId, updateData) => apiRequest(`/appointments/${appointmentId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData)
  }),
  delete: (appointmentId) => apiRequest(`/appointments/${appointmentId}`, {
    method: 'DELETE'
  }),
};

// Chat API functions
export const chatAPI = {
  // Chat management
  getChats: () => apiRequest('/chat/chats'),
  
  getOrCreateChat: (doctorId) => apiRequest('/chat/chats', {
    method: 'POST',
    body: JSON.stringify({ doctorId })
  }),

  getAvailableDoctors: () => apiRequest('/chat/doctors'),
  
  getDoctorPatients: () => apiRequest('/chat/patients'),

  // Messages
  getChatMessages: (chatId, page = 1, limit = 50) => 
    apiRequest(`/chat/chats/${chatId}/messages?page=${page}&limit=${limit}`),

  sendMessage: (chatId, messageData) => apiRequest(`/chat/chats/${chatId}/messages`, {
    method: 'POST',
    body: JSON.stringify(messageData)
  }),

  markMessagesAsRead: (chatId) => apiRequest(`/chat/chats/${chatId}/read`, {
    method: 'PUT'
  }),

  // Message actions
  deleteMessage: (messageId) => apiRequest(`/chat/messages/${messageId}`, {
    method: 'DELETE'
  }),

  editMessage: (messageId, content) => apiRequest(`/chat/messages/${messageId}`, {
    method: 'PUT',
    body: JSON.stringify({ content })
  }),
};

// Admin API functions
export const adminAPI = {
  // Authentication
  login: (credentials) => apiRequest('/admins/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    includeAuth: false
  }),
  
  signup: (adminData) => apiRequest('/admins/signup', {
    method: 'POST',
    body: JSON.stringify(adminData),
    includeAuth: false
  }),

  // Dashboard
  getDashboard: () => apiRequest('/admins/dashboard'),
  getAnalytics: (period = 30) => apiRequest(`/admins/analytics?period=${period}`),

  // Profile management
  getProfile: () => apiRequest('/admins/profile'),
  updateProfile: (profileData) => apiRequest('/admins/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  }),

  // Doctor management
  getAllDoctors: () => apiRequest('/admins/doctors'),
  updateDoctor: (doctorId, doctorData) => apiRequest(`/admins/doctors/${doctorId}`, {
    method: 'PUT',
    body: JSON.stringify(doctorData)
  }),
  deleteDoctor: (doctorId) => apiRequest(`/admins/doctors/${doctorId}`, {
    method: 'DELETE'
  }),

  // Patient management
  getAllPatients: () => apiRequest('/admins/patients'),
  updatePatient: (patientId, patientData) => apiRequest(`/admins/patients/${patientId}`, {
    method: 'PUT',
    body: JSON.stringify(patientData)
  }),
  deletePatient: (patientId) => apiRequest(`/admins/patients/${patientId}`, {
    method: 'DELETE'
  }),

  // Appointments management
  getAllAppointments: (status = '', startDate = '', endDate = '', doctorId = '', patientId = '') => {
    let url = '/admins/appointments?';
    if (status) url += `status=${status}&`;
    if (startDate) url += `startDate=${startDate}&`;
    if (endDate) url += `endDate=${endDate}&`;
    if (doctorId) url += `doctorId=${doctorId}&`;
    if (patientId) url += `patientId=${patientId}&`;
    return apiRequest(url.replace(/&$/, ''));
  },
  
  getAppointmentById: (appointmentId) => apiRequest(`/admins/appointments/${appointmentId}`),
  
  updateAppointment: (appointmentId, updateData) => apiRequest(`/admins/appointments/${appointmentId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData)
  }),
  
  deleteAppointment: (appointmentId) => apiRequest(`/admins/appointments/${appointmentId}`, {
    method: 'DELETE'
  }),
  
  getAppointmentStats: (period = 'month') => apiRequest(`/admins/appointments/stats?period=${period}`),

  // Medical records management
  getAllMedicalRecords: (page = 1, limit = 20, search = '') => 
    apiRequest(`/admins/medical-records?page=${page}&limit=${limit}&search=${search}`),

  // Feedback management
  getFeedback: (page = 1, limit = 20, status = '', rating = '') => 
    apiRequest(`/admins/feedback?page=${page}&limit=${limit}&status=${status}&rating=${rating}`),
  updateFeedback: (feedbackId, feedbackData) => apiRequest(`/admins/feedback/${feedbackId}`, {
    method: 'PUT',
    body: JSON.stringify(feedbackData)
  }),
  deleteFeedback: (feedbackId) => apiRequest(`/admins/feedback/${feedbackId}`, {
    method: 'DELETE'
  }),
};

// Doctor API functions
export const doctorAPI = {
  // Authentication
  login: (credentials) => apiRequest('/doctors/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    includeAuth: false
  }),

  signup: (doctorData) => apiRequest('/doctors/signup', {
    method: 'POST',
    body: JSON.stringify(doctorData),
    includeAuth: false
  }),

  // Dashboard
  getDashboard: () => apiRequest('/doctors/dashboard/overview'),
  getPatients: (page = 1, limit = 10, search = '') => 
    apiRequest(`/doctors/dashboard/patients?page=${page}&limit=${limit}&search=${search}`),
  getAppointments: (page = 1, limit = 10, status = '', date = '', search = '') => 
    apiRequest(`/doctors/dashboard/appointments?page=${page}&limit=${limit}&status=${status}&date=${date}&search=${search}`),

  // Appointment management
  getTodayAppointments: () => apiRequest('/appointments/doctor/today'),
  getUpcomingAppointments: (limit = 10) => apiRequest(`/appointments/doctor/upcoming?limit=${limit}`),
  getAppointmentStats: (period = 30) => apiRequest(`/appointments/doctor/stats?period=${period}`),
  updateAppointmentStatus: (appointmentId, updateData) => apiRequest(`/appointments/${appointmentId}/doctor-update`, {
    method: 'PUT',
    body: JSON.stringify(updateData)
  }),

  // Profile management
  getProfile: () => apiRequest('/doctors/profile/me'),
  updateProfile: (profileData) => {
    // Handle FormData for file uploads
    if (profileData instanceof FormData) {
      return apiRequest('/doctors/profile/me', {
        method: 'PUT',
        body: profileData
      });
    }
    return apiRequest('/doctors/profile/me', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  // Public doctor listing
  getAll: (search = '', specialization = '') => 
    apiRequest(`/doctors?search=${search}&specialization=${specialization}`, {
      includeAuth: false
    }),
  getById: (doctorId) => apiRequest(`/doctors/${doctorId}`, {
    includeAuth: false
  }),

  // Patient management
  getPatientDetails: (patientId) => apiRequest(`/doctors/patients/${patientId}`),
  getPatientMedicalRecords: (patientId, page = 1, limit = 10) => 
    apiRequest(`/doctors/patients/${patientId}/medical-records?page=${page}&limit=${limit}`),
  getPatientAppointmentHistory: (patientId, page = 1, limit = 10, status = '') => 
    apiRequest(`/doctors/patients/${patientId}/appointments?page=${page}&limit=${limit}&status=${status}`),
  createMedicalRecord: (patientId, recordData) => apiRequest(`/doctors/patients/${patientId}/medical-records`, {
    method: 'POST',
    body: JSON.stringify(recordData)
  }),

  // Medical records management
  getMedicalRecords: (page = 1, limit = 10, search = '', patientId = '', diagnosis = '', dateFrom = '', dateTo = '', sortBy = 'visitDate', sortOrder = 'desc') => 
    apiRequest(`/medical-records/doctor/records?page=${page}&limit=${limit}&search=${search}&patientId=${patientId}&diagnosis=${diagnosis}&dateFrom=${dateFrom}&dateTo=${dateTo}&sortBy=${sortBy}&sortOrder=${sortOrder}`),
  getMedicalRecordsStats: (period = 30) => apiRequest(`/medical-records/doctor/stats?period=${period}`),
  getRecentMedicalRecords: (limit = 10) => apiRequest(`/medical-records/doctor/recent?limit=${limit}`),
  searchMedicalRecords: (query, page = 1, limit = 10) => 
    apiRequest(`/medical-records/doctor/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`),
  getMedicalRecordById: (recordId) => apiRequest(`/medical-records/doctor/${recordId}`),
  updateMedicalRecord: (recordId, recordData) => apiRequest(`/medical-records/doctor/${recordId}`, {
    method: 'PUT',
    body: JSON.stringify(recordData)
  }),
  deleteMedicalRecord: (recordId) => apiRequest(`/medical-records/doctor/${recordId}`, {
    method: 'DELETE'
  }),
};

export default {
  patientAPI,
  medicalRecordsAPI,
  doctorsAPI,
  appointmentsAPI,
  chatAPI,
  adminAPI,
  doctorAPI,
};
