'use client'

import { useEffect, useState } from 'react'
import { Plus, Utensils, Pencil, Trash2, CheckCircle, Download, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { minutasStorage, suplementosStorage, perfilStorage, pacientesStorage } from '@/lib/storage'
import { generarId, formatFechaCorta } from '@/lib/utils'
import { generarPDFMinuta } from '@/lib/pdf'
import type { Minuta, Suplemento, MinutaEstructurada, ComidaDia } from '@/lib/types'
import { MINUTA_VACIA } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Props { pacienteId: string }

const DIAS: Array<{ key: keyof Omit<MinutaEstructurada, 'suplementacion' | 'indicaciones'>; label: string }> = [
  { key: 'lunes', label: 'Lunes' },
  { key: 'martes', label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves', label: 'Jueves' },
  { key: 'viernes', label: 'Viernes' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
]

const COMIDAS: Array<{ key: keyof ComidaDia; label: string; placeholder: string }> = [
  { key: 'desayuno', label: 'Desayuno', placeholder: 'Ej: Avena con leche, 1 huevo, fruta...' },
  { key: 'colacion_am', label: 'Colación AM', placeholder: 'Ej: Yogur natural, nueces...' },
  { key: 'almuerzo', label: 'Almuerzo', placeholder: 'Ej: 120g pollo, arroz integral, ensalada...' },
  { key: 'colacion_pm', label: 'Colación PM', placeholder: 'Ej: Fruta, barrita...' },
  { key: 'cena', label: 'Cena', placeholder: 'Ej: Sopa de verduras, proteína...' },
  { key: 'cena_tardia', label: 'Once / Cena tardía', placeholder: 'Opcional...' },
]

export function FichaMinutas({ pacienteId }: Props) {
  const [minutas, setMinutas] = useState<Minuta[]>([])
  const [suplementos, setSuplementos] = useState<Suplemento[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<Minuta | null>(null)
  const [expandidoId, setExpandidoId] = useState<string | null>(null)
  const [diasExpandidos, setDiasExpandidos] = useState<Set<string>>(new Set(['lunes']))

  const [form, setForm] = useState<{
    titulo: string; fecha_inicio: string; fecha_fin: string; activa: boolean; estructura: MinutaEstructurada
  }>({
    titulo: '', fecha_inicio: new Date().toISOString().slice(0, 10),
    fecha_fin: '', activa: true, estructura: deepCopy(MINUTA_VACIA),
  })

  function deepCopy<T>(obj: T): T { return JSON.parse(JSON.stringify(obj)) }

  async function recargar() {
    try {
      const { data: planData } = await supabase
        .from('planes')
        .select('*')
        .eq('paciente_id', pacienteId)
        .eq('especialidad', 'nutricion')
        .order('fecha_inicio', { ascending: false })

      let supData: Suplemento[] = []
      try {
        const { data } = await supabase
          .from('suplementos')
          .select('*')
          .eq('paciente_id', pacienteId)
        supData = (data || []) as Suplemento[]
      } catch (err) {
        console.error('[Load Suplementos Error]', err)
      }

      const minutas = (planData as any[] || []).map(p => ({
        ...p,
        titulo: p.titulo || 'Sin título',
        estructura: p.estructura || MINUTA_VACIA,
      })) as Minuta[]
      setMinutas(minutas)
      setSuplementos(supData)
    } catch (err) {
      console.error('[Load Minutas Error]', err)
    }
  }

  useEffect(() => {
    recargar()
  }, [pacienteId])

  function openNuevo() {
    setEditando(null)
    setForm({ titulo: '', fecha_inicio: new Date().toISOString().slice(0, 10), fecha_fin: '', activa: true, estructura: deepCopy(MINUTA_VACIA) })
    setDiasExpandidos(new Set(['lunes']))
    setDialogOpen(true)
  }

  function openEditar(m: Minuta) {
    setEditando(m)
    setForm({
      titulo: m.titulo, fecha_inicio: m.fecha_inicio, fecha_fin: m.fecha_fin, activa: m.activa,
      estructura: m.estructura ? deepCopy(m.estructura) : deepCopy(MINUTA_VACIA),
    })
    setDiasExpandidos(new Set(['lunes']))
    setDialogOpen(true)
  }

  function updateComida(dia: keyof Omit<MinutaEstructurada, 'suplementacion' | 'indicaciones'>, comida: keyof ComidaDia, value: string) {
    setForm(f => ({
      ...f,
      estructura: { ...f.estructura, [dia]: { ...(f.estructura[dia] as ComidaDia), [comida]: value } },
    }))
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!form.titulo) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('User not authenticated')
        return
      }

      if (form.activa) {
        // Desactivar otras minutas activas
        await Promise.all(minutas
          .filter(m => m.id !== editando?.id && m.activa)
          .map(m => supabase.from('planes').update({ activo: false }).eq('id', m.id)))
      }
      const planData = {
        paciente_id: pacienteId,
        profesional_id: user.id,
        especialidad: 'nutricion',
        fecha_inicio: form.fecha_inicio || null,
        fecha_fin: form.fecha_fin || null,
        estructura: form.estructura,
        activo: form.activa,
      }
      if (editando) {
        await supabase.from('planes').update(planData).eq('id', editando.id)
      } else {
        await supabase.from('planes').insert(planData)
      }
      await recargar()
      setDialogOpen(false)
    } catch (err) {
      console.error('[Save Minuta Error]', err)
    }
  }

  function descargarPDF(minuta: Minuta) {
    const paciente = pacientesStorage.getById(pacienteId)
    if (!paciente) return
    const perfil = perfilStorage.get()
    generarPDFMinuta(paciente, minuta, suplementos.filter(s => s.activo), perfil)
  }

  const minutaActiva = minutas.find(m => m.activa)
  const minutasAnteriores = minutas.filter(m => !m.activa)

  function toggleDia(dia: string) {
    setDiasExpandidos(prev => {
      const next = new Set(prev)
      if (next.has(dia)) next.delete(dia); else next.add(dia)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Minutas y Suplementación</h2>
          <p className="text-sm text-neutral-500 mt-0.5">{minutas.length} plan(es) registrado(s)</p>
        </div>
        <Button onClick={openNuevo} className="gap-2">
          <Plus className="h-4 w-4" /> Nuevo plan
        </Button>
      </div>

      {/* Plan activo */}
      {minutaActiva ? (
        <Card className="ring-1 ring-emerald-200">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <CardTitle>{minutaActiva.titulo}</CardTitle>
                <Badge variant="default">Activo</Badge>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Desde {formatFechaCorta(minutaActiva.fecha_inicio)}
                {minutaActiva.fecha_fin ? ` hasta ${formatFechaCorta(minutaActiva.fecha_fin)}` : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => descargarPDF(minutaActiva)} className="gap-1.5">
                <Download className="h-3.5 w-3.5" /> PDF
              </Button>
              <Button variant="ghost" size="sm" onClick={() => openEditar(minutaActiva)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <MinutaViewer minuta={minutaActiva} />

            {/* Suplementación activa */}
            {suplementos.filter(s => s.activo).length > 0 && (
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Suplementación activa</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suplementos.filter(s => s.activo).map(s => (
                    <div key={s.id} className="bg-neutral-50 rounded-lg p-3">
                      <p className="text-sm font-semibold text-neutral-900">{s.nombre}</p>
                      <p className="text-xs text-neutral-500">{s.dosis} · {s.frecuencia}</p>
                      {s.instrucciones && <p className="text-xs text-neutral-400 mt-0.5">{s.instrucciones}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        minutas.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Utensils className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500 font-medium">Sin planes alimentarios</p>
              <p className="text-sm text-neutral-400 mt-1">Crea el primer plan para este paciente.</p>
            </CardContent>
          </Card>
        )
      )}

      {/* Planes anteriores */}
      {minutasAnteriores.length > 0 && (
        <div>
          <p className="text-sm font-medium text-neutral-500 mb-3">Planes anteriores</p>
          <div className="flex flex-col gap-2">
            {minutasAnteriores.map(m => (
              <Card key={m.id}>
                <button className="w-full flex items-center justify-between p-4 text-left" onClick={() => setExpandidoId(expandidoId === m.id ? null : m.id)}>
                  <div>
                    <p className="text-sm font-medium text-neutral-700">{m.titulo}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{formatFechaCorta(m.fecha_inicio)}{m.fecha_fin ? ` — ${formatFechaCorta(m.fecha_fin)}` : ''}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); descargarPDF(m) }} className="gap-1">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); openEditar(m) }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); if (confirm('¿Eliminar?')) { (async () => { try { await supabase.from('planes').delete().eq('id', m.id); await recargar() } catch (err) { console.error('[Delete Error]', err) } })() } }} className="text-red-400 hover:text-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </button>
                {expandidoId === m.id && (
                  <div className="border-t border-neutral-100 px-4 pb-4">
                    <MinutaViewer minuta={m} />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Dialog editor */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar plan alimentario' : 'Nuevo plan alimentario'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2">
            {/* Info básica */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label>Título del plan *</Label>
                <Input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Plan Déficit Calórico — Marzo 2026" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Fecha inicio</Label>
                <Input type="date" value={form.fecha_inicio} onChange={e => setForm(f => ({ ...f, fecha_inicio: e.target.value }))} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Fecha fin (opcional)</Label>
                <Input type="date" value={form.fecha_fin} onChange={e => setForm(f => ({ ...f, fecha_fin: e.target.value }))} />
              </div>
            </div>

            {/* Editor por día */}
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-neutral-700">Plan semanal</p>
              {DIAS.map(({ key, label }) => (
                <div key={key} className="border border-neutral-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50 hover:bg-neutral-100 transition-colors"
                    onClick={() => toggleDia(key)}
                  >
                    <span className="text-sm font-semibold text-neutral-800">{label}</span>
                    {diasExpandidos.has(key) ? <ChevronUp className="h-4 w-4 text-neutral-400" /> : <ChevronDown className="h-4 w-4 text-neutral-400" />}
                  </button>
                  {diasExpandidos.has(key) && (
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {COMIDAS.map(({ key: comidaKey, label: comidaLabel, placeholder }) => (
                        <div key={comidaKey} className="flex flex-col gap-1">
                          <Label className="text-xs">{comidaLabel}</Label>
                          <Textarea
                            value={(form.estructura[key] as ComidaDia)[comidaKey]}
                            onChange={e => updateComida(key, comidaKey, e.target.value)}
                            placeholder={placeholder}
                            rows={2}
                            className="text-sm resize-none"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Suplementación */}
            <div className="flex flex-col gap-1.5">
              <Label>Suplementación</Label>
              <Textarea
                value={form.estructura.suplementacion}
                onChange={e => setForm(f => ({ ...f, estructura: { ...f.estructura, suplementacion: e.target.value } }))}
                placeholder="Omega-3 2g al día con el almuerzo, Vitamina D3 2.000 UI..."
                rows={3}
              />
            </div>

            {/* Indicaciones */}
            <div className="flex flex-col gap-1.5">
              <Label>Indicaciones adicionales</Label>
              <Textarea
                value={form.estructura.indicaciones}
                onChange={e => setForm(f => ({ ...f, estructura: { ...f.estructura, indicaciones: e.target.value } }))}
                placeholder="Tomar 2L de agua al día, evitar alcohol, respetar horarios de comida..."
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="activa" checked={form.activa} onChange={e => setForm(f => ({ ...f, activa: e.target.checked }))} className="accent-emerald-600" />
              <Label htmlFor="activa">Marcar como plan activo</Label>
            </div>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">{editando ? 'Guardar cambios' : 'Crear plan'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MinutaViewer({ minuta }: { minuta: Minuta }) {
  const [diasExpandidos, setDiasExpandidos] = useState<Set<string>>(new Set(['lunes']))

  if (!minuta.estructura || !Object.values(minuta.estructura).some(v => typeof v === 'object' ? Object.values(v as Record<string, string>).some(s => s) : v)) {
    return <p className="text-sm text-neutral-400 italic">Sin contenido.</p>
  }

  return (
    <div className="flex flex-col gap-2 mt-2">
      {DIAS.map(({ key, label }) => {
        const dia = minuta.estructura![key] as ComidaDia
        const hasContent = Object.values(dia).some(v => v.trim())
        if (!hasContent) return null
        const expanded = diasExpandidos.has(key)
        return (
          <div key={key} className="border border-neutral-100 rounded-lg overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-3 py-2 bg-neutral-50/80 text-left"
              onClick={() => setDiasExpandidos(prev => { const n = new Set(prev); if (n.has(key)) n.delete(key); else n.add(key); return n })}
            >
              <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">{label}</span>
              {expanded ? <ChevronUp className="h-3 w-3 text-neutral-400" /> : <ChevronDown className="h-3 w-3 text-neutral-400" />}
            </button>
            {expanded && (
              <div className="px-3 py-2 flex flex-col gap-1.5">
                {COMIDAS.map(({ key: ck, label: cl }) => {
                  if (!dia[ck]) return null
                  return (
                    <div key={ck} className="grid grid-cols-[90px,1fr] gap-2 text-sm">
                      <span className="text-xs font-medium text-neutral-500 pt-0.5">{cl}</span>
                      <span className="text-neutral-800">{dia[ck]}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
      {minuta.estructura!.indicaciones && (
        <div className="mt-2 p-3 bg-amber-50 rounded-lg">
          <p className="text-xs font-semibold text-amber-700 mb-1">Indicaciones adicionales</p>
          <p className="text-sm text-amber-800">{minuta.estructura!.indicaciones}</p>
        </div>
      )}
    </div>
  )
}
