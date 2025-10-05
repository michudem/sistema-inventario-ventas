import { useEffect, useState } from 'react';
import { Package, ShoppingCart, DollarSign, TrendingDown, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import icono from '../assets/icono.svg';
import api from '../services/api';

function StatCard({ icon: Icon, title, value, color, loading }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color} text-white`}>
          <Icon size={24} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold">
            {loading ? (
              <span className="animate-pulse">...</span>
            ) : (
              value
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function InicioView() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProductos: 0,
    productosLowStock: 0,
    ventasHoy: 0,
    ingresosHoy: 0
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    fetchStats();
    
    // Actualizar automáticamente cada 30 segundos
    const interval = setInterval(() => {
      fetchStats(false); // false = sin mostrar loading
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    
    try {
      const hoy = new Date().toISOString().split('T')[0];
      
      const [productosRes, reporteRes] = await Promise.all([
        api.get('/productos'),
        api.get(`/reportes/ventas/diario?fecha=${hoy}`)
      ]);

      const productos = productosRes.data.productos;
      const reporte = reporteRes.data.reporte;

      setStats({
        totalProductos: productos.length,
        productosLowStock: productos.filter(p => p.cantidad < 20).length,
        ventasHoy: reporte.resumen.total_transacciones,
        ingresosHoy: reporte.resumen.ingresos_totales
      });
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatLastUpdate = () => {
    if (!lastUpdate) return '';
    const now = new Date();
    const diff = Math.floor((now - lastUpdate) / 1000); // segundos
    
    if (diff < 60) return 'Actualizado hace unos segundos';
    if (diff < 3600) return `Actualizado hace ${Math.floor(diff / 60)} min`;
    return lastUpdate.toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-8">
      {/* Bienvenida */}
      <div className="flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <img src={icono} alt="Logo Invexa" className="w-50 h-40" />
          </div>

          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Sistema de Inventario
            </h1>
            <p className="text-xl text-gray-600">
              Gestión de Productos y Ventas
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 inline-block">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              ¡Bienvenido, {user.username}!
            </h2>
            <p className="text-gray-600">
              Rol: <span className="font-semibold text-blue-600">{user.rol}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold">Resumen del Día</h3>
          <div className="flex items-center gap-3">
            {lastUpdate && (
              <span className="text-sm text-gray-500">
                {formatLastUpdate()}
              </span>
            )}
            <button
              onClick={() => fetchStats()}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
              title="Actualizar estadísticas"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            icon={Package} 
            title="Total Productos" 
            value={stats.totalProductos}
            color="bg-blue-500"
            loading={loading}
          />
          <StatCard 
            icon={ShoppingCart} 
            title="Ventas Hoy" 
            value={stats.ventasHoy}
            color="bg-green-500"
            loading={loading}
          />
          <StatCard 
            icon={DollarSign} 
            title="Ingresos Hoy" 
            value={`$${stats.ingresosHoy.toLocaleString()}`}
            color="bg-purple-500"
            loading={loading}
          />
          <StatCard 
            icon={TrendingDown} 
            title="Stock Bajo" 
            value={stats.productosLowStock}
            color="bg-red-500"
            loading={loading}
          />
        </div>

        {/* Alertas */}
        {!loading && stats.productosLowStock > 0 && (
          <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <TrendingDown className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <span className="font-medium">Alerta de inventario:</span>
                  {' '}{stats.productosLowStock} {stats.productosLowStock === 1 ? 'producto tiene' : 'productos tienen'} stock bajo (menos de 20 unidades).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instrucción */}
      <div className="text-center">
        <p className="text-gray-500 text-sm">
          Usa el menú lateral para navegar por el sistema
        </p>
      </div>
    </div>
  );
}