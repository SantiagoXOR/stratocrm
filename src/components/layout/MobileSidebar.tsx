'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { SidebarNav } from './SidebarNav'

export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Cerrar el Sheet al cambiar de ruta (p. ej. tras clic en un Link)
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menú">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-56 p-0">
        <SheetHeader className="border-b p-4 text-left">
          <SheetTitle asChild>
            <Link href="/dashboard" onClick={() => setOpen(false)}>
              CRM Phorencial
            </Link>
          </SheetTitle>
        </SheetHeader>
        <SidebarNav onLinkClick={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
