import { NextRequest } from 'next/server'
import {
  withAuth,
  successResponse,
  handleApiError,
  validateRequest,
  validateQuery,
} from '@/lib/api-helpers'
import { leadSchema, leadsQuerySchema } from '@/lib/validators'
import { logger } from '@/lib/logger'
import { rateLimitByIp } from '@/lib/rate-limit'
import { db } from '@/lib/db'

const rateLimit = rateLimitByIp(200, 60000) // 200 req/min por IP

// GET /api/leads - Listar leads con paginación y filtros
export const GET = withAuth(async (request: NextRequest, session) => {
  const rateLimitResponse = await rateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const params = validateQuery(leadsQuerySchema, request)

    const where = {
      ...(params.estado && { estado: params.estado }),
      ...(params.origen && { origen: params.origen }),
    }

    const [leads, total] = await Promise.all([
      db.lead.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.lead.count({ where }),
    ])

    logger.info('Leads retrieved', {
      userId: session.user.id,
      count: leads.length,
      total,
    })

    return successResponse({
      data: leads,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    })
  } catch (error) {
    return handleApiError(error, { userId: session.user.id })
  }
})

// POST /api/leads - Crear lead
export const POST = withAuth(async (request: NextRequest, session) => {
  const rateLimitResponse = await rateLimit(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const validated = validateRequest(leadSchema, body)

    const toCreate = {
      nombre: validated.nombre,
      telefono: validated.telefono,
      email: validated.email && validated.email !== '' ? validated.email : null,
      dni: validated.dni || null,
      ingresos: validated.ingresos != null ? Math.floor(validated.ingresos) : null,
      monto: validated.monto != null ? Math.floor(validated.monto) : null,
      zona: validated.zona || null,
      producto: validated.producto || null,
      origen: validated.origen || null,
      estado: validated.estado ?? 'NUEVO',
      notas: validated.notas || null,
    }

    const lead = await db.lead.create({
      data: toCreate,
    })

    logger.info('Lead created', {
      leadId: lead.id,
      userId: session.user.id,
    })

    return successResponse(lead, 201, 'Lead creado exitosamente')
  } catch (error) {
    return handleApiError(error, { userId: session.user.id })
  }
})
