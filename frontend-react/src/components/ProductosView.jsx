import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import Toast from './Toast';
import api from '../services/api';

export default function ProductosView() {
  const { user } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const [productos, setProductos] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    precio_unitario: '',
    cantidad: ''
  });

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const response = await api.get('/productos');
      setProductos(response.data.productos);
    } catch (error) {
      showToast('Error al cargar productos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${nombre}"?`)) return;

    setOperationLoading(true);
    try {
      await api.delete(`/productos/${id}`);
      showToast('Producto eliminado correctamente', 'success');
      fetchProductos();
    } catch (error) {
      showToast(error.response?.data?.error || 'Error al eliminar producto', 'error');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEdit = (producto) => {
    setSelectedProduct(producto);
    setFormData({
      codigo: producto.codigo,
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio_unitario: producto.precio_unitario,
      cantidad: producto.cantidad
    });
    setModalOpen(true);
  };

  const handleNew = () => {
    setSelectedProduct(null);
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      precio_unitario: '',
      cantidad: ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setOperationLoading(true);
    
    try {
      const data = {
        ...formData,
        precio_unitario: Number(formData.precio_unitario),
        cantidad: Number(formData.cantidad)
      };

      if (selectedProduct) {
        await api.put(`/productos/${selectedProduct.id}`, data);
        showToast('Producto actualizado correctamente', 'success');
      } else {
        await api.post('/productos', data);
        showToast('Producto creado correctamente', 'success');
      }

      setModalOpen(false);
      fetchProductos();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error al guardar producto', 'error');
    } finally {
      setOperationLoading(false);
    }
  };

  const filtered = productos.filter(p => 
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.codigo.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestión de Productos</h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o código..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {user.rol === 'ADMIN' && (
            <button 
              onClick={handleNew}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition"
            >
              <Plus size={20} /> Nuevo Producto
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-400 text-lg">No se encontraron productos</p>
          {search && (
            <p className="text-gray-400 text-sm mt-2">
              Intenta con otro término de búsqueda
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Código</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Descripción</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Precio</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Stock</th>
                {user.rol === 'ADMIN' && (
                  <th className="px-6 py-3 text-left text-sm font-semibold">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-mono text-sm">{p.codigo}</td>
                  <td className="px-6 py-4 font-medium">{p.nombre}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                    {p.descripcion || '-'}
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    ${p.precio_unitario.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      p.cantidad > 20 
                        ? 'bg-green-100 text-green-800' 
                        : p.cantidad > 0 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {p.cantidad}
                    </span>
                  </td>
                  {user.rol === 'ADMIN' && (
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(p)}
                          disabled={operationLoading}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition disabled:opacity-50"
                          title="Editar producto"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id, p.nombre)}
                          disabled={operationLoading}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                          title="Eliminar producto"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}
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
                  Código <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={operationLoading}
                  placeholder="Ej: A001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={operationLoading}
                  placeholder="Nombre del producto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                  disabled={operationLoading}
                  placeholder="Descripción opcional del producto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Precio Unitario <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.precio_unitario}
                  onChange={(e) => setFormData({...formData, precio_unitario: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  min="0"
                  step="0.01"
                  disabled={operationLoading}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Cantidad <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.cantidad}
                  onChange={(e) => setFormData({...formData, cantidad: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  min="0"
                  disabled={operationLoading}
                  placeholder="0"
                />
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