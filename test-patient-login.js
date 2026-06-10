const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://eqowdvipybvkipflnyth.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxb3dkdmlweWJ2a2lwZmxueXRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTg5NjUxODUsImV4cCI6MjAxNDU0MTE4NX0.OQKmDfhUfYwdR2kEH2nGiHWdqAqXX_FCBYRMn8b8VgY'
)

async function test() {
  // Buscar paciente con RUT normalizado
  const { data: pacientes } = await supabase.from('pacientes').select('id, nombre_completo, rut, contraseña_hash')
  
  if (pacientes) {
    console.log('Pacientes encontrados:')
    pacientes.forEach(p => {
      console.log(`- ${p.nombre_completo} (${p.rut}): contraseña_hash = "${p.contraseña_hash}"`)
    })
  }
}

test()
