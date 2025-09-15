import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  refreshToken: () => api.post('/auth/refresh')
};

// Doctor API calls
export const doctorAPI = {
  getAll: (params = {}) => api.get('/doctors', { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  getSchedule: (id) => api.get(`/doctors/${id}/schedule`),
  updateSchedule: (id, schedule) => api.put(`/doctors/${id}/schedule`, schedule),
  updateProfile: (id, data) => api.put(`/doctors/${id}`, data)
};

// Medicine API calls
export const medicineAPI = {
  getAll: (params = {}) => api.get('/medicines', { params }),
  getById: (id) => api.get(`/medicines/${id}`),
  updateStock: (id, quantity) => api.put(`/medicines/${id}/stock`, { quantity }),
  search: (query) => api.get(`/medicines/search?q=${query}`)
};

// Patient API calls
export const patientAPI = {
  getProfile: (id) => api.get(`/patients/${id}`),
  updateProfile: (id, data) => api.put(`/patients/${id}`, data),
  getMedicalHistory: (id) => api.get(`/patients/${id}/history`),
  getPrescriptions: (id) => api.get(`/patients/${id}/prescriptions`)
};

// Appointment API calls
export const appointmentAPI = {
  getAll: (params = {}) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (appointmentData) => api.post('/appointments', appointmentData),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  cancel: (id) => api.delete(`/appointments/${id}`),
  getAvailableSlots: (doctorId, date) => 
    api.get(`/appointments/slots?doctor_id=${doctorId}&date=${date}`)
};

// Prescription API calls
export const prescriptionAPI = {
  getAll: (params = {}) => api.get('/prescriptions', { params }),
  getById: (id) => api.get(`/prescriptions/${id}`),
  create: (prescriptionData) => api.post('/prescriptions', prescriptionData),
  update: (id, data) => api.put(`/prescriptions/${id}`, data)
};

// File upload
export const uploadAPI = {
  uploadFile: (file, type = 'document') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

export default api;