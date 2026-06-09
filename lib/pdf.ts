import { jsPDF } from 'jspdf'
import type { Paciente, Minuta, Suplemento, PerfilProfesional, MinutaEstructurada, Medicamento } from './types'
import { formatFechaCorta, calcularEdad } from './utils'

// Helper: hex to rgb
function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

function addHeader(doc: jsPDF, perfil: PerfilProfesional, subtitle: string) {
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 18
  const [r, g, b] = hexToRgb(perfil.color_principal || '#059669')
  const [tr, tg, tb] = hexToRgb(perfil.color_texto_header || '#ffffff')

  let headerH = 20
  if (perfil.nombre) headerH += perfil.telefono && perfil.correo ? 12 : 8
  if (perfil.numero_registro) headerH += 4

  doc.setFillColor(r, g, b)
  doc.rect(0, 0, pageW, headerH, 'F')
  doc.setTextColor(tr, tg, tb)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('BENESTAR', margin, 8)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text(subtitle, margin, 13)

  if (perfil.nombre) {
    let y = 9
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(perfil.nombre, pageW - margin, y, { align: 'right' })
    y += 4
    if (perfil.profesion) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.text(perfil.profesion, pageW - margin, y, { align: 'right' })
      y += 4
    }
    if (perfil.telefono) {
      doc.setFontSize(7)
      doc.text(`Teléfono: ${perfil.telefono}`, pageW - margin, y, { align: 'right' })
      y += 4
    }
    if (perfil.correo) {
      doc.setFontSize(7)
      doc.text(`Correo: ${perfil.correo}`, pageW - margin, y, { align: 'right' })
      y += 4
    }
    if (perfil.numero_registro) {
      doc.setFontSize(7)
      doc.text(`Registro: ${perfil.numero_registro}`, pageW - margin, y, { align: 'right' })
    }
  }
  doc.setTextColor(0, 0, 0)
  return headerH + 6
}

function addSectionTitle(doc: jsPDF, title: string, y: number, color: [number, number, number]): number {
  const margin = 18
  const pageW = doc.internal.pageSize.getWidth()
  const [r, g, b] = color
  doc.setFillColor(r, g, b)
  doc.setFillColor(245, 245, 245)
  doc.rect(margin, y - 4, pageW - margin * 2, 8, 'F')
  doc.setTextColor(r, g, b)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text(title.toUpperCase(), margin + 3, y + 1)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  return y + 10
}

function addField(doc: jsPDF, label: string, value: string, x: number, y: number, w: number): number {
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(100, 100, 100)
  doc.text(label + ':', x, y)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(30, 30, 30)
  const lines = doc.splitTextToSize(value || '—', w - 2)
  doc.text(lines, x, y + 4)
  return lines.length * 4
}

function checkPage(doc: jsPDF, y: number, threshold = 260): number {
  if (y > threshold) { doc.addPage(); return 28 }
  return y
}

