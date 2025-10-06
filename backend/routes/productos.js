
const express = require('express');
const pool = require('../database/connection');
const { verificarToken, verificarRol } = require('../middlewares/auth');

const router = express.Router();


router.use(verificarToken);


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


router.post('/', verificarRol('ADMIN'), async (req, res) => {
  try {
    const { codigo, nombre, descripcion, precio_unitario, cantidad } = req.body;

 
    if (!codigo || !nombre || precio_unitario === undefined || cantidad === undefined) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Faltan datos obligatorios: codigo, nombre, precio_unitario y cantidad son requeridos' 
      });
    }


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
    
   
    if (err.code === '23505') { 
      return res.status(409).json({ 
        ok: false, 
        error: 'El código del producto ya existe' 
      });
    }
    
    res.status(500).json({ ok: false, error: 'Error al crear producto' });
  }
});


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

 
    const productoExistente = await pool.query(
      'SELECT * FROM productos WHERE id = $1',
      [id]
    );

    if (productoExistente.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Producto no encontrado' });
    }

    const productoActual = productoExistente.rows[0];


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


    const datosActualizados = {
      codigo: codigo !== undefined ? codigo : productoActual.codigo,
      nombre: nombre !== undefined ? nombre : productoActual.nombre,
      descripcion: descripcion !== undefined ? descripcion : productoActual.descripcion,
      precio_unitario: precio_unitario !== undefined ? precio_unitario : productoActual.precio_unitario,
      cantidad: cantidad !== undefined ? cantidad : productoActual.cantidad
    };


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