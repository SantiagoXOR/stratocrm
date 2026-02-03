# Implementación de la Tarea 1.3 - API Routes para Leads (GET, POST)

**Tarea Linear:** SOY-7  
**Hito:** 1 - CRM Básico  
**Estado:** Completada

## Resumen

Implementación de los endpoints REST para gestión de leads:
- **GET /api/leads** - Listado paginado con filtros opcionales
- **POST /api/leads** - Creación de nuevos leads

## Archivos modificados/creados

| Archivo | Descripción |
|---------|-------------|
| `src/app/api/leads/route.ts` | Route handler con GET y POST |
| `src/lib/validators.ts` | Añadido `leadsQuerySchema` para validación de query params |

## Implementación

### GET /api/leads

**Funcionalidad:**
- Lista leads con paginación
- Filtros opcionales: `estado`, `origen`
- Ordenamiento por `createdAt` descendente

**Query Parameters:**
| Parámetro | Tipo | Default | Descripción |
|----------|------|---------|-------------|
| page | number | 1 | Número de página |
| limit | number | 10 | Items por página (máx: 100) |
| estado | string | - | NUEVO, EN_REVISION, PREAPROBADO, RECHAZADO, DOC_PENDIENTE, DERIVADO |
| origen | string | - | whatsapp, instagram, facebook, comentario, web, ads |

**Response 200:**
```json
{
  "data": {
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "totalPages": 15
    }
  }
}
```

### POST /api/leads

**Funcionalidad:**
- Crea un nuevo lead
- Validación con Zod (`leadSchema`)
- Campos requeridos: `nombre`, `telefono`

**Body (ejemplo):**
```json
{
  "nombre": "Juan Pérez",
  "telefono": "+5491123456789",
  "email": "juan@example.com",
  "estado": "NUEVO",
  "origen": "whatsapp"
}
```

**Response 201:**
```json
{
  "data": {
    "id": "...",
    "nombre": "Juan Pérez",
    "telefono": "+5491123456789",
    ...
  },
  "message": "Lead creado exitosamente"
}
```

## Seguridad y estándares

- **Autenticación:** `withAuth` - todas las rutas requieren sesión válida
- **Rate limiting:** 200 requests/minuto por IP (`rateLimitByIp`)
- **Validación:** Zod para query params y body
- **Manejo de errores:** `handleApiError` para respuestas consistentes (400, 401, 500)
- **Logging:** `logger.info` con contexto (userId, leadId, count)

## Criterios de aceptación cumplidos

- [x] GET /api/leads devuelve lista paginada (data, total, page, limit)
- [x] POST /api/leads crea un lead y devuelve 201 con el lead creado
- [x] Validación Zod aplicada; errores 400 manejados

## Notas

- **Hito 1:** No se usa tenant (modelo Lead sin `tenantId`). El filtro por tenant se añadirá en Hito 2.
- **Compatibilidad:** El formato de respuesta está alineado con `src/types/api.ts` (`PaginatedResponse`) y el cliente `api.getLeads()` en `src/lib/api.ts`.
