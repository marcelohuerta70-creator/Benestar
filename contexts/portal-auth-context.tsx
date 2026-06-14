'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { portalSessionStorage, clearSeeded } from '@/lib/storage'
import type { PortalSession, Especialidad } from '@/lib/types'
import bcryptjs from 'bcryptjs'
import { supabase } from '@/lib/supabase'

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
    try {
      const res = await fetch('/api/portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rut, password }),
      })

      const result = await res.json()

      if (!result.ok) {
        return { ok: false, error: result.error }
      }

      const newSession: PortalSession = {
        paciente_id: result.paciente.id,
        rut: result.paciente.rut,
        nombre: result.paciente.nombre_completo,
      }
      portalSessionStorage.set(newSession)
      setSession(newSession)
      setEspecialidades(result.especialidades)
      return { ok: true, especialidades: result.especialidades }
    } catch (err) {
      console.error('[Portal Login Error]', err)
      return { ok: false, error: err instanceof Error ? err.message : 'Error al iniciar sesión' }
    }
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
    clearSeeded()
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
