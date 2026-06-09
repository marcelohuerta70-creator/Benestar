'use client'

import { useState } from 'react'
import { Edit2, Check, X } from 'lucide-react'
import type { Paciente, TipoPaciente } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props { paciente: Paciente; onUpdate: (p: Paciente) => void }

const TIPOS: { value: TipoPaciente; label: string }[] = [
  { value: 'adulto', label: 'Adulto' },
  { value: 'adulto_mayor', label: 'Adulto Mayor' },
  { value: 'embarazada', label: 'Embarazada' },
  { value: 'nodriza', label: 'Nodriza' },
  { value: 'lactante', label: 'Lactante' },
  { value: 'preescolar', label: 'Preescolar' },
  { value: 'escolar', label: 'Escolar' },
  { value: 'adolescente', label: 'Adolescente' },
  { value: 'postrado', label: 'Postrado / Dependiente' },
  { value: 'deportista', label: 'Deportista' },
  { value: 'otro', label: 'Otro' },
]

const CAMPOS_POR_TIPO: Record<TipoPaciente, Array<{ key: string; label: string; tipo?: string }>> = {
  adulto: [],
  adulto_mayor: [
    { key: 'dependencia', label: 'Dependencia' },
    { key: 'protesis_dental', label: 'Uso de prótesis dental' },
    { key: 'pacam', label: 'PACAM' },
    { key: 'notas', label: 'Notas adicionales', tipo: 'textarea' },
  ],
  embarazada: [
    { key: 'fur', label: 'FUR (Fecha última regla)', tipo: 'date' },
    { key: 'semanas_gestacion', label: 'Semanas de gestación' },
    { key: 'fecha_probable_parto', label: 'Fecha probable de parto', tipo: 'date' },
    { key: 'notas', label: 'Notas adicionales', tipo: 'textarea' },
  ],
  nodriza: [
    { key: 'edad_lactante', label: 'Edad del lactante' },
    { key: 'tipo_lactancia', label: 'Tipo de lactancia' },
    { key: 'notas', label: 'Notas adicionales', tipo: 'textarea' },
  ],
  lactante: [
    { key: 'tipo_alimentacion', label: 'Tipo de alimentación' },
    { key: 'suplementacion', label: 'Suplementación' },
    { key: 'cuidador_principal', label: 'Cuidador principal' },
    { key: 'notas', label: 'Notas adicionales', tipo: 'textarea' },
  ],
  preescolar: [
    { key: 'jardin_infantil', label: 'Jardín infantil' },
    { key: 'responsable_alimentacion', label: 'Responsable de alimentación' },
    { key: 'notas', label: 'Notas adicionales', tipo: 'textarea' },
  ],
  escolar: [
    { key: 'curso', label: 'Curso' },
    { key: 'establecimiento', label: 'Establecimiento educacional' },
    { key: 'notas', label: 'Notas adicionales', tipo: 'textarea' },
  ],
  adolescente: [
    { key: 'actividad_fisica', label: 'Actividad física' },
    { key: 'conductas_riesgo', label: 'Conductas alimentarias de riesgo', tipo: 'textarea' },
    { key: 'notas', label: 'Notas adicionales', tipo: 'textarea' },
  ],
  postrado: [
    { key: 'dependencia', label: 'Dependencia' },
    { key: 'cuidador_principal', label: 'Cuidador principal' },
    { key: 'via_alimentacion', label: 'Vía de alimentación' },
    { key: 'notas', label: 'Notas adicionales', tipo: 'textarea' },
  ],
  deportista: [
    { key: 'disciplina', label: 'Disciplina deportiva' },
    { key: 'nivel', label: 'Nivel (amateur/semipro/profesional)' },
    { key: 'dias_entrenamiento', label: 'Días de entrenamiento por semana' },
    { key: 'horas_semanales', label: 'Horas de entrenamiento semanales' },
    { key: 'proxima_competencia', label: 'Próxima competencia', tipo: 'date' },
    { key: 'objetivo_deportivo', label: 'Objetivo deportivo', tipo: 'textarea' },
    { key: 'notas', label: 'Notas adicionales', tipo: 'textarea' },
  ],
  otro: [
    { key: 'notas', label: 'Descripción / notas', tipo: 'textarea' },
  ],
}

