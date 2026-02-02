/**
 * Rate Limiting Middleware
 * 
 * Proporciona protección contra abuso de API mediante límites de requests
 * por IP (endpoints públicos) o por tenant (endpoints autenticados).
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from './logger'

interface RateLimitConfig {
  windowMs: number // Ventana de tiempo en milisegundos
  maxRequests: number // Máximo de requests en la ventana
  keyGenerator?: (request: NextRequest) => string // Función para generar clave única
  skipSuccessfulRequests?: boolean // No contar requests exitosos
  skipFailedRequests?: boolean // No contar requests fallidos
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// Store en memoria (en producción, usar Redis o similar)
const store: RateLimitStore = {}

// Limpiar entradas expiradas periódicamente
setInterval(() => {
  const now = Date.now()
  for (const key in store) {
    const entry = store[key]
    if (entry && entry.resetTime < now) {
      delete store[key]
    }
  }
}, 60000) // Limpiar cada minuto

/**
 * Genera clave por IP para endpoints públicos
 */
function getIpKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0]?.trim() : request.headers.get('x-real-ip') || 'unknown'
  return `ip:${ip}`
}

/**
 * Genera clave por tenant para endpoints autenticados
 * Requiere que el tenantId esté disponible en headers o session
 */
function getTenantKey(request: NextRequest): string {
  const tenantId = request.headers.get('x-tenant-id') || 'unknown'
  return `tenant:${tenantId}`
}

/**
 * Middleware de rate limiting
 */
export function rateLimit(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const key = config.keyGenerator ? config.keyGenerator(request) : getIpKey(request)
    const now = Date.now()

    // Obtener o inicializar entrada
    let entry = store[key]
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
      }
      store[key] = entry
    }

    // Incrementar contador
    entry.count++

    // Verificar límite
    if (entry.count > config.maxRequests) {
      logger.warn('Rate limit exceeded', {
        key,
        count: entry.count,
        maxRequests: config.maxRequests,
        path: request.nextUrl.pathname,
      })

      return NextResponse.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Maximum ${config.maxRequests} requests per ${config.windowMs / 1000} seconds.`,
          retryAfter: Math.ceil((entry.resetTime - now) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((entry.resetTime - now) / 1000)),
            'X-RateLimit-Limit': String(config.maxRequests),
            'X-RateLimit-Remaining': String(Math.max(0, config.maxRequests - entry.count)),
            'X-RateLimit-Reset': String(Math.ceil(entry.resetTime / 1000)),
          },
        }
      )
    }

    // Agregar headers de rate limit a la respuesta
    // (se agregarán en api-helpers.ts)
    return null // Continuar con la request
  }
}

/**
 * Rate limit por IP (para endpoints públicos)
 */
export function rateLimitByIp(maxRequests: number = 100, windowMs: number = 60000) {
  return rateLimit({
    windowMs,
    maxRequests,
    keyGenerator: getIpKey,
  })
}

/**
 * Rate limit por tenant (para endpoints autenticados)
 */
export function rateLimitByTenant(maxRequests: number = 200, windowMs: number = 60000) {
  return rateLimit({
    windowMs,
    maxRequests,
    keyGenerator: getTenantKey,
  })
}

/**
 * Obtiene información de rate limit para una clave
 * Útil para debugging y monitoreo
 */
export function getRateLimitInfo(key: string): { count: number; resetTime: number; remaining: number } | null {
  const entry = store[key]
  if (!entry || entry.resetTime < Date.now()) {
    return null
  }
  return {
    count: entry.count,
    resetTime: entry.resetTime,
    remaining: Math.max(0, entry.resetTime - Date.now()),
  }
}
