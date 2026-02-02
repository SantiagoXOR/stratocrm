# Guía de Migración

Esta guía documenta cómo migrar código existente a los nuevos patrones y estándares establecidos en el proyecto.

## 📋 Índice

1. [Migración de API Routes](#migración-de-api-routes)
2. [Migración de Componentes Frontend](#migración-de-componentes-frontend)
3. [Migración de Queries a Multitenancy](#migración-de-queries-a-multitenancy)
4. [Migración de Tipos TypeScript](#migración-de-tipos-typescript)
5. [Migración de Servicios Externos](#migración-de-servicios-externos)
6. [Estrategia de Migración Gradual](#estrategia-de-migración-gradual)

## Migración de API Routes

### Antes (Código Antiguo)

```typescript
// src/app/api/leads/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const leads = await db.lead.findMany({
      where: { estado: 'NUEVO' }
    })

    return NextResponse.json({ leads })
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

### Después (Código Migrado)

```typescript
// src/app/api/leads/route.ts
import { NextRequest } from 'next/server'
import { 
  withAuthAndTenant,
  successResponse, 
  handleApiError,
  validateQuery 
} from '@/lib/api-helpers'
import { logger } from '@/lib/logger'
import { rateLimitByTenant } from '@/lib/rate-limit'
import { db } from '@/lib/db'
import { z } from 'zod'

const rateLimit = rateLimitByTenant(200, 60000)

export const GET = withAuthAndTenant(async (request: NextRequest, session, tenant) => {
  const rateLimitResponse = await rateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const querySchema = z.object({
      estado: z.enum(['NUEVO', 'EN_REVISION']).optional(),
    })
    const params = validateQuery(querySchema, request)

    // CRÍTICO: Agregar filtro de tenant
    const leads = await db.lead.findMany({
      where: {
        tenantId: tenant.id, // NUEVO
        ...(params.estado && { estado: params.estado }),
      },
    })

    logger.info('Leads retrieved', {
      userId: session.user.id,
      tenantId: tenant.id,
      count: leads.length,
    })

    return successResponse(leads)
  } catch (error) {
    return handleApiError(error, {
      userId: session.user.id,
      tenantId: tenant.id,
    })
  }
})
```

### Cambios Principales

1. ✅ Usar `withAuthAndTenant` en lugar de verificación manual
2. ✅ Agregar `tenantId: tenant.id` en todas las queries
3. ✅ Usar `validateQuery` para query parameters
4. ✅ Usar `successResponse` para respuestas exitosas
5. ✅ Usar `handleApiError` para manejo de errores
6. ✅ Agregar logging con contexto
7. ✅ Agregar rate limiting

## Migración de Componentes Frontend

### Antes (Código Antiguo)

```typescript
// src/components/leads/LeadList.tsx
'use client'

import { useState, useEffect } from 'react'
import { ManyChatClient } from '@manychat/sdk'

export function LeadList() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLeads() {
      try {
        const response = await fetch('/api/leads')
        const data = await response.json()
        setLeads(data.leads)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchLeads()
  }, [])

  const handleSendMessage = async (leadId: string) => {
    const client = new ManyChatClient(process.env.NEXT_PUBLIC_MANYCHAT_API_KEY!)
    await client.sendMessage(leadId, 'Hello')
  }

  if (loading) return <div>Loading...</div>

  return (
    <ul>
      {leads.map((lead) => (
        <li key={lead.id}>
          {lead.nombre}
          <button onClick={() => handleSendMessage(lead.id)}>Send</button>
        </li>
      ))}
    </ul>
  )
}
```

### Después (Código Migrado)

```typescript
// src/components/leads/LeadList.tsx
'use client'

import { useLeads } from '@/hooks/use-api'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export function LeadList() {
  const { data, isLoading, error } = useLeads({ page: 1, limit: 10 })

  const handleSendMessage = async (leadId: string) => {
    try {
      // ✅ Usar cliente API interno en lugar de SDK externo
      await api.sendMessage({ leadId, message: 'Hello' })
      toast.success('Mensaje enviado')
    } catch (error) {
      toast.error('Error al enviar mensaje')
    }
  }

  if (isLoading) return <div>Cargando leads...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <ul>
      {data?.data.map((lead) => (
        <li key={lead.id}>
          {lead.nombre}
          <button onClick={() => handleSendMessage(lead.id)}>Enviar</button>
        </li>
      ))}
    </ul>
  )
}
```

### Cambios Principales

1. ✅ Eliminar imports de SDKs externos (ManyChat, UChat, etc.)
2. ✅ Usar `useLeads` hook de React Query en lugar de `useState` + `useEffect`
3. ✅ Usar `api` de `@/lib/api` para todas las operaciones
4. ✅ Usar `toast` para notificaciones
5. ✅ Manejar estados de carga y error apropiadamente

## Migración de Queries a Multitenancy

### Antes (Sin Multitenancy)

```typescript
// ❌ ANTES - Sin filtro de tenant
export async function getLeads() {
  return db.lead.findMany({
    where: { estado: 'NUEVO' }
  })
}

export async function getLead(id: string) {
  return db.lead.findUnique({
    where: { id }
  })
}

export async function updateLead(id: string, data: UpdateLeadRequest) {
  return db.lead.update({
    where: { id },
    data
  })
}
```

### Después (Con Multitenancy)

```typescript
// ✅ DESPUÉS - Con filtro de tenant
export async function getLeads(tenantId: string) {
  return db.lead.findMany({
    where: {
      tenantId, // OBLIGATORIO
      estado: 'NUEVO'
    }
  })
}

export async function getLead(id: string, tenantId: string) {
  const lead = await db.lead.findFirst({
    where: {
      id,
      tenantId, // OBLIGATORIO
    }
  })

  if (!lead) {
    throw new Error('Not found: Lead no encontrado')
  }

  return lead
}

export async function updateLead(
  id: string, 
  data: UpdateLeadRequest,
  tenantId: string
) {
  // Verificar que pertenece al tenant
  const existing = await db.lead.findFirst({
    where: {
      id,
      tenantId, // OBLIGATORIO
    }
  })

  if (!existing) {
    throw new Error('Not found: Lead no encontrado')
  }

  return db.lead.update({
    where: { id },
    data
  })
}
```

### Checklist de Migración

Para cada función que hace queries:

- [ ] Agregar parámetro `tenantId` a la función
- [ ] Agregar `tenantId: tenantId` en el `where` clause
- [ ] Cambiar `findUnique` a `findFirst` si se necesita filtrar por tenant
- [ ] Agregar verificación de existencia antes de update/delete
- [ ] Actualizar llamadas a la función para pasar `tenantId`

## Migración de Tipos TypeScript

### Antes (Tipos Sueltos)

```typescript
// ❌ ANTES - Tipos definidos en múltiples lugares
interface Lead {
  id: string
  nombre: string
  telefono: string
}

// En otro archivo
type LeadData = {
  id: string
  nombre: string
  telefono: string
}
```

### Después (Tipos Compartidos)

```typescript
// ✅ DESPUÉS - Usar tipos de src/types/api.ts
import type { Lead, CreateLeadRequest, UpdateLeadRequest } from '@/types/api'

// Los tipos están centralizados y compartidos entre frontend y backend
```

### Pasos de Migración

1. Identificar tipos duplicados o definidos en múltiples lugares
2. Mover tipos a `src/types/api.ts`
3. Actualizar imports en todos los archivos
4. Eliminar definiciones duplicadas

## Migración de Servicios Externos

### Antes (Frontend con SDKs Externos)

```typescript
// ❌ ANTES - Frontend usando SDK externo
'use client'

import { ManyChatClient } from '@manychat/sdk'

export function SendMessageButton({ leadId }: { leadId: string }) {
  const handleSend = async () => {
    const client = new ManyChatClient(process.env.NEXT_PUBLIC_MANYCHAT_API_KEY!)
    await client.sendMessage(leadId, 'Hello')
  }

  return <button onClick={handleSend}>Enviar</button>
}
```

### Paso 1: Crear Endpoint en Backend

```typescript
// ✅ Crear endpoint en backend
// src/app/api/leads/[id]/send-message/route.ts
import { withAuthAndTenant, successResponse, handleApiError } from '@/lib/api-helpers'
import { ManyChatClient } from '@/services/manychat/client'
import { getTenantConfig } from '@/services/tenant-config'

export const POST = withAuthAndTenant(async (request, session, tenant) => {
  try {
    const { id } = getRouteParams<{ id: string }>(context)
    const body = await request.json()
    const { message } = body

    // Obtener configuración del tenant
    const config = await getTenantConfig(tenant.id)
    const manychat = new ManyChatClient(config.manychatApiKey)

    await manychat.sendMessage(id, message)

    return successResponse({ sent: true })
  } catch (error) {
    return handleApiError(error, {
      userId: session.user.id,
      tenantId: tenant.id,
    })
  }
})
```

### Paso 2: Agregar Método al Cliente API

```typescript
// ✅ Agregar a src/lib/api.ts
class ApiClient {
  async sendMessage(leadId: string, message: string): Promise<{ sent: boolean }> {
    return this.request<{ sent: boolean }>(`/leads/${leadId}/send-message`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    })
  }
}
```

### Paso 3: Actualizar Componente Frontend

```typescript
// ✅ DESPUÉS - Frontend usando cliente API interno
'use client'

import { api } from '@/lib/api'
import { toast } from 'sonner'

export function SendMessageButton({ leadId }: { leadId: string }) {
  const handleSend = async () => {
    try {
      await api.sendMessage(leadId, 'Hello')
      toast.success('Mensaje enviado')
    } catch (error) {
      toast.error('Error al enviar mensaje')
    }
  }

  return <button onClick={handleSend}>Enviar</button>
}
```

## Estrategia de Migración Gradual

### Fase 1: Preparación

1. ✅ Leer documentación de mejores prácticas
2. ✅ Revisar código existente
3. ✅ Identificar endpoints y componentes a migrar
4. ✅ Crear plan de migración por prioridad

### Fase 2: Migración de Backend

**Prioridad Alta:**
1. Migrar API routes críticas (leads, usuarios)
2. Agregar filtros de tenant a todas las queries
3. Implementar validación con Zod
4. Agregar logging estructurado

**Prioridad Media:**
1. Migrar endpoints secundarios
2. Implementar rate limiting
3. Mover lógica a servicios de negocio

### Fase 3: Migración de Frontend

**Prioridad Alta:**
1. Eliminar referencias a SDKs externos
2. Migrar a usar `api` de `@/lib/api`
3. Migrar a hooks de React Query
4. Implementar manejo de errores apropiado

**Prioridad Media:**
1. Separar componentes presentacionales y contenedores
2. Optimizar uso de Server Components
3. Mejorar estado global

### Fase 4: Testing y Validación

1. Ejecutar tests existentes
2. Agregar tests de aislamiento de tenant
3. Verificar que no hay regresiones
4. Validar que todas las funcionalidades siguen trabajando

## Checklist de Migración por Archivo

### Para API Routes

- [ ] Usa `withAuth` o `withAuthAndTenant`
- [ ] Valida input con Zod
- [ ] Usa `handleApiError` para errores
- [ ] Usa `successResponse` para respuestas
- [ ] Incluye logging con contexto
- [ ] Filtra por `tenantId` en queries
- [ ] Aplica rate limiting si es necesario

### Para Componentes Frontend

- [ ] No hay imports de SDKs externos
- [ ] Usa `api` de `@/lib/api` para todas las operaciones
- [ ] Usa hooks de React Query para data fetching
- [ ] Maneja estados de carga y error
- [ ] Usa tipos de `@/types/api`
- [ ] Es Server Component o Client Component apropiado

### Para Servicios

- [ ] Todas las queries filtran por `tenantId`
- [ ] Validaciones de negocio implementadas
- [ ] Logging con contexto
- [ ] Tipos TypeScript explícitos
- [ ] Tests básicos

## Ejemplos de Migración Completa

### Ejemplo 1: Endpoint de Leads

Ver migración completa en la sección [Migración de API Routes](#migración-de-api-routes)

### Ejemplo 2: Componente de Lista de Leads

Ver migración completa en la sección [Migración de Componentes Frontend](#migración-de-componentes-frontend)

## Troubleshooting

### Problema: "Cannot find module '@/lib/api-helpers'"

**Solución**: Verificar que el archivo existe y que los paths de TypeScript están configurados correctamente en `tsconfig.json`.

### Problema: "tenant is not defined"

**Solución**: Asegurarse de usar `withAuthAndTenant` en lugar de `withAuth` cuando se necesita acceso al tenant.

### Problema: "Query sin tenantId"

**Solución**: Revisar la rule de multitenancy y agregar `tenantId: tenant.id` en todas las queries.

### Problema: "Frontend usando SDK externo"

**Solución**: 
1. Crear endpoint en backend
2. Agregar método al cliente API
3. Actualizar componente frontend para usar `api`

## Recursos

- [Mejores Prácticas Backend](BACKEND_BEST_PRACTICES.md)
- [Mejores Prácticas Frontend](FRONTEND_BEST_PRACTICES.md)
- [Guía de Testing](TESTING.md)
- [Rule: Multitenancy](.cursor/rules/multitenancy.mdc)
- [Rule: Frontend API Abstraction](.cursor/rules/frontend-api-abstraction.mdc)

## Soporte

Si encuentras problemas durante la migración:
1. Revisar la documentación relevante
2. Consultar los ejemplos en esta guía
3. Verificar las rules y skills en `.cursor/`
4. Contactar al equipo de desarrollo
