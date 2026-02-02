# Herramientas de Cursor: Rules, Skills y Subagents

Esta guía explica cómo usar las herramientas de Cursor (Rules, Skills y Subagents) configuradas en el proyecto para mantener código limpio, consistente y siguiendo las mejores prácticas.

## 📋 Tabla de Contenidos

- [¿Qué son Rules, Skills y Subagents?](#qué-son-rules-skills-y-subagents)
- [Rules Disponibles](#rules-disponibles)
- [Skills Disponibles](#skills-disponibles)
- [Subagents Disponibles](#subagents-disponibles)
- [Cómo Usar Estas Herramientas](#cómo-usar-estas-herramientas)
- [Estructura de Archivos](#estructura-de-archivos)

## ¿Qué son Rules, Skills y Subagents?

### Rules (Reglas)
Las **Rules** son guías persistentes que el agente de Cursor sigue automáticamente cuando trabajas con archivos específicos. Se activan según patrones de archivos (globs) o siempre.

**Ubicación**: `.cursor/rules/*.mdc`

### Skills (Habilidades)
Las **Skills** son guías especializadas que el agente usa cuando necesitas realizar tareas específicas. Se invocan automáticamente cuando son relevantes o manualmente con `/` en el chat.

**Ubicación**: `.cursor/skills/*/SKILL.md`

### Subagents (Subagentes)
Los **Subagents** son agentes especializados que revisan código proactivamente o se invocan para tareas específicas. Trabajan en contexto aislado con instrucciones especializadas.

**Ubicación**: `.cursor/agents/*.md`

## Rules Disponibles

### 1. Frontend API Abstraction Rule
**Archivo**: `.cursor/rules/frontend-api-abstraction.mdc`

**Cuándo se activa**: Al trabajar con archivos frontend (`src/app/**/*.tsx`, `src/components/**/*.tsx`, `src/hooks/**/*.ts`, `src/context/**/*.tsx`)

**Qué hace**: 
- Prohíbe imports de SDKs externos (ManyChat, UChat, ElevenLabs) en frontend
- Enforce uso del cliente API interno (`@/lib/api`)
- Detecta URLs directas a APIs externas

**Ejemplo de violación**:
```typescript
// ❌ Esto será detectado y corregido
import { ManyChatClient } from '@manychat/sdk'
```

**Solución correcta**:
```typescript
// ✅ Correcto
import { api } from '@/lib/api'
await api.sendMessage({ userId, message })
```

### 2. Backend API Standards Rule
**Archivo**: `.cursor/rules/backend-api-standards.mdc`

**Cuándo se activa**: Al trabajar con API routes (`src/app/api/**/*.ts`)

**Qué hace**:
- Enforce validación obligatoria con Zod
- Requiere manejo de errores consistente
- Verifica autenticación y multitenancy
- Asegura códigos de estado HTTP apropiados
- Requiere logging estructurado

**Ejemplo de violación**:
```typescript
// ❌ Sin validación ni manejo de errores
export const POST = async (request: NextRequest) => {
  const body = await request.json()
  await db.lead.create({ data: body })
}
```

**Solución correcta**:
```typescript
// ✅ Correcto
export const POST = withAuthAndTenant(async (request, session, tenant) => {
  const body = await request.json()
  const validatedData = validateRequest(leadSchema, body)
  
  try {
    const lead = await db.lead.create({
      data: { ...validatedData, tenantId: tenant.id }
    })
    return successResponse(lead, 201)
  } catch (error) {
    return handleApiError(error, { userId: session.user.id, tenantId: tenant.id })
  }
})
```

### 3. Multitenancy Rule
**Archivo**: `.cursor/rules/multitenancy.mdc`

**Cuándo se activa**: Al trabajar con API routes o servicios (`src/app/api/**/*.ts`, `src/services/**/*.ts`)

**Qué hace**:
- Asegura que todas las queries incluyan filtro por `tenantId`
- Verifica que las mutations validen pertenencia al tenant
- Detecta queries sin aislamiento de tenant

**Ejemplo de violación**:
```typescript
// ❌ Query sin filtro de tenant
const leads = await db.lead.findMany({
  where: { estado: 'NUEVO' }
})
```

**Solución correcta**:
```typescript
// ✅ Correcto
const leads = await db.lead.findMany({
  where: {
    tenantId: tenant.id, // OBLIGATORIO
    estado: 'NUEVO',
  }
})
```

### 4. TypeScript Strict Rule
**Archivo**: `.cursor/rules/typescript-strict.mdc`

**Cuándo se activa**: Al trabajar con archivos TypeScript (`**/*.ts`, `**/*.tsx`)

**Qué hace**:
- Prohíbe uso de `any` sin justificación
- Requiere tipos explícitos en funciones públicas
- Enforce manejo apropiado de null/undefined
- Promueve uso de tipos compartidos

**Ejemplo de violación**:
```typescript
// ❌ Uso de any
function processData(data: any) {
  return data.something
}
```

**Solución correcta**:
```typescript
// ✅ Correcto
function processData(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'something' in data) {
    return (data as { something: string }).something
  }
  throw new Error('Invalid data')
}
```

## Skills Disponibles

### 1. Create Frontend Component
**Archivo**: `.cursor/skills/create-frontend-component/SKILL.md`

**Cuándo se usa**: Cuando necesitas crear un nuevo componente React

**Qué hace**:
- Guía la creación de componentes presentacionales vs contenedores
- Ayuda a decidir entre Server Component y Client Component
- Enforce uso del cliente API interno
- Sugiere estructura de archivos apropiada

**Cómo invocar**:
```
Crear un componente LeadCard que muestre información de un lead
```

El agente usará automáticamente esta skill para guiar la creación.

### 2. Create API Route
**Archivo**: `.cursor/skills/create-api-route/SKILL.md`

**Cuándo se usa**: Cuando necesitas crear un nuevo endpoint de API

**Qué hace**:
- Proporciona template estándar de API route
- Incluye validación, autenticación, manejo de errores
- Asegura formato de respuestas consistente
- Incluye logging y rate limiting cuando aplica

**Cómo invocar**:
```
Crear un endpoint POST /api/leads para crear nuevos leads
```

### 3. Create Service
**Archivo**: `.cursor/skills/create-service/SKILL.md`

**Cuándo se usa**: Cuando necesitas crear lógica de negocio en servicios

**Qué hace**:
- Guía la estructura de servicios de negocio
- Asegura soporte multitenant
- Enforce separación de responsabilidades
- Proporciona patrones para integraciones externas

**Cómo invocar**:
```
Crear un servicio para manejar la lógica de envío de mensajes
```

### 4. Create Multitenant Query
**Archivo**: `.cursor/skills/create-multitenant-query/SKILL.md`

**Cuándo se usa**: Cuando necesitas hacer queries a la base de datos con multitenancy

**Qué hace**:
- Guía creación de queries con filtro de tenant
- Proporciona patrones para findMany, findUnique, create, update, delete
- Incluye ejemplos de relaciones y agregaciones
- Asegura aislamiento de datos

**Cómo invocar**:
```
Crear una query para obtener todos los leads de un tenant con estado NUEVO
```

## Subagents Disponibles

### 1. Frontend Best Practices Reviewer
**Archivo**: `.cursor/agents/frontend-best-practices-reviewer.md`

**Cuándo se activa**: Automáticamente al crear o modificar componentes frontend

**Qué hace**:
- Revisa abstracción de API (no SDKs externos)
- Verifica arquitectura de componentes
- Valida uso apropiado de estado global
- Revisa data fetching con React Query
- Verifica manejo de errores
- Revisa TypeScript y tipos

**Ejemplo de revisión**:
Si creas un componente que importa un SDK externo, el subagent detectará y sugerirá usar el cliente API interno.

### 2. Backend Best Practices Reviewer
**Archivo**: `.cursor/agents/backend-best-practices-reviewer.md`

**Cuándo se activa**: Automáticamente al crear o modificar API routes o servicios

**Qué hace**:
- Revisa validación de entrada
- Verifica manejo de errores
- Valida autenticación y autorización
- Revisa multitenancy
- Verifica logging estructurado
- Revisa códigos de estado HTTP

**Ejemplo de revisión**:
Si creas un endpoint sin validación, el subagent detectará y sugerirá agregar validación con Zod.

### 3. Multitenancy Reviewer
**Archivo**: `.cursor/agents/multitenancy-reviewer.md`

**Cuándo se activa**: Automáticamente al trabajar con queries a base de datos

**Qué hace**:
- Detecta queries sin filtro de tenantId
- Verifica que las mutations validen tenantId
- Revisa que las creaciones incluyan tenantId
- Valida aislamiento de datos en tests

**Ejemplo de revisión**:
Si haces una query sin `tenantId`, el subagent detectará y sugerirá agregar el filtro.

## Cómo Usar Estas Herramientas

### Uso Automático

Las **Rules** se activan automáticamente cuando trabajas con archivos que coinciden con sus patrones (globs). No necesitas hacer nada especial.

Los **Subagents** se invocan automáticamente cuando detectan código relevante. Pueden revisar proactivamente tu código.

Las **Skills** se usan automáticamente cuando el agente detecta que necesitas realizar una tarea específica (crear componente, API route, etc.).

### Uso Manual

#### Invocar Skills Manualmente

Puedes invocar skills manualmente mencionando la tarea:

```
@create-frontend-component Crear un componente para mostrar leads
```

```
@create-api-route Crear endpoint para actualizar leads
```

#### Invocar Subagents Manualmente

Puedes pedir al agente que use un subagent específico:

```
Usa el frontend-best-practices-reviewer para revisar este componente
```

```
Revisa este código con el multitenancy-reviewer
```

### Verificar que las Herramientas Están Activas

1. **Rules**: Se muestran en la configuración de Cursor (Settings > Rules, Skills, Subagents)
2. **Skills**: Aparecen en la lista de skills disponibles
3. **Subagents**: Aparecen en la lista de subagents disponibles

Si no aparecen, verifica:
- Que los archivos estén en las rutas correctas
- Que tengan el frontmatter YAML correcto
- Que recargues Cursor (Ctrl+R o Cmd+R)

## Estructura de Archivos

```
.cursor/
├── rules/
│   ├── frontend-api-abstraction.mdc
│   ├── backend-api-standards.mdc
│   ├── multitenancy.mdc
│   └── typescript-strict.mdc
├── skills/
│   ├── create-frontend-component/
│   │   └── SKILL.md
│   ├── create-api-route/
│   │   └── SKILL.md
│   ├── create-service/
│   │   └── SKILL.md
│   └── create-multitenant-query/
│       └── SKILL.md
└── agents/
    ├── frontend-best-practices-reviewer.md
    ├── backend-best-practices-reviewer.md
    └── multitenancy-reviewer.md
```

## Mejores Prácticas

### Para Desarrolladores

1. **Confía en las Rules**: Las rules se activan automáticamente y te guiarán
2. **Usa Skills cuando crees código nuevo**: Las skills te ayudarán a seguir patrones correctos
3. **Revisa sugerencias de Subagents**: Los subagents detectan problemas proactivamente
4. **No ignores las sugerencias**: Las herramientas están diseñadas para mantener calidad de código

### Para Líderes Técnicos

1. **Mantén las Rules actualizadas**: Si cambian los estándares, actualiza las rules
2. **Agrega nuevas Skills cuando sea necesario**: Si hay nuevos patrones, crea skills
3. **Revisa feedback de Subagents**: Los subagents pueden indicar áreas de mejora
4. **Documenta decisiones**: Si una rule o skill tiene una razón específica, documéntala

## Troubleshooting

### Las Rules no se activan

1. Verifica que el archivo tenga extensión `.mdc`
2. Verifica que tenga frontmatter YAML válido
3. Verifica que los `globs` coincidan con tus archivos
4. Recarga Cursor (Ctrl+R o Cmd+R)

### Las Skills no se invocan

1. Verifica que el archivo esté en `.cursor/skills/[nombre]/SKILL.md`
2. Verifica que tenga frontmatter con `name` y `description`
3. Menciona explícitamente la tarea que corresponde a la skill

### Los Subagents no revisan código

1. Verifica que el archivo esté en `.cursor/agents/[nombre].md`
2. Verifica que tenga frontmatter con `name` y `description`
3. Invoca manualmente el subagent si es necesario

## Referencias

- [Mejores Prácticas Backend](BACKEND_BEST_PRACTICES.md)
- [Mejores Prácticas Frontend](FRONTEND_BEST_PRACTICES.md)
- [Guía de Testing](TESTING.md)
- [Guía de Migración](MIGRATION_GUIDE.md)

---

**Versión**: 1.0.0  
**Última actualización**: 2025  
**Mantenido por**: Equipo STRATO
