import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services';
import { MESSAGES } from '../constants/messages';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = async (username, password, onSuccess, onError) => {
    setLoading(true);
    try {
      const data = await authService.login(username, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.usuario));
      onSuccess?.(MESSAGES.AUTH.LOGIN_SUCCESS);
      navigate('/inicio');
    } catch (error) {
      const message = error.response?.data?.error || MESSAGES.AUTH.LOGIN_ERROR;
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async (onSuccess, onError) => {
    setLoading(true);
    try {
      await authService.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      onSuccess?.(MESSAGES.AUTH.LOGOUT_SUCCESS);
      navigate('/login');
    } catch (error) {
      onError?.('Error al cerrar sesión');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const register = async (datos, onSuccess, onError) => {
    setLoading(true);
    try {
      await authService.register(datos.username, datos.password, datos.rol);
      onSuccess?.(MESSAGES.AUTH.REGISTER_SUCCESS);
    } catch (error) {
      const message = error.response?.data?.error || MESSAGES.AUTH.REGISTER_ERROR;
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    logout,
    register,
    loading
  };
};