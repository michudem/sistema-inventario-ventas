
```markdown
# Sistema de Gestión de Inventario y Ventas

Sistema completo para gestión de inventario, ventas y reportes con autenticación de usuarios y control de acceso basado en roles.

---

##  Tabla de Contenidos

1. [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
2. [Tecnologías Utilizadas](#-tecnologías-utilizadas)
3. [Requisitos Previos](#-requisitos-previos)
4. [Manual de Instalación](#-manual-de-instalación)
5. [Configuración del Sistema](#-configuración-del-sistema)
6. [Inicio de Sesión](#-inicio-de-sesión)
7. [Funcionalidades por Rol](#-funcionalidades-por-rol)
8. [Manual de Uso Detallado](#-manual-de-uso-detallado)
9. [API Endpoints](#-api-endpoints)
10. [Solución de Problemas](#-solución-de-problemas)

---

## Arquitectura del Proyecto
inventario-ventas/
├── backend/                    # API REST con Node.js + Express
│   ├── constants/
│   │   └── messages.js        # Mensajes centralizados
│   ├── database/
│   │   ├── connection.js      # Configuración PostgreSQL
│   │   ├── schema.sql         # Esquema de base de datos
│   │   └── seeds.sql          # Datos de prueba
│   ├── middlewares/
│   │   └── auth.js            # Autenticación JWT
│   ├── services/              # Lógica de negocio
│   │   ├── authService.js
│   │   ├── productosService.js
│   │   ├── ventasService.js
│   │   └── reportesService.js
│   ├── validators/            # Validaciones reutilizables
│   │   └── validators.js
│   ├── routes/                # Rutas de la API
│   │   ├── usuarios.js
│   │   ├── productos.js
│   │   ├── ventas.js
│   │   └── reportes.js
│   └── index.js               # Punto de entrada
│
└── frontend-react/            # Interfaz con React + Vite
    ├── src/
    │   ├── assets/            # Imágenes y recursos
    │   ├── components/        # Componentes React
    │   ├── constants/         # Constantes y mensajes
    │   ├── context/           # React Context
    │   ├── hooks/             # Custom Hooks
    │   └── services/          # Servicios HTTP
    └── package.json
---

##  Tecnologías Utilizadas

### Backend
- **Node.js** v22.20.0
- **Express** v5.1.0 - Framework web
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación con tokens
- **bcryptjs** - Encriptación de contraseñas
- **PDFKit** - Generación de tickets y reportes PDF
- **ES Modules** - Sintaxis moderna de JavaScript

### Frontend
- **React** 18
- **Vite** - Build tool de nueva generación
- **React Router DOM** v6 - Navegación SPA
- **Axios** - Cliente HTTP
- **Lucide React** - Librería de iconos
- **Tailwind CSS** - Framework de estilos utility-first

---

##  Requisitos Previos

Antes de instalar el sistema, asegúrate de tener instalado:

1. **Node.js** (versión 18 o superior)
   - Descargar de: https://nodejs.org/
   - Verificar instalación: `node --version`

2. **PostgreSQL** (versión 14 o superior)
   - Descargar de: https://www.postgresql.org/download/
   - Verificar instalación: `psql --version`

3. **Git** (para clonar el repositorio)
   - Descargar de: https://git-scm.com/
   - Verificar instalación: `git --version`

4. **Editor de código** (recomendado: VS Code)

---

##  Manual de Instalación

### Paso 1: Clonar el Repositorio

```bash
# Clonar desde GitHub
git clone https://github.com/tu-usuario/inventario-ventas.git

# Entrar al directorio
cd inventario-ventas
```

### Paso 2: Instalar Backend

```bash
# Navegar a la carpeta del backend
cd backend

# Instalar dependencias
npm install
```

**Dependencias que se instalarán:**
- express: Framework web
- pg: Cliente PostgreSQL
- jsonwebtoken: Manejo de JWT
- bcryptjs: Hash de contraseñas
- cors: Habilitar CORS
- dotenv: Variables de entorno
- pdfkit: Generación de PDFs

### Paso 3: Configurar Base de Datos

#### 3.1. Crear la Base de Datos

```bash
# Conectar a PostgreSQL (Windows)
psql -U postgres

