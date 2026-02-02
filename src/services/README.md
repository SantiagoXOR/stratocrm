# Servicios de Negocio

Este directorio contiene servicios de negocio que encapsulan lógica de negocio y se usan desde API routes.

## 📋 Estructura

```
src/services/
├── [feature]/
│   ├── [feature].service.ts    # Servicio principal
│   ├── [feature].types.ts       # Tipos específicos del servicio
│   └── __tests__/
│       └── [feature].service.test.ts
├── [external-service]/
│   ├── client.ts                # Cliente del servicio externo
│   ├── types.ts                 # Tipos del servicio externo
│   └── __tests__/
│       └── client.test.ts
└── index.ts                     # Exports centralizados
```

## 🎯 Propósito

Los servicios de negocio:

1. **Encapsulan lógica de negocio**: Reglas de negocio complejas van aquí, no en API routes
2. **Manejan integraciones externas**: Todos los servicios externos (ManyChat, UChat, ElevenLabs) se usan desde servicios
3. **Garantizan multitenancy**: Todos los servicios reciben `tenantId` y filtran apropiadamente
4. **Facilitan testing**: Lógica de negocio aislada es más fácil de testear

## 📝 Ejemplo: Lead Service

```typescript
// src/services/leads/lead.service.ts
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import type { CreateLeadRequest, Lead } from '@/types/api'

export class LeadService {
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
}

export const leadService = new LeadService()
```

## 🔌 Ejemplo: Servicio Externo (ManyChat)

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

## ✅ Reglas Importantes

### 1. Multitenancy

**TODAS las queries deben filtrar por tenantId:**

```typescript
// ✅ CORRECTO
const leads = await db.lead.findMany({
  where: {
    tenantId, // OBLIGATORIO
    estado: 'NUEVO',
  },
})

// ❌ INCORRECTO
const leads = await db.lead.findMany({
  where: { estado: 'NUEVO' } // Falta tenantId
})
```

### 2. Validaciones de Negocio

Las validaciones de negocio van en servicios, no en API routes:

```typescript
// ✅ CORRECTO - Validación en servicio
async updateLeadStatus(leadId: string, newStatus: string, tenantId: string) {
  const lead = await db.lead.findFirst({
    where: { id: leadId, tenantId },
  })

  if (!lead) {
    throw new Error('Not found')
  }

  // Validar transición de estado
  const validTransitions = {
    NUEVO: ['EN_REVISION', 'RECHAZADO'],
    // ...
  }

  if (!validTransitions[lead.estado]?.includes(newStatus)) {
    throw new Error('Invalid transition')
  }

  return db.lead.update({
    where: { id: leadId },
    data: { estado: newStatus },
  })
}
```

### 3. Logging

Incluir siempre contexto relevante:

```typescript
logger.info('Lead created', {
  leadId: lead.id,
  tenantId,
  userId,
})
```

### 4. Tipos TypeScript

Usar tipos explícitos:

```typescript
async createLead(
  data: CreateLeadRequest,
  tenantId: string,
  userId: string
): Promise<Lead> {
  // ...
}
```

## 📚 Uso en API Routes

```typescript
// src/app/api/leads/route.ts
import { leadService } from '@/services/leads/lead.service'
import { withAuthAndTenant, successResponse, handleApiError } from '@/lib/api-helpers'

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

## 🧪 Testing

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
})
```

## 📖 Documentación

Para más información sobre cómo crear servicios:

- [Skill: Crear Servicio](.cursor/skills/create-service/SKILL.md)
- [Mejores Prácticas Backend](../docs/BACKEND_BEST_PRACTICES.md#servicios-de-negocio)

## 🗂️ Servicios Planificados

### Servicios de Negocio

- `leads/` - Gestión de leads
- `conversations/` - Gestión de conversaciones
- `users/` - Gestión de usuarios
- `notifications/` - Sistema de notificaciones

### Servicios Externos

- `manychat/` - Integración con ManyChat
- `uchat/` - Integración con UChat
- `elevenlabs/` - Integración con ElevenLabs
- `whatsapp/` - Integración con WhatsApp Business API

## ✅ Checklist para Nuevos Servicios

Antes de crear un nuevo servicio:

- [ ] ¿Encapsula lógica de negocio compleja?
- [ ] ¿Necesita acceso a servicios externos?
- [ ] ¿Requiere validaciones de negocio?
- [ ] ¿Todas las queries filtran por `tenantId`?
- [ ] ¿Incluye logging con contexto?
- [ ] ¿Tiene tipos TypeScript explícitos?
- [ ] ¿Tiene tests básicos?
