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

    // 1. Crear usuario en Auth (con email confirmado automáticamente)
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

    // 2. Crear perfil profesional (user_id = auth.uid)
    const { error: profileError } = await supabase
      .from('perfil_profesional')
      .insert({
        user_id: userId,
        nombre,
        profesion,
        plan_suscripcion: 'free',
      })

    if (profileError) {
      console.error('[Profile Error]', profileError)
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