# Conectar a PostgreSQL (Linux/Mac)
sudo -u postgres psql
```

Una vez dentro de PostgreSQL:

```sql
-- Crear la base de datos
CREATE DATABASE inventario;

-- Salir de psql
\q
```

#### 3.2. Ejecutar el Schema

```bash
# Ejecutar el archivo schema.sql
psql -U postgres -d inventario -f database/schema.sql
```

Esto creará las siguientes tablas:
- `usuarios` - Usuarios del sistema
- `productos` - Catálogo de productos
- `ventas` - Registro de ventas
- `detalle_ventas` - Productos por venta
- `intentos_inicio_sesion` - Log de intentos de login
- `tokens_revocados` - Tokens invalidados

#### 3.3. (Opcional) Cargar Datos de Prueba

```bash
# Cargar datos de ejemplo
psql -U postgres -d inventario -f database/seeds.sql
```

Esto creará:
- 100 productos de ejemplo
- 2 usuarios administradores
- 5 usuarios cajeros

### Paso 4: Configurar Variables de Entorno del Backend

Crear archivo `.env` en la carpeta `backend/`:

```bash
# En Windows
copy .env.example .env

# En Linux/Mac
cp .env.example .env
```

Editar el archivo `.env` con tus credenciales:

```env
# Puerto del servidor backend
PORT=4000

# Conexión a PostgreSQL
# Formato: postgresql://usuario:contraseña@host:puerto/nombre_db
DATABASE_URL=postgresql://postgres:tu_contraseña@localhost:5432/inventario

# Clave secreta para JWT (cambiar por una clave segura)
JWT_SECRET=mi_clave_super_secreta_123456

# Tiempo de expiración del token
JWT_EXPIRES=8h
```

**IMPORTANTE:** Cambia `tu_contraseña` por tu contraseña de PostgreSQL y `JWT_SECRET` por una clave única y segura.

### Paso 5: Instalar Frontend

```bash
# Volver a la raíz del proyecto
cd ..

# Entrar a la carpeta del frontend
cd frontend-react

# Instalar dependencias
npm install
```

**Dependencias que se instalarán:**
- react: Librería UI
- react-dom: Renderizado de React
- react-router-dom: Navegación
- axios: Cliente HTTP
- lucide-react: Iconos
- tailwindcss: Estilos

### Paso 6: Configurar Variables de Entorno del Frontend

Crear archivo `.env` en la carpeta `frontend-react/`:

```bash
# Crear archivo .env
echo "VITE_API_URL=http://localhost:4000" > .env
```

O crear manualmente el archivo `.env`:

```env
# URL del backend
VITE_API_URL=http://localhost:4000
```

### Paso 7: Verificar Instalación

```bash
# Verificar que todas las dependencias se instalaron correctamente

# En backend/
cd backend
npm list --depth=0

# En frontend-react/
cd ../frontend-react
npm list --depth=0
```

---

##  Configuración del Sistema

### Iniciar el Backend

```bash
# Desde la carpeta backend/
cd backend
npm run dev
```

Deberías ver:
```
Servidor corriendo en http://localhost:4000
Encoding: UTF-8
```

### Iniciar el Frontend

**En una terminal diferente:**

```bash
# Desde la carpeta frontend-react/
cd frontend-react
npm run dev
```

Deberías ver:
```
ROLLDOWN-VITE v7.1.14  ready in XXX ms

