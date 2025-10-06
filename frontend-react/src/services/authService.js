import api from './api';

export const authService = {
  async login(username, password) {
    const response = await api.post('/usuarios/login', { username, password });
    return response.data;
  },

  async logout() {
    const response = await api.post('/usuarios/logout');
    return response.data;
  },

  async register(username, password, rol) {
    const response = await api.post('/usuarios/registro', {
      username,
      password,
      rol
    });
    return response.data;
  },

  async obtenerUsuarios() {
    const response = await api.get('/usuarios');
    return response.data.usuarios;
  },

  async obtenerUsuarioPorId(id) {
    const response = await api.get(`/usuarios/${id}`);
    return response.data.usuario;
  },

  async actualizarUsuario(id, datos) {
    const response = await api.put(`/usuarios/${id}`, datos);
    return response.data;
  },

  async eliminarUsuario(id) {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  }
};