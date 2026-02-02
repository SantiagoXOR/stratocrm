/**
 * Hooks para usar el cliente API con React Query
 * 
 * Proporciona hooks type-safe para todas las operaciones API
 * con caching, refetching y manejo de estado automático.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  LeadFilters,
  CreateLeadRequest,
  UpdateLeadRequest,
} from '@/types/api'

// Query keys
export const queryKeys = {
  leads: {
    all: ['leads'] as const,
    lists: () => [...queryKeys.leads.all, 'list'] as const,
    list: (filters?: LeadFilters) => [...queryKeys.leads.lists(), filters] as const,
    details: () => [...queryKeys.leads.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.leads.details(), id] as const,
  },
  conversations: {
    all: ['conversations'] as const,
    byLead: (leadId: string) => [...queryKeys.conversations.all, 'lead', leadId] as const,
    messages: (conversationId: string) => [...queryKeys.conversations.all, 'messages', conversationId] as const,
  },
  users: {
    current: ['users', 'current'] as const,
  },
} as const

// ==================== LEADS ====================

/**
 * Hook para obtener lista de leads
 */
export function useLeads(filters?: LeadFilters) {
  return useQuery({
    queryKey: queryKeys.leads.list(filters),
    queryFn: () => api.getLeads(filters),
  })
}

/**
 * Hook para obtener un lead por ID
 */
export function useLead(id: string | null) {
  return useQuery({
    queryKey: queryKeys.leads.detail(id ?? ''),
    queryFn: () => api.getLead(id!),
    enabled: !!id,
  })
}

/**
 * Hook para crear un lead
 */
export function useCreateLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateLeadRequest) => api.createLead(data),
    onSuccess: () => {
      // Invalidar lista de leads para refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.lists() })
    },
  })
}

/**
 * Hook para actualizar un lead
 */
export function useUpdateLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadRequest }) =>
      api.updateLead(id, data),
    onSuccess: (_, variables) => {
      // Invalidar lead específico y lista
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.lists() })
    },
  })
}

/**
 * Hook para eliminar un lead
 */
export function useDeleteLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.deleteLead(id),
    onSuccess: (_, id) => {
      // Invalidar lead específico y lista
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.lists() })
    },
  })
}

// ==================== CONVERSATIONS ====================

/**
 * Hook para obtener conversaciones de un lead
 */
export function useConversations(leadId: string | null) {
  return useQuery({
    queryKey: queryKeys.conversations.byLead(leadId ?? ''),
    queryFn: () => api.getConversations(leadId!),
    enabled: !!leadId,
  })
}

/**
 * Hook para obtener mensajes de una conversación
 */
export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: queryKeys.conversations.messages(conversationId ?? ''),
    queryFn: () => api.getMessages(conversationId!),
    enabled: !!conversationId,
  })
}

// ==================== USERS ====================

/**
 * Hook para obtener usuario actual
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.users.current,
    queryFn: () => api.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutos (los datos de usuario cambian poco)
  })
}
