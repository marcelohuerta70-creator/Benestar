'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Check } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const PROFESIONES = [
  { id: 'nutricionista', nombre: 'Nutricionista', estado: 'Disponible' },
  { id: 'psicologo', nombre: 'Psicólogo', estado: 'Próximamente' },
  { id: 'kinesiologo', nombre: 'Kinesiólogo', estado: 'Próximamente' },
  { id: 'terapeuta_ocupacional', nombre: 'Terapeuta Ocupacional', estado: 'Próximamente' },
  { id: 'preparador_fisico', nombre: 'Preparador Físico', estado: 'Próximamente' },
]

export default function RegistroPage() {
  const { signup } = useAuth()
  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirm: '', profesion: 'nutricionista' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre || !form.email || !form.password || !form.profesion) {
      setError('Completa todos los campos.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await signup(form.email, form.password, form.nombre, form.profesion)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Volver al inicio */}
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900 mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <Image src="/logo-benestar.png" alt="Benestar" width={64} height={64} className="rounded-xl" />
          <span className="text-xl font-semibold text-neutral-900 tracking-tight">Benestar</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8">
          <div className="mb-5">
            <h1 className="text-xl font-semibold text-neutral-900 mb-1">Crear cuenta gratis</h1>
            <p className="text-sm text-neutral-500">Empieza con 3 pacientes, sin tarjeta.</p>
          </div>

          {/* Beneficios */}
          <div className="flex flex-col gap-1.5 mb-6 p-3 bg-emerald-50 rounded-lg">
            {['Ficha clínica completa', 'Minutas en PDF', '3 pacientes gratis'].map(b => (
              <div key={b} className="flex items-center gap-2 text-xs text-emerald-700">
                <Check className="h-3.5 w-3.5 shrink-0" />
                {b}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input
                id="nombre"
                placeholder="María Fernández García"
                value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                autoComplete="name"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profesion">Profesión</Label>
              <div className="flex flex-col gap-2">
                {PROFESIONES.map(prof => (
                  <label key={prof.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    form.profesion === prof.id
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  } ${prof.estado === 'Próximamente' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <input
                      type="radio"
                      name="profesion"
                      value={prof.id}
                      checked={form.profesion === prof.id}
                      onChange={e => setForm(f => ({ ...f, profesion: e.target.value }))}
                      disabled={prof.estado === 'Próximamente'}
                      className="cursor-pointer"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900">{prof.nombre}</p>
                      {prof.estado === 'Próximamente' && (
                        <p className="text-xs text-neutral-500">{prof.estado}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="nutricionista@ejemplo.cl"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                autoComplete="email"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm">Confirmar contraseña</Label>
              <Input
                id="confirm"
                type="password"
                placeholder="Repite la contraseña"
                value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" className="mt-1 w-full" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </Button>
          </form>

          <p className="text-xs text-center text-neutral-500 mt-5">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-emerald-600 hover:underline font-medium">
              Iniciar sesión
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-neutral-400 mt-6">
          © 2026 Benestar · Plataforma para profesionales de salud
        </p>
      </div>
    </div>
  )
}
