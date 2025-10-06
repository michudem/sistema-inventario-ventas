import { useState } from 'react';
import { FileText, Download, Calendar } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import Toast from './Toast';
import { reportesService } from '../services';
import { MESSAGES } from '../constants/messages';

export default function ReportesView() {
  const { toast, showToast, hideToast } = useToast();
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(false);

  const cargarReporte = async () => {
    setLoading(true);
    try {
      const data = await reportesService.obtenerReporteDiario(fecha);
      setReporte(data);
    } catch (error) {
      showToast(MESSAGES.REPORTS.ERROR_GENERATE, 'error');
    } finally {
      setLoading(false);
    }
  };

  const descargarCSV = async () => {
    try {
      const blob = await reportesService.descargarCSV(fecha);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_${fecha}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('Reporte CSV descargado', 'success');
    } catch (error) {
      showToast(MESSAGES.REPORTS.ERROR_DOWNLOAD, 'error');
    }
  };

  const descargarPDF = async () => {
    try {
      const blob = await reportesService.descargarPDF(fecha);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_${fecha}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('Reporte PDF descargado', 'success');
    } catch (error) {
      showToast(MESSAGES.REPORTS.ERROR_DOWNLOAD, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="flex items-center gap-2">
        <FileText className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-800">Reportes</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex gap-4 items-end mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={cargarReporte}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Cargando...' : 'Generar Reporte'}
          </button>

          {reporte && (
            <>
              <button
                onClick={descargarCSV}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={descargarPDF}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
            </>
          )}
        </div>

        {reporte && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Transacciones</p>
                <p className="text-2xl font-bold text-blue-600">
                  {reporte.resumen.total_transacciones}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-green-600">
                  ${reporte.resumen.ingresos_totales.toLocaleString('es-CO')}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Productos Vendidos</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Código</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Producto</th>
                      <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">Cantidad</th>
                      <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reporte.productos_vendidos.map((producto) => (
                      <tr key={producto.id}>
                        <td className="px-4 py-2 text-sm">{producto.codigo}</td>
                        <td className="px-4 py-2 text-sm">{producto.nombre}</td>
                        <td className="px-4 py-2 text-sm text-right">{producto.cantidad_vendida}</td>
                        <td className="px-4 py-2 text-sm text-right">
                          ${producto.total_vendido.toLocaleString('es-CO')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {!reporte && !loading && (
          <div className="text-center py-12 text-gray-500">
            Selecciona una fecha y genera el reporte
          </div>
        )}
      </div>
    </div>
  );
}