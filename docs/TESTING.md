# Guía de Testing

Esta guía documenta las estrategias y mejores prácticas para testing en el CRM Inmobiliario, cubriendo frontend, backend e integraciones.

## 📋 Índice

1. [Estrategia de Testing](#estrategia-de-testing)
2. [Testing de Backend](#testing-de-backend)
3. [Testing de Frontend](#testing-de-frontend)
4. [Testing de Integraciones](#testing-de-integraciones)
5. [Testing de Multitenancy](#testing-de-multitenancy)
6. [Testing E2E](#testing-e2e)
7. [Mocking y Fixtures](#mocking-y-fixtures)
8. [CI/CD Integration](#cicd-integration)

## Estrategia de Testing

### Pirámide de Testing

```
        /\
       /  \      E2E Tests (Pocos, críticos)
      /____\
     /      \    Integration Tests (Algunos, servicios)
    /________\
   /          \  Unit Tests (Muchos, funciones/componentes)
  /____________\
```

### Tipos de Tests

1. **Unit Tests**: Funciones puras, helpers, utilidades
2. **Integration Tests**: API routes, servicios, componentes con hooks
3. **E2E Tests**: Flujos completos de usuario (Playwright)

### Herramientas

- **Vitest**: Unit e integration tests
- **Playwright**: E2E tests
- **React Testing Library**: Testing de componentes React
- **MSW (Mock Service Worker)**: Mocking de APIs

## Testing de Backend

### Setup de Tests

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Testing de API Routes

```typescript
// src/app/api/leads/__tests__/route.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET, POST } from '../route'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'

// Mock de next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

// Mock de logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}))

describe('GET /api/leads', () => {
  beforeEach(async () => {
    // Limpiar base de datos de test
    await db.lead.deleteMany()
  })

  it('should return 401 without authentication', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    const request = new Request('http://localhost/api/leads')
    const response = await GET(request)

    expect(response.status).toBe(401)
  })

  it('should return leads for authenticated user', async () => {
    // Mock de sesión
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user1', email: 'test@example.com' },
    } as any)

    // Crear lead de test
    await db.lead.create({
      data: {
        nombre: 'Test Lead',
        telefono: '+5491123456789',
        tenantId: 'tenant1',
      },
    })

    const request = new Request('http://localhost/api/leads', {
      headers: { 'x-tenant-id': 'tenant1' },
    })
    const response = await GET(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.data).toHaveLength(1)
    expect(data.data[0].nombre).toBe('Test Lead')
  })
})
```

### Testing de Servicios

```typescript
// src/services/leads/__tests__/lead.service.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { LeadService } from '../lead.service'
import { db } from '@/lib/db'

describe('LeadService', () => {
  let service: LeadService

  beforeEach(() => {
    service = new LeadService()
    // Limpiar DB
    return db.lead.deleteMany()
  })

  describe('createLead', () => {
    it('should create a lead with valid data', async () => {
      const leadData = {
        nombre: 'Juan Pérez',
        telefono: '+5491123456789',
        email: 'juan@example.com',
      }

      const lead = await service.createLead(leadData, 'tenant1', 'user1')

      expect(lead.id).toBeDefined()
      expect(lead.nombre).toBe(leadData.nombre)
      expect(lead.tenantId).toBe('tenant1')
    })

    it('should throw error if DNI already exists', async () => {
      // Crear lead existente
      await db.lead.create({
        data: {
          nombre: 'Existing',
          telefono: '+5491123456789',
          dni: '12345678',
          tenantId: 'tenant1',
        },
      })

      const leadData = {
        nombre: 'New Lead',
        telefono: '+5491123456789',
        dni: '12345678', // Mismo DNI
      }

      await expect(
        service.createLead(leadData, 'tenant1', 'user1')
      ).rejects.toThrow('Conflict: Ya existe un lead con este DNI')
    })
  })
})
```

### Testing de Helpers

```typescript
// src/lib/__tests__/api-helpers.test.ts
import { describe, it, expect } from 'vitest'
import { handleApiError, successResponse } from '../api-helpers'
import { ZodError } from 'zod'

describe('api-helpers', () => {
  describe('handleApiError', () => {
    it('should handle Zod validation errors', () => {
      const zodError = new ZodError([
        {
          path: ['nombre'],
          message: 'Required',
          code: 'invalid_type',
        },
      ])

      const response = handleApiError(zodError)
      const data = response.json()

      expect(response.status).toBe(400)
      expect(data.error.code).toBe('VALIDATION_ERROR')
    })

    it('should handle unauthorized errors', () => {
      const error = new Error('Unauthorized: Se requiere autenticación')
      const response = handleApiError(error)
      const data = response.json()

      expect(response.status).toBe(401)
      expect(data.error.code).toBe('UNAUTHORIZED')
    })
  })

  describe('successResponse', () => {
    it('should return success response with data', () => {
      const response = successResponse({ id: '123', name: 'Test' })
      const data = response.json()

      expect(response.status).toBe(200)
      expect(data.data).toEqual({ id: '123', name: 'Test' })
    })

    it('should include message when provided', () => {
      const response = successResponse({ id: '123' }, 201, 'Created')
      const data = response.json()

      expect(response.status).toBe(201)
      expect(data.message).toBe('Created')
    })
  })
})
```

## Testing de Frontend

### Setup de Tests

```typescript
// src/test/setup.ts
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Limpiar después de cada test
afterEach(() => {
  cleanup()
})
```

### Testing de Componentes

```typescript
// src/components/leads/__tests__/LeadCard.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LeadCard } from '../LeadCard'
import type { Lead } from '@/types/api'

const mockLead: Lead = {
  id: '1',
  nombre: 'Juan Pérez',
  telefono: '+5491123456789',
  estado: 'NUEVO',
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('LeadCard', () => {
  it('should render lead information', () => {
    render(<LeadCard lead={mockLead} />)

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByText('+5491123456789')).toBeInTheDocument()
    expect(screen.getByText('Estado: NUEVO')).toBeInTheDocument()
  })

  it('should call onEdit when edit button is clicked', () => {
    const onEdit = vi.fn()
    render(<LeadCard lead={mockLead} onEdit={onEdit} />)

    const editButton = screen.getByText('Editar')
    editButton.click()

    expect(onEdit).toHaveBeenCalledWith('1')
  })
})
```

### Testing con React Query

```typescript
// src/components/leads/__tests__/LeadsList.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LeadsList } from '../LeadsList'
import { api } from '@/lib/api'

// Mock del cliente API
vi.mock('@/lib/api', () => ({
  api: {
    getLeads: vi.fn(),
  },
}))

describe('LeadsList', () => {
  it('should display leads from API', async () => {
    const mockLeads = {
      data: [mockLead],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    }

    vi.mocked(api.getLeads).mockResolvedValue(mockLeads)

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <LeadsList />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    })
  })

  it('should display loading state', () => {
    vi.mocked(api.getLeads).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <LeadsList />
      </QueryClientProvider>
    )

    expect(screen.getByText('Cargando leads...')).toBeInTheDocument()
  })
})
```

### Testing de Hooks

```typescript
// src/hooks/__tests__/use-api.test.ts
import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useLeads } from '../use-api'
import { api } from '@/lib/api'

vi.mock('@/lib/api')

describe('useLeads', () => {
  it('should fetch leads', async () => {
    const mockLeads = {
      data: [mockLead],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    }

    vi.mocked(api.getLeads).mockResolvedValue(mockLeads)

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useLeads(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockLeads)
  })
})
```

## Testing de Integraciones

### Mocking de Servicios Externos

```typescript
// src/services/manychat/__tests__/client.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ManyChatClient } from '../client'

// Mock de fetch global
global.fetch = vi.fn()

describe('ManyChatClient', () => {
  let client: ManyChatClient

  beforeEach(() => {
    client = new ManyChatClient('test-api-key')
    vi.clearAllMocks()
  })

  it('should send message successfully', async () => {
    const mockResponse = { status: 'sent', message_id: '123' }

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const result = await client.sendMessage('user123', 'Hello')

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/sending/sendContent'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-api-key',
        }),
      })
    )

    expect(result).toEqual(mockResponse)
  })

  it('should throw error on API failure', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      statusText: 'Unauthorized',
    } as Response)

    await expect(
      client.sendMessage('user123', 'Hello')
    ).rejects.toThrow('ManyChat API error: Unauthorized')
  })
})
```

### Testing con MSW (Mock Service Worker)

```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/leads', () => {
    return HttpResponse.json({
      data: [
        {
          id: '1',
          nombre: 'Test Lead',
          telefono: '+5491123456789',
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    })
  }),

  http.post('/api/leads', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json(
      {
        data: {
          id: '2',
          ...body,
        },
      },
      { status: 201 }
    )
  }),
]
```

```typescript
// src/test/setup.ts
import { setupServer } from 'msw/node'
import { handlers } from './mocks/handlers'

export const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

## Testing de Multitenancy

### Aislamiento de Datos

```typescript
// src/app/api/leads/__tests__/multitenancy.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { GET } from '../route'
import { db } from '@/lib/db'

describe('Multitenancy - Leads API', () => {
  beforeEach(async () => {
    await db.lead.deleteMany()
  })

  it('should only return leads from the requesting tenant', async () => {
    // Crear leads para diferentes tenants
    await db.lead.create({
      data: {
        nombre: 'Tenant 1 Lead',
        telefono: '+5491111111111',
        tenantId: 'tenant1',
      },
    })

    await db.lead.create({
      data: {
        nombre: 'Tenant 2 Lead',
        telefono: '+5492222222222',
        tenantId: 'tenant2',
      },
    })

    // Mock de sesión para tenant1
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user1', email: 'user1@tenant1.com' },
    } as any)

    const request = new Request('http://localhost/api/leads', {
      headers: { 'x-tenant-id': 'tenant1' },
    })

    const response = await GET(request)
    const data = await response.json()

    expect(data.data).toHaveLength(1)
    expect(data.data[0].nombre).toBe('Tenant 1 Lead')
    expect(data.data[0].tenantId).toBe('tenant1')
  })

  it('should not allow accessing leads from other tenants', async () => {
    await db.lead.create({
      data: {
        nombre: 'Tenant 1 Lead',
        telefono: '+5491111111111',
        tenantId: 'tenant1',
      },
    })

    // Intentar acceder como tenant2
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user2', email: 'user2@tenant2.com' },
    } as any)

    const request = new Request('http://localhost/api/leads', {
      headers: { 'x-tenant-id': 'tenant2' },
    })

    const response = await GET(request)
    const data = await response.json()

    // No debe retornar leads de tenant1
    expect(data.data).toHaveLength(0)
  })
})
```

## Testing E2E

### Setup de Playwright

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env['CI'],
  },
})
```

### Test E2E de Flujo Completo

```typescript
// e2e/leads.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Leads Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/auth/signin')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should create a new lead', async ({ page }) => {
    await page.goto('/leads')
    await page.click('text=Crear Lead')

    await page.fill('input[name="nombre"]', 'Juan Pérez')
    await page.fill('input[name="telefono"]', '+5491123456789')
    await page.fill('input[name="email"]', 'juan@example.com')
    await page.selectOption('select[name="estado"]', 'NUEVO')

    await page.click('button[type="submit"]')

    // Verificar que el lead aparece en la lista
    await expect(page.locator('text=Juan Pérez')).toBeVisible()
  })

  test('should filter leads by status', async ({ page }) => {
    await page.goto('/leads')
    await page.selectOption('select[name="estado"]', 'NUEVO')

    // Verificar que solo se muestran leads con estado NUEVO
    const leads = page.locator('[data-testid="lead-card"]')
    const count = await leads.count()

    for (let i = 0; i < count; i++) {
      await expect(leads.nth(i).locator('text=NUEVO')).toBeVisible()
    }
  })
})
```

## Mocking y Fixtures

### Fixtures de Datos

```typescript
// src/test/fixtures/leads.ts
import type { Lead } from '@/types/api'

export const mockLead: Lead = {
  id: 'lead1',
  nombre: 'Juan Pérez',
  telefono: '+5491123456789',
  email: 'juan@example.com',
  estado: 'NUEVO',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

export const mockLeads: Lead[] = [
  mockLead,
  {
    ...mockLead,
    id: 'lead2',
    nombre: 'María García',
    email: 'maria@example.com',
  },
]
```

### Helpers de Test

```typescript
// src/test/helpers/api.ts
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'

export function createMockRequest(
  url: string,
  options?: {
    method?: string
    body?: unknown
    headers?: Record<string, string>
  }
): NextRequest {
  const headers = new Headers(options?.headers)
  if (options?.body) {
    headers.set('Content-Type', 'application/json')
  }

  return new NextRequest(url, {
    method: options?.method || 'GET',
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  })
}

export function createMockSession(userId: string, tenantId?: string) {
  return {
    user: {
      id: userId,
      email: `${userId}@example.com`,
      tenantId,
    },
  }
}
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run test:e2e
```

### Scripts de Test

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

## Mejores Prácticas

1. **AAA Pattern**: Arrange, Act, Assert
2. **Test Isolation**: Cada test debe ser independiente
3. **Descriptive Names**: Nombres de test que expliquen qué se prueba
4. **Mock External Dependencies**: Mockear servicios externos
5. **Test Edge Cases**: Probar casos límite y errores
6. **Fast Tests**: Tests unitarios deben ser rápidos
7. **Maintainable**: Tests deben ser fáciles de mantener

## Checklist de Testing

Antes de hacer commit, verificar:

- [ ] Tests unitarios para funciones puras y helpers
- [ ] Tests de integración para API routes
- [ ] Tests de componentes React
- [ ] Tests de multitenancy (aislamiento de datos)
- [ ] Tests E2E para flujos críticos
- [ ] Todos los tests pasan
- [ ] Cobertura de código adecuada (>80%)
