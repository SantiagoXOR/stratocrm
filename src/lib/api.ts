/**
 * Cliente API Interno para Frontend
 * 
 * Abstrae completamente servicios externos y proporciona métodos type-safe
 * para todos los recursos. Maneja autenticación, errores y retry logic.
 */

import type {
  ApiError,
  Lead,
  LeadFilters,
  PaginatedResponse,
  CreateLeadRequest,
  UpdateLeadRequest,
  Conversation,
  Message,
  User,
} from '@/types/api'

// Configuración del cliente
const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || '/api'
const DEFAULT_TIMEOUT = 30000 // 30 segundos
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 segundo

// Tipos de error de red
export class NetworkError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'NetworkError'
  }
}

export class TimeoutError extends Error {
  constructor() {
    super('Request timeout')
    this.name = 'TimeoutError'
  }
}

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized')
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends Error {
  constructor() {
    super('Forbidden')
    this.name = 'ForbiddenError'
  }
}

/**
 * Opciones de request
 */
interface RequestOptions extends RequestInit {
  timeout?: number
  retries?: number
  retryDelay?: number
}

/**
 * Realiza una petición HTTP con retry logic y manejo de errores
 */
async function fetchWithRetry(
  url: string,
  options: RequestOptions = {}
): Promise<Response> {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = MAX_RETRIES,
    retryDelay = RETRY_DELAY,
    ...fetchOptions
  } = options

  // Configurar fetch con timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  // Configurar opciones por defecto
  const defaultOptions: RequestInit = {
    credentials: 'include', // Incluir cookies para autenticación
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
    signal: controller.signal,
  }

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...defaultOptions,
        ...fetchOptions,
        headers: {
          ...defaultOptions.headers,
          ...fetchOptions.headers,
        },
      })

      clearTimeout(timeoutId)

      // Manejar errores de autenticación/autorización (no retry)
      if (response.status === 401) {
        // Redirigir a login si no estamos ya ahí
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/signin')) {
          window.location.href = '/auth/signin'
        }
        throw new UnauthorizedError()
      }

      if (response.status === 403) {
        throw new ForbiddenError()
      }

      // Retry en errores 5xx y errores de red
      if (response.status >= 500 || !response.ok) {
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)))
          continue
        }
      }

      return response
    } catch (error) {
      clearTimeout(timeoutId)

      // No retry en errores de timeout o abort
      if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) {
        throw new TimeoutError()
      }

      // No retry en errores de autenticación
      if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
        throw error
      }

      lastError = error instanceof Error ? error : new Error(String(error))

      // Retry si quedan intentos
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)))
        continue
      }
    }
  }

  throw lastError || new NetworkError('Request failed after retries')
}

/**
 * Parsea respuesta JSON y maneja errores de API
 */
async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json()

  if (!response.ok) {
    const error = data.error as ApiError | undefined
    throw new NetworkError(
      error?.message || 'An error occurred',
      response.status
    )
  }

  // Respuesta exitosa puede tener formato { data: T } o ser T directamente
  return (data.data ?? data) as T
}

/**
 * Cliente API principal
 */
class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  /**
   * Request genérico
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const response = await fetchWithRetry(url, options)
    return parseResponse<T>(response)
  }

  // ==================== LEADS ====================

  /**
   * Obtener lista de leads con filtros y paginación
   */
  async getLeads(filters?: LeadFilters): Promise<PaginatedResponse<Lead>> {
    const params = new URLSearchParams()
    
    if (filters) {
      if (filters.page) params.append('page', String(filters.page))
      if (filters.limit) params.append('limit', String(filters.limit))
      if (filters.estado) params.append('estado', filters.estado)
      if (filters.origen) params.append('origen', filters.origen)
      if (filters.search) params.append('search', filters.search)
      if (filters.fechaDesde) params.append('fechaDesde', filters.fechaDesde)
      if (filters.fechaHasta) params.append('fechaHasta', filters.fechaHasta)
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)
    }

    const query = params.toString()
    return this.request<PaginatedResponse<Lead>>(`/leads${query ? `?${query}` : ''}`)
  }

  /**
   * Obtener un lead por ID
   */
  async getLead(id: string): Promise<Lead> {
    return this.request<Lead>(`/leads/${id}`)
  }

  /**
   * Crear un nuevo lead
   */
  async createLead(data: CreateLeadRequest): Promise<Lead> {
    return this.request<Lead>('/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Actualizar un lead
   */
  async updateLead(id: string, data: UpdateLeadRequest): Promise<Lead> {
    return this.request<Lead>(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * Eliminar un lead
   */
  async deleteLead(id: string): Promise<void> {
    return this.request<void>(`/leads/${id}`, {
      method: 'DELETE',
    })
  }

  // ==================== CONVERSATIONS ====================

  /**
   * Obtener conversaciones de un lead
   */
  async getConversations(leadId: string): Promise<Conversation[]> {
    return this.request<Conversation[]>(`/conversations?leadId=${leadId}`)
  }

  /**
   * Obtener mensajes de una conversación
   */
  async getMessages(conversationId: string): Promise<Message[]> {
    return this.request<Message[]>(`/conversations/${conversationId}/messages`)
  }

  // ==================== USERS ====================

  /**
   * Obtener usuario actual
   */
  async getCurrentUser(): Promise<User> {
    return this.request<User>('/users/me')
  }

  // ==================== HEALTH ====================

  /**
   * Verificar salud de la API
   */
  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health')
  }
}

// Exportar instancia singleton
export const api = new ApiClient()

// Exportar clase para testing
export { ApiClient }
