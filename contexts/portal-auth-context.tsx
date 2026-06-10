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
      // Normalizar RUT (eliminar puntos y guiones)
      const rutNorm = rut.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase()

      // Buscar paciente en Supabase por RUT (búsqueda flexible)
      const { data: pacientes, error: pacienteError } = await supabase
        .from('pacientes')
        .select('id, nombre_completo, rut, "contraseña_hash"')

      if (pacienteError || !pacientes) {
        return { ok: false, error: 'Error al obtener pacientes' }
      }

      // Buscar paciente por RUT normalizado
      const paciente = pacientes.find(p => {
        const pRutNorm = p.rut.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase()
        return pRutNorm === rutNorm
      })

      if (pacienteError || !paciente) {
        return { ok: false, error: 'RUT no encontrado. Verifica con tu nutricionista.' }
      }

      // Validar contraseña con bcryptjs
      const passwordMatch = bcryptjs.compareSync(password, (paciente as any)['contraseña_hash'] || '')
      if (!passwordMatch) {
        return { ok: false, error: 'Contraseña incorrecta.' }
      }

      // Obtener especialidades del paciente desde paciente_profesional
      const { data: pacienteProfs, error: profsError } = await supabase
        .from('paciente_profesional')
        .select('especialidad')
        .eq('paciente_id', paciente.id)

      if (profsError) {
        return { ok: false, error: 'Error al obtener especialidades.' }
      }

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
