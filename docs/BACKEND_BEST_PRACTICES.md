# Mejores Prácticas Backend

Esta guía documenta los estándares y mejores prácticas para el desarrollo de API routes y lógica de backend en el CRM Inmobiliario.

## 📋 Índice

1. [Estructura de API Routes](#estructura-de-api-routes)
2. [Validación con Zod](#validación-con-zod)
3. [Manejo de Errores](#manejo-de-errores)
4. [Autenticación y Autorización](#autenticación-y-autorización)
5. [Multitenancy](#multitenancy)
6. [Integración con Servicios Externos](#integración-con-servicios-externos)
7. [Logging Estructurado](#logging-estructurado)
8. [Rate Limiting](#rate-limiting)
9. [Servicios de Negocio](#servicios-de-negocio)
10. [Variables de Entorno](#variables-de-entorno)
11. [Testing de API Routes](#testing-de-api-routes)

## Estructura de API Routes

### Ubicación y Nomenclatura

Las API routes deben estar en `src/app/api/` siguiendo la estructura de Next.js App Router:

```
src/app/api/
├── health/
│   └── route.ts          # GET /api/health
├── leads/
│   ├── route.ts          # GET /api/leads, POST /api/leads
│   └── [id]/
│       └── route.ts      # GET /api/leads/:id, PUT /api/leads/:id, DELETE /api/leads/:id
└── auth/
    └── [...nextauth]/
        └── route.ts      # NextAuth handlers
```

### Estructura Estándar de Route Handler

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { withAuth, successResponse, handleApiError, validateRequest } from '@/lib/api-helpers'
import { leadSchema } from '@/lib/validators'
import { logger } from '@/lib/logger'
import { rateLimitByTenant } from '@/lib/rate-limit'

// Aplicar rate limiting
const rateLimit = rateLimitByTenant(200, 60000) // 200 req/min por tenant

export const GET = withAuth(async (request: NextRequest, session) => {
  // Verificar rate limit
  const rateLimitResponse = await rateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    // Lógica del endpoint
    const data = await getLeads(session.user.id)
    
    logger.info('Leads retrieved', {
      userId: session.user.id,
      count: data.length,
    })

    return successResponse(data)
  } catch (error) {
    return handleApiError(error, {
      userId: session.user.id,
    })
  }
})

export const POST = withAuth(async (request: NextRequest, session) => {
  const rateLimitResponse = await rateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    // Validar request body
    const body = await request.json()
    const validatedData = validateRequest(leadSchema, body)

    // Lógica del endpoint
    const newLead = await createLead(validatedData, session.user.id)

    logger.info('Lead created', {
      userId: session.user.id,
      leadId: newLead.id,
    })

    return successResponse(newLead, 201, 'Lead creado exitosamente')
  } catch (error) {
    return handleApiError(error, {
      userId: session.user.id,
    })
  }
})
```

## Validación con Zod

### Schemas Compartidos

Los schemas Zod deben estar en `src/lib/validators.ts` y ser compartidos entre frontend y backend:

```typescript
// src/lib/validators.ts
import { z } from 'zod'

export const leadSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  telefono: z.string().min(1, 'El teléfono es requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  estado: z.enum(['NUEVO', 'EN_REVISION', 'PREAPROBADO', 'RECHAZADO']).default('NUEVO'),
})

// Inferir tipos TypeScript
export type LeadInput = z.infer<typeof leadSchema>
```

### Uso en API Routes

```typescript
import { validateRequest } from '@/lib/api-helpers'
import { leadSchema } from '@/lib/validators'

export const POST = withAuth(async (request: NextRequest, session) => {
  try {
    const body = await request.json()
    const validatedData = validateRequest(leadSchema, body)
    
    // validatedData está tipado como LeadInput
    // ...
  } catch (error) {
    // Los errores de validación son manejados automáticamente
    return handleApiError(error)
  }
})
```

### Validación de Query Parameters

```typescript
import { validateQuery } from '@/lib/api-helpers'
import { z } from 'zod'

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  estado: z.enum(['NUEVO', 'EN_REVISION']).optional(),
})

export const GET = withAuth(async (request: NextRequest, session) => {
  try {
    const params = validateQuery(querySchema, request)
    // params está tipado correctamente
    // ...
  } catch (error) {
    return handleApiError(error)
  }
})
```

## Manejo de Errores

### Uso de Helpers

Siempre usar `handleApiError()` para respuestas de error consistentes:

```typescript
import { handleApiError, successResponse } from '@/lib/api-helpers'

export const GET = withAuth(async (request: NextRequest, session) => {
  try {
    const data = await someOperation()
    return successResponse(data)
  } catch (error) {
    return handleApiError(error, {
      userId: session.user.id,
      tenantId: session.user.tenantId, // cuando se implemente
    })
  }
})
```

### Tipos de Error

El helper maneja automáticamente:

- **400 (VALIDATION_ERROR)**: Errores de validación Zod
- **401 (UNAUTHORIZED)**: Errores de autenticación
- **403 (FORBIDDEN)**: Errores de autorización
- **404 (NOT_FOUND)**: Recurso no encontrado
- **500 (INTERNAL_SERVER_ERROR)**: Errores del servidor

### Lanzar Errores Específicos

```typescript
// Para errores de negocio
throw new Error('Not found: Lead no existe')

// Para errores de autorización
throw new Error('Forbidden: No tienes permisos para esta acción')
```

## Autenticación y Autorización

### Wrappers de Autenticación

Usar los wrappers proporcionados:

```typescript
import { withAuth, withAuthAndTenant } from '@/lib/api-helpers'

// Solo requiere autenticación
export const GET = withAuth(async (request, session) => {
  // session.user está disponible
  // ...
})

// Requiere autenticación y tenant
export const GET = withAuthAndTenant(async (request, session, tenant) => {
  // session.user y tenant están disponibles
  // ...
})
```

### Verificación Manual

Si necesitas verificar autenticación manualmente:

```typescript
import { requireAuth } from '@/lib/api-helpers'

export const GET = async (request: NextRequest) => {
  try {
    const session = await requireAuth(request)
    // Usar session...
  } catch (error) {
    return handleApiError(error)
  }
}
```

## Multitenancy

### Aislamiento de Datos

**IMPORTANTE**: Todas las queries a modelos con `tenantId` deben incluir filtro por tenant:

```typescript
// ❌ INCORRECTO - Sin filtro de tenant
const leads = await db.lead.findMany({
  where: { estado: 'NUEVO' }
})

// ✅ CORRECTO - Con filtro de tenant
const leads = await db.lead.findMany({
  where: {
    tenantId: tenant.id,
    estado: 'NUEVO'
  }
})
```

### Uso de requireTenant

```typescript
import { withAuthAndTenant } from '@/lib/api-helpers'

export const GET = withAuthAndTenant(async (request, session, tenant) => {
  // tenant.id está disponible
  const leads = await db.lead.findMany({
    where: { tenantId: tenant.id }
  })
  
  return successResponse(leads)
})
```

### Validación de tenantId en Mutations

```typescript
export const PUT = withAuthAndTenant(async (request, session, tenant) => {
  const { id } = getRouteParams<{ id: string }>({ params: { id: '...' } })
  const body = await request.json()
  
  // Validar que el lead pertenece al tenant
  const lead = await db.lead.findFirst({
    where: {
      id,
      tenantId: tenant.id, // CRÍTICO: Filtrar por tenant
    }
  })
  
  if (!lead) {
    throw new Error('Not found: Lead no encontrado o no pertenece a tu tenant')
  }
  
  // Actualizar...
})
```

## Integración con Servicios Externos

### Regla Fundamental

**TODAS las integraciones con servicios externos (ManyChat, UChat, ElevenLabs, WhatsApp) deben estar en el backend, NUNCA en el frontend.**

### Estructura de Servicios

Crear servicios en `src/services/`:

```
src/services/
├── manychat/
│   ├── client.ts          # Cliente ManyChat
│   └── types.ts           # Tipos específicos
├── whatsapp/
│   ├── client.ts          # Cliente WhatsApp
│   └── webhook.ts         # Handlers de webhooks
└── index.ts               # Exports centralizados
```

### Ejemplo de Servicio

```typescript
// src/services/manychat/client.ts
import { logger } from '@/lib/logger'

export class ManyChatClient {
  private apiKey: string
  private baseUrl = 'https://api.manychat.com'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async sendMessage(userId: string, message: string) {
    try {
      const response = await fetch(`${this.baseUrl}/v1/sending/sendContent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriber_id: userId,
          data: { message },
        }),
      })

      if (!response.ok) {
        throw new Error(`ManyChat API error: ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      logger.error('ManyChat sendMessage failed', error, {
        userId,
      })
      throw error
    }
  }
}
```

### Uso en API Routes

```typescript
// src/app/api/leads/[id]/send-message/route.ts
import { withAuthAndTenant } from '@/lib/api-helpers'
import { ManyChatClient } from '@/services/manychat/client'

export const POST = withAuthAndTenant(async (request, session, tenant) => {
  // Obtener configuración del tenant
  const config = await getTenantConfig(tenant.id)
  
  // Crear cliente con API key del tenant
  const manychat = new ManyChatClient(config.manychatApiKey)
  
  // Enviar mensaje
  await manychat.sendMessage(leadId, message)
  
  return successResponse({ sent: true })
})
```

## Logging Estructurado

### Uso del Logger

```typescript
import { logger } from '@/lib/logger'

// Logging básico
logger.info('Lead created', { leadId: lead.id })
logger.warn('Rate limit approaching', { count: 95, limit: 100 })
logger.error('Database connection failed', error, { tenantId })

// Logger con contexto predefinido
const requestLogger = logger.withContext({
  userId: session.user.id,
  tenantId: tenant.id,
  requestId: crypto.randomUUID(),
})

requestLogger.info('Processing request')
requestLogger.error('Operation failed', error)
```

### Niveles de Log

- **debug**: Información detallada (solo desarrollo)
- **info**: Eventos normales de la aplicación
- **warn**: Situaciones anómalas que no son errores
- **error**: Errores que requieren atención

### Contexto Recomendado

Incluir siempre contexto relevante:

```typescript
logger.info('Lead updated', {
  leadId: lead.id,
  userId: session.user.id,
  tenantId: tenant.id,
  changes: { estado: 'NUEVO -> EN_REVISION' },
})
```

## Rate Limiting

### Aplicar Rate Limiting

```typescript
import { rateLimitByIp, rateLimitByTenant } from '@/lib/rate-limit'

// Para endpoints públicos (por IP)
const rateLimit = rateLimitByIp(100, 60000) // 100 req/min

// Para endpoints autenticados (por tenant)
const rateLimit = rateLimitByTenant(200, 60000) // 200 req/min

export const GET = async (request: NextRequest) => {
  // Verificar rate limit
  const rateLimitResponse = await rateLimit(request)
  if (rateLimitResponse) {
    return rateLimitResponse // Retorna 429 si excede
  }

  // Continuar con la lógica...
}
```

### Headers de Rate Limit

El middleware agrega automáticamente:

- `X-RateLimit-Limit`: Límite máximo
- `X-RateLimit-Remaining`: Requests restantes
- `X-RateLimit-Reset`: Timestamp de reset
- `Retry-After`: Segundos hasta poder hacer otro request

## Servicios de Negocio

### Separación de Responsabilidades

La lógica de negocio debe estar en servicios, no en API routes:

```
src/services/
├── leads/
│   ├── lead.service.ts    # Lógica de negocio de leads
│   └── lead.types.ts     # Tipos específicos
└── notifications/
    └── notification.service.ts
```

### Ejemplo de Servicio

```typescript
// src/services/leads/lead.service.ts
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import type { LeadInput } from '@/lib/validators'

export class LeadService {
  async createLead(data: LeadInput, tenantId: string, userId: string) {
    // Validaciones de negocio
    if (data.dni) {
      const existing = await db.lead.findFirst({
        where: {
          dni: data.dni,
          tenantId, // CRÍTICO: Filtrar por tenant
        }
      })
      
      if (existing) {
        throw new Error('Conflict: Ya existe un lead con este DNI')
      }
    }

    // Crear lead
    const lead = await db.lead.create({
      data: {
        ...data,
        tenantId, // CRÍTICO: Incluir tenantId
        createdBy: userId,
      }
    })

    logger.info('Lead created', {
      leadId: lead.id,
      tenantId,
      userId,
    })

    return lead
  }

  async updateLeadStatus(
    leadId: string,
    newStatus: string,
    tenantId: string
  ) {
    // Validar que el lead pertenece al tenant
    const lead = await db.lead.findFirst({
      where: {
        id: leadId,
        tenantId, // CRÍTICO: Filtrar por tenant
      }
    })

    if (!lead) {
      throw new Error('Not found: Lead no encontrado')
    }

    // Lógica de actualización...
    return db.lead.update({
      where: { id: leadId },
      data: { estado: newStatus },
    })
  }
}
```

### Uso en API Routes

```typescript
import { LeadService } from '@/services/leads/lead.service'

const leadService = new LeadService()

export const POST = withAuthAndTenant(async (request, session, tenant) => {
  const body = await request.json()
  const validatedData = validateRequest(leadSchema, body)
  
  const lead = await leadService.createLead(
    validatedData,
    tenant.id,
    session.user.id
  )
  
  return successResponse(lead, 201)
})
```

## Variables de Entorno

### Configuración

Usar variables de entorno para configuración sensible:

```typescript
// .env.local
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
MANYCHAT_API_KEY=...
```

### Acceso en Código

```typescript
// Validar que las variables requeridas existen
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
]

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}

// Usar con validación
const apiKey = process.env['MANYCHAT_API_KEY']
if (!apiKey) {
  throw new Error('MANYCHAT_API_KEY is required')
}
```

## Testing de API Routes

### Estructura de Tests

```typescript
// src/app/api/leads/__tests__/route.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { GET, POST } from '../route'
import { db } from '@/lib/db'

describe('/api/leads', () => {
  beforeEach(async () => {
    // Limpiar base de datos de test
    await db.lead.deleteMany()
  })

  it('should return 401 without authentication', async () => {
    const request = new Request('http://localhost/api/leads')
    const response = await GET(request)
    expect(response.status).toBe(401)
  })

  it('should create a lead with valid data', async () => {
    // Mock de autenticación
    // ...
    const request = new Request('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify({
        nombre: 'Juan Pérez',
        telefono: '+5491123456789',
      }),
    })
    
    const response = await POST(request)
    expect(response.status).toBe(201)
    
    const data = await response.json()
    expect(data.data.nombre).toBe('Juan Pérez')
  })
})
```

### Testing de Multitenancy

```typescript
it('should not return leads from other tenants', async () => {
  // Crear leads para diferentes tenants
  const tenant1Lead = await createLead({ tenantId: 'tenant1' })
  const tenant2Lead = await createLead({ tenantId: 'tenant2' })

  // Request como tenant1
  const request = new Request('http://localhost/api/leads', {
    headers: { 'x-tenant-id': 'tenant1' },
  })
  
  const response = await GET(request)
  const data = await response.json()
  
  // Solo debe retornar leads de tenant1
  expect(data.data).toHaveLength(1)
  expect(data.data[0].id).toBe(tenant1Lead.id)
  expect(data.data[0].id).not.toBe(tenant2Lead.id)
})
```

## Checklist de Revisión

Antes de hacer commit de una API route, verificar:

- [ ] Usa `withAuth` o `withAuthAndTenant` para protección
- [ ] Valida input con Zod usando `validateRequest` o `validateQuery`
- [ ] Usa `handleApiError` para manejo de errores
- [ ] Incluye logging apropiado con contexto
- [ ] Aplica rate limiting cuando sea necesario
- [ ] Filtra por `tenantId` en todas las queries (cuando aplique)
- [ ] Usa servicios de negocio para lógica compleja
- [ ] Retorna respuestas con `successResponse`
- [ ] Incluye tests básicos

## Ejemplos Completos

Ver ejemplos completos en:
- `src/app/api/health/route.ts` - Endpoint simple
- (Futuro) `src/app/api/leads/route.ts` - CRUD completo con multitenancy
