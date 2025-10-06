import pool from '../database/connection.js';
import { MESSAGES, HTTP_STATUS } from '../constants/messages.js';
import { validateProduct } from '../validators/validators.js';

export const productosService = {
  async obtenerTodos() {
    const result = await pool.query(
      'SELECT id, codigo, nombre, descripcion, precio_unitario, cantidad, creado_en FROM productos ORDER BY id'
    );
    return result.rows;
  },

  async obtenerPorId(id) {
    const result = await pool.query(
      'SELECT id, codigo, nombre, descripcion, precio_unitario, cantidad, creado_en FROM productos WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      throw { status: HTTP_STATUS.NOT_FOUND, message: MESSAGES.PRODUCTS.NOT_FOUND };
    }
    
    return result.rows[0];
  },

  async crear(data) {
    const { codigo, nombre, descripcion, precio_unitario, cantidad } = data;

    if (!validateProduct.requiredFields(data)) {
      throw { status: HTTP_STATUS.BAD_REQUEST, message: MESSAGES.PRODUCTS.MISSING_FIELDS };
    }

    if (!validateProduct.validPrice(precio_unitario)) {
      throw { status: HTTP_STATUS.BAD_REQUEST, message: MESSAGES.PRODUCTS.INVALID_PRICE };
    }

    if (!validateProduct.validQuantity(cantidad)) {
      throw { status: HTTP_STATUS.BAD_REQUEST, message: MESSAGES.PRODUCTS.INVALID_QUANTITY };
    }

    const codigoExiste = await pool.query(
      'SELECT id FROM productos WHERE codigo = $1',
      [codigo]
    );

    if (codigoExiste.rows.length > 0) {
      throw { 
        status: HTTP_STATUS.CONFLICT, 
        message: MESSAGES.PRODUCTS.CODE_ALREADY_EXISTS(codigo) 
      };
    }

    const result = await pool.query(
      'INSERT INTO productos (codigo, nombre, descripcion, precio_unitario, cantidad) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [codigo, nombre, descripcion || null, precio_unitario, cantidad]
    );

    return result.rows[0];
  },

  async actualizar(id, data) {
    const { codigo, nombre, descripcion, precio_unitario, cantidad } = data;

    if (!codigo && !nombre && descripcion === undefined && precio_unitario === undefined && cantidad === undefined) {
      throw { 
        status: HTTP_STATUS.BAD_REQUEST, 
        message: MESSAGES.PRODUCTS.UPDATE_FIELD_REQUIRED 
      };
    }

    if (precio_unitario !== undefined && !validateProduct.validPrice(precio_unitario)) {
      throw { status: HTTP_STATUS.BAD_REQUEST, message: MESSAGES.PRODUCTS.INVALID_PRICE };
    }

    if (cantidad !== undefined && !validateProduct.validQuantity(cantidad)) {
      throw { status: HTTP_STATUS.BAD_REQUEST, message: MESSAGES.PRODUCTS.INVALID_QUANTITY };
    }

    const productoActual = await pool.query(
      'SELECT * FROM productos WHERE id = $1',
      [id]
    );

    if (productoActual.rows.length === 0) {
      throw { status: HTTP_STATUS.NOT_FOUND, message: MESSAGES.PRODUCTS.NOT_FOUND };
    }

    const producto = productoActual.rows[0];

    if (codigo && codigo !== producto.codigo) {
      const codigoExiste = await pool.query(
        'SELECT id FROM productos WHERE codigo = $1 AND id != $2',
        [codigo, id]
      );

      if (codigoExiste.rows.length > 0) {
        throw { 
          status: HTTP_STATUS.CONFLICT, 
          message: MESSAGES.PRODUCTS.CODE_ALREADY_EXISTS(codigo) 
        };
      }
    }

    const datosActualizados = {
      codigo: codigo ?? producto.codigo,
      nombre: nombre ?? producto.nombre,
      descripcion: descripcion ?? producto.descripcion,
      precio_unitario: precio_unitario ?? producto.precio_unitario,
      cantidad: cantidad ?? producto.cantidad
    };

    const result = await pool.query(
      'UPDATE productos SET codigo=$1, nombre=$2, descripcion=$3, precio_unitario=$4, cantidad=$5 WHERE id=$6 RETURNING *',
      [
        datosActualizados.codigo,
        datosActualizados.nombre,
        datosActualizados.descripcion,
        datosActualizados.precio_unitario,
        datosActualizados.cantidad,
        id
      ]
    );

    return result.rows[0];
  },

  async eliminar(id) {
    const productoExiste = await pool.query(
      'SELECT * FROM productos WHERE id = $1',
      [id]
    );

    if (productoExiste.rows.length === 0) {
      throw { status: HTTP_STATUS.NOT_FOUND, message: MESSAGES.PRODUCTS.NOT_FOUND };
    }

    const tieneVentas = await pool.query(
      'SELECT COUNT(*) as total FROM detalle_ventas WHERE producto_id = $1',
      [id]
    );

    if (parseInt(tieneVentas.rows[0].total) > 0) {
      throw { status: HTTP_STATUS.CONFLICT, message: MESSAGES.PRODUCTS.HAS_SALES };
    }

    const result = await pool.query(
      'DELETE FROM productos WHERE id=$1 RETURNING *',
      [id]
    );

    return result.rows[0];
  }
};