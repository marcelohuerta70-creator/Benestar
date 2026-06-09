import type { Paciente, PerfilProfesional } from '@/lib/types'
import { calcularEdad, formatFechaCorta } from '@/lib/utils'

interface Props {
  paciente: Paciente
  perfil: PerfilProfesional
  primeraAntrop?: { peso_kg: number; talla_cm: number; imc: number; perimetro_cintura_cm: number; perimetro_cadera_cm: number }
  medicamentos: any[]
}

export function FichaPDFContent({ paciente, perfil, primeraAntrop, medicamentos }: Props) {
  const edad = calcularEdad(paciente.fecha_nacimiento)
  const hoy = formatFechaCorta(new Date().toISOString())

  return (
    <div className="text-sm leading-relaxed space-y-6">
      {/* Header */}
      <div className="p-6 text-white rounded-lg" style={{ background: perfil.color_principal || '#059669' }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-2xl font-bold">NUTRIS</p>
            <p className="text-sm opacity-90">Resumen Completo del Paciente</p>
          </div>
          <div className="text-right text-sm">
            {perfil.nombre && <p className="font-bold">{perfil.nombre}</p>}
            {perfil.profesion && <p className="text-xs opacity-90">{perfil.profesion}</p>}
            {perfil.telefono && <p className="text-xs opacity-80">Tel: {perfil.telefono}</p>}
          </div>
        </div>
      </div>

      {/* Paciente Info */}
      <div className="bg-neutral-50 p-4 rounded-lg">
        <p className="font-bold text-base">{paciente.nombre_completo}</p>
        <p className="text-xs text-neutral-600 mt-1">RUT: {paciente.rut} · {edad} años · {hoy}</p>
      </div>

      {/* 1. Datos Personales */}
      <Section title="1. Datos Personales y Contacto">
        <TwoColumnGrid>
          <Field label="Fecha nacimiento" value={formatFechaCorta(paciente.fecha_nacimiento)} />
          <Field label="Sexo" value={paciente.sexo === 'F' ? 'Femenino' : 'Masculino'} />
          <Field label="Teléfono" value={paciente.telefono} />
          <Field label="Email" value={paciente.email} />
          <Field label="Dirección" value={paciente.direccion} />
          <Field label="Comuna" value={paciente.comuna} />
          <Field label="Ciudad" value={paciente.ciudad} />
          <Field label="Previsión" value={paciente.prevision} />
          <Field label="CESFAM" value={paciente.cesfam} />
          <Field label="Médico tratante" value={paciente.medico_tratante} />
          <Field label="Contacto emergencia" value={paciente.contacto_emergencia} />
          <Field label="Teléfono emergencia" value={paciente.telefono_emergencia} />
          <Field label="Objetivo" value={paciente.objetivo} />
          <Field label="Estado" value={paciente.estado} />
        </TwoColumnGrid>
      </Section>

      {/* 2. Tipo de Paciente */}
      {paciente.tipo_paciente && (
        <Section title="2. Tipo de Paciente">
          <div className="space-y-2">
            <Field label="Tipo" value={paciente.tipo_paciente.replace(/_/g, ' ')} />
            {paciente.tipo_paciente_datos && Object.entries(paciente.tipo_paciente_datos).map(([k, v]) =>
              v ? <Field key={k} label={k.replace(/_/g, ' ')} value={String(v)} /> : null
            )}
          </div>
        </Section>
      )}

      {/* 3. Ficha Clínica */}
      <Section title="3. Ficha Clínica">
        <div className="space-y-3">
          {paciente.enfermedades && <Field label="Enfermedades/Diagnósticos" value={paciente.enfermedades} />}
          {paciente.alergias_farmacologicas && <Field label="Alergias farmacológicas" value={paciente.alergias_farmacologicas} />}
          {paciente.antecedentes_familiares && <Field label="Antecedentes familiares" value={paciente.antecedentes_familiares} />}
          {paciente.cirugias_previas && <Field label="Cirugías previas" value={paciente.cirugias_previas} />}
          {paciente.observaciones_clinicas && <Field label="Observaciones clínicas" value={paciente.observaciones_clinicas} />}
          {paciente.observaciones_clinicas_libres && <Field label="Notas clínicas libres" value={paciente.observaciones_clinicas_libres} />}

          {medicamentos.length > 0 && (
            <div>
              <p className="font-semibold text-neutral-700 mb-2">Medicamentos</p>
              <div className="space-y-1 text-neutral-600">
                {medicamentos.map(m => (
                  <p key={m.id}>• <strong>{m.nombre}</strong> {m.dosis} — {m.frecuencia}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* 4. Hábitos de Vida */}
      <Section title="4. Hábitos de Vida">
        <div className="space-y-2">
          <TwoColumnGrid>
            {paciente.habito_actividad_fisica && <Field label="Actividad física" value={paciente.habito_actividad_fisica} />}
            {paciente.habito_consumo_agua && <Field label="Consumo de agua" value={paciente.habito_consumo_agua} />}
            {paciente.habito_sueno && <Field label="Sueño" value={paciente.habito_sueno} />}
            {paciente.habito_deposiciones && <Field label="Deposiciones" value={paciente.habito_deposiciones} />}
            {paciente.habito_alcohol && <Field label="Alcohol" value={paciente.habito_alcohol} />}
            {paciente.habito_tabaco && <Field label="Tabaco" value={paciente.habito_tabaco} />}
            {paciente.habito_drogas && <Field label="Otras sustancias" value={paciente.habito_drogas} />}
          </TwoColumnGrid>
          {paciente.habitos_libres && <Field label="Notas libres" value={paciente.habitos_libres} />}
        </div>
      </Section>

      {/* 5. Evaluación Alimentaria */}
      <Section title="5. Evaluación Alimentaria">
        <div className="space-y-2">
          {paciente.tipo_alimentacion && <Field label="Tipo de alimentación" value={paciente.tipo_alimentacion} />}
          {paciente.tipo_alimentacion_otro && <Field label="Especificar" value={paciente.tipo_alimentacion_otro} />}
          {paciente.preferencias_alimentarias && <Field label="Preferencias" value={paciente.preferencias_alimentarias} />}
          {paciente.alergias_alimentarias && <Field label="Alergias alimentarias" value={paciente.alergias_alimentarias} />}
          {paciente.alimentos_no_consume && <Field label="Alimentos que no consume" value={paciente.alimentos_no_consume} />}
          {paciente.suplementos_habituales && <Field label="Suplementos habituales" value={paciente.suplementos_habituales} />}
          {paciente.alimentacion_libres && <Field label="Notas libres" value={paciente.alimentacion_libres} />}
        </div>
      </Section>

      {/* 6. Mediciones Iniciales */}
      {primeraAntrop && (
        <Section title="6. Mediciones Iniciales">
          <TwoColumnGrid>
            <Field label="Peso" value={`${primeraAntrop.peso_kg} kg`} />
            <Field label="Talla" value={`${primeraAntrop.talla_cm} cm`} />
            <Field label="IMC" value={String(primeraAntrop.imc)} />
            <Field label="Clasificación" value={clasificarIMC(primeraAntrop.imc)} />
            {primeraAntrop.perimetro_cintura_cm > 0 && <Field label="Cintura" value={`${primeraAntrop.perimetro_cintura_cm} cm`} />}
            {primeraAntrop.perimetro_cadera_cm > 0 && <Field label="Cadera" value={`${primeraAntrop.perimetro_cadera_cm} cm`} />}
          </TwoColumnGrid>
        </Section>
      )}

      <p className="text-xs text-neutral-400 text-center pt-4 border-t border-neutral-200">
        Generado con Nutris · {hoy}
      </p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-bold text-sm text-neutral-900 mb-3">{title}</p>
      {children}
    </div>
  )
}

function TwoColumnGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <p className="font-semibold text-xs text-neutral-600">{label}</p>
      <p className="text-sm text-neutral-700 mt-0.5">{value}</p>
    </div>
  )
}

function clasificarIMC(imc: number): string {
  if (imc < 18.5) return 'Bajo peso'
  if (imc < 25) return 'Normal'
  if (imc < 30) return 'Sobrepeso'
  if (imc < 35) return 'Obesidad I'
  return 'Obesidad II+'
}
