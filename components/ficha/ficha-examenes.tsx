'use client'

import { useEffect, useState } from 'react'
import { Plus, FileText, Trash2, Pencil, Paperclip } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { generarId, formatFecha, formatFechaCorta, truncateFilename } from '@/lib/utils'
import type { Examen } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FileUploader } from '@/components/file-uploader'

interface Props { pacienteId: string }

const TIPOS = ['Hemograma', 'Perfil lipídico', 'Glicemia', 'Hormonal', 'Urinario', 'Orina completa', 'Perfil hepático', 'Perfil renal', 'Vitaminas y minerales', 'Otro']

const EMPTY = { fecha: new Date().toISOString().slice(0, 10), tipo: '', resultado: '', notas: '', archivo_nombre: '', archivo_url: '', archivo_size_kb: 0 }

export function FichaExamenes({ pacienteId }: Props) {
  const [examenes, setExamenes] = useState<Examen[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<Examen | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set())

  async function recargar() {
    try {
      const { data, error } = await supabase
        .from('examenes')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('fecha', { ascending: false })
      if (!error && data) setExamenes(data as Examen[])
    } catch (err) {
      console.error('[Load Examenes Error]', err)
    }
  }
  useEffect(() => { recargar() }, [pacienteId])

  function openNuevo() { setEditando(null); setForm(EMPTY); setDialogOpen(true) }
  function openEditar(e: Examen) {
    setEditando(e)
    setForm({
      fecha: e.fecha,
      tipo: e.tipo,
      resultado: e.resultado,
      notas: e.notas,
      archivo_nombre: e.archivo_nombre || '',
      archivo_url: e.archivo_url || '',
      archivo_size_kb: e.archivo_size_kb || 0,
    })
    setDialogOpen(true)
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!form.tipo) return
    try {
      const examData = {
        id: editando?.id || generarId(),
        paciente_id: pacienteId,
        especialidad: 'nutricion',
        fecha: form.fecha,
        tipo: form.tipo,
        resultado: form.resultado || null,
        notas: form.notas || null,
        archivo_nombre: form.archivo_nombre || null,
        archivo_url: form.archivo_url || null,
        archivo_size_kb: form.archivo_size_kb || 0,
      }
      if (editando) {
        await supabase.from('examenes').update(examData).eq('id', editando.id)
      } else {
        await supabase.from('examenes').insert(examData)
      }
      await recargar()
      setDialogOpen(false)
    } catch (err) {
      console.error('[Save Examen Error]', err)
    }
  }

  function toggleExpandido(id: string) {
    setExpandidos(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Exámenes de laboratorio</h2>
          <p className="text-sm text-neutral-500 mt-0.5">{examenes.length} {examenes.length === 1 ? 'examen registrado' : 'exámenes registrados'}</p>
        </div>
        <Button onClick={openNuevo} className="gap-2">
          <Plus className="h-4 w-4" /> Agregar examen
        </Button>
      </div>

      {examenes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500 font-medium">Sin exámenes registrados</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {examenes.map(examen => {
            const expanded = expandidos.has(examen.id)
            return (
              <Card key={examen.id}>
                <button className="w-full flex items-start gap-4 p-5 text-left" onClick={() => toggleExpandido(examen.id)}>
                  <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-neutral-900">{examen.tipo}</p>
                      <Badge variant="blue">{formatFechaCorta(examen.fecha)}</Badge>
                    </div>
                    {!expanded && examen.resultado && (
                      <p className="text-sm text-neutral-500 truncate mt-0.5">{examen.resultado}</p>
                    )}
                  </div>
                  {examen.archivo_nombre && (
                    <a href={examen.archivo_url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1 text-xs shrink-0 hidden sm:flex transition-colors ${examen.archivo_url ? 'text-emerald-600 hover:text-emerald-700' : 'text-neutral-400'}`}>
                      <Paperclip className="h-3 w-3" /> {examen.archivo_nombre}
                    </a>
                  )}
                </button>

                {expanded && (
                  <div className="border-t border-neutral-100 px-5 pb-5">
                    <div className="flex flex-col gap-3 mt-4">
                      {examen.resultado && (
                        <div>
                          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Resultado</p>
                          <p className="text-sm text-neutral-800">{examen.resultado}</p>
                        </div>
                      )}
                      {examen.notas && (
                        <div>
                          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Notas del nutricionista</p>
                          <p className="text-sm text-neutral-800 whitespace-pre-wrap">{examen.notas}</p>
                        </div>
                      )}
                      {examen.archivo_nombre && (
                        <a href={examen.archivo_url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 transition-colors ${examen.archivo_url ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100' : 'text-neutral-600 bg-neutral-50'}`}>
                          <Paperclip className="h-3.5 w-3.5" />
                          <span>{examen.archivo_nombre}</span>
                          {!examen.archivo_url && <span className="text-neutral-400 text-xs">(sin archivo)</span>}
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => openEditar(examen)} className="gap-1.5">
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </Button>
                      <Button variant="ghost" size="sm" onClick={async () => { if (confirm('¿Eliminar?')) { try { await supabase.from('examenes').delete().eq('id', examen.id); await recargar() } catch (err) { console.error('[Delete Error]', err) } } }}
                        className="gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="h-3.5 w-3.5" /> Eliminar
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar examen' : 'Agregar examen'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Tipo *</Label>
                <Select value={form.tipo} onValueChange={v => setForm(f => ({ ...f, tipo: v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {TIPOS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Fecha</Label>
                <Input type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Resultado</Label>
              <Input value={form.resultado} onChange={e => setForm(f => ({ ...f, resultado: e.target.value }))} placeholder="LDL 115 mg/dL, HDL 52 mg/dL..." />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Notas del nutricionista</Label>
              <Textarea value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} placeholder="Interpretación clínica, recomendaciones..." rows={3} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Archivo adjunto (PDF, JPG, PNG, etc.)</Label>
              {form.archivo_url ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Paperclip className="h-4 w-4 text-emerald-600 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-emerald-900" title={form.archivo_nombre}>{truncateFilename(form.archivo_nombre, 35)}</p>
                      <p className="text-xs text-emerald-600">{(form.archivo_size_kb / 1024).toFixed(1)} MB</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setForm(f => ({ ...f, archivo_nombre: '', archivo_url: '', archivo_size_kb: 0 }))}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </Button>
                </div>
              ) : (
                <FileUploader
                  bucket="examenes"
                  label="Subir archivo de examen"
                  multiple={false}
                  maxFiles={1}
                  onUploadSuccess={(result) => {
                    setForm(f => ({
                      ...f,
                      archivo_nombre: result.filename,
                      archivo_url: result.url,
                      archivo_size_kb: result.size_kb,
                    }))
                  }}
                  onUploadError={(error) => alert('Error: ' + error)}
                />
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">{editando ? 'Guardar cambios' : 'Agregar examen'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
