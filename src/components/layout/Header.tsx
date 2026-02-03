import { cn } from '@/lib/utils'

interface HeaderProps {
  title?: string
  /** Contenido a la izquierda (ej. botón menú móvil). Solo visible en móvil con md:hidden. */
  leftSlot?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export function Header({ title, leftSlot, children, className }: HeaderProps) {
  return (
    <header
      className={cn(
        'flex h-16 shrink-0 items-center gap-4 border-b bg-card px-4 md:px-6',
        className
      )}
    >
      {leftSlot && <div className="md:hidden">{leftSlot}</div>}
      {title && <h2 className="text-lg font-semibold">{title}</h2>}
      <div className="flex-1" />
      <div className="flex items-center gap-4">{children}</div>
    </header>
  )
}