// PDF Ficha del Paciente
export function generarPDFPaciente(
  paciente: Paciente,
  medicamentos: Medicamento[],
  perfil: PerfilProfesional,
  primeraAntrop?: { peso_kg: number; talla_cm: number; imc: number; perimetro_cintura_cm: number; perimetro_cadera_cm: number }
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 18
  const contentW = pageW - margin * 2
  const accent: [number, number, number] = hexToRgb(perfil.color_principal || '#059669')

  let y = addHeader(doc, perfil, 'Ficha del Paciente')
  const today = formatFechaCorta(new Date().toISOString())

  // Datos del paciente
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(margin, y, contentW, 18, 2, 2, 'F')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(paciente.nombre_completo, margin + 4, y + 7)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(`RUT: ${paciente.rut}  ·  ${calcularEdad(paciente.fecha_nacimiento)} años  ·  Fecha: ${today}`, margin + 4, y + 13)
  y += 24

  // GENERAL
  y = addSectionTitle(doc, '1. Datos Personales y Contacto', y, accent)
  const col1 = margin, col2 = margin + contentW / 2
  const cw = contentW / 2 - 4
  const fields1 = [
    ['Fecha nacimiento', formatFechaCorta(paciente.fecha_nacimiento)],
    ['Sexo', paciente.sexo === 'F' ? 'Femenino' : 'Masculino'],
    ['Teléfono', paciente.telefono || ''],
    ['Email', paciente.email || ''],
    ['Dirección', paciente.direccion || ''],
    ['Comuna', paciente.comuna || ''],
    ['Ciudad', paciente.ciudad || ''],
    ['Contacto emergencia', paciente.contacto_emergencia || ''],
    ['Tel. emergencia', paciente.telefono_emergencia || ''],
  ]
  const fields2 = [
    ['Previsión', paciente.prevision || ''],
    ['CESFAM', paciente.cesfam || ''],
    ['Médico tratante', paciente.medico_tratante || ''],
    ['Objetivo', paciente.objetivo || ''],
  ]

  let yLeft = y, yRight = y
  for (const [l, v] of fields1) {
    yLeft = checkPage(doc, yLeft)
    yLeft += addField(doc, l, v, col1, yLeft, cw) + 6
  }
  for (const [l, v] of fields2) {
    yRight = checkPage(doc, yRight)
    yRight += addField(doc, l, v, col2, yRight, cw) + 6
  }
  y = Math.max(yLeft, yRight) + 4

  // TIPO DE PACIENTE
  if (paciente.tipo_paciente) {
    y = checkPage(doc, y)
    y = addSectionTitle(doc, '2. Tipo de Paciente', y, accent)
    y += addField(doc, 'Tipo', paciente.tipo_paciente.replace(/_/g, ' '), col1, y, contentW) + 8
    if (paciente.tipo_paciente_datos) {
      for (const [k, v] of Object.entries(paciente.tipo_paciente_datos)) {
        if (!v) continue
        y = checkPage(doc, y)
        y += addField(doc, k.replace(/_/g, ' '), v, col1 + 4, y, contentW - 4) + 6
      }
    }
  }

  // FICHA CLÍNICA
  y = checkPage(doc, y)
  y = addSectionTitle(doc, '3. Ficha Clínica', y, accent)
  const clinicaFields = [
    ['Enfermedades / Diagnósticos', paciente.enfermedades || ''],
    ['Alergias farmacológicas', paciente.alergias_farmacologicas || ''],
    ['Antecedentes familiares', paciente.antecedentes_familiares || ''],
    ['Cirugías previas', paciente.cirugias_previas || ''],
    ['Observaciones clínicas', paciente.observaciones_clinicas || ''],
  ]
  for (const [l, v] of clinicaFields) {
    if (!v) continue
    y = checkPage(doc, y)
    y += addField(doc, l, v, col1, y, contentW) + 7
  }
  if (medicamentos.length > 0) {
    y = checkPage(doc, y)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(100, 100, 100)
    doc.text('Medicamentos:', col1, y)
    y += 4
    for (const m of medicamentos) {
      y = checkPage(doc, y)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(30, 30, 30)
      doc.text(`• ${m.nombre}  ${m.dosis}  ${m.frecuencia}`, col1 + 3, y)
      y += 4.5
    }
    y += 3
  }

  // HÁBITOS
  y = checkPage(doc, y)
  y = addSectionTitle(doc, '4. Hábitos', y, accent)
  const habitosFields = [
    ['Actividad física', paciente.habito_actividad_fisica || ''],
    ['Consumo de agua', paciente.habito_consumo_agua || ''],
    ['Sueño', paciente.habito_sueno || ''],
    ['Alcohol', paciente.habito_alcohol || ''],
    ['Tabaco', paciente.habito_tabaco || ''],
    ['Deposiciones', paciente.habito_deposiciones || ''],
  ]
  let yH = y
  const colH1 = margin, colH2 = margin + contentW / 2
  let side = 0
  for (const [l, v] of habitosFields) {
    if (!v) continue
    const cx = side % 2 === 0 ? colH1 : colH2
    if (side % 2 === 0) { yH = checkPage(doc, yH); y = yH }
    addField(doc, l, v, cx, y, cw)
    if (side % 2 === 1) { y += 9; yH = y }
    side++
  }
  if (side % 2 !== 0) y += 9
  y += 3

  // ALIMENTACIÓN
  y = checkPage(doc, y)
  y = addSectionTitle(doc, '5. Evaluación Alimentaria', y, accent)
  const alimFields = [
    ['Tipo de alimentación', paciente.tipo_alimentacion || ''],
    ['Preferencias', paciente.preferencias_alimentarias || ''],
    ['Alergias alimentarias', paciente.alergias_alimentarias || ''],
    ['Alimentos que no consume', paciente.alimentos_no_consume || ''],
    ['Suplementos habituales', paciente.suplementos_habituales || ''],
  ]
  for (const [l, v] of alimFields) {
    if (!v) continue
    y = checkPage(doc, y)
    y += addField(doc, l, v, col1, y, contentW) + 7
  }

  // MEDICIONES INICIALES
  if (primeraAntrop) {
    y = checkPage(doc, y)
    y = addSectionTitle(doc, '6. Mediciones Iniciales', y, accent)
    const medFields = [
      ['Peso inicial', `${primeraAntrop.peso_kg} kg`],
      ['Talla', `${primeraAntrop.talla_cm} cm`],
      ['IMC', String(primeraAntrop.imc)],
      ['Cintura', primeraAntrop.perimetro_cintura_cm ? `${primeraAntrop.perimetro_cintura_cm} cm` : ''],
      ['Cadera', primeraAntrop.perimetro_cadera_cm ? `${primeraAntrop.perimetro_cadera_cm} cm` : ''],
    ]
    let xm = col1, ym = y
    for (const [l, v] of medFields) {
      if (!v) continue
      addField(doc, l, v, xm, ym, contentW / 3)
      xm += contentW / 3
      if (xm > pageW - margin) { xm = col1; ym += 10; y = ym }
    }
    y = ym + 10
  }

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(160, 160, 160)
    doc.text(`Generado con Benestar · Página ${i} de ${pageCount}`, pageW / 2, 290, { align: 'center' })
  }

  const nombre = paciente.nombre_completo.replace(/\s+/g, '_')
  doc.save(`ficha_${nombre}_${today.replace(/\//g, '-')}.pdf`)
}

