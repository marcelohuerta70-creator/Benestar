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
  }

  async function signup(email: string, password: string, nombre: string, profesion: string) {
    // Limpiar datos viejos antes de crear nueva cuenta
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('nutris_')) localStorage.removeItem(key)
      })
    }

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, nombre, profesion }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Signup failed')
    }

    const data = await res.json()

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

  async function logout() {
    await supabase.auth.signOut().catch(() => {})
    // Limpiar TODOS los datos del profesional de localStorage
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('nutris_')) localStorage.removeItem(key)
      })
    }
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
