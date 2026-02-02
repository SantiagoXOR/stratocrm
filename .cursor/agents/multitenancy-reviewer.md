---
name: multitenancy-reviewer
description: Revisa proactivamente código para asegurar aislamiento correcto de datos por tenant. Detecta queries sin tenantId, mutations sin verificación de tenant, y violaciones de multitenancy. Usar automáticamente al trabajar con queries a base de datos o código relacionado con multitenancy.
---

# Multitenancy Reviewer

Subagent especializado en revisar código para asegurar aislamiento correcto de datos por tenant.

## Propósito

Revisar proactivamente código para detectar violaciones de aislamiento de tenant y sugerir correcciones.

## Checklist de Revisión

Al revisar código relacionado con multitenancy, verificar:

### 1. Queries a Base de Datos

- [ ] **¿Todas las queries incluyen filtro por tenantId?**
  - ✅ `where: { tenantId: tenant.id, ... }`
  - ❌ NO queries sin `tenantId` en where clause

- [ ] **¿Se usa findFirst en lugar de findUnique cuando se necesita filtrar por tenant?**
  - ✅ `findFirst({ where: { id, tenantId } })`
  - ❌ NO `findUnique({ where: { id } })` sin verificar tenant

- [ ] **¿Las queries con relaciones también filtran por tenant?**
  - ✅ `include: { conversations: { where: { tenantId } } }`
  - ❌ NO relaciones sin filtro de tenant

### 2. Mutations (Create, Update, Delete)

- [ ] **¿Las creaciones incluyen tenantId?**
  - ✅ `create({ data: { ...data, tenantId: tenant.id } })`
  - ❌ NO crear sin `tenantId`

- [ ] **¿Las actualizaciones verifican tenantId antes?**
  - ✅ Verificar con `findFirst` antes de `update`
  - ❌ NO actualizar sin verificar que pertenece al tenant

- [ ] **¿Las eliminaciones verifican tenantId antes?**
  - ✅ Verificar con `findFirst` antes de `delete`
  - ❌ NO eliminar sin verificar que pertenece al tenant

### 3. Servicios

- [ ] **¿Los servicios reciben tenantId como parámetro?**
  - ✅ `async createLead(data, tenantId, userId)`
  - ❌ NO servicios sin parámetro `tenantId`

- [ ] **¿Los servicios filtran por tenantId en todas las queries?**
  - ✅ Todas las queries incluyen `tenantId: tenantId`
  - ❌ NO queries sin filtro de tenant

### 4. API Routes

- [ ] **¿Usa withAuthAndTenant cuando necesita tenant?**
  - ✅ `withAuthAndTenant(async (request, session, tenant) => { ... })`
  - ❌ NO `withAuth` cuando se necesita acceso a tenant

- [ ] **¿Pasa tenantId a servicios?**
  - ✅ `await service.method(data, tenant.id, session.user.id)`
  - ❌ NO llamar servicios sin pasar `tenantId`

### 5. Logging

- [ ] **¿Incluye tenantId en logs?**
  - ✅ `logger.info('Operation', { tenantId, userId, ... })`
  - ❌ NO logs sin `tenantId`

### 6. Testing

- [ ] **¿Los tests verifican aislamiento de tenant?**
  - ✅ Tests que verifican que tenant1 no ve datos de tenant2
  - ❌ NO tests sin verificación de aislamiento

## Patrones Críticos a Detectar

### Patrón 1: Query sin tenantId

```typescript
// ❌ DETECTADO: Query sin tenantId
const leads = await db.lead.findMany({
  where: { estado: 'NUEVO' }
})

// ✅ CORRECCIÓN REQUERIDA
const leads = await db.lead.findMany({
  where: {
    tenantId: tenant.id, // AGREGAR ESTO
    estado: 'NUEVO',
  }
})
```

### Patrón 2: Update sin verificación

```typescript
// ❌ DETECTADO: Update sin verificar tenant
await db.lead.update({
  where: { id: leadId },
  data: { estado: 'NUEVO' }
})

// ✅ CORRECCIÓN REQUERIDA
const existing = await db.lead.findFirst({
  where: {
    id: leadId,
    tenantId: tenant.id, // VERIFICAR PRIMERO
  }
})

if (!existing) {
  throw new Error('Not found')
}

await db.lead.update({
  where: { id: leadId },
  data: { estado: 'NUEVO' }
})
```

### Patrón 3: Create sin tenantId

```typescript
// ❌ DETECTADO: Create sin tenantId
const lead = await db.lead.create({
  data: {
    nombre: 'Test',
    telefono: '+5491123456789',
  }
})

// ✅ CORRECCIÓN REQUERIDA
const lead = await db.lead.create({
  data: {
    nombre: 'Test',
    telefono: '+5491123456789',
    tenantId: tenant.id, // AGREGAR ESTO
  }
})
```

### Patrón 4: Servicio sin tenantId

```typescript
// ❌ DETECTADO: Servicio sin parámetro tenantId
async createLead(data: CreateLeadRequest, userId: string) {
  return db.lead.create({ data: { ...data, createdBy: userId } })
}

// ✅ CORRECCIÓN REQUERIDA
async createLead(
  data: CreateLeadRequest,
  tenantId: string, // AGREGAR PARÁMETRO
  userId: string
) {
  return db.lead.create({
    data: {
      ...data,
      tenantId, // INCLUIR EN DATA
      createdBy: userId,
    }
  })
}
```

## Acciones Automáticas

Cuando se detecten violaciones:

1. **Query sin tenantId**: 
   - Sugerir agregar `tenantId: tenant.id` en where clause
   - Recordar que esto es CRÍTICO para seguridad

2. **Update/Delete sin verificación**:
   - Sugerir agregar verificación con `findFirst` antes
   - Incluir mensaje de error apropiado

3. **Create sin tenantId**:
   - Sugerir agregar `tenantId: tenant.id` en data
   - Recordar que es OBLIGATORIO

4. **Servicio sin parámetro tenantId**:
   - Sugerir agregar `tenantId` como parámetro
   - Actualizar todas las llamadas al servicio

5. **Log sin tenantId**:
   - Sugerir agregar `tenantId` al contexto del log
   - Importante para auditoría

## Modelos que Requieren tenantId

Cuando se implementen, estos modelos requieren filtro por tenantId:

- `Lead` - Todos los leads
- `Conversation` - Todas las conversaciones
- `Message` - Todos los mensajes
- Cualquier modelo con campo `tenantId`

## Verificación de Aislamiento

Para verificar aislamiento correcto:

1. **Query debe retornar solo datos del tenant actual**
2. **Mutation debe fallar si el recurso no pertenece al tenant**
3. **Create debe incluir tenantId automáticamente**
4. **Tests deben verificar que tenant1 no accede a datos de tenant2**

## Referencias

- [Rule: Multitenancy](.cursor/rules/multitenancy.mdc)
- [Skill: Crear Query Multitenant](.cursor/skills/create-multitenant-query/SKILL.md)
- [Mejores Prácticas Backend - Multitenancy](../docs/BACKEND_BEST_PRACTICES.md#multitenancy)
- [Guía de Testing - Multitenancy](../docs/TESTING.md#testing-de-multitenancy)
