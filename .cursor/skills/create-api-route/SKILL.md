---
name: create-api-route
description: Guía para crear API routes siguiendo los estándares del proyecto. Usar cuando el usuario quiere crear un nuevo endpoint de API.
---

# Crear API Route

Guía paso a paso para crear API routes siguiendo los estándares del proyecto.

## 1. Estructura de Archivo

### Ubicación

```
src/app/api/
├── [resource]/
│   ├── route.ts              # GET /api/[resource], POST /api/[resource]
│   └── [id]/
│       └── route.ts          # GET /api/[resource]/:id, PUT, DELETE
```

### Ejemplo: Leads API

```
src/app/api/leads/
├── route.ts                  # GET /api/leads, POST /api/leads
└── [id]/
    └── route.ts              # GET /api/leads/:id, PUT, DELETE
```

## 2. Template Estándar

```typescript
// src/app/api/leads/route.ts
import { NextRequest } from 'next/server'
import { 
  withAuth, 
  withAuthAndTenant,
  successResponse, 
  handleApiError, 
  validateRequest,
  validateQuery 
} from '@/lib/api-helpers'
import { leadSchema } from '@/lib/validators'
import { logger } from '@/lib/logger'
import { rateLimitByTenant } from '@/lib/rate-limit'
import { db } from '@/lib/db'

const rateLimit = rateLimitByTenant(200, 60000) // 200 req/min

// GET /api/leads - Listar leads
export const GET = withAuthAndTenant(async (request: NextRequest, session, tenant) => {
  // Verificar rate limit
  const rateLimitResponse = await rateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    // Validar query parameters
    const querySchema = z.object({
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(100).default(10),
      estado: z.enum(['NUEVO', 'EN_REVISION']).optional(),
    })
    const params = validateQuery(querySchema, request)

    // Query con filtro de tenant (CRÍTICO)
    const leads = await db.lead.findMany({
      where: {
        tenantId: tenant.id, // OBLIGATORIO
        ...(params.estado && { estado: params.estado }),
      },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: { createdAt: 'desc' },
    })

    const total = await db.lead.count({
      where: {
        tenantId: tenant.id,
        ...(params.estado && { estado: params.estado }),
      },
    })

    logger.info('Leads retrieved', {
      userId: session.user.id,
      tenantId: tenant.id,
      count: leads.length,
    })

    return successResponse({
      data: leads,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    })
  } catch (error) {
    return handleApiError(error, {
      userId: session.user.id,
      tenantId: tenant.id,
    })
  }
})

// POST /api/leads - Crear lead
export const POST = withAuthAndTenant(async (request: NextRequest, session, tenant) => {
  const rateLimitResponse = await rateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    // Validar request body
    const body = await request.json()
    const validatedData = validateRequest(leadSchema, body)

    // Crear lead con tenantId (CRÍTICO)
    const lead = await db.lead.create({
      data: {
        ...validatedData,
        tenantId: tenant.id, // OBLIGATORIO
        createdBy: session.user.id,
      },
    })

    logger.info('Lead created', {
      leadId: lead.id,
      userId: session.user.id,
      tenantId: tenant.id,
    })

    return successResponse(lead, 201, 'Lead creado exitosamente')
  } catch (error) {
    return handleApiError(error, {
      userId: session.user.id,
      tenantId: tenant.id,
    })
  }
})
```

## 3. Endpoint por ID

