---
name: Frontend y Backend Best Practices
overview: Documentar mejores prácticas para frontend y backend, crear reglas, skills y subagents para asegurar código limpio, mantenible y escalable, con abstracción completa de servicios externos.
todos:
  - id: create-api-client
    content: Crear cliente API interno en src/lib/api.ts con métodos type-safe para todos los recursos
    status: completed
  - id: create-frontend-best-practices
    content: Crear documentación completa de mejores prácticas frontend en docs/FRONTEND_BEST_PRACTICES.md
    status: completed
  - id: create-backend-best-practices
    content: Crear documentación completa de mejores prácticas backend en docs/BACKEND_BEST_PRACTICES.md
    status: completed
  - id: create-api-helpers
    content: Crear helpers de backend en src/lib/api-helpers.ts para manejo de errores, validación y respuestas consistentes
    status: completed
  - id: create-frontend-api-abstraction-rule
    content: Crear rule en .cursor/rules/frontend-api-abstraction.mdc para prohibir referencias a servicios externos
    status: completed
  - id: create-backend-api-standards-rule
    content: Crear rule en .cursor/rules/backend-api-standards.mdc para validación, manejo de errores y seguridad
    status: completed
  - id: create-frontend-component-skill
    content: Crear skill en .cursor/skills/create-frontend-component/SKILL.md para guiar generación de componentes
    status: completed
  - id: create-backend-api-route-skill
    content: Crear skill en .cursor/skills/create-api-route/SKILL.md para guiar creación de API routes
    status: completed
  - id: create-frontend-reviewer-subagent
    content: Crear subagent en .cursor/agents/frontend-best-practices-reviewer.md para revisión proactiva de código frontend
    status: completed
  - id: create-backend-reviewer-subagent
    content: Crear subagent en .cursor/agents/backend-best-practices-reviewer.md para revisión proactiva de código backend
    status: completed
  - id: update-docs-index
    content: Actualizar docs/README.md para incluir referencias a las nuevas documentaciones
    status: completed
  - id: create-shared-types
    content: Crear tipos TypeScript compartidos en src/types/api.ts para requests/responses compartidos entre frontend y backend
    status: completed
  - id: create-logger
    content: Crear logger estructurado en src/lib/logger.ts para logging consistente en backend
    status: completed
  - id: create-rate-limit
    content: Crear middleware de rate limiting en src/lib/rate-limit.ts para protección de API routes
    status: completed
  - id: create-testing-docs
    content: Crear documentación de testing en docs/TESTING.md cubriendo frontend, backend e integraciones
    status: completed
  - id: create-migration-guide
    content: Crear guía de migración en docs/MIGRATION_GUIDE.md para migrar código existente a nuevos patrones
    status: completed
  - id: create-service-skill
    content: Crear skill para generar servicios de negocio en .cursor/skills/create-service/SKILL.md
    status: completed
  - id: enhance-api-client-auth
    content: Mejorar cliente API con manejo de autenticación (cookies, session), retry logic y manejo de errores de red
    status: completed
  - id: document-server-components
    content: Documentar estrategia de Server Components vs Client Components en FRONTEND_BEST_PRACTICES.md
    status: completed
  - id: create-tenant-context-frontend
    content: Crear hook useTenant() y contexto para manejo de tenant en frontend
    status: completed
  - id: implement-global-state
    content: Decidir e implementar solución de estado global (Context API o Zustand) para tenant, usuario, tema, etc.
    status: completed
  - id: create-state-management-docs
    content: Documentar estrategia de manejo de estado global en FRONTEND_BEST_PRACTICES.md con ejemplos
    status: completed
  - id: create-multitenancy-rule
    content: Crear rule en .cursor/rules/multitenancy.mdc para asegurar tenantId en todas las queries y validaciones
    status: completed
  - id: create-typescript-strict-rule
    content: Crear rule en .cursor/rules/typescript-strict.mdc para enforce tipado estricto y mejores prácticas TypeScript
    status: completed
  - id: create-eslint-config
    content: Mejorar configuración de ESLint con reglas específicas para el proyecto (multitenancy, abstracción de API, etc.)
    status: completed
  - id: create-multitenancy-skill
    content: Crear skill en .cursor/skills/create-multitenant-query/SKILL.md para guiar creación de queries con aislamiento de tenant
    status: completed
  - id: create-multitenancy-subagent
    content: Crear subagent en .cursor/agents/multitenancy-reviewer.md para revisión proactiva de aislamiento de tenant
    status: completed
  - id: enhance-tsconfig
    content: Mejorar tsconfig.json con configuraciones más estrictas (strictNullChecks, noUncheckedIndexedAccess, etc.)
    status: completed
  - id: create-eslint-custom-rules
    content: Crear reglas ESLint personalizadas para detectar queries sin tenantId y imports de servicios externos
    status: completed
