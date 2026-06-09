'use client'

import { useEffect, useState, useRef } from 'react'
import { use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft, User, Tag, FileHeart, Activity, Salad,
  ClipboardList, Scale, FileText, Utensils, StickyNote, ChevronDown, FileDown,
} from 'lucide-react'
import { pacientesStorage, medicamentosStorage, antropometriaStorage, suplementosStorage, minutasStorage, perfilStorage } from '@/lib/storage'
import { calcularEdad, cn } from '@/lib/utils'
import { generarPDFPaciente } from '@/lib/pdf'
import type { Paciente } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FichaGeneral } from '@/components/ficha/ficha-general'
import { FichaTipoPaciente } from '@/components/ficha/ficha-tipo-paciente'
import { FichaClinica } from '@/components/ficha/ficha-clinica'
import { FichaHabitos } from '@/components/ficha/ficha-habitos'
import { FichaAlimentacion } from '@/components/ficha/ficha-alimentacion'
import { FichaControles } from '@/components/ficha/ficha-controles'
import { FichaMediciones } from '@/components/ficha/ficha-mediciones'
import { FichaExamenes } from '@/components/ficha/ficha-examenes'
import { FichaMinutas } from '@/components/ficha/ficha-minutas'
import { FichaNotas } from '@/components/ficha/ficha-notas'
import { FichaPDFContent } from '@/components/ficha/ficha-pdf-content'

const TABS = [
  { id: 'general',        label: 'General',           icon: User },
  { id: 'clinica',        label: 'Ficha clínica',      icon: FileHeart },
  { id: 'habitos',        label: 'Hábitos',            icon: Activity },
  { id: 'alimentacion',   label: 'Alimentación',       icon: Salad },
  { id: 'controles',      label: 'Controles',          icon: ClipboardList },
  { id: 'mediciones',     label: 'Mediciones',         icon: Scale },
  { id: 'examenes',       label: 'Exámenes',           icon: FileText },
  { id: 'minutas',        label: 'Minutas y Supl.',    icon: Utensils },
  { id: 'notas',          label: 'Notas',              icon: StickyNote },
  { id: 'ficha',          label: 'Ficha Completa',     icon: FileDown },
]

export default function FichaPacientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabActivo = searchParams.get('tab') || 'general'
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [primeraAntrop, setPrimeraAntrop] = useState<any>(null)
  const [meds, setMeds] = useState<any[]>([])
  const [perfil, setPerfil] = useState<any>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const p = pacientesStorage.getById(id)
    if (!p) { router.replace('/pacientes'); return }
    setPaciente(p)
    setPerfil(perfilStorage.get())
    const antrop = antropometriaStorage.getByPaciente(id)
    setPrimeraAntrop(antrop[0] || null)
    setMeds(medicamentosStorage.getByPaciente(id))
  }, [id, router])

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function setTab(tab: string) {
    router.push(`/pacientes/${id}?tab=${tab}`, { scroll: false })
    setDropdownOpen(false)
  }

  function onPacienteUpdate(updated: Paciente) {
    pacientesStorage.save(updated)
    setPaciente(updated)
    // Recargar datos por si cambió portal_activo u otros campos importantes
    setTimeout(() => {
      const reloaded = pacientesStorage.getById(id)
      if (reloaded) setPaciente(reloaded)
    }, 100)
  }

  function descargarFichaPDF() {
    if (!paciente) return
    const meds = medicamentosStorage.getByPaciente(id)
    const antrop = antropometriaStorage.getByPaciente(id)
    const perfil = perfilStorage.get()
    const primera = antrop[0]
    generarPDFPaciente(paciente, meds, perfil, primera)
  }

  if (!paciente) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="h-5 w-5 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  const edad = calcularEdad(paciente.fecha_nacimiento)
  const tabActual = TABS.find(t => t.id === tabActivo)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-4 sm:px-6 pt-4 pb-0 shrink-0">
        <div className="flex items-start gap-3 mb-3">
          <button onClick={() => router.push('/pacientes')} className="mt-1 text-neutral-400 hover:text-neutral-700 transition-colors shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-emerald-700">
                {paciente.nombre_completo.split(' ').slice(0, 2).map(n => n[0]).join('')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-semibold text-neutral-900 truncate">{paciente.nombre_completo}</h1>
                <Badge variant={paciente.estado === 'activo' ? 'default' : 'secondary'} className="hidden sm:inline-flex">
                  {paciente.estado}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 truncate">
                {paciente.rut} · {edad} años · {paciente.objetivo}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={descargarFichaPDF} className="gap-1.5 shrink-0 hidden sm:flex">
            <FileDown className="h-3.5 w-3.5" /> Descargar PDF
          </Button>
        </div>

        {/* DESKTOP: tabs horizontales scrollables */}
        <div className="hidden sm:flex gap-0 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap',
                tabActivo === tab.id
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300'
              )}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* MOBILE: dropdown selector */}
        <div className="sm:hidden pb-3" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5"
          >
            {tabActual && <tabActual.icon className="h-4 w-4 text-emerald-600 shrink-0" />}
            <span className="text-sm font-medium text-neutral-900 flex-1 text-left">{tabActual?.label}</span>
            <ChevronDown className={cn('h-4 w-4 text-neutral-400 transition-transform', dropdownOpen && 'rotate-180')} />
          </button>

          {dropdownOpen && (
            <div className="absolute left-4 right-4 z-50 mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors border-b border-neutral-50 last:border-0',
                    tabActivo === tab.id
                      ? 'bg-emerald-50 text-emerald-700 font-medium'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  )}
                >
                  <tab.icon className="h-4 w-4 shrink-0" />
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
          {tabActivo === 'general'       && <FichaGeneral paciente={paciente} onUpdate={onPacienteUpdate} />}
          {tabActivo === 'clinica'       && paciente && (
            <div className="flex flex-col gap-6">
              <FichaTipoPaciente paciente={paciente} onUpdate={onPacienteUpdate} />
              <FichaClinica paciente={paciente} onUpdate={onPacienteUpdate} />
            </div>
          )}
          {tabActivo === 'habitos'       && <FichaHabitos paciente={paciente} onUpdate={onPacienteUpdate} />}
          {tabActivo === 'alimentacion'  && <FichaAlimentacion paciente={paciente} onUpdate={onPacienteUpdate} />}
          {tabActivo === 'controles'     && <FichaControles pacienteId={id} />}
          {tabActivo === 'mediciones'    && <FichaMediciones pacienteId={id} />}
          {tabActivo === 'examenes'      && <FichaExamenes pacienteId={id} />}
          {tabActivo === 'minutas'       && <FichaMinutas pacienteId={id} />}
          {tabActivo === 'notas'         && <FichaNotas pacienteId={id} />}
          {tabActivo === 'ficha' && paciente && perfil && (
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <FichaPDFContent
                paciente={paciente}
                perfil={perfil}
                primeraAntrop={primeraAntrop}
                medicamentos={meds}
              />
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
