import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
})

const ALLOWED_TYPES = ['jpg', 'jpeg', 'png', 'heic', 'webp', 'gif', 'pdf']

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const bucket = formData.get('bucket') as string

    if (!file || !bucket) {
      return NextResponse.json(
        { success: false, error: 'File y bucket requeridos' },
        { status: 400 }
      )
    }

    // Validar tipo
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!ext || !ALLOWED_TYPES.includes(ext)) {
      return NextResponse.json(
        { success: false, error: `Tipo no permitido. Usa: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Archivo muy grande. Máximo 10MB.' },
        { status: 400 }
      )
    }

    // Sanitizar nombre
    const timestamp = Date.now()
    const sanitized = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '_')
    const filename = `${timestamp}-${sanitized}`

    // Subir
    const buffer = await file.arrayBuffer()
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('[API Upload Error]', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    // Obtener URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: data.path,
      size_kb: Math.ceil(file.size / 1024),
    })
  } catch (err) {
    console.error('[API Upload Exception]', err)
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
