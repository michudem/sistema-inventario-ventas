// ================================================
// CONFIGURACIÓN INICIAL DEL SERVIDOR
// Sistema de Gestión de Inventario y Ventas
// ================================================

// Cargar variables de entorno desde el archivo .env
require('dotenv').config();

// Importar Express y módulos necesarios
const express = require('express');
const cors = require('cors');  // ← AQUÍ
const pool = require('./database/connection');

// Importar todas las rutas
const usuariosRoutes = require('./routes/usuarios');
const productosRoutes = require('./routes/productos');
const ventasRoutes = require('./routes/ventas');
const reportesRoutes = require('./routes/reportes');

// Crear la aplicación Express
const app = express();
const port = process.env.PORT || 4000;

// ← CORS DEBE IR AQUÍ (DESPUÉS de crear app)
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Middleware para parsear JSON
app.use(express.json());

// ================================================
// RUTAS PÚBLICAS
// ================================================

// Ruta de prueba principal - Verifica el servidor y la BD
app.get('/', async (req, res) => {
  try {
    // Verificar conexión a la base de datos
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      ok: true, 
      mensaje: "API del Sistema de Inventario funcionando correctamente",
      hora_servidor: result.rows[0].now
    });
  } catch (err) {
    console.error('Error de conexión a la BD:', err);
    res.status(500).json({ 
      ok: false, 
      error: 'Error de conexión a la base de datos' 
    });
  }
});

// Rutas de autenticación (públicas - no requieren token)
app.use('/usuarios', usuariosRoutes);

// ================================================
// RUTAS PROTEGIDAS
// ================================================

// Todas estas rutas requieren autenticación
// (El middleware verificarToken está dentro de cada archivo de rutas)
app.use('/productos', productosRoutes);
app.use('/ventas', ventasRoutes);
app.use('/reportes', reportesRoutes);

// ================================================
// MANEJO DE RUTAS NO ENCONTRADAS (404)
// ================================================

app.use((req, res) => {
  res.status(404).json({ 
    ok: false, 
    error: 'Ruta no encontrada' 
  });
});

// ================================================
// ARRANQUE DEL SERVIDOR
// ================================================

app.listen(port, () => {
  console.log(`========================================`);
  console.log(`✓ Servidor corriendo en http://localhost:${port}`);
  console.log(`✓ Base de datos: PostgreSQL`);
  console.log(`✓ Presiona Ctrl+C para detener`);
  console.log(`========================================`);
  console.log(`\nRutas disponibles:`);
  console.log(`  POST   /usuarios/registro`);
  console.log(`  POST   /usuarios/login`);
  console.log(`  POST   /usuarios/logout`);
  console.log(`  GET    /productos`);
  console.log(`  POST   /productos`);
  console.log(`  PUT    /productos/:id`);
  console.log(`  DELETE /productos/:id`);
  console.log(`  POST   /ventas`);
  console.log(`  GET    /ventas`);
  console.log(`  GET    /reportes/ventas/diario`);
  console.log(`  GET    /reportes/ventas/diario/csv`);
  console.log(`========================================`);
});