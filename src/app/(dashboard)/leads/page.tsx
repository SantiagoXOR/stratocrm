'use client'

import { useState } from 'react'
import type { Lead } from '@/types/api'
import { useLeads } from '@/hooks/use-api'
import { LeadsTable } from '@/components/leads/LeadsTable'
import { LeadDialog } from '@/components/leads/LeadDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const DEFAULT_LIMIT = 10

export default function LeadsPage() {
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const { data, isLoading, isError, error } = useLeads({ page, limit: DEFAULT_LIMIT })

  const pagination = data?.pagination
  const totalPages = pagination?.totalPages ?? 0
  const total = pagination?.total ?? 0
  const from = total === 0 ? 0 : (page - 1) * DEFAULT_LIMIT + 1
  const to = Math.min(page * DEFAULT_LIMIT, total)

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Leads</h1>
      <p className="mb-6 text-muted-foreground">
        Listado de leads con paginación
      </p>

      <LeadDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setSelectedLead(null)
        }}
        mode={dialogMode}
        initialLead={selectedLead}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Listado de leads</CardTitle>
          <Button
            onClick={() => {
              setDialogMode('create')
              setSelectedLead(null)
              setDialogOpen(true)
            }}
          >
            Nuevo lead
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {isError && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error instanceof Error ? error.message : 'Error al cargar los leads.'}
            </div>
          )}

          <LeadsTable
            leads={data?.data ?? []}
            isLoading={isLoading}
            onEdit={(lead) => {
              setSelectedLead(lead)
              setDialogMode('edit')
              setDialogOpen(true)
            }}
          />

          {!isError && pagination && totalPages > 0 && (
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                Mostrando {from}–{to} de {total} resultados
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
