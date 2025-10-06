import { useState } from 'react';
import { Package, Plus, Edit, Trash2, Search } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useToast } from '../hooks/useToast';
import Toast from './Toast';
import { MESSAGES } from '../constants/messages';

export default function ProductosView() {
  const { productos, loading, crearProducto, actualizarProducto, eliminarProducto } = useProducts();
  const { toast, showToast, hideToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    precio_unitario: '',
    cantidad: ''
  });

  const productosFiltrados = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      precio_unitario: '',
      cantidad: ''
    });
    setEditingProduct(null);
  };

  const abrirModalCrear = () => {
    resetForm();
    setShowModal(true);
  };

  const abrirModalEditar = (producto) => {
    setFormData({
      codigo: producto.codigo,
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio_unitario: producto.precio_unitario,
      cantidad: producto.cantidad
    });
    setEditingProduct(producto);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const productoData = {
      codigo: formData.codigo,
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      precio_unitario: parseFloat(formData.precio_unitario),
      cantidad: parseInt(formData.cantidad)
    };

    if (editingProduct) {
      await actualizarProducto(
        editingProduct.id,
        productoData,
        (message) => {
          showToast(message, 'success');
          cerrarModal();
        },
        (error) => showToast(error, 'error')
      );
    } else {
      await crearProducto(
        productoData,
        (message) => {
          showToast(message, 'success');
          cerrarModal();
        },
        (error) => showToast(error, 'error')
      );
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este producto?')) {
      await eliminarProducto(
        id,
        (message) => showToast(message, 'success'),
        (error) => showToast(error, 'error')
      );
    }
  };

  const esAdmin = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.rol === 'ADMIN';
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Package className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Productos</h1>
        </div>

        {esAdmin() && (
          <button
            onClick={abrirModalCrear}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Producto
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Cargando productos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Código</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Descripción</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Precio</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Stock</th>
                  {esAdmin() && (
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {productosFiltrados.map((producto) => (
                  <tr key={producto.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{producto.codigo}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{producto.nombre}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{producto.descripcion || '-'}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      ${producto.precio_unitario.toLocaleString('es-CO')}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        producto.cantidad > 10 
                          ? 'bg-green-100 text-green-800'
                          : producto.cantidad > 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {producto.cantidad}
                      </span>
                    </td>
                    {esAdmin() && (
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => abrirModalEditar(producto)}
                          className="text-blue-600 hover:text-blue-800 mx-1"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEliminar(producto.id)}
                          className="text-red-600 hover:text-red-800 mx-1"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {productosFiltrados.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No se encontraron productos
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código *
                </label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.precio_unitario}
                    onChange={(e) => setFormData({ ...formData, precio_unitario: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad *
                  </label>
                  <input
                    type="number"
                    value={formData.cantidad}
                    onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}