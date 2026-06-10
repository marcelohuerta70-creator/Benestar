export type Sexo = 'M' | 'F'
export type EstadoPaciente = 'activo' | 'inactivo' | 'archivado'
export type PlanSuscripcion = 'free' | 'inicial' | 'pro' | 'ilimitado'
export type Prevision = 'fonasa' | 'isapre' | 'particular' | 'otro'
export type TipoPaciente =
  | 'adulto' | 'adulto_mayor' | 'embarazada' | 'nodriza' | 'lactante'
  | 'preescolar' | 'escolar' | 'adolescente' | 'postrado' | 'deportista' | 'otro'
export type TipoAlimentacion = 'omnivoro' | 'vegetariano' | 'vegano' | 'pescetariano' | 'otro'
export type TipoConsulta = 'primera_consulta' | 'seguimiento' | 'alta_nutricional'
export type NivelAdherencia = 'muy_buena' | 'buena' | 'regular' | 'mala' | ''
export type EstadoCita = 'programada' | 'realizada' | 'cancelada'
export type Especialidad = 'nutricion' | 'psicologia' | 'kinesiologia' | 'terapia_ocupacional' | 'preparador_fisico'

export interface Paciente {
  id: string
  nombre_completo: string
  rut: string
  fecha_nacimiento: string
  sexo: Sexo
  genero?: string
  email: string
  telefono: string
  direccion?: string
  comuna?: string
  ciudad?: string
  contacto_emergencia?: string
  telefono_emergencia?: string
  prevision?: Prevision
  prevision_otro?: string
  cesfam?: string
  medico_tratante?: string
  objetivo: string
  notas_generales: string
  estado: EstadoPaciente
  portal_activo: boolean
  created_at: string
  tipo_paciente?: TipoPaciente
  tipo_paciente_datos?: Record<string, string>
  enfermedades?: string
  alergias_farmacologicas?: string
  antecedentes_familiares?: string
  cirugias_previas?: string
  observaciones_clinicas?: string
  notas_clinica?: string
  medicamentos_actuales?: string
  habito_actividad_fisica?: string
  habito_consumo_agua?: string
  habito_sueno?: string
  habito_alcohol?: string
  habito_tabaco?: string
  habito_drogas?: string
  habito_deposiciones?: string
  notas_habitos?: string
  tipo_alimentacion?: TipoAlimentacion | string
  tipo_alimentacion_otro?: string
  preferencias_alimentarias?: string
  alergias_alimentarias?: string
  alimentos_no_consume?: string
  suplementos_habituales?: string
  notas_alimentacion?: string
  contraseña_hash?: string
}

export interface Adjunto {
  id: string
  nombre: string
  url: string
  size_kb: number
}

export interface Consulta {
  id: string
  paciente_id: string
  // Información general
  fecha: string
  tipo_consulta?: TipoConsulta
  proxima_cita: string
  // Evolución
  adherencia?: NivelAdherencia
  cambios_observados?: string
  dificultades_reportadas?: string
  observaciones_clinicas?: string
  // Hábitos del control
  ctrl_actividad_fisica?: string
  ctrl_consumo_agua?: string
  ctrl_sueno?: string
  ctrl_deposiciones?: string
  ctrl_alcohol?: string
  ctrl_tabaco?: string
  // Diagnóstico y plan
  diagnostico_nutricional?: string
  indicaciones?: string
  objetivos_proximo_control?: string
  nota_para_paciente: string
  adjuntos?: (string | Adjunto)[]
  // Legacy backward compat
  motivo?: string
  diagnostico?: string
  observaciones?: string
  created_at: string
}

export interface Antropometria {
  id: string
  paciente_id: string
  consulta_id: string
  fecha: string
  // Básica
  peso_kg: number
  talla_cm: number
  imc: number
  perimetro_cintura_cm: number
  perimetro_cadera_cm: number
  icc: number
  clasificacion_nutricional?: string
  // Avanzada — Perímetros
  per_brazo_relajado?: number
  per_brazo_contraido?: number
  per_torax?: number
  per_abdomen?: number
  per_muslo?: number
  per_pantorrilla?: number
  // Pliegues
  pliegue_tricipital?: number
  pliegue_bicipital?: number
  pliegue_subescapular?: number
  pliegue_suprailiaco?: number
  pliegue_abdominal?: number
  pliegue_muslo?: number
  pliegue_pantorrilla?: number
  // Opcionales
  envergadura?: number
  altura_sentado?: number
  created_at: string
}

