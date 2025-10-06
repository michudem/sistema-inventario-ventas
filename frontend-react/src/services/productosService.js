import api from './api';

export const productosService = {
  async obtenerTodos() {
    const response = await api.get('/productos');
    return response.data.productos;
  },

  async obtenerPorId(id) {
    const response = await api.get(`/productos/${id}`);
    return response.data.producto;
  },

  async crear(producto) {
    const response = await api.post('/productos', producto);
    return response.data;
  },

  async actualizar(id, producto) {
    const response = await api.put(`/productos/${id}`, producto);
    return response.data;
  },

  async eliminar(id) {
    const response = await api.delete(`/productos/${id}`);
    return response.data;
  }
};