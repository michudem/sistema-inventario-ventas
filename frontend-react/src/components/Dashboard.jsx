import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FileText, 
  Users, 
  LogOut,
  Menu,
  X 
} from 'lucide-react';
import InicioView from './InicioView';
import ProductosView from './ProductosView';
import VentasView from './VentasView';
import ReportesView from './ReportesView';
import UsuariosView from './UsuariosView';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!user || !user.username) {
    return <Navigate to="/login" replace />;
  }

  const menuItems = [
    { name: 'Inicio', path: '/inicio', icon: LayoutDashboard },
    { name: 'Productos', path: '/productos', icon: Package },
    { name: 'Ventas', path: '/ventas', icon: ShoppingCart },
    { name: 'Reportes', path: '/reportes', icon: FileText },
    { name: 'Usuarios', path: '/usuarios', icon: Users, adminOnly: true },
  ].filter(item => !item.adminOnly || user?.rol === 'ADMIN');

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de cerrar sesión?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className={`bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:relative md:translate-x-0 transition duration-200 ease-in-out z-20`}>
        
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Package className="w-8 h-8" />
            <span className="text-2xl font-extrabold">Inventario</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors w-full ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3 mb-3 px-2">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold">
                {user.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold">{user.username}</p>
              <p className="text-xs text-gray-400">{user.rol}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-md py-4 px-6 flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden mr-4"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-800">
            Sistema de Gestión de Inventario
          </h1>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Routes>
            <Route path="/inicio" element={<InicioView />} />
            <Route path="/productos" element={<ProductosView />} />
            <Route path="/ventas" element={<VentasView />} />
            <Route path="/reportes" element={<ReportesView />} />
            {user.rol === 'ADMIN' && (
              <Route path="/usuarios" element={<UsuariosView />} />
            )}
            <Route path="/" element={<Navigate to="/inicio" replace />} />
          </Routes>
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}