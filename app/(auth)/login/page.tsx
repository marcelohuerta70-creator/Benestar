'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      setError('Ingresa tu email y contraseña.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch {
      setError('Error al iniciar sesión. Intenta de nuevo.')
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
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-neutral-900 mb-1">Portal Profesional</h1>
            <p className="text-sm text-neutral-500">Ingresa tus datos para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nutricionista@ejemplo.cl"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <Button type="submit" className="mt-2 w-full" disabled={loading}>
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-neutral-100">
            <p className="text-xs text-center text-neutral-400">
              Demo — cualquier credencial funciona
            </p>
          </div>
        </div>

        {/* Link a portal paciente */}
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-600 mb-2">¿Eres paciente?</p>
          <Link href="/portal" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
            Accede al portal del paciente →
          </Link>
        </div>

        <p className="text-center text-xs text-neutral-400 mt-8">
          © 2026 Benestar · Plataforma para profesionales de salud
        </p>
      </div>
    </div>
  )
}