```typescript
// src/app/api/leads/[id]/route.ts
import { NextRequest } from 'next/server'
import { 
  withAuthAndTenant,
  successResponse, 
  handleApiError, 
  validateRequest,
  getRouteParams 
} from '@/lib/api-helpers'
import { updateLeadSchema } from '@/lib/validators'
import { logger } from '@/lib/logger'
import { db } from '@/lib/db'

// GET /api/leads/:id - Obtener lead
export const GET = withAuthAndTenant(async (request: NextRequest, session, tenant, context) => {
  try {
    const { id } = getRouteParams<{ id: string }>(context)

    // Verificar que el lead pertenece al tenant (CRÍTICO)
    const lead = await db.lead.findFirst({
      where: {
        id,
        tenantId: tenant.id, // OBLIGATORIO
      },
    })

    if (!lead) {
      throw new Error('Not found: Lead no encontrado o no pertenece a tu tenant')
    }

    return successResponse(lead)
  } catch (error) {
    return handleApiError(error, {
      userId: session.user.id,
      tenantId: tenant.id,
    })
  }
})

// PUT /api/leads/:id - Actualizar lead
export const PUT = withAuthAndTenant(async (request: NextRequest, session, tenant, context) => {
  try {
    const { id } = getRouteParams<{ id: string }>(context)
    const body = await request.json()
    const validatedData = validateRequest(updateLeadSchema, body)

    // Verificar que el lead pertenece al tenant (CRÍTICO)
    const existing = await db.lead.findFirst({
      where: {
        id,
        tenantId: tenant.id, // OBLIGATORIO
      },
    })

    if (!existing) {
      throw new Error('Not found: Lead no encontrado o no pertenece a tu tenant')
    }

    const updated = await db.lead.update({
      where: { id },
      data: validatedData,
    })

    logger.info('Lead updated', {
      leadId: id,
      userId: session.user.id,
      tenantId: tenant.id,
    })

    return successResponse(updated)
  } catch (error) {
    return handleApiError(error, {
      userId: session.user.id,
      tenantId: tenant.id,
    })
  }
})

// DELETE /api/leads/:id - Eliminar lead
export const DELETE = withAuthAndTenant(async (request: NextRequest, session, tenant, context) => {
  try {
    const { id } = getRouteParams<{ id: string }>(context)

    // Verificar que el lead pertenece al tenant (CRÍTICO)
    const existing = await db.lead.findFirst({
      where: {
        id,
        tenantId: tenant.id, // OBLIGATORIO
      },
    })

    if (!existing) {
      throw new Error('Not found: Lead no encontrado o no pertenece a tu tenant')
    }

    await db.lead.delete({
      where: { id },
    })

    logger.info('Lead deleted', {
      leadId: id,
      userId: session.user.id,
      tenantId: tenant.id,
    })

    return successResponse(null, 204)
  } catch (error) {
    return handleApiError(error, {
      userId: session.user.id,
      tenantId: tenant.id,
    })
  }
})
```

## 4. Elementos Obligatorios

### ✅ Siempre incluir:

1. **Wrapper de autenticación**: `withAuth` o `withAuthAndTenant`
2. **Validación**: `validateRequest` o `validateQuery` con Zod
3. **Manejo de errores**: `handleApiError`
4. **Respuestas estandarizadas**: `successResponse`
5. **Logging**: `logger.info/error` con contexto
6. **Filtro de tenant**: `tenantId: tenant.id` en todas las queries
7. **Rate limiting**: Para endpoints que lo requieran

## 5. Reglas Críticas

### Multitenancy

```typescript
// ✅ CORRECTO - Siempre filtrar por tenantId
const leads = await db.lead.findMany({
  where: {
    tenantId: tenant.id, // OBLIGATORIO
    estado: 'NUEVO',
  }
})

// ❌ INCORRECTO - Sin filtro de tenant
const leads = await db.lead.findMany({
  where: { estado: 'NUEVO' } // FALTA tenantId
})
```

### Validación

```typescript
// ✅ CORRECTO - Validar siempre
const validatedData = validateRequest(leadSchema, body)

// ❌ INCORRECTO - Usar body sin validar
const lead = await db.lead.create({ data: body })
```

## 6. Checklist

Antes de finalizar el endpoint:

- [ ] Usa `withAuth` o `withAuthAndTenant`
- [ ] Valida input con Zod
- [ ] Usa `handleApiError` para errores
- [ ] Usa `successResponse` para respuestas exitosas
- [ ] Incluye logging con contexto (userId, tenantId)
- [ ] Aplica rate limiting si es necesario
- [ ] Filtra por `tenantId` en todas las queries
- [ ] Verifica tenantId en mutations (update/delete)
- [ ] Usa códigos de estado HTTP apropiados
- [ ] Retorna formato estándar de respuesta

## 7. Ejemplos Completos

Ver ejemplos en:
- `src/app/api/health/route.ts` - Endpoint simple
- (Futuro) `src/app/api/leads/route.ts` - CRUD completo
