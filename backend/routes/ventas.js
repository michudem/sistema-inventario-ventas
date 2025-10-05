// ================================================
// RUTAS DE VENTAS - AUTENTICACIÓN Y AUTORIZACIÓN
// ================================================

const express = require('express');
const pool = require('../database/connection');
const { verificarToken } = require('../middlewares/auth');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// ========================
// REGISTRAR VENTA
// ========================
router.post('/', async (req, res) => {
  // OBTENER UNA CONEXIÓN ESPECIAL (para transacciones)
  const client = await pool.connect();
  
  try {
    // 1. EXTRAER DATOS DEL CUERPO DE LA PETICIÓN
    const { productos } = req.body;

    // 2. VALIDAR que haya productos
    if (!productos || productos.length === 0) {
      return res.status(400).json({ 
        ok: false, 
        error: 'La venta debe incluir al menos un producto' 
      });
    }

    // 3. INICIAR TRANSACCIÓN
    await client.query('BEGIN');

    let totalVenta = 0;

    // 4. VALIDAR STOCK Y CALCULAR TOTAL
    for (const item of productos) {
      const { producto_id, cantidad } = item;

      // Validar que los datos sean correctos
      if (!producto_id || !cantidad || cantidad <= 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          ok: false, 
          error: 'Datos de producto inválidos' 
        });
      }

      // Buscar el producto en la BD
      const productoResult = await client.query(
        'SELECT id, nombre, precio_unitario, cantidad FROM productos WHERE id=$1',
        [producto_id]
      );

      // ¿Existe el producto?
      if (productoResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ 
          ok: false, 
          error: `Producto con ID ${producto_id} no encontrado` 
        });
      }

      const producto = productoResult.rows[0];

      // ¿Hay suficiente stock?
      if (producto.cantidad < cantidad) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          ok: false, 
          error: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.cantidad}, Solicitado: ${cantidad}` 
        });
      }

      // Sumar al total
      totalVenta += producto.precio_unitario * cantidad;
    }

    // 5. CREAR REGISTRO DE VENTA (primero con número temporal)
    const ventaResult = await client.query(
      'INSERT INTO ventas (numero_transaccion, usuario_id, total) VALUES ($1, $2, $3) RETURNING *',
      [`VT-TEMP-${Date.now()}`, req.user.id, totalVenta]
    );

    const venta = ventaResult.rows[0];

    // 6. ACTUALIZAR CON NÚMERO DE TRANSACCIÓN REAL
    const numeroTransaccion = `VT-${String(venta.id).padStart(4, '0')}`;
    await client.query(
      'UPDATE ventas SET numero_transaccion = $1 WHERE id = $2',
      [numeroTransaccion, venta.id]
    );

    // 7. CREAR DETALLE Y ACTUALIZAR STOCK
    for (const item of productos) {
      const { producto_id, cantidad } = item;

      // Obtener precio del producto
      const productoResult = await client.query(
        'SELECT precio_unitario FROM productos WHERE id=$1',
        [producto_id]
      );
      
      const precioUnitario = productoResult.rows[0].precio_unitario;
      const subtotal = precioUnitario * cantidad;

      // Insertar en detalle_ventas
      await client.query(
        'INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES ($1, $2, $3, $4, $5)',
        [venta.id, producto_id, cantidad, precioUnitario, subtotal]
      );

      // Actualizar stock (restar cantidad vendida)
      await client.query(
        'UPDATE productos SET cantidad = cantidad - $1 WHERE id = $2',
        [cantidad, producto_id]
      );
    }

    // 8. CONFIRMAR TRANSACCIÓN
    await client.query('COMMIT');

    // 9. OBTENER VENTA COMPLETA CON DETALLES
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

    // 10. RESPONDER CON LA VENTA CREADA
    res.status(201).json({ 
      ok: true, 
      venta: ventaCompleta.rows[0],
      mensaje: 'Venta registrada exitosamente'
    });

  } catch (err) {
    // Si hay error, deshacer todo
    await client.query('ROLLBACK');
    console.error('Error al procesar venta:', err);
    res.status(500).json({ 
      ok: false, 
      error: 'Error al procesar venta' 
    });
  } finally {
    // Siempre liberar la conexión
    client.release();
  }
});

// ========================
// LISTAR VENTAS
// ========================
router.get('/', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, page = 1, limit = 10 } = req.query;
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

    // Filtro opcional por fechas
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

    res.json({
      ok: true,
      pagina: page,
      ventas: result.rows
    });
  } catch (err) {
    console.error('Error al obtener ventas:', err);
    res.status(500).json({ 
      ok: false, 
      error: 'Error al obtener ventas' 
    });
  }
});

// ========================
// VER VENTA POR ID
// ========================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

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
      return res.status(404).json({ 
        ok: false, 
        error: 'Venta no encontrada' 
      });
    }

    res.json({ 
      ok: true, 
      venta: result.rows[0] 
    });
  } catch (err) {
    console.error('Error al obtener venta:', err);
    res.status(500).json({ 
      ok: false, 
      error: 'Error al obtener venta' 
    });
  }
});

// ========================
// GENERAR TICKET PDF
// ========================
router.get('/:id/ticket-pdf', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT v.*, u.username,
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
       WHERE v.id = $1
       GROUP BY v.id, u.username`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Venta no encontrada' });
    }

    const venta = result.rows[0];
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ 
      margin: 20, 
      size: [226.77, 841.89]
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ticket_${venta.numero_transaccion}.pdf`);

    doc.pipe(res);

    // Encabezado
    doc.fontSize(14).font('Helvetica-Bold').text('TICKET DE VENTA', { align: 'center' });
    doc.fontSize(9).font('Helvetica').text('Sistema de Inventario', { align: 'center' });
    doc.moveDown(0.5);
    
    doc.moveTo(20, doc.y).lineTo(206, doc.y).stroke();
    doc.moveDown(0.5);

    doc.fontSize(9).font('Helvetica');
    doc.text(`Ticket: ${venta.numero_transaccion}`);
    doc.text(`Fecha: ${new Date(venta.fecha).toLocaleString('es-CO')}`);
    doc.text(`Cajero: ${venta.username}`);
    doc.moveDown(0.5);

    doc.moveTo(20, doc.y).lineTo(206, doc.y).stroke();
    doc.moveDown(0.5);

    // Encabezados de tabla
    doc.fontSize(9).font('Helvetica-Bold');
    const headerY = doc.y;
    doc.text('PRODUCTO', 20, headerY, { width: 90, align: 'left' });
    doc.text('CANT', 90, headerY, { width: 25, align: 'center' });
    doc.text('PRECIO', 135, headerY, { width: 35, align: 'right' });
    doc.text('TOTAL', 170, headerY, { width: 36, align: 'right' });
    
    doc.moveDown(0.3);
    doc.moveTo(20, doc.y).lineTo(206, doc.y).stroke();
    doc.moveDown(0.5);

    // Productos
    doc.font('Helvetica').fontSize(8);
    venta.productos.forEach(item => {
      const yPos = doc.y;
      const nombreCorto = item.producto.length > 18 
        ? item.producto.substring(0, 18) 
        : item.producto;
      
      doc.text(nombreCorto, 20, yPos, { width: 90, align: 'left' });
      doc.text(item.cantidad.toString(), 90, yPos, { width: 25, align: 'center' });
      doc.text(`$${item.precio_unitario.toLocaleString()}`, 135, yPos, { width: 35, align: 'right' });
      doc.text(`$${item.subtotal.toLocaleString()}`, 170, yPos, { width: 36, align: 'right' });
      
      doc.moveDown(0.8);
    });

    doc.moveDown(0.3);
    doc.moveTo(20, doc.y).lineTo(206, doc.y).stroke();
    doc.moveDown(0.5);

    // Total
    doc.fontSize(12).font('Helvetica-Bold');
    const totalY = doc.y;
    doc.text('TOTAL:', 20, totalY, { width: 90, align: 'left' });
    doc.text(`$${parseFloat(venta.total).toLocaleString('es-CO')}`, 110, totalY, { width: 96, align: 'right' });
    
    doc.moveDown(1);
    doc.fontSize(9).font('Helvetica').text('¡Gracias por su compra!', { align: 'center' });

    doc.end();
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ ok: false, error: 'Error al generar ticket' });
  }
});

module.exports = router;