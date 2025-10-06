import express from 'express';
import jwt from 'jsonwebtoken';
import { verificarToken, verificarRol } from '../middlewares/auth.js';
import { authService } from '../services/authService.js';
import { MESSAGES, HTTP_STATUS } from '../constants/messages.js';

const router = express.Router();

router.post('/registro', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.rol !== 'ADMIN') {
        return res.status(HTTP_STATUS.FORBIDDEN).json({ 
          ok: false, 
          error: MESSAGES.AUTH.ONLY_ADMIN 
        });
      }
    }

    const usuario = await authService.registrarUsuario(req.body, !!authHeader);
    res.status(HTTP_STATUS.CREATED).json({ ok: true, usuario });
  } catch (err) {
    if (err.requiresAuth) {
      return res.status(err.status).json({ ok: false, error: err.message });
    }

    console.error('[ERROR]', err);
    const status = err.code === '23505' ? HTTP_STATUS.CONFLICT : HTTP_STATUS.INTERNAL_ERROR;
    const message = err.code === '23505' ? MESSAGES.AUTH.USER_EXISTS : MESSAGES.ERRORS.REGISTER;
    res.status(status).json({ ok: false, error: message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress || 'Desconocida';
    const userAgent = req.headers['user-agent'] || 'Desconocido';

    const result = await authService.login(username, password, ip, userAgent);
    res.json({ ok: true, ...result });
  } catch (err) {
    const status = err.status || HTTP_STATUS.INTERNAL_ERROR;
    const message = err.message || MESSAGES.ERRORS.LOGIN;
    res.status(status).json({ ok: false, error: message });
  }
});

router.post('/logout', verificarToken, async (req, res) => {
  try {
    const token = req.headers['authorization'].split(' ')[1];
    await authService.logout(token, req.user.id);
    res.json({ ok: true, mensaje: MESSAGES.AUTH.LOGOUT_SUCCESS });
  } catch (err) {
    console.error('[ERROR]', err);
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({ 
      ok: false, 
      error: MESSAGES.ERRORS.LOGOUT 
    });
  }
});

router.get('/intentos-login', async (req, res) => {
  try {
    const { limit = 50, exitoso } = req.query;
    const intentos = await authService.obtenerIntentosLogin(limit, exitoso);
    res.json({ ok: true, total: intentos.length, intentos });
  } catch (err) {
    console.error('[ERROR]', err);
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({ 
      ok: false, 
      error: MESSAGES.ERRORS.GET_ATTEMPTS 
    });
  }
});

router.get('/tokens-revocados', verificarToken, verificarRol('ADMIN'), async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const tokens = await authService.obtenerTokensRevocados(limit);
    res.json({ ok: true, total: tokens.length, tokens_revocados: tokens });
  } catch (err) {
    console.error('[ERROR]', err);
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({ 
      ok: false, 
      error: MESSAGES.ERRORS.GET_TOKENS 
    });
  }
});

router.delete('/limpiar-tokens', verificarToken, verificarRol('ADMIN'), async (req, res) => {
  try {
    const eliminados = await authService.limpiarTokensAntiguos();
    res.json({ 
      ok: true, 
      eliminados,
      mensaje: `${eliminados} tokens antiguos eliminados correctamente` 
    });
  } catch (err) {
    console.error('[ERROR]', err);
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({ 
      ok: false, 
      error: MESSAGES.ERRORS.CLEAN_TOKENS 
    });
  }
});

router.get('/', verificarToken, verificarRol('ADMIN'), async (req, res) => {
  try {
    const usuarios = await authService.obtenerTodosLosUsuarios();
    res.json({ ok: true, usuarios });
  } catch (err) {
    console.error('[ERROR]', err);
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({ 
      ok: false, 
      error: MESSAGES.ERRORS.GET_USERS 
    });
  }
});

router.get('/:id', verificarToken, verificarRol('ADMIN'), async (req, res) => {
  try {
    const usuario = await authService.obtenerUsuarioPorId(req.params.id);
    res.json({ ok: true, usuario });
  } catch (err) {
    const status = err.status || HTTP_STATUS.INTERNAL_ERROR;
    const message = err.message || MESSAGES.ERRORS.GET_USER;
    res.status(status).json({ ok: false, error: message });
  }
});

router.put('/:id', verificarToken, verificarRol('ADMIN'), async (req, res) => {
  try {
    const usuario = await authService.actualizarUsuario(req.params.id, req.body);
    res.json({ 
      ok: true, 
      usuario,
      mensaje: 'Usuario actualizado exitosamente'
    });
  } catch (err) {
    const status = err.code === '23505' ? HTTP_STATUS.CONFLICT : (err.status || HTTP_STATUS.INTERNAL_ERROR);
    const message = err.code === '23505' ? 'El nombre de usuario ya existe' : (err.message || MESSAGES.ERRORS.UPDATE_USER);
    res.status(status).json({ ok: false, error: message });
  }
});

router.delete('/:id', verificarToken, verificarRol('ADMIN'), async (req, res) => {
  try {
    const usuario = await authService.eliminarUsuario(req.params.id);
    res.json({ 
      ok: true, 
      mensaje: 'Usuario eliminado correctamente',
      usuario
    });
  } catch (err) {
    const status = err.status || HTTP_STATUS.INTERNAL_ERROR;
    const message = err.message || MESSAGES.ERRORS.DELETE_USER;
    res.status(status).json({ ok: false, error: message });
  }
});

export default router;