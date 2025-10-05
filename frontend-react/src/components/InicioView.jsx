import { useAuth } from '../context/AuthContext';
import icono from '../assets/icono.svg';

export default function InicioView() {
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-6">
        {/* Logo sin fondo */}
        <div className="flex justify-center">
          <img src={icono} alt="Logo Invexa" className="w-50 h-40" />
        </div>

        {/* Título del sistema */}
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Sistema de Inventario
          </h1>
          <p className="text-xl text-gray-600">
            Gestión de Productos y Ventas
          </p>
        </div>

        {/* Bienvenida */}
        <div className="bg-white rounded-xl shadow-lg p-6 inline-block">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            ¡Bienvenido, {user.username}!
          </h2>
          <p className="text-gray-600">
            Rol: <span className="font-semibold text-blue-600">{user.rol}</span>
          </p>
        </div>

        {/* Instrucción */}
        <p className="text-gray-500 text-sm">
          Usa el menú lateral para navegar por el sistema
        </p>
      </div>
    </div>
  );
}