'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { usePortalAuth } from '@/contexts/portal-auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ESPECIALIDADES_MAP } from '@/lib/especialidades-config'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const ESPECIALIDAD_INFO = {
  nutricion: { icon: '🥗', nombre: 'Nutrición', desc: 'Consulta tu plan alimentario y progreso' },
  psicologia: { icon: '🧠', nombre: 'Psicología', desc: 'Accede a tus notas de sesión' },
  kinesiologia: { icon: '💪', nombre: 'Kinesiología', desc: 'Revisa tu plan de rehabilitación' },
  terapia_ocupacional: { icon: '✋', nombre: 'Terapia Ocupacional', desc: 'Consulta tu plan de intervención' },
  preparador_fisico: { icon: '🏃', nombre: 'Preparador Físico', desc: 'Accede a tu programa de entrenamiento' },
}

export default function EspecialidadesPage() {
  const { session, especialidades, selectEspecialidad, logout } = usePortalAuth()
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push('/portal/login')
    }
  }, [session, router])

  if (!session) return null

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo-benestar.png" alt="Benestar" width={56} height={56} className="rounded-lg" />
            <span className="font-semibold text-neutral-900">Benestar</span>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            Cerrar sesión
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Hola, {session.nombre.split(' ')[0]}</h1>
          <p className="text-neutral-600">Selecciona a cuál especialidad quieres acceder</p>
        </div>

        {/* Grid de especialidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {especialidades.map(esp => {
            const info = ESPECIALIDAD_INFO[esp as keyof typeof ESPECIALIDAD_INFO]
            return (
              <Card key={esp} className="cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <button
                    onClick={() => selectEspecialidad(esp)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-3xl">{info?.icon}</div>
                      <ChevronRight className="h-5 w-5 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold text-neutral-900 mb-1">{info?.nombre}</h3>
                    <p className="text-sm text-neutral-600">{info?.desc}</p>
                  </button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link href="/portal/login" className="text-sm text-neutral-500 hover:text-neutral-700">
            Cambiar paciente
          </Link>
        </div>
      </main>
    </div>
  )
}
