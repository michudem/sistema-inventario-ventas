import { useState, useEffect } from 'react';
import { productosService } from '../services';
import { MESSAGES } from '../constants/messages';

export const useProducts = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);

  const cargarProductos = async (onError) => {
    setLoading(true);
    try {
      const data = await productosService.obtenerTodos();
      setProductos(data);
    } catch (error) {
      onError?.(MESSAGES.PRODUCTS.ERROR_LOAD);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const crearProducto = async (producto, onSuccess, onError) => {
    setLoading(true);
    try {
      await productosService.crear(producto);
      await cargarProductos();
      onSuccess?.(MESSAGES.PRODUCTS.CREATED);
    } catch (error) {
      const message = error.response?.data?.error || MESSAGES.PRODUCTS.ERROR_CREATE;
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  const actualizarProducto = async (id, producto, onSuccess, onError) => {
    setLoading(true);
    try {
      await productosService.actualizar(id, producto);
      await cargarProductos();
      onSuccess?.(MESSAGES.PRODUCTS.UPDATED);
    } catch (error) {
      const message = error.response?.data?.error || MESSAGES.PRODUCTS.ERROR_UPDATE;
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  const eliminarProducto = async (id, onSuccess, onError) => {
    setLoading(true);
    try {
      await productosService.eliminar(id);
      await cargarProductos();
      onSuccess?.(MESSAGES.PRODUCTS.DELETED);
    } catch (error) {
      const message = error.response?.data?.error || MESSAGES.PRODUCTS.ERROR_DELETE;
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    productos,
    loading,
    cargarProductos,
    crearProducto,
    actualizarProducto,
    eliminarProducto
  };
};