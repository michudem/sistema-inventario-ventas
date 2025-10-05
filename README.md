
# Sistema de Gestión de Inventario y Ventas

> Sistema completo de gestión con autenticación, autorización y reportes  
> Desarrollado por Michel Yagari

Sistema backend completo para la gestión de inventario y ventas de un negocio, con control de acceso por roles (Administrador y Cajero).

## Características

- Autenticación y autorización con JWT
- Gestión completa de inventario (CRUD de productos)
- Módulo de caja con control de transacciones atómicas
- Reportes de ventas en múltiples formatos (JSON, CSV, PDF)
- Gestión de usuarios con roles diferenciados
- Sistema de logout seguro con blacklist de tokens
- Registro de intentos de inicio de sesión para auditoría
- Validaciones exhaustivas y manejo de errores

## Requisitos Previos

- Node.js v16 o superior
- PostgreSQL v12 o superior
- npm o yarn

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/michudem/sistema-inventario-ventas
cd backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar la base de datos

Crear la base de datos en PostgreSQL:

```sql
CREATE DATABASE inventario;
```

Ejecutar el script de esquema:

```bash
psql -U postgres -d inventario -f database/schema.sql
```

(Opcional) Cargar datos de prueba:

```bash
psql -U postgres -d inventario -f database/seeds.sql
```

### 4. Configurar variables de entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Puerto del servidor
PORT=4000

# Conexión a PostgreSQL
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/inventario

# JWT Secret (cambiar por una clave segura)
JWT_SECRET=tu_clave_secreta_muy_segura_aqui

# Tiempo de expiración del token
JWT_EXPIRES=8h
```

### 5. Iniciar el servidor

**Modo desarrollo (con nodemon):**
```bash
npm run dev
```

**Modo producción:**
```bash
node index.js
```

El servidor estará disponible en: `http://localhost:4000`

## Estructura del Proyecto

```
backend/
├── database/
│   ├── connection.js      # Configuración del pool de PostgreSQL
│   ├── schema.sql         # Esquema completo de la BD
│   └── seeds.sql          # Datos de prueba
├── middlewares/
│   └── auth.js            # Middleware de autenticación y autorización
├── routes/
│   ├── usuarios.js        # Gestión de usuarios y autenticación
│   ├── productos.js       # CRUD de productos
│   ├── ventas.js          # Registro y consulta de ventas
│   └── reportes.js        # Generación de reportes
├── .env                   # Variables de entorno (no incluido en git)
├── .gitignore
├── index.js               # Punto de entrada de la aplicación
├── package.json
└── README.md
```

## Documentación de la API

### Base URL
```
http://localhost:4000
```

Todas las rutas (excepto `/usuarios/registro` y `/usuarios/login`) requieren el header de autorización:
```
Authorization: Bearer [TOKEN]
```

---

## Endpoints

### Autenticación

#### Registrar nuevo usuario
```http
POST http://localhost:4000/usuarios/registro
Content-Type: application/json

{
  "username": "admin",
  "password": "123456",
  "rol": "ADMIN"
}
```

**Respuesta exitosa (201):**
```json
{
  "ok": true,
  "usuario": {
    "id": 1,
    "username": "admin",
    "rol": "ADMIN",
    "creado_en": "2025-01-15T10:30:00.000Z"
  }
}
```

#### Iniciar sesión
```http
POST http://localhost:4000/usuarios/login
Content-Type: application/json

{
  "username": "admin",
  "password": "123456"
}
```

**Respuesta exitosa (200):**
```json
{
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "username": "admin",
    "rol": "ADMIN"
  }
}
```

#### Cerrar sesión
```http
POST http://localhost:4000/usuarios/logout
Authorization: Bearer [TOKEN]
```

**Respuesta exitosa (200):**
```json
{
  "ok": true,
  "mensaje": "Sesión cerrada correctamente"
}
```

---

### Gestión de Usuarios (Solo ADMIN)

#### Listar todos los usuarios
```http
GET http://localhost:4000/usuarios
Authorization: Bearer [TOKEN]
```

#### Obtener usuario por ID
```http
GET http://localhost:4000/usuarios/:id
Authorization: Bearer [TOKEN]
```

#### Actualizar usuario
```http
PUT http://localhost:4000/usuarios/:id
Authorization: Bearer [TOKEN]
Content-Type: application/json

{
  "username": "nuevo_nombre",
  "rol": "CAJERO",
  "password": "nueva_contraseña"
}
```

