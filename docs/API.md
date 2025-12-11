# API Reference - CRM Inmobiliario STRATO

## 📋 Índice

1. [Autenticación](#autenticación)
2. [Leads API](#leads-api)
3. [Códigos de Estado HTTP](#códigos-de-estado-http)
4. [Manejo de Errores](#manejo-de-errores)
5. [Tipos TypeScript](#tipos-typescript)

## 🔐 Autenticación

Todas las rutas de API requieren autenticación mediante NextAuth.js. Las solicitudes deben incluir una cookie de sesión válida.

### Endpoints de Autenticación

#### POST /api/auth/signin
Inicia sesión de usuario.

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "contraseña123"
}
```

**Response 200:**
```json
{
  "ok": true,
  "url": "/dashboard"
}
```

**Response 401:**
```json
{
  "error": "CredentialsSignin"
}
```

## 📝 Leads API

### GET /api/leads

Lista leads con paginación, filtros y búsqueda.

**Query Parameters:**

| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `page` | number | No | 1 | Número de página |
| `limit` | number | No | 10 | Items por página (máx: 100) |
| `estado` | string | No | - | Filtrar por estado |
| `origen` | string | No | - | Filtrar por origen |
| `search` | string | No | - | Búsqueda en nombre, teléfono, email |
| `sortBy` | string | No | createdAt | Campo para ordenar |
| `sortOrder` | string | No | desc | 'asc' o 'desc' |

**Estados válidos:**
- `NUEVO`
- `EN_REVISION`
- `PREAPROBADO`
- `RECHAZADO`
- `DOC_PENDIENTE`
- `DERIVADO`

**Orígenes válidos:**
- `whatsapp`
- `instagram`
- `facebook`
- `comentario`
- `web`
- `ads`

**Ejemplo de Request:**
```bash
GET /api/leads?page=1&limit=10&estado=NUEVO&search=Juan&sortBy=createdAt&sortOrder=desc
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "clx1234567890",
      "nombre": "Juan Pérez",
      "dni": "12345678",
      "cuil": null,
      "telefono": "+5491123456789",
      "email": "juan@example.com",
      "ingresos": 50000,
      "zona": "CABA",
      "producto": "Crédito Hipotecario",
      "monto": 5000000,
      "origen": "whatsapp",
      "utmSource": null,
      "estado": "NUEVO",
      "agencia": null,
      "banco": null,
      "trabajo_actual": "Desarrollador",
      "notas": "Cliente interesado en propiedad en Palermo",
      "whatsappId": null,
      "tags": null,
      "customFields": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 10,
  "totalPages": 15
}
```

**Response 401:**
```json
{
  "error": "Unauthorized",
  "message": "Debes estar autenticado para acceder a este recurso"
}
```

### POST /api/leads

Crea un nuevo lead.

**Body:**
```json
{
  "nombre": "Juan Pérez",
  "dni": "12345678",
  "cuil": "20-12345678-9",
  "telefono": "+5491123456789",
  "email": "juan@example.com",
  "ingresos": 50000,
  "zona": "CABA",
  "producto": "Crédito Hipotecario",
  "monto": 5000000,
  "origen": "whatsapp",
  "estado": "NUEVO",
  "agencia": null,
  "banco": null,
  "trabajo_actual": "Desarrollador",
  "notas": "Cliente interesado en propiedad en Palermo"
}
```

**Campos requeridos:**
- `nombre` (string)
- `telefono` (string)

**Campos opcionales:**
- `dni` (string, único)
- `cuil` (string)
- `email` (string, formato email válido)
- `ingresos` (number, positivo)
- `zona` (string)
- `producto` (string)
- `monto` (number, positivo)
- `origen` (enum: whatsapp, instagram, facebook, comentario, web, ads)
- `estado` (enum: NUEVO, EN_REVISION, PREAPROBADO, RECHAZADO, DOC_PENDIENTE, DERIVADO)
- `agencia` (string)
- `banco` (string)
- `trabajo_actual` (string)
- `notas` (string)

**Response 201:**
```json
{
  "id": "clx1234567890",
  "nombre": "Juan Pérez",
  "dni": "12345678",
  "telefono": "+5491123456789",
  "email": "juan@example.com",
  "estado": "NUEVO",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Response 400:**
```json
{
  "error": "ValidationError",
  "message": "Error de validación",
  "errors": [
    {
      "field": "nombre",
      "message": "El nombre es requerido"
    },
    {
      "field": "email",
      "message": "Email inválido"
    }
  ]
}
```

**Response 409:**
```json
{
  "error": "Conflict",
  "message": "Ya existe un lead con este DNI"
}
```

### GET /api/leads/[id]

Obtiene un lead por ID con sus relaciones.

**Path Parameters:**
- `id` (string): ID del lead (CUID)

**Response 200:**
```json
{
  "id": "clx1234567890",
  "nombre": "Juan Pérez",
  "dni": "12345678",
  "cuil": "20-12345678-9",
  "telefono": "+5491123456789",
  "email": "juan@example.com",
  "ingresos": 50000,
  "zona": "CABA",
  "producto": "Crédito Hipotecario",
  "monto": 5000000,
  "origen": "whatsapp",
  "utmSource": null,
  "estado": "NUEVO",
  "agencia": null,
  "banco": null,
  "trabajo_actual": "Desarrollador",
  "notas": "Cliente interesado en propiedad en Palermo",
      "whatsappId": null,
  "tags": null,
  "customFields": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "events": [
    {
      "id": "evt1234567890",
      "tipo": "CREATED",
      "payload": null,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "conversations": []
}
```

**Response 404:**
```json
{
  "error": "NotFound",
  "message": "Lead no encontrado"
}
```

### PUT /api/leads/[id]

Actualiza un lead existente.

**Path Parameters:**
- `id` (string): ID del lead (CUID)

**Body:**
```json
{
  "nombre": "Juan Pérez Actualizado",
  "estado": "EN_REVISION",
  "notas": "Notas actualizadas"
}
```

**Nota:** Solo se deben enviar los campos que se desean actualizar. Todos los campos son opcionales excepto que deben cumplir las mismas validaciones que en POST.

**Response 200:**
```json
{
  "id": "clx1234567890",
  "nombre": "Juan Pérez Actualizado",
  "estado": "EN_REVISION",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

**Response 400:**
```json
{
  "error": "ValidationError",
  "message": "Error de validación",
  "errors": [...]
}
```

**Response 404:**
```json
{
  "error": "NotFound",
  "message": "Lead no encontrado"
}
```

### DELETE /api/leads/[id]

Elimina un lead (hard delete).

**Path Parameters:**
- `id` (string): ID del lead (CUID)

**Response 200:**
```json
{
  "message": "Lead eliminado correctamente"
}
```

**Response 404:**
```json
{
  "error": "NotFound",
  "message": "Lead no encontrado"
}
```

**Response 403:**
```json
{
  "error": "Forbidden",
  "message": "No tienes permisos para eliminar leads"
}
```

## 📊 Códigos de Estado HTTP

| Código | Significado | Descripción |
|--------|-------------|-------------|
| 200 | OK | Solicitud exitosa |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Error de validación o datos inválidos |
| 401 | Unauthorized | No autenticado |
| 403 | Forbidden | No autorizado (permisos insuficientes) |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Conflicto (ej: DNI duplicado) |
| 500 | Internal Server Error | Error del servidor |

## ⚠️ Manejo de Errores

### Formato de Error Estándar

```json
{
  "error": "ErrorType",
  "message": "Mensaje descriptivo del error",
  "errors": [
    {
      "field": "campo",
      "message": "Mensaje específico del campo"
    }
  ]
}
```

### Tipos de Error

- **ValidationError**: Error de validación de datos
- **Unauthorized**: No autenticado
- **Forbidden**: No autorizado
- **NotFound**: Recurso no encontrado
- **Conflict**: Conflicto de datos (duplicados, etc.)
- **InternalServerError**: Error interno del servidor

### Ejemplo de Error de Validación

```json
{
  "error": "ValidationError",
  "message": "Los datos proporcionados no son válidos",
  "errors": [
    {
      "field": "nombre",
      "message": "El nombre es requerido"
    },
    {
      "field": "telefono",
      "message": "El teléfono es requerido"
    },
    {
      "field": "email",
      "message": "Email inválido"
    }
  ]
}
```

## 📘 Tipos TypeScript

### Lead

```typescript
interface Lead {
  id: string;
  nombre: string;
  dni: string | null;
  cuil: string | null;
  telefono: string;
  email: string | null;
  ingresos: number | null;
  zona: string | null;
  producto: string | null;
  monto: number | null;
  origen: 'whatsapp' | 'instagram' | 'facebook' | 'comentario' | 'web' | 'ads' | null;
  utmSource: string | null;
  estado: 'NUEVO' | 'EN_REVISION' | 'PREAPROBADO' | 'RECHAZADO' | 'DOC_PENDIENTE' | 'DERIVADO';
  agencia: string | null;
  banco: string | null;
  trabajo_actual: string | null;
  notas: string | null;
  whatsappId: string | null;
  tags: string | null;
  customFields: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### LeadInput

```typescript
interface LeadInput {
  nombre: string;
  dni?: string;
  cuil?: string;
  telefono: string;
  email?: string;
  ingresos?: number;
  zona?: string;
  producto?: string;
  monto?: number;
  origen?: 'whatsapp' | 'instagram' | 'facebook' | 'comentario' | 'web' | 'ads';
  estado?: 'NUEVO' | 'EN_REVISION' | 'PREAPROBADO' | 'RECHAZADO' | 'DOC_PENDIENTE' | 'DERIVADO';
  agencia?: string;
  banco?: string;
  trabajo_actual?: string;
  notas?: string;
}
```

### PaginatedResponse

```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### APIError

```typescript
interface APIError {
  error: string;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
```

### QueryParams

```typescript
interface LeadsQueryParams {
  page?: number;
  limit?: number;
  estado?: string;
  origen?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

## 🔍 Ejemplos de Uso

### JavaScript/TypeScript (Fetch)

```typescript
// Listar leads
const response = await fetch('/api/leads?page=1&limit=10&estado=NUEVO', {
  method: 'GET',
  credentials: 'include',
});

const data = await response.json();

// Crear lead
const newLead = await fetch('/api/leads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    nombre: 'Juan Pérez',
    telefono: '+5491123456789',
    email: 'juan@example.com',
    estado: 'NUEVO',
  }),
});

// Actualizar lead
const updatedLead = await fetch('/api/leads/clx1234567890', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    estado: 'EN_REVISION',
  }),
});

// Eliminar lead
await fetch('/api/leads/clx1234567890', {
  method: 'DELETE',
  credentials: 'include',
});
```

### cURL

```bash
# Listar leads
curl -X GET "http://localhost:3000/api/leads?page=1&limit=10" \
  -H "Cookie: next-auth.session-token=..."

# Crear lead
curl -X POST "http://localhost:3000/api/leads" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "nombre": "Juan Pérez",
    "telefono": "+5491123456789",
    "email": "juan@example.com",
    "estado": "NUEVO"
  }'

# Actualizar lead
curl -X PUT "http://localhost:3000/api/leads/clx1234567890" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "estado": "EN_REVISION"
  }'

# Eliminar lead
curl -X DELETE "http://localhost:3000/api/leads/clx1234567890" \
  -H "Cookie: next-auth.session-token=..."
```

## 📝 Notas

- Todas las fechas están en formato ISO 8601 (UTC)
- Los IDs son CUIDs generados por Prisma
- La paginación tiene un límite máximo de 100 items por página
- Los filtros de búsqueda son case-insensitive
- El ordenamiento por defecto es por `createdAt` descendente

---

**Versión**: 1.0.0  
**Última actualización**: 2024

