'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { pacientesStorage, portalSessionStorage, pacienteProfesionalStorage, isSeeded } from '@/lib/storage'
import { seedDemoData } from '@/lib/seed-data'
import type { PortalSession, Especialidad } from '@/lib/types'

interface PortalAuthContextType {
  session: PortalSession | null
  loading: boolean
  especialidades: Especialidad[]
  login: (rut: string, password: string) => Promise<{ ok: boolean; error?: string; especialidades?: Especialidad[] }>
  selectEspecialidad: (especialidad: Especialidad) => void
  logout: () => void
}

const PortalAuthContext = createContext<PortalAuthContextType | null>(null)

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<PortalSession | null>(null)
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Cargar datos de demo si no existen pacientes
    if (!isSeeded()) {
      seedDemoData()
    }

    const stored = portalSessionStorage.get()
    if (stored) {
      setSession(stored)
      // Si tiene especialidad seleccionada, ir al dashboard
      if (stored.especialidad) {
        router.push('/portal/dashboard')
      }
    }
    setLoading(false)
  }, [router])

  async function login(rut: string, password: string): Promise<{ ok: boolean; error?: string; especialidades?: Especialidad[] }> {
    // Normalizar RUT
    const rutNorm = rut.replace(/\./g, '').trim().toUpperCase()
    const pacientes = pacientesStorage.getAll()
    const paciente = pacientes.find(p => {
      const pRut = p.rut.replace(/\./g, '').trim().toUpperCase()
      return pRut === rutNorm
    })

    if (!paciente) {
      return { ok: false, error: 'RUT no encontrado. Verifica con tu nutricionista.' }
    }

    // Validar contraseña contra contraseña_hash del paciente
    if (password !== (paciente.contraseña_hash || '')) {
      return { ok: false, error: 'Contraseña incorrecta.' }
    }

    // Obtener especialidades disponibles para este RUT
    const pacienteProfs = pacienteProfesionalStorage.getByRut(rutNorm)
    const esps = [...new Set(pacienteProfs.map(pp => pp.especialidad))] as Especialidad[]

    if (esps.length === 0) {
      return { ok: false, error: 'No hay especialidades asociadas a este RUT.' }
    }

    const newSession: PortalSession = {
      paciente_id: paciente.id,
      rut: paciente.rut,
      nombre: paciente.nombre_completo,
    }
    portalSessionStorage.set(newSession)
    setSession(newSession)
    setEspecialidades(esps)
    return { ok: true, especialidades: esps }
  }

  function selectEspecialidad(especialidad: Especialidad) {
    if (session) {
      const updated = { ...session, especialidad }
      portalSessionStorage.set(updated)
      setSession(updated)
      router.push('/portal/dashboard')
    }
  }

  function logout() {
    portalSessionStorage.clear()
    setSession(null)
    setEspecialidades([])
    router.push('/portal/login')
  }

  return (
    <PortalAuthContext.Provider value={{ session, loading, especialidades, login, selectEspecialidad, logout }}>
      {children}
    </PortalAuthContext.Provider>
  )
}

export function usePortalAuth() {
  const ctx = useContext(PortalAuthContext)
  if (!ctx) throw new Error('usePortalAuth must be used within PortalAuthProvider')
  return ctx
}
