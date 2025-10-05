
const jwt = require('jsonwebtoken');
const pool = require('../database/connection');

// Middleware para verificar token con blacklist
async function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  // El token debe venir en los headers: "Authorization: Bearer TOKEN"
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ ok: false, error: 'Token requerido' });
  }

  try {
    // 1. Verificar si el token está revocado (en blacklist)
    const revocado = await pool.query(
      'SELECT id FROM tokens_revocados WHERE token = $1',
      [token]
    );

    if (revocado.rows.length > 0) {
      return res.status(401).json({ 
        ok: false, 
        error: 'Sesión cerrada. Por favor, inicie sesión nuevamente.' 
      });
    }

    // 2. Verificar validez y firma del token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Guardamos info del usuario en la request
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        ok: false, 
        error: 'Token expirado. Por favor, inicie sesión nuevamente.' 
      });
    }
    return res.status(403).json({ 
      ok: false, 
      error: 'Token inválido' 
    });
  }
}

// Middleware para verificar rol
function verificarRol(rol) {
  return (req, res, next) => {
    if (req.user.rol !== rol) {
      return res.status(403).json({ 
        ok: false, 
        error: 'No tienes permisos para esta acción' 
      });
    }
    next();
  };
}

module.exports = { verificarToken, verificarRol };

