import api from './api';

export const reportesService = {
  async obtenerReporteDiario(fecha) {
    const params = fecha ? `?fecha=${fecha}` : '';
    const response = await api.get(`/reportes/ventas/diario${params}`);
    return response.data.reporte;
  },

  async descargarCSV(fecha) {
    const response = await api.get(`/reportes/ventas/diario/csv?fecha=${fecha}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  async descargarPDF(fecha) {
    const params = fecha ? `?fecha=${fecha}` : '';
    const response = await api.get(`/reportes/ventas/diario/pdf${params}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  async obtenerReportePorRango(fechaInicio, fechaFin) {
    const response = await api.get(
      `/reportes/ventas/rango?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`
    );
    return response.data;
  },

  async obtenerProductosMasVendidos(limit = 10) {
    const response = await api.get(`/reportes/productos/mas-vendidos?limit=${limit}`);
    return response.data.productos_mas_vendidos;
  }
};