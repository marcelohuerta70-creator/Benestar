'use client'

import { useEffect, useState } from 'react'
import { Save, UserCircle } from 'lucide-react'
import { perfilStorage } from '@/lib/storage'
import type { PerfilProfesional } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Leaf } from 'lucide-react'

const COLORES_PRESET = [
  { nombre: 'Verde clínico', color: '#059669' },
  { nombre: 'Azul corporativo', color: '#2563eb' },
  { nombre: 'Morado', color: '#7c3aed' },
  { nombre: 'Naranja', color: '#ea580c' },
  { nombre: 'Negro elegante', color: '#1a1a1a' },
  { nombre: 'Rosa', color: '#db2777' },
]

export default function PerfilPage() {
  const [form, setForm] = useState<PerfilProfesional>({
    nombre: '', profesion: 'Nutricionista', numero_registro: '',
    telefono: '', correo: '', direccion: '',
    color_principal: '#059669', color_texto_header: '#ffffff',
  } as PerfilProfesional)
  const [guardado, setGuardado] = useState(false)

  useEffect(() => { setForm(perfilStorage.get()) }, [])

  function update(field: keyof PerfilProfesional, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function guardar(e: React.FormEvent) {
    e.preventDefault()
    perfilStorage.set(form)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2500)
  }

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <UserCircle className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Perfil Profesional</h1>
          <p className="text-sm text-neutral-500">Datos del profesional e identidad visual</p>
        </div>
      </div>

      <form onSubmit={guardar} className="flex flex-col gap-5">
        {/* Datos profesionales */}
        <Card>
          <CardHeader>
            <CardTitle>Datos del profesional</CardTitle>
            <CardDescription>Aparecen en todos los PDF generados.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>Nombre completo</Label>
              <Input value={form.nombre} onChange={e => update('nombre', e.target.value)} placeholder="María Fernández García" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Profesión / Especialidad</Label>
              <Input value={form.profesion} onChange={e => update('profesion', e.target.value)} placeholder="Nutricionista Clínica" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>N° Registro (colegio)</Label>
              <Input value={form.numero_registro} onChange={e => update('numero_registro', e.target.value)} placeholder="12345" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Teléfono</Label>
              <Input value={form.telefono} onChange={e => update('telefono', e.target.value)} placeholder="+56 9 1234 5678" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Correo electrónico</Label>
              <Input type="email" value={form.correo} onChange={e => update('correo', e.target.value)} placeholder="nutricionista@ejemplo.cl" />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>Dirección del consultorio</Label>
              <Input value={form.direccion} onChange={e => update('direccion', e.target.value)} placeholder="Av. Providencia 1234, Santiago" />
            </div>
          </CardContent>
        </Card>

        {/* Identidad visual */}
        <Card>
          <CardHeader>
            <CardTitle>Identidad visual</CardTitle>
            <CardDescription>Personaliza los colores de tus documentos PDF.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {/* Presets */}
            <div>
              <p className="text-xs font-medium text-neutral-500 mb-2">Colores predefinidos</p>
              <div className="flex flex-wrap gap-2">
                {COLORES_PRESET.map(c => (
                  <button
                    key={c.color}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, color_principal: c.color }))}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-medium hover:border-neutral-400 transition-colors"
                    style={{ borderColor: form.color_principal === c.color ? c.color : undefined }}
                  >
                    <div className="h-3.5 w-3.5 rounded-full" style={{ background: c.color }} />
                    {c.nombre}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom pickers */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Color principal</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.color_principal}
                    onChange={e => update('color_principal', e.target.value)}
                    className="h-9 w-14 rounded cursor-pointer border border-neutral-200"
                  />
                  <Input value={form.color_principal} onChange={e => update('color_principal', e.target.value)} className="font-mono text-sm" maxLength={7} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Color texto encabezado</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.color_texto_header}
                    onChange={e => update('color_texto_header', e.target.value)}
                    className="h-9 w-14 rounded cursor-pointer border border-neutral-200"
                  />
                  <Input value={form.color_texto_header} onChange={e => update('color_texto_header', e.target.value)} className="font-mono text-sm" maxLength={7} />
                </div>
              </div>
            </div>

            {/* Vista previa en tiempo real */}
            <div>
              <p className="text-xs font-medium text-neutral-500 mb-2">Vista previa — encabezado PDF</p>
              <div className="rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
                <div className="p-4 flex items-center justify-between" style={{ background: form.color_principal }}>
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-white/20 flex items-center justify-center">
                      <Leaf className="h-4 w-4" style={{ color: form.color_texto_header }} />
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: form.color_texto_header }}>NUTRIS</p>
                      <p className="text-xs opacity-80" style={{ color: form.color_texto_header }}>Plan Alimentario</p>
                    </div>
                  </div>
                  <div className="text-right text-xs" style={{ color: form.color_texto_header }}>
                    {form.nombre && <p className="font-medium">{form.nombre}</p>}
                    {form.profesion && <p className="opacity-80">{form.profesion}</p>}
                    {form.numero_registro && <p className="opacity-70">Reg. {form.numero_registro}</p>}
                    {form.telefono && <p className="opacity-70">{form.telefono}</p>}
                  </div>
                </div>
                <div className="bg-white p-3 text-xs text-neutral-500">
                  <div className="h-2 bg-neutral-100 rounded w-3/4 mb-1.5" />
                  <div className="h-2 bg-neutral-100 rounded w-1/2 mb-1.5" />
                  <div className="h-2 bg-neutral-100 rounded w-2/3" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-xs text-neutral-400">Los cambios se guardan en este dispositivo.</p>
          <Button type="submit" className="gap-2">
            <Save className="h-4 w-4" />
            {guardado ? '¡Guardado!' : 'Guardar perfil'}
          </Button>
        </div>
      </form>
    </div>
  )
}
