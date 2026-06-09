import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { differenceInYears, format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calcularEdad(fechaNacimiento: string): number {
  return differenceInYears(new Date(), parseISO(fechaNacimiento))
}

export function calcularIMC(peso_kg: number, talla_cm: number): number {
  const talla_m = talla_cm / 100
  return Math.round((peso_kg / (talla_m * talla_m)) * 10) / 10
}

export function clasificarIMC(imc: number): { label: string; color: string } {
  if (imc < 18.5) return { label: 'Bajo peso', color: 'text-blue-600' }
  if (imc < 25) return { label: 'Normal', color: 'text-emerald-600' }
  if (imc < 30) return { label: 'Sobrepeso', color: 'text-yellow-600' }
  if (imc < 35) return { label: 'Obesidad I', color: 'text-orange-600' }
  if (imc < 40) return { label: 'Obesidad II', color: 'text-red-600' }
  return { label: 'Obesidad III', color: 'text-red-800' }
}

export function formatFecha(fecha: string): string {
  if (!fecha) return '—'
  try {
    return format(parseISO(fecha), "d 'de' MMMM, yyyy", { locale: es })
  } catch {
    return fecha
  }
}

export function formatFechaCorta(fecha: string): string {
  if (!fecha) return '—'
  try {
    return format(parseISO(fecha), 'dd/MM/yyyy')
  } catch {
    return fecha
  }
}

export function generarId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function truncateFilename(filename: string, maxLength: number = 40): string {
  if (filename.length <= maxLength) return filename

  const ext = filename.split('.').pop() || ''
  const nameWithoutExt = filename.slice(0, filename.length - ext.length - 1)

  const availableForName = maxLength - ext.length - 4 // 4 para "..._"
  const startLength = Math.ceil(availableForName / 2)
  const endLength = Math.floor(availableForName / 2)

  const start = nameWithoutExt.slice(0, startLength)
  const end = nameWithoutExt.slice(-endLength)

  return `${start}...${end}.${ext}`
}