#### Eliminar usuario
```http
DELETE http://localhost:4000/usuarios/:id
Authorization: Bearer [TOKEN]
```

#### Ver intentos de login
```http
GET http://localhost:4000/usuarios/intentos-login?limit=50&exitoso=true
Authorization: Bearer [TOKEN]
```

#### Ver tokens revocados
```http
GET http://localhost:4000/usuarios/tokens-revocados?limit=50
Authorization: Bearer [TOKEN]
```

---

### Productos

#### Listar todos los productos
```http
GET http://localhost:4000/productos
Authorization: Bearer [TOKEN]
```

#### Obtener producto por ID
```http
GET http://localhost:4000/productos/:id
Authorization: Bearer [TOKEN]
```

#### Crear producto (Solo ADMIN)
```http
POST http://localhost:4000/productos
Authorization: Bearer [TOKEN]
Content-Type: application/json

{
  "codigo": "P001",
  "nombre": "Arroz",
  "descripcion": "Arroz blanco 1kg",
  "precio_unitario": 2500,
  "cantidad": 100
}
```

#### Actualizar producto (Solo ADMIN)
```http
PUT http://localhost:4000/productos/:id
Authorization: Bearer [TOKEN]
Content-Type: application/json

{
  "precio_unitario": 2800,
  "cantidad": 150
}
```

**Nota:** Puedes actualizar solo los campos que necesites. Los demás se mantienen.

#### Eliminar producto (Solo ADMIN)
```http
DELETE http://localhost:4000/productos/:id
Authorization: Bearer [TOKEN]
```

---

### Ventas

#### Registrar nueva venta
```http
POST http://localhost:4000/ventas
Authorization: Bearer [TOKEN]
Content-Type: application/json

{
  "productos": [
    {
      "producto_id": 1,
      "cantidad": 2
    },
    {
      "producto_id": 2,
      "cantidad": 1
    }
  ]
}
```

**Respuesta exitosa (201):**
```json
{
  "ok": true,
  "venta": {
    "id": 1,
    "numero_transaccion": "VT-1736950800000-abc123xyz",
    "usuario_id": 1,
    "fecha": "2025-01-15T10:30:00.000Z",
    "total": 9500,
    "username": "admin",
    "productos": [
      {
        "producto_id": 1,
        "nombre": "Arroz",
        "cantidad": 2,
        "precio_unitario": 2500,
        "subtotal": 5000
      },
      {
        "producto_id": 2,
        "nombre": "Frijoles",
        "cantidad": 1,
        "precio_unitario": 4500,
        "subtotal": 4500
      }
    ]
  },
  "mensaje": "Venta registrada exitosamente"
}
```

#### Listar ventas con paginación
```http
GET http://localhost:4000/ventas?page=1&limit=10
Authorization: Bearer [TOKEN]
```

#### Filtrar ventas por rango de fechas
```http
GET http://localhost:4000/ventas?fecha_inicio=2025-01-01&fecha_fin=2025-01-31
Authorization: Bearer [TOKEN]
```

#### Obtener venta por ID
```http
GET http://localhost:4000/ventas/:id
Authorization: Bearer [TOKEN]
```

---

### Reportes

#### Reporte diario en JSON
```http
GET http://localhost:4000/reportes/ventas/diario?fecha=2025-01-15
Authorization: Bearer [TOKEN]
```

**Respuesta:**
```json
{
  "ok": true,
  "reporte": {
    "fecha": "2025-01-15",
    "resumen": {
      "total_transacciones": 5,
      "ingresos_totales": 47500
    },
    "productos_vendidos": [
      {
        "id": 1,
        "codigo": "P001",
        "nombre": "Arroz",
        "cantidad_vendida": 10,
        "precio_unitario": 2500,
        "total_vendido": 25000
      }
    ],
    "detalle_ventas": [...]
  }
}
```

#### Exportar reporte diario en CSV
```http
GET http://localhost:4000/reportes/ventas/diario/csv?fecha=2025-01-15
Authorization: Bearer [TOKEN]
```

#### Exportar reporte diario en PDF
```http
GET http://localhost:4000/reportes/ventas/diario/pdf?fecha=2025-01-15
Authorization: Bearer [TOKEN]
```

