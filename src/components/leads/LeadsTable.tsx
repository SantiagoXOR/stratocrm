import Link from 'next/link'
import type { Lead } from '@/types/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface LeadsTableProps {
  leads: Lead[]
  isLoading?: boolean
  onEdit?: (lead: Lead) => void
}

export function LeadsTable({ leads, isLoading, onEdit }: LeadsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead className="w-[140px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={5} className="h-10 animate-pulse bg-muted/50" />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-md border py-12 text-center text-muted-foreground">
        No hay leads para mostrar.
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Origen</TableHead>
            <TableHead className="w-[140px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="font-medium">{lead.nombre}</TableCell>
              <TableCell>{lead.telefono}</TableCell>
              <TableCell>
                <Badge variant="secondary">{lead.estado ?? 'NUEVO'}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {lead.origen ?? '—'}
              </TableCell>
              <TableCell className="flex gap-1">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/leads/${lead.id}`}>Ver</Link>
                </Button>
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(lead)}
                  >
                    Editar
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
