
```markdown
# Sistema de Gestión de Inventario y Ventas

> Sistema completo full-stack con autenticación, autorización y reportes  
> **Backend:** Node.js + Express + PostgreSQL  
> **Frontend:** React + Vite + Tailwind CSS  
> Desarrollado por Michel Yagari

Sistema completo para la gestión de inventario y ventas de un negocio, con control de acceso por roles (Administrador y Cajero).

---

## Características Principales

### Backend
- Autenticación y autorización con JWT
- Gestión completa de inventario (CRUD de productos)
- Módulo de caja con control de transacciones atómicas
- Reportes de ventas en múltiples formatos (JSON, CSV, PDF)
- Gestión de usuarios con roles diferenciados
- Sistema de logout seguro con blacklist de tokens
- Registro de intentos de inicio de sesión para auditoría
- Validaciones exhaustivas y manejo de errores

### Frontend
- Interfaz moderna y responsiva con React 19
- Sistema de notificaciones Toast
- Dashboard con estadísticas en tiempo real
- Gestión completa de productos (solo ADMIN)
- Sistema de ventas con carrito de compras
- Generación y descarga de reportes
- Gestión de usuarios (solo ADMIN)
- Componentes reutilizables

---

## Tecnologías Utilizadas

### Backend
- **Node.js** - Entorno de ejecución de JavaScript
- **Express 5.1.0** - Framework web minimalista
- **PostgreSQL 8.16.3** - Base de datos relacional
- **jsonwebtoken 9.0.2** - Autenticación JWT
- **bcryptjs 3.0.2** - Encriptación de contraseñas
- **PDFKit 0.17.2** - Generación de reportes PDF
- **dotenv 17.2.3** - Gestión de variables de entorno

### Frontend
- **React 19.1.1** - Biblioteca de UI
- **Vite 7.1.14** - Build tool y dev server
- **Tailwind CSS 3.4.18** - Framework de CSS
- **Axios 1.12.2** - Cliente HTTP
- **Lucide React 0.544.0** - Iconos

---

## Requisitos Previos

- Node.js v16 o superior
- PostgreSQL v12 o superior
- npm o yarn

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/michudem/sistema-inventario-ventas
cd sistema-inventario-ventas
```

### 2. Configurar Backend

```bash
cd backend
npm install
```

Crear base de datos PostgreSQL:

```sql
CREATE DATABASE inventario;
```

Ejecutar esquema:

```bash
psql -U postgres -d inventario -f database/schema.sql
```

Cargar datos de prueba (opcional):

```bash
psql -U postgres -d inventario -f database/seeds.sql
```

Crear archivo `.env`:

```env
PORT=4000
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/inventario
JWT_SECRET=tu_clave_secreta_muy_segura_aqui
JWT_EXPIRES=8h
```

Iniciar servidor backend:

```bash
# Desarrollo
npm run dev

# Producción
node index.js
```

Servidor disponible en: `http://localhost:4000`

### 3. Configurar Frontend

```bash
cd frontend-react
npm install
```

Crear archivo `.env`:

```env
VITE_API_URL=http://localhost:4000
```

Iniciar servidor frontend:

```bash
npm run dev
```

Aplicación disponible en: `http://localhost:5173`

---

## Estructura del Proyecto

```
sistema-inventario-ventas/
├── backend/
│   ├── database/
│   │   ├── connection.js
│   │   ├── schema.sql
│   │   └── seeds.sql
│   ├── middlewares/
│   │   └── auth.js
│   ├── routes/
│   │   ├── usuarios.js
│   │   ├── productos.js
│   │   ├── ventas.js
│   │   └── reportes.js
│   ├── .env
│   ├── .env.example
│   ├── index.js
│   └── package.json
│
└── frontend-react/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Button.jsx
    │   │   │   └── Modal.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── InicioView.jsx
    │   │   ├── Login.jsx
    │   │   ├── ProductosView.jsx
    │   │   ├── ReportesView.jsx
    │   │   ├── Toast.jsx
    │   │   ├── UsuariosView.jsx
    │   │   └── VentasView.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── hooks/
    │   │   └── useToast.js
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env
    ├── .env.example
    └── package.json
```

---

## Roles y Permisos

### ADMIN (Administrador)
- ✅ Gestión completa de usuarios
- ✅ CRUD completo de productos
- ✅ Registrar y consultar ventas
- ✅ Generar todos los reportes
- ✅ Ver intentos de login y tokens revocados

### CAJERO
- ❌ NO puede gestionar usuarios
- ✅ Consultar productos (solo lectura)
- ❌ NO puede crear, editar o eliminar productos
- ✅ Registrar ventas
- ✅ Consultar ventas
- ✅ Generar reportes

---

## Características del Frontend

### Dashboard Interactivo
- Estadísticas en tiempo real
- Total de productos en inventario
- Ventas del día
- Ingresos del día
- Alertas de stock bajo

### Sistema de Notificaciones
- Toast notifications con colores según tipo
- Notificaciones de éxito (verde)
- Notificaciones de error (rojo)
- Notificaciones informativas (azul)
- Auto-cierre después de 3 segundos

