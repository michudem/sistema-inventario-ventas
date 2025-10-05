// Importa Pool de la librería pg (PostgreSQL)
const { Pool } = require('pg');
require('dotenv').config();

// Configuración del pool de conexiones usando la URL del .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Exporta el pool para reutilizar en otros módulos
module.exports = pool;
