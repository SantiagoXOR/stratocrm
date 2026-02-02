---
name: create-frontend-component
description: Guía para crear componentes frontend siguiendo las mejores prácticas del proyecto. Usar cuando el usuario quiere crear un nuevo componente React.
---

# Crear Componente Frontend

Guía paso a paso para crear componentes frontend siguiendo las mejores prácticas del proyecto.

## 1. Determinar Tipo de Componente

### ¿Es Presentacional o Contenedor?

**Presentacional**: Solo renderiza UI, recibe datos por props
- Ubicación: `src/components/[feature]/[ComponentName].tsx`
- Ejemplo: `LeadCard.tsx`, `UserAvatar.tsx`

**Contenedor**: Maneja lógica, estado y llamadas a API
- Ubicación: `src/components/[feature]/[ComponentName]Container.tsx`
- Ejemplo: `LeadCardContainer.tsx`, `LeadsListContainer.tsx`

## 2. Decidir: Server Component vs Client Component

### Server Component (Por Defecto)

Usar cuando:
- No necesitas interactividad (onClick, useState, etc.)
- Necesitas datos del servidor directamente
- Quieres reducir bundle size

```typescript
// src/components/leads/LeadCard.tsx (Server Component)
import type { Lead } from '@/types/api'

interface LeadCardProps {
  lead: Lead
}

export function LeadCard({ lead }: LeadCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{lead.nombre}</CardTitle>
      </CardHeader>
    </Card>
  )
}
```

### Client Component

Usar cuando:
- Necesitas interactividad
- Usas hooks (useState, useEffect, useQuery, etc.)
- Necesitas acceso a APIs del navegador

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

## 3. Estructura de Archivo

### Componente Presentacional

```typescript
// src/components/leads/LeadCard.tsx
import type { Lead } from '@/types/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
      </CardHeader>
      <CardContent>
        <p>{lead.telefono}</p>
        <p>Estado: {lead.estado}</p>
      </CardContent>
      {onEdit && (
        <Button onClick={() => onEdit(lead.id)}>Editar</Button>
      )}
      {onDelete && (
        <Button onClick={() => onDelete(lead.id)}>Eliminar</Button>
      )}
    </Card>
  )
}
```

### Componente Contenedor

```typescript
// src/components/leads/LeadCardContainer.tsx
'use client'

import { LeadCard } from './LeadCard'
import { useLead, useDeleteLead } from '@/hooks/use-api'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface LeadCardContainerProps {
  leadId: string
}

export function LeadCardContainer({ leadId }: LeadCardContainerProps) {
  const { data: lead, isLoading, error } = useLead(leadId)
  const deleteLead = useDeleteLead()
  const router = useRouter()

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de eliminar este lead?')) {
      try {
        await deleteLead.mutateAsync(leadId)
        toast.success('Lead eliminado')
        router.push('/leads')
      } catch (error) {
        toast.error('Error al eliminar lead')
      }
    }
  }

  if (isLoading) return <div>Cargando...</div>
  if (error) return <div>Error: {error.message}</div>
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

## 4. Reglas Importantes

### ❌ NUNCA hacer esto:

```typescript
// ❌ PROHIBIDO - Referencia directa a servicios externos
import { ManyChatClient } from '@manychat/sdk'
const client = new ManyChatClient(API_KEY)

// ❌ PROHIBIDO - Fetch directo a APIs externas
const response = await fetch('https://api.manychat.com/...')
```

### ✅ SIEMPRE hacer esto:

```typescript
// ✅ CORRECTO - Usar cliente API interno
import { api } from '@/lib/api'
await api.sendMessage({ userId, message })
```

## 5. Uso de Hooks

### React Query para Data Fetching

```typescript
'use client'

import { useLeads, useCreateLead } from '@/hooks/use-api'

export function LeadsList() {
  const { data, isLoading, error } = useLeads({ page: 1, limit: 10 })
  const createLead = useCreateLead()

  // ...
}
```

### Estado Global

```typescript
'use client'

import { useUser } from '@/context/UserContext'
import { useTenant } from '@/context/TenantContext'

export function UserInfo() {
  const { user } = useUser()
  const { tenant } = useTenant()
  // ...
}
```

## 6. Manejo de Estados

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

## 7. Checklist

Antes de finalizar el componente:

- [ ] ¿Es Server Component o Client Component? (agregar 'use client' si es necesario)
- [ ] ¿Es Presentacional o Contenedor? (separar si es necesario)
- [ ] ¿Usa el cliente API interno? (nunca servicios externos)
- [ ] ¿Maneja estados de carga y error?
- [ ] ¿Tiene tipos TypeScript explícitos?
- [ ] ¿Usa componentes de shadcn/ui cuando sea apropiado?
- [ ] ¿Es accesible? (semantic HTML, ARIA cuando necesario)
- [ ] ¿Es responsive?

## 8. Ubicación de Archivos

```
src/components/
├── [feature]/              # Componentes específicos de una feature
│   ├── [Component].tsx     # Presentacional
│   ├── [Component]Container.tsx  # Contenedor
│   └── [Component]Form.tsx      # Formulario
└── ui/                     # Componentes UI reutilizables (shadcn/ui)
    ├── button.tsx
    └── card.tsx
```

## Ejemplo Completo

Ver ejemplos en:
- `src/components/providers.tsx` - Provider component
- `src/context/UserContext.tsx` - Context component
- (Futuro) `src/components/leads/LeadCard.tsx` - Presentational component
- (Futuro) `src/components/leads/LeadCardContainer.tsx` - Container component
