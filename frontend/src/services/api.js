import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const registerApi = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Unable to connect to the server' };
  }
};

export const loginApi = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Unable to connect to the server' };
  }
};

// Relief Request APIs (VICTIM)
export const createReliefRequest = async (requestData) => {
  try {
    const response = await api.post('/requests', requestData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to submit relief request' };
  }
};

export const getMyRequests = async () => {
  try {
    const response = await api.get('/requests/my');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to retrieve your requests' };
  }
};

export const getReliefRequestById = async (id) => {
  try {
    const response = await api.get(`/requests/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to retrieve request details' };
  }
};

// Admin APIs (ADMIN only)
export const getAdminStats = async () => {
  try {
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to retrieve admin statistics' };
  }
};

export const getAdminRequests = async () => {
  try {
    const response = await api.get('/admin/requests');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to retrieve all requests' };
  }
};

export const getAdminRequestById = async (id) => {
  try {
    const response = await api.get(`/admin/requests/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to retrieve request details' };
  }
};

export const getAdminWorkers = async () => {
  try {
    const response = await api.get('/admin/workers');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to retrieve worker list' };
  }
};

export const createAdminWorker = async (workerData) => {
  try {
    const response = await api.post('/admin/workers', workerData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to create worker account' };
  }
};

export const assignRequestToWorker = async (requestId, workerId) => {
  try {
    const response = await api.patch(`/admin/requests/${requestId}/assign`, { workerId });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to assign worker to request' };
  }
};

// Worker APIs (WORKER only)
export const getWorkerStats = async () => {
  try {
    const response = await api.get('/worker/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to retrieve worker statistics' };
  }
};

export const getWorkerRequests = async () => {
  try {
    const response = await api.get('/worker/requests');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to retrieve assigned requests' };
  }
};

export const getWorkerRequestById = async (id) => {
  try {
    const response = await api.get(`/worker/requests/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to retrieve request details' };
  }
};

export const startWorkerRequest = async (id) => {
  try {
    const response = await api.patch(`/worker/requests/${id}/start`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to start request' };
  }
};

export const addWorkerUpdate = async (id, message) => {
  try {
    const response = await api.post(`/worker/requests/${id}/updates`, { message });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to add progress update' };
  }
};

export const getWorkerUpdates = async (id) => {
  try {
    const response = await api.get(`/worker/requests/${id}/updates`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to retrieve progress updates' };
  }
};

export const completeWorkerRequest = async (id) => {
  try {
    const response = await api.patch(`/worker/requests/${id}/complete`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to complete request' };
  }
};

export default api;
