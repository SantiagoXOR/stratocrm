---
name: create-service
description: Guía para crear servicios de negocio siguiendo los estándares del proyecto. Usar cuando el usuario quiere crear lógica de negocio en servicios.
---

# Crear Servicio de Negocio

Guía para crear servicios de negocio que encapsulan lógica de negocio y se usan desde API routes.

## 1. Ubicación y Estructura

### Estructura de Directorios

```
src/services/
├── [feature]/
│   ├── [feature].service.ts    # Servicio principal
│   ├── [feature].types.ts       # Tipos específicos del servicio
│   └── __tests__/
│       └── [feature].service.test.ts
└── index.ts                     # Exports centralizados
```

### Ejemplo: Lead Service

```
src/services/
├── leads/
│   ├── lead.service.ts
│   ├── lead.types.ts
│   └── __tests__/
│       └── lead.service.test.ts
```

## 2. Template de Servicio

```typescript
// src/services/leads/lead.service.ts
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import type { LeadInput, Lead } from '@/types/api'
import type { CreateLeadRequest, UpdateLeadRequest } from '@/types/api'

export class LeadService {
  /**
   * Crear un nuevo lead
   */
  async createLead(
    data: CreateLeadRequest,
    tenantId: string,
    userId: string
  ): Promise<Lead> {
    // Validaciones de negocio
    if (data.dni) {
      const existing = await db.lead.findFirst({
        where: {
          dni: data.dni,
          tenantId, // CRÍTICO: Filtrar por tenant
        },
      })

      if (existing) {
        throw new Error('Conflict: Ya existe un lead con este DNI')
      }
    }

    // Crear lead
    const lead = await db.lead.create({
      data: {
        ...data,
        tenantId, // OBLIGATORIO
        createdBy: userId,
      },
    })

    logger.info('Lead created', {
      leadId: lead.id,
      tenantId,
      userId,
    })

    return lead
  }

  /**
   * Actualizar estado de un lead
   */
  async updateLeadStatus(
    leadId: string,
    newStatus: string,
    tenantId: string
  ): Promise<Lead> {
    // Validar que el lead pertenece al tenant
    const lead = await db.lead.findFirst({
      where: {
        id: leadId,
        tenantId, // CRÍTICO: Filtrar por tenant
      },
    })

    if (!lead) {
      throw new Error('Not found: Lead no encontrado')
    }

    // Validaciones de negocio
    const validTransitions: Record<string, string[]> = {
      NUEVO: ['EN_REVISION', 'RECHAZADO'],
      EN_REVISION: ['PREAPROBADO', 'RECHAZADO', 'DOC_PENDIENTE'],
      // ...
    }

    const allowedStatuses = validTransitions[lead.estado] || []
    if (!allowedStatuses.includes(newStatus)) {
      throw new Error(`Invalid transition: No se puede cambiar de ${lead.estado} a ${newStatus}`)
    }

    // Actualizar
    const updated = await db.lead.update({
      where: { id: leadId },
      data: { estado: newStatus },
    })

    logger.info('Lead status updated', {
      leadId,
      tenantId,
      oldStatus: lead.estado,
      newStatus,
    })

    return updated
  }

  /**
   * Obtener leads con filtros
   */
  async getLeads(
    filters: {
      tenantId: string
      estado?: string
      page?: number
      limit?: number
    }
  ): Promise<{ data: Lead[]; total: number }> {
    const { tenantId, estado, page = 1, limit = 10 } = filters

    const where = {
      tenantId, // OBLIGATORIO
      ...(estado && { estado }),
    }

    const [data, total] = await Promise.all([
      db.lead.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.lead.count({ where }),
    ])

    return { data, total }
  }
}

// Exportar instancia singleton
export const leadService = new LeadService()
```

## 3. Uso en API Routes

