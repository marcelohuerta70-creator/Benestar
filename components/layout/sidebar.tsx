'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, CalendarDays, LogOut, UserCircle, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/pacientes', icon: Users, label: 'Pacientes' },
  { href: '/agenda', icon: CalendarDays, label: 'Agenda' },
  { href: '/perfil', icon: UserCircle, label: 'Perfil Profesional' },
  { href: '/plan', icon: CreditCard, label: 'Plan' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { session, logout } = useAuth()

  const initials = session?.nombre
    .split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'N'

  return (
    <aside className="hidden sm:flex w-56 shrink-0 h-full bg-neutral-900 flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-neutral-800">
        <Image src="/logo-benestar.png" alt="Benestar" width={64} height={64} className="rounded-lg shrink-0" />
        <span className="text-base font-semibold text-white tracking-tight">Benestar</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-neutral-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback className="text-xs bg-emerald-700 text-white">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{session?.nombre}</p>
            <p className="text-xs text-neutral-500 truncate capitalize">{session?.plan}</p>
          </div>
          <button onClick={logout} title="Cerrar sesión" className="text-neutral-500 hover:text-white transition-colors shrink-0">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