Local:   http://localhost:5173/
Network: use --host to expose
```

### Acceder a la Aplicación

Abre tu navegador y ve a: **http://localhost:5173**

---

##  Inicio de Sesión

### Pantalla de Login

Al abrir la aplicación, verás la pantalla de inicio de sesión:

![Login Screen](C:\inventario-ventas\frontend-react\public\docs\login.png)

### Usuarios de Prueba

Si cargaste los datos de prueba (`seeds.sql`), puedes usar:

#### Administrador
- **Usuario:** `michel.yagari`
- **Contraseña:** `123456`

#### Cajero
- **Usuario:** `laura.mejia`
- **Contraseña:** `CajeraM123*`

### Proceso de Inicio de Sesión

1. Ingresa tu **nombre de usuario**
2. Ingresa tu **contraseña**
3. Haz clic en el botón **"Iniciar Sesión"**

#### Validaciones

- Ambos campos son obligatorios
- El sistema verifica que el usuario exista
- Se valida que la contraseña sea correcta
- Se registra el intento de inicio de sesión (exitoso o fallido)

#### Tokens JWT

- Al iniciar sesión exitosamente, se genera un token JWT
- El token tiene una duración de **8 horas** por defecto
- El token se almacena localmente en el navegador
- Todas las peticiones posteriores incluyen este token

### Cierre de Sesión

1. Haz clic en tu nombre de usuario en la barra lateral
2. Selecciona **"Cerrar Sesión"**
3. El token será revocado en el servidor
4. Serás redirigido a la pantalla de login

---

##  Funcionalidades por Rol

El sistema tiene dos roles de usuario con diferentes permisos:

###  ROL: ADMINISTRADOR

El administrador tiene acceso completo al sistema:

#### Módulos Disponibles
- **Inicio** - Dashboard con estadísticas
- **Productos** - Gestión completa de productos
- **Ventas** - Registro de ventas
- **Reportes** - Generación de reportes
- **Usuarios** - Gestión de usuarios del sistema

#### Permisos Específicos

**En Productos:**
- Ver listado de productos
- Buscar productos
- **Crear nuevos productos**
- **Editar productos existentes**
- **Eliminar productos**

**En Ventas:**
- Registrar ventas
- Ver historial de ventas
- Descargar tickets en PDF

**En Reportes:**
- Ver reportes diarios
- Exportar reportes en CSV
- Exportar reportes en PDF
- Ver reportes por rango de fechas
- Ver productos más vendidos

**En Usuarios:**
- Ver lista de usuarios
- **Crear nuevos usuarios**
- **Editar usuarios existentes**
- **Eliminar usuarios**
- **Asignar roles (Admin/Cajero)**
- Ver historial de intentos de login
- Gestionar tokens revocados

---

### ROL: CAJERO

El cajero tiene acceso limitado enfocado en operaciones de venta:

#### Módulos Disponibles
- **Inicio** - Dashboard con estadísticas
- **Productos** - Solo visualización
- **Ventas** - Registro de ventas
- **Reportes** - Visualización de reportes
- **Usuarios** - NO TIENE ACCESO

#### Permisos Específicos

**En Productos:**
- Ver listado de productos
- Buscar productos
- NO puede crear productos
- NO puede editar productos
- NO puede eliminar productos

**En Ventas:**
- Registrar ventas
- Ver historial de ventas
- Descargar tickets en PDF

**En Reportes:**
- Ver reportes diarios
- Exportar reportes en CSV
- Exportar reportes en PDF
- Ver reportes por rango de fechas
- Ver productos más vendidos

**Restricciones:**
- No puede acceder al módulo de Usuarios
- No puede crear, editar o eliminar productos
- Solo puede ver información, no modificarla (excepto ventas)

---

##  Manual de Uso Detallado

### 1. Módulo de Inicio (Dashboard)

Al iniciar sesión, verás el dashboard principal:

#### Estadísticas Mostradas

1. **Total Productos:** Número total de productos en el sistema
2. **Ventas Hoy:** Cantidad de transacciones realizadas hoy
3. **Ingresos Hoy:** Total de dinero generado en ventas de hoy
4. **Stock Bajo:** Productos con menos de 20 unidades

#### Funcionalidades

- **Actualización automática:** Las estadísticas se actualizan cada 30 segundos
- **Actualización manual:** Botón "Actualizar" para refrescar datos inmediatamente
- **Alertas:** Si hay productos con stock bajo, aparece una alerta amarilla

---

### 2. Módulo de Productos

#### 2.1. Ver Productos

**Acceso:** Inicio → Productos

**Información Mostrada:**
- Código del producto
- Nombre
- Descripción
- Precio unitario
- Cantidad en stock (con indicador de color)

**Barra de Búsqueda:**
- Busca por nombre de producto
- Busca por código de producto
- Resultados en tiempo real

**Indicadores de Stock:**
- Verde: Más de 10 unidades
- Amarillo: Entre 1 y 10 unidades
- Rojo: Sin stock (0 unidades)

#### 2.2. Crear Producto (Solo Admin)

**Pasos:**

1. Haz clic en el botón **"+ Nuevo Producto"**
2. Se abre un modal con el formulario
3. Completa los campos:
   - **Código:** Identificador único (ej: A001, P123)
   - **Nombre:** Nombre del producto
   - **Descripción:** (Opcional) Descripción detallada
   - **Precio:** Precio unitario en pesos
   - **Cantidad:** Stock inicial

4. Haz clic en **"Guardar"**

**Validaciones:**
- El código debe ser único
- Todos los campos son obligatorios excepto descripción
- El precio debe ser mayor a 0
- La cantidad debe ser un número entero positivo

#### 2.3. Editar Producto (Solo Admin)

**Pasos:**

1. Localiza el producto en la lista
2. Haz clic en el ícono de **lápiz (Editar)**
3. Se abre el modal con los datos actuales
4. Modifica los campos necesarios
5. Haz clic en **"Guardar"**

**Nota:** No puedes cambiar el código a uno que ya exista.

#### 2.4. Eliminar Producto (Solo Admin)

**Pasos:**

1. Localiza el producto en la lista
2. Haz clic en el ícono de **papelera (Eliminar)**
3. Confirma la acción en el diálogo

**Restricción:** No puedes eliminar un producto que tenga ventas asociadas.

---

### 3. Módulo de Ventas

#### 3.1. Realizar una Venta

**Acceso:** Inicio → Ventas

**Pantalla dividida en dos secciones:**

**Izquierda: Lista de Productos**
- Todos los productos disponibles
- Barra de búsqueda para filtrar
- Botón "+" para agregar al carrito
- Indicador de stock disponible

**Derecha: Carrito de Compras**
- Productos agregados
- Cantidad de cada producto
- Subtotal por producto
- Total general

**Pasos para realizar una venta:**

1. **Buscar producto** (opcional):
   - Escribe el nombre o código en el buscador

2. **Agregar producto al carrito**:
   - Haz clic en el botón "+" junto al producto deseado
   - El producto se agrega con cantidad 1
   - Si el producto ya está en el carrito, incrementa la cantidad

3. **Ajustar cantidades**:
   - Usa los botones **"+"** y **"-"** en el carrito
   - O haz clic en el ícono de **papelera** para eliminar del carrito

4. **Revisar total**:
   - Verifica el total de items
   - Verifica el monto total a pagar

5. **Finalizar venta**:
   - Haz clic en el botón **"Finalizar Venta"**
   - Confirma la transacción

6. **Descargar ticket** (opcional):
   - Al finalizar, aparece un diálogo
   - Opción para descargar el ticket en PDF

**Validaciones:**
- No puedes agregar más unidades de las disponibles en stock
- No puedes finalizar con el carrito vacío
- El stock se actualiza automáticamente después de la venta

#### 3.2. Historial de Ventas

**Ver ventas realizadas:**

1. Las ventas aparecen en el listado inferior (si implementado)
2. Cada venta muestra:
   - Número de transacción
   - Fecha y hora
   - Cajero que realizó la venta
   - Total de la venta

---

### 4. Módulo de Reportes

#### 4.1. Reporte Diario

**Acceso:** Inicio → Reportes

**Pasos:**

1. **Seleccionar fecha**:
   - Por defecto muestra la fecha actual
   - Puedes cambiar a cualquier fecha pasada

2. **Generar reporte**:
   - Haz clic en el botón **"Generar Reporte"**

3. **Información mostrada**:
   - **Total de transacciones:** Número de ventas del día
   - **Ingresos totales:** Suma de todas las ventas
   - **Productos vendidos:** Lista con:
     - Código del producto
     - Nombre
     - Cantidad vendida
     - Total generado

#### 4.2. Exportar Reportes

**Formatos disponibles:**

**CSV (Excel):**
1. Genera el reporte diario
2. Haz clic en el botón **"CSV"**
3. Se descarga un archivo `.csv`
4. Puedes abrirlo en Excel, Google Sheets, etc.

**PDF:**
1. Genera el reporte diario
2. Haz clic en el botón **"PDF"**
3. Se descarga un archivo `.pdf`
4. Incluye:
   - Encabezado con fecha
   - Resumen del día
   - Tabla de productos vendidos
   - Pie de página con fecha de generación

#### 4.3. Reporte por Rango de Fechas

**Funcionalidad avanzada:**

1. Selecciona una **fecha de inicio**
2. Selecciona una **fecha final**
3. Genera el reporte consolidado
4. Muestra:
   - Resumen del período
   - Productos vendidos en el rango
   - Ventas día por día

---

### 5. Módulo de Usuarios (Solo Admin)

#### 5.1. Ver Usuarios

**Acceso:** Inicio → Usuarios (solo visible para Admin)

**Información mostrada:**
- Nombre de usuario
- Rol (ADMIN o CAJERO)
- Fecha de creación

#### 5.2. Crear Usuario

**Pasos:**

1. Haz clic en **"+ Nuevo Usuario"**
2. Completa el formulario:
   - **Nombre de usuario:** Único en el sistema
   - **Contraseña:** Mínimo 6 caracteres
   - **Rol:** Seleccionar ADMIN o CAJERO

3. Haz clic en **"Registrar"**

**Validaciones:**
- El nombre de usuario debe ser único
- La contraseña debe tener al menos 6 caracteres
- El rol es obligatorio

#### 5.3. Editar Usuario

**Pasos:**

1. Localiza el usuario en la lista
2. Haz clic en el ícono de **editar**
3. Modifica los campos necesarios:
   - Nombre de usuario
   - Contraseña (opcional)
   - Rol

4. Haz clic en **"Guardar"**

#### 5.4. Eliminar Usuario

**Pasos:**

1. Localiza el usuario en la lista
2. Haz clic en el ícono de **eliminar**
3. Confirma la acción

**Restricción:** No puedes eliminar un usuario que tenga ventas asociadas.

#### 5.5. Ver Intentos de Login

**Funcionalidad de auditoría:**

1. Acceso desde el módulo de Usuarios
2. Muestra historial de intentos de inicio de sesión:
   - Usuario que intentó ingresar
   - Fecha y hora
   - Si fue exitoso o fallido
   - Dirección IP
   - Navegador utilizado

---

## API Endpoints

### Autenticación

```http
POST /usuarios/registro
Body: { username, password, rol }
Respuesta: { ok: true, usuario: {...} }

