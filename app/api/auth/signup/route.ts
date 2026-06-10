import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { email, password, nombre, profesion } = await request.json()

    if (!email || !password || !nombre || !profesion) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 1. Crear usuario en Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    const userId = authData.user?.id
    if (!userId) {
      return NextResponse.json(
        { error: 'No user ID returned from auth' },
        { status: 500 }
      )
    }

    // 2. Crear usuario en tabla usuarios
    const { error: usuarioError } = await supabase
      .from('usuarios')
      .insert({
        id: userId,
        email,
        nombre,
        plan_suscripcion: 'free',
        estado: 'activo',
      })

    if (usuarioError) {
      return NextResponse.json(
        { error: usuarioError.message },
        { status: 400 }
      )
    }

    // 3. Crear perfil profesional
    const { error: profileError } = await supabase
      .from('perfil_profesional')
      .insert({
        usuario_id: userId,
        nombre,
        profesion,
      })

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: true, userId, email },
      { status: 201 }
    )
  } catch (err) {
    console.error('[Auth Signup Error]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
