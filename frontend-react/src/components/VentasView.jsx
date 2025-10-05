import { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import Toast from './Toast';
import api from '../services/api';

export default function VentasView() {
  const { toast, showToast, hideToast } = useToast();
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const response = await api.get('/productos');
      setProductos(response.data.productos);
    } catch (error) {
      showToast('Error al cargar productos', 'error');
    }
  };

  const agregarProducto = (producto) => {
    // Validación 1: Verificar stock disponible
    if (producto.cantidad <= 0) {
      showToast('Producto sin stock disponible', 'error');
      return;
    }

    const existing = carrito.find(item => item.id === producto.id);
    const cantidadEnCarrito = existing ? existing.cantidad : 0;
    
    // Validación 2: Verificar si ya tiene todo el stock en el carrito
    if (cantidadEnCarrito >= producto.cantidad) {
      showToast(
        `Stock insuficiente. Solo quedan ${producto.cantidad} unidades disponibles`,
        'error'
      );
      return;
    }

    if (existing) {
      setCarrito(carrito.map(item => 
        item.id === producto.id 
          ? { ...item, cantidad: item.cantidad + 1 } 
          : item
      ));
      showToast('Cantidad actualizada en el carrito', 'success');
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
      showToast('Producto agregado al carrito', 'success');
    }
  };

  const cambiarCantidad = (id, delta) => {
    const producto = productos.find(p => p.id === id);
    
    setCarrito(carrito.map(item => {
      if (item.id === id) {
        const nuevaCantidad = item.cantidad + delta;
        
        // Validación: No puede ser mayor al stock
        if (nuevaCantidad > producto.cantidad) {
          showToast(
            `Stock insuficiente. Solo hay ${producto.cantidad} unidades disponibles`,
            'error'
          );
          return item;
        }
        
        // Si la cantidad es 0 o menor, eliminar del carrito
        if (nuevaCantidad <= 0) {
          return null;
        }
        
        return { ...item, cantidad: nuevaCantidad };
      }
      return item;
    }).filter(item => item !== null));
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
    showToast('Producto eliminado del carrito', 'info');
  };

  const vaciarCarrito = () => {
    if (carrito.length === 0) return;
    
    if (window.confirm('¿Estás seguro de vaciar el carrito?')) {
      setCarrito([]);
      showToast('Carrito vaciado', 'info');
    }
  };

  const finalizarVenta = async () => {
    if (carrito.length === 0) {
      showToast('El carrito está vacío', 'error');
      return;
    }

    setLoading(true);
    try {
      const productos = carrito.map(item => ({
        producto_id: item.id,
        cantidad: item.cantidad
      }));

      const response = await api.post('/ventas', { productos });
      
      const descargar = window.confirm(
        '¡Venta registrada exitosamente! ¿Deseas descargar el ticket?'
      );
      
      if (descargar) {
        await descargarTicket(response.data.venta);
      }
      
      showToast('Venta registrada correctamente', 'success');
      setCarrito([]);
      fetchProductos(); // Actualizar stock
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error al registrar venta';
      showToast(errorMsg, 'error');
      
      // Si hay error de stock, refrescar productos
      if (errorMsg.includes('Stock insuficiente') || errorMsg.includes('stock')) {
        fetchProductos();
      }
    } finally {
      setLoading(false);
    }
  };

  const descargarTicket = async (venta) => {
    try {
      const response = await api.get(`/ventas/${venta.id}/ticket-pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket_${venta.numero_transaccion}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showToast('Error al descargar ticket', 'error');
    }
  };

  const total = carrito.reduce((sum, item) => sum + item.precio_unitario * item.cantidad, 0);
  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      
      {/* Panel de Productos */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">Productos Disponibles</h2>
        
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {productosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No se encontraron productos
            </div>
          ) : (
            productosFiltrados.map(p => (
              <div 
                key={p.id} 
                className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border transition"
              >
                <div className="flex-1">
                  <p className="font-semibold">{p.nombre}</p>
                  <p className="text-sm text-gray-600">
                    Código: {p.codigo} | ${p.precio_unitario.toLocaleString()}
                  </p>
                  <p className={`text-xs font-semibold ${
                    p.cantidad > 20 ? 'text-green-600' : 
                    p.cantidad > 0 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    Stock: {p.cantidad} unidades
                  </p>
                </div>
                <button
                  onClick={() => agregarProducto(p)}
                  disabled={p.cantidad <= 0}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {p.cantidad <= 0 ? 'Sin Stock' : 'Agregar'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Panel de Carrito */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Carrito de Compra</h2>
          {carrito.length > 0 && (
            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>
        
        {carrito.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400 text-lg">Carrito vacío</p>
            <p className="text-gray-400 text-sm mt-2">Agrega productos para comenzar</p>
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-6 max-h-[350px] overflow-y-auto">
              {carrito.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold">{item.nombre}</p>
                    <p className="text-sm text-gray-600">
                      ${item.precio_unitario.toLocaleString()} c/u
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => cambiarCantidad(item.id, -1)} 
                      className="p-1 hover:bg-gray-200 rounded transition"
                      title="Reducir cantidad"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-semibold w-8 text-center">{item.cantidad}</span>
                    <button 
                      onClick={() => cambiarCantidad(item.id, 1)} 
                      className="p-1 hover:bg-gray-200 rounded transition"
                      title="Aumentar cantidad"
                    >
                      <Plus size={16} />
                    </button>
                    <span className="font-bold ml-4 w-24 text-right">
                      ${(item.precio_unitario * item.cantidad).toLocaleString()}
                    </span>
                    <button
                      onClick={() => eliminarDelCarrito(item.id)}
                      className="p-1 hover:bg-red-100 text-red-600 rounded ml-2 transition"
                      title="Eliminar del carrito"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Productos:</span>
                <span>{totalItems} {totalItems === 1 ? 'unidad' : 'unidades'}</span>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold">Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${total.toLocaleString()}
                </span>
              </div>
              
              <button
                onClick={vaciarCarrito}
                disabled={loading}
                className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition disabled:opacity-50 mb-2"
              >
                Vaciar Carrito
              </button>
              
              <button 
                onClick={finalizarVenta}
                disabled={loading}
                className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Procesando...' : 'Finalizar Venta'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}