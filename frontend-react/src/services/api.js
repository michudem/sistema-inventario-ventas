import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json; charset=utf-8', // ✅ AGREGADO charset
    'Accept': 'application/json',
    'Accept-Charset': 'utf-8', // ✅ AGREGADO
  },
});

// Interceptor para agregar el token en cada request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Emitir evento de sesión expirada
      const event = new CustomEvent('sessionExpired', {
        detail: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
      });
      window.dispatchEvent(event);
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;