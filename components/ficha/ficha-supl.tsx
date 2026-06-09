'use client'

import { useEffect, useState } from 'react'
import { Plus, Pill, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { suplementosStorage } from '@/lib/storage'
import { generarId, formatFechaCorta } from '@/lib/utils'
import type { Suplemento } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Props { pacienteId: string }

const EMPTY = {
  nombre: '',
  dosis: '',
  frecuencia: '',
  instrucciones: '',
  activo: true,
  fecha_inicio: new Date().toISOString().slice(0, 10),
}

export function FichaSupl({ pacienteId }: Props) {
  const [suplementos, setSuplementos] = useState<Suplemento[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<Suplemento | null>(null)
  const [form, setForm] = useState(EMPTY)

  function recargar() { setSuplementos(suplementosStorage.getByPaciente(pacienteId)) }
  useEffect(() => { recargar() }, [pacienteId])

  function openNuevo() { setEditando(null); setForm(EMPTY); setDialogOpen(true) }
  function openEditar(s: Suplemento) {
    setEditando(s)
    setForm({ nombre: s.nombre, dosis: s.dosis, frecuencia: s.frecuencia, instrucciones: s.instrucciones, activo: s.activo, fecha_inicio: s.fecha_inicio })
    setDialogOpen(true)
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!form.nombre || !form.dosis) return
    const item: Suplemento = {
      id: editando?.id || generarId(),
      paciente_id: pacienteId,
      ...form,
      created_at: editando?.created_at || new Date().toISOString(),
    }
    suplementosStorage.save(item)
    recargar()
    setDialogOpen(false)
  }

  const activos = suplementos.filter(s => s.activo)
  const inactivos = suplementos.filter(s => !s.activo)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Suplementación</h2>
          <p className="text-sm text-neutral-500 mt-0.5">{activos.length} {activos.length === 1 ? 'suplemento activo' : 'suplementos activos'}</p>
        </div>
        <Button onClick={openNuevo} className="gap-2">
          <Plus className="h-4 w-4" /> Agregar suplemento
        </Button>
      </div>

      {suplementos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Pill className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500 font-medium">Sin suplementos registrados</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Activos */}
          {activos.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <p className="text-sm font-medium text-emerald-700">Suplementos activos</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activos.map(s => (
                  <SuplementoCard
                    key={s.id}
                    suplemento={s}
                    onEditar={openEditar}
                    onEliminar={() => { if (confirm('¿Eliminar?')) { suplementosStorage.delete(s.id); recargar() } }}
                    onToggle={() => { suplementosStorage.save({ ...s, activo: !s.activo }); recargar() }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Inactivos */}
          {inactivos.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="h-4 w-4 text-neutral-400" />
                <p className="text-sm font-medium text-neutral-500">Historial</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {inactivos.map(s => (
                  <SuplementoCard
                    key={s.id}
                    suplemento={s}
                    onEditar={openEditar}
                    onEliminar={() => { if (confirm('¿Eliminar?')) { suplementosStorage.delete(s.id); recargar() } }}
                    onToggle={() => { suplementosStorage.save({ ...s, activo: !s.activo }); recargar() }}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar suplemento' : 'Agregar suplemento'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label>Suplemento *</Label>
              <Input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Omega-3, Vitamina D3, Creatina..." required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Dosis *</Label>
                <Input value={form.dosis} onChange={e => setForm(f => ({ ...f, dosis: e.target.value }))} placeholder="2g, 2.000 UI, 5g" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Fecha inicio</Label>
                <Input type="date" value={form.fecha_inicio} onChange={e => setForm(f => ({ ...f, fecha_inicio: e.target.value }))} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Frecuencia</Label>
              <Input value={form.frecuencia} onChange={e => setForm(f => ({ ...f, frecuencia: e.target.value }))} placeholder="Una vez al día, post-entreno..." />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Instrucciones</Label>
              <Textarea value={form.instrucciones} onChange={e => setForm(f => ({ ...f, instrucciones: e.target.value }))} placeholder="Tomar con agua, lejos de café y té..." rows={2} />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="activo"
                checked={form.activo}
                onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))}
                className="accent-emerald-600"
              />
              <Label htmlFor="activo">Suplemento activo</Label>
            </div>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">{editando ? 'Guardar cambios' : 'Agregar'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SuplementoCard({ suplemento, onEditar, onEliminar, onToggle }: {
  suplemento: Suplemento
  onEditar: (s: Suplemento) => void
  onEliminar: () => void
  onToggle: () => void
}) {
  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-3 ${suplemento.activo ? 'bg-white border-neutral-200' : 'bg-neutral-50 border-neutral-100'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${suplemento.activo ? 'text-neutral-900' : 'text-neutral-500'}`}>
            {suplemento.nombre}
          </p>
          <p className="text-xs text-neutral-500 mt-0.5">{suplemento.dosis} · {suplemento.frecuencia}</p>
        </div>
        <Badge variant={suplemento.activo ? 'default' : 'secondary'} className="shrink-0 ml-2">
          {suplemento.activo ? 'Activo' : 'Inactivo'}
        </Badge>
      </div>
      {suplemento.instrucciones && (
        <p className="text-xs text-neutral-500 leading-relaxed">{suplemento.instrucciones}</p>
      )}
      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-400">Desde {formatFechaCorta(suplemento.fecha_inicio)}</p>
        <div className="flex gap-1">
          <button onClick={() => onEditar(suplemento)} className="p-1.5 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={onToggle} className={`p-1.5 rounded hover:bg-neutral-100 transition-colors text-xs font-medium ${suplemento.activo ? 'text-neutral-400 hover:text-orange-500' : 'text-neutral-400 hover:text-emerald-600'}`}>
            {suplemento.activo ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
          </button>
          <button onClick={onEliminar} className="p-1.5 rounded hover:bg-red-50 text-neutral-300 hover:text-red-500 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
