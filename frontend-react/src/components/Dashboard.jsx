import { useState } from 'react';
import { Home, ShoppingCart, Package, FileText, Users, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import InicioView from './InicioView';
import ProductosView from './ProductosView';
import VentasView from './VentasView';
import ReportesView from './ReportesView';
import UsuariosView from './UsuariosView';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [view, setView] = useState('inicio');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: Home, roles: ['ADMIN', 'CAJERO'] },
    { id: 'productos', label: 'Productos', icon: Package, roles: ['ADMIN', 'CAJERO'] },
    { id: 'ventas', label: 'Caja', icon: ShoppingCart, roles: ['ADMIN', 'CAJERO'] },
    { id: 'reportes', label: 'Reportes', icon: FileText, roles: ['ADMIN', 'CAJERO'] },
    { id: 'usuarios', label: 'Usuarios', icon: Users, roles: ['ADMIN'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.rol));

  const renderView = () => {
    switch(view) {
      case 'inicio': return <InicioView />;
      case 'productos': return <ProductosView />;
      case 'ventas': return <VentasView />;
      case 'reportes': return <ReportesView />;
      case 'usuarios': return <UsuariosView />;
      default: return <InicioView />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all flex flex-col`}>
        <div className="p-4 flex items-center justify-between">
          <h2 className={`font-bold text-xl ${!sidebarOpen && 'hidden'}`}>Inventario</h2>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-800 rounded">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="mt-8 flex-1">
          {filteredMenu.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition ${
                view === item.id ? 'bg-gray-800 border-l-4 border-blue-500' : ''
              }`}
            >
              <item.icon size={20} />
              <span className={!sidebarOpen ? 'hidden' : ''}>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-800">
          <div className={`mb-4 ${!sidebarOpen && 'hidden'}`}>
            <p className="text-sm text-gray-400">Usuario</p>
            <p className="font-semibold">{user.username}</p>
            <p className="text-xs text-gray-400">{user.rol}</p>
          </div>
          <button 
            onClick={logout} 
            className="w-full flex items-center gap-3 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            <LogOut size={20} />
            <span className={!sidebarOpen ? 'hidden' : ''}>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {renderView()}
        </div>
      </div>
    </div>
  );
}