export function FichaTipoPaciente({ paciente, onUpdate }: Props) {
  const [editando, setEditando] = useState(false)
  const [tipoPaciente, setTipoPaciente] = useState<TipoPaciente | ''>(paciente.tipo_paciente || '')
  const [datos, setDatos] = useState<Record<string, string>>(paciente.tipo_paciente_datos || {})

  function updateDato(key: string, value: string) {
    setDatos(prev => ({ ...prev, [key]: value }))
  }

  function guardar() {
    const updated: Paciente = {
      ...paciente,
      tipo_paciente: tipoPaciente as TipoPaciente || undefined,
      tipo_paciente_datos: datos,
    }
    onUpdate(updated)
    setEditando(false)
  }

  function cancelar() {
    setTipoPaciente(paciente.tipo_paciente || '')
    setDatos(paciente.tipo_paciente_datos || {})
    setEditando(false)
  }

  const campos = tipoPaciente ? CAMPOS_POR_TIPO[tipoPaciente] : []
  const tipoLabel = TIPOS.find(t => t.value === paciente.tipo_paciente)?.label

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end">
        {!editando ? (
          <Button variant="outline" size="sm" onClick={() => setEditando(true)} className="gap-1.5">
            <Edit2 className="h-3.5 w-3.5" /> Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={cancelar} className="gap-1.5">
              <X className="h-3.5 w-3.5" /> Cancelar
            </Button>
            <Button size="sm" onClick={guardar} className="gap-1.5">
              <Check className="h-3.5 w-3.5" /> Guardar
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle>Clasificación del paciente</CardTitle></CardHeader>
        <CardContent>
          {!editando ? (
            <div>
              {tipoLabel ? (
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-lg px-3 py-2 text-sm font-medium">
                  {tipoLabel}
                </div>
              ) : (
                <p className="text-sm text-neutral-400 italic">Sin tipo de paciente definido.</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <Label>Tipo de paciente</Label>
              <Select value={tipoPaciente} onValueChange={v => { setTipoPaciente(v as TipoPaciente); setDatos({}) }}>
                <SelectTrigger className="max-w-xs"><SelectValue placeholder="Seleccionar tipo..." /></SelectTrigger>
                <SelectContent>
                  {TIPOS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campos condicionales */}
      {(editando ? (tipoPaciente && campos.length > 0) : (paciente.tipo_paciente && campos.length > 0)) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>
              Datos específicos — {TIPOS.find(t => t.value === (editando ? tipoPaciente : paciente.tipo_paciente))?.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!editando ? (
              <div className="grid grid-cols-2 gap-4">
                {CAMPOS_POR_TIPO[paciente.tipo_paciente!].map(campo => (
                  <div key={campo.key} className={campo.tipo === 'textarea' ? 'col-span-2' : ''}>
                    <p className="text-xs text-neutral-500 mb-0.5">{campo.label}</p>
                    <p className="text-sm font-medium text-neutral-900 whitespace-pre-wrap">
                      {(paciente.tipo_paciente_datos || {})[campo.key] || '—'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {campos.map(campo => (
                  <div key={campo.key} className={`flex flex-col gap-1.5 ${campo.tipo === 'textarea' ? 'col-span-2' : ''}`}>
                    <Label>{campo.label}</Label>
                    {campo.tipo === 'textarea' ? (
                      <Textarea
                        value={datos[campo.key] || ''}
                        onChange={e => updateDato(campo.key, e.target.value)}
                        rows={3}
                      />
                    ) : campo.tipo === 'date' ? (
                      <Input type="date" value={datos[campo.key] || ''} onChange={e => updateDato(campo.key, e.target.value)} />
                    ) : (
                      <Input value={datos[campo.key] || ''} onChange={e => updateDato(campo.key, e.target.value)} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!editando && !paciente.tipo_paciente && (
        <div className="text-center py-12 text-neutral-400">
          <p className="text-sm">Haz clic en <strong>Editar</strong> para seleccionar el tipo de paciente.</p>
        </div>
      )}
    </div>
  )
}
