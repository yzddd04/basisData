import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the authorization token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('lmsUser') || '{}');
    const token = user?.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If the token is expired, remove it and redirect to login
      localStorage.removeItem('lmsUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;