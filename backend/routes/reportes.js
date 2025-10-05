// ================================================
// MÓDULO DE REPORTES DE VENTAS
// ================================================

const express = require('express');
const pool = require('../database/connection');
const { verificarToken } = require('../middlewares/auth');
const PDFDocument = require('pdfkit');
const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// ========================
// REPORTE DIARIO DE VENTAS (JSON)
// ========================
router.get('/ventas/diario', async (req, res) => {
  try {
    const { fecha } = req.query;
    
    // Si no se proporciona fecha, usar hoy
    const fechaConsulta = fecha || new Date().toISOString().split('T')[0];

    // 1. Obtener número total de transacciones del día
    const transaccionesResult = await pool.query(
      `SELECT COUNT(*) as total_transacciones, 
              COALESCE(SUM(total), 0) as ingresos_totales
       FROM ventas 
       WHERE DATE(fecha) = $1`,
      [fechaConsulta]
    );

    // 2. Obtener productos vendidos con cantidades y totales
    const productosResult = await pool.query(
      `SELECT 
         p.id,
         p.codigo,
         p.nombre,
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

    // 3. Obtener detalle de todas las ventas del día
    const ventasResult = await pool.query(
      `SELECT 
         v.id,
         v.numero_transaccion,
         v.fecha,
         v.total,
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

    // Construir respuesta
    const reporte = {
      fecha: fechaConsulta,
      resumen: {
        total_transacciones: parseInt(transaccionesResult.rows[0].total_transacciones),
        ingresos_totales: parseFloat(transaccionesResult.rows[0].ingresos_totales)
      },
      productos_vendidos: productosResult.rows.map(p => ({
        id: p.id,
        codigo: p.codigo,
        nombre: p.nombre,
        cantidad_vendida: parseInt(p.cantidad_vendida),
        precio_unitario: parseFloat(p.precio_unitario),
        total_vendido: parseFloat(p.total_vendido)
      })),
      detalle_ventas: ventasResult.rows
    };

    res.json({
      ok: true,
      reporte
    });

  } catch (err) {
    console.error('Error al generar reporte:', err);
    res.status(500).json({ 
      ok: false, 
      error: 'Error al generar reporte de ventas' 
    });
  }
});

// ========================
// EXPORTAR REPORTE EN CSV
// ========================
router.get('/ventas/diario/csv', async (req, res) => {
  try {
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Debe proporcionar una fecha' 
      });
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
      return res.status(404).json({ 
        ok: false, 
        error: 'No hay ventas para esta fecha' 
      });
    }

    // Convertir a CSV
    const campos = Object.keys(result.rows[0]);
    const csv = [
      campos.join(','),
      ...result.rows.map(row => 
        campos.map(campo => {
          const valor = row[campo];
          // Escapar valores que contengan comas
          return typeof valor === 'string' && valor.includes(',') 
            ? `"${valor}"` 
            : valor;
        }).join(',')
      )
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=reporte_${fecha}.csv`);
    res.send('\ufeff' + csv); // BOM para UTF-8
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ 
      ok: false, 
      error: 'Error al generar reporte CSV' 
    });
  }
});

// ========================
// EXPORTAR REPORTE DIARIO EN PDF
// ========================
router.get('/ventas/diario/pdf', async (req, res) => {
  try {
    const { fecha } = req.query;
    const fechaConsulta = fecha || new Date().toISOString().split('T')[0];

    // Obtener datos del reporte
    const transaccionesResult = await pool.query(
      `SELECT COUNT(*) as total_transacciones, 
              COALESCE(SUM(total), 0) as ingresos_totales
       FROM ventas 
       WHERE DATE(fecha) = $1`,
      [fechaConsulta]
    );

    const productosResult = await pool.query(
      `SELECT 
         p.codigo,
         p.nombre,
         SUM(dv.cantidad) as cantidad_vendida,
         dv.precio_unitario,
         SUM(dv.subtotal) as total_vendido
       FROM detalle_ventas dv
       JOIN ventas v ON dv.venta_id = v.id
       JOIN productos p ON dv.producto_id = p.id
       WHERE DATE(v.fecha) = $1
       GROUP BY p.codigo, p.nombre, dv.precio_unitario
       ORDER BY cantidad_vendida DESC`,
      [fechaConsulta]
    );

    const ventasResult = await pool.query(
      `SELECT 
         v.numero_transaccion,
         v.fecha,
         v.total,
         u.username as cajero
       FROM ventas v
       JOIN usuarios u ON v.usuario_id = u.id
       WHERE DATE(v.fecha) = $1
       ORDER BY v.fecha DESC`,
      [fechaConsulta]
    );

    // Crear el documento PDF
    const doc = new PDFDocument({ margin: 50 });

    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reporte_ventas_${fechaConsulta}.pdf`);

    // Pipe del PDF a la respuesta
    doc.pipe(res);

    // ===== ENCABEZADO =====
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text('REPORTE DE VENTAS DIARIO', { align: 'center' });
    
    doc.moveDown(0.5);
    doc.fontSize(12)
       .font('Helvetica')
       .text(`Fecha: ${fechaConsulta}`, { align: 'center' });
    
    doc.moveDown(1);

    // ===== RESUMEN =====
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('RESUMEN DEL DÍA');
    
    doc.moveDown(0.5);
    
    const resumen = transaccionesResult.rows[0];
    doc.fontSize(11)
       .font('Helvetica')
       .text(`Total de Transacciones: ${resumen.total_transacciones}`)
       .text(`Ingresos Totales: $${parseFloat(resumen.ingresos_totales).toLocaleString('es-CO')}`);
    
    doc.moveDown(1.5);

    // ===== PRODUCTOS VENDIDOS =====
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('PRODUCTOS VENDIDOS');
    
    doc.moveDown(0.5);

    // Tabla de productos
    const tableTop = doc.y;
    const col1 = 50;
    const col2 = 140;
    const col3 = 280;
    const col4 = 360;
    const col5 = 460;

    // Encabezados de tabla
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('Código', col1, tableTop)
       .text('Producto', col2, tableTop)
       .text('Cantidad', col3, tableTop)
       .text('P. Unitario', col4, tableTop)
       .text('Total', col5, tableTop);

    // Línea debajo de encabezados
    doc.moveTo(col1, doc.y + 5)
       .lineTo(550, doc.y + 5)
       .stroke();

    doc.moveDown(0.5);

    // Datos de productos
    doc.font('Helvetica');
    productosResult.rows.forEach((producto, index) => {
      const y = doc.y;
      
      doc.text(producto.codigo, col1, y)
         .text(producto.nombre.substring(0, 18), col2, y)
         .text(producto.cantidad_vendida.toString(), col3, y)
         .text(`$${parseFloat(producto.precio_unitario).toLocaleString('es-CO')}`, col4, y)
         .text(`$${parseFloat(producto.total_vendido).toLocaleString('es-CO')}`, col5, y);
      
      doc.moveDown(0.3);

      // Nueva página si se llena
      if (doc.y > 700) {
        doc.addPage();
      }
    });

    doc.moveDown(1.5);

    // ===== DETALLE DE VENTAS =====
    if (ventasResult.rows.length > 0) {
        // Nueva página si queda poco espacio
        if (doc.y > 600) {
            doc.addPage();
        }

        doc.fontSize(14)
            .font('Helvetica-Bold')
            .text('DETALLE DE TRANSACCIONES', 50); 
        
        doc.moveDown(0.5);

        // Encabezados de la tabla
        const vTableTop = doc.y;
        
        doc.fontSize(10)
            .font('Helvetica-Bold')
            .text('No. Transacción', 50, vTableTop, { width: 180 })
            .text('Hora', 240, vTableTop, { width: 80 })
            .text('Cajero', 330, vTableTop, { width: 100 })
            .text('Total', 440, vTableTop, { width: 100, align: 'right' });

        // Línea separadora
        doc.moveTo(50, doc.y + 3)
            .lineTo(550, doc.y + 3)
            .stroke();

        doc.moveDown(0.3);

        // Datos de las ventas
        doc.font('Helvetica').fontSize(9);
        
        ventasResult.rows.forEach(venta => {
            const y = doc.y;
            const hora = new Date(venta.fecha).toLocaleTimeString('es-CO', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            doc.text(venta.numero_transaccion, 50, y, { width: 180 })
                .text(hora, 240, y, { width: 80 })
                .text(venta.cajero, 330, y, { width: 100 })
                .text(`$${parseFloat(venta.total).toLocaleString('es-CO')}`, 440, y, { width: 100, align: 'right' });
            
            doc.moveDown(0.4);

            if (doc.y > 720) {
                doc.addPage();
            }
        });
    }

    // ===== PIE DE PÁGINA =====
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      
      doc.fontSize(8)
         .font('Helvetica')
         .text(
           `Generado: ${new Date().toLocaleString('es-CO')} | Página ${i + 1} de ${pages.count}`,
           50,
           doc.page.height - 50,
           { align: 'center' }
         );
    }

    // Finalizar el PDF
    doc.end();

  } catch (err) {
    console.error('Error al generar PDF:', err);
    res.status(500).json({ 
      ok: false, 
      error: 'Error al generar PDF' 
    });
  }
});