### Gestión de Productos
- Búsqueda en tiempo real
- Filtrado por código y nombre
- Indicador visual de stock
- Formularios modales para crear/editar
- Validación de datos

### Sistema de Ventas
- Carrito de compras interactivo
- Validación de stock en tiempo real
- Búsqueda de productos
- Cálculo automático de totales
- Descarga de tickets en PDF

### Gestión de Usuarios (Solo ADMIN)
- Crear, editar y eliminar usuarios
- Asignación de roles
- Actualización de contraseñas
- Vista de fecha de creación

---

## API Endpoints

### Autenticación

```http
POST /usuarios/registro
POST /usuarios/login
POST /usuarios/logout
```

### Usuarios (Solo ADMIN)

```http
GET    /usuarios
GET    /usuarios/:id
PUT    /usuarios/:id
DELETE /usuarios/:id
GET    /usuarios/intentos-login
GET    /usuarios/tokens-revocados
```

### Productos

```http
GET    /productos
GET    /productos/:id
POST   /productos         (Solo ADMIN)
PUT    /productos/:id     (Solo ADMIN)
DELETE /productos/:id     (Solo ADMIN)
```

### Ventas

```http
POST /ventas
GET  /ventas
GET  /ventas/:id
GET  /ventas/:id/ticket-pdf
```

### Reportes

```http
GET /reportes/ventas/diario
GET /reportes/ventas/diario/csv
GET /reportes/ventas/diario/pdf
GET /reportes/ventas/rango
GET /reportes/ventas/rango/pdf
GET /reportes/productos/mas-vendidos
```

---

## Seguridad

- Encriptación de contraseñas con bcryptjs (10 rounds)
- Autenticación JWT con tokens de 8 horas
- Blacklist de tokens en logout
- Registro de auditoría de intentos de login
- Validaciones exhaustivas en todos los endpoints
- Protección contra SQL Injection con queries parametrizadas
- Control de acceso por roles
- Transacciones atómicas para operaciones críticas

---

## Pruebas Realizadas

Total de pruebas: **29/29 exitosas**

| Categoría | Tests | Estado |
|-----------|-------|--------|
| Autenticación | 5 | ✅ |
| Productos (CRUD) | 6 | ✅ |
| Ventas | 5 | ✅ |
| Reportes | 4 | ✅ |
| Permisos | 6 | ✅ |
| Auditoría | 3 | ✅ |

---

## Usuarios de Prueba

```javascript
// Administrador
username: admin
password: 123456

// Cajero
username: cajero
password: 123456
```

---

## Deployment

### Variables de entorno para producción

**Backend:**
```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require
JWT_SECRET=clave_muy_segura_de_al_menos_32_caracteres
JWT_EXPIRES=8h
```

**Frontend:**
```env
VITE_API_URL=https://tu-api-produccion.com
```

### Build para producción

```bash
# Frontend
cd frontend-react
npm run build
# Archivos generados en /dist

# Backend
cd backend
node index.js
```

---

## Mantenimiento

### Backup de base de datos

```bash
# Crear backup
pg_dump -U postgres inventario > backup_$(date +%Y%m%d).sql

# Restaurar backup
psql -U postgres inventario < backup_YYYYMMDD.sql
```

### Limpiar tokens revocados antiguos

```bash
curl -X DELETE http://localhost:4000/usuarios/limpiar-tokens \
  -H "Authorization: Bearer [ADMIN_TOKEN]"
```

---

## Solución de Problemas

### Frontend no se conecta al backend
- Verificar que `VITE_API_URL` en `.env` sea correcta
- Verificar que el backend esté corriendo
- Revisar la consola del navegador

### Error de autenticación
- Verificar que el token no haya expirado
- Verificar que el header `Authorization: Bearer [TOKEN]` sea correcto
- Intentar hacer login nuevamente

### Stock insuficiente
- Verificar disponibilidad con `GET /productos`
- El sistema previene vender más unidades de las disponibles

---

## Roadmap / Mejoras Futuras

- [ ] Paginación en todas las tablas
- [ ] Búsqueda por código de barras
- [ ] Sistema de devoluciones
- [ ] Múltiples almacenes
- [ ] Notificaciones de stock bajo
- [ ] Categorías de productos
- [ ] Sistema de descuentos
- [ ] Historial de cambios de precios
- [ ] Exportar reportes a Excel

---

## Contribuir

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## Autor

**Michel Yagari**
- Email: micheldahanayagari@gmail.com
- GitHub: [@michudem](https://github.com/michudem)
- Proyecto: Sistema de Gestión de Inventario y Ventas
- Fecha: Octubre 2025

---

## Licencia

ISC

---

## Changelog

### Versión 1.0.0 (Octubre 2025)
- Sistema de autenticación y autorización con JWT
- CRUD completo de productos con actualizaciones parciales
- Módulo de ventas con transacciones atómicas
- Reportes en JSON, CSV y PDF
- Gestión de usuarios por roles
- Frontend completo con React y Tailwind
- Sistema de notificaciones Toast
- Dashboard con estadísticas en tiempo real
- Componentes reutilizables
- Sistema de logout con blacklist
- Registro de auditoría completo

---
**Gracias por revisar este sistema de gestión de inventario y ventas**