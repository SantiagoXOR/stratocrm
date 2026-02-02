/**
 * Helpers de API Backend
 * 
 * Proporciona funciones utilitarias para manejo consistente de errores,
 * respuestas JSON estandarizadas, validación y autenticación.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { ZodSchema, ZodError } from 'zod'
import { authOptions } from './auth'
import { logger } from './logger'
import type { Session } from 'next-auth'

/**
 * Tipos de error estándar para respuestas API
 */
export interface ApiError {
  code: string
  message: string
  details?: unknown
}

/**
 * Respuesta exitosa estandarizada
 */
export interface ApiSuccess<T> {
  data: T
  message?: string
}

/**
 * Maneja errores y retorna respuesta JSON apropiada
 */
export function handleApiError(error: unknown, context?: { tenantId?: string; userId?: string; requestId?: string }): NextResponse {
  // Log del error
  logger.error('API Error', error, context)

  // Errores de validación Zod
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Error de validación',
          details: error.errors,
        } as ApiError,
      },
      { status: 400 }
    )
  }

  // Errores de autenticación
  if (error instanceof Error && error.message.includes('Unauthorized')) {
    return NextResponse.json(
      {
        error: {
          code: 'UNAUTHORIZED',
          message: 'No autorizado',
        } as ApiError,
      },
      { status: 401 }
    )
  }

  // Errores de autorización
  if (error instanceof Error && error.message.includes('Forbidden')) {
    return NextResponse.json(
      {
        error: {
          code: 'FORBIDDEN',
          message: 'Acceso denegado',
        } as ApiError,
      },
      { status: 403 }
    )
  }

  // Errores de recurso no encontrado
  if (error instanceof Error && error.message.includes('Not found')) {
    return NextResponse.json(
      {
        error: {
          code: 'NOT_FOUND',
          message: 'Recurso no encontrado',
        } as ApiError,
      },
      { status: 404 }
    )
  }

  // Error genérico del servidor
  const isDevelopment = process.env.NODE_ENV === 'development'
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: isDevelopment && error instanceof Error ? error.message : 'Error interno del servidor',
        ...(isDevelopment && error instanceof Error && { stack: error.stack }),
      } as ApiError,
    },
    { status: 500 }
  )
}

/**
 * Retorna respuesta exitosa estandarizada
 */
export function successResponse<T>(
  data: T,
  status: number = 200,
  message?: string
): NextResponse {
  const response: ApiSuccess<T> = { data }
  if (message) {
    response.message = message
  }
  return NextResponse.json(response, { status })
}

/**
 * Requiere autenticación. Lanza error si no hay sesión válida.
 */
export async function requireAuth(_request: NextRequest): Promise<Session> {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    throw new Error('Unauthorized: Se requiere autenticación')
  }

  return session
}

/**
 * Requiere tenant. 
 * 
 * NOTA: Actualmente el schema no tiene tenantId implementado.
 * Cuando se implemente multitenancy, este helper deberá:
 * 1. Obtener tenantId de la sesión o del header
 * 2. Validar que el tenant existe
 * 3. Retornar el tenant con su ID
 * 
 * Por ahora, retorna un objeto con tenantId como 'default' para preparar
 * la estructura para cuando se implemente.
 */
export async function requireTenant(request: NextRequest): Promise<{ id: string }> {
  // TODO: Implementar cuando se agregue modelo Tenant al schema
  // Por ahora, retornar tenant por defecto
  // Cuando se implemente:
  // 1. Obtener tenantId de session.user.tenantId o header 'x-tenant-id'
  // 2. Validar que existe en DB
  // 3. Retornar objeto Tenant completo
  
  const tenantId = request.headers.get('x-tenant-id') || 'default'
  
  // Por ahora, solo retornar el ID
  // Cuando se implemente multitenancy, hacer query a DB:
  // const tenant = await db.tenant.findUnique({ where: { id: tenantId } })
  // if (!tenant) throw new Error('Tenant not found')
  // return tenant
  
  return { id: tenantId }
}

/**
 * Valida request body contra un schema Zod
 */
export function validateRequest<T>(schema: ZodSchema<T>, data: unknown): T {
  return schema.parse(data)
}

/**
 * Valida query parameters contra un schema Zod
 */
export function validateQuery<T>(schema: ZodSchema<T>, request: NextRequest): T {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries())
  return schema.parse(params)
}

/**
 * Wrapper para API route handlers que maneja errores automáticamente
 */
export function withErrorHandler<T>(
  handler: (request: NextRequest, context?: { params?: T }) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: { params?: T }): Promise<NextResponse> => {
    try {
      return await handler(request, context)
    } catch (error) {
      // Intentar extraer contexto de la request
      const session = await getServerSession(authOptions).catch(() => null)
      const tenantId = request.headers.get('x-tenant-id') || undefined
      
      return handleApiError(error, {
        userId: session?.user?.id,
        tenantId,
      })
    }
  }
}

/**
 * Wrapper que requiere autenticación antes de ejecutar handler
 */
export function withAuth<T>(
  handler: (request: NextRequest, session: Session, context?: { params?: T }) => Promise<NextResponse>
) {
  return withErrorHandler(async (request: NextRequest, context?: { params?: T }) => {
    const session = await requireAuth(request)
    return handler(request, session, context)
  })
}

/**
 * Wrapper que requiere autenticación y tenant
 */
export function withAuthAndTenant<T>(
  handler: (
    request: NextRequest,
    session: Session,
    tenant: { id: string },
    context?: { params?: T }
  ) => Promise<NextResponse>
) {
  return withErrorHandler(async (request: NextRequest, context?: { params?: T }) => {
    const session = await requireAuth(request)
    const tenant = await requireTenant(request)
    return handler(request, session, tenant, context)
  })
}

/**
 * Extrae parámetros de ruta dinámicos de Next.js
 */
export function getRouteParams<T extends Record<string, string>>(
  context: { params?: Promise<T> | T }
): T {
  if (!context.params) {
    return {} as T
  }
  
  // Next.js 15+ usa Promise, versiones anteriores usan objeto directo
  if (context.params instanceof Promise) {
    throw new Error('Async params not supported. Use await in handler.')
  }
  
  return context.params
}
