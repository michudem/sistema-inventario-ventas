import { useEffect, useState } from 'react';
import { Package, ShoppingCart, DollarSign, TrendingDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import icono from '../assets/icono.svg';
import api from '../services/api';

function StatCard({ icon: Icon, title, value, color, loading }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color} text-white`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold">
            {loading ? '...' : value}
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

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
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
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
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
        <h3 className="text-2xl font-bold mb-4">Resumen del Día</h3>
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