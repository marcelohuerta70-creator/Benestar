import type {
  Paciente, Consulta, Antropometria, Bioimpedancia,
  Examen, Minuta, Suplemento, NutricionistaSession,
  Medicamento, NotaClinica, PerfilProfesional, Cita, PortalSession, PacienteProfesional,
} from './types'

const KEYS = {
  session: 'nutris_session',
  pacientes: 'nutris_pacientes',
  consultas: 'nutris_consultas',
  antropometria: 'nutris_antropometria',
  bioimpedancia: 'nutris_bioimpedancia',
  examenes: 'nutris_examenes',
  minutas: 'nutris_minutas',
  suplementos: 'nutris_suplementos',
  medicamentos: 'nutris_medicamentos',
  notas: 'nutris_notas',
  citas: 'nutris_citas',
  perfil: 'nutris_perfil',
  portalSession: 'nutris_portal_session',
  pacienteProfesional: 'nutris_paciente_profesional',
  seeded: 'nutris_seeded',
}

function get<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(key) || '[]') as T[] }
  catch { return [] }
}
function getOne<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null }
  catch { return null }
}
function set<T>(key: string, data: T[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
}
function setOne<T>(key: string, data: T) {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
}

export const sessionStorage = {
  get: (): NutricionistaSession | null => getOne<NutricionistaSession>(KEYS.session),
  set: (s: NutricionistaSession) => setOne(KEYS.session, s),
  clear: () => { if (typeof window !== 'undefined') localStorage.removeItem(KEYS.session) },
}

export const pacientesStorage = {
  getAll: () => get<Paciente>(KEYS.pacientes),
  getById: (id: string) => get<Paciente>(KEYS.pacientes).find(p => p.id === id) || null,
  getByRut: (rut: string) => get<Paciente>(KEYS.pacientes).find(p => p.rut === rut) || null,
  save: (p: Paciente) => {
    const list = get<Paciente>(KEYS.pacientes)
    const idx = list.findIndex(x => x.id === p.id)
    if (idx >= 0) list[idx] = p; else list.push(p)
    set(KEYS.pacientes, list)
  },
  delete: (id: string) => set(KEYS.pacientes, get<Paciente>(KEYS.pacientes).filter(p => p.id !== id)),
}

export const consultasStorage = {
  getByPaciente: (id: string) =>
    get<Consulta>(KEYS.consultas).filter(c => c.paciente_id === id).sort((a, b) => b.fecha.localeCompare(a.fecha)),
  save: (c: Consulta) => {
    const list = get<Consulta>(KEYS.consultas)
    const idx = list.findIndex(x => x.id === c.id)
    if (idx >= 0) list[idx] = c; else list.push(c)
    set(KEYS.consultas, list)
  },
  delete: (id: string) => set(KEYS.consultas, get<Consulta>(KEYS.consultas).filter(c => c.id !== id)),
}

export const antropometriaStorage = {
  getByPaciente: (id: string) =>
    get<Antropometria>(KEYS.antropometria).filter(a => a.paciente_id === id).sort((a, b) => a.fecha.localeCompare(b.fecha)),
  save: (item: Antropometria) => {
    const list = get<Antropometria>(KEYS.antropometria)
    const idx = list.findIndex(a => a.id === item.id)
    if (idx >= 0) list[idx] = item; else list.push(item)
    set(KEYS.antropometria, list)
  },
  delete: (id: string) => set(KEYS.antropometria, get<Antropometria>(KEYS.antropometria).filter(a => a.id !== id)),
}

export const bioimpedanciaStorage = {
  getByPaciente: (id: string) =>
    get<Bioimpedancia>(KEYS.bioimpedancia).filter(b => b.paciente_id === id).sort((a, b) => a.fecha.localeCompare(b.fecha)),
  save: (item: Bioimpedancia) => {
    const list = get<Bioimpedancia>(KEYS.bioimpedancia)
    const idx = list.findIndex(b => b.id === item.id)
    if (idx >= 0) list[idx] = item; else list.push(item)
    set(KEYS.bioimpedancia, list)
  },
  delete: (id: string) => set(KEYS.bioimpedancia, get<Bioimpedancia>(KEYS.bioimpedancia).filter(b => b.id !== id)),
}

export const examenesStorage = {
  getByPaciente: (id: string) =>
    get<Examen>(KEYS.examenes).filter(e => e.paciente_id === id).sort((a, b) => b.fecha.localeCompare(a.fecha)),
  save: (item: Examen) => {
    const list = get<Examen>(KEYS.examenes)
    const idx = list.findIndex(e => e.id === item.id)
    if (idx >= 0) list[idx] = item; else list.push(item)
    set(KEYS.examenes, list)
  },
  delete: (id: string) => set(KEYS.examenes, get<Examen>(KEYS.examenes).filter(e => e.id !== id)),
}

export const minutasStorage = {
  getByPaciente: (id: string) =>
    get<Minuta>(KEYS.minutas).filter(m => m.paciente_id === id).sort((a, b) => b.created_at.localeCompare(a.created_at)),
  save: (item: Minuta) => {
    const list = get<Minuta>(KEYS.minutas)
    const idx = list.findIndex(m => m.id === item.id)
    if (idx >= 0) list[idx] = item; else list.push(item)
    set(KEYS.minutas, list)
  },
  delete: (id: string) => set(KEYS.minutas, get<Minuta>(KEYS.minutas).filter(m => m.id !== id)),
}

export const suplementosStorage = {
  getByPaciente: (id: string) =>
    get<Suplemento>(KEYS.suplementos).filter(s => s.paciente_id === id).sort((a, b) => b.created_at.localeCompare(a.created_at)),
  save: (item: Suplemento) => {
    const list = get<Suplemento>(KEYS.suplementos)
    const idx = list.findIndex(s => s.id === item.id)
    if (idx >= 0) list[idx] = item; else list.push(item)
    set(KEYS.suplementos, list)
  },
  delete: (id: string) => set(KEYS.suplementos, get<Suplemento>(KEYS.suplementos).filter(s => s.id !== id)),
}

export const medicamentosStorage = {
  getByPaciente: (id: string) => get<Medicamento>(KEYS.medicamentos).filter(m => m.paciente_id === id),
  save: (item: Medicamento) => {
    const list = get<Medicamento>(KEYS.medicamentos)
    const idx = list.findIndex(m => m.id === item.id)
    if (idx >= 0) list[idx] = item; else list.push(item)
    set(KEYS.medicamentos, list)
  },
  delete: (id: string) => set(KEYS.medicamentos, get<Medicamento>(KEYS.medicamentos).filter(m => m.id !== id)),
}

export const notasStorage = {
  getByPaciente: (id: string) =>
    get<NotaClinica>(KEYS.notas).filter(n => n.paciente_id === id).sort((a, b) => b.created_at.localeCompare(a.created_at)),
  save: (item: NotaClinica) => {
    const list = get<NotaClinica>(KEYS.notas)
    const idx = list.findIndex(n => n.id === item.id)
    if (idx >= 0) list[idx] = item; else list.push(item)
    set(KEYS.notas, list)
  },
  delete: (id: string) => set(KEYS.notas, get<NotaClinica>(KEYS.notas).filter(n => n.id !== id)),
}

export const citasStorage = {
  getAll: () => get<Cita>(KEYS.citas).sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`)),
  getByFecha: (fecha: string) => get<Cita>(KEYS.citas).filter(c => c.fecha === fecha).sort((a, b) => a.hora.localeCompare(b.hora)),
  save: (item: Cita) => {
    const list = get<Cita>(KEYS.citas)
    const idx = list.findIndex(c => c.id === item.id)
    if (idx >= 0) list[idx] = item; else list.push(item)
    set(KEYS.citas, list)
  },
  delete: (id: string) => set(KEYS.citas, get<Cita>(KEYS.citas).filter(c => c.id !== id)),
}

export const perfilStorage = {
  get: (): PerfilProfesional => {
    const stored = getOne<PerfilProfesional>(KEYS.perfil)
    return stored || {
      nombre: '', profesion: 'Nutricionista', numero_registro: '',
      telefono: '', correo: '', direccion: '',
      color_principal: '#059669', color_texto_header: '#ffffff',
      plan_suscripcion: 'free',
    }
  },
  set: (perfil: PerfilProfesional) => setOne(KEYS.perfil, perfil),
}

export const portalSessionStorage = {
  get: (): PortalSession | null => getOne<PortalSession>(KEYS.portalSession),
  set: (s: PortalSession) => setOne(KEYS.portalSession, s),
  clear: () => { if (typeof window !== 'undefined') localStorage.removeItem(KEYS.portalSession) },
}

export const pacienteProfesionalStorage = {
  getAll: () => get<PacienteProfesional>(KEYS.pacienteProfesional),
  getByRut: (rut: string) => {
    const rutNorm = rut.replace(/\./g, '').trim().toUpperCase()
    return get<PacienteProfesional>(KEYS.pacienteProfesional).filter(pp => {
      const ppRutNorm = pp.rut.replace(/\./g, '').trim().toUpperCase()
      return ppRutNorm === rutNorm
    })
  },
  save: (pp: PacienteProfesional) => {
    const list = get<PacienteProfesional>(KEYS.pacienteProfesional)
    const idx = list.findIndex(x => x.rut === pp.rut && x.profesional_id === pp.profesional_id && x.especialidad === pp.especialidad)
    if (idx >= 0) list[idx] = pp; else list.push(pp)
    set(KEYS.pacienteProfesional, list)
  },
  exists: (rut: string) => get<PacienteProfesional>(KEYS.pacienteProfesional).some(pp => pp.rut === rut),
}

export const isSeeded = (): boolean => {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(KEYS.seeded) === 'true'
}
export const markSeeded = () => {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEYS.seeded, 'true')
}
export const clearSeeded = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEYS.seeded)
}
