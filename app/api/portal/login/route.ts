import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { rut, password } = await req.json()

    if (!rut || !password) {
      return NextResponse.json(
        { ok: false, error: 'RUT y contraseña requeridos' },
        { status: 400 }
      )
    }

    // Normalizar RUT
    const rutNorm = rut.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase()

    // Buscar paciente por RUT (usando service role, sin RLS)
    const { data: pacientes, error } = await supabase
      .from('pacientes')
      .select('id, nombre_completo, rut, contraseña_hash, portal_activo') as any

    if (error || !pacientes) {
      console.error('[Portal Login Error]', error)
      return NextResponse.json(
        { ok: false, error: 'Error al obtener pacientes' },
        { status: 500 }
      )
    }

    // Buscar paciente con RUT normalizado
    const paciente = (pacientes as any[]).find((p: any) => {
      const pRutNorm = p.rut.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase()
      return pRutNorm === rutNorm
    })

    if (!paciente) {
      return NextResponse.json(
        { ok: false, error: 'RUT no encontrado. Verifica con tu nutricionista.' },
        { status: 404 }
      )
    }

    // Validar portal activo
    if (!paciente.portal_activo) {
      return NextResponse.json(
        { ok: false, error: 'El portal no está activado. Contacta a tu nutricionista.' },
        { status: 403 }
      )
    }

    // Validar contraseña (comparación directa, plaintext)
    if (password !== paciente.contraseña_hash) {
      return NextResponse.json(
        { ok: false, error: 'Contraseña incorrecta.' },
        { status: 401 }
      )
    }

    // Obtener especialidades del paciente
    const { data: pacienteProfs, error: profsError } = await supabase
      .from('paciente_profesional')
      .select('especialidad')
      .eq('paciente_id', paciente.id)

    if (profsError) {
      console.error('[Especialidades Error]', profsError)
      return NextResponse.json(
        { ok: false, error: 'Error al obtener especialidades.' },
        { status: 500 }
      )
    }

    if (!pacienteProfs || pacienteProfs.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'No hay especialidades asociadas a este RUT.' },
        { status: 404 }
      )
    }

    const especialidades = [...new Set(pacienteProfs.map(pp => pp.especialidad))]

    return NextResponse.json({
      ok: true,
      paciente: {
        id: paciente.id,
        rut: paciente.rut,
        nombre_completo: paciente.nombre_completo,
      },
      especialidades,
    })
  } catch (err) {
    console.error('[Portal Login API Error]', err)
    return NextResponse.json(
      { ok: false, error: 'Error al procesar login' },
      { status: 500 }
    )
  }
}