// PDF Minuta
const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'] as const
const DIAS_LABEL: Record<string, string> = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
  jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo',
}
const COMIDAS_LABEL: Record<string, string> = {
  desayuno: 'Desayuno', colacion_am: 'Colación AM', almuerzo: 'Almuerzo',
  colacion_pm: 'Colación PM', cena: 'Cena', cena_tardia: 'Once / Cena tardía',
}

export function generarPDFMinuta(
  paciente: Paciente,
  minuta: Minuta,
  suplementos: Suplemento[],
  perfil: PerfilProfesional
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 18
  const contentW = pageW - margin * 2
  const accent = hexToRgb(perfil.color_principal || '#059669')

  let y = addHeader(doc, perfil, 'Plan Alimentario')

  // Datos paciente
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(margin, y, contentW, 18, 2, 2, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text(paciente.nombre_completo, margin + 4, y + 7)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(`RUT: ${paciente.rut}  ·  ${minuta.titulo}  ·  Fecha: ${formatFechaCorta(new Date().toISOString())}`, margin + 4, y + 13)
  y += 24

  // Título
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...accent)
  doc.text('PLAN ALIMENTARIO SEMANAL', margin, y)
  doc.setTextColor(0, 0, 0)
  y += 8

  if (minuta.estructura) {
    for (const dia of DIAS) {
      const diaData = minuta.estructura[dia]
      const hasContent = Object.values(diaData).some(v => v.trim())
      if (!hasContent) continue
      y = checkPage(doc, y)
      y = addSectionTitle(doc, DIAS_LABEL[dia], y, accent)
      for (const [comida, texto] of Object.entries(diaData)) {
        if (!texto.trim()) continue
        y = checkPage(doc, y)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(100, 100, 100)
        doc.text(`${COMIDAS_LABEL[comida]}:`, margin + 3, y)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(30, 30, 30)
        const lines = doc.splitTextToSize(texto, contentW - 38)
        doc.text(lines, margin + 36, y)
        y += lines.length * 4.5 + 1
      }
      y += 4
    }
  } else if (minuta.contenido) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(minuta.contenido, contentW)
    for (const line of lines) {
      y = checkPage(doc, y)
      doc.text(line, margin, y)
      y += 5
    }
  }

  // Suplementación
  const suplTexto = minuta.estructura?.suplementacion || ''
  const suplActivos = suplementos.filter(s => s.activo)
  if (suplTexto || suplActivos.length > 0) {
    y = checkPage(doc, y, 240)
    y = addSectionTitle(doc, 'Suplementación', y, accent)
    if (suplTexto) {
      const lines = doc.splitTextToSize(suplTexto, contentW)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(lines, margin, y)
      y += lines.length * 4.5 + 3
    }
    for (const s of suplActivos) {
      y = checkPage(doc, y)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text(`• ${s.nombre}:`, margin + 2, y)
      doc.setFont('helvetica', 'normal')
      const det = `${s.dosis} — ${s.frecuencia}${s.instrucciones ? ` (${s.instrucciones})` : ''}`
      const lines = doc.splitTextToSize(det, contentW - 28)
      doc.text(lines, margin + 26, y)
      y += lines.length * 4.5 + 2
    }
  }

  const indicaciones = minuta.estructura?.indicaciones
  if (indicaciones) {
    y = checkPage(doc, y, 240)
    y = addSectionTitle(doc, 'Indicaciones Adicionales', y, accent)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(indicaciones, contentW)
    doc.text(lines, margin, y)
    y += lines.length * 4.5
  }

  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(160, 160, 160)
    doc.text(`Generado con Benestar · Página ${i} de ${pageCount}`, pageW / 2, 290, { align: 'center' })
  }

  const nombre = paciente.nombre_completo.replace(/\s+/g, '_')
  doc.save(`minuta_${nombre}_${formatFechaCorta(new Date().toISOString()).replace(/\//g, '-')}.pdf`)
}
