import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Auto logout if 401 (but avoid loops)
            if (window.location.pathname !== '/login') {
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (userData) => api.post('/auth/register', userData);
export const getMe = () => api.get('/auth/me');

// Task APIs
export const getTasks = (params) => api.get('/tasks', { params });
export const createTask = (taskData) => api.post('/tasks', taskData);
export const updateTask = (id, taskData) => api.put(`/tasks/${id}`, taskData);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);

// Avatar API
export const uploadAvatar = (formData) => api.post('/auth/me/avatar', formData, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
});

export const getAvatarUrl = (userId) => `${API_URL}/auth/${userId}/avatar`;

// Google Calendar Sync APIs
export const getGoogleAuthUrl = () => api.get('/google/auth');
export const handleGoogleCallback = (code) => api.post('/google/callback', { code });
export const disconnectGoogleCalendar = () => api.post('/google/disconnect');

export default api;
