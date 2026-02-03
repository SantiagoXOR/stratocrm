'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Lead } from '@/types/api'
import type { CreateLeadRequest, UpdateLeadRequest } from '@/types/api'
import { leadSchema } from '@/lib/validators'
import type { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const ESTADOS = [
  'NUEVO',
  'EN_REVISION',
  'PREAPROBADO',
  'RECHAZADO',
  'DOC_PENDIENTE',
  'DERIVADO',
] as const

const ORIGENES = [
  'whatsapp',
  'instagram',
  'facebook',
  'comentario',
  'web',
  'ads',
] as const

type LeadFormValues = z.infer<typeof leadSchema>

function toFormValues(lead: Partial<Lead> | CreateLeadRequest | null | undefined): Partial<LeadFormValues> {
  if (!lead) return { estado: 'NUEVO' }
  return {
    nombre: lead.nombre ?? '',
    telefono: lead.telefono ?? '',
    email: lead.email ?? '',
    dni: lead.dni ?? '',
    zona: lead.zona ?? '',
    producto: lead.producto ?? '',
    monto: lead.monto ?? undefined,
    ingresos: lead.ingresos ?? undefined,
    origen: lead.origen ?? undefined,
    estado: lead.estado ?? 'NUEVO',
    notas: lead.notas ?? '',
  }
}

export interface LeadFormProps {
  defaultValues?: Partial<Lead> | CreateLeadRequest | null
  onSubmit: (data: CreateLeadRequest | UpdateLeadRequest) => void
  onCancel?: () => void
  isSubmitting?: boolean
  mode?: 'create' | 'edit'
}

export function LeadForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = 'create',
}: LeadFormProps) {
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: toFormValues(defaultValues ?? null),
  })

  function handleSubmit(values: LeadFormValues) {
    const data: CreateLeadRequest & UpdateLeadRequest = {
      nombre: values.nombre,
      telefono: values.telefono,
      email: values.email && values.email !== '' ? values.email : undefined,
      dni: values.dni && values.dni !== '' ? values.dni : undefined,
      zona: values.zona && values.zona !== '' ? values.zona : undefined,
      producto: values.producto && values.producto !== '' ? values.producto : undefined,
      monto: values.monto != null && values.monto > 0 ? Math.floor(values.monto) : undefined,
      ingresos: values.ingresos != null && values.ingresos > 0 ? Math.floor(values.ingresos) : undefined,
      origen: values.origen ?? undefined,
      estado: values.estado ?? 'NUEVO',
      notas: values.notas && values.notas !== '' ? values.notas : undefined,
    }
    onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Nombre del lead" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="telefono"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input placeholder="Teléfono" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@ejemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dni"
          render={({ field }) => (
            <FormItem>
              <FormLabel>DNI</FormLabel>
              <FormControl>
                <Input placeholder="DNI (opcional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="estado"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? 'NUEVO'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ESTADOS.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="origen"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Origen</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Origen (opcional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ORIGENES.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="zona"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zona</FormLabel>
              <FormControl>
                <Input placeholder="Zona (opcional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="producto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Producto</FormLabel>
              <FormControl>
                <Input placeholder="Producto (opcional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ingresos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ingresos</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  placeholder="Ingresos (opcional)"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const v = e.target.value
                    field.onChange(v === '' ? undefined : Number(v))
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="monto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  placeholder="Monto (opcional)"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const v = e.target.value
                    field.onChange(v === '' ? undefined : Number(v))
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea placeholder="Notas (opcional)" className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : mode === 'create' ? 'Crear' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
