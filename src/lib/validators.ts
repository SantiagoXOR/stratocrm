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

