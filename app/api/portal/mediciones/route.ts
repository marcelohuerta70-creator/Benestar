import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const pacienteId = req.nextUrl.searchParams.get('pacienteId')

  if (!pacienteId) {
    return NextResponse.json({ error: 'pacienteId required' }, { status: 400 })
  }

  try {
    const [{ data: antrop }, { data: bio }] = await Promise.all([
      supabase
        .from('mediciones_antropometria')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('fecha', { ascending: false }),
      supabase
        .from('mediciones_bioimpedancia')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('fecha', { ascending: false }),
    ])

    return NextResponse.json({ antrop: antrop || [], bio: bio || [] })
  } catch (err) {
    console.error('[Mediciones API Error]', err)
    return NextResponse.json({ error: 'Error loading mediciones' }, { status: 500 })
  }
}