```typescript
// src/app/api/leads/route.ts
import { leadService } from '@/services/leads/lead.service'
import { withAuthAndTenant, successResponse, handleApiError, validateRequest } from '@/lib/api-helpers'
import { leadSchema } from '@/lib/validators'

export const POST = withAuthAndTenant(async (request, session, tenant) => {
  try {
    const body = await request.json()
    const validatedData = validateRequest(leadSchema, body)

    // Usar servicio en lugar de lógica directa
    const lead = await leadService.createLead(
      validatedData,
      tenant.id,
      session.user.id
    )

    return successResponse(lead, 201)
  } catch (error) {
    return handleApiError(error, {
      userId: session.user.id,
      tenantId: tenant.id,
    })
  }
})
```

## 4. Reglas Importantes

### ✅ Siempre hacer:

1. **Filtrar por tenantId**: Todas las queries deben incluir `tenantId`
2. **Validaciones de negocio**: Lógica de negocio en servicios, no en API routes
3. **Logging**: Incluir contexto (tenantId, userId) en logs
4. **Tipos explícitos**: Tipos TypeScript para parámetros y retornos
5. **Errores descriptivos**: Lanzar errores con mensajes claros

### ❌ Nunca hacer:

1. **Lógica en API routes**: Mover lógica compleja a servicios
2. **Queries sin tenantId**: Siempre filtrar por tenant
3. **Tipos any**: Usar tipos explícitos
4. **Logging sin contexto**: Incluir siempre tenantId y userId

## 5. Integración con Servicios Externos

```typescript
// src/services/leads/lead.service.ts
import { ManyChatClient } from '../manychat/client'

export class LeadService {
  async createLeadAndNotify(
    data: CreateLeadRequest,
    tenantId: string,
    userId: string
  ): Promise<Lead> {
    // Crear lead
    const lead = await this.createLead(data, tenantId, userId)

    // Obtener configuración del tenant
    const config = await getTenantConfig(tenantId)

    // Notificar vía ManyChat (si está configurado)
    if (config.manychatApiKey) {
      const manychat = new ManyChatClient(config.manychatApiKey)
      try {
        await manychat.sendMessage(lead.telefono, `Hola ${lead.nombre}!`)
      } catch (error) {
        logger.error('Failed to send ManyChat message', error, {
          leadId: lead.id,
          tenantId,
        })
        // No fallar la creación del lead si falla la notificación
      }
    }

    return lead
  }
}
```

## 6. Testing

```typescript
// src/services/leads/__tests__/lead.service.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { LeadService } from '../lead.service'
import { db } from '@/lib/db'

describe('LeadService', () => {
  let service: LeadService

  beforeEach(() => {
    service = new LeadService()
    return db.lead.deleteMany()
  })

  it('should create a lead with valid data', async () => {
    const lead = await service.createLead(
      { nombre: 'Test', telefono: '+5491123456789' },
      'tenant1',
      'user1'
    )

    expect(lead.id).toBeDefined()
    expect(lead.tenantId).toBe('tenant1')
  })

  it('should throw error if DNI already exists', async () => {
    await service.createLead(
      { nombre: 'Test', telefono: '+5491123456789', dni: '12345678' },
      'tenant1',
      'user1'
    )

    await expect(
      service.createLead(
        { nombre: 'Test2', telefono: '+5491123456789', dni: '12345678' },
        'tenant1',
        'user1'
      )
    ).rejects.toThrow('Conflict: Ya existe un lead con este DNI')
  })
})
```

## 7. Checklist

Antes de finalizar el servicio:

- [ ] Todas las queries filtran por `tenantId`
- [ ] Validaciones de negocio implementadas
- [ ] Logging con contexto (tenantId, userId)
- [ ] Tipos TypeScript explícitos
- [ ] Errores descriptivos
- [ ] Tests básicos implementados
- [ ] Documentación de métodos públicos

## 8. Ejemplos Completos

Ver estructura en:
- (Futuro) `src/services/leads/lead.service.ts`
- (Futuro) `src/services/manychat/client.ts`
