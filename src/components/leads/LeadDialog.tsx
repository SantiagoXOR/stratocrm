'use client'

import type { Lead } from '@/types/api'
import type { CreateLeadRequest, UpdateLeadRequest } from '@/types/api'
import { useCreateLead, useUpdateLead } from '@/hooks/use-api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LeadForm } from './LeadForm'

export interface LeadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  initialLead?: Lead | null
}

export function LeadDialog({
  open,
  onOpenChange,
  mode,
  initialLead = null,
}: LeadDialogProps) {
  const createLead = useCreateLead()
  const updateLead = useUpdateLead()

  const isPending = createLead.isPending || updateLead.isPending
  const error = createLead.error ?? updateLead.error

  async function handleSubmit(data: CreateLeadRequest | UpdateLeadRequest) {
    try {
      if (mode === 'create') {
        await createLead.mutateAsync(data as CreateLeadRequest)
      } else if (initialLead?.id) {
        await updateLead.mutateAsync({
          id: initialLead.id,
          data: data as UpdateLeadRequest,
        })
      }
      onOpenChange(false)
    } catch {
      // Error is shown via error state below
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Nuevo lead' : 'Editar lead'}</DialogTitle>
        </DialogHeader>
        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error instanceof Error ? error.message : 'Error al guardar el lead.'}
          </div>
        )}
        <LeadForm
          defaultValues={mode === 'edit' ? initialLead ?? undefined : undefined}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isPending}
          mode={mode}
        />
      </DialogContent>
    </Dialog>
  )
}