// ========================
// REPORTE POR RANGO DE FECHAS
// ========================
router.get('/ventas/rango', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Debe proporcionar fecha_inicio y fecha_fin' 
      });
    }

    // Resumen del rango
    const resumenResult = await pool.query(
      `SELECT 
         COUNT(*) as total_transacciones,
         COALESCE(SUM(total), 0) as ingresos_totales,
         DATE(MIN(fecha)) as primera_venta,
         DATE(MAX(fecha)) as ultima_venta
       FROM ventas 
       WHERE DATE(fecha) BETWEEN $1 AND $2`,
      [fecha_inicio, fecha_fin]
    );

    // Productos vendidos en el rango
    const productosResult = await pool.query(
      `SELECT 
         p.codigo,
         p.nombre,
         SUM(dv.cantidad) as cantidad_vendida,
         AVG(dv.precio_unitario) as precio_promedio,
         SUM(dv.subtotal) as total_vendido
       FROM detalle_ventas dv
       JOIN ventas v ON dv.venta_id = v.id
       JOIN productos p ON dv.producto_id = p.id
       WHERE DATE(v.fecha) BETWEEN $1 AND $2
       GROUP BY p.codigo, p.nombre
       ORDER BY cantidad_vendida DESC`,
      [fecha_inicio, fecha_fin]
    );

    // Ventas por día
    const ventasPorDiaResult = await pool.query(
      `SELECT 
         DATE(fecha) as fecha,
         COUNT(*) as transacciones,
         SUM(total) as ingresos
       FROM ventas
       WHERE DATE(fecha) BETWEEN $1 AND $2
       GROUP BY DATE(fecha)
       ORDER BY fecha`,
      [fecha_inicio, fecha_fin]
    );

    res.json({
      ok: true,
      rango: {
        fecha_inicio,
        fecha_fin
      },
      resumen: resumenResult.rows[0],
      productos_vendidos: productosResult.rows,
      ventas_por_dia: ventasPorDiaResult.rows
    });

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ 
      ok: false, 
      error: 'Error al generar reporte por rango' 
    });
  }
});

// ========================
// REPORTE DE PRODUCTOS MÁS VENDIDOS
// ========================
router.get('/productos/mas-vendidos', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const result = await pool.query(
      `SELECT 
         p.id,
         p.codigo,
         p.nombre,
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

    res.json({
      ok: true,
      productos_mas_vendidos: result.rows
    });

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ 
      ok: false, 
      error: 'Error al obtener productos más vendidos' 
    });
  }
});

module.exports = router;