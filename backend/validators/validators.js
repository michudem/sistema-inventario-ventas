export const validateProduct = {
  requiredFields: (data) => {
    const { codigo, nombre, precio_unitario, cantidad } = data;
    return codigo && nombre && precio_unitario !== undefined && cantidad !== undefined;
  },

  validPrice: (precio) => {
    return typeof precio === 'number' && precio >= 0;
  },

  validQuantity: (cantidad) => {
    return Number.isInteger(cantidad) && cantidad >= 0;
  }
};

export const validateUser = {
  requiredFields: (data) => {
    const { username, password, rol } = data;
    return username && password && rol;
  },

  validRole: (rol) => {
    return rol === 'ADMIN' || rol === 'CAJERO';
  },

  validUsername: (username) => {
    return username && username.length >= 3;
  },

  validPassword: (password) => {
    return password && password.length >= 6;
  }
};

export const validateSale = {
  hasProducts: (productos) => {
    return productos && Array.isArray(productos) && productos.length > 0;
  },

  validProductItem: (item) => {
    return item.producto_id && item.cantidad && item.cantidad > 0;
  }
};