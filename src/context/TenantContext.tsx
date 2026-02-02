'use client'

/**
 * Contexto de Tenant
 * 
 * Proporciona estado global del tenant actual.
 * 
 * NOTA: Actualmente el schema no tiene tenantId implementado.
 * Cuando se implemente multitenancy, este contexto deberá:
 * 1. Obtener tenantId de la sesión del usuario
 * 2. Cargar información del tenant desde la API
 * 3. Proporcionar métodos para cambiar de tenant (si el usuario tiene múltiples)
 */

import { createContext, useContext, useEffect, useState } from 'react'
import { useUser } from './UserContext'
import type { Tenant } from '@/types/api'

interface TenantContextValue {
  tenant: Tenant | null
  isLoading: boolean
  tenantId: string | null
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined)

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useUser()
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      setTenant(null)
      setIsLoading(false)
      return
    }

    // TODO: Cuando se implemente multitenancy:
    // 1. Obtener tenantId de user.tenantId o de la sesión
    // 2. Hacer request a /api/tenants/:id para obtener información completa
    // 3. Actualizar estado con tenant completo

    // Por ahora, usar tenant por defecto
    const defaultTenant: Tenant = {
      id: 'default',
      nombre: 'Tenant Principal',
    }

    setTenant(defaultTenant)
    setIsLoading(false)
  }, [isAuthenticated, user])

  const value: TenantContextValue = {
    tenant,
    isLoading,
    tenantId: tenant?.id ?? null,
  }

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}
