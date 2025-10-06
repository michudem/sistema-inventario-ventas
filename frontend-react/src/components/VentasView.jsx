import { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import Toast from './Toast';
import { productosService, ventasService } from '../services';
import { MESSAGES } from '../constants/messages';

export default function VentasView() {
  const { toast, showToast, hideToast } = useToast();
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const data = await productosService.obtenerTodos();
      setProductos(data);
    } catch (error) {
      showToast(MESSAGES.PRODUCTS.ERROR_LOAD, 'error');
    }
  };

  const productoSinStock = (producto) => producto.cantidad <= 0;

  const obtenerCantidadEnCarrito = (productoId) => {
    const item = carrito.find(item => item.id === productoId);
    return item ? item.cantidad : 0;
  };

  const stockInsuficienteEnCarrito = (producto) => {
    const cantidadEnCarrito = obtenerCantidadEnCarrito(producto.id);
    return cantidadEnCarrito >= producto.cantidad;
  };

  const productoEstaEnCarrito = (productoId) => {
    return carrito.some(item => item.id === productoId);
  };

  const agregarProducto = (producto) => {
    if (productoSinStock(producto)) {
      showToast(MESSAGES.PRODUCTS.NO_STOCK, 'error');
      return;
    }

    if (stockInsuficienteEnCarrito(producto)) {
      showToast(MESSAGES.PRODUCTS.INSUFFICIENT_STOCK(producto.cantidad), 'error');
      return;
    }

    if (productoEstaEnCarrito(producto.id)) {
      incrementarCantidad(producto.id);
      showToast(MESSAGES.PRODUCTS.QUANTITY_UPDATED, 'success');
    } else {
      agregarNuevoProducto(producto);
      showToast(MESSAGES.PRODUCTS.ADDED_TO_CART, 'success');
    }
  };

  const incrementarCantidad = (productoId) => {
    setCarrito(
      carrito.map(item => 
        item.id === productoId 
          ? { ...item, cantidad: item.cantidad + 1 } 
          : item
      )
    );
  };

  const agregarNuevoProducto = (producto) => {
    setCarrito([...carrito, { ...producto, cantidad: 1 }]);
  };

  const cambiarCantidad = (productoId, cambio) => {
    const producto = productos.find(p => p.id === productoId);
    
    setCarrito(
      carrito
        .map(item => {
          if (item.id !== productoId) return item;
          
          const nuevaCantidad = item.cantidad + cambio;
          
          if (nuevaCantidad > producto.cantidad) {
            showToast(MESSAGES.PRODUCTS.INSUFFICIENT_STOCK(producto.cantidad), 'error');
            return item;
          }
          
          if (nuevaCantidad <= 0) return null;
          
          return { ...item, cantidad: nuevaCantidad };
        })
        .filter(Boolean)
    );
  };

  const eliminarDelCarrito = (productoId) => {
    setCarrito(carrito.filter(item => item.id !== productoId));
    showToast(MESSAGES.PRODUCTS.REMOVED_FROM_CART, 'info');
  };

  const vaciarCarrito = () => {
    if (carrito.length === 0) return;
    
    if (window.confirm('¿Estás seguro de vaciar el carrito?')) {
      setCarrito([]);
      showToast(MESSAGES.CART.CLEARED, 'info');
    }
  };

  const prepararProductosParaVenta = () => {
    return carrito.map(item => ({
      producto_id: item.id,
      cantidad: item.cantidad
    }));
  };

  const finalizarVenta = async () => {
    if (carrito.length === 0) {
      showToast(MESSAGES.CART.EMPTY, 'error');
      return;
    }

    setLoading(true);
    
    try {
      const productosVenta = prepararProductosParaVenta();
      const venta = await ventasService.crear(productosVenta);
      
      const deseaDescargar = window.confirm(
        '¡Venta registrada exitosamente! ¿Deseas descargar el ticket?'
      );
      
      if (deseaDescargar) {
        await descargarTicket(venta);
      }
      
      showToast(MESSAGES.SALES.SUCCESS, 'success');
      setCarrito([]);
      cargarProductos();
    } catch (error) {
      const mensajeError = error.response?.data?.error || MESSAGES.SALES.ERROR;
      showToast(mensajeError, 'error');
      
      if (mensajeError.includes('stock')) {
        cargarProductos();
      }
    } finally {
      setLoading(false);
    }
  };

  const descargarTicket = async (venta) => {
    try {
      const blob = await ventasService.descargarTicket(venta.id);
      crearYDescargarArchivo(blob, `ticket_${venta.numero_transaccion}.pdf`);
    } catch (error) {
      showToast(MESSAGES.SALES.TICKET_ERROR, 'error');
    }
  };

  const crearYDescargarArchivo = (blob, nombreArchivo) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const calcularTotal = () => {
    return carrito.reduce(
      (total, item) => total + (item.precio_unitario * item.cantidad), 
      0
    );
  };

  const calcularTotalItems = () => {
    return carrito.reduce((total, item) => total + item.cantidad, 0);
  };

  const filtrarProductos = () => {
    const termino = searchTerm.toLowerCase();
    return productos.filter(producto => 
      producto.nombre.toLowerCase().includes(termino) ||
      producto.codigo.toLowerCase().includes(termino)
    );
  };

  const total = calcularTotal();
  const totalItems = calcularTotalItems();
  const productosFiltrados = filtrarProductos();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Nueva Venta</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
          />

          <div className="max-h-96 overflow-y-auto space-y-2">
            {productosFiltrados.map((producto) => (
              <div
                key={producto.id}
                className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{producto.nombre}</h3>
                  <p className="text-sm text-gray-600">
                    ${producto.precio_unitario.toLocaleString('es-CO')} - Stock: {producto.cantidad}
                  </p>
                </div>
                <button
                  onClick={() => agregarProducto(producto)}
                  disabled={productoSinStock(producto) || stockInsuficienteEnCarrito(producto)}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            ))}

            {productosFiltrados.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No se encontraron productos
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Carrito</h2>
          {carrito.length > 0 && (
            <button
              onClick={vaciarCarrito}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Vaciar carrito
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {carrito.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">El carrito está vacío</p>
            </div>
          ) : (
            <>
              <div className="max-h-80 overflow-y-auto space-y-3 mb-4">
                {carrito.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{item.nombre}</h3>
                      <p className="text-sm text-gray-600">
                        ${item.precio_unitario.toLocaleString('es-CO')} c/u
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => cambiarCantidad(item.id, -1)}
                        className="bg-gray-200 p-1 rounded hover:bg-gray-300"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      
                      <span className="w-8 text-center font-semibold">
                        {item.cantidad}
                      </span>
                      
                      <button
                        onClick={() => cambiarCantidad(item.id, 1)}
                        className="bg-gray-200 p-1 rounded hover:bg-gray-300"
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => eliminarDelCarrito(item.id)}
                        className="text-red-600 hover:text-red-800 ml-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="text-right min-w-24">
                      <p className="font-semibold text-gray-800">
                        ${(item.precio_unitario * item.cantidad).toLocaleString('es-CO')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Total items:</span>
                  <span className="font-semibold">{totalItems}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-800">
                  <span>Total:</span>
                  <span>${total.toLocaleString('es-CO')}</span>
                </div>
              </div>

              <button
                onClick={finalizarVenta}
                disabled={loading}
                className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? 'Procesando...' : 'Finalizar Venta'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}