export interface Bioimpedancia {
  id: string
  paciente_id: string
  consulta_id: string
  fecha: string
  masa_grasa_kg: number
  masa_grasa_pct: number
  masa_magra_kg: number
  masa_libre_grasa?: number
  agua_corporal_lt: number
  agua_corporal_pct: number
  grasa_visceral?: number
  proteina_corporal?: number
  masa_osea?: number
  metabolismo_basal_kcal: number
  edad_metabolica: number
  // Segmental
  seg_brazo_izq?: number
  seg_brazo_der?: number
  seg_tronco?: number
  seg_pierna_izq?: number
  seg_pierna_der?: number
  created_at: string
}

export interface Examen {
  id: string
  paciente_id: string
  fecha: string
  tipo: string
  resultado: string
  notas: string
  archivo_nombre?: string
  archivo_tipo?: string
  archivo_url?: string
  archivo_size_kb?: number
  created_at: string
}

export interface ComidaDia {
  desayuno: string
  colacion_am: string
  almuerzo: string
  colacion_pm: string
  cena: string
  cena_tardia: string
}

export interface MinutaEstructurada {
  lunes: ComidaDia
  martes: ComidaDia
  miercoles: ComidaDia
  jueves: ComidaDia
  viernes: ComidaDia
  sabado: ComidaDia
  domingo: ComidaDia
  suplementacion: string
  indicaciones: string
}

const DIA_VACIO: ComidaDia = { desayuno: '', colacion_am: '', almuerzo: '', colacion_pm: '', cena: '', cena_tardia: '' }
export const MINUTA_VACIA: MinutaEstructurada = {
  lunes: { ...DIA_VACIO }, martes: { ...DIA_VACIO }, miercoles: { ...DIA_VACIO },
  jueves: { ...DIA_VACIO }, viernes: { ...DIA_VACIO }, sabado: { ...DIA_VACIO },
  domingo: { ...DIA_VACIO }, suplementacion: '', indicaciones: '',
}

export interface Minuta {
  id: string
  paciente_id: string
  titulo: string
  fecha_inicio: string
  fecha_fin: string
  contenido: string
  estructura?: MinutaEstructurada
  activa: boolean
  created_at: string
}

export interface Suplemento {
  id: string
  paciente_id: string
  nombre: string
  dosis: string
  frecuencia: string
  instrucciones: string
  activo: boolean
  fecha_inicio: string
  created_at: string
}

export interface Medicamento {
  id: string
  paciente_id: string
  nombre: string
  dosis: string
  frecuencia: string
  created_at: string
}

export interface NotaClinica {
  id: string
  paciente_id: string
  tipo: 'clinica' | 'paciente'
  titulo: string
  contenido: string
  archivos?: string[]
  archivos_urls?: string[]
  archivos_size_kb?: number[]
  created_at: string
  updated_at: string
}

export interface Cita {
  id: string
  paciente_id: string
  paciente_nombre: string
  fecha: string
  hora: string
  duracion_min: number
  motivo: string
  observaciones: string
  estado: EstadoCita
  created_at: string
}

export interface PerfilProfesional {
  nombre: string
  profesion: string
  numero_registro: string
  telefono: string
  correo: string
  direccion: string
  color_principal: string
  color_texto_header: string
  plan_suscripcion: PlanSuscripcion
}

export interface PortalSession {
  paciente_id: string
  rut: string
  nombre: string
  especialidad?: Especialidad
}

export interface PacienteProfesional {
  rut: string
  profesional_id: string
  profesional_nombre: string
  especialidad: Especialidad
  fecha_registro: string
}

export interface NutricionistaSession {
  nombre: string
  email: string
  especialidad: string
  plan: PlanSuscripcion
}
