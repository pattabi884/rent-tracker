import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ ENHANCED INTERCEPTOR WITH BETTER DEBUGGING
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🔐 API Interceptor - URL:', config.url);
    console.log('🔐 API Interceptor - Token in localStorage:', !!token);
    console.log('🔐 API Interceptor - Full token:', token);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Authorization header set with token');
      console.log('🔐 Headers being sent:', config.headers);
    } else {
      console.log('❌ No token found in localStorage');
      console.log('🔐 Available localStorage keys:', Object.keys(localStorage));
    }
    return config;
  },
  (error) => {
    console.error('❌ Interceptor error:', error);
    return Promise.reject(error);
  }
);

// Your exports here...
export const getPropertiesSummary = () => {
  console.log('🔄 Calling getPropertiesSummary...');
  return api.get('/properties/summary');
};
// ... rest of your exports

// ✅ THEN YOUR EXPORTS COME AFTER

export const setupProperties = (data) => api.post('/properties/setup', data);
export const updateHouseStatus = (propertyId, houseId, data) => 
  api.patch(`/properties/${propertyId}/houses/${houseId}/status`, data);
export const updateProperty = (propertyId, data) => api.put(`/properties/${propertyId}`, data);
export const deleteProperty = (propertyId) => api.delete(`/properties/${propertyId}`);

// Auth APIs
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);

export default api;