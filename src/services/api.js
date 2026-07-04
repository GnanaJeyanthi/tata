import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests and inject authorization header
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

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },
  register: async (username, email, password, role) => {
    const response = await api.post('/auth/register', { username, email, password, role });
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

export const assetService = {
  getAssets: async () => {
    const response = await api.get('/assets');
    return response.data;
  },
  getAssetById: async (id) => {
    const response = await api.get(`/assets/${id}`);
    return response.data;
  },
  runSimulation: async (simulationData) => {
    const response = await api.post('/assets/simulate', simulationData);
    return response.data;
  },
  updateRecommendation: async (id, status) => {
    const response = await api.put(`/assets/recommendations/${id}`, { status });
    return response.data;
  },
  getAnomalies: async () => {
    const response = await api.get('/assets/anomalies/all');
    return response.data;
  },
  getRecommendations: async () => {
    const response = await api.get('/assets/recommendations/all');
    return response.data;
  }
};

export default api;
