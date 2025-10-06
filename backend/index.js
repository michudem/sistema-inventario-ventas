import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import usuariosRoutes from './routes/usuarios.js';
import productosRoutes from './routes/productos.js';
import ventasRoutes from './routes/ventas.js';
import reportesRoutes from './routes/reportes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ charset: 'utf-8' })); 
app.use(express.urlencoded({ extended: true, charset: 'utf-8' })); 

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.use('/usuarios', usuariosRoutes);
app.use('/productos', productosRoutes);
app.use('/ventas', ventasRoutes);
app.use('/reportes', reportesRoutes);

app.get('/', (req, res) => {
  res.json({ 
    mensaje: 'API de Inventario funcionando correctamente',
    version: '1.0.0',
    encoding: 'UTF-8'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    mensaje: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`✓ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`✓ Encoding: UTF-8`);
});

export default app;