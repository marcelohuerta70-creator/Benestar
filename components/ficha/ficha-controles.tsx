'use client'

import { useEffect, useState } from 'react'
import { Plus, ChevronDown, ChevronUp, Pencil, Trash2, CalendarDays, Activity, Paperclip } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { consultasStorage, antropometriaStorage, bioimpedanciaStorage, citasStorage, pacientesStorage } from '@/lib/storage'
import { generarId, formatFecha, formatFechaCorta, calcularIMC, truncateFilename } from '@/lib/utils'
import type { Consulta, Antropometria, Bioimpedancia, TipoConsulta, NivelAdherencia } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FileUploader } from '@/components/file-uploader'

interface Props { pacienteId: string }

interface Adjunto {
  id: string
  nombre: string
  url: string
  size_kb: number
}

function ensureAdjuntos(adjuntos: any): Adjunto[] {
  if (!adjuntos) return []
  return adjuntos.map((a: any) =>
    typeof a === 'string'
      ? { id: generarId(), nombre: a, url: '', size_kb: 0 }
      : a
  )
}

const TIPO_LABEL: Record<TipoConsulta, string> = {
  primera_consulta: 'Primera consulta',
  seguimiento: 'Seguimiento',
  alta_nutricional: 'Alta nutricional',
}
const ADHERENCIA_LABEL: Record<string, string> = {
  muy_buena: 'Muy buena', buena: 'Buena', regular: 'Regular', mala: 'Mala',
}
const ADHERENCIA_COLOR: Record<string, string> = {
  muy_buena: 'default', buena: 'default', regular: 'warning', mala: 'destructive',
}

const FORM_EMPTY = {
  fecha: new Date().toISOString().slice(0, 10),
  tipo_consulta: 'seguimiento' as TipoConsulta,
  proxima_cita: '',
  proxima_cita_hora: '09:00',
  adherencia: '' as NivelAdherencia,
  cambios_observados: '',
  dificultades_reportadas: '',
  observaciones_clinicas: '',
  ctrl_actividad_fisica: '',
  ctrl_consumo_agua: '',
  ctrl_sueno: '',
  ctrl_deposiciones: '',
  ctrl_alcohol: '',
  ctrl_tabaco: '',
  diagnostico_nutricional: '',
  indicaciones: '',
  objetivos_proximo_control: '',
  nota_para_paciente: '',
  adjuntos: [] as Adjunto[],
}

const ANTROP_EMPTY = {
  peso_kg: '', talla_cm: '', perimetro_cintura_cm: '', perimetro_cadera_cm: '',
  per_brazo_relajado: '', per_brazo_contraido: '', per_torax: '', per_abdomen: '', per_muslo: '', per_pantorrilla: '',
  pliegue_tricipital: '', pliegue_bicipital: '', pliegue_subescapular: '',
  pliegue_suprailiaco: '', pliegue_abdominal: '', pliegue_muslo: '', pliegue_pantorrilla: '',
  envergadura: '', altura_sentado: '',
}

const BIO_EMPTY = {
  masa_grasa_kg: '', masa_grasa_pct: '', masa_magra_kg: '', masa_libre_grasa: '',
  agua_corporal_lt: '', agua_corporal_pct: '', grasa_visceral: '', proteina_corporal: '',
  masa_osea: '', metabolismo_basal_kcal: '', edad_metabolica: '',
  seg_brazo_izq: '', seg_brazo_der: '', seg_tronco: '', seg_pierna_izq: '', seg_pierna_der: '',
}

