'use client'

import { useState } from 'react'
import { sessionStorage } from '@/lib/storage'
import { supabase } from '@/lib/supabase'
import type { Paciente } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

const OBJETIVOS = [
  'Pérdida de peso',
  'Ganancia muscular',
  'Mantenimiento',
  'Control de colesterol y glucosa',
  'Nutrición deportiva',
  'Nutrición prenatal',
  'Control de hipertensión',
  'Nutrición pediátrica',
  'Otro',
]

export function NuevoPacienteDialog({ open, onOpenChange, onCreated }: Props) {
  const [form, setForm] = useState({
    nombre_completo: '',
    rut: '',
    fecha_nacimiento: '',
    sexo: '' as 'M' | 'F' | '',
    email: '',
    telefono: '',
    objetivo: '',
    notas_generales: '',
  })

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre_completo || !form.rut || !form.fecha_nacimiento || !form.sexo || !form.objetivo) {
      return
    }

    try {
      const session = sessionStorage.get()
      if (!session) {
        alert('No hay sesión activa')
        return
      }

      // Obtener el usuario_id desde Supabase Auth
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Error: No hay usuario autenticado')
        return
      }

      // 1. Crear paciente en Supabase
      const { data: paciente, error: pacienteError } = await supabase
        .from('pacientes')
        .insert({
          profesional_id: user.id,
          nombre_completo: form.nombre_completo,
          rut: form.rut,
          fecha_nacimiento: form.fecha_nacimiento,
          sexo: form.sexo,
          email: form.email,
          telefono: form.telefono,
          objetivo: form.objetivo,
          notas_generales: form.notas_generales,
          estado: 'activo',
          portal_activo: false,
          contraseña_hash: '$2b$10$Pxd7LpT/tyxSW97fTSaZQOq2LuOeGy0M5zRY/7VfrfB4NEGwQAge6', // benestar123 hasheado
        })
        .select()
        .single()

      if (pacienteError) {
        console.error('[Paciente Error]', pacienteError)
        alert('Error al crear paciente: ' + pacienteError.message)
        return
      }

      // 2. Crear relación paciente_profesional automáticamente
      const { error: relError } = await supabase
        .from('paciente_profesional')
        .insert({
          paciente_id: paciente.id,
          profesional_id: user.id,
          especialidad: 'nutricion',
        })

      if (relError) {
        console.error('[Relation Error]', relError)
      }

      setForm({ nombre_completo: '', rut: '', fecha_nacimiento: '', sexo: '', email: '', telefono: '', objetivo: '', notas_generales: '' })
      onOpenChange(false)
      onCreated()
    } catch (err) {
      console.error('[Create Patient Error]', err)
      alert('Error al crear paciente: ' + (err instanceof Error ? err.message : 'Desconocido'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo paciente</DialogTitle>
          <DialogDescription>Completa los datos básicos del paciente.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nombre">Nombre completo *</Label>
            <Input id="nombre" placeholder="María González Riquelme" value={form.nombre_completo} onChange={e => update('nombre_completo', e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rut">RUT *</Label>
              <Input id="rut" placeholder="12.345.678-9" value={form.rut} onChange={e => update('rut', e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nacimiento">Fecha de nacimiento *</Label>
              <Input id="nacimiento" type="date" value={form.fecha_nacimiento} onChange={e => update('fecha_nacimiento', e.target.value)} required />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Sexo *</Label>
            <Select value={form.sexo} onValueChange={v => update('sexo', v)}>
              <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="F">Femenino</SelectItem>
                <SelectItem value="M">Masculino</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="correo@ejemplo.cl" value={form.email} onChange={e => update('email', e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" placeholder="+56 9 1234 5678" value={form.telefono} onChange={e => update('telefono', e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Objetivo *</Label>
            <Select value={form.objetivo} onValueChange={v => update('objetivo', v)}>
              <SelectTrigger><SelectValue placeholder="Seleccionar objetivo" /></SelectTrigger>
              <SelectContent>
                {OBJETIVOS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notas">Notas iniciales</Label>
            <Textarea id="notas" placeholder="Antecedentes relevantes, medicamentos, alergias..." value={form.notas_generales} onChange={e => update('notas_generales', e.target.value)} rows={3} />
          </div>

          <div className="flex gap-3 justify-end mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Crear paciente</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
