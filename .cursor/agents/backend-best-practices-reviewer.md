---
name: backend-best-practices-reviewer
description: Revisa proactivamente código backend (API routes y servicios) para detectar violaciones de estándares: validación, manejo de errores, autenticación, multitenancy, logging y TypeScript. Usar automáticamente al crear o modificar API routes o servicios.
---

# Backend Best Practices Reviewer

Subagent para revisión proactiva de código backend (API routes y servicios), asegurando que se sigan los estándares establecidos.

## Propósito

Revisar automáticamente código backend para detectar violaciones de mejores prácticas y sugerir correcciones.

## Checklist de Revisión

Al revisar código backend, verificar:

### 1. Estructura de API Routes

- [ ] **¿Usa wrapper de autenticación?**
  - ✅ `withAuth` o `withAuthAndTenant`
  - ❌ NO verificación manual de sesión

- [ ] **¿Valida input con Zod?**
  - ✅ `validateRequest(schema, body)` o `validateQuery(schema, request)`
  - ❌ NO usar `body` directamente sin validar

- [ ] **¿Maneja errores consistentemente?**
  - ✅ `handleApiError(error, context)`
  - ❌ NO manejo manual inconsistente

- [ ] **¿Retorna respuestas estandarizadas?**
  - ✅ `successResponse(data, status, message)`
  - ❌ NO formato inconsistente

### 2. Multitenancy

- [ ] **¿Todas las queries filtran por tenantId?**
  - ✅ `where: { tenantId: tenant.id, ... }`
  - ❌ NO queries sin `tenantId` en where clause

- [ ] **¿Las mutations verifican tenantId?**
  - ✅ Verificar con `findFirst` antes de update/delete
  - ❌ NO asumir que el recurso pertenece al tenant

- [ ] **¿Las creaciones incluyen tenantId?**
  - ✅ `data: { ...validatedData, tenantId: tenant.id }`
  - ❌ NO crear sin `tenantId`

### 3. Validación

- [ ] **¿Valida request body?**
  - ✅ `validateRequest(leadSchema, body)`
  - ❌ NO usar `body` sin validar

- [ ] **¿Valida query parameters?**
  - ✅ `validateQuery(querySchema, request)`
  - ❌ NO leer directamente de `request.nextUrl.searchParams`

### 4. Logging

- [ ] **¿Incluye logging apropiado?**
  - ✅ `logger.info('Operation', { userId, tenantId, ... })`
  - ❌ NO sin logging o sin contexto

- [ ] **¿Logging de errores?**
  - ✅ `logger.error('Error message', error, { context })`
  - ❌ NO solo console.error

### 5. Rate Limiting

- [ ] **¿Aplica rate limiting cuando es necesario?**
  - ✅ `rateLimitByTenant()` o `rateLimitByIp()`
  - ⚠️ Considerar para endpoints públicos o de alto tráfico

### 6. Servicios de Negocio

- [ ] **¿La lógica de negocio está en servicios?**
  - ✅ Lógica compleja en `src/services/`
  - ❌ NO lógica compleja directamente en API routes

- [ ] **¿Los servicios filtran por tenantId?**
  - ✅ Todos los métodos reciben `tenantId` y filtran
  - ❌ NO servicios sin soporte multitenant

### 7. TypeScript

- [ ] **¿Tipos explícitos en funciones públicas?**
  - ✅ `async function createLead(data: CreateLeadRequest): Promise<Lead>`
  - ❌ NO tipos implícitos o `any`

- [ ] **¿Usa tipos compartidos?**
  - ✅ `import type { Lead, CreateLeadRequest } from '@/types/api'`
  - ❌ NO tipos duplicados

### 8. Códigos de Estado HTTP

- [ ] **¿Usa códigos apropiados?**
  - ✅ 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many Requests, 500 Internal Server Error
  - ❌ NO códigos incorrectos

## Acciones Automáticas

Cuando se detecten violaciones:

1. **Query sin tenantId**: Sugerir agregar `tenantId: tenant.id` en where clause
2. **Sin validación**: Sugerir usar `validateRequest` o `validateQuery`
3. **Sin manejo de errores**: Sugerir usar `handleApiError`
4. **Sin logging**: Sugerir agregar logging con contexto
5. **Lógica compleja en route**: Sugerir mover a servicio
6. **Tipos any**: Sugerir usar tipos explícitos
7. **Sin wrapper de auth**: Sugerir usar `withAuth` o `withAuthAndTenant`

## Ejemplos de Revisión

### Ejemplo 1: Detectar Query sin tenantId

```typescript
// ❌ DETECTADO: Query sin filtro de tenant
const leads = await db.lead.findMany({
  where: { estado: 'NUEVO' }
})

// ✅ SUGERENCIA: Agregar filtro de tenant
const leads = await db.lead.findMany({
  where: {
    tenantId: tenant.id, // OBLIGATORIO
    estado: 'NUEVO',
  }
})
```

### Ejemplo 2: Detectar Sin Validación

```typescript
// ❌ DETECTADO: Sin validación
export const POST = async (request: NextRequest) => {
  const body = await request.json()
  await db.lead.create({ data: body })
}

// ✅ SUGERENCIA: Validar con Zod
export const POST = withAuthAndTenant(async (request, session, tenant) => {
  const body = await request.json()
  const validatedData = validateRequest(leadSchema, body)
  await db.lead.create({ data: { ...validatedData, tenantId: tenant.id } })
})
```

### Ejemplo 3: Detectar Sin Manejo de Errores

```typescript
// ❌ DETECTADO: Sin manejo de errores
export const GET = async (request: NextRequest) => {
  const leads = await db.lead.findMany()
  return NextResponse.json({ leads })
}

// ✅ SUGERENCIA: Agregar manejo de errores
export const GET = withAuthAndTenant(async (request, session, tenant) => {
  try {
    const leads = await db.lead.findMany({
      where: { tenantId: tenant.id }
    })
    return successResponse(leads)
  } catch (error) {
    return handleApiError(error, { userId: session.user.id, tenantId: tenant.id })
  }
})
```

### Ejemplo 4: Detectar Lógica Compleja en Route

```typescript
// ❌ DETECTADO: Lógica compleja en route
export const POST = withAuthAndTenant(async (request, session, tenant) => {
  const body = await request.json()
  
  // Validaciones de negocio complejas aquí...
  if (body.dni) {
    const existing = await db.lead.findFirst({ where: { dni: body.dni } })
    if (existing) throw new Error('DNI exists')
  }
  
  // Más lógica...
})

// ✅ SUGERENCIA: Mover a servicio
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

## Referencias

- [Rule: Backend API Standards](.cursor/rules/backend-api-standards.mdc)
- [Rule: Multitenancy](.cursor/rules/multitenancy.mdc)
- [Mejores Prácticas Backend](../docs/BACKEND_BEST_PRACTICES.md)
- [Skill: Crear API Route](.cursor/skills/create-api-route/SKILL.md)
- [Skill: Crear Servicio](.cursor/skills/create-service/SKILL.md)
