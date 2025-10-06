import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../database/connection.js';
import { MESSAGES, HTTP_STATUS } from '../constants/messages.js';
import { validateUser } from '../validators/validators.js';

export const authService = {
  async registrarUsuario(data, requiereAdmin = true) {
    const { username, password, rol } = data;

    if (!validateUser.requiredFields(data)) {
      throw { status: HTTP_STATUS.BAD_REQUEST, message: MESSAGES.AUTH.MISSING_DATA };
    }

    if (!validateUser.validRole(rol)) {
      throw { status: HTTP_STATUS.BAD_REQUEST, message: MESSAGES.AUTH.INVALID_ROLE };
    }

    if (requiereAdmin) {
      const totalUsuarios = await pool.query('SELECT COUNT(*) FROM usuarios');
      const hayUsuarios = parseInt(totalUsuarios.rows[0].count) > 0;

      if (hayUsuarios) {
        throw { 
          status: HTTP_STATUS.FORBIDDEN, 
          message: MESSAGES.AUTH.ONLY_ADMIN,
          requiresAuth: true 
        };
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO usuarios (username, password, rol) VALUES ($1, $2, $3) RETURNING id, username, rol, creado_en',
      [username, hashedPassword, rol]
    );

    return result.rows[0];
  },

  async login(username, password, ip, userAgent) {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE username=$1', 
      [username]
    );

    if (result.rows.length === 0) {
      await this.registrarIntento(username, false, ip, userAgent);
      throw { status: HTTP_STATUS.UNAUTHORIZED, message: MESSAGES.AUTH.USER_NOT_FOUND };
    }

    const user = result.rows[0];
    const esPasswordValida = await bcrypt.compare(password, user.password);

    if (!esPasswordValida) {
      await this.registrarIntento(username, false, ip, userAgent);
      throw { status: HTTP_STATUS.UNAUTHORIZED, message: MESSAGES.AUTH.WRONG_PASSWORD };
    }

    await this.registrarIntento(username, true, ip, userAgent);

    const token = jwt.sign(
      { id: user.id, username: user.username, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || '8h' }
    );

    return {
      token,
      usuario: {
        id: user.id,
        username: user.username,
        rol: user.rol
      }
    };
  },

  async logout(token, userId) {
    await pool.query(
      'INSERT INTO tokens_revocados (token, usuario_id) VALUES ($1, $2)',
      [token, userId]
    );
  },

  async registrarIntento(usuario, exitoso, ip, userAgent) {
    await pool.query(
      'INSERT INTO intentos_inicio_sesion (usuario, exitoso, ip, user_agent) VALUES ($1, $2, $3, $4)',
      [usuario, exitoso, ip, userAgent]
    );
  },

  async obtenerTodosLosUsuarios() {
    const result = await pool.query(
      'SELECT id, username, rol, creado_en FROM usuarios ORDER BY creado_en DESC'
    );
    return result.rows;
  },

  async obtenerUsuarioPorId(id) {
    const result = await pool.query(
      'SELECT id, username, rol, creado_en FROM usuarios WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      throw { status: HTTP_STATUS.NOT_FOUND, message: MESSAGES.AUTH.USER_NOT_FOUND };
    }

    return result.rows[0];
  },

  async actualizarUsuario(id, data) {
    const { username, rol, password } = data;

    const usuarioExiste = await pool.query(
      'SELECT id FROM usuarios WHERE id = $1',
      [id]
    );

    if (usuarioExiste.rows.length === 0) {
      throw { status: HTTP_STATUS.NOT_FOUND, message: MESSAGES.AUTH.USER_NOT_FOUND };
    }

    if (rol && !validateUser.validRole(rol)) {
      throw { status: HTTP_STATUS.BAD_REQUEST, message: MESSAGES.AUTH.INVALID_ROLE };
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

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push(`password = $${paramCount}`);
      values.push(hashedPassword);
      paramCount++;
    }

    if (updates.length === 0) {
      throw { 
        status: HTTP_STATUS.BAD_REQUEST, 
        message: 'Debe proporcionar al menos un campo para actualizar' 
      };
    }

    values.push(id);
    const query = `UPDATE usuarios SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, username, rol, creado_en`;

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async eliminarUsuario(id) {
    const usuarioExiste = await pool.query(
      'SELECT id FROM usuarios WHERE id = $1',
      [id]
    );

    if (usuarioExiste.rows.length === 0) {
      throw { status: HTTP_STATUS.NOT_FOUND, message: MESSAGES.AUTH.USER_NOT_FOUND };
    }

    const tieneVentas = await pool.query(
      'SELECT COUNT(*) as total FROM ventas WHERE usuario_id = $1',
      [id]
    );

    if (parseInt(tieneVentas.rows[0].total) > 0) {
      throw { 
        status: HTTP_STATUS.CONFLICT, 
        message: 'No se puede eliminar el usuario porque tiene ventas asociadas' 
      };
    }

    const result = await pool.query(
      'DELETE FROM usuarios WHERE id = $1 RETURNING id, username, rol',
      [id]
    );

    return result.rows[0];
  },

  async obtenerIntentosLogin(limit, exitoso) {
    let query = 'SELECT * FROM intentos_inicio_sesion';
    const params = [];

    if (exitoso !== undefined) {
      query += ' WHERE exitoso = $1';
      params.push(exitoso === 'true');
    }

    query += ' ORDER BY fecha DESC LIMIT $' + (params.length + 1);
    params.push(limit);

    const result = await pool.query(query, params);
    return result.rows;
  },

  async obtenerTokensRevocados(limit) {
    const result = await pool.query(
      `SELECT tr.id, tr.token, tr.revocado_en, u.username 
       FROM tokens_revocados tr
       JOIN usuarios u ON tr.usuario_id = u.id
       ORDER BY tr.revocado_en DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  },

  async limpiarTokensAntiguos() {
    const result = await pool.query(
      `DELETE FROM tokens_revocados 
       WHERE revocado_en < NOW() - INTERVAL '8 hours' 
       RETURNING *`
    );
    return result.rowCount;
  }
};