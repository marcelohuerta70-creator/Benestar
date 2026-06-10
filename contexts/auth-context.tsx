'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { sessionStorage as storage } from '@/lib/storage'
import { seedDemoData } from '@/lib/seed-data'
import { isSeeded } from '@/lib/storage'
import type { NutricionistaSession } from '@/lib/types'

interface AuthContextType {
  session: NutricionistaSession | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, nombre: string, profesion: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<NutricionistaSession | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const stored = storage.get()
    if (stored) setSession(stored)
    setLoading(false)
  }, [])

  async function login(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      const { data: perfil } = await supabase
        .from('perfil_profesional')
        .select('nombre, profesion')
        .eq('usuario_id', data.user.id)
        .single()

      const newSession: NutricionistaSession = {
        nombre: perfil?.nombre || email,
        email: data.user.email || email,
        especialidad: perfil?.profesion || 'Nutrición Clínica',
        plan: 'pro',
      }

      storage.set(newSession)
      setSession(newSession)
      router.push('/dashboard')
    } catch (err) {
      // Fallback a demo si Supabase falla
      const nombre = email.split('@')[0]
        .split('.')
        .map(s => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ')

      const newSession: NutricionistaSession = {
        nombre: nombre || 'Profesional Demo',
        email,
        especialidad: 'Nutrición Clínica',
        plan: 'pro',
      }

      storage.set(newSession)
      setSession(newSession)
      router.push('/dashboard')
    }
  }

  async function signup(email: string, password: string, nombre: string, profesion: string) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password })
      if (authError) throw authError

      const userId = authData.user?.id
      if (!userId) throw new Error('No user ID returned')

      const { error: profileError } = await supabase
        .from('perfil_profesional')
        .insert({
          usuario_id: userId,
          nombre,
          profesion,
        })

      if (profileError) throw profileError

      const newSession: NutricionistaSession = {
        nombre,
        email,
        especialidad: profesion,
        plan: 'free',
      }

      storage.set(newSession)
      setSession(newSession)
      router.push('/dashboard')
    } catch (err) {
      // Fallback a cuenta local sin demo data si hay error
      const newSession: NutricionistaSession = {
        nombre,
        email,
        especialidad: profesion,
        plan: 'free',
      }

      storage.set(newSession)
      setSession(newSession)
      router.push('/dashboard')
    }
  }

  async function logout() {
    await supabase.auth.signOut().catch(() => {})
    storage.clear()
    setSession(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ session, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
