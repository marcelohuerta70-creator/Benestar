'use client'

import { useEffect, useState } from 'react'
import { Edit2, Check, X, Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Paciente, Medicamento } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props { paciente: Paciente; onUpdate: (p: Paciente) => void }

export function FichaClinica({ paciente, onUpdate }: Props) {
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState({
    enfermedades: paciente.enfermedades || '',
    alergias_farmacologicas: paciente.alergias_farmacologicas || '',
    antecedentes_familiares: paciente.antecedentes_familiares || '',
    cirugias_previas: paciente.cirugias_previas || '',
    observaciones_clinicas: paciente.observaciones_clinicas || '',
    notas_clinica: (paciente as any).notas_clinica || '',
  })
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([])
  const [nuevoMed, setNuevoMed] = useState({ nombre: '', dosis: '', frecuencia: '' })

  async function recargarMeds() {
    try {
      const { data } = await supabase
        .from('medicamentos')
        .select('*')
        .eq('paciente_id', paciente.id)
      setMedicamentos((data || []) as Medicamento[])
    } catch (err) {
      console.error('[Load Meds Error]', err)
    }
  }

  useEffect(() => { recargarMeds() }, [paciente.id])

  function guardar() {
    onUpdate({ ...paciente, ...form })
    setEditando(false)
  }

  function cancelar() {
    setForm({
      enfermedades: paciente.enfermedades || '',
      alergias_farmacologicas: paciente.alergias_farmacologicas || '',
      antecedentes_familiares: paciente.antecedentes_familiares || '',
      cirugias_previas: paciente.cirugias_previas || '',
      observaciones_clinicas: paciente.observaciones_clinicas || '',
      notas_clinica: (paciente as any).notas_clinica || '',
    })
    setEditando(false)
  }

  async function agregarMedicamento() {
    if (!nuevoMed.nombre) return
    try {
      await supabase.from('medicamentos').insert({
        paciente_id: paciente.id,
        nombre: nuevoMed.nombre,
        dosis: nuevoMed.dosis,
        frecuencia: nuevoMed.frecuencia,
      })
      setNuevoMed({ nombre: '', dosis: '', frecuencia: '' })
      await recargarMeds()
    } catch (err) {
      console.error('[Add Med Error]', err)
    }
  }

  async function eliminarMedicamento(id: string) {
    try {
      await supabase.from('medicamentos').delete().eq('id', id)
      await recargarMeds()
    } catch (err) {
      console.error('[Delete Med Error]', err)
    }
  }

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

      {/* Enfermedades */}
      <TextCard
        titulo="Enfermedades / Diagnósticos"
        valor={paciente.enfermedades || ''}
        editando={editando}
        placeholder="Diabetes tipo 2, Hipertensión arterial, Hipotiroidismo..."
        onChange={v => setForm(f => ({ ...f, enfermedades: v }))}
        formValue={form.enfermedades}
      />

      {/* Medicamentos */}
      <Card>
        <CardHeader className="pb-3"><CardTitle>Medicamentos actuales</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          {medicamentos.length === 0 ? (
            <p className="text-sm text-neutral-400 italic">Sin medicamentos registrados.</p>
          ) : (
            <div className="border border-neutral-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Medicamento</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Dosis</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Frecuencia</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {medicamentos.map(m => (
                    <tr key={m.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-2.5 text-neutral-900 font-medium">{m.nombre}</td>
                      <td className="px-4 py-2.5 text-neutral-600">{m.dosis || '—'}</td>
                      <td className="px-4 py-2.5 text-neutral-600">{m.frecuencia || '—'}</td>
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => { if (confirm('¿Eliminar?')) { eliminarMedicamento(m.id) } }}
                          className="text-neutral-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Agregar medicamento */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Agregar medicamento</p>
            <div className="flex gap-2 flex-wrap">
              <Input
                className="flex-1 min-w-32"
                placeholder="Nombre del medicamento *"
                value={nuevoMed.nombre}
                onChange={e => setNuevoMed(n => ({ ...n, nombre: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && agregarMedicamento()}
              />
              <Input
                className="w-28"
                placeholder="Dosis"
                value={nuevoMed.dosis}
                onChange={e => setNuevoMed(n => ({ ...n, dosis: e.target.value }))}
              />
              <Input
                className="flex-1 min-w-32"
                placeholder="Frecuencia"
                value={nuevoMed.frecuencia}
                onChange={e => setNuevoMed(n => ({ ...n, frecuencia: e.target.value }))}
              />
              <Button variant="outline" size="sm" onClick={agregarMedicamento} className="gap-1.5 shrink-0">
                <Plus className="h-3.5 w-3.5" /> Agregar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <TextCard
        titulo="Alergias farmacológicas"
        valor={paciente.alergias_farmacologicas || ''}
        editando={editando}
        placeholder="Penicilina, AINEs, Sulfonamidas..."
        onChange={v => setForm(f => ({ ...f, alergias_farmacologicas: v }))}
        formValue={form.alergias_farmacologicas}
      />

      <TextCard
        titulo="Antecedentes familiares"
        valor={paciente.antecedentes_familiares || ''}
        editando={editando}
        placeholder="Diabetes en padres, enfermedades cardiovasculares, cáncer..."
        onChange={v => setForm(f => ({ ...f, antecedentes_familiares: v }))}
        formValue={form.antecedentes_familiares}
      />

      <TextCard
        titulo="Cirugías previas"
        valor={paciente.cirugias_previas || ''}
        editando={editando}
        placeholder="Colecistectomía 2018, manga gástrica 2020..."
        onChange={v => setForm(f => ({ ...f, cirugias_previas: v }))}
        formValue={form.cirugias_previas}
      />

      <TextCard
        titulo="Observaciones clínicas"
        valor={paciente.observaciones_clinicas || ''}
        editando={editando}
        placeholder="Otras observaciones relevantes para el tratamiento..."
        onChange={v => setForm(f => ({ ...f, observaciones_clinicas: v }))}
        formValue={form.observaciones_clinicas}
      />

      <TextCard
        titulo="Notas libres"
        valor={paciente.notas_clinica || ''}
        editando={editando}
        placeholder="Espacio libre para cualquier nota clínica adicional..."
        onChange={v => setForm(f => ({ ...f, notas_clinica: v }))}
        formValue={form.notas_clinica}
      />
    </div>
  )
}

function TextCard({ titulo, valor, editando, placeholder, onChange, formValue }: {
  titulo: string; valor: string; editando: boolean
  placeholder: string; onChange: (v: string) => void; formValue: string
}) {
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle>{titulo}</CardTitle></CardHeader>
      <CardContent>
        {!editando ? (
          <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">
            {valor || <span className="text-neutral-400 italic">Sin información.</span>}
          </p>
        ) : (
          <Textarea value={formValue} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} />
        )}
      </CardContent>
    </Card>
  )
}
