'use client'

import { useEffect, useState, useRef } from 'react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, isToday, addMonths, subMonths, addWeeks, subWeeks, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, Calendar, List, Pencil, Trash2, Check, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { citasStorage, pacientesStorage } from '@/lib/storage'
import { generarId } from '@/lib/utils'
import type { Cita, EstadoCita, Paciente } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Vista = 'mes' | 'semana' | 'lista'

const ESTADO_STYLE: Record<EstadoCita, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  programada: { label: 'Programada', variant: 'default' },
  realizada: { label: 'Realizada', variant: 'secondary' },
  cancelada: { label: 'Cancelada', variant: 'destructive' },
}

const FORM_EMPTY = {
  paciente_id: '',
  paciente_nombre: '',
  fecha: new Date().toISOString().slice(0, 10),
  hora: '09:00',
  duracion_min: 60,
  motivo: '',
  observaciones: '',
  estado: 'programada' as EstadoCita,
}

export default function AgendaPage() {
  const [citas, setCitas] = useState<Cita[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [vista, setVista] = useState<Vista>('mes')
  const [fechaNav, setFechaNav] = useState(new Date())
  const [diaSeleccionado, setDiaSeleccionado] = useState<Date | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<Cita | null>(null)
  const [form, setForm] = useState(FORM_EMPTY)

  async function recargar() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('citas')
        .select('*')
        .eq('profesional_id', user.id)

      setCitas((data || []) as Cita[])
    } catch (err) {
      console.error('[Load Citas Error]', err)
    }
  }

  useEffect(() => {
    recargar()
    const loadPacientes = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from('pacientes')
          .select('*')
          .eq('profesional_id', user.id)
          .eq('estado', 'activo')

        setPacientes((data || []) as Paciente[])
      } catch (err) {
        console.error('[Load Pacientes Error]', err)
      }
    }
    loadPacientes()
  }, [])

  function openNuevo(fecha?: Date) {
    setEditando(null)
    setForm({ ...FORM_EMPTY, fecha: fecha ? format(fecha, 'yyyy-MM-dd') : new Date().toISOString().slice(0, 10) })
    setDialogOpen(true)
  }

  function openEditar(cita: Cita) {
    setEditando(cita)
    setForm({
      paciente_id: cita.paciente_id,
      paciente_nombre: cita.paciente_nombre,
      fecha: cita.fecha,
      hora: cita.hora,
      duracion_min: cita.duracion_min,
      motivo: cita.motivo,
      observaciones: cita.observaciones,
      estado: cita.estado,
    })
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const citaData = {
        paciente_id: form.paciente_id,
        profesional_id: user.id,
        especialidad: 'nutricion',
        paciente_nombre: form.paciente_nombre,
        fecha: form.fecha,
        hora: form.hora,
        duracion_min: form.duracion_min,
        motivo: form.motivo,
        observaciones: form.observaciones,
        estado: form.estado,
      }

      if (editando) {
        await supabase.from('citas').update(citaData).eq('id', editando.id)
      } else {
        await supabase.from('citas').insert(citaData)
      }
      await recargar()
      setDialogOpen(false)
    } catch (err) {
      console.error('[Save Cita Error]', err)
    }
  }

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar esta cita?')) return
    try {
      await supabase.from('citas').delete().eq('id', id)
      await recargar()
    } catch (err) {
      console.error('[Delete Cita Error]', err)
    }
  }

  async function cambiarEstado(cita: Cita, estado: EstadoCita) {
    try {
      await supabase.from('citas').update({ estado }).eq('id', cita.id)
      await recargar()
    } catch (err) {
      console.error('[Update Cita Error]', err)
    }
  }

  const citasDelDia = (d: Date) => citas.filter(c => c.fecha === format(d, 'yyyy-MM-dd'))

  // ── VISTA MES ──────────────────────────
  function renderMes() {
    const monthStart = startOfMonth(fechaNav)
    const monthEnd = endOfMonth(fechaNav)
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setFechaNav(subMonths(fechaNav, 1))} className="p-1.5 rounded hover:bg-neutral-100 transition-colors">
              <ChevronLeft className="h-4 w-4 text-neutral-600" />
            </button>
            <h2 className="text-base font-semibold text-neutral-900 capitalize">
              {format(fechaNav, 'MMMM yyyy', { locale: es })}
            </h2>
            <button onClick={() => setFechaNav(addMonths(fechaNav, 1))} className="p-1.5 rounded hover:bg-neutral-100 transition-colors">
              <ChevronRight className="h-4 w-4 text-neutral-600" />
            </button>
          </div>
          <button onClick={() => setFechaNav(new Date())} className="text-xs text-emerald-600 hover:underline">Hoy</button>
        </div>

        {/* Grid */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          {/* Headers */}
          <div className="grid grid-cols-7 border-b border-neutral-200">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-neutral-500">{d}</div>
            ))}
          </div>
          {/* Days */}
          <div className="grid grid-cols-7">
            {days.map((day, idx) => {
              const enMes = isSameMonth(day, fechaNav)
              const hoy = isToday(day)
              const seleccionado = diaSeleccionado && isSameDay(day, diaSeleccionado)
              const citasDia = citasDelDia(day)
              return (
                <div
                  key={idx}
                  onClick={() => { setDiaSeleccionado(day); if (citasDia.length === 0) openNuevo(day) }}
                  className={cn(
                    'min-h-[72px] p-1.5 border-b border-r border-neutral-100 cursor-pointer transition-colors',
                    !enMes && 'bg-neutral-50',
                    hoy && 'bg-emerald-50',
                    seleccionado && 'ring-1 ring-inset ring-emerald-400',
                    'hover:bg-neutral-50',
                  )}
                >
                  <div className={cn(
                    'h-6 w-6 flex items-center justify-center rounded-full text-xs font-medium mb-1',
                    hoy ? 'bg-emerald-600 text-white' : enMes ? 'text-neutral-700' : 'text-neutral-300',
                  )}>
                    {format(day, 'd')}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {citasDia.slice(0, 2).map(c => (
                      <div
                        key={c.id}
                        onClick={e => { e.stopPropagation(); openEditar(c) }}
                        className={cn(
                          'text-xs rounded px-1 py-0.5 truncate cursor-pointer',
                          c.estado === 'programada' ? 'bg-emerald-100 text-emerald-800' :
                          c.estado === 'realizada' ? 'bg-neutral-100 text-neutral-600' :
                          'bg-red-100 text-red-700 line-through'
                        )}
                      >
                        {c.hora} {c.paciente_nombre.split(' ')[0]}
                      </div>
                    ))}
                    {citasDia.length > 2 && <div className="text-xs text-neutral-400">+{citasDia.length - 2} más</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Citas del día seleccionado */}
        {diaSeleccionado && citasDelDia(diaSeleccionado).length > 0 && (
          <div>
            <p className="text-sm font-semibold text-neutral-700 mb-2 capitalize">
              {format(diaSeleccionado, "EEEE d 'de' MMMM", { locale: es })}
            </p>
            <div className="flex flex-col gap-2">
              {citasDelDia(diaSeleccionado).map(c => <CitaCard key={c.id} cita={c} onEditar={openEditar} onEliminar={eliminar} onEstado={cambiarEstado} />)}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── VISTA SEMANA ──────────────────────────
  function renderSemana() {
    const weekStart = startOfWeek(fechaNav, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(fechaNav, { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setFechaNav(subWeeks(fechaNav, 1))} className="p-1.5 rounded hover:bg-neutral-100">
              <ChevronLeft className="h-4 w-4 text-neutral-600" />
            </button>
            <span className="text-sm font-semibold text-neutral-900">
              {format(weekStart, "d MMM", { locale: es })} — {format(weekEnd, "d MMM yyyy", { locale: es })}
            </span>
            <button onClick={() => setFechaNav(addWeeks(fechaNav, 1))} className="p-1.5 rounded hover:bg-neutral-100">
              <ChevronRight className="h-4 w-4 text-neutral-600" />
            </button>
          </div>
          <button onClick={() => setFechaNav(new Date())} className="text-xs text-emerald-600 hover:underline">Hoy</button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map(day => {
            const citasDia = citasDelDia(day)
            const hoy = isToday(day)
            return (
              <div key={day.toISOString()} className="flex flex-col gap-1">
                <div className={cn('text-center py-1 rounded-lg text-xs font-medium', hoy ? 'bg-emerald-600 text-white' : 'text-neutral-500')}>
                  <div className="capitalize">{format(day, 'EEE', { locale: es })}</div>
                  <div className="text-base font-bold">{format(day, 'd')}</div>
                </div>
                <div className="flex flex-col gap-1 min-h-[120px] bg-white rounded-lg border border-neutral-100 p-1">
                  {citasDia.map(c => (
                    <button key={c.id} onClick={() => openEditar(c)}
                      className={cn('text-left text-xs rounded px-1.5 py-1 w-full', c.estado === 'programada' ? 'bg-emerald-50 text-emerald-800' : c.estado === 'realizada' ? 'bg-neutral-50 text-neutral-600' : 'bg-red-50 text-red-700 line-through')}>
                      <div className="font-medium">{c.hora}</div>
                      <div className="truncate">{c.paciente_nombre.split(' ')[0]}</div>
                    </button>
                  ))}
                  <button onClick={() => openNuevo(day)} className="text-neutral-200 hover:text-emerald-400 transition-colors w-full flex justify-center pt-1">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── VISTA LISTA ──────────────────────────
  function renderLista() {
    const hoy = format(new Date(), 'yyyy-MM-dd')
    const proximas = citas.filter(c => c.fecha >= hoy && c.estado === 'programada')
    const pasadas = citas.filter(c => c.fecha < hoy || c.estado !== 'programada')

    return (
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Próximas citas ({proximas.length})</p>
          {proximas.length === 0 ? (
            <p className="text-sm text-neutral-400">Sin citas programadas.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {proximas.map(c => <CitaCard key={c.id} cita={c} onEditar={openEditar} onEliminar={eliminar} onEstado={cambiarEstado} />)}
            </div>
          )}
        </div>
        {pasadas.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Historial ({pasadas.length})</p>
            <div className="flex flex-col gap-2">
              {pasadas.slice(0, 10).map(c => <CitaCard key={c.id} cita={c} onEditar={openEditar} onEliminar={eliminar} onEstado={cambiarEstado} />)}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Agenda</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{citas.filter(c => c.estado === 'programada').length} citas programadas</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Vista switcher */}
          <div className="flex rounded-lg border border-neutral-200 overflow-hidden bg-white">
            {([['mes', 'Mes'], ['semana', 'Semana'], ['lista', 'Lista']] as [Vista, string][]).map(([v, l]) => (
              <button key={v} onClick={() => setVista(v)}
                className={cn('px-3 py-1.5 text-xs font-medium transition-colors', vista === v ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-50')}>
                {l}
              </button>
            ))}
          </div>
          <Button onClick={() => openNuevo()} className="gap-1.5">
            <Plus className="h-4 w-4" /> Nueva cita
          </Button>
        </div>
      </div>

      {vista === 'mes' && renderMes()}
      {vista === 'semana' && renderSemana()}
      {vista === 'lista' && renderLista()}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar cita' : 'Nueva cita'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label>Paciente</Label>
              <Select
                value={form.paciente_id}
                onValueChange={v => {
                  const p = pacientes.find(x => x.id === v)
                  setForm(f => ({ ...f, paciente_id: v, paciente_nombre: p?.nombre_completo || '' }))
                }}
              >
                <SelectTrigger><SelectValue placeholder="Seleccionar paciente..." /></SelectTrigger>
                <SelectContent>
                  {pacientes.map(p => <SelectItem key={p.id} value={p.id}>{p.nombre_completo}</SelectItem>)}
                </SelectContent>
              </Select>
              {!form.paciente_id && (
                <Input
                  placeholder="O escribe un nombre directamente..."
                  value={form.paciente_nombre}
                  onChange={e => setForm(f => ({ ...f, paciente_nombre: e.target.value, paciente_id: '' }))}
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5"><Label>Fecha *</Label><Input type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} required /></div>
              <div className="flex flex-col gap-1.5"><Label>Hora *</Label><Input type="time" value={form.hora} onChange={e => setForm(f => ({ ...f, hora: e.target.value }))} required /></div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Duración (minutos)</Label>
              <Select value={String(form.duracion_min)} onValueChange={v => setForm(f => ({ ...f, duracion_min: Number(v) }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[30, 45, 60, 90, 120].map(m => <SelectItem key={m} value={String(m)}>{m} min</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5"><Label>Motivo</Label><Input value={form.motivo} onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))} placeholder="Primera consulta, control..." /></div>
            <div className="flex flex-col gap-1.5"><Label>Observaciones</Label><Textarea value={form.observaciones} onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))} rows={2} /></div>
            {editando && (
              <div className="flex flex-col gap-1.5">
                <Label>Estado</Label>
                <Select value={form.estado} onValueChange={v => setForm(f => ({ ...f, estado: v as EstadoCita }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="programada">Programada</SelectItem>
                    <SelectItem value="realizada">Realizada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">{editando ? 'Guardar' : 'Crear cita'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CitaCard({ cita, onEditar, onEliminar, onEstado }: {
  cita: Cita; onEditar: (c: Cita) => void; onEliminar: (id: string) => void; onEstado: (c: Cita, s: EstadoCita) => void
}) {
  const st = ESTADO_STYLE[cita.estado]
  return (
    <Card>
      <CardContent className="p-4 flex items-start gap-4">
        <div className="text-center shrink-0 w-12">
          <p className="text-lg font-bold text-neutral-900">{cita.hora}</p>
          <p className="text-xs text-neutral-400">{cita.duracion_min}m</p>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-neutral-900">{cita.paciente_nombre || 'Sin paciente'}</p>
            <Badge variant={st.variant} className="text-xs">{st.label}</Badge>
          </div>
          {cita.motivo && <p className="text-xs text-neutral-500 mt-0.5">{cita.motivo}</p>}
          {cita.observaciones && <p className="text-xs text-neutral-400 mt-0.5">{cita.observaciones}</p>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {cita.estado === 'programada' && (
            <button onClick={() => onEstado(cita, 'realizada')} title="Marcar realizada" className="p-1.5 rounded hover:bg-emerald-50 text-neutral-300 hover:text-emerald-600 transition-colors">
              <Check className="h-3.5 w-3.5" />
            </button>
          )}
          {cita.estado === 'programada' && (
            <button onClick={() => onEstado(cita, 'cancelada')} title="Cancelar" className="p-1.5 rounded hover:bg-red-50 text-neutral-300 hover:text-red-500 transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button onClick={() => onEditar(cita)} className="p-1.5 rounded hover:bg-neutral-100 text-neutral-400 transition-colors">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => onEliminar(cita.id)} className="p-1.5 rounded hover:bg-red-50 text-neutral-300 hover:text-red-500 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
