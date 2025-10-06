export const MESSAGES = {
  AUTH: {
    TOKEN_REQUIRED: 'Token requerido',
    TOKEN_INVALID: 'Token inválido',
    TOKEN_EXPIRED: 'Token expirado. Por favor, inicie sesión nuevamente',
    SESSION_CLOSED: 'Sesión cerrada. Por favor, inicie sesión nuevamente',
    MISSING_DATA: 'Faltan datos',
    INVALID_ROLE: 'Rol inválido',
    USER_EXISTS: 'El usuario ya existe',
    USER_NOT_FOUND: 'Usuario no encontrado',
    WRONG_PASSWORD: 'Contraseña incorrecta',
    ONLY_ADMIN: 'Solo los administradores pueden crear usuarios',
    NO_PERMISSION: 'No tienes permisos para esta acción',
    LOGIN_SUCCESS: 'Inicio de sesión exitoso',
    LOGOUT_SUCCESS: 'Sesión cerrada correctamente',
    REGISTER_SUCCESS: 'Usuario registrado exitosamente'
  },

  PRODUCTS: {
    NOT_FOUND: 'Producto no encontrado',
    CODE_EXISTS: 'El código del producto ya existe',
    MISSING_FIELDS: 'Faltan datos obligatorios: codigo, nombre, precio_unitario y cantidad son requeridos',
    INVALID_PRICE: 'El precio_unitario debe ser un número mayor o igual a 0',
    INVALID_QUANTITY: 'La cantidad debe ser un número entero mayor o igual a 0',
    UPDATE_FIELD_REQUIRED: 'Debe proporcionar al menos un campo para actualizar',
    CODE_ALREADY_EXISTS: (code) => `Ya existe un producto con el código: ${code}`,
    HAS_SALES: 'No se puede eliminar el producto porque está asociado a ventas existentes',
    CREATED: 'Producto creado exitosamente',
    UPDATED: 'Producto actualizado exitosamente',
    DELETED: 'Producto eliminado correctamente'
  },

  SALES: {
    EMPTY_CART: 'La venta debe incluir al menos un producto',
    INVALID_PRODUCT_DATA: 'Datos de producto inválidos',
    PRODUCT_NOT_FOUND: (id) => `Producto con ID ${id} no encontrado`,
    INSUFFICIENT_STOCK: (name, available, requested) => 
      `Stock insuficiente para ${name}. Disponible: ${available}, Solicitado: ${requested}`,
    NOT_FOUND: 'Venta no encontrada',
    CREATED: 'Venta registrada exitosamente'
  },

  REPORTS: {
    MISSING_DATE: 'Debe proporcionar una fecha',
    NO_SALES: 'No hay ventas para esta fecha',
    MISSING_DATES: 'Debe proporcionar fecha_inicio y fecha_fin'
  },

  ERRORS: {
    REGISTER: 'Error al registrar usuario',
    LOGIN: 'Error en login',
    GET_USERS: 'Error al obtener usuarios',
    GET_USER: 'Error al obtener usuario',
    UPDATE_USER: 'Error al actualizar usuario',
    DELETE_USER: 'Error al eliminar usuario',
    GET_PRODUCTS: 'Error al obtener productos',
    GET_PRODUCT: 'Error al obtener producto',
    CREATE_PRODUCT: 'Error al crear producto',
    UPDATE_PRODUCT: 'Error al actualizar producto',
    DELETE_PRODUCT: 'Error al eliminar producto',
    PROCESS_SALE: 'Error al procesar venta',
    GET_SALES: 'Error al obtener ventas',
    GET_SALE: 'Error al obtener venta',
    GENERATE_TICKET: 'Error al generar ticket',
    GENERATE_REPORT: 'Error al generar reporte de ventas',
    GENERATE_CSV: 'Error al generar reporte CSV',
    GENERATE_PDF: 'Error al generar PDF',
    LOGOUT: 'Error al cerrar sesión',
    CLEAN_TOKENS: 'Error al limpiar tokens',
    GET_TOKENS: 'Error al obtener tokens',
    GET_ATTEMPTS: 'Error al obtener intentos de login'
  }
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500
};