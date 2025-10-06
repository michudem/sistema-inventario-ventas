import pool from '../database/connection.js';
import { MESSAGES, HTTP_STATUS } from '../constants/messages.js';
import { validateSale } from '../validators/validators.js';

export const ventasService = {
  async procesarVenta(productos, usuarioId) {
    if (!validateSale.hasProducts(productos)) {
      throw { status: HTTP_STATUS.BAD_REQUEST, message: MESSAGES.SALES.EMPTY_CART };
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      let totalVenta = 0;

      for (const item of productos) {
        if (!validateSale.validProductItem(item)) {
          throw { status: HTTP_STATUS.BAD_REQUEST, message: MESSAGES.SALES.INVALID_PRODUCT_DATA };
        }

        const { producto_id, cantidad } = item;

        const productoResult = await client.query(
          'SELECT id, nombre, precio_unitario, cantidad FROM productos WHERE id=$1',
          [producto_id]
        );

        if (productoResult.rows.length === 0) {
          throw { 
            status: HTTP_STATUS.NOT_FOUND, 
            message: MESSAGES.SALES.PRODUCT_NOT_FOUND(producto_id) 
          };
        }

        const producto = productoResult.rows[0];

        if (producto.cantidad < cantidad) {
          throw { 
            status: HTTP_STATUS.BAD_REQUEST, 
            message: MESSAGES.SALES.INSUFFICIENT_STOCK(producto.nombre, producto.cantidad, cantidad) 
          };
        }

        totalVenta += producto.precio_unitario * cantidad;
      }

      const ventaResult = await client.query(
        'INSERT INTO ventas (numero_transaccion, usuario_id, total) VALUES ($1, $2, $3) RETURNING *',
        [`VT-TEMP-${Date.now()}`, usuarioId, totalVenta]
      );

      const venta = ventaResult.rows[0];
      const numeroTransaccion = `VT-${String(venta.id).padStart(4, '0')}`;

      await client.query(
        'UPDATE ventas SET numero_transaccion = $1 WHERE id = $2',
        [numeroTransaccion, venta.id]
      );

      for (const item of productos) {
        const { producto_id, cantidad } = item;

        const productoResult = await client.query(
          'SELECT precio_unitario FROM productos WHERE id=$1',
          [producto_id]
        );

        const precioUnitario = productoResult.rows[0].precio_unitario;
        const subtotal = precioUnitario * cantidad;

        await client.query(
          'INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES ($1, $2, $3, $4, $5)',
          [venta.id, producto_id, cantidad, precioUnitario, subtotal]
        );

        await client.query(
          'UPDATE productos SET cantidad = cantidad - $1 WHERE id = $2',
          [cantidad, producto_id]
        );
      }

      await client.query('COMMIT');

      const ventaCompleta = await pool.query(
        `SELECT v.*, u.username, 
                json_agg(
                  json_build_object(
                    'producto_id', dv.producto_id,
                    'nombre', p.nombre,
                    'cantidad', dv.cantidad,
                    'precio_unitario', dv.precio_unitario,
                    'subtotal', dv.subtotal
                  )
                ) as productos
         FROM ventas v
         JOIN usuarios u ON v.usuario_id = u.id
         JOIN detalle_ventas dv ON v.id = dv.venta_id
         JOIN productos p ON dv.producto_id = p.id
         WHERE v.id = $1
         GROUP BY v.id, u.username`,
        [venta.id]
      );

      return ventaCompleta.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async obtenerVentas(filtros) {
    const { fecha_inicio, fecha_fin, page = 1, limit = 10 } = filtros;
    const offset = (page - 1) * limit;

    let query = `
      SELECT v.*, u.username,
             json_agg(
               json_build_object(
                 'producto_id', dv.producto_id,
                 'nombre', p.nombre,
                 'cantidad', dv.cantidad,
                 'precio_unitario', dv.precio_unitario,
                 'subtotal', dv.subtotal
               )
             ) as productos
      FROM ventas v
      JOIN usuarios u ON v.usuario_id = u.id
      JOIN detalle_ventas dv ON v.id = dv.venta_id
      JOIN productos p ON dv.producto_id = p.id
    `;

    const params = [];
    const conditions = [];

    if (fecha_inicio && fecha_fin) {
      params.push(fecha_inicio, fecha_fin);
      conditions.push(`v.fecha BETWEEN $${params.length - 1} AND $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` GROUP BY v.id, u.username ORDER BY v.fecha DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  },

  async obtenerVentaPorId(id) {
    const result = await pool.query(
      `SELECT v.*, u.username,
              json_agg(
                json_build_object(
                  'producto_id', dv.producto_id,
                  'nombre', p.nombre,
                  'cantidad', dv.cantidad,
                  'precio_unitario', dv.precio_unitario,
                  'subtotal', dv.subtotal
                )
              ) as productos
       FROM ventas v
       JOIN usuarios u ON v.usuario_id = u.id
       JOIN detalle_ventas dv ON v.id = dv.venta_id
       JOIN productos p ON dv.producto_id = p.id
       WHERE v.id = $1
       GROUP BY v.id, u.username`,
      [id]
    );

    if (result.rows.length === 0) {
      throw { status: HTTP_STATUS.NOT_FOUND, message: MESSAGES.SALES.NOT_FOUND };
    }

    return result.rows[0];
  }
};