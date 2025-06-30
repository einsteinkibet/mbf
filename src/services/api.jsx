import axios from 'axios';
import { useAuth } from '../auth/AuthProvider';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/';

const api = axios.create({
  baseURL: API_BASE_URL,  // Now guaranteed to have trailing slash
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}auth/refresh/`, { refreshToken });
          localStorage.setItem('token', response.data.token);
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
      
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login?session_expired=true';
    }
    
    return Promise.reject(error);
  }
);

// Auth API - Note trailing slashes in all endpoints
export const authAPI = {
  login: (credentials) => api.post('login/', credentials),
  logout: () => api.post('logout/'),
  verifyToken: () => api.get('auth/verify/'),
  request2FA: () => api.post('2fa/request/'),
  verify2FA: (data) => api.post('2fa/verify/', data),
  refreshToken: (refreshToken) => api.post('auth/refresh/', { refresh_token: refreshToken })
};


// Student API
export const studentAPI = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  getByBalance: (amount) => api.get(`/students/by-balance?amount=${amount}`),
  getByGrade: (grades) => api.post('/students/by-grades', { grades }),
  getByGradeAndBalance: ({ grades, amount }) => 
    api.post('/students/by-grade-and-balance', { grades, amount }),
  getPerformance: (id) => api.get(`/students/${id}/performance`),
  getBusInfo: (id) => api.get(`/students/${id}/bus`),
  assignBus: (id, data) => api.post(`/students/${id}/bus`, data)
};

// Staff API
export const staffAPI = {
  getAll: () => api.get('/staff'),
  getById: (id) => api.get(`/staff/${id}`),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  delete: (id) => api.delete(`/staff/${id}`),
  assignClass: (data) => api.post('/assign-class', data),
  assignSubject: (data) => api.post('/staff-subjects', data)
};

// Grade API
export const gradeAPI = {
  getAll: () => api.get('/grades'),
  getById: (id) => api.get(`/grades/${id}`),
  create: (data) => api.post('/grades', data),
  delete: (id) => api.delete(`/grades/${id}`),
  getClasses: (id) => api.get(`/classes/grade/${id}`),
  getSubjects: (id) => api.get(`/grades/${id}/subjects`)
};

// Class API
export const classAPI = {
  getAll: () => api.get('/classes'),
  getById: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post('/classes', data),
  delete: (id) => api.delete(`/classes/${id}`),
  deleteClass: (id) => api.delete(`/delete-class/${id}`), // legacy endpoint
  assignTeacher: (data) => api.post('/assign-class', data),
  getStudents: (id) => api.get(`/classes/${id}/students`)
};

// Term API
export const termAPI = {
  getAll: () => api.get('/terms'),
  getActive: () => api.get('/terms/active'),
  create: (data) => api.post('/terms', data),
  close: (id) => api.post(`/terms/${id}/close`),
  processRollover: () => api.post('/process-rollover'),
  promoteStudents: () => api.post('/promote-students')
};

// Fee API
export const feeAPI = {
  getAll: (termId) => api.get(`/fees?term_id=${termId}`),
  create: (data) => api.post('/fees', data),
  update: (id, data) => api.put(`/fees/${id}`, data),
  delete: (id) => api.delete(`/fees/${id}`)
};

// Subject API
export const subjectAPI = {
  getAll: () => api.get('/subjects'),
  getById: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  delete: (id) => api.delete(`/subjects/${id}`)
};

// Bus API
export const busAPI = {
  getDestinations: () => api.get('/bus/destinations'),
  assignStudent: (studentId, data) => api.post(`/students/${studentId}/bus`, data),
  getStudentBusInfo: (studentId) => api.get(`/students/${studentId}/bus`)
};
// Message API
export const messageAPI = {
  sendReminders: (data) => api.post('/send-reminders', data),
  sendCustom: (data) => api.post('/send-custom-message', data)
};

export const financialAPI = {
  getStudentBalance: (studentId) => api.get(`/students/${studentId}/balance`),
  recordPayment: (data) => api.post('/payments', data)
};

export default api;