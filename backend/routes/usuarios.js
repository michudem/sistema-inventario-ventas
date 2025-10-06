const { verificarToken, verificarRol } = require('../middlewares/auth');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../database/connection');

const router = express.Router();


router.post('/registro', async (req, res) => {
  try {
    const { username, password, rol } = req.body;

  
    if (!username || !password || !rol) {
      return res.status(400).json({ ok: false, error: 'Faltan datos' });
    }


    const totalUsuarios = await pool.query('SELECT COUNT(*) FROM usuarios');
    const hayUsuarios = parseInt(totalUsuarios.rows[0].count) > 0;


    if (hayUsuarios) {
      const authHeader = req.headers['authorization'];
      if (!authHeader) {
        return res.status(401).json({ ok: false, error: 'Token requerido' });
      }

      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.rol !== 'ADMIN') {
          return res.status(403).json({ ok: false, error: 'Solo los administradores pueden crear usuarios' });
        }
      } catch (e) {
        return res.status(401).json({ ok: false, error: 'Token inválido o expirado' });
      }
    }


    if (rol !== 'ADMIN' && rol !== 'CAJERO') {
      return res.status(400).json({ ok: false, error: 'Rol inválido' });
    }


    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO usuarios (username, password, rol) VALUES ($1, $2, $3) RETURNING id, username, rol, creado_en',
      [username, hashedPassword, rol]
    );

    res.status(201).json({ ok: true, usuario: result.rows[0] });
  } catch (err) {
    console.error('Error en registro:', err);
    if (err.code === '23505') {
      return res.status(409).json({ ok: false, error: 'El usuario ya existe' });
    }
    res.status(500).json({ ok: false, error: 'Error al registrar usuario' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;


    const ip = req.ip || req.connection.remoteAddress || 'Desconocida';
    const userAgent = req.headers['user-agent'] || 'Desconocido';


    const result = await pool.query('SELECT * FROM usuarios WHERE username=$1', [username]);
    
    if (result.rows.length === 0) {

      await pool.query(
        'INSERT INTO intentos_inicio_sesion (usuario, exitoso, ip, user_agent) VALUES ($1, $2, $3, $4)',
        [username, false, ip, userAgent]
      );

      return res.status(401).json({ ok: false, error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];

    // Comparar contraseñas
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
  
      await pool.query(
        'INSERT INTO intentos_inicio_sesion (usuario, exitoso, ip, user_agent) VALUES ($1, $2, $3, $4)',
        [username, false, ip, userAgent]
      );

      return res.status(401).json({ ok: false, error: 'Contraseña incorrecta' });
    }


    await pool.query(
      'INSERT INTO intentos_inicio_sesion (usuario, exitoso, ip, user_agent) VALUES ($1, $2, $3, $4)',
      [username, true, ip, userAgent]
    );


    const token = jwt.sign(
      { id: user.id, username: user.username, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || '8h' }
    );

    res.json({ 
      ok: true, 
      token,
      usuario: {
        id: user.id,
        username: user.username,
        rol: user.rol
      }
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ ok: false, error: 'Error en login' });
  }
});

router.get('/intentos-login', async (req, res) => {
  try {
    const { limit = 50, exitoso } = req.query;

    let query = 'SELECT * FROM intentos_inicio_sesion';
    const params = [];


    if (exitoso !== undefined) {
      query += ' WHERE exitoso = $1';
      params.push(exitoso === 'true');
    }

    query += ' ORDER BY fecha DESC LIMIT $' + (params.length + 1);
    params.push(limit);

    const result = await pool.query(query, params);

    res.json({
      ok: true,
      total: result.rows.length,
      intentos: result.rows
    });
  } catch (err) {
    console.error('Error al obtener intentos:', err);
    res.status(500).json({ ok: false, error: 'Error al obtener intentos de login' });
  }
});


router.get('/intentos-login/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { limit = 20 } = req.query;

    const result = await pool.query(
      'SELECT * FROM intentos_inicio_sesion WHERE usuario = $1 ORDER BY fecha DESC LIMIT $2',
      [username, limit]
    );

    res.json({
      ok: true,
      usuario: username,
      total: result.rows.length,
      intentos: result.rows
    });
  } catch (err) {
    console.error('Error al obtener intentos:', err);
    res.status(500).json({ ok: false, error: 'Error al obtener intentos' });
  }
});



