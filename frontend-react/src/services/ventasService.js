import api from './api';

export const ventasService = {
  async crear(productos) {
    const response = await api.post('/ventas', { productos });
    return response.data.venta;
  },

  async obtenerTodas(filtros = {}) {
    const { page = 1, limit = 10, fecha_inicio, fecha_fin } = filtros;
    const params = new URLSearchParams({ page, limit });
    
    if (fecha_inicio) params.append('fecha_inicio', fecha_inicio);
    if (fecha_fin) params.append('fecha_fin', fecha_fin);

    const response = await api.get(`/ventas?${params.toString()}`);
    return response.data.ventas;
  },

  async obtenerPorId(id) {
    const response = await api.get(`/ventas/${id}`);
    return response.data.venta;
  },

  async descargarTicket(ventaId) {
    const response = await api.get(`/ventas/${ventaId}/ticket-pdf`, {
      responseType: 'blob'
    });
    return response.data;
  }
};