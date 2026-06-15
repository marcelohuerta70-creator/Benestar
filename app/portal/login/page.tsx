'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { usePortalAuth } from '@/contexts/portal-auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function PortalLoginPage() {
  const { login, selectEspecialidad } = usePortalAuth()
  const router = useRouter()
  const [rut, setRut] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rut || !password) { setError('Ingresa tu RUT y contraseña.'); return }
    setError('')
    setLoading(true)
    try {
      const result = await login(rut, password)
      console.log('[Login Result]', {
        ok: result.ok,
        especialidadesCount: result.ok ? result.especialidades.length : 0,
        error: !result.ok ? result.error : undefined,
      })
      if (!result.ok) {
        setError(result.error)
        console.error('[Login Debug]', result)
        return
      }

      if (result.especialidades.length > 1) {
        console.log('Navegando a especialidades')
        router.push('/portal/especialidades')
      } else {
        console.log('Navegando a dashboard con especialidad:', result.especialidades[0])
        const portalSession = {
          paciente_id: result.paciente.id,
          rut: result.paciente.rut,
          nombre: result.paciente.nombre_completo,
          especialidad: result.especialidades[0]
        }
        localStorage.setItem('portal_session', JSON.stringify(portalSession))
        router.push('/portal/dashboard')
      }
    } catch (err) {
      setError('Error inesperado. Intenta de nuevo.')
      console.error('[Login Error]', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-neutral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Volver */}
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900 mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <div className="flex items-center justify-center gap-2.5 mb-8">
          <Image src="/logo-benestar.png" alt="Benestar" width={80} height={80} className="rounded-xl shadow-md" />
          <div>
            <span className="text-xl font-semibold text-neutral-900 tracking-tight">Benestar</span>
            <p className="text-xs text-neutral-500">Portal del Paciente</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8">
          <div className="mb-5">
            <h1 className="text-lg font-semibold text-neutral-900 mb-1">Acceso al portal</h1>
            <p className="text-sm text-neutral-500">Ingresa con las credenciales entregadas por tu nutricionista.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rut">RUT</Label>
              <Input id="rut" placeholder="12.345.678-9" value={rut} onChange={e => setRut(e.target.value)} autoComplete="username" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="mt-1 w-full" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>

          <div className="mt-5 pt-5 border-t border-neutral-100">
            <p className="text-xs text-center text-neutral-400">
              Demo: María González · RUT: <strong>12.345.678-9</strong> · Clave: <strong>benestar123</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
