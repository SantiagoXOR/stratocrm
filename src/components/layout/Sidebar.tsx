'use client'

import Link from 'next/link'
import { SidebarNav } from './SidebarNav'

export function Sidebar() {
  return (
    <aside className="hidden h-full w-56 flex-col border-r bg-card md:flex">
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="text-lg">CRM Phorencial</span>
        </Link>
      </div>
      <SidebarNav />
    </aside>
  )
}
