'use client'

import { useState } from 'react'
import { Edit2, Check, X } from 'lucide-react'
import type { Paciente } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Props { paciente: Paciente; onUpdate: (p: Paciente) => void }

const TIPOS_ALIMENTACION = [
  { value: 'omnivoro', label: 'Omnívoro' },
  { value: 'vegetariano', label: 'Vegetariano' },
  { value: 'vegano', label: 'Vegano' },
  { value: 'pescetariano', label: 'Pescetariano' },
  { value: 'otro', label: 'Otro' },
]

export function FichaAlimentacion({ paciente, onUpdate }: Props) {
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState({
    tipo_alimentacion: paciente.tipo_alimentacion || '',
    tipo_alimentacion_otro: paciente.tipo_alimentacion_otro || '',
    preferencias_alimentarias: paciente.preferencias_alimentarias || '',
    alergias_alimentarias: paciente.alergias_alimentarias || '',
    alimentos_no_consume: paciente.alimentos_no_consume || '',
    suplementos_habituales: paciente.suplementos_habituales || '',
    alimentacion_libres: paciente.alimentacion_libres || '',
  })

  function guardar() {
    onUpdate({ ...paciente, ...form })
    setEditando(false)
  }

  function cancelar() {
    setForm({
      tipo_alimentacion: paciente.tipo_alimentacion || '',
      tipo_alimentacion_otro: paciente.tipo_alimentacion_otro || '',
      preferencias_alimentarias: paciente.preferencias_alimentarias || '',
      alergias_alimentarias: paciente.alergias_alimentarias || '',
      alimentos_no_consume: paciente.alimentos_no_consume || '',
      suplementos_habituales: paciente.suplementos_habituales || '',
      alimentacion_libres: paciente.alimentacion_libres || '',
    })
    setEditando(false)
  }

  const tipoLabel = TIPOS_ALIMENTACION.find(t => t.value === paciente.tipo_alimentacion)?.label

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Evaluación alimentaria</h2>
          <p className="text-sm text-neutral-500 mt-0.5">Tipo de alimentación, preferencias y restricciones</p>
        </div>
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

      {/* Tipo de alimentación */}
      <Card>
        <CardHeader className="pb-3"><CardTitle>Tipo de alimentación</CardTitle></CardHeader>
        <CardContent>
          {!editando ? (
            <div className="flex items-center gap-3">
              {tipoLabel ? (
                <Badge variant="default" className="text-sm py-1 px-3">{tipoLabel}</Badge>
              ) : (
                <p className="text-sm text-neutral-400 italic">Sin definir</p>
              )}
              {paciente.tipo_alimentacion === 'otro' && paciente.tipo_alimentacion_otro && (
                <span className="text-sm text-neutral-600">({paciente.tipo_alimentacion_otro})</span>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Tipo de alimentación</Label>
                <Select value={form.tipo_alimentacion} onValueChange={v => setForm(f => ({ ...f, tipo_alimentacion: v }))}>
                  <SelectTrigger className="max-w-xs"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    {TIPOS_ALIMENTACION.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {form.tipo_alimentacion === 'otro' && (
                <div className="flex flex-col gap-1.5">
                  <Label>Especificar</Label>
                  <Input value={form.tipo_alimentacion_otro} onChange={e => setForm(f => ({ ...f, tipo_alimentacion_otro: e.target.value }))} placeholder="Describe el tipo de alimentación" />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preferencias */}
      <TextAreaCard
        titulo="Preferencias alimentarias"
        valor={paciente.preferencias_alimentarias || ''}
        editando={editando}
        placeholder="Alimentos que el paciente prefiere o le agradan..."
        onChange={v => setForm(f => ({ ...f, preferencias_alimentarias: v }))}
        formValue={form.preferencias_alimentarias}
      />

      {/* Alergias alimentarias */}
      <Card>
        <CardHeader className="pb-3"><CardTitle>Alergias e intolerancias alimentarias</CardTitle></CardHeader>
        <CardContent>
          {!editando ? (
            <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">
              {paciente.alergias_alimentarias || <span className="text-neutral-400 italic">Sin alergias reportadas</span>}
            </p>
          ) : (
            <Textarea
              value={form.alergias_alimentarias}
              onChange={e => setForm(f => ({ ...f, alergias_alimentarias: e.target.value }))}
              placeholder="Gluten, lactosa, mariscos, nueces..."
              rows={3}
            />
          )}
        </CardContent>
      </Card>

      <TextAreaCard
        titulo="Alimentos que no consume"
        valor={paciente.alimentos_no_consume || ''}
        editando={editando}
        placeholder="Alimentos que el paciente no consume por preferencia (no por alergia)..."
        onChange={v => setForm(f => ({ ...f, alimentos_no_consume: v }))}
        formValue={form.alimentos_no_consume}
      />

      <TextAreaCard
        titulo="Suplementos habituales"
        valor={paciente.suplementos_habituales || ''}
        editando={editando}
        placeholder="Suplementos que el paciente consume por cuenta propia..."
        onChange={v => setForm(f => ({ ...f, suplementos_habituales: v }))}
        formValue={form.suplementos_habituales}
      />

      <TextAreaCard
        titulo="Notas libres — Alimentación"
        valor={paciente.alimentacion_libres || ''}
        editando={editando}
        placeholder="Cualquier observación adicional sobre la alimentación del paciente..."
        onChange={v => setForm(f => ({ ...f, alimentacion_libres: v }))}
        formValue={form.alimentacion_libres}
      />
    </div>
  )
}

function TextAreaCard({ titulo, valor, editando, placeholder, onChange, formValue }: {
  titulo: string; valor: string; editando: boolean
  placeholder: string; onChange: (v: string) => void; formValue: string
}) {
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle>{titulo}</CardTitle></CardHeader>
      <CardContent>
        {!editando ? (
          <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">
            {valor || <span className="text-neutral-400 italic">Sin información</span>}
          </p>
        ) : (
          <Textarea value={formValue} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} />
        )}
      </CardContent>
    </Card>
  )
}
