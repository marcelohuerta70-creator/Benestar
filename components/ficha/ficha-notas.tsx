'use client'

import { useEffect, useState } from 'react'
import { Plus, Lock, Eye, Pencil, Trash2, Paperclip } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { generarId, formatFecha, truncateFilename } from '@/lib/utils'
import type { NotaClinica } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FileUploader } from '@/components/file-uploader'

interface ArchivoNota {
  nombre: string
  url: string
  size_kb: number
}

interface Props { pacienteId: string }

const EMPTY = { tipo: 'clinica' as 'clinica' | 'paciente', titulo: '', contenido: '', archivos_urls: [] as ArchivoNota[] }

export function FichaNotas({ pacienteId }: Props) {
  const [notas, setNotas] = useState<NotaClinica[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<NotaClinica | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [filtro, setFiltro] = useState<'todas' | 'clinica' | 'paciente'>('todas')

  async function recargar() {
    try {
      const { data, error } = await supabase
        .from('notas_clinicas')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('created_at', { ascending: false })
      if (!error && data) setNotas(data as NotaClinica[])
    } catch (err) {
      console.error('[Load Notas Error]', err)
    }
  }
  useEffect(() => { recargar() }, [pacienteId])

  function openNuevo(tipo?: 'clinica' | 'paciente') {
    setEditando(null)
    setForm({ ...EMPTY, tipo: tipo || 'clinica' })
    setDialogOpen(true)
  }

  function openEditar(n: NotaClinica) {
    setEditando(n)
    const archivos = (n.archivos_urls || []).map((url, i) => ({
      nombre: (n.archivos?.[i] || url.split('/').pop() || 'archivo'),
      url,
      size_kb: n.archivos_size_kb?.[i] || 0,
    }))
    setForm({ tipo: n.tipo, titulo: n.titulo, contenido: n.contenido, archivos_urls: archivos })
    setDialogOpen(true)
  }


  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!form.contenido) return
    try {
      const notaData = {
        paciente_id: pacienteId,
        especialidad: 'nutricion',
        tipo: form.tipo,
        titulo: form.titulo || null,
        contenido: form.contenido,
        archivos: form.archivos_urls.map(a => a.nombre),
        archivos_urls: form.archivos_urls.map(a => a.url),
        archivos_size_kb: form.archivos_urls.map(a => a.size_kb),
      }
      if (editando) {
        await supabase.from('notas_clinicas').update(notaData).eq('id', editando.id)
      } else {
        await supabase.from('notas_clinicas').insert(notaData)
      }
      await recargar()
      setDialogOpen(false)
    } catch (err) {
      console.error('[Save Nota Error]', err)
    }
  }

  const filtradas = notas.filter(n => filtro === 'todas' || n.tipo === filtro)

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Notas</h2>
          <p className="text-sm text-neutral-500 mt-0.5">{notas.length} nota(s) registrada(s)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => openNuevo('paciente')} className="gap-1.5">
            <Eye className="h-3.5 w-3.5" /> Para el paciente
          </Button>
          <Button size="sm" onClick={() => openNuevo('clinica')} className="gap-1.5">
            <Lock className="h-3.5 w-3.5" /> Nota clínica
          </Button>
        </div>
      </div>

      {/* Filtro */}
      <div className="flex rounded-lg border border-neutral-200 overflow-hidden bg-white w-fit">
        {(['todas', 'clinica', 'paciente'] as const).map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${filtro === f ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-50'}`}>
            {f === 'todas' ? 'Todas' : f === 'clinica' ? 'Clínicas' : 'Para paciente'}
          </button>
        ))}
      </div>

      {/* Leyenda */}
      <div className="flex gap-4 text-xs text-neutral-500">
        <div className="flex items-center gap-1.5">
          <Lock className="h-3 w-3 text-neutral-400" />
          <span>Nota clínica — solo visible para ti</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Eye className="h-3 w-3 text-emerald-600" />
          <span>Nota para el paciente — visible en el portal</span>
        </div>
      </div>

      {/* Lista */}
      {filtradas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-neutral-500 font-medium">Sin notas</p>
            <p className="text-sm text-neutral-400 mt-1">Agrega una nota clínica o para el paciente.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtradas.map(nota => (
            <Card key={nota.id} className={nota.tipo === 'paciente' ? 'border-emerald-200' : ''}>
              <CardHeader className="pb-2 flex flex-row items-start justify-between">
                <div className="flex items-start gap-3">
                  {nota.tipo === 'clinica' ? (
                    <div className="mt-0.5 h-7 w-7 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                      <Lock className="h-3.5 w-3.5 text-neutral-500" />
                    </div>
                  ) : (
                    <div className="mt-0.5 h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <Eye className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                  )}
                  <div>
                    {nota.titulo && <p className="text-sm font-semibold text-neutral-900">{nota.titulo}</p>}
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant={nota.tipo === 'paciente' ? 'default' : 'secondary'} className="text-xs">
                        {nota.tipo === 'paciente' ? 'Para el paciente' : 'Clínica (privada)'}
                      </Badge>
                      <span className="text-xs text-neutral-400">{formatFecha(nota.created_at.slice(0, 10))}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openEditar(nota)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm"
                    onClick={async () => { if (confirm('¿Eliminar esta nota?')) { try { await supabase.from('notas_clinicas').delete().eq('id', nota.id); await recargar() } catch (err) { console.error('[Delete Error]', err) } } }}
                    className="text-red-400 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pl-14">
                <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">{nota.contenido}</p>
                {(nota.archivos?.length || 0) > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {nota.archivos?.map((arch, idx) => {
                      const url = nota.archivos_urls?.[idx]
                      return (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-colors ${
                            url
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          <Paperclip className="h-3 w-3" />
                          {arch}
                        </a>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editando ? 'Editar nota' : form.tipo === 'clinica' ? 'Nueva nota clínica' : 'Nueva nota para el paciente'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
            {/* Tipo */}
            <div className="flex rounded-lg border border-neutral-200 overflow-hidden">
              {(['clinica', 'paciente'] as const).map(t => (
                <button key={t} type="button" onClick={() => setForm(f => ({ ...f, tipo: t }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${form.tipo === t ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-50'}`}>
                  {t === 'clinica' ? <><Lock className="h-3.5 w-3.5" /> Clínica (privada)</> : <><Eye className="h-3.5 w-3.5" /> Para el paciente</>}
                </button>
              ))}
            </div>

            {form.tipo === 'paciente' && (
              <div className="bg-emerald-50 rounded-lg p-3 text-xs text-emerald-700">
                Esta nota será visible para el paciente en su portal de acceso.
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label>Título (opcional)</Label>
              <Input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Ej: Seguimiento semana 3, Instrucciones post-consulta..." />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Contenido *</Label>
              <Textarea value={form.contenido} onChange={e => setForm(f => ({ ...f, contenido: e.target.value }))} placeholder="Escribe aquí..." rows={6} required />
            </div>

            {/* Archivos adjuntos */}
            <div className="flex flex-col gap-2">
              <Label>Archivos adjuntos</Label>
              <FileUploader
                bucket={form.tipo === 'clinica' ? 'notas-clinicas' : 'notas-pacientes'}
                label="Subir archivo"
                multiple={false}
                maxFiles={1}
                onUploadSuccess={(result) => {
                  setForm(f => ({
                    ...f,
                    archivos_urls: [...f.archivos_urls, {
                      nombre: result.filename,
                      url: result.url,
                      size_kb: result.size_kb,
                    }]
                  }))
                }}
                onUploadError={(error) => alert('Error: ' + error)}
              />
              {form.archivos_urls.length > 0 && (
                <div className="flex flex-col gap-2">
                  {form.archivos_urls.map((arch, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Paperclip className="h-4 w-4 text-emerald-600 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-emerald-900" title={arch.nombre}>{truncateFilename(arch.nombre, 35)}</p>
                          <p className="text-xs text-emerald-600">{(arch.size_kb / 1024).toFixed(1)} MB</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => setForm(f => ({ ...f, archivos_urls: f.archivos_urls.filter((_, i) => i !== idx) }))} className="text-red-500 hover:text-red-700 ml-2 shrink-0">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">{editando ? 'Guardar cambios' : 'Guardar nota'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
