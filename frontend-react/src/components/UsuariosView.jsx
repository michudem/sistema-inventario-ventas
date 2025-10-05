import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Shield, User } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import Toast from './Toast';
import api from '../services/api';

export default function UsuariosView() {
  const { toast, showToast, hideToast } = useToast();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rol: 'CAJERO'
  });

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await api.get('/usuarios');
      setUsuarios(response.data.usuarios);
    } catch (error) {
      showToast('Error al cargar usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, username) => {
    if (!window.confirm(`¿Estás seguro de eliminar el usuario "${username}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setOperationLoading(true);
    try {
      await api.delete(`/usuarios/${id}`);
      showToast('Usuario eliminado correctamente', 'success');
      fetchUsuarios();
    } catch (error) {
      showToast(error.response?.data?.error || 'Error al eliminar usuario', 'error');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEdit = (usuario) => {
    setSelectedUser(usuario);
    setFormData({
      username: usuario.username,
      password: '',
      rol: usuario.rol
    });
    setModalOpen(true);
  };

  const handleNew = () => {
    setSelectedUser(null);
    setFormData({
      username: '',
      password: '',
      rol: 'CAJERO'
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (formData.username.trim().length < 3) {
      showToast('El usuario debe tener al menos 3 caracteres', 'error');
      return;
    }

    if (!selectedUser && formData.password.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    if (selectedUser && formData.password && formData.password.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    setOperationLoading(true);
    try {
      if (selectedUser) {
        const data = formData.password 
          ? formData 
          : { username: formData.username, rol: formData.rol };
        
        await api.put(`/usuarios/${selectedUser.id}`, data);
        showToast('Usuario actualizado correctamente', 'success');
      } else {
        await api.post('/usuarios/registro', formData);
        showToast('Usuario creado correctamente', 'success');
      }

      setModalOpen(false);
      fetchUsuarios();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error al guardar usuario', 'error');
    } finally {
      setOperationLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
          <p className="text-sm text-gray-600 mt-1">
            Administra los usuarios del sistema y sus permisos
          </p>
        </div>
        <button 
          onClick={handleNew}
          disabled={operationLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition disabled:opacity-50"
        >
          <Plus size={20} /> Nuevo Usuario
        </button>
      </div>

      {usuarios.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <User size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400 text-lg">No hay usuarios registrados</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Usuario</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Rol</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Fecha de Creación</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {usuarios.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User size={18} className="text-gray-400" />
                      <span className="font-medium">{u.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      u.rol === 'ADMIN' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      <Shield size={14} />
                      {u.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(u.creado_en).toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEdit(u)}
                        disabled={operationLoading}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition disabled:opacity-50"
                        title="Editar usuario"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(u.id, u.username)}
                        disabled={operationLoading}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                        title="Eliminar usuario"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>
              <button 
                onClick={() => !operationLoading && setModalOpen(false)} 
                className="p-2 hover:bg-gray-100 rounded transition"
                disabled={operationLoading}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Usuario <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={operationLoading}
                  minLength={3}
                  placeholder="Mínimo 3 caracteres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Contraseña {selectedUser && '(dejar vacío para no cambiar)'} 
                  {!selectedUser && <span className="text-red-500"> *</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={!selectedUser}
                  disabled={operationLoading}
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Rol <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.rol}
                  onChange={(e) => setFormData({...formData, rol: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={operationLoading}
                >
                  <option value="CAJERO">CAJERO - Acceso limitado</option>
                  <option value="ADMIN">ADMIN - Acceso completo</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.rol === 'ADMIN' 
                    ? 'Puede gestionar usuarios, productos y ver todos los reportes' 
                    : 'Solo puede registrar ventas y ver productos'}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={operationLoading}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={operationLoading}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                >
                  {operationLoading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}