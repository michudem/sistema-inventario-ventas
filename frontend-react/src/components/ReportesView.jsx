import { useState } from 'react';
import api from '../services/api';

export default function ReportesView() {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const descargarCSV = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/reportes/ventas/diario/csv?fecha=${fecha}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_${fecha}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Error al descargar CSV');
    } finally {
      setLoading(false);
    }
  };

  const descargarPDF = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/reportes/ventas/diario/pdf?fecha=${fecha}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_${fecha}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Error al descargar PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-bold mb-6">Reportes de Ventas</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Seleccionar Fecha</label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        />
      </div>

      <div className="flex gap-4">
        <button 
          onClick={descargarCSV}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          Descargar CSV
        </button>
        <button 
          onClick={descargarPDF}
          disabled={loading}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
        >
          Descargar PDF
        </button>
      </div>
    </div>
  );
}