'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, UserCheck, CalendarDays, TrendingUp, ArrowRight, LogOut, CreditCard, Menu } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import { pacientesStorage, consultasStorage, perfilStorage } from '@/lib/storage'
import { formatFechaCorta } from '@/lib/utils'
import type { Paciente, Consulta, PerfilProfesional } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface StatCard {
  label: string
  value: string | number
  icon: React.ElementType
  color: string
  bg: string
}

export default function DashboardPage() {
  const { session, logout } = useAuth()
  const router = useRouter()
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [perfil, setPerfil] = useState<PerfilProfesional | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setPerfil(perfilStorage.get())
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: pacData } = await supabase
          .from('pacientes')
          .select('*')
          .eq('profesional_id', user.id)

        const { data: consulData } = await supabase
          .from('consultas')
          .select('*')

        setPacientes((pacData || []) as Paciente[])
        setConsultas((consulData || []) as Consulta[])
      } catch (err) {
        console.error('[Load Dashboard Error]', err)
      }
    }
    loadData()
  }, [])

  const activos = pacientes.filter(p => p.estado === 'activo').length
  const hoy = new Date().toISOString().slice(0, 10)
  const consultasHoy = consultas.filter(c => c.fecha === hoy).length
  const proximasCitas = consultas.filter(c => c.proxima_cita >= hoy).length

  const stats: StatCard[] = [
    { label: 'Pacientes activos', value: activos, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Consultas registradas', value: consultas.length, icon: CalendarDays, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Consultas hoy', value: consultasHoy, icon: UserCheck, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Próximas citas', value: proximasCitas, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  const pacientesRecientes = [...pacientes]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5)

  const nombreProf = perfil?.nombre ? perfil.nombre.split(' ')[0] : session?.nombre.split(' ')[0]

  return (
    <div className="min-h-screen bg-neutral-50 sm:bg-white">
      {/* Mobile Header */}
      <div className="sm:hidden bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Hola, {nombreProf}</h2>
            <p className="text-xs text-neutral-500">
              {new Date().toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}
            </p>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
            <Menu className="h-5 w-5 text-neutral-600" />
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="border-t border-neutral-200 p-3 flex flex-col gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push('/plan')} className="justify-start gap-2 text-sm">
              <CreditCard className="h-4 w-4" /> Plan
            </Button>
            <Button variant="ghost" size="sm" onClick={logout} className="justify-start gap-2 text-sm text-red-600 hover:text-red-700">
              <LogOut className="h-4 w-4" /> Cerrar sesión
            </Button>
          </div>
        )}
      </div>

      {/* Desktop Content */}
      <div className="p-4 sm:p-8 max-w-5xl mx-auto">
        {/* Header - Desktop only */}
        <div className="hidden sm:block mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Hola, {nombreProf}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-semibold text-neutral-900">{stat.value}</p>
                </div>
                <div className={`${stat.bg} rounded-lg p-2`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pacientes recientes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pacientes recientes</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => router.push('/pacientes')} className="gap-1 text-xs text-neutral-500">
            Ver todos <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {pacientesRecientes.length === 0 ? (
            <div className="px-5 pb-5 text-sm text-neutral-500">No hay pacientes aún.</div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {pacientesRecientes.map(paciente => {
                const consulta = consultasStorage.getByPaciente(paciente.id)[0]
                return (
                  <button
                    key={paciente.id}
                    onClick={() => router.push(`/pacientes/${paciente.id}`)}
                    className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-neutral-50 transition-colors text-left"
                  >
                    <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-emerald-700">
                        {paciente.nombre_completo.split(' ').slice(0, 2).map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">{paciente.nombre_completo}</p>
                      <p className="text-xs text-neutral-500 truncate">{paciente.objetivo}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {consulta && (
                        <span className="text-xs text-neutral-400 hidden sm:block">
                          Último control: {formatFechaCorta(consulta.fecha)}
                        </span>
                      )}
                      <Badge variant={paciente.estado === 'activo' ? 'default' : 'secondary'}>
                        {paciente.estado}
                      </Badge>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