export function FichaControles({ pacienteId }: Props) {
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<Consulta | null>(null)
  const [form, setForm] = useState(FORM_EMPTY)
  const [adjuntoInput, setAdjuntoInput] = useState('')
  // Secciones del form
  const [secExpandidas, setSecExpandidas] = useState<Set<string>>(new Set(['general', 'evolucion', 'diagnostico', 'indicaciones', 'nota']))
  // Mediciones opcionales
  const [incluirMediciones, setIncluirMediciones] = useState(false)
  const [formAntrop, setFormAntrop] = useState(ANTROP_EMPTY)
  const [avanzadaOpen, setAvanzadaOpen] = useState(false)
  const [incluirBio, setIncluirBio] = useState(false)
  const [formBio, setFormBio] = useState(BIO_EMPTY)
  const [segmentalOpen, setSegmentalOpen] = useState(false)

  async function recargar() {
    try {
      const { data, error } = await supabase
        .from('consultas')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('fecha', { ascending: false })

      if (!error && data) {
        setConsultas(data as Consulta[])
        if (data.length > 0) setExpandidos(new Set([data[0].id]))
      }
    } catch (err) {
      console.error('[Load Consultas Error]', err)
    }
  }

  useEffect(() => { recargar() }, [pacienteId])

  function toggleSec(key: string) {
    setSecExpandidas(prev => { const n = new Set(prev); if (n.has(key)) n.delete(key); else n.add(key); return n })
  }

  function openNuevo() {
    setEditando(null)
    setForm({ ...FORM_EMPTY, fecha: new Date().toISOString().slice(0, 10) })
    setFormAntrop(ANTROP_EMPTY)
    setFormBio(BIO_EMPTY)
    setIncluirMediciones(false)
    setIncluirBio(false)
    setAvanzadaOpen(false)
    setSegmentalOpen(false)
    setAdjuntoInput('')
    setSecExpandidas(new Set(['general', 'evolucion', 'diagnostico', 'indicaciones', 'nota']))
    setDialogOpen(true)
  }

  function openEditar(c: Consulta) {
    setEditando(c)
    setForm({
      fecha: c.fecha,
      tipo_consulta: c.tipo_consulta || 'seguimiento',
      proxima_cita: c.proxima_cita || '',
      proxima_cita_hora: (c as any).proxima_cita_hora || '09:00',
      adherencia: c.adherencia || '',
      cambios_observados: c.cambios_observados || '',
      dificultades_reportadas: c.dificultades_reportadas || '',
      observaciones_clinicas: c.observaciones_clinicas || c.observaciones || '',
      ctrl_actividad_fisica: c.ctrl_actividad_fisica || '',
      ctrl_consumo_agua: c.ctrl_consumo_agua || '',
      ctrl_sueno: c.ctrl_sueno || '',
      ctrl_deposiciones: c.ctrl_deposiciones || '',
      ctrl_alcohol: c.ctrl_alcohol || '',
      ctrl_tabaco: c.ctrl_tabaco || '',
      diagnostico_nutricional: c.diagnostico_nutricional || c.diagnostico || '',
      indicaciones: c.indicaciones || c.motivo || '',
      objetivos_proximo_control: c.objetivos_proximo_control || '',
      nota_para_paciente: c.nota_para_paciente || '',
      adjuntos: ensureAdjuntos(c.adjuntos),
    })
    setFormAntrop(ANTROP_EMPTY)
    setFormBio(BIO_EMPTY)
    setIncluirMediciones(false)
    setIncluirBio(false)
    setAvanzadaOpen(false)
    setSegmentalOpen(false)
    setAdjuntoInput('')
    setSecExpandidas(new Set(['general', 'evolucion', 'diagnostico', 'indicaciones', 'nota']))
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('User not authenticated')
        return
      }

      const consultaData = {
        paciente_id: pacienteId,
        profesional_id: user.id,
        fecha: form.fecha,
        tipo_consulta: form.tipo_consulta || null,
        adherencia: form.adherencia || null,
        cambios_observados: form.cambios_observados || null,
        dificultades_reportadas: form.dificultades_reportadas || null,
        observaciones_clinicas: form.observaciones_clinicas || null,
        diagnostico_nutricional: form.diagnostico_nutricional || null,
        indicaciones: form.indicaciones || null,
        objetivos_proximo_control: form.objetivos_proximo_control || null,
        nota_para_paciente: form.nota_para_paciente || null,
        adjuntos: form.adjuntos.length > 0 ? form.adjuntos.map(a => a.nombre) : null,
        archivos_urls: form.adjuntos.length > 0 ? form.adjuntos.map(a => a.url) : null,
      }

      let consultaId: string
      if (editando) {
        consultaId = editando.id
        const { error: updateError } = await supabase.from('consultas').update(consultaData).eq('id', editando.id)
        if (updateError) {
          console.error('[Update Consulta Error]', updateError)
          alert('Error al guardar: ' + updateError.message)
          return
        }
      } else {
        const { data: inserted, error: insertError } = await supabase.from('consultas').insert(consultaData).select().single()
        if (insertError) {
          console.error('[Insert Consulta Error]', insertError)
          alert('Error al guardar: ' + insertError.message)
          return
        }
        consultaId = inserted?.id || generarId()
      }

      // Crear cita automática si hay próxima fecha y hora
      if (form.proxima_cita && (form as any).proxima_cita_hora && !editando) {
        const { data: paciente } = await supabase.from('pacientes').select('nombre_completo').eq('id', pacienteId).single()

        if (paciente) {
          const { error: citaError } = await supabase.from('citas').insert({
            paciente_id: pacienteId,
            profesional_id: user.id,
            fecha: form.proxima_cita,
            hora: (form as any).proxima_cita_hora,
            estado: 'programada',
            motivo: 'Seguimiento nutricional',
            especialidad: 'nutricion',
          })
          if (citaError) {
            console.error('[Cita Insert Error]', citaError)
            alert('Error al guardar cita: ' + citaError.message)
          }
        }
      }

      // Guardar antropometría si se registró
      if (incluirMediciones && formAntrop.peso_kg && formAntrop.talla_cm) {
        const peso = parseFloat(formAntrop.peso_kg)
        const talla = parseFloat(formAntrop.talla_cm)
        const imc = calcularIMC(peso, talla)

        const antropData: any = {
          paciente_id: pacienteId,
          fecha: form.fecha,
          peso_kg: peso,
          talla_cm: talla,
          imc,
        }

        // Agregar campos opcionales solo si tienen valor
        if (formAntrop.perimetro_cintura_cm) antropData.perimetro_cintura_cm = n(formAntrop.perimetro_cintura_cm)
        if (formAntrop.perimetro_cadera_cm) antropData.perimetro_cadera_cm = n(formAntrop.perimetro_cadera_cm)
        if (formAntrop.per_brazo_relajado) antropData.per_brazo_relajado_cm = n(formAntrop.per_brazo_relajado)
        if (formAntrop.per_brazo_contraido) antropData.per_brazo_contraido_cm = n(formAntrop.per_brazo_contraido)
        if (formAntrop.per_torax) antropData.perimetro_torax_cm = n(formAntrop.per_torax)
        if (formAntrop.per_abdomen) antropData.perimetro_abdomen_cm = n(formAntrop.per_abdomen)
        if (formAntrop.per_muslo) antropData.perimetro_muslo_cm = n(formAntrop.per_muslo)
        if (formAntrop.per_pantorrilla) antropData.perimetro_pantorrilla_cm = n(formAntrop.per_pantorrilla)
        if (formAntrop.pliegue_tricipital) antropData.pliegue_tricipital_mm = n(formAntrop.pliegue_tricipital)
        if (formAntrop.pliegue_bicipital) antropData.pliegue_bicipital_mm = n(formAntrop.pliegue_bicipital)
        if (formAntrop.pliegue_subescapular) antropData.pliegue_subescapular_mm = n(formAntrop.pliegue_subescapular)
        if (formAntrop.pliegue_suprailiaco) antropData.pliegue_suprailiaco_mm = n(formAntrop.pliegue_suprailiaco)
        if (formAntrop.pliegue_abdominal) antropData.pliegue_abdominal_mm = n(formAntrop.pliegue_abdominal)
        if (formAntrop.pliegue_muslo) antropData.pliegue_muslo_mm = n(formAntrop.pliegue_muslo)
        if (formAntrop.pliegue_pantorrilla) antropData.pliegue_pantorrilla_mm = n(formAntrop.pliegue_pantorrilla)
        if (formAntrop.envergadura) antropData.envergadura_cm = n(formAntrop.envergadura)
        if (formAntrop.altura_sentado) antropData.altura_sentado_cm = n(formAntrop.altura_sentado)

        const { error: antropError } = await supabase.from('mediciones_antropometria').insert(antropData)
        if (antropError) {
          console.error('[Insert Antrop Error]', antropError)
          alert('Error antrop: ' + antropError.message)
        }
      }

      // Guardar bioimpedancia si se registró
      if (incluirBio && incluirMediciones && formBio.masa_grasa_kg) {
        const bioData: any = {
          paciente_id: pacienteId,
          fecha: form.fecha,
        }

        // Agregar campos opcionales solo si tienen valor
        if (formBio.masa_grasa_kg) bioData.masa_grasa_kg = n(formBio.masa_grasa_kg)
        if (formBio.masa_grasa_pct) bioData.masa_grasa_pct = n(formBio.masa_grasa_pct)
        if (formBio.masa_magra_kg) bioData.masa_magra_kg = n(formBio.masa_magra_kg)
        if (formBio.masa_libre_grasa) bioData.masa_libre_grasa_kg = n(formBio.masa_libre_grasa)
        if (formBio.agua_corporal_lt) bioData.agua_corporal_lt = n(formBio.agua_corporal_lt)
        if (formBio.agua_corporal_pct) bioData.agua_corporal_pct = n(formBio.agua_corporal_pct)
        if (formBio.grasa_visceral) bioData.grasa_visceral = n(formBio.grasa_visceral)
        if (formBio.proteina_corporal) bioData.proteina_corporal_kg = n(formBio.proteina_corporal)
        if (formBio.masa_osea) bioData.masa_osea_kg = n(formBio.masa_osea)
        if (formBio.metabolismo_basal_kcal) bioData.metabolismo_basal_kcal = Math.round(n(formBio.metabolismo_basal_kcal) || 0)
        if (formBio.edad_metabolica) bioData.edad_metabolica = Math.round(n(formBio.edad_metabolica) || 0)
        if (formBio.seg_brazo_izq) bioData.seg_brazo_izq = n(formBio.seg_brazo_izq)
        if (formBio.seg_brazo_der) bioData.seg_brazo_der = n(formBio.seg_brazo_der)
        if (formBio.seg_tronco) bioData.seg_tronco = n(formBio.seg_tronco)
        if (formBio.seg_pierna_izq) bioData.seg_pierna_izq = n(formBio.seg_pierna_izq)
        if (formBio.seg_pierna_der) bioData.seg_pierna_der = n(formBio.seg_pierna_der)

        const { error: bioError } = await supabase.from('mediciones_bioimpedancia').insert(bioData)
        if (bioError) {
          console.error('[Insert Bio Error]', bioError)
          alert('Error bio: ' + bioError.message)
        }
      }

      await recargar()
      setDialogOpen(false)
    } catch (err) {
      console.error('[Save Consulta Error]', err)
    }
  }

  function n(v: string): number | undefined {
    const parsed = parseFloat(v)
    return isNaN(parsed) ? undefined : parsed
  }

  function antropDeControl(consultaId: string) {
    const antrop = consultas.find(c => c.id === consultaId)
    return antrop ? (antrop as any).mediciones_antropometria?.[0] : undefined
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Historial de controles</h2>
          <p className="text-sm text-neutral-500 mt-0.5">{consultas.length} {consultas.length === 1 ? 'consulta registrada' : 'consultas registradas'}</p>
        </div>
        <Button onClick={openNuevo} className="gap-2">
          <Plus className="h-4 w-4" /> Nueva consulta
        </Button>
      </div>

      {/* Lista */}
      {consultas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarDays className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500 font-medium">Sin consultas registradas</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {consultas.map((c, idx) => {
            const expanded = expandidos.has(c.id)
            const antrop = antropDeControl(c.id)
            const tipoLabel = c.tipo_consulta ? TIPO_LABEL[c.tipo_consulta] : (c.motivo || 'Consulta')
            return (
              <Card key={c.id} className={idx === 0 ? 'ring-1 ring-emerald-200' : ''}>
                <button
                  className="w-full flex items-center gap-4 p-4 text-left"
                  onClick={() => setExpandidos(prev => { const n = new Set(prev); if (n.has(c.id)) n.delete(c.id); else n.add(c.id); return n })}
                >
                  <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 text-xs font-bold text-neutral-600">
                    {consultas.length - idx}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-neutral-900">{formatFecha(c.fecha)}</p>
                      {idx === 0 && <Badge variant="default" className="text-xs">Último</Badge>}
                      <Badge variant="secondary" className="text-xs">{tipoLabel}</Badge>
                      {c.adherencia && (
                        <Badge variant={ADHERENCIA_COLOR[c.adherencia] as 'default' | 'secondary' | 'destructive' | 'warning'} className="text-xs">
                          Adherencia: {ADHERENCIA_LABEL[c.adherencia]}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5 truncate">
                      {c.diagnostico_nutricional || c.diagnostico || 'Sin diagnóstico registrado'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {antrop && <span className="text-xs text-neutral-400 hidden sm:block">{antrop.peso_kg} kg · IMC {antrop.imc}</span>}
                    {expanded ? <ChevronUp className="h-4 w-4 text-neutral-400" /> : <ChevronDown className="h-4 w-4 text-neutral-400" />}
                  </div>
                </button>

                {expanded && (
                  <div className="border-t border-neutral-100 px-4 pb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      {c.proxima_cita && <InfoField label="Próxima cita" value={formatFecha(c.proxima_cita)} />}
                      {(c.cambios_observados) && <InfoField label="Cambios observados" value={c.cambios_observados} col2 />}
                      {(c.dificultades_reportadas) && <InfoField label="Dificultades" value={c.dificultades_reportadas} col2 />}
                      {(c.observaciones_clinicas || c.observaciones) && <InfoField label="Observaciones clínicas" value={c.observaciones_clinicas || c.observaciones || ''} col2 />}
                      {(c.ctrl_actividad_fisica || c.ctrl_consumo_agua || c.ctrl_sueno) && (
                        <div className="sm:col-span-2">
                          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Hábitos del control</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {c.ctrl_actividad_fisica && <MiniField label="Actividad física" value={c.ctrl_actividad_fisica} />}
                            {c.ctrl_consumo_agua && <MiniField label="Agua" value={c.ctrl_consumo_agua} />}
                            {c.ctrl_sueno && <MiniField label="Sueño" value={c.ctrl_sueno} />}
                            {c.ctrl_deposiciones && <MiniField label="Deposiciones" value={c.ctrl_deposiciones} />}
                            {c.ctrl_alcohol && <MiniField label="Alcohol" value={c.ctrl_alcohol} />}
                            {c.ctrl_tabaco && <MiniField label="Tabaco" value={c.ctrl_tabaco} />}
                          </div>
                        </div>
                      )}
                      {(c.diagnostico_nutricional || c.diagnostico) && <InfoField label="Diagnóstico nutricional" value={c.diagnostico_nutricional || c.diagnostico || ''} col2 />}
                      {(c.indicaciones || c.motivo) && <InfoField label="Indicaciones" value={c.indicaciones || c.motivo || ''} col2 />}
                      {c.objetivos_proximo_control && <InfoField label="Objetivos próximo control" value={c.objetivos_proximo_control} col2 />}
                      {c.nota_para_paciente && (
                        <div className="sm:col-span-2 bg-emerald-50 rounded-lg p-3">
                          <p className="text-xs font-semibold text-emerald-700 mb-1">Nota para el paciente</p>
                          <p className="text-sm text-emerald-800">{c.nota_para_paciente}</p>
                        </div>
                      )}
                      {antrop && (
                        <div className="sm:col-span-2">
                          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Mediciones de este control</p>
                          <div className="flex flex-wrap gap-3">
                            <MedBadge label="Peso" value={`${antrop.peso_kg} kg`} />
                            <MedBadge label="Talla" value={`${antrop.talla_cm} cm`} />
                            <MedBadge label="IMC" value={String(antrop.imc)} />
                            {antrop.perimetro_cintura_cm > 0 && <MedBadge label="Cintura" value={`${antrop.perimetro_cintura_cm} cm`} />}
                            {antrop.perimetro_cadera_cm > 0 && <MedBadge label="Cadera" value={`${antrop.perimetro_cadera_cm} cm`} />}
                            {antrop.icc > 0 && <MedBadge label="ICC" value={String(antrop.icc)} />}
                          </div>
                        </div>
                      )}
                      {(c.adjuntos || []).length > 0 && (
                        <div className="sm:col-span-2 flex flex-wrap gap-2">
                          {(c.adjuntos || []).map((a, i) => {
                            const isObj = typeof a === 'object'
                            const nombre = isObj ? (a as Adjunto).nombre : (a as string)
                            const url = isObj ? (a as Adjunto).url : undefined
                            return (
                              <a
                                key={i}
                                href={url}
                                target={url ? '_blank' : undefined}
                                rel={url ? 'noopener noreferrer' : undefined}
                                className={`flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors ${
                                  url
                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 cursor-pointer'
                                    : 'bg-neutral-100 text-neutral-600'
                                }`}
                              >
                                <Paperclip className="h-3 w-3" />
                                {nombre}
                              </a>
                            )
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => openEditar(c)} className="gap-1.5">
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </Button>
                      <Button variant="ghost" size="sm"
                        onClick={async () => {
                          if (confirm('¿Eliminar este control? También se eliminarán las mediciones asociadas.')) {
                            try {
                              await supabase.from('mediciones_antropometria').delete().eq('consulta_id', c.id)
                              await supabase.from('mediciones_bioimpedancia').delete().eq('consulta_id', c.id)
                              await supabase.from('consultas').delete().eq('id', c.id)
                              await recargar()
                            } catch (err) {
                              console.error('[Delete Error]', err)
                            }
                          }
                        }}
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

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar consulta' : 'Nueva consulta'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-2">

            {/* 1 - INFORMACIÓN GENERAL */}
            <FormSection title="1. Información general" sectionKey="general" expanded={secExpandidas.has('general')} onToggle={toggleSec}>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1"><Label>Fecha *</Label><Input type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} required /></div>
                <div className="flex flex-col gap-1">
                  <Label>Tipo de consulta</Label>
                  <Select value={form.tipo_consulta} onValueChange={v => setForm(f => ({ ...f, tipo_consulta: v as TipoConsulta }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primera_consulta">Primera consulta</SelectItem>
                      <SelectItem value="seguimiento">Seguimiento</SelectItem>
                      <SelectItem value="alta_nutricional">Alta nutricional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <Label>Próxima cita</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="date" value={form.proxima_cita} onChange={e => setForm(f => ({ ...f, proxima_cita: e.target.value }))} />
                    <Input type="time" value={(form as any).proxima_cita_hora || '09:00'} onChange={e => setForm(f => ({ ...f, proxima_cita_hora: e.target.value }))} />
                  </div>
                  {form.proxima_cita && <p className="text-xs text-emerald-600 mt-1">Se agendará automáticamente en la Agenda</p>}
                </div>
              </div>
            </FormSection>

            {/* 2 - EVOLUCIÓN (solo en seguimiento/alta) */}
            {form.tipo_consulta !== 'primera_consulta' && (
              <FormSection title="2. Evolución del paciente" sectionKey="evolucion" expanded={secExpandidas.has('evolucion')} onToggle={toggleSec}>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <Label>Adherencia al plan</Label>
                    <Select value={form.adherencia} onValueChange={v => setForm(f => ({ ...f, adherencia: v as NivelAdherencia }))}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="muy_buena">Muy buena</SelectItem>
                        <SelectItem value="buena">Buena</SelectItem>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="mala">Mala</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <TA label="Cambios observados" value={form.cambios_observados} onChange={v => setForm(f => ({ ...f, cambios_observados: v }))} />
                  <TA label="Dificultades reportadas" value={form.dificultades_reportadas} onChange={v => setForm(f => ({ ...f, dificultades_reportadas: v }))} />
                  <TA label="Observaciones clínicas" value={form.observaciones_clinicas} onChange={v => setForm(f => ({ ...f, observaciones_clinicas: v }))} />
                </div>
              </FormSection>
            )}

            {/* 3 - HÁBITOS (solo en seguimiento/alta) */}
            {form.tipo_consulta !== 'primera_consulta' && (
              <FormSection title="3. Hábitos actuales" sectionKey="habitos" expanded={secExpandidas.has('habitos')} onToggle={toggleSec}>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['ctrl_actividad_fisica', 'Actividad física'],
                    ['ctrl_consumo_agua', 'Consumo de agua'],
                    ['ctrl_sueno', 'Calidad de sueño'],
                    ['ctrl_deposiciones', 'Deposiciones'],
                    ['ctrl_alcohol', 'Alcohol'],
                    ['ctrl_tabaco', 'Tabaco'],
                  ].map(([key, label]) => (
                    <div key={key} className="flex flex-col gap-1">
                      <Label className="text-xs">{label}</Label>
                      <Input
                        value={(form as unknown as Record<string, string>)[key]}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        placeholder="..."
                      />
                    </div>
                  ))}
                </div>
              </FormSection>
            )}

            {/* 4 - DIAGNÓSTICO */}
            <FormSection title="4. Diagnóstico nutricional" sectionKey="diagnostico" expanded={secExpandidas.has('diagnostico')} onToggle={toggleSec}>
              <TA value={form.diagnostico_nutricional} onChange={v => setForm(f => ({ ...f, diagnostico_nutricional: v }))} placeholder="Diagnóstico nutricional del paciente..." rows={4} />
            </FormSection>

            {/* 5 - INDICACIONES */}
            <FormSection title="5. Indicaciones" sectionKey="indicaciones" expanded={secExpandidas.has('indicaciones')} onToggle={toggleSec}>
              <TA value={form.indicaciones} onChange={v => setForm(f => ({ ...f, indicaciones: v }))} placeholder="Indicaciones para el paciente..." rows={4} />
            </FormSection>

            {/* 6 - OBJETIVOS */}
            <FormSection title="6. Objetivos próximo control" sectionKey="objetivos" expanded={secExpandidas.has('objetivos')} onToggle={toggleSec}>
              <TA value={form.objetivos_proximo_control} onChange={v => setForm(f => ({ ...f, objetivos_proximo_control: v }))} placeholder="Metas para la siguiente visita..." rows={3} />
            </FormSection>

            {/* 7 - NOTA PACIENTE */}
            <FormSection title="7. Nota visible para el paciente" sectionKey="nota" expanded={secExpandidas.has('nota')} onToggle={toggleSec}>
              <div className="bg-emerald-50 rounded-lg p-2 mb-2 text-xs text-emerald-700">Esta nota es visible en el portal del paciente.</div>
              <TA value={form.nota_para_paciente} onChange={v => setForm(f => ({ ...f, nota_para_paciente: v }))} placeholder="Mensaje motivacional, resumen o instrucción para el paciente..." rows={3} />
            </FormSection>

            {/* 8 - ADJUNTOS */}
            <FormSection title="8. Adjuntos" sectionKey="adjuntos" expanded={secExpandidas.has('adjuntos')} onToggle={toggleSec}>
              <FileUploader
                bucket="controles"
                label="Subir adjunto"
                multiple={false}
                maxFiles={1}
                onUploadSuccess={(result) => {
                  setForm(f => ({
                    ...f,
                    adjuntos: [...f.adjuntos, {
                      id: generarId(),
                      nombre: result.filename,
                      url: result.url,
                      size_kb: result.size_kb,
                    }]
                  }))
                }}
                onUploadError={(error) => alert('Error: ' + error)}
              />
              {form.adjuntos.length > 0 && (
                <div className="flex flex-col gap-2 mt-4">
                  <p className="text-xs font-medium text-neutral-600">Adjuntos subidos ({form.adjuntos.length}/8):</p>
                  {form.adjuntos.map((a, i) => (
                    <div key={a.id} className="flex items-center justify-between bg-neutral-50 rounded border border-neutral-200 p-3 text-sm">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Paperclip className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-neutral-900" title={a.nombre}>{truncateFilename(a.nombre, 35)}</p>
                          <p className="text-xs text-neutral-500">{(a.size_kb / 1024).toFixed(1)} MB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, adjuntos: f.adjuntos.filter(adj => adj.id !== a.id) }))}
                        className="text-neutral-400 hover:text-red-500 ml-2 shrink-0"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </FormSection>

            {/* 9 - MEDICIONES */}
            <div className="border border-neutral-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-neutral-50">
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="incluirMed" checked={incluirMediciones} onChange={e => setIncluirMediciones(e.target.checked)} className="accent-emerald-600" />
                  <label htmlFor="incluirMed" className="text-sm font-semibold text-neutral-800">Mediciones tomadas en esta consulta</label>
                </div>
                <Activity className="h-4 w-4 text-neutral-400" />
              </div>

              {incluirMediciones && (
                <div className="p-4 flex flex-col gap-4 border-t border-neutral-100">
                  {/* Antropometría básica */}
                  <div>
                    <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-3">Antropometría básica</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <NumField label="Peso (kg) *" value={formAntrop.peso_kg} onChange={v => setFormAntrop(f => ({ ...f, peso_kg: v }))} placeholder="70.5" />
                      <NumField label="Talla (cm) *" value={formAntrop.talla_cm} onChange={v => setFormAntrop(f => ({ ...f, talla_cm: v }))} placeholder="165" />
                      <NumField label="Cintura (cm)" value={formAntrop.perimetro_cintura_cm} onChange={v => setFormAntrop(f => ({ ...f, perimetro_cintura_cm: v }))} placeholder="82" />
                      <NumField label="Cadera (cm)" value={formAntrop.perimetro_cadera_cm} onChange={v => setFormAntrop(f => ({ ...f, perimetro_cadera_cm: v }))} placeholder="96" />
                    </div>
                    {formAntrop.peso_kg && formAntrop.talla_cm && (
                      <div className="mt-2 bg-neutral-50 rounded-lg p-2 text-xs text-neutral-600 flex gap-4">
                        <span>IMC: <strong>{calcularIMC(parseFloat(formAntrop.peso_kg), parseFloat(formAntrop.talla_cm))}</strong></span>
                        <span className={imcColorClass(calcularIMC(parseFloat(formAntrop.peso_kg), parseFloat(formAntrop.talla_cm)))}>
                          {clasificarIMCTexto(calcularIMC(parseFloat(formAntrop.peso_kg), parseFloat(formAntrop.talla_cm)))}
                        </span>
                        {formAntrop.perimetro_cintura_cm && formAntrop.perimetro_cadera_cm && (
                          <span>ICC: <strong>{(parseFloat(formAntrop.perimetro_cintura_cm) / parseFloat(formAntrop.perimetro_cadera_cm)).toFixed(2)}</strong></span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Avanzada */}
                  <button type="button" className="flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-neutral-800" onClick={() => setAvanzadaOpen(!avanzadaOpen)}>
                    {avanzadaOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    Antropometría avanzada (perímetros y pliegues)
                  </button>
                  {avanzadaOpen && (
                    <div className="flex flex-col gap-3 pl-3 border-l-2 border-neutral-100">
                      <div>
                        <p className="text-xs text-neutral-500 mb-2">Perímetros (cm)</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {[['per_brazo_relajado', 'Brazo relajado'], ['per_brazo_contraido', 'Brazo contraído'], ['per_torax', 'Tórax'], ['per_abdomen', 'Abdomen'], ['per_muslo', 'Muslo'], ['per_pantorrilla', 'Pantorrilla']].map(([k, l]) => (
                            <NumField key={k} label={l} value={(formAntrop as Record<string, string>)[k]} onChange={v => setFormAntrop(f => ({ ...f, [k]: v }))} />
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 mb-2">Pliegues (mm)</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[['pliegue_tricipital', 'Tricipital'], ['pliegue_bicipital', 'Bicipital'], ['pliegue_subescapular', 'Subescapular'], ['pliegue_suprailiaco', 'Suprailiaco'], ['pliegue_abdominal', 'Abdominal'], ['pliegue_muslo', 'Muslo'], ['pliegue_pantorrilla', 'Pantorrilla']].map(([k, l]) => (
                            <NumField key={k} label={l} value={(formAntrop as Record<string, string>)[k]} onChange={v => setFormAntrop(f => ({ ...f, [k]: v }))} />
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <NumField label="Envergadura (cm)" value={formAntrop.envergadura} onChange={v => setFormAntrop(f => ({ ...f, envergadura: v }))} />
                        <NumField label="Altura sentado (cm)" value={formAntrop.altura_sentado} onChange={v => setFormAntrop(f => ({ ...f, altura_sentado: v }))} />
                      </div>
                    </div>
                  )}

                  {/* Bioimpedancia */}
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="inclBio" checked={incluirBio} onChange={e => setIncluirBio(e.target.checked)} className="accent-emerald-600" />
                    <label htmlFor="inclBio" className="text-xs font-medium text-neutral-600">Incluir bioimpedancia</label>
                  </div>
                  {incluirBio && (
                    <div className="pl-3 border-l-2 border-neutral-100 flex flex-col gap-3">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[['masa_grasa_kg', 'Masa grasa (kg)'], ['masa_grasa_pct', '% Grasa'], ['masa_magra_kg', 'Masa magra (kg)'], ['masa_libre_grasa', 'Masa libre de grasa'], ['agua_corporal_lt', 'Agua corporal (L)'], ['agua_corporal_pct', '% Agua'], ['grasa_visceral', 'Grasa visceral'], ['proteina_corporal', 'Proteína corporal'], ['masa_osea', 'Masa ósea (kg)'], ['metabolismo_basal_kcal', 'Metabolismo basal (kcal)'], ['edad_metabolica', 'Edad metabólica']].map(([k, l]) => (
                          <NumField key={k} label={l} value={(formBio as Record<string, string>)[k]} onChange={v => setFormBio(f => ({ ...f, [k]: v }))} />
                        ))}
                      </div>
                      <button type="button" className="flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-neutral-800" onClick={() => setSegmentalOpen(!segmentalOpen)}>
                        {segmentalOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        Medición segmental
                      </button>
                      {segmentalOpen && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {[['seg_brazo_izq', 'Brazo izquierdo'], ['seg_brazo_der', 'Brazo derecho'], ['seg_tronco', 'Tronco'], ['seg_pierna_izq', 'Pierna izquierda'], ['seg_pierna_der', 'Pierna derecha']].map(([k, l]) => (
                            <NumField key={k} label={l} value={(formBio as Record<string, string>)[k]} onChange={v => setFormBio(f => ({ ...f, [k]: v }))} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">{editando ? 'Guardar cambios' : 'Registrar consulta'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Sub-components
function FormSection({ title, sectionKey, expanded, onToggle, children }: {
  title: string; sectionKey: string; expanded: boolean; onToggle: (k: string) => void; children: React.ReactNode
}) {
  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden">
      <button type="button" className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50 text-left" onClick={() => onToggle(sectionKey)}>
        <span className="text-sm font-semibold text-neutral-800">{title}</span>
        {expanded ? <ChevronUp className="h-4 w-4 text-neutral-400" /> : <ChevronDown className="h-4 w-4 text-neutral-400" />}
      </button>
      {expanded && <div className="p-4 border-t border-neutral-100">{children}</div>}
    </div>
  )
}

function TA({ label, value, onChange, placeholder, rows = 3 }: { label?: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <Label className="text-xs">{label}</Label>}
      <Textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} />
    </div>
  )
}

function NumField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-xs">{label}</Label>
      <Input type="number" step="0.1" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="text-sm" />
    </div>
  )
}

function InfoField({ label, value, col2 }: { label: string; value: string; col2?: boolean }) {
  return (
    <div className={col2 ? 'sm:col-span-2' : ''}>
      <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-neutral-800 whitespace-pre-wrap">{value}</p>
    </div>
  )
}

function MiniField({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-neutral-50 rounded p-2">
      <p className="text-xs text-neutral-400">{label}</p>
      <p className="text-sm text-neutral-700">{value}</p>
    </div>
  )
}

function MedBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1.5">
      <p className="text-xs text-emerald-600">{label}</p>
      <p className="text-sm font-semibold text-emerald-900">{value}</p>
    </div>
  )
}

function imcColorClass(imc: number): string {
  if (imc < 18.5) return 'text-blue-600'
  if (imc < 25) return 'text-emerald-600'
  if (imc < 30) return 'text-yellow-600'
  return 'text-red-600'
}

function clasificarIMCTexto(imc: number): string {
  if (imc < 18.5) return 'Bajo peso'
  if (imc < 25) return 'Normal'
  if (imc < 30) return 'Sobrepeso'
  if (imc < 35) return 'Obesidad I'
  if (imc < 40) return 'Obesidad II'
  return 'Obesidad III'
}
