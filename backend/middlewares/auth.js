import jwt from 'jsonwebtoken';
import pool from '../database/connection.js';
import { MESSAGES, HTTP_STATUS } from '../constants/messages.js';

const verificarTokenRevocado = async (token) => {
  const result = await pool.query(
    'SELECT id FROM tokens_revocados WHERE token = $1',
    [token]
  );
  return result.rows.length > 0;
};

export const verificarToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
      ok: false, 
      error: MESSAGES.AUTH.TOKEN_REQUIRED 
    });
  }

  try {
    const esRevocado = await verificarTokenRevocado(token);
    
    if (esRevocado) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
        ok: false, 
        error: MESSAGES.AUTH.SESSION_CLOSED 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    const error = err.name === 'TokenExpiredError' 
      ? MESSAGES.AUTH.TOKEN_EXPIRED 
      : MESSAGES.AUTH.TOKEN_INVALID;
    
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
      ok: false, 
      error 
    });
  }
};

export const verificarRol = (rolRequerido) => {
  return (req, res, next) => {
    if (req.user.rol !== rolRequerido) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ 
        ok: false, 
        error: MESSAGES.AUTH.NO_PERMISSION 
      });
    }
    next();
  };
};