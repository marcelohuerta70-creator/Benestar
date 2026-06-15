import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const pacienteId = req.nextUrl.searchParams.get('pacienteId')

    if (!pacienteId) {
      return NextResponse.json(
        { error: 'pacienteId required' },
        { status: 400 }
      )
    }

    // Obtener paciente
    const { data: paciente, error: pacienteError } = await supabase
      .from('pacientes')
      .select('*')
      .eq('id', pacienteId)
      .single()

    if (pacienteError || !paciente) {
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ paciente })
  } catch (err) {
    console.error('[Portal Paciente API Error]', err)
    return NextResponse.json(
      { error: 'Error al obtener paciente' },
      { status: 500 }
    )
  }
}
