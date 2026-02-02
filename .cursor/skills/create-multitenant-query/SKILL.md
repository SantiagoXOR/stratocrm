---
name: create-multitenant-query
description: Guía para crear queries con aislamiento de tenant. Usar cuando el usuario necesita hacer queries a la base de datos con multitenancy.
---

# Crear Query Multitenant

Guía para crear queries a la base de datos que respetan el aislamiento de tenant.

## Regla Crítica

**TODAS las queries a modelos con `tenantId` deben incluir filtro por tenant para garantizar aislamiento de datos.**

## 1. Patrón Básico: FindMany

```typescript
// ✅ CORRECTO
const leads = await db.lead.findMany({
  where: {
    tenantId: tenant.id, // OBLIGATORIO
    estado: 'NUEVO',
  },
})

// ❌ INCORRECTO - Sin filtro de tenant
const leads = await db.lead.findMany({
  where: { estado: 'NUEVO' } // FALTA tenantId
})
```

## 2. Patrón: FindUnique/FindFirst

```typescript
// ✅ CORRECTO - Usar findFirst con tenantId
const lead = await db.lead.findFirst({
  where: {
    id: leadId,
    tenantId: tenant.id, // OBLIGATORIO
  },
})

if (!lead) {
  throw new Error('Not found: Lead no encontrado o no pertenece a tu tenant')
}

// ❌ INCORRECTO - findUnique no permite múltiples campos en where
const lead = await db.lead.findUnique({
  where: { id: leadId } // FALTA verificación de tenantId
})
```

## 3. Patrón: Create

```typescript
// ✅ CORRECTO - Incluir tenantId al crear
const lead = await db.lead.create({
  data: {
    nombre: 'Juan Pérez',
    telefono: '+5491123456789',
    tenantId: tenant.id, // OBLIGATORIO
    createdBy: userId,
  },
})
```

## 4. Patrón: Update

```typescript
// ✅ CORRECTO - Verificar tenantId antes de actualizar
const existing = await db.lead.findFirst({
  where: {
    id: leadId,
    tenantId: tenant.id, // Verificar primero
  },
})

if (!existing) {
  throw new Error('Not found: Lead no encontrado')
}

const updated = await db.lead.update({
  where: { id: leadId },
  data: { estado: 'NUEVO' },
})
```

## 5. Patrón: Delete

```typescript
// ✅ CORRECTO - Verificar tenantId antes de eliminar
const existing = await db.lead.findFirst({
  where: {
    id: leadId,
    tenantId: tenant.id, // Verificar primero
  },
})

if (!existing) {
  throw new Error('Not found: Lead no encontrado')
}

await db.lead.delete({
  where: { id: leadId },
})
```

## 6. Patrón: Count

```typescript
// ✅ CORRECTO - Count con filtro de tenant
const count = await db.lead.count({
  where: {
    tenantId: tenant.id, // OBLIGATORIO
    estado: 'NUEVO',
  },
})
```

## 7. Patrón: Queries con Relaciones

```typescript
// ✅ CORRECTO - Include con filtro de tenant
const lead = await db.lead.findFirst({
  where: {
    id: leadId,
    tenantId: tenant.id,
  },
  include: {
    conversations: {
      where: {
        tenantId: tenant.id, // Filtro también en relación
      },
    },
  },
})
```

## 8. Patrón: Queries con Agregaciones

```typescript
// ✅ CORRECTO - Agregación con filtro de tenant
const stats = await db.lead.groupBy({
  by: ['estado'],
  where: {
    tenantId: tenant.id, // OBLIGATORIO
  },
  _count: {
    id: true,
  },
})
```

## 9. Patrón: Transacciones

```typescript
// ✅ CORRECTO - Transacción con filtros de tenant
await db.$transaction(async (tx) => {
  const lead = await tx.lead.findFirst({
    where: {
      id: leadId,
      tenantId: tenant.id, // Verificar tenant
    },
  })

  if (!lead) {
    throw new Error('Not found')
  }

  await tx.lead.update({
    where: { id: leadId },
    data: { estado: 'NUEVO' },
  })

  await tx.event.create({
    data: {
      leadId: lead.id,
      tipo: 'STATUS_CHANGED',
      tenantId: tenant.id, // Incluir en creación
    },
  })
})
```

## 10. Uso en Servicios

```typescript
// src/services/leads/lead.service.ts
export class LeadService {
  async getLead(leadId: string, tenantId: string): Promise<Lead> {
    // ✅ CORRECTO - Filtro de tenant en servicio
    const lead = await db.lead.findFirst({
      where: {
        id: leadId,
        tenantId, // OBLIGATORIO
      },
    })

    if (!lead) {
      throw new Error('Not found: Lead no encontrado')
    }

    return lead
  }
}
```

## 11. Uso en API Routes

```typescript
// src/app/api/leads/[id]/route.ts
export const GET = withAuthAndTenant(async (request, session, tenant) => {
  // tenant.id está disponible automáticamente
  const { id } = getRouteParams<{ id: string }>(context)

  // ✅ CORRECTO - Query con tenantId
  const lead = await db.lead.findFirst({
    where: {
      id,
      tenantId: tenant.id, // OBLIGATORIO
    },
  })

  if (!lead) {
    throw new Error('Not found: Lead no encontrado')
  }

  return successResponse(lead)
})
```

## 12. Errores Comunes

### Error 1: Olvidar tenantId en where

```typescript
// ❌ INCORRECTO
const leads = await db.lead.findMany({
  where: { estado: 'NUEVO' } // Falta tenantId
})

// ✅ CORRECTO
const leads = await db.lead.findMany({
  where: {
    tenantId: tenant.id,
    estado: 'NUEVO',
  },
})
```

### Error 2: Asumir que el recurso pertenece al tenant

```typescript
// ❌ INCORRECTO
const lead = await db.lead.findUnique({ where: { id } })
await db.lead.update({ where: { id }, data: { ... } })
// No verifica tenant

// ✅ CORRECTO
const lead = await db.lead.findFirst({
  where: { id, tenantId: tenant.id }
})
if (!lead) throw new Error('Not found')
await db.lead.update({ where: { id }, data: { ... } })
```

### Error 3: No incluir tenantId en create

```typescript
// ❌ INCORRECTO
const lead = await db.lead.create({
  data: { nombre: 'Test', telefono: '...' } // Falta tenantId
})

// ✅ CORRECTO
const lead = await db.lead.create({
  data: {
    nombre: 'Test',
    telefono: '...',
    tenantId: tenant.id, // OBLIGATORIO
  },
})
```

## 13. Checklist

Antes de hacer commit de una query:

- [ ] ¿La query incluye `tenantId: tenant.id` en el where clause?
- [ ] ¿Las mutations verifican que el recurso pertenece al tenant?
- [ ] ¿Las creaciones incluyen `tenantId`?
- [ ] ¿Las relaciones también filtran por tenant cuando aplica?
- [ ] ¿Los tests verifican aislamiento de tenant?

## 14. Modelos que Requieren tenantId

Cuando se implementen, estos modelos requieren filtro por tenantId:
- `Lead`
- `Conversation`
- `Message`
- Cualquier modelo con campo `tenantId`

## 15. Ejemplos Completos

Ver ejemplos en:
- `src/services/leads/lead.service.ts` (cuando se cree)
- `src/app/api/leads/route.ts` (cuando se cree)
