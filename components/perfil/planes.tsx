'use client'

import { Check } from 'lucide-react'
import type { PlanSuscripcion, PerfilProfesional } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const PLANES = [
  { id: 'free', nombre: 'Plan Free', pacientes: 3, precio: 0 },
  { id: 'inicial', nombre: 'Plan Inicial', pacientes: 50, precio: 9990 },
  { id: 'pro', nombre: 'Plan Pro', pacientes: 200, precio: 24990 },
  { id: 'ilimitado', nombre: 'Plan Ilimitado', pacientes: null, precio: 49990 },
]

interface Props {
  perfil: PerfilProfesional
  onActualizar: (plan: PlanSuscripcion) => void
}

export function Planes({ perfil, onActualizar }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANES.map(plan => {
          const isActivo = perfil.plan_suscripcion === plan.id
          return (
            <Card key={plan.id} className={cn(
              'transition-all',
              isActivo ? 'ring-2 ring-emerald-500 border-emerald-500' : ''
            )}>
              <CardContent className="p-5 flex flex-col h-full gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-sm text-neutral-900">{plan.nombre}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {plan.pacientes === null ? 'Pacientes ilimitados' : `Hasta ${plan.pacientes} pacientes`}
                    </p>
                  </div>
                  {isActivo && <Badge className="text-xs">Actual</Badge>}
                </div>

                <div>
                  {plan.precio > 0 ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-neutral-900">
                        ${plan.precio.toLocaleString('es-CL')}
                      </span>
                      <span className="text-xs text-neutral-500">/mes</span>
                    </div>
                  ) : (
                    <p className="text-lg font-bold text-neutral-900">Gratis</p>
                  )}
                </div>

                <Button
                  onClick={() => onActualizar(plan.id as PlanSuscripcion)}
                  variant={isActivo ? 'default' : 'outline'}
                  className="w-full text-sm"
                  disabled={isActivo}
                >
                  {isActivo ? 'Plan Actual' : 'Seleccionar'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