isProject: false
---

# Plan: Mejores Prácticas Frontend y Backend

## Objetivo

Establecer estándares de código limpio, mantenible y escalable para frontend y backend, asegurando que:

- El frontend nunca referencie servicios externos directamente
- El backend maneje todas las integraciones con servicios externos
- Se sigan patrones consistentes en ambos lados
- Se creen herramientas (rules, skills, subagents) para reforzar estas prácticas

## Arquitectura de Abstracción

```
Frontend (Next.js)
    │
    ▼
Cliente API Interno (src/lib/api.ts)
    │
    ▼
API Routes (src/app/api/**)
    │
    ├──► Validación (Zod)
    ├──► Autenticación (NextAuth)
    ├──► Business Logic (Services)
    └──► Integraciones Externas (ManyChat, UChat, ElevenLabs)
```

## Frontend - Archivos a Crear

### 1. Cliente API Interno

**Archivo**: `src/lib/api.ts`

Cliente centralizado type-safe que:

- Abstrae completamente servicios externos
- Proporciona métodos para todos los recursos (leads, conversations, properties, campaigns)
- Maneja errores de forma consistente (red, timeout, 401, 403, etc.)
- Incluye tipos TypeScript compartidos (usa `src/types/api.ts`)
- Usa fetch con configuración estándar
- Maneja autenticación automáticamente (cookies, session de NextAuth)
- Implementa retry logic para errores de red transitorios
- Maneja timeouts y errores de conexión
- Proporciona tipos de error específicos para mejor UX

### 2. Documentación Frontend

**Archivo**: `docs/FRONTEND_BEST_PRACTICES.md`

Contenido:

- Filosofía de abstracción de API
- Arquitectura de componentes (presentacionales vs contenedores)
- **Server Components vs Client Components**: Cuándo usar cada uno
- Convenciones de nomenclatura
- **Manejo de Estado Global**: Estrategia completa (Context API vs Zustand), qué datos globalizar, cuándo usar estado global vs props/local state
- Manejo de estado local (React hooks, useState, useReducer)
- Uso de shadcn/ui
- Rendimiento y accesibilidad
- Guía de uso del cliente API
- Manejo de errores de red y UX
- Tenant context en frontend (hook `useTenant()`)
- Estado global para: tenant, usuario, tema, notificaciones
- Ejemplos de código correcto/incorrecto

### 3. Rule: Abstracción de API Frontend

**Archivo**: `.cursor/rules/frontend-api-abstraction.mdc`

Prohíbe:

- Imports de SDKs externos (ManyChat, UChat, ElevenLabs, WhatsApp SDK)
- URLs directas a APIs externas
- Referencias a nombres de servicios externos en código frontend
- Forzar uso exclusivo de `src/lib/api.ts`

### 4. Skill: Generación de Componentes

**Archivo**: `.cursor/skills/create-frontend-component/SKILL.md`

Guía para crear componentes:

- Distinguir presentacionales vs contenedores
- Estructura de archivos y props TypeScript
- Separación de lógica y UI
- Uso de shadcn/ui
- Hooks personalizados para lógica reutilizable
- Ejemplos paso a paso

### 5. Subagent: Revisor Frontend

**Archivo**: `.cursor/agents/frontend-best-practices-reviewer.md`

Revisa proactivamente:

- Abstracción de API (sin referencias externas)
- Separación de responsabilidades
- Type safety
- Nombres descriptivos
- Reutilización de código
- Accesibilidad básica
- Rendimiento
- Uso apropiado de estado global (no prop drilling excesivo, no estado global innecesario)

### 5.1. Estado Global

**Archivo**: `src/context/` o `src/store/` (según solución elegida)

Implementación de estado global para:

- **Tenant Context**: Tenant actual del usuario
- **User Context**: Información del usuario autenticado
- **Theme Context**: Tema claro/oscuro (si se usa next-themes)
- **Notifications Context**: Notificaciones toast globales
- **UI State**: Estado de UI compartido (sidebar abierto/cerrado, modales, etc.)

