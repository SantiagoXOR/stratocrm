'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads', label: 'Leads', icon: Users },
]

const navItemConversaciones = {
  label: 'Conversaciones',
  icon: MessageSquare,
}

interface SidebarNavProps {
  onLinkClick?: () => void
  className?: string
}

export function SidebarNav({ onLinkClick, className }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className={cn('flex-1 space-y-1 p-3', className)}>
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + '/')
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onLinkClick}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {item.label}
          </Link>
        )
      })}
      <span
        className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground/60"
        aria-disabled="true"
        title="Próximamente"
      >
        <navItemConversaciones.icon className="h-5 w-5 shrink-0" />
        {navItemConversaciones.label}
      </span>
    </nav>
  )
}
