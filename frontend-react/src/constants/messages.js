export const MESSAGES = {
  PRODUCTS: {
    LOADED: 'Productos cargados correctamente',
    CREATED: 'Producto creado exitosamente',
    UPDATED: 'Producto actualizado exitosamente',
    DELETED: 'Producto eliminado exitosamente',
    ADDED_TO_CART: 'Producto agregado al carrito',
    QUANTITY_UPDATED: 'Cantidad actualizada en el carrito',
    REMOVED_FROM_CART: 'Producto eliminado del carrito',
    NO_STOCK: 'Producto sin stock disponible',
    INSUFFICIENT_STOCK: (available) => `Stock insuficiente. Solo quedan ${available} unidades disponibles`,
    ERROR_LOAD: 'Error al cargar productos',
    ERROR_CREATE: 'Error al crear producto',
    ERROR_UPDATE: 'Error al actualizar producto',
    ERROR_DELETE: 'Error al eliminar producto'
  },

  CART: {
    EMPTY: 'El carrito está vacío',
    CLEARED: 'Carrito vaciado'
  },

  SALES: {
    SUCCESS: 'Venta registrada correctamente',
    ERROR: 'Error al registrar venta',
    TICKET_ERROR: 'Error al descargar ticket'
  },

  AUTH: {
    LOGIN_SUCCESS: 'Inicio de sesión exitoso',
    LOGIN_ERROR: 'Error al iniciar sesión',
    LOGOUT_SUCCESS: 'Sesión cerrada correctamente',
    REGISTER_SUCCESS: 'Usuario registrado exitosamente',
    REGISTER_ERROR: 'Error al registrar usuario'
  },

  REPORTS: {
    ERROR_GENERATE: 'Error al generar reporte',
    ERROR_DOWNLOAD: 'Error al descargar reporte'
  },

  VALIDATION: {
    REQUIRED_FIELDS: 'Por favor complete todos los campos requeridos',
    INVALID_EMAIL: 'Email inválido',
    INVALID_PRICE: 'El precio debe ser un número mayor a 0',
    INVALID_QUANTITY: 'La cantidad debe ser un número entero mayor a 0'
  }
};

export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};