**Decisión a tomar**:

- **Opción A: Context API nativo** (más simple, suficiente para la mayoría de casos)
- **Opción B: Zustand** (más ligero que Redux, mejor para estado complejo)
- **Opción C: Híbrido** (Context para tenant/usuario, Zustand para UI state complejo)

**Recomendación inicial**:

- Empezar con **Context API nativo** para tenant y usuario
- Evaluar Zustand solo si:
  - El estado de UI se vuelve complejo
  - Hay muchos re-renders innecesarios
  - Se necesita estado que cambia frecuentemente

**Cuándo usar estado global**:

- ✅ Datos compartidos entre componentes no relacionados (tenant, usuario)
- ✅ Datos que se pasan a través de muchos niveles (evitar prop drilling)
- ✅ Datos que persisten durante la sesión
- ❌ Datos que solo se pasan 1-2 niveles (usar props)
- ❌ Datos de servidor (usar Server Components o React Query)
- ❌ Estado local de un componente (usar useState)

## Backend - Archivos a Crear

### 6. Helpers de API

**Archivo**: `src/lib/api-helpers.ts`

Funciones utilitarias para:

- Manejo consistente de errores
- Respuestas JSON estandarizadas
- Validación de sesión y tenant
- Códigos de estado HTTP apropiados
- Logging estructurado (usa `src/lib/logger.ts`)

Estructura sugerida:

```typescript
export function handleApiError(error: unknown): NextResponse
export function successResponse<T>(data: T, status?: number): NextResponse
export async function requireAuth(request: Request): Promise<Session>
export async function requireTenant(request: Request): Promise<Tenant>
export function validateRequest<T>(schema: ZodSchema<T>, data: unknown): T
```

### 6.1. Logger Estructurado

**Archivo**: `src/lib/logger.ts`

Logger para backend con:

- Niveles de log (info, warn, error, debug)
- Contexto estructurado (tenantId, userId, requestId)
- Integración con servicios de logging (futuro: Sentry, DataDog)
- Formato consistente para producción

### 6.2. Rate Limiting

**Archivo**: `src/lib/rate-limit.ts`

Middleware de rate limiting:

- Por IP para endpoints públicos
- Por tenant para endpoints autenticados
- Configuración flexible por endpoint
- Respuestas 429 apropiadas

### 7. Documentación Backend

**Archivo**: `docs/BACKEND_BEST_PRACTICES.md`

Contenido:

- Estructura de API routes
- Validación con Zod (compartir schemas con frontend)
- Manejo de errores consistente
- Autenticación y autorización
- Multitenancy (aislamiento por tenant)
- Integración con servicios externos
- Logging estructurado y monitoreo
- Rate limiting
- Testing de API routes
- Variables de entorno y configuración
- Estructura de servicios de negocio (`src/services/`)
- Ejemplos de código correcto/incorrecto

### 8. Rule: Estándares de API Backend

**Archivo**: `.cursor/rules/backend-api-standards.mdc`

Enforce:

- Validación obligatoria con Zod
- Manejo de errores consistente
- Verificación de autenticación
- Verificación de tenant (multitenancy)
- Códigos de estado HTTP apropiados
- Respuestas JSON estandarizadas
- Logging de errores

### 8.1. Rule: Multitenancy

**Archivo**: `.cursor/rules/multitenancy.mdc`

Enforce aislamiento de tenant:

- Todas las queries a modelos con tenantId deben incluir filtro por tenantId
- Validar tenantId en mutations (crear, actualizar, eliminar)
- Nunca exponer datos de otro tenant
- Verificar tenantId en helpers `requireTenant()`
- Ejemplos de código incorrecto (queries sin tenantId) vs correcto

### 8.2. Rule: TypeScript Estricto

**Archivo**: `.cursor/rules/typescript-strict.mdc`

Enforce tipado estricto:

- No usar `any` (usar `unknown` y type guards)
- Tipos explícitos en funciones públicas
- No usar `@ts-ignore` o `@ts-expect-error` sin justificación
- Usar tipos compartidos de `src/types/api.ts`
- Inferir tipos desde Zod schemas cuando sea posible
- Ejemplos de código con tipado correcto vs incorrecto

### 9. Skill: Creación de API Routes

**Archivo**: `.cursor/skills/create-api-route/SKILL.md`

Guía para crear API routes:

- Estructura estándar de route handlers
- Validación con Zod schemas
- Manejo de errores con helpers
- Verificación de autenticación
- Verificación de tenant
- Respuestas consistentes
- Ejemplos paso a paso

### 9.1. Skill: Queries Multitenant

**Archivo**: `.cursor/skills/create-multitenant-query/SKILL.md`

Guía para crear queries con aislamiento de tenant:

- Siempre incluir `tenantId` en where clauses
- Usar `requireTenant()` helper para obtener tenant
- Validar tenantId en mutations
- Ejemplos de queries correctas vs incorrectas
- Patrones para joins y relaciones con tenant
- Testing de aislamiento de tenant

### 10. Subagent: Revisor Backend

**Archivo**: `.cursor/agents/backend-best-practices-reviewer.md`

Revisa proactivamente:

- Validación de entrada
- Manejo de errores
- Seguridad (auth, tenant isolation)
- Consistencia de respuestas
- Logging apropiado
- Optimización de queries
- Type safety

## Estructura de Archivos

```
.cursor/
├── rules/
│   ├── frontend-api-abstraction.mdc
│   ├── backend-api-standards.mdc
│   ├── multitenancy.mdc (nuevo)
│   └── typescript-strict.mdc (nuevo)
├── skills/
│   ├── create-frontend-component/
│   │   └── SKILL.md
│   ├── create-api-route/
│   │   └── SKILL.md
│   ├── create-service/
│   │   └── SKILL.md (nuevo - servicios de negocio)
│   └── create-multitenant-query/
│       └── SKILL.md (nuevo - queries con tenant)
└── agents/
    ├── frontend-best-practices-reviewer.md
    ├── backend-best-practices-reviewer.md
    └── multitenancy-reviewer.md (nuevo)

docs/
├── FRONTEND_BEST_PRACTICES.md
├── BACKEND_BEST_PRACTICES.md
├── TESTING.md (nuevo - guía de testing)
└── MIGRATION_GUIDE.md (nuevo - guía de migración)

src/
├── lib/
│   ├── api.ts (nuevo - cliente frontend)
│   ├── api-helpers.ts (nuevo - helpers backend)
│   ├── logger.ts (nuevo - logging estructurado)
│   └── rate-limit.ts (nuevo - rate limiting)
├── types/
│   └── api.ts (nuevo - tipos compartidos)
├── context/ o store/ (nuevo - estado global)
│   ├── TenantContext.tsx (o tenant-store.ts si Zustand)
│   ├── UserContext.tsx
│   └── ThemeContext.tsx (si no se usa next-themes)
└── services/ (nuevo - servicios de negocio)
    └── README.md (documentación de estructura)
```

## Principios Clave

### Frontend

1. **Abstracción Total**: Frontend solo conoce API interna
2. **Separación de Responsabilidades**: Presentacional vs Contenedor
3. **Type Safety**: Interfaces TypeScript claras (compartidas con backend)
4. **Código Limpio**: Nombres descriptivos, funciones pequeñas
5. **Reutilización**: Hooks y componentes reutilizables
6. **Server Components First**: Usar Server Components por defecto, Client Components solo cuando sea necesario
7. **Manejo Robusto de Errores**: Errores de red, timeouts, retry logic
8. **Estado Global Estratégico**: Solo para datos que realmente necesitan ser compartidos (tenant, usuario, tema). Evitar prop drilling excesivo pero también evitar estado global innecesario

### Backend

1. **Validación Obligatoria**: Zod en todos los endpoints (schemas compartidos)
2. **Manejo de Errores**: Consistente y estructurado con logging
3. **Seguridad**: Auth + Tenant isolation + Rate limiting
4. **Consistencia**: Respuestas estandarizadas
5. **Integraciones**: Todas las integraciones externas en backend
6. **Logging Estructurado**: Logger con contexto (tenantId, userId, requestId)
7. **Servicios de Negocio**: Lógica de negocio en `src/services/`, no en API routes

## Verificaciones

### Frontend

- [ ] Rule frontend prohíbe correctamente referencias externas
- [ ] Cliente API maneja autenticación (cookies, session)
- [ ] Cliente API tiene retry logic y manejo de errores de red
- [ ] Estado global implementado y documentado (Context API o Zustand)
- [ ] Hook `useTenant()` funciona correctamente usando estado global
- [ ] Tipos compartidos están sincronizados con backend
- [ ] Cliente API maneja autenticación (cookies, session)
- [ ] Cliente API tiene retry logic y manejo de errores de red
- [ ] Documentación cubre Server Components vs Client Components
- [ ] Documentación cubre cuándo usar estado global vs props/local state
- [ ] Ejemplos de código correcto/incorrecto incluidos

### Backend

- [ ] Rule backend enforce validación y seguridad
- [ ] Helpers de API cubren casos comunes
- [ ] Logger estructurado funciona correctamente
- [ ] Rate limiting está implementado
- [ ] Validación usa schemas compartidos con frontend
- [ ] Servicios de negocio están bien estructurados
- [ ] Documentación cubre variables de entorno

### Herramientas

- [ ] Skills proporcionan ejemplos claros
- [ ] Subagents tienen checklists completos
- [ ] Guía de migración está completa
- [ ] Documentación de testing está completa

### Multitenancy

- [ ] Rule multitenancy enforce aislamiento correcto
- [ ] Skill de queries multitenant funciona correctamente
- [ ] Subagent revisa proactivamente aislamiento
- [ ] Todas las queries incluyen tenantId
- [ ] Tests de aislamiento pasando

### TypeScript y ESLint

- [ ] TypeScript configurado en modo estricto (strictNullChecks, noUncheckedIndexedAccess, etc.)
- [ ] ESLint tiene reglas específicas del proyecto
- [ ] Reglas ESLint personalizadas funcionan (queries sin tenantId, imports externos)
- [ ] Rule TypeScript-strict enforce tipado correcto
- [ ] No hay uso de `any` sin justificación
- [ ] Tipos compartidos funcionan correctamente
- [ ] ESLint integrado en CI/CD

## Orden de Implementación

### Fase 1: Fundamentos Backend (Prioridad Alta)

1. Mejorar configuración TypeScript (`tsconfig.json` con strict mode)
2. Mejorar configuración ESLint (`.eslintrc.json` con reglas específicas y custom rules)
3. Crear reglas ESLint personalizadas (detectar queries sin tenantId, imports externos)
4. Crear logger estructurado (`src/lib/logger.ts`)
5. Crear helpers de API backend (`src/lib/api-helpers.ts`) con soporte multitenant
6. Crear rate limiting (`src/lib/rate-limit.ts`)
7. Crear tipos compartidos (`src/types/api.ts`)

### Fase 2: Cliente Frontend (Prioridad Alta)

5. Decidir solución de estado global (Context API vs Zustand)
6. Implementar estado global (tenant, usuario, tema)
7. Crear cliente API frontend (`src/lib/api.ts`) con autenticación y retry logic
8. Crear hook `useTenant()` que use el estado global

### Fase 3: Documentación Core

7. Crear documentación backend (`docs/BACKEND_BEST_PRACTICES.md`)
8. Crear documentación frontend (`docs/FRONTEND_BEST_PRACTICES.md`)
9. Crear documentación de testing (`docs/TESTING.md`)

### Fase 4: Herramientas de Desarrollo

10. Crear rules (frontend, backend, multitenancy, typescript-strict)
11. Crear skills (frontend, backend, servicios, multitenant queries)
12. Crear subagents (frontend, backend, multitenancy)

### Fase 5: Migración y Finalización

13. Crear guía de migración (`docs/MIGRATION_GUIDE.md`)
14. Crear estructura de servicios (`src/services/` con README)
15. Actualizar índice de documentación (`docs/README.md`)

## Consideraciones Adicionales

### Tipos Compartidos

- Los schemas Zod deben estar en `src/lib/validators.ts` (ya existe)
- Los tipos TypeScript inferidos deben exportarse en `src/types/api.ts`
- Frontend y backend importan desde los mismos archivos para mantener sincronización
- Usar `z.infer<typeof schema>` para inferir tipos automáticamente

### Configuración TypeScript Estricta

**Mejoras a `tsconfig.json`**:

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Configuración ESLint Mejorada

**Mejoras a `.eslintrc.json`**:

- Reglas específicas para detectar queries sin tenantId
- Reglas para prohibir `any`
- Reglas para detectar referencias a servicios externos en frontend
- Reglas de TypeScript estrictas
- Integración con reglas de Next.js

### Multitenancy en Desarrollo

**Patrones obligatorios**:

- Todas las queries a modelos con `tenantId` deben filtrar por tenant
- Usar helper `requireTenant()` en API routes
- Validar tenantId en mutations
- Incluir tenantId en logging
- Tests de aislamiento para cada endpoint

