/**
 * Tipos TypeScript compartidos entre Frontend y Backend
 * 
 * Estos tipos deben estar sincronizados con los schemas Zod en src/lib/validators.ts
 * y con las respuestas de las API routes.
 */

import type { z } from 'zod'
import type { leadSchema } from '@/lib/validators'

// Tipos inferidos desde schemas Zod
export type LeadInput = z.infer<typeof leadSchema>
export type Lead = LeadInput & {
  id: string
  createdAt: Date
  updatedAt: Date
}

// Tipos de respuesta API estándar
export interface ApiError {
  code: string
  message: string
  details?: unknown
}

export interface ApiSuccess<T> {
  data: T
  message?: string
}

export type ApiResponse<T> = ApiSuccess<T> | { error: ApiError }

// Tipos de estado comunes
export type LeadEstado = 'NUEVO' | 'EN_REVISION' | 'PREAPROBADO' | 'RECHAZADO' | 'DOC_PENDIENTE' | 'DERIVADO'
export type LeadOrigen = 'whatsapp' | 'instagram' | 'facebook' | 'comentario' | 'web' | 'ads'

// Tipos de paginación
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Tipos de filtros comunes
export interface LeadFilters extends PaginationParams {
  estado?: LeadEstado
  origen?: LeadOrigen
  search?: string // Búsqueda en nombre, email, teléfono
  fechaDesde?: string
  fechaHasta?: string
}

// Tipos de request/response para endpoints específicos
export interface CreateLeadRequest {
  nombre: string
  dni?: string
  telefono: string
  email?: string
  ingresos?: number
  zona?: string
  producto?: string
  monto?: number
  origen?: LeadOrigen
  estado?: LeadEstado
  notas?: string
}

export interface UpdateLeadRequest {
  nombre?: string
  dni?: string
  telefono?: string
  email?: string
  ingresos?: number
  zona?: string
  producto?: string
  monto?: number
  origen?: LeadOrigen
  estado?: LeadEstado
  notas?: string
}

// Tipos para conversaciones
export interface Conversation {
  id: string
  leadId?: string
  platform: string
  platformId: string
  status: string
  assignedTo?: string
  lastMessageAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  conversationId: string
  direction: 'inbound' | 'outbound'
  content: string
  mediaUrl?: string
  messageType: string
  sentAt: Date
  readAt?: Date
  deliveredAt?: Date
}

// Tipos para usuarios
export interface User {
  id: string
  nombre: string
  email: string
  rol: string
  createdAt: Date
}

// Tipos para tenant (preparado para futura implementación)
export interface Tenant {
  id: string
  nombre: string
  // Agregar más campos cuando se implemente el modelo Tenant
}

// Tipos de error específicos
export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_SERVER_ERROR'

// Helper type para extraer tipo de datos de ApiResponse
export type ExtractApiData<T> = T extends ApiResponse<infer U> ? U : never
