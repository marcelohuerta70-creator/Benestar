'use client'

import { useEffect, useState } from 'react'
import { CreditCard } from 'lucide-react'
import { perfilStorage, pacientesStorage } from '@/lib/storage'
import type { PerfilProfesional, PlanSuscripcion } from '@/lib/types'
import { Planes } from '@/components/perfil/planes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const LIMITES = {
  free: 3,
  inicial: 50,
  pro: 200,
  ilimitado: Infinity,
}

export default function PlanPage() {
  const [perfil, setPerfil] = useState<PerfilProfesional | null>(null)
  const [pacientesActivos, setPacientesActivos] = useState(0)

  useEffect(() => {
    const p = perfilStorage.get()
    setPerfil(p)
    const pacientes = pacientesStorage.getAll().filter(pac => pac.estado === 'activo')
    setPacientesActivos(pacientes.length)
  }, [])

  function actualizarPlan(plan: PlanSuscripcion) {
    if (perfil) {
      const updated = { ...perfil, plan_suscripcion: plan }
      perfilStorage.set(updated)
      setPerfil(updated)
    }
  }

  if (!perfil) return null

  const limiteActual = LIMITES[perfil.plan_suscripcion]
  const porcentajeUso = limiteActual === Infinity ? 0 : (pacientesActivos / limiteActual) * 100

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <CreditCard className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Tu Plan</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Gestiona tu suscripción</p>
        </div>
      </div>

      {/* Uso actual */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Pacientes activos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div>
              <p className="text-3xl font-bold text-neutral-900">{pacientesActivos}</p>
              <p className="text-xs text-neutral-500 mt-1">
                de {limiteActual === Infinity ? '∞' : limiteActual} pacientes
              </p>
            </div>
            {limiteActual !== Infinity && (
              <div className="flex-1">
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      porcentajeUso > 80 ? 'bg-red-500' : porcentajeUso > 50 ? 'bg-yellow-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.min(porcentajeUso, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-1">{Math.round(porcentajeUso)}% utilizado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Planes */}
      <div>
        <h2 className="text-base font-semibold text-neutral-900 mb-4">Selecciona tu plan</h2>
        <Planes perfil={perfil} onActualizar={actualizarPlan} />
      </div>

      <p className="text-xs text-neutral-400 text-center mt-6">
        Pagos mensuales. Puedes cambiar de plan en cualquier momento.
      </p>
    </div>
  )
}
