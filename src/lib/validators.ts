import { z } from 'zod'

export const leadSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  dni: z.string().optional(),
  telefono: z.string().min(1, 'El teléfono es requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  ingresos: z.number().positive().optional(),
  zona: z.string().optional(),
  producto: z.string().optional(),
  monto: z.number().positive().optional(),
  origen: z.enum(['whatsapp', 'instagram', 'facebook', 'comentario', 'web', 'ads']).optional(),
  estado: z.enum(['NUEVO', 'EN_REVISION', 'PREAPROBADO', 'RECHAZADO', 'DOC_PENDIENTE', 'DERIVADO']).default('NUEVO'),
  notas: z.string().optional(),
})

export type LeadInput = z.infer<typeof leadSchema>

export const leadsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  estado: z.enum(['NUEVO', 'EN_REVISION', 'PREAPROBADO', 'RECHAZADO', 'DOC_PENDIENTE', 'DERIVADO']).optional(),
  origen: z.enum(['whatsapp', 'instagram', 'facebook', 'comentario', 'web', 'ads']).optional(),
})

export type LeadsQueryParams = z.infer<typeof leadsQuerySchema>