#### Reporte por rango de fechas
```http
GET http://localhost:4000/reportes/ventas/rango?fecha_inicio=2025-01-01&fecha_fin=2025-01-31
Authorization: Bearer [TOKEN]
```

#### Exportar reporte de rango en PDF
```http
GET http://localhost:4000/reportes/ventas/rango/pdf?fecha_inicio=2025-01-01&fecha_fin=2025-01-31
Authorization: Bearer [TOKEN]
```

#### Productos más vendidos
```http
GET http://localhost:4000/reportes/productos/mas-vendidos?limit=10
Authorization: Bearer [TOKEN]
```

---

## Roles y Permisos

### ADMIN (Administrador)
- Gestión completa de usuarios (crear, listar, actualizar, eliminar)
- CRUD completo de productos
- Registrar y consultar ventas
- Generar todos los reportes
- Ver intentos de login y tokens revocados
- Limpiar tokens revocados antiguos

### CAJERO
- NO puede gestionar usuarios
- Consultar productos (solo lectura)
- NO puede crear, editar o eliminar productos
- Registrar ventas
- Consultar ventas
- Generar reportes

---

## Seguridad

El sistema implementa las siguientes medidas de seguridad:

- **Encriptación de contraseñas**: bcryptjs con salt de 10 rounds
- **Autenticación JWT**: Tokens con expiración configurable (default: 8h)
- **Blacklist de tokens**: Sistema de logout que invalida tokens
- **Registro de auditoría**: Todos los intentos de login se registran
- **Validaciones exhaustivas**: En todos los endpoints
- **Protección SQL Injection**: Queries parametrizadas
- **Control de acceso por roles**: Middleware de autorización
- **Transacciones atómicas**: Para operaciones críticas (ventas)

### Gestión de Sesiones

- **Logout manual**: El usuario puede cerrar sesión llamando a `/usuarios/logout`
- **Expiración automática**: Los tokens expiran automáticamente después de 8 horas
- **Tokens revocados**: Los tokens en logout se agregan a blacklist y no pueden reutilizarse

---

## Validaciones y Reglas de Negocio

### Productos
- El código debe ser único
- Precio unitario y cantidad deben ser >= 0
- No se puede eliminar un producto con ventas asociadas
- Se pueden actualizar campos individuales sin afectar los demás

### Ventas
- Se valida stock disponible antes de procesar
- El stock se actualiza automáticamente
- Las transacciones son atómicas (todo o nada)
- Cada venta tiene un número de transacción único

### Usuarios
- El username debe ser único
- El rol debe ser 'ADMIN' o 'CAJERO'
- No se puede eliminar un usuario con ventas asociadas

---

## Códigos de Estado HTTP

- `200` - OK (operación exitosa)
- `201` - Created (recurso creado)
- `400` - Bad Request (datos inválidos)
- `401` - Unauthorized (no autenticado o token inválido)
- `403` - Forbidden (sin permisos)
- `404` - Not Found (recurso no encontrado)
- `409` - Conflict (conflicto, ej: código duplicado)
- `500` - Internal Server Error (error del servidor)

---

## Ejemplos de Uso con cURL

### Registro y login
```bash
# Registrar usuario
curl -X POST http://localhost:4000/usuarios/registro \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456","rol":"ADMIN"}'

# Login
curl -X POST http://localhost:4000/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'
```

### Crear producto
```bash
curl -X POST http://localhost:4000/productos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{
    "codigo":"P001",
    "nombre":"Arroz",
    "precio_unitario":2500,
    "cantidad":100
  }'
```

### Registrar venta
```bash
curl -X POST http://localhost:4000/ventas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{
    "productos":[
      {"producto_id":1,"cantidad":2},
      {"producto_id":2,"cantidad":1}
    ]
  }'
```

### Descargar reporte PDF
```bash
curl -X GET "http://localhost:4000/reportes/ventas/diario/pdf?fecha=2025-01-15" \
  -H "Authorization: Bearer [TOKEN]" \
  -o reporte.pdf
```

---

## Tecnologías Utilizadas

- **Node.js** - Entorno de ejecución de JavaScript
- **Express 5.1.0** - Framework web minimalista
- **PostgreSQL 8.16.3** - Base de datos relacional
- **jsonwebtoken 9.0.2** - Autenticación JWT
- **bcryptjs 3.0.2** - Encriptación de contraseñas
- **PDFKit 0.17.2** - Generación de reportes PDF
- **dotenv 17.2.3** - Gestión de variables de entorno
- **pg 8.16.3** - Cliente de PostgreSQL para Node.js
- **nodemon 3.1.10** - Reinicio automático en desarrollo

---

## Pruebas del Sistema

### Casos de Uso Documentados

Las siguientes pruebas fueron realizadas usando Thunder Client para verificar el correcto funcionamiento del sistema.

#### 1. Registro de Usuarios

Se registraron exitosamente 3 usuarios:

**Administrador:**
- Username: `maria.gomez`
- Rol: ADMIN
- ID: 5

**Cajeros:**
- Username: `carlos.ruiz` (ID: 6)
- Username: `andrea.lopez` (ID: 7)

#### 2. Autenticación

Ambos usuarios (admin y cajero) pudieron iniciar sesión correctamente y recibieron sus tokens JWT:
- Token de admin válido por 8 horas
- Token de cajero válido por 8 horas

#### 3. Gestión de Productos (ADMIN)

**Producto creado exitosamente:**
```json
{
  "codigo": "ALI001",
  "nombre": "Arroz Roa x 500g",
  "descripcion": "Arroz blanco de primera calidad",
  "precio_unitario": 2900,
  "cantidad": 100
}
```

**Actualización parcial exitosa:**
- Se actualizó el producto P001 (Arroz)
- Precio: $2,500 → $2,900
- Cantidad: 98 → 180
- Se mantuvieron correctamente los demás campos (código, nombre, descripción)

**Eliminación exitosa:**
- Se eliminó el producto P004 (Azúcar) que no tenía ventas asociadas

#### 4. Registro de Ventas

Se registraron 3 ventas exitosamente:

**Venta 1** (maria.gomez - ADMIN):
- 2x Arroz + 1x Aceite
- Total: $13,800
- Stock actualizado automáticamente

**Venta 2** (maria.gomez - ADMIN):
- 1x Frijoles + 3x Arroz Roa + 1x Arroz
- Total: $16,100

**Venta 3** (carlos.ruiz - CAJERO):
- 5x Arroz + 2x Frijoles + 3x Arroz Roa
- Total: $32,200

**Total vendido en el día:** $71,600 (4 transacciones)

#### 5. Generación de Reportes

**Reporte Diario (JSON):**
- Fecha: 2025-10-04
- Total de transacciones: 4
- Ingresos totales: $71,600

**Productos más vendidos:**
1. Arroz (P001): 10 unidades - $28,200
2. Arroz Roa (ALI001): 6 unidades - $17,400
3. Frijoles (P002): 4 unidades - $18,000

**Exportación CSV:** Generado correctamente con toda la información del día

**Exportación PDF:** Funcionalidad implementada y disponible

#### 6. Control de Permisos

Todas las restricciones de permisos funcionan correctamente:

| Acción | Usuario | Resultado | Estado |
|--------|---------|-----------|--------|
| Crear producto | Cajero | Error 403 | Correcto |
| Actualizar producto | Cajero | Error 403 | Correcto |
| Eliminar producto | Cajero | Error 403 | Correcto |
| Listar usuarios | Cajero | Error 403 | Correcto |
| Acceso sin token | - | Error 401 | Correcto |
| Stock insuficiente | Cajero | Error 400 | Correcto |

**Validación de stock:**
- Se intentó vender 1,000 unidades de Arroz (disponible: 172)
- Sistema rechazó correctamente con mensaje: "Stock insuficiente para Arroz. Disponible: 172, Solicitado: 1000"

#### 7. Auditoría y Seguridad

**Registro de intentos de login:**
- Se registraron 8 intentos de inicio de sesión
- 6 exitosos, 2 fallidos
- Se captura IP, user-agent y timestamp

**Logout y blacklist:**
- El cajero cerró sesión correctamente
- Al intentar usar el token revocado: "Sesión cerrada. Por favor, inicie sesión nuevamente"

**Listado de usuarios (solo ADMIN):**
- Se listaron 7 usuarios en total del sistema
- Ordenados por fecha de creación descendente

---

### Resumen de Pruebas

| Categoría | Tests Realizados | Exitosos |
|-----------|------------------|----------|
| Autenticación | 5 | 5 |
| Productos (CRUD) | 6 | 6 |
| Ventas | 5 | 5 |
| Reportes | 4 | 4 |
| Permisos | 6 | 6 |
| Auditoría | 3 | 3 |
| **TOTAL** | **29** | **29** |

