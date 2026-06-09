'use client'

import { useState } from 'react'
import { Edit2, Check, X } from 'lucide-react'
import type { Paciente } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props { paciente: Paciente; onUpdate: (p: Paciente) => void }

const CAMPOS = [
  { key: 'habito_actividad_fisica', label: 'Actividad física', placeholder: 'Tipo, frecuencia, intensidad...' },
  { key: 'habito_consumo_agua', label: 'Consumo de agua', placeholder: 'Litros al día, tipo de bebidas...' },
  { key: 'habito_sueno', label: 'Sueño', placeholder: 'Horas, calidad, horarios...' },
  { key: 'habito_alcohol', label: 'Alcohol', placeholder: 'Frecuencia, tipo, cantidad...' },
  { key: 'habito_tabaco', label: 'Tabaco', placeholder: 'Cigarrillos al día, años de consumo...' },
  { key: 'habito_drogas', label: 'Otras sustancias', placeholder: 'Tipo, frecuencia...' },
  { key: 'habito_deposiciones', label: 'Deposiciones', placeholder: 'Frecuencia, consistencia, dificultades...' },
] as const

type HabitoKey = typeof CAMPOS[number]['key']

type FormState = Record<HabitoKey, string> & { habitos_libres: string }

export function FichaHabitos({ paciente, onUpdate }: Props) {
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState<FormState>({
    habito_actividad_fisica: paciente.habito_actividad_fisica || '',
    habito_consumo_agua: paciente.habito_consumo_agua || '',
    habito_sueno: paciente.habito_sueno || '',
    habito_alcohol: paciente.habito_alcohol || '',
    habito_tabaco: paciente.habito_tabaco || '',
    habito_drogas: paciente.habito_drogas || '',
    habito_deposiciones: paciente.habito_deposiciones || '',
    habitos_libres: paciente.habitos_libres || '',
  })

  function guardar() {
    onUpdate({ ...paciente, ...form })
    setEditando(false)
  }

  function cancelar() {
    setForm({
      habito_actividad_fisica: paciente.habito_actividad_fisica || '',
      habito_consumo_agua: paciente.habito_consumo_agua || '',
      habito_sueno: paciente.habito_sueno || '',
      habito_alcohol: paciente.habito_alcohol || '',
      habito_tabaco: paciente.habito_tabaco || '',
      habito_drogas: paciente.habito_drogas || '',
      habito_deposiciones: paciente.habito_deposiciones || '',
      habitos_libres: paciente.habitos_libres || '',
    })
    setEditando(false)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Hábitos de vida</h2>
          <p className="text-sm text-neutral-500 mt-0.5">Estilo de vida y conductas relevantes del paciente</p>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CAMPOS.map(campo => (
          <Card key={campo.key}>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{campo.label}</CardTitle></CardHeader>
            <CardContent>
              {!editando ? (
                <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">
                  {(paciente as unknown as Record<string, string>)[campo.key] || <span className="text-neutral-400 italic">Sin información</span>}
                </p>
              ) : (
                <Textarea
                  value={form[campo.key]}
                  onChange={e => setForm(f => ({ ...f, [campo.key]: e.target.value }))}
                  placeholder={campo.placeholder}
                  rows={2}
                />
              )}
            </CardContent>
          </Card>
        ))}

        {/* Notas libres */}
        <Card className="sm:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Notas libres</CardTitle></CardHeader>
          <CardContent>
            {!editando ? (
              <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">
                {paciente.habitos_libres || <span className="text-neutral-400 italic">Sin notas adicionales</span>}
              </p>
            ) : (
              <Textarea
                value={form.habitos_libres}
                onChange={e => setForm(f => ({ ...f, habitos_libres: e.target.value }))}
                placeholder="Cualquier observación adicional sobre los hábitos del paciente..."
                rows={3}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
