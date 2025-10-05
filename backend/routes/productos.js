// ================================================
// RUTAS DE PRODUCTOS CON AUTENTICACIÓN Y AUTORIZACIÓN
// ================================================

const express = require('express');
const pool = require('../database/connection');
const { verificarToken, verificarRol } = require('../middlewares/auth');

const router = express.Router();

// TODAS las rutas requieren autenticación
router.use(verificarToken);

// ================================================
// LISTAR PRODUCTOS
// ================================================
// Cualquier usuario autenticado puede ver productos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, codigo, nombre, descripcion, precio_unitario, cantidad, creado_en FROM productos ORDER BY id'
    );
    res.json({ ok: true, productos: result.rows });
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).json({ ok: false, error: 'Error al obtener productos' });
  }
});

// ================================================
// OBTENER PRODUCTO POR ID
// ================================================
// Cualquier usuario autenticado puede ver un producto específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT id, codigo, nombre, descripcion, precio_unitario, cantidad, creado_en FROM productos WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Producto no encontrado' });
    }

    res.json({ ok: true, producto: result.rows[0] });
  } catch (err) {
    console.error('Error al obtener producto:', err);
    res.status(500).json({ ok: false, error: 'Error al obtener producto' });
  }
});

// ================================================
// CREAR PRODUCTO
// ================================================
// Solo ADMIN puede crear productos
router.post('/', verificarRol('ADMIN'), async (req, res) => {
  try {
    const { codigo, nombre, descripcion, precio_unitario, cantidad } = req.body;

    // Validar campos obligatorios
    if (!codigo || !nombre || precio_unitario === undefined || cantidad === undefined) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Faltan datos obligatorios: codigo, nombre, precio_unitario y cantidad son requeridos' 
      });
    }

    // Validar tipos de datos
    if (typeof precio_unitario !== 'number' || precio_unitario < 0) {
      return res.status(400).json({ 
        ok: false, 
        error: 'El precio_unitario debe ser un número mayor o igual a 0' 
      });
    }

    if (!Number.isInteger(cantidad) || cantidad < 0) {
      return res.status(400).json({ 
        ok: false, 
        error: 'La cantidad debe ser un número entero mayor o igual a 0' 
      });
    }

    // Verificar si el código ya existe
    const codigoExistente = await pool.query(
      'SELECT id FROM productos WHERE codigo = $1',
      [codigo]
    );

    if (codigoExistente.rows.length > 0) {
      return res.status(409).json({ 
        ok: false, 
        error: `Ya existe un producto con el código: ${codigo}` 
      });
    }

    // Insertar el nuevo producto
    const result = await pool.query(
      'INSERT INTO productos (codigo, nombre, descripcion, precio_unitario, cantidad) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [codigo, nombre, descripcion || null, precio_unitario, cantidad]
    );

    res.status(201).json({ 
      ok: true, 
      producto: result.rows[0],
      mensaje: 'Producto creado exitosamente'
    });
  } catch (err) {
    console.error('Error al crear producto:', err);
    
    // Manejar error de código duplicado a nivel de base de datos
    if (err.code === '23505') { // Código de error de PostgreSQL para violación de unique constraint
      return res.status(409).json({ 
        ok: false, 
        error: 'El código del producto ya existe' 
      });
    }
    
    res.status(500).json({ ok: false, error: 'Error al crear producto' });
  }
});

// ================================================
// ACTUALIZAR PRODUCTO
// ================================================
// Solo ADMIN puede actualizar productos
router.put('/:id', verificarRol('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, nombre, descripcion, precio_unitario, cantidad } = req.body;

    // Validar que al menos un campo esté presente
    if (!codigo && !nombre && descripcion === undefined && precio_unitario === undefined && cantidad === undefined) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Debe proporcionar al menos un campo para actualizar' 
      });
    }

    // Validar tipos de datos si están presentes
    if (precio_unitario !== undefined) {
      if (typeof precio_unitario !== 'number' || precio_unitario < 0) {
        return res.status(400).json({ 
          ok: false, 
          error: 'El precio_unitario debe ser un número mayor o igual a 0' 
        });
      }
    }

    if (cantidad !== undefined) {
      if (!Number.isInteger(cantidad) || cantidad < 0) {
        return res.status(400).json({ 
          ok: false, 
          error: 'La cantidad debe ser un número entero mayor o igual a 0' 
        });
      }
    }

    // Verificar si el producto existe
    const productoExistente = await pool.query(
      'SELECT * FROM productos WHERE id = $1',
      [id]
    );

    if (productoExistente.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Producto no encontrado' });
    }

    const productoActual = productoExistente.rows[0];

    // Si se está actualizando el código, verificar que no esté duplicado
    if (codigo && codigo !== productoActual.codigo) {
      const codigoExistente = await pool.query(
        'SELECT id FROM productos WHERE codigo = $1 AND id != $2',
        [codigo, id]
      );

      if (codigoExistente.rows.length > 0) {
        return res.status(409).json({ 
          ok: false, 
          error: `Ya existe otro producto con el código: ${codigo}` 
        });
      }
    }

    // Construir objeto con valores actualizados (mantener los existentes si no se envían nuevos)
    const datosActualizados = {
      codigo: codigo !== undefined ? codigo : productoActual.codigo,
      nombre: nombre !== undefined ? nombre : productoActual.nombre,
      descripcion: descripcion !== undefined ? descripcion : productoActual.descripcion,
      precio_unitario: precio_unitario !== undefined ? precio_unitario : productoActual.precio_unitario,
      cantidad: cantidad !== undefined ? cantidad : productoActual.cantidad
    };

    // Actualizar el producto
    const result = await pool.query(
      'UPDATE productos SET codigo=$1, nombre=$2, descripcion=$3, precio_unitario=$4, cantidad=$5 WHERE id=$6 RETURNING *',
      [
        datosActualizados.codigo, 
        datosActualizados.nombre, 
        datosActualizados.descripcion, 
        datosActualizados.precio_unitario, 
        datosActualizados.cantidad, 
        id
      ]
    );

    res.json({ 
      ok: true, 
      producto: result.rows[0],
      mensaje: 'Producto actualizado exitosamente'
    });
  } catch (err) {
    console.error('Error al actualizar producto:', err);
    
    // Manejar error de código duplicado
    if (err.code === '23505') {
      return res.status(409).json({ 
        ok: false, 
        error: 'El código del producto ya existe' 
      });
    }
    
    res.status(500).json({ ok: false, error: 'Error al actualizar producto' });
  }
});

// ================================================
// ELIMINAR PRODUCTO
// ================================================
// Solo ADMIN puede eliminar productos
router.delete('/:id', verificarRol('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el producto existe
    const productoExistente = await pool.query(
      'SELECT * FROM productos WHERE id = $1',
      [id]
    );

    if (productoExistente.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Producto no encontrado' });
    }

    // Verificar si el producto está en alguna venta
    const ventasConProducto = await pool.query(
      'SELECT COUNT(*) as total FROM detalle_ventas WHERE producto_id = $1',
      [id]
    );

    if (parseInt(ventasConProducto.rows[0].total) > 0) {
      return res.status(409).json({ 
        ok: false, 
        error: 'No se puede eliminar el producto porque está asociado a ventas existentes' 
      });
    }

    // Eliminar el producto
    const result = await pool.query(
      'DELETE FROM productos WHERE id=$1 RETURNING *',
      [id]
    );

    res.json({ 
      ok: true, 
      mensaje: 'Producto eliminado correctamente', 
      producto: result.rows[0] 
    });
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    res.status(500).json({ ok: false, error: 'Error al eliminar producto' });
  }
});

module.exports = router;