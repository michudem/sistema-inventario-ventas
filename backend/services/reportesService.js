import pool from '../database/connection.js';
import { MESSAGES, HTTP_STATUS } from '../constants/messages.js';

export const reportesService = {
  async obtenerReporteDiario(fecha) {
    const fechaConsulta = fecha || new Date().toISOString().split('T')[0];

    const transacciones = await pool.query(
      `SELECT COUNT(*) as total_transacciones, 
              COALESCE(SUM(total), 0) as ingresos_totales
       FROM ventas 
       WHERE DATE(fecha) = $1`,
      [fechaConsulta]
    );

    const productos = await pool.query(
      `SELECT 
         p.id, p.codigo, p.nombre,
         SUM(dv.cantidad) as cantidad_vendida,
         dv.precio_unitario,
         SUM(dv.subtotal) as total_vendido
       FROM detalle_ventas dv
       JOIN ventas v ON dv.venta_id = v.id
       JOIN productos p ON dv.producto_id = p.id
       WHERE DATE(v.fecha) = $1
       GROUP BY p.id, p.codigo, p.nombre, dv.precio_unitario
       ORDER BY cantidad_vendida DESC`,
      [fechaConsulta]
    );

    const ventas = await pool.query(
      `SELECT 
         v.id, v.numero_transaccion, v.fecha, v.total,
         u.username as cajero,
         json_agg(
           json_build_object(
             'producto', p.nombre,
             'cantidad', dv.cantidad,
             'precio_unitario', dv.precio_unitario,
             'subtotal', dv.subtotal
           )
         ) as productos
       FROM ventas v
       JOIN usuarios u ON v.usuario_id = u.id
       JOIN detalle_ventas dv ON v.id = dv.venta_id
       JOIN productos p ON dv.producto_id = p.id
       WHERE DATE(v.fecha) = $1
       GROUP BY v.id, u.username
       ORDER BY v.fecha DESC`,
      [fechaConsulta]
    );

    return {
      fecha: fechaConsulta,
      resumen: {
        total_transacciones: parseInt(transacciones.rows[0].total_transacciones),
        ingresos_totales: parseFloat(transacciones.rows[0].ingresos_totales)
      },
      productos_vendidos: productos.rows.map(p => ({
        id: p.id,
        codigo: p.codigo,
        nombre: p.nombre,
        cantidad_vendida: parseInt(p.cantidad_vendida),
        precio_unitario: parseFloat(p.precio_unitario),
        total_vendido: parseFloat(p.total_vendido)
      })),
      detalle_ventas: ventas.rows
    };
  },

  async obtenerDatosCSV(fecha) {
    if (!fecha) {
      throw { status: HTTP_STATUS.BAD_REQUEST, message: MESSAGES.REPORTS.MISSING_DATE };
    }

    const result = await pool.query(
      `SELECT 
        v.numero_transaccion as "No.Transacción",
        TO_CHAR(v.fecha, 'DD/MM/YYYY HH24:MI') as "Fecha",
        u.username as "Cajero",
        p.nombre as "Producto",
        dv.cantidad as "Cantidad",
        dv.precio_unitario as "Precio Unitario",
        dv.subtotal as "Subtotal",
        v.total as "Total Venta"
       FROM ventas v
       JOIN usuarios u ON v.usuario_id = u.id
       JOIN detalle_ventas dv ON v.id = dv.venta_id
       JOIN productos p ON dv.producto_id = p.id
       WHERE DATE(v.fecha) = $1
       ORDER BY v.fecha DESC`,
      [fecha]
    );

    if (result.rows.length === 0) {
      throw { status: HTTP_STATUS.NOT_FOUND, message: MESSAGES.REPORTS.NO_SALES };
    }

    return result.rows;
  },

  async obtenerReportePorRango(fechaInicio, fechaFin) {
    if (!fechaInicio || !fechaFin) {
      throw { 
        status: HTTP_STATUS.BAD_REQUEST, 
        message: MESSAGES.REPORTS.MISSING_DATES 
      };
    }

    const resumen = await pool.query(
      `SELECT 
         COUNT(*) as total_transacciones,
         COALESCE(SUM(total), 0) as ingresos_totales,
         DATE(MIN(fecha)) as primera_venta,
         DATE(MAX(fecha)) as ultima_venta
       FROM ventas 
       WHERE DATE(fecha) BETWEEN $1 AND $2`,
      [fechaInicio, fechaFin]
    );

    const productos = await pool.query(
      `SELECT 
         p.codigo, p.nombre,
         SUM(dv.cantidad) as cantidad_vendida,
         AVG(dv.precio_unitario) as precio_promedio,
         SUM(dv.subtotal) as total_vendido
       FROM detalle_ventas dv
       JOIN ventas v ON dv.venta_id = v.id
       JOIN productos p ON dv.producto_id = p.id
       WHERE DATE(v.fecha) BETWEEN $1 AND $2
       GROUP BY p.codigo, p.nombre
       ORDER BY cantidad_vendida DESC`,
      [fechaInicio, fechaFin]
    );

    const ventasPorDia = await pool.query(
      `SELECT 
         DATE(fecha) as fecha,
         COUNT(*) as transacciones,
         SUM(total) as ingresos
       FROM ventas
       WHERE DATE(fecha) BETWEEN $1 AND $2
       GROUP BY DATE(fecha)
       ORDER BY fecha`,
      [fechaInicio, fechaFin]
    );

    return {
      rango: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
      resumen: resumen.rows[0],
      productos_vendidos: productos.rows,
      ventas_por_dia: ventasPorDia.rows
    };
  },

  async obtenerProductosMasVendidos(limit = 10) {
    const result = await pool.query(
      `SELECT 
         p.id, p.codigo, p.nombre,
         SUM(dv.cantidad) as total_vendido,
         COUNT(DISTINCT v.id) as veces_vendido,
         SUM(dv.subtotal) as ingresos_generados
       FROM detalle_ventas dv
       JOIN productos p ON dv.producto_id = p.id
       JOIN ventas v ON dv.venta_id = v.id
       GROUP BY p.id, p.codigo, p.nombre
       ORDER BY total_vendido DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  }
};