**Verificación automática**:

- ESLint custom rule detecta queries sin tenantId
- Subagent revisa proactivamente
- Rule multitenancy documenta patrones correctos
- Skill guía creación de queries multitenant

### Autenticación en Cliente API

- El cliente API debe usar `credentials: 'include'` en fetch
- Manejar 401 redirigiendo a login
- Manejar 403 mostrando mensaje de permisos
- Incluir CSRF token si es necesario

### Migración Gradual

- No romper código existente
- Migrar endpoint por endpoint
- Mantener compatibilidad durante transición
- Documentar proceso de migración paso a paso

## Riesgos y Mitigaciones

### Riesgo 1: Cliente API no maneja autenticación correctamente

**Mitigación**:

- Implementar manejo de cookies automático con `credentials: 'include'`
- Probar con diferentes escenarios de sesión (expiración, logout, etc.)
- Documentar claramente el uso y casos edge

### Riesgo 2: Tipos compartidos se desincronizan

**Mitigación**:

- Usar los mismos archivos de validación (Zod schemas en `src/lib/validators.ts`)
- Inferir tipos TypeScript desde schemas usando `z.infer<>`
- Documentar proceso de actualización de tipos
- Agregar verificación en CI/CD si es posible

### Riesgo 3: Desarrolladores ignoran las rules

**Mitigación**:

- Rules con ejemplos claros de código incorrecto vs correcto
- Subagents revisan proactivamente después de cambios
- Code review enfocado en estas prácticas
- Documentación accesible y fácil de encontrar

### Riesgo 4: Performance del cliente API

**Mitigación**:

- Implementar caching cuando sea apropiado (React Query o similar)
- Optimizar retry logic para no saturar servidor
- Documentar mejores prácticas de uso
- Considerar debouncing para búsquedas

### Riesgo 5: Rate limiting muy restrictivo

**Mitigación**:

- Configuración flexible por endpoint
- Límites razonables por defecto (ej: 100 req/min por IP)
- Documentar cómo ajustar límites por tenant
- Monitorear y ajustar según uso real

### Riesgo 6: Migración rompe funcionalidad existente

**Mitigación**:

- Migración gradual endpoint por endpoint
- Mantener compatibilidad durante transición
- Testing exhaustivo antes de cada migración
- Plan de rollback documentado
- Feature flags para activar/desactivar nuevos patrones

### Riesgo 7: Logger impacta performance

**Mitigación**:

- Usar niveles de log apropiados (solo error en producción)
- Logging asíncrono cuando sea posible
- Evitar logging de datos sensibles
- Configurar rotación de logs

### Riesgo 8: Server Components mal utilizados

**Mitigación**:

- Documentación clara de cuándo usar Server vs Client Components
- Ejemplos concretos en FRONTEND_BEST_PRACTICES.md
- Skill de creación de componentes incluye esta decisión
- Subagent revisa uso apropiado

### Riesgo 9: Estado global mal utilizado

**Mitigación**:

- Documentación clara de qué datos deben estar en estado global
- Regla: Solo datos que se comparten entre múltiples componentes no relacionados
- Evitar estado global para datos que solo se pasan 1-2 niveles (usar props)
- Evitar estado global para datos de servidor (usar Server Components o React Query)
- Ejemplos de cuándo usar estado global vs props vs Server Components
- Subagent revisa uso apropiado de estado global

### Riesgo 10: Fuga de datos entre tenants

**Mitigación**:

- Rule multitenancy enforce filtrado por tenantId
- Skill de queries multitenant guía correctamente
- Subagent revisa proactivamente todas las queries
- Tests de aislamiento obligatorios
- Helpers `requireTenant()` validan siempre
- Logging incluye tenantId para auditoría

### Riesgo 11: TypeScript no estricto permite errores

**Mitigación**:

- Configurar TypeScript en modo estricto (`strict: true`)
- Habilitar `strictNullChecks`, `noUncheckedIndexedAccess`
- Rule TypeScript-strict prohíbe `any` sin justificación
- ESLint con reglas de TypeScript
- Code review enfocado en tipado
- Documentar excepciones cuando sea necesario usar `any`

### Riesgo 12: ESLint no detecta problemas de multitenancy

**Mitigación**:

- Crear reglas ESLint personalizadas para detectar queries sin tenantId
- Integrar reglas en CI/CD
- Subagent revisa proactivamente
- Documentar patrones comunes que ESLint debe detectar