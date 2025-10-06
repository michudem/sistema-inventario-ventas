import express from 'express';
import PDFDocument from 'pdfkit';
import { verificarToken } from '../middlewares/auth.js';
import { reportesService } from '../services/reportesService.js';
import { MESSAGES, HTTP_STATUS } from '../constants/messages.js';

const router = express.Router();

router.use(verificarToken);

router.get('/ventas/diario', async (req, res) => {
  try {
    const reporte = await reportesService.obtenerReporteDiario(req.query.fecha);
    res.json({ ok: true, reporte });
  } catch (err) {
    console.error('[ERROR]', err);
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({ 
      ok: false, 
      error: MESSAGES.ERRORS.GENERATE_REPORT 
    });
  }
});

router.get('/ventas/diario/csv', async (req, res) => {
  try {
    const { fecha } = req.query;
    const datos = await reportesService.obtenerDatosCSV(fecha);

    const campos = Object.keys(datos[0]);
    const csv = [
      campos.join(','),
      ...datos.map(row => 
        campos.map(campo => {
          const valor = row[campo];
          return typeof valor === 'string' && valor.includes(',') 
            ? `"${valor}"` 
            : valor;
        }).join(',')
      )
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=reporte_${fecha}.csv`);
    res.send('\ufeff' + csv);
  } catch (err) {
    const status = err.status || HTTP_STATUS.INTERNAL_ERROR;
    const message = err.message || MESSAGES.ERRORS.GENERATE_CSV;
    res.status(status).json({ ok: false, error: message });
  }
});

router.get('/ventas/diario/pdf', async (req, res) => {
  try {
    const { fecha } = req.query;
    const reporte = await reportesService.obtenerReporteDiario(fecha);

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reporte_ventas_${reporte.fecha}.pdf`);

    doc.pipe(res);

    doc.fontSize(20).font('Helvetica-Bold').text('REPORTE DE VENTAS DIARIO', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').text(`Fecha: ${reporte.fecha}`, { align: 'center' });
    doc.moveDown(1);

    doc.fontSize(14).font('Helvetica-Bold').text('RESUMEN DEL DÍA');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica')
       .text(`Total de Transacciones: ${reporte.resumen.total_transacciones}`)
       .text(`Ingresos Totales: $${reporte.resumen.ingresos_totales.toLocaleString('es-CO')}`);
    
    doc.moveDown(1.5);
    doc.fontSize(14).font('Helvetica-Bold').text('PRODUCTOS VENDIDOS');
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const col1 = 50, col2 = 140, col3 = 280, col4 = 360, col5 = 460;

    doc.fontSize(10).font('Helvetica-Bold')
       .text('Código', col1, tableTop)
       .text('Producto', col2, tableTop)
       .text('Cantidad', col3, tableTop)
       .text('P. Unitario', col4, tableTop)
       .text('Total', col5, tableTop);

    doc.moveTo(col1, doc.y + 5).lineTo(550, doc.y + 5).stroke();
    doc.moveDown(0.5);

    doc.font('Helvetica');
    reporte.productos_vendidos.forEach(producto => {
      const y = doc.y;
      doc.text(producto.codigo, col1, y)
         .text(producto.nombre.substring(0, 18), col2, y)
         .text(producto.cantidad_vendida.toString(), col3, y)
         .text(`$${producto.precio_unitario.toLocaleString('es-CO')}`, col4, y)
         .text(`$${producto.total_vendido.toLocaleString('es-CO')}`, col5, y);
      doc.moveDown(0.3);
      if (doc.y > 700) doc.addPage();
    });

    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).font('Helvetica').text(
        `Generado: ${new Date().toLocaleString('es-CO')} | Página ${i + 1} de ${pages.count}`,
        50, doc.page.height - 50, { align: 'center' }
      );
    }

    doc.end();
  } catch (err) {
    console.error('[ERROR]', err);
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({ 
      ok: false, 
      error: MESSAGES.ERRORS.GENERATE_PDF 
    });
  }
});

router.get('/ventas/rango', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const reporte = await reportesService.obtenerReportePorRango(fecha_inicio, fecha_fin);
    res.json({ ok: true, ...reporte });
  } catch (err) {
    const status = err.status || HTTP_STATUS.INTERNAL_ERROR;
    const message = err.message || MESSAGES.ERRORS.GENERATE_REPORT;
    res.status(status).json({ ok: false, error: message });
  }
});

router.get('/productos/mas-vendidos', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const productos = await reportesService.obtenerProductosMasVendidos(limit);
    res.json({ ok: true, productos_mas_vendidos: productos });
  } catch (err) {
    console.error('[ERROR]', err);
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({ 
      ok: false, 
      error: MESSAGES.ERRORS.GENERATE_REPORT 
    });
  }
});

export default router;