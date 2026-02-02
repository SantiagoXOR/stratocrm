'use client'

/**
 * Providers Component
 * 
 * Envuelve la aplicación con todos los providers necesarios:
 * - SessionProvider (NextAuth)
 * - QueryClientProvider (React Query)
 * - UserProvider
 * - TenantProvider
 * - ThemeProvider (next-themes)
 */

import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from 'next-themes'
import { UserProvider } from '@/context/UserContext'
import { TenantProvider } from '@/context/TenantContext'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  // Crear QueryClient una sola vez (evitar recrear en cada render)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minuto
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  )

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider>
            <TenantProvider>{children}</TenantProvider>
          </UserProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </SessionProvider>
  )
}
