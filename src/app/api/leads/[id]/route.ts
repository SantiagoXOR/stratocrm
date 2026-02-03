import { NextRequest } from 'next/server'
import {
  withAuth,
  successResponse,
  handleApiError,
  validateRequest,
  getRouteParams,
} from '@/lib/api-helpers'
import { updateLeadSchema } from '@/lib/validators'
import { logger } from '@/lib/logger'
import { rateLimitByIp } from '@/lib/rate-limit'
import { db } from '@/lib/db'

const rateLimit = rateLimitByIp(200, 60000) // 200 req/min por IP

// GET /api/leads/:id - Obtener lead por id
export const GET = withAuth(
  async (
    request: NextRequest,
    session,
    context?: { params?: { id: string } }
  ) => {
    const rateLimitResponse = await rateLimit(request)
    if (rateLimitResponse) return rateLimitResponse

    try {
      const { id } = getRouteParams<{ id: string }>(context ?? {})

      const lead = await db.lead.findUnique({
        where: { id },
      })

      if (!lead) {
        throw new Error('Not found: Lead no encontrado')
      }

      logger.info('Lead retrieved', {
        leadId: id,
        userId: session.user.id,
      })

      return successResponse(lead)
    } catch (error) {
      return handleApiError(error, { userId: session.user.id })
    }
  }
)

// PUT /api/leads/:id - Actualizar lead (parcial)
export const PUT = withAuth(
  async (
    request: NextRequest,
    session,
    context?: { params?: { id: string } }
  ) => {
    const rateLimitResponse = await rateLimit(request)
    if (rateLimitResponse) return rateLimitResponse

    try {
      const { id } = getRouteParams<{ id: string }>(context ?? {})
      const body = await request.json()
      const validated = validateRequest(updateLeadSchema, body)

      const existing = await db.lead.findUnique({
        where: { id },
      })

      if (!existing) {
        throw new Error('Not found: Lead no encontrado')
      }

      const data: Record<string, unknown> = {}
      if (validated.nombre !== undefined) data.nombre = validated.nombre
      if (validated.telefono !== undefined) data.telefono = validated.telefono
      if (validated.email !== undefined)
        data.email =
          validated.email && validated.email !== '' ? validated.email : null
      if (validated.dni !== undefined) data.dni = validated.dni || null
      if (validated.ingresos !== undefined)
        data.ingresos =
          validated.ingresos != null ? Math.floor(validated.ingresos) : null
      if (validated.monto !== undefined)
        data.monto =
          validated.monto != null ? Math.floor(validated.monto) : null
      if (validated.zona !== undefined) data.zona = validated.zona || null
      if (validated.producto !== undefined)
        data.producto = validated.producto || null
      if (validated.origen !== undefined)
        data.origen = validated.origen || null
      if (validated.estado !== undefined) data.estado = validated.estado
      if (validated.notas !== undefined) data.notas = validated.notas || null

      const updated = await db.lead.update({
        where: { id },
        data,
      })

      logger.info('Lead updated', {
        leadId: id,
        userId: session.user.id,
      })

      return successResponse(updated)
    } catch (error) {
      return handleApiError(error, { userId: session.user.id })
    }
  }
)

// DELETE /api/leads/:id - Eliminar lead
export const DELETE = withAuth(
  async (
    request: NextRequest,
    session,
    context?: { params?: { id: string } }
  ) => {
    const rateLimitResponse = await rateLimit(request)
    if (rateLimitResponse) return rateLimitResponse

    try {
      const { id } = getRouteParams<{ id: string }>(context ?? {})

      const existing = await db.lead.findUnique({
        where: { id },
      })

      if (!existing) {
        throw new Error('Not found: Lead no encontrado')
      }

      await db.lead.delete({
        where: { id },
      })

      logger.info('Lead deleted', {
        leadId: id,
        userId: session.user.id,
      })

      return successResponse(null, 204)
    } catch (error) {
      return handleApiError(error, { userId: session.user.id })
    }
  }
)
