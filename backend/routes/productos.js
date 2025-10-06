import express from 'express';
import { verificarToken, verificarRol } from '../middlewares/auth.js';
import { productosService } from '../services/productosService.js';
import { MESSAGES, HTTP_STATUS } from '../constants/messages.js';

const router = express.Router();

router.use(verificarToken);

router.get('/', async (req, res) => {
  try {
    const productos = await productosService.obtenerTodos();
    res.json({ ok: true, productos });
  } catch (err) {
    console.error('[ERROR]', err);
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({ 
      ok: false, 
      error: MESSAGES.ERRORS.GET_PRODUCTS 
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const producto = await productosService.obtenerPorId(req.params.id);
    res.json({ ok: true, producto });
  } catch (err) {
    const status = err.status || HTTP_STATUS.INTERNAL_ERROR;
    const message = err.message || MESSAGES.ERRORS.GET_PRODUCT;
    res.status(status).json({ ok: false, error: message });
  }
});

router.post('/', verificarRol('ADMIN'), async (req, res) => {
  try {
    const producto = await productosService.crear(req.body);
    res.status(HTTP_STATUS.CREATED).json({ 
      ok: true, 
      producto,
      mensaje: MESSAGES.PRODUCTS.CREATED
    });
  } catch (err) {
    const status = err.status || HTTP_STATUS.INTERNAL_ERROR;
    const message = err.message || MESSAGES.ERRORS.CREATE_PRODUCT;
    res.status(status).json({ ok: false, error: message });
  }
});

router.put('/:id', verificarRol('ADMIN'), async (req, res) => {
  try {
    const producto = await productosService.actualizar(req.params.id, req.body);
    res.json({ 
      ok: true, 
      producto,
      mensaje: MESSAGES.PRODUCTS.UPDATED
    });
  } catch (err) {
    const status = err.status || HTTP_STATUS.INTERNAL_ERROR;
    const message = err.message || MESSAGES.ERRORS.UPDATE_PRODUCT;
    res.status(status).json({ ok: false, error: message });
  }
});

router.delete('/:id', verificarRol('ADMIN'), async (req, res) => {
  try {
    const producto = await productosService.eliminar(req.params.id);
    res.json({ 
      ok: true, 
      mensaje: MESSAGES.PRODUCTS.DELETED,
      producto 
    });
  } catch (err) {
    const status = err.status || HTTP_STATUS.INTERNAL_ERROR;
    const message = err.message || MESSAGES.ERRORS.DELETE_PRODUCT;
    res.status(status).json({ ok: false, error: message });
  }
});

export default router;