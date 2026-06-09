'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, CalendarDays, UserCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
  { href: '/pacientes', icon: Users, label: 'Pacientes' },
  { href: '/agenda', icon: CalendarDays, label: 'Agenda' },
  { href: '/perfil', icon: UserCircle, label: 'Perfil' },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 flex">
      {items.map(item => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link key={item.href} href={item.href}
            className={cn('flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors',
              isActive ? 'text-emerald-600' : 'text-neutral-400 hover:text-neutral-700'
            )}>
            <item.icon className={cn('h-5 w-5', isActive && 'text-emerald-600')} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