router.post('/logout', verificarToken, async (req, res) => {
  try {
    const token = req.headers['authorization'].split(' ')[1];
    

    await pool.query(
      'INSERT INTO tokens_revocados (token, usuario_id) VALUES ($1, $2)',
      [token, req.user.id]
    );

    res.json({ 
      ok: true, 
      mensaje: 'Sesión cerrada correctamente' 
    });
  } catch (err) {
    console.error('Error en logout:', err);
    res.status(500).json({ ok: false, error: 'Error al cerrar sesión' });
  }
});


router.delete('/limpiar-tokens', verificarToken, verificarRol('ADMIN'), async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM tokens_revocados 
       WHERE revocado_en < NOW() - INTERVAL '8 hours' 
       RETURNING *`
    );

    res.json({ 
      ok: true, 
      eliminados: result.rowCount,
      mensaje: `${result.rowCount} tokens antiguos eliminados correctamente` 
    });
  } catch (err) {
    console.error('Error al limpiar tokens:', err);
    res.status(500).json({ ok: false, error: 'Error al limpiar tokens' });
  }
});


router.get('/tokens-revocados', verificarToken, verificarRol('ADMIN'), async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const result = await pool.query(
      `SELECT tr.id, tr.token, tr.revocado_en, u.username 
       FROM tokens_revocados tr
       JOIN usuarios u ON tr.usuario_id = u.id
       ORDER BY tr.revocado_en DESC
       LIMIT $1`,
      [limit]
    );

    res.json({
      ok: true,
      total: result.rows.length,
      tokens_revocados: result.rows
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ ok: false, error: 'Error al obtener tokens' });
  }
});




router.get('/', verificarToken, verificarRol('ADMIN'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, rol, creado_en FROM usuarios ORDER BY creado_en DESC'
    );
    
    res.json({ 
      ok: true, 
      usuarios: result.rows 
    });
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ ok: false, error: 'Error al obtener usuarios' });
  }
});


router.get('/:id', verificarToken, verificarRol('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT id, username, rol, creado_en FROM usuarios WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
    }

    res.json({ ok: true, usuario: result.rows[0] });
  } catch (err) {
    console.error('Error al obtener usuario:', err);
    res.status(500).json({ ok: false, error: 'Error al obtener usuario' });
  }
});


router.put('/:id', verificarToken, verificarRol('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, rol, password } = req.body;


    const usuarioExistente = await pool.query(
      'SELECT id FROM usuarios WHERE id = $1',
      [id]
    );

    if (usuarioExistente.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
    }


    if (rol && rol !== 'ADMIN' && rol !== 'CAJERO') {
      return res.status(400).json({ ok: false, error: 'Rol inválido' });
    }


    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }


    const updates = [];
    const values = [];
    let paramCount = 1;

    if (username) {
      updates.push(`username = $${paramCount}`);
      values.push(username);
      paramCount++;
    }

    if (rol) {
      updates.push(`rol = $${paramCount}`);
      values.push(rol);
      paramCount++;
    }

    if (hashedPassword) {
      updates.push(`password = $${paramCount}`);
      values.push(hashedPassword);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Debe proporcionar al menos un campo para actualizar' 
      });
    }

    values.push(id);
    const query = `UPDATE usuarios SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, username, rol, creado_en`;

    const result = await pool.query(query, values);

    res.json({ 
      ok: true, 
      usuario: result.rows[0],
      mensaje: 'Usuario actualizado exitosamente'
    });
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    
    if (err.code === '23505') {
      return res.status(409).json({ 
        ok: false, 
        error: 'El nombre de usuario ya existe' 
      });
    }
    
    res.status(500).json({ ok: false, error: 'Error al actualizar usuario' });
  }
});


router.delete('/:id', verificarToken, verificarRol('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

  
    const usuarioExistente = await pool.query(
      'SELECT id FROM usuarios WHERE id = $1',
      [id]
    );

    if (usuarioExistente.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
    }


    const ventasAsociadas = await pool.query(
      'SELECT COUNT(*) as total FROM ventas WHERE usuario_id = $1',
      [id]
    );

    if (parseInt(ventasAsociadas.rows[0].total) > 0) {
      return res.status(409).json({ 
        ok: false, 
        error: 'No se puede eliminar el usuario porque tiene ventas asociadas' 
      });
    }


    const result = await pool.query(
      'DELETE FROM usuarios WHERE id = $1 RETURNING id, username, rol',
      [id]
    );

    res.json({ 
      ok: true, 
      mensaje: 'Usuario eliminado correctamente',
      usuario: result.rows[0]
    });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ ok: false, error: 'Error al eliminar usuario' });
  }
});



module.exports = router;