POST /usuarios/login
Body: { username, password }
Respuesta: { ok: true, token, usuario: {...} }

POST /usuarios/logout
Headers: Authorization: Bearer {token}
Respuesta: { ok: true, mensaje }
```

### Productos

```http
GET /productos
Headers: Authorization: Bearer {token}
Respuesta: { ok: true, productos: [...] }

GET /productos/:id
Headers: Authorization: Bearer {token}
Respuesta: { ok: true, producto: {...} }

POST /productos
Headers: Authorization: Bearer {token}
Rol requerido: ADMIN
Body: { codigo, nombre, descripcion, precio_unitario, cantidad }
Respuesta: { ok: true, producto: {...} }

PUT /productos/:id
Headers: Authorization: Bearer {token}
Rol requerido: ADMIN
Body: { campos a actualizar }
Respuesta: { ok: true, producto: {...} }

DELETE /productos/:id
Headers: Authorization: Bearer {token}
Rol requerido: ADMIN
Respuesta: { ok: true, mensaje }
```

### Ventas

```http
GET /ventas
Headers: Authorization: Bearer {token}
Query params: ?page=1&limit=10
Respuesta: { ok: true, ventas: [...] }

GET /ventas/:id
Headers: Authorization: Bearer {token}
Respuesta: { ok: true, venta: {...} }

