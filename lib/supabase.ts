import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sydlfdrawiesxleyjhbq.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_UUvC1VFeqo334FIj1DXAYQ_g7kJ13Fq'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
