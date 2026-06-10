'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, UserCircle, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { calcularEdad, formatFechaCorta } from '@/lib/utils'
import type { Paciente, EstadoPaciente } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { NuevoPacienteDialog } from '@/components/pacientes/nuevo-paciente-dialog'

const ESTADO_LABEL: Record<EstadoPaciente, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  archivado: 'Archivado',
}

export default function PacientesPage() {
  const router = useRouter()
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [query, setQuery] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<EstadoPaciente | 'todos'>('activo')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function recargar() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        console.warn('No authenticated user')
        return
      }

      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .eq('profesional_id', session.user.id)
        .order('nombre_completo')

      if (error) {
        console.error('[Load Pacientes Error]', error)
        return
      }

      setPacientes(data || [])
    } catch (err) {
      console.error('[Load Error]', err)
    }
  }

  async function eliminarPaciente(pacienteId: string, nombrePaciente: string) {
    if (!confirm(`¿Estás seguro que deseas eliminar a ${nombrePaciente}? Esta acción no se puede deshacer.`)) return

    try {
      const { error } = await supabase
        .from('pacientes')
        .delete()
        .eq('id', pacienteId)

      if (error) throw error
      recargar()
    } catch (err) {
      console.error('[Delete Error]', err)
      setErrorMsg('Error al eliminar paciente')
      setTimeout(() => setErrorMsg(''), 4000)
    }
  }

  useEffect(() => { recargar() }, [])

  const filtrados = useMemo(() => {
    return pacientes.filter(p => {
      const matchQuery = !query ||
        p.nombre_completo.toLowerCase().includes(query.toLowerCase()) ||
        p.rut.includes(query)
      const matchEstado = filtroEstado === 'todos' || p.estado === filtroEstado
      return matchQuery && matchEstado
    }).sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo))
  }, [pacientes, query, filtroEstado])

  const filtros: Array<EstadoPaciente | 'todos'> = ['activo', 'inactivo', 'todos']

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Pacientes</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{pacientes.filter(p => p.estado === 'activo').length} pacientes activos</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo paciente
        </Button>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <span className="text-red-600 text-sm">!</span>
          </div>
          <p className="text-sm text-red-700 flex-1">{errorMsg}</p>
          <button
            onClick={() => setErrorMsg('')}
            className="text-red-600 hover:text-red-700 text-xs font-medium"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Buscar por nombre o RUT..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex rounded-lg border border-neutral-200 overflow-hidden bg-white shrink-0">
          {filtros.map(f => (
            <button
              key={f}
              onClick={() => setFiltroEstado(f)}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                filtroEstado === f
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {f === 'todos' ? 'Todos' : ESTADO_LABEL[f]}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtrados.length === 0 ? (
        <div className="text-center py-16">
          <UserCircle className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500 font-medium">Sin pacientes</p>
          <p className="text-sm text-neutral-400 mt-1">
            {query ? 'No se encontraron coincidencias.' : 'Agrega tu primer paciente.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="divide-y divide-neutral-100">
            {filtrados.map(paciente => (
              <div
                key={paciente.id}
                onClick={() => router.push(`/pacientes/${paciente.id}`)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-neutral-50 transition-colors text-left cursor-pointer"
              >
                {/* Avatar */}
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-emerald-700">
                    {paciente.nombre_completo.split(' ').slice(0, 2).map(n => n[0]).join('')}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900">{paciente.nombre_completo}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-neutral-500">{paciente.rut}</span>
                    <span className="text-neutral-300 text-xs">·</span>
                    <span className="text-xs text-neutral-500">{calcularEdad(paciente.fecha_nacimiento)} años</span>
                    <span className="text-neutral-300 text-xs">·</span>
                    <span className="text-xs text-neutral-500 truncate">{paciente.objetivo}</span>
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-neutral-400 hidden sm:block">
                    Desde {formatFechaCorta(paciente.created_at)}
                  </span>
                  <Badge variant={
                    paciente.estado === 'activo' ? 'default' :
                    paciente.estado === 'inactivo' ? 'secondary' : 'outline'
                  }>
                    {ESTADO_LABEL[paciente.estado]}
                  </Badge>
                  <button
                    onClick={e => { e.stopPropagation(); eliminarPaciente(paciente.id, paciente.nombre_completo) }}
                    className="p-1.5 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Eliminar paciente"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <NuevoPacienteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={() => { recargar(); setDialogOpen(false) }}
      />
    </div>
  )
}