POST /ventas
Headers: Authorization: Bearer {token}
Body: { productos: [{ producto_id, cantidad }] }
Respuesta: { ok: true, venta: {...} }

GET /ventas/:id/ticket-pdf
Headers: Authorization: Bearer {token}
Respuesta: Archivo PDF
```

### Reportes

```http
GET /reportes/ventas/diario
Headers: Authorization: Bearer {token}
Query params: ?fecha=2025-10-06
Respuesta: { ok: true, reporte: {...} }

GET /reportes/ventas/diario/csv
Headers: Authorization: Bearer {token}
Query params: ?fecha=2025-10-06
Respuesta: Archivo CSV

GET /reportes/ventas/diario/pdf
Headers: Authorization: Bearer {token}
Query params: ?fecha=2025-10-06
Respuesta: Archivo PDF

GET /reportes/ventas/rango
Headers: Authorization: Bearer {token}
Query params: ?fecha_inicio=2025-10-01&fecha_fin=2025-10-06
Respuesta: { ok: true, rango: {...}, resumen: {...} }

GET /reportes/productos/mas-vendidos
Headers: Authorization: Bearer {token}
Query params: ?limit=10
Respuesta: { ok: true, productos_mas_vendidos: [...] }
```

---

## Solución de Problemas

### Backend no inicia

**Error: `Cannot find module`**
```bash
# Reinstalar dependencias
cd backend
rm -rf node_modules package-lock.json
npm install
```

**Error: `connect ECONNREFUSED`**
- Verifica que PostgreSQL esté corriendo
- Verifica las credenciales en el archivo `.env`
- Verifica que la base de datos exista

**Error: `Port 4000 is already in use`**
```bash
# Windows: Matar proceso en puerto 4000
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:4000 | xargs kill -9
```

### Frontend no inicia

**Error: `Cannot find module 'react-router-dom'`**
```bash
cd frontend-react
npm install react-router-dom
```

**Error: Pantalla blanca**
- Abre la consola del navegador (F12)
- Revisa errores en la pestaña Console
- Verifica que el backend esté corriendo

### Problemas de Autenticación

**Error: `Token inválido`**
- El token expiró (dura 8 horas)
- Cierra sesión y vuelve a iniciar sesión

**Error: `No tienes permisos`**
- Tu rol de usuario no tiene acceso a esa funcionalidad
- Contacta a un administrador

### Problemas con la Base de Datos

**Error al crear productos: `duplicate key value`**
- El código del producto ya existe
- Usa un código diferente

**Error: `relation "productos" does not exist`**
- No se ejecutó el schema.sql
- Ejecuta: `psql -U postgres -d inventario -f database/schema.sql`

---

## Principios de Diseño Aplicados

### SOLID
- **Single Responsibility:** Cada función/clase tiene una única responsabilidad
- **Open/Closed:** Código abierto para extensión, cerrado para modificación
- **Liskov Substitution:** Objetos intercambiables mantienen consistencia
- **Interface Segregation:** Interfaces específicas vs generales
- **Dependency Inversion:** Dependencia de abstracciones

### Clean Code
- Nombres descriptivos y auto-explicativos
- Funciones pequeñas (menos de 20 líneas)
- Sin comentarios innecesarios
- Código que se explica a sí mismo
- Separación clara de responsabilidades

---

## 📝 Licencia

ISC

---

## 👨‍💻 Autor

Michel Yagari
micheldahanayagari@gmail.com
[\[Tu GitHub\]](https://github.com/tu-usuario/inventario-ventas)



