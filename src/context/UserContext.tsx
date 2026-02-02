'use client'

/**
 * Contexto de Usuario
 * 
 * Proporciona estado global del usuario autenticado
 * usando NextAuth session en el cliente.
 */

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import type { User } from '@/types/api'

interface UserContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

const UserContext = createContext<UserContextValue | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true)
      return
    }

    if (status === 'authenticated' && session?.user) {
      // Convertir session.user a tipo User
      setUser({
        id: session.user.id,
        nombre: session.user.name || '',
        email: session.user.email || '',
        rol: (session.user as { role?: string }).role || 'USER',
        createdAt: new Date(), // La sesión no incluye createdAt, usar fecha actual como fallback
      })
      setIsLoading(false)
    } else {
      setUser(null)
      setIsLoading(false)
    }
  }, [session, status])

  const value: UserContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user && !isLoading,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