---

### Conclusiones de las Pruebas

El sistema funciona correctamente en todos los aspectos críticos:

- **Seguridad**: Autenticación JWT, control de roles y blacklist funcionan perfectamente
- **Integridad de datos**: Las transacciones atómicas garantizan consistencia
- **Validaciones**: Todas las reglas de negocio se aplican correctamente
- **Auditoría**: Se registran todos los intentos de acceso
- **Permisos**: El sistema de roles ADMIN/CAJERO funciona como se espera
- **Actualizaciones parciales**: Se pueden modificar campos individuales sin afectar otros

---

## Solución de Problemas

### Error: "Error de conexión a la base de datos"

**Causa**: PostgreSQL no está corriendo o las credenciales son incorrectas.

**Solución**:
```bash
# Verificar que PostgreSQL esté corriendo
sudo service postgresql status

# Iniciar PostgreSQL si está detenido
sudo service postgresql start

# Verificar las credenciales en el archivo .env
```

### Error: "Token requerido" o "Token inválido"

**Causa**: No se está enviando el token o el formato es incorrecto.

**Solución**: Asegurarse de incluir el header:
```
Authorization: Bearer [TOKEN_COMPLETO_SIN_CORCHETES]
```

### Error: "Stock insuficiente"

**Causa**: Se está intentando vender más unidades de las disponibles.

**Solución**: Verificar el stock disponible con `GET http://localhost:4000/productos` antes de registrar la venta.

### Error: "El código del producto ya existe"

**Causa**: Se está intentando crear un producto con un código que ya existe.

**Solución**: Usar un código único o actualizar el producto existente.

---

## Mantenimiento

### Limpiar tokens revocados antiguos (ejecutar periódicamente)
```bash
curl -X DELETE http://localhost:4000/usuarios/limpiar-tokens \
  -H "Authorization: Bearer [ADMIN_TOKEN]"
```

### Backup de la base de datos
```bash
# Crear backup
pg_dump -U postgres inventario > backup_inventario_$(date +%Y%m%d).sql

# Restaurar backup
psql -U postgres inventario < backup_inventario_YYYYMMDD.sql
```

### Ver logs de intentos de login
```bash
curl -X GET "http://localhost:4000/usuarios/intentos-login?limit=100" \
  -H "Authorization: Bearer [ADMIN_TOKEN]"
```

---

## Roadmap / Mejoras Futuras

- [ ] Implementar frontend con React y TailwindCSS
- [ ] Cierre de sesión automático por inactividad (frontend)
- [ ] Agregar paginación a todos los endpoints de listado
- [ ] Implementar sistema de devoluciones
- [ ] Agregar soporte para múltiples almacenes
- [ ] Implementar notificaciones de stock bajo
- [ ] Agregar categorías de productos
- [ ] Sistema de descuentos y promociones
- [ ] Dashboard en tiempo real
- [ ] Exportar reportes a Excel
- [ ] API de búsqueda avanzada de productos
- [ ] Historial de cambios de precios
- [ ] Sistema de alertas por email

---

## Contribuir

Si deseas contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## Autor

**Michel Yagari**
- Email: micheldahanayagari@gmail.com
- Proyecto: Prueba Técnica - Sistema de Gestión de Inventario y Ventas
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
- Sistema de logout con blacklist
- Registro de auditoría de intentos de login
- Validación exhaustiva de permisos y datos

---

## Notas Adicionales

### Configuración de producción

Para desplegar en producción:

1. Usar una base de datos PostgreSQL en la nube (ej: AWS RDS, Railway, Render)
2. Cambiar `JWT_SECRET` a una clave robusta (mínimo 32 caracteres)
3. Configurar HTTPS
4. Usar variables de entorno seguras
5. Implementar rate limiting
6. Configurar CORS apropiadamente
7. Implementar logs con Winston o similar
8. Configurar variables de entorno para producción

### Variables de entorno recomendadas para producción

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require
JWT_SECRET=clave_muy_segura_de_al_menos_32_caracteres
JWT_EXPIRES=8h
CORS_ORIGIN=https://tu-frontend.com
```

---

**Gracias por revisar este sistema de gestión de inventario y ventas**
```

