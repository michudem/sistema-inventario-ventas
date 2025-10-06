import express from 'express';
import PDFDocument from 'pdfkit';
import { verificarToken } from '../middlewares/auth.js';
import { ventasService } from '../services/ventasService.js';
import { MESSAGES, HTTP_STATUS } from '../constants/messages.js';

const router = express.Router();

router.use(verificarToken);

router.post('/', async (req, res) => {
  try {
    const { productos } = req.body;
    const venta = await ventasService.procesarVenta(productos, req.user.id);
    
    res.status(HTTP_STATUS.CREATED).json({ 
      ok: true, 
      venta,
      mensaje: MESSAGES.SALES.CREATED
    });
  } catch (err) {
    const status = err.status || HTTP_STATUS.INTERNAL_ERROR;
    const message = err.message || MESSAGES.ERRORS.PROCESS_SALE;
    console.error('[ERROR]', err);
    res.status(status).json({ ok: false, error: message });
  }
});

router.get('/', async (req, res) => {
  try {
    const ventas = await ventasService.obtenerVentas(req.query);
    res.json({ ok: true, pagina: req.query.page || 1, ventas });
  } catch (err) {
    console.error('[ERROR]', err);
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({ 
      ok: false, 
      error: MESSAGES.ERRORS.GET_SALES 
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const venta = await ventasService.obtenerVentaPorId(req.params.id);
    res.json({ ok: true, venta });
  } catch (err) {
    const status = err.status || HTTP_STATUS.INTERNAL_ERROR;
    const message = err.message || MESSAGES.ERRORS.GET_SALE;
    res.status(status).json({ ok: false, error: message });
  }
});

router.get('/:id/ticket-pdf', async (req, res) => {
  try {
    const venta = await ventasService.obtenerVentaPorId(req.params.id);

    const doc = new PDFDocument({ 
      margin: 20, 
      size: [226.77, 841.89]
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ticket_${venta.numero_transaccion}.pdf`);

    doc.pipe(res);

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

    doc.fontSize(9).font('Helvetica-Bold');
    const headerY = doc.y;
    doc.text('PRODUCTO', 20, headerY, { width: 90, align: 'left' });
    doc.text('CANT', 90, headerY, { width: 25, align: 'center' });
    doc.text('PRECIO', 135, headerY, { width: 35, align: 'right' });
    doc.text('TOTAL', 170, headerY, { width: 36, align: 'right' });
    
    doc.moveDown(0.3);
    doc.moveTo(20, doc.y).lineTo(206, doc.y).stroke();
    doc.moveDown(0.5);

    doc.font('Helvetica').fontSize(8);
    venta.productos.forEach(item => {
      const yPos = doc.y;
      const nombreCorto = item.nombre.length > 18 
        ? item.nombre.substring(0, 18) 
        : item.nombre;
      
      doc.text(nombreCorto, 20, yPos, { width: 90, align: 'left' });
      doc.text(item.cantidad.toString(), 90, yPos, { width: 25, align: 'center' });
      doc.text(`$${item.precio_unitario.toLocaleString()}`, 135, yPos, { width: 35, align: 'right' });
      doc.text(`$${item.subtotal.toLocaleString()}`, 170, yPos, { width: 36, align: 'right' });
      
      doc.moveDown(0.8);
    });

    doc.moveDown(0.3);
    doc.moveTo(20, doc.y).lineTo(206, doc.y).stroke();
    doc.moveDown(0.5);

    doc.fontSize(12).font('Helvetica-Bold');
    const totalY = doc.y;
    doc.text('TOTAL:', 20, totalY, { width: 90, align: 'left' });
    doc.text(`$${parseFloat(venta.total).toLocaleString('es-CO')}`, 110, totalY, { width: 96, align: 'right' });
    
    doc.moveDown(1);
    doc.fontSize(9).font('Helvetica').text('¡Gracias por su compra!', { align: 'center' });

    doc.end();
  } catch (err) {
    console.error('[ERROR]', err);
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({ 
      ok: false, 
      error: MESSAGES.ERRORS.GENERATE_TICKET 
    });
  }
});

export default router;