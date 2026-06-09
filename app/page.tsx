'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Check, ArrowRight, FileHeart, Scale, Utensils,
  FileText, Globe, ChevronRight, Star, Stethoscope, Dumbbell,
  Brain, Hand, Bone, Users,
} from 'lucide-react'
import { sessionStorage } from '@/lib/storage'
import { Button } from '@/components/ui/button'

const ESPECIALIDADES = [
  {
    id: 'nutricion',
    nombre: 'Nutrición',
    icon: Utensils,
    desc: 'Gestiona fichas, minutas y evolución de pacientes',
    color: 'bg-emerald-50 border-emerald-200',
    colorBg: 'bg-emerald-600',
    colorText: 'text-emerald-700',
    estado: 'Disponible',
    href: '/login',
  },
  {
    id: 'psico',
    nombre: 'Psicología',
    icon: Brain,
    desc: 'Plataforma especializada para psicólogos clínicos',
    color: 'bg-purple-50 border-purple-200',
    colorBg: 'bg-purple-600',
    colorText: 'text-purple-700',
    estado: 'Próximamente',
    href: '#',
  },
  {
    id: 'kine',
    nombre: 'Kinesiología',
    icon: Bone,
    desc: 'Seguimiento de lesiones y rehabilitación',
    color: 'bg-blue-50 border-blue-200',
    colorBg: 'bg-blue-600',
    colorText: 'text-blue-700',
    estado: 'Próximamente',
    href: '#',
  },
  {
    id: 'to',
    nombre: 'Terapia Ocupacional',
    icon: Hand,
    desc: 'Planes de tratamiento y evaluaciones',
    color: 'bg-orange-50 border-orange-200',
    colorBg: 'bg-orange-600',
    colorText: 'text-orange-700',
    estado: 'Próximamente',
    href: '#',
  },
  {
    id: 'prep',
    nombre: 'Preparador Físico',
    icon: Dumbbell,
    desc: 'Programas de entrenamiento personalizado',
    color: 'bg-red-50 border-red-200',
    colorBg: 'bg-red-600',
    colorText: 'text-red-700',
    estado: 'Próximamente',
    href: '#',
  },
]

const PROBLEMAS = [
  { titulo: 'Sin más papel', desc: 'Todo digital, siempre disponible en la nube' },
  { titulo: 'Sin más Excel', desc: 'Ficha clínica estructurada y profesional' },
  { titulo: 'Sin más olvidos', desc: 'Agenda y recordatorios automáticos' },
]

const FEATURES_POR_ESPECIALIDAD = {
  nutricion: [
    { icon: FileHeart, title: 'Ficha clínica nutricional', desc: 'Toda la información del paciente en un solo lugar' },
    { icon: Scale, title: 'Antropometría y bioimpedancia', desc: 'Mediciones, gráficos de evolución y seguimiento' },
    { icon: Utensils, title: 'Minuta semanal en PDF', desc: 'Editor estructurado por día y descarga en un clic' },
    { icon: FileText, title: 'Exámenes de laboratorio', desc: 'Registra resultados en la ficha clínica' },
    { icon: Globe, title: 'Portal del paciente', desc: 'Acceso seguro para revisar minuta y progreso' },
    { icon: Stethoscope, title: 'Agenda de citas', desc: 'Programación y recordatorios automáticos' },
  ],
  psicologia: [
    { icon: FileHeart, title: 'Historia clínica psicológica', desc: 'Antecedentes, diagnósticos y evaluaciones integradas' },
    { icon: FileText, title: 'Notas de sesión estructuradas', desc: 'Template para cada tipo de sesión clínica' },
    { icon: Globe, title: 'Comunicación con paciente', desc: 'Mensajes seguros dentro de la plataforma' },
    { icon: Stethoscope, title: 'Agenda de sesiones', desc: 'Programación, recordatorios y seguimiento' },
    { icon: Scale, title: 'Evaluaciones psicométricas', desc: 'Almacena y compara resultados de test' },
    { icon: Utensils, title: 'Reportes clínicos', desc: 'Genera reportes profesionales en PDF' },
  ],
  kinesiologia: [
    { icon: FileHeart, title: 'Historial clínico del paciente', desc: 'Diagnóstico, evaluaciones y seguimiento' },
    { icon: Scale, title: 'Plan de rehabilitación', desc: 'Ejercicios, series, repeticiones y progresión' },
    { icon: Utensils, title: 'Ejercicios con imágenes/videos', desc: 'Base de datos de ejercicios terapéuticos' },
    { icon: FileText, title: 'Evaluaciones funcionales', desc: 'ROM, fuerza, balance y otros parámetros' },
    { icon: Globe, title: 'Portal del paciente', desc: 'Acceso a su plan de ejercicios en casa' },
    { icon: Stethoscope, title: 'Agenda de sesiones', desc: 'Programación y recordatorios automáticos' },
  ],
  terapia_ocupacional: [
    { icon: FileHeart, title: 'Evaluación ocupacional', desc: 'Análisis de actividades de la vida diaria' },
    { icon: FileText, title: 'Planes de intervención', desc: 'Objetivos ocupacionales y actividades terapéuticas' },
    { icon: Scale, title: 'Evaluaciones funcionales', desc: 'Movilidad, autonomía y capacidades ocupacionales' },
    { icon: Utensils, title: 'Recomendaciones adaptativas', desc: 'Sugerencias de adaptaciones y ayudas técnicas' },
    { icon: Globe, title: 'Seguimiento del paciente', desc: 'Portal para acceder a su plan de intervención' },
    { icon: Stethoscope, title: 'Agenda de sesiones', desc: 'Programación y recordatorios automáticos' },
  ],
  preparador_fisico: [
    { icon: FileHeart, title: 'Perfil del deportista', desc: 'Antecedentes, objetivos y evaluación inicial' },
    { icon: Scale, title: 'Programas de entrenamiento', desc: 'Periodización, fases y mesociclos estructurados' },
    { icon: Utensils, title: 'Seguimiento de métricas', desc: 'Peso, performances, registros de entrenamiento' },
    { icon: FileText, title: 'Análisis de desempeño', desc: 'Gráficos de progresión y comparativas' },
    { icon: Globe, title: 'Portal del deportista', desc: 'Acceso a su programa de entrenamiento' },
    { icon: Stethoscope, title: 'Calendario deportivo', desc: 'Planificación de competencias y descansos' },
  ],
}

const PLANES = [
  { nombre: 'Free', precio: '$0', periodo: 'gratis', pacientes: '3 pacientes', features: ['Ficha clínica', 'Minutas PDF', 'Portal paciente'], destacado: false, cta: 'Comenzar gratis', href: '/registro' },
  { nombre: 'Inicial', precio: '$9.990', periodo: 'CLP / mes', pacientes: 'Hasta 50 pacientes', features: ['Todo del plan Free', 'Suplementación', 'Exámenes lab', 'Historial'], destacado: false, cta: 'Elegir', href: '/registro' },
  { nombre: 'Pro', precio: '$24.990', periodo: 'CLP / mes', pacientes: 'Hasta 200 pacientes', features: ['Todo del plan Inicial', 'PDF ilimitados', 'Notas paciente', 'Soporte prioritario'], destacado: true, cta: 'Elegir', href: '/registro' },
  { nombre: 'Ilimitado', precio: '$49.990', periodo: 'CLP / mes', pacientes: 'Ilimitados', features: ['Todo del plan Pro', 'Sin límites', 'Acceso anticipado', 'White label'], destacado: false, cta: 'Elegir', href: '/registro' },
]

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'nutricion' | 'psicologia' | 'kinesiologia' | 'terapia_ocupacional' | 'preparador_fisico'>('nutricion')
  const router = useRouter()

  useEffect(() => {
    setIsLoggedIn(!!sessionStorage.get())
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* NAV */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-neutral-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-benestar.png" alt="Benestar" width={56} height={56} className="rounded-lg" />
            <span className="text-base font-semibold text-neutral-900">Benestar</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-neutral-600">
            <a href="#especialidades" className="hover:text-neutral-900 transition-colors">Especialidades</a>
            <a href="#funcionalidades" className="hover:text-neutral-900 transition-colors">Funcionalidades</a>
            <a href="#precios" className="hover:text-neutral-900 transition-colors">Precios</a>
          </nav>
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <Button size="sm" onClick={() => router.push('/dashboard')} className="gap-1.5">
                Ir al panel <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Portal Profesional</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/portal">Portal Paciente</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/registro">Comenzar gratis</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-full px-3 py-1 text-xs font-medium mb-6">
            <Star className="h-3 w-3" /> Plataforma para profesionales de salud
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 tracking-tight leading-tight">
            La plataforma integral
            <br />
            <span className="text-emerald-600">para el bienestar</span>
            <br />
            de tus pacientes
          </h1>
          <p className="mt-6 text-lg text-neutral-500 leading-relaxed max-w-2xl mx-auto">
            Gestiona consultas, fichas, minutas y más. Todo en un solo lugar, adaptado a tu especialidad.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Button size="lg" asChild className="gap-2">
              <Link href="/registro">
                Comenzar gratis <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Ver el demo</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-neutral-400">Sin tarjeta de crédito · Plan gratuito disponible</p>
        </div>

      </section>

      {/* ESPECIALIDADES */}
      <section id="especialidades" className="py-20 px-4 sm:px-6 bg-neutral-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-3">Especialidades</h2>
            <p className="text-neutral-500 max-w-xl mx-auto">Nutrición disponible hoy. Más especialidades próximamente para crecer junto a ti.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {ESPECIALIDADES.map(esp => (
              <div key={esp.id} className={`rounded-xl p-5 border-2 flex flex-col gap-3 ${esp.color}`}>
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${esp.colorBg}`}>
                  <esp.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className={`font-semibold text-sm ${esp.colorText}`}>{esp.nombre}</h3>
                  <p className="text-xs text-neutral-600 mt-1">{esp.desc}</p>
                </div>
                {esp.estado === 'Disponible' ? (
                  <Button size="sm" asChild className="w-full">
                    <Link href={esp.href}>Ingresar</Link>
                  </Button>
                ) : (
                  <div className="text-xs font-medium text-neutral-500 text-center py-2 px-2 rounded bg-neutral-200/50">
                    {esp.estado}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEMA QUE RESOLVEMOS */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-3">Lo que dejamos atrás</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {PROBLEMAS.map(p => (
              <div key={p.titulo} className="text-center">
                <h3 className="font-semibold text-neutral-900 mb-2">{p.titulo}</h3>
                <p className="text-sm text-neutral-500">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CARACTERÍSTICAS POR ESPECIALIDAD */}
      <section id="funcionalidades" className="py-20 px-4 sm:px-6 bg-neutral-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-3">¿Cuál es tu especialidad?</h2>
            <p className="text-neutral-500 max-w-xl mx-auto">Benestar se adapta a cada rama profesional</p>
          </div>

          {/* TABS */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {ESPECIALIDADES.map(esp => {
              const isActive = selectedTab === esp.id
              return (
                <button
                  key={esp.id}
                  onClick={() => setSelectedTab(esp.id as typeof selectedTab)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    isActive
                      ? `${esp.colorBg} text-white`
                      : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {esp.nombre}
                </button>
              )
            })}
          </div>

          {/* FEATURES SEGÚN ESPECIALIDAD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(FEATURES_POR_ESPECIALIDAD[selectedTab as keyof typeof FEATURES_POR_ESPECIALIDAD] || []).map(f => (
              <div key={f.title} className="bg-white rounded-xl p-6 border border-neutral-200">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2">{f.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* ESTADO PRÓXIMAMENTE */}
          {selectedTab !== 'nutricion' && (
            <div className="mt-12 text-center">
              <div className="inline-block px-6 py-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">{ESPECIALIDADES.find(e => e.id === selectedTab)?.nombre}</span> — Próximamente disponible
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* DOS PORTALES */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-3">Acceso a ambos portales</h2>
            <p className="text-neutral-500 max-w-xl mx-auto">Profesional y paciente en un mismo lugar.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Portal Profesional */}
            <div className="rounded-2xl p-8 bg-neutral-900 text-white flex flex-col gap-6">
              <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Para el profesional</h3>
                <p className="text-neutral-300">Gestiona todos tus pacientes, fichas, controles y minutas en un solo lugar.</p>
              </div>
              <Button size="lg" className="w-full bg-white text-neutral-900 hover:bg-neutral-100" asChild>
                <Link href="/login">Acceder como profesional</Link>
              </Button>
            </div>

            {/* Portal Paciente */}
            <div className="rounded-2xl p-8 bg-emerald-50 border-2 border-emerald-200 flex flex-col gap-6">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">Para el paciente</h3>
                <p className="text-neutral-600">Revisa tu plan alimentario, progreso y mensajes de tu nutricionista.</p>
              </div>
              <Button size="lg" variant="default" className="w-full" asChild>
                <Link href="/portal">Acceder como paciente</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="precios" className="py-20 px-4 sm:px-6 bg-neutral-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-3">Planes simples y transparentes</h2>
            <p className="text-neutral-500">Empieza gratis y crece a tu ritmo. Sin sorpresas.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANES.map(plan => (
              <div key={plan.nombre} className={`rounded-2xl p-6 flex flex-col gap-4 ${plan.destacado ? 'bg-emerald-600 text-white' : 'bg-white border border-neutral-200'}`}>
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${plan.destacado ? 'text-emerald-100' : 'text-neutral-500'}`}>{plan.nombre}</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-bold ${plan.destacado ? 'text-white' : 'text-neutral-900'}`}>{plan.precio}</span>
                    <span className={`text-xs ${plan.destacado ? 'text-emerald-100' : 'text-neutral-400'}`}>{plan.periodo}</span>
                  </div>
                  <p className={`text-sm mt-1 ${plan.destacado ? 'text-emerald-100' : 'text-neutral-500'}`}>{plan.pacientes}</p>
                </div>
                <ul className="flex flex-col gap-2 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${plan.destacado ? 'text-white' : 'text-neutral-700'}`}>
                      <Check className={`h-4 w-4 shrink-0 mt-0.5 ${plan.destacado ? 'text-emerald-200' : 'text-emerald-600'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.destacado ? 'secondary' : 'outline'}
                  className={`w-full ${plan.destacado ? 'bg-white text-emerald-700 hover:bg-emerald-50' : ''}`}
                  asChild
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
            Empieza gratis hoy
          </h2>
          <p className="text-neutral-500 mb-8 text-lg">
            Únete a profesionales que ya digitalizaron su práctica con Benestar.
          </p>
          <Button size="lg" asChild className="gap-2">
            <Link href="/registro">
              Crear cuenta gratis <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-neutral-100 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo-benestar.png" alt="Benestar" width={48} height={48} className="rounded-md" />
            <span className="text-sm font-semibold text-neutral-700">Benestar</span>
          </div>
          <p className="text-xs text-neutral-400">© 2026 Benestar. Plataforma para profesionales de salud.</p>
          <div className="flex gap-4 text-xs text-neutral-400">
            <Link href="/login" className="hover:text-neutral-700 transition-colors">Portal Profesional</Link>
            <Link href="/portal" className="hover:text-neutral-700 transition-colors">Portal Paciente</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
