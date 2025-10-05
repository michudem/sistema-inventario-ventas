import { useState } from 'react';
import { Download, FileText, Calendar } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import Toast from './Toast';
import api from '../services/api';

export default function ReportesView() {
  const { toast, showToast, hideToast } = useToast();
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleFechaChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (selectedDate > today) {
      showToast('No puedes seleccionar una fecha futura', 'error');
      return;
    }
    
    setFecha(e.target.value);
  };

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
      window.URL.revokeObjectURL(url);
      
      showToast('Reporte CSV descargado correctamente', 'success');
    } catch (error) {
      showToast(
        error.response?.data?.error || 'Error al descargar CSV',
        'error'
      );
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
      window.URL.revokeObjectURL(url);
      
      showToast('Reporte PDF descargado correctamente', 'success');
    } catch (error) {
      showToast(
        error.response?.data?.error || 'Error al descargar PDF',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const maxDate = new Date().toISOString().split('T')[0];

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <FileText size={28} className="text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold">Reportes de Ventas</h2>
            <p className="text-sm text-gray-600">
              Genera y descarga reportes en diferentes formatos
            </p>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Calendar size={18} className="text-gray-600" />
            Seleccionar Fecha
          </label>
          <input
            type="date"
            value={fecha}
            onChange={handleFechaChange}
            max={maxDate}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-auto"
          />
          <p className="text-xs text-gray-500 mt-2">
            Selecciona la fecha del reporte que deseas descargar
          </p>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Formatos Disponibles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={descargarCSV}
              disabled={loading}
              className="flex items-center justify-center gap-3 bg-blue-500 text-white px-6 py-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition group"
            >
              <Download size={20} className="group-hover:animate-bounce" />
              <div className="text-left">
                <p className="font-semibold">Descargar CSV</p>
                <p className="text-xs opacity-90">Formato Excel compatible</p>
              </div>
            </button>
            
            <button 
              onClick={descargarPDF}
              disabled={loading}
              className="flex items-center justify-center gap-3 bg-red-500 text-white px-6 py-4 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition group"
            >
              <Download size={20} className="group-hover:animate-bounce" />
              <div className="text-left">
                <p className="font-semibold">Descargar PDF</p>
                <p className="text-xs opacity-90">Formato imprimible</p>
              </div>
            </button>
          </div>
        </div>

        {loading && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-3 text-blue-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span>Generando reporte...</span>
            </div>
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Información del Reporte</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Incluye todas las transacciones del día seleccionado</li>
            <li>• Resumen de ventas y productos vendidos</li>
            <li>• Información del cajero que realizó cada venta</li>
          </ul>
        </div>
      </div>
    </div>
  );
}