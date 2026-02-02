# Mejores Prácticas Frontend

Esta guía documenta los estándares y mejores prácticas para el desarrollo de componentes y lógica de frontend en el CRM Inmobiliario.

## 📋 Índice

1. [Filosofía de Abstracción de API](#filosofía-de-abstracción-de-api)
2. [Arquitectura de Componentes](#arquitectura-de-componentes)
3. [Server Components vs Client Components](#server-components-vs-client-components)
4. [Manejo de Estado Global](#manejo-de-estado-global)
5. [Uso del Cliente API](#uso-del-cliente-api)
6. [React Query y Data Fetching](#react-query-y-data-fetching)
7. [Manejo de Errores y UX](#manejo-de-errores-y-ux)
8. [Convenciones de Nomenclatura](#convenciones-de-nomenclatura)
9. [Uso de shadcn/ui](#uso-de-shadcnui)
10. [Rendimiento y Accesibilidad](#rendimiento-y-accesibilidad)

## Filosofía de Abstracción de API

### Regla Fundamental

**El frontend NUNCA debe referenciar servicios externos directamente. Todo debe pasar a través del cliente API interno (`src/lib/api.ts`).**

### ❌ INCORRECTO

```typescript
// ❌ NUNCA hacer esto en el frontend
import { ManyChatClient } from '@manychat/sdk'

export function SendMessageButton() {
  const handleSend = async () => {
    const client = new ManyChatClient(API_KEY)
    await client.sendMessage(userId, message)
  }
  // ...
}
```

### ✅ CORRECTO

```typescript
// ✅ Usar el cliente API interno
import { api } from '@/lib/api'

export function SendMessageButton() {
  const handleSend = async () => {
    await api.sendMessage({ userId, message })
  }
  // ...
}
```

### Beneficios

1. **Abstracción completa**: El frontend no conoce detalles de implementación
2. **Cambios sin impacto**: Cambiar de ManyChat a UChat solo requiere cambios en backend
3. **Type safety**: Tipos compartidos entre frontend y backend
4. **Manejo centralizado**: Errores, retry logic, autenticación en un solo lugar

## Arquitectura de Componentes

### Componentes Presentacionales vs Contenedores

#### Componentes Presentacionales

Solo se encargan de renderizar UI, reciben datos por props:

```typescript
// src/components/leads/LeadCard.tsx
interface LeadCardProps {
  lead: Lead
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function LeadCard({ lead, onEdit, onDelete }: LeadCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{lead.nombre}</CardTitle>
        <CardDescription>{lead.telefono}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Estado: {lead.estado}</p>
      </CardContent>
      <CardFooter>
        {onEdit && <Button onClick={() => onEdit(lead.id)}>Editar</Button>}
        {onDelete && <Button onClick={() => onDelete(lead.id)}>Eliminar</Button>}
      </CardFooter>
    </Card>
  )
}
```

#### Componentes Contenedores

Manejan lógica, estado y llamadas a API:

```typescript
// src/components/leads/LeadCardContainer.tsx
'use client'

import { LeadCard } from './LeadCard'
import { useDeleteLead, useLead } from '@/hooks/use-api'
import { useRouter } from 'next/navigation'

interface LeadCardContainerProps {
  leadId: string
}

export function LeadCardContainer({ leadId }: LeadCardContainerProps) {
  const { data: lead, isLoading } = useLead(leadId)
  const deleteLead = useDeleteLead()
  const router = useRouter()

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de eliminar este lead?')) {
      await deleteLead.mutateAsync(leadId)
      router.push('/leads')
    }
  }

  if (isLoading) return <div>Cargando...</div>
  if (!lead) return <div>Lead no encontrado</div>

  return (
    <LeadCard
      lead={lead}
      onEdit={(id) => router.push(`/leads/${id}/edit`)}
      onDelete={handleDelete}
    />
  )
}
```

### Separación de Responsabilidades

- **Presentacionales**: UI pura, fácil de testear, reutilizables
- **Contenedores**: Lógica de negocio, estado, efectos secundarios
- **Hooks personalizados**: Lógica reutilizable extraída de contenedores

## Server Components vs Client Components

### Cuándo Usar Server Components (Por Defecto)

**Usar Server Components cuando:**
- Necesitas datos del servidor directamente
- No necesitas interactividad (onClick, useState, etc.)
- Quieres reducir bundle size del cliente
- Necesitas acceso directo a base de datos o APIs del servidor

```typescript
// src/app/leads/page.tsx (Server Component por defecto)
import { db } from '@/lib/db'
import { LeadList } from '@/components/leads/LeadList'

export default async function LeadsPage() {
  // Fetch directo en el servidor
  const leads = await db.lead.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <h1>Leads</h1>
      <LeadList initialLeads={leads} />
    </div>
  )
}
```

### Cuándo Usar Client Components

**Usar Client Components cuando:**
- Necesitas interactividad (onClick, onChange, etc.)
- Usas hooks de React (useState, useEffect, etc.)
- Usas hooks de librerías (useQuery, useMutation)
- Necesitas acceso a APIs del navegador (localStorage, window, etc.)

```typescript
// src/components/leads/LeadForm.tsx
'use client' // Directiva necesaria

import { useState } from 'react'
import { useCreateLead } from '@/hooks/use-api'

export function LeadForm() {
  const [nombre, setNombre] = useState('')
  const createLead = useCreateLead()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createLead.mutateAsync({ nombre, telefono: '...' })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
      <button type="submit">Crear</button>
    </form>
  )
}
```

### Estrategia Recomendada

1. **Empezar con Server Component**: Por defecto, todos los componentes son Server Components
2. **Agregar 'use client' solo cuando sea necesario**: Cuando necesites interactividad
3. **Combinar ambos**: Server Components para layout y datos, Client Components para interactividad

```typescript
// Server Component (page.tsx)
export default async function LeadsPage() {
  const leads = await getLeads() // Fetch en servidor
  
  return <LeadsPageClient initialLeads={leads} />
}

// Client Component (para interactividad)
'use client'
export function LeadsPageClient({ initialLeads }: { initialLeads: Lead[] }) {
  const [search, setSearch] = useState('')
  // Lógica interactiva...
}
```

## Manejo de Estado Global

### Cuándo Usar Estado Global

**✅ Usar estado global para:**
- Datos compartidos entre componentes no relacionados (tenant, usuario)
- Datos que se pasan a través de muchos niveles (evitar prop drilling)
- Datos que persisten durante la sesión
- Configuración de UI compartida (tema, sidebar abierto/cerrado)

**❌ NO usar estado global para:**
- Datos que solo se pasan 1-2 niveles (usar props)
- Datos de servidor (usar Server Components o React Query)
- Estado local de un componente (usar useState)

### Contextos Disponibles

#### UserContext

```typescript
'use client'

import { useUser } from '@/context/UserContext'

export function UserProfile() {
  const { user, isLoading, isAuthenticated } = useUser()

  if (isLoading) return <div>Cargando...</div>
  if (!isAuthenticated) return <div>No autenticado</div>

  return <div>Hola, {user?.nombre}</div>
}
```

#### TenantContext

```typescript
'use client'

import { useTenant } from '@/context/TenantContext'

export function TenantInfo() {
  const { tenant, tenantId, isLoading } = useTenant()

  if (isLoading) return <div>Cargando tenant...</div>

  return <div>Tenant: {tenant?.nombre} ({tenantId})</div>
}
```

### Estado Local vs Global

```typescript
// ✅ Estado local para datos del componente
function SearchInput() {
  const [query, setQuery] = useState('') // Local, no necesita ser global
  // ...
}

// ✅ Estado global para datos compartidos
function App() {
  const { user } = useUser() // Global, usado en múltiples componentes
  const { tenant } = useTenant() // Global, usado en múltiples componentes
  // ...
}

// ❌ NO usar estado global para datos locales
function Counter() {
  const [count, setCount] = useState(0) // Local, no necesita ser global
  // ...
}
```

## Uso del Cliente API

### Importar el Cliente

```typescript
import { api } from '@/lib/api'
```

### Métodos Disponibles

```typescript
// Leads
const leads = await api.getLeads({ page: 1, limit: 10 })
const lead = await api.getLead(id)
const newLead = await api.createLead({ nombre: '...', telefono: '...' })
await api.updateLead(id, { estado: 'EN_REVISION' })
await api.deleteLead(id)

// Conversaciones
const conversations = await api.getConversations(leadId)
const messages = await api.getMessages(conversationId)

// Usuario
const user = await api.getCurrentUser()
```

### Manejo de Errores

El cliente maneja automáticamente:
- **401 (Unauthorized)**: Redirige a `/auth/signin`
- **403 (Forbidden)**: Lanza `ForbiddenError`
- **Timeout**: Lanza `TimeoutError` después de 30 segundos
- **Retry**: Reintenta automáticamente en errores 5xx

```typescript
import { api, NetworkError, TimeoutError } from '@/lib/api'

try {
  const lead = await api.getLead(id)
} catch (error) {
  if (error instanceof TimeoutError) {
    // Manejar timeout
    console.error('La solicitud tardó demasiado')
  } else if (error instanceof NetworkError) {
    // Manejar error de red
    console.error('Error de red:', error.message)
  }
}
```

## React Query y Data Fetching

### Hooks Disponibles

```typescript
import {
  useLeads,
  useLead,
  useCreateLead,
  useUpdateLead,
  useDeleteLead,
  useConversations,
  useMessages,
  useCurrentUser,
} from '@/hooks/use-api'
```

### Uso de Queries

```typescript
'use client'

import { useLeads } from '@/hooks/use-api'

export function LeadsList() {
  const { data, isLoading, error } = useLeads({
    page: 1,
    limit: 10,
    estado: 'NUEVO',
  })

  if (isLoading) return <div>Cargando leads...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <ul>
      {data?.data.map((lead) => (
        <li key={lead.id}>{lead.nombre}</li>
      ))}
    </ul>
  )
}
```

### Uso de Mutations

```typescript
'use client'

import { useCreateLead } from '@/hooks/use-api'
import { toast } from 'sonner'

export function CreateLeadForm() {
  const createLead = useCreateLead()

  const handleSubmit = async (data: CreateLeadRequest) => {
    try {
      await createLead.mutateAsync(data)
      toast.success('Lead creado exitosamente')
    } catch (error) {
      toast.error('Error al crear lead')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
    </form>
  )
}
```

### Invalidación de Cache

Las mutations invalidan automáticamente las queries relacionadas:

```typescript
// Cuando se crea un lead, se invalida la lista
const createLead = useCreateLead() // Invalida useLeads() automáticamente

// Cuando se actualiza un lead, se invalida el lead específico y la lista
const updateLead = useUpdateLead() // Invalida useLead(id) y useLeads()
```

## Manejo de Errores y UX

### Estados de Carga

```typescript
const { data, isLoading, isError, error } = useLeads()

if (isLoading) {
  return <Skeleton /> // o <Spinner />
}

if (isError) {
  return <ErrorAlert message={error.message} />
}

return <LeadsList leads={data} />
```

### Mensajes de Error Amigables

```typescript
function getErrorMessage(error: unknown): string {
  if (error instanceof TimeoutError) {
    return 'La solicitud tardó demasiado. Por favor, intenta de nuevo.'
  }
  if (error instanceof NetworkError) {
    return 'Error de conexión. Verifica tu internet.'
  }
  return 'Ocurrió un error inesperado.'
}
```

### Toast Notifications

```typescript
import { toast } from 'sonner'

// Éxito
toast.success('Lead creado exitosamente')

// Error
toast.error('Error al crear lead')

// Info
toast.info('Procesando solicitud...')

// Loading
const toastId = toast.loading('Creando lead...')
// ...
toast.success('Lead creado', { id: toastId })
```

## Convenciones de Nomenclatura

### Componentes

- **PascalCase**: `LeadCard.tsx`, `UserProfile.tsx`
- **Descriptivos**: `LeadCard` no `Card`, `UserProfile` no `Profile`

### Archivos

```
src/components/
├── leads/
│   ├── LeadCard.tsx           # Componente presentacional
│   ├── LeadCardContainer.tsx   # Componente contenedor
│   └── LeadForm.tsx            # Formulario
└── ui/                         # Componentes UI reutilizables
    ├── button.tsx
    └── card.tsx
```

### Hooks

- **use + verbo**: `useLeads`, `useCreateLead`, `useTenant`
- **Custom hooks**: `useLeadForm`, `useLeadFilters`

### Funciones y Variables

- **camelCase**: `handleSubmit`, `isLoading`, `leadData`
- **Booleanos**: Prefijo `is`, `has`, `should`: `isLoading`, `hasError`, `shouldShow`

## Uso de shadcn/ui

### Instalación de Componentes

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
```

### Uso de Componentes

```typescript
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export function LeadCard({ lead }: { lead: Lead }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{lead.nombre}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Editar</Button>
      </CardContent>
    </Card>
  )
}
```

### Personalización

Los componentes están en `src/components/ui/` y pueden ser modificados directamente.

## Rendimiento y Accesibilidad

### Optimizaciones

1. **Server Components**: Usar por defecto para reducir bundle
2. **Code Splitting**: Next.js lo hace automáticamente
3. **Image Optimization**: Usar `next/image`
4. **Lazy Loading**: Cargar componentes pesados con `dynamic`

```typescript
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <div>Cargando gráfico...</div>,
})
```

### Accesibilidad

1. **Semantic HTML**: Usar elementos semánticos (`<nav>`, `<main>`, `<article>`)
2. **ARIA Labels**: Agregar cuando sea necesario
3. **Keyboard Navigation**: Asegurar que todo sea navegable con teclado
4. **Focus Management**: Manejar focus apropiadamente

```typescript
<button
  aria-label="Eliminar lead"
  onClick={handleDelete}
>
  <TrashIcon aria-hidden="true" />
</button>
```

## Checklist de Revisión

Antes de hacer commit de un componente, verificar:

- [ ] No hay referencias a servicios externos (solo `api` de `@/lib/api`)
- [ ] Usa Server Components cuando sea posible
- [ ] Estado global solo para datos realmente compartidos
- [ ] Maneja estados de carga y error apropiadamente
- [ ] Usa hooks de React Query para data fetching
- [ ] Nombres descriptivos y consistentes
- [ ] Accesible (semantic HTML, ARIA cuando necesario)
- [ ] Responsive (funciona en móvil y desktop)

## Ejemplos Completos

Ver ejemplos completos en:
- `src/components/providers.tsx` - Configuración de providers
- `src/context/UserContext.tsx` - Contexto de usuario
- `src/hooks/use-api.ts` - Hooks de React Query
