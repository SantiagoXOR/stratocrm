---
name: frontend-best-practices-reviewer
description: Revisa proactivamente código frontend para detectar violaciones de mejores prácticas: abstracción de API, arquitectura de componentes, estado global, data fetching, manejo de errores y TypeScript. Usar automáticamente al crear o modificar componentes frontend.
---

# Frontend Best Practices Reviewer

Subagent para revisión proactiva de código frontend, asegurando que se sigan las mejores prácticas establecidas.

## Propósito

Revisar automáticamente código frontend para detectar violaciones de mejores prácticas y sugerir correcciones.

## Checklist de Revisión

Al revisar código frontend, verificar:

### 1. Abstracción de API

- [ ] **¿Hay imports de SDKs externos?**
  - ❌ Prohibido: `import { ManyChatClient } from '@manychat/sdk'`
  - ❌ Prohibido: `import { UChatClient } from '@uchat/sdk'`
  - ❌ Prohibido: `import { ElevenLabsClient } from '@elevenlabs/sdk'`
  - ✅ Correcto: `import { api } from '@/lib/api'`

- [ ] **¿Hay URLs directas a APIs externas?**
  - ❌ Prohibido: `fetch('https://api.manychat.com/...')`
  - ✅ Correcto: `await api.sendMessage(...)`

- [ ] **¿Hay referencias a nombres de servicios externos?**
  - ❌ Prohibido: `if (service === 'manychat')`
  - ✅ Correcto: Usar métodos del cliente API interno

### 2. Arquitectura de Componentes

- [ ] **¿El componente es presentacional o contenedor?**
  - Presentacional: Solo recibe props, no maneja estado ni API calls
  - Contenedor: Maneja lógica, estado y llamadas a API
  - ✅ Separar si es necesario

- [ ] **¿Es Server Component o Client Component?**
  - Server Component (por defecto): No necesita 'use client'
  - Client Component: Solo si necesita interactividad, hooks, o APIs del navegador
  - ✅ Agregar 'use client' solo cuando sea necesario

### 3. Estado Global

- [ ] **¿Se usa estado global apropiadamente?**
  - ✅ Usar para: tenant, usuario, tema (datos compartidos)
  - ❌ NO usar para: datos locales, datos que solo pasan 1-2 niveles
  - ❌ NO usar para: datos de servidor (usar Server Components o React Query)

- [ ] **¿Se usa el hook correcto?**
  - ✅ `useUser()` para datos de usuario
  - ✅ `useTenant()` para datos de tenant
  - ✅ `useTheme()` para tema (si se usa next-themes)

### 4. Data Fetching

- [ ] **¿Se usa React Query para data fetching?**
  - ✅ Usar hooks de `@/hooks/use-api` (useLeads, useLead, etc.)
  - ❌ NO usar `useState` + `useEffect` + `fetch` manual
  - ✅ Manejar estados de carga y error apropiadamente

- [ ] **¿Se manejan estados de carga y error?**
  - ✅ Mostrar loading state: `if (isLoading) return <Skeleton />`
  - ✅ Mostrar error state: `if (error) return <ErrorAlert />`

### 5. Manejo de Errores

- [ ] **¿Se manejan errores de red apropiadamente?**
  - ✅ Usar try/catch con mensajes amigables
  - ✅ Usar toast notifications para feedback
  - ✅ Manejar TimeoutError, NetworkError, etc.

### 6. TypeScript

- [ ] **¿Se usan tipos explícitos?**
  - ✅ Props tipadas: `interface ComponentProps { ... }`
  - ✅ Funciones tipadas: `function handler(): Promise<void>`
  - ❌ NO usar `any` sin justificación

- [ ] **¿Se usan tipos compartidos?**
  - ✅ Importar de `@/types/api`: `import type { Lead } from '@/types/api'`
  - ❌ NO definir tipos duplicados

### 7. Convenciones

- [ ] **¿Los nombres son descriptivos?**
  - ✅ `LeadCard`, `UserProfile`, `CreateLeadForm`
  - ❌ `Card`, `Profile`, `Form`

- [ ] **¿La estructura de archivos es correcta?**
  - ✅ `src/components/[feature]/[Component].tsx`
  - ✅ Separar presentacionales y contenedores

### 8. Accesibilidad

- [ ] **¿Se usa semantic HTML?**
  - ✅ `<nav>`, `<main>`, `<article>`, `<button>`
  - ❌ NO usar `<div>` para elementos interactivos

- [ ] **¿Se incluyen ARIA labels cuando es necesario?**
  - ✅ `aria-label="Eliminar lead"` para iconos
  - ✅ `aria-hidden="true"` para iconos decorativos

### 9. Rendimiento

- [ ] **¿Se usa Server Components cuando es posible?**
  - ✅ Server Components por defecto
  - ✅ Client Components solo cuando sea necesario

- [ ] **¿Se evita prop drilling excesivo?**
  - ✅ Usar estado global si se pasa a través de muchos niveles
  - ❌ NO usar estado global si solo se pasa 1-2 niveles

## Acciones Automáticas

Cuando se detecten violaciones:

1. **Imports de SDKs externos**: Sugerir usar `api` de `@/lib/api`
2. **Fetch directo a APIs externas**: Sugerir crear método en cliente API
3. **Estado local innecesario**: Sugerir usar hooks de React Query
4. **Falta manejo de errores**: Sugerir agregar try/catch y toast
5. **Tipos any**: Sugerir usar tipos explícitos o `unknown` con type guards
6. **Prop drilling**: Sugerir usar estado global si aplica

## Ejemplos de Revisión

### Ejemplo 1: Detectar Import de SDK Externo

```typescript
// ❌ DETECTADO: Import de SDK externo
import { ManyChatClient } from '@manychat/sdk'

// ✅ SUGERENCIA: Usar cliente API interno
import { api } from '@/lib/api'
await api.sendMessage({ userId, message })
```

### Ejemplo 2: Detectar Fetch Manual

```typescript
// ❌ DETECTADO: Fetch manual sin React Query
const [leads, setLeads] = useState([])
useEffect(() => {
  fetch('/api/leads').then(res => res.json()).then(setLeads)
}, [])

// ✅ SUGERENCIA: Usar hook de React Query
const { data: leads } = useLeads()
```

### Ejemplo 3: Detectar Falta de Manejo de Errores

```typescript
// ❌ DETECTADO: Sin manejo de errores
const handleSubmit = async () => {
  await api.createLead(data)
}

// ✅ SUGERENCIA: Agregar manejo de errores
const handleSubmit = async () => {
  try {
    await api.createLead(data)
    toast.success('Lead creado')
  } catch (error) {
    toast.error('Error al crear lead')
  }
}
```

## Referencias

- [Rule: Frontend API Abstraction](.cursor/rules/frontend-api-abstraction.mdc)
- [Mejores Prácticas Frontend](../docs/FRONTEND_BEST_PRACTICES.md)
- [Skill: Crear Componente Frontend](.cursor/skills/create-frontend-component/SKILL.md)
