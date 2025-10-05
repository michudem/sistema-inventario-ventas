-- ==========================
-- CREACIÓN DE LA BASE DE DATOS
-- ==========================
-- CREATE DATABASE inventario;
-- ==========================
-- TABLA: usuarios
-- ==========================
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL CHECK (rol IN ('ADMIN', 'CAJERO')),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================
-- TABLA: productos
-- ==========================
CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario >= 0),
  cantidad INT NOT NULL CHECK (cantidad >= 0),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================
-- TABLA: ventas
-- ==========================
CREATE TABLE IF NOT EXISTS ventas (
  id SERIAL PRIMARY KEY,
  numero_transaccion VARCHAR(30) UNIQUE NOT NULL,
  usuario_id INT NOT NULL REFERENCES usuarios(id),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total NUMERIC(12,2) NOT NULL CHECK (total >= 0)
);

-- ==========================
-- TABLA: detalle_ventas
-- ==========================
CREATE TABLE IF NOT EXISTS detalle_ventas (
  id SERIAL PRIMARY KEY,
  venta_id INT NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
  producto_id INT NOT NULL REFERENCES productos(id),
  cantidad INT NOT NULL CHECK (cantidad > 0),
  precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario >= 0),
  subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0)
);

-- ==========================
-- TABLA: intentos_inicio_sesion
-- ==========================
CREATE TABLE IF NOT EXISTS intentos_inicio_sesion (
  id SERIAL PRIMARY KEY,
  usuario VARCHAR(50) NOT NULL,
  exitoso BOOLEAN NOT NULL,
  ip VARCHAR(50),
  user_agent TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================
-- TABLA: tokens_revocados
-- ==========================

CREATE TABLE IF NOT EXISTS tokens_revocados (
  id SERIAL PRIMARY KEY,
  token TEXT NOT NULL,
  usuario_id INT NOT NULL REFERENCES usuarios(id),
  revocado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

