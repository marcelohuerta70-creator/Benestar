'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { LogOut, Home, TrendingDown, FileText, Eye, EyeOff, ChevronDown, Utensils } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Bar } from 'recharts'
import { usePortalAuth } from '@/contexts/portal-auth-context'
import { supabase } from '@/lib/supabase'
import {
  pacientesStorage, minutasStorage, citasStorage,
  antropometriaStorage, bioimpedanciaStorage, consultasStorage, notasStorage,
} from '@/lib/storage'
import { formatFechaCorta, formatFecha } from '@/lib/utils'
import type { Paciente, Minuta, Antropometria, Bioimpedancia, Consulta, NotaClinica, Cita } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Tab = 'inicio' | 'minuta' | 'mediciones' | 'notas'

interface MedicionesVisibles {
  peso: boolean
  cintura: boolean
  imc: boolean
  cadera: boolean
  brazo: boolean
  torax: boolean
  abdomen: boolean
  muslo: boolean
  pantorrilla: boolean
  masa_grasa_kg: boolean
  masa_grasa_pct: boolean
  agua_corporal_pct: boolean
}

interface AntropoloBioVisibles {
  antropometriaExpanded: boolean
  bioimpedanciaExpanded: boolean
}

export default function PortalDashboard() {
  const { session, loading, logout } = usePortalAuth()
  const router = useRouter()
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [tab, setTab] = useState<Tab>('inicio')
  const [minuta, setMinuta] = useState<Minuta | null>(null)
  const [antrop, setAntrop] = useState<Antropometria[]>([])
  const [bioimpedancia, setBioimpedancia] = useState<Bioimpedancia[]>([])
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [notas, setNotas] = useState<NotaClinica[]>([])
  const [citas, setCitas] = useState<Cita[]>([])
  const [minutaDiasExpandidos, setMinutaDiasExpandidos] = useState<Record<string, boolean>>(() => {
    const diasOrden = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
    const hoyIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
    const hoyDia = diasOrden[hoyIdx]
    return { lunes: false, martes: false, miercoles: false, jueves: false, viernes: false, sabado: false, domingo: false, [hoyDia]: true }
  })
  const [visibles, setVisibles] = useState<MedicionesVisibles>({
    peso: true,
    cintura: true,
    imc: true,
    cadera: false,
    brazo: false,
    torax: false,
    abdomen: false,
    muslo: false,
    pantorrilla: false,
    masa_grasa_kg: true,
    masa_grasa_pct: true,
    agua_corporal_pct: true,
  })
  const [expandidos, setExpandidos] = useState<AntropoloBioVisibles>({
    antropometriaExpanded: false,
    bioimpedanciaExpanded: false,
  })

  useEffect(() => {
    if (!loading && !session) { router.replace('/portal/login'); return }
    if (!session) return

    const loadPacienteData = async () => {
      try {
        const { data: paciente, error } = await supabase
          .from('pacientes')
          .select('*')
          .eq('id', session.paciente_id)
          .single()

        if (error || !paciente) {
          console.error('Error loading patient:', error)
          logout()
          return
        }

        setPaciente(paciente)

        const { data: planes, error: planesError } = await supabase
          .from('planes')
          .select('*')
          .eq('paciente_id', session.paciente_id)
          .eq('especialidad', 'nutricion')
          .order('fecha_inicio', { ascending: false })

        if (planesError) console.error('[Planes Error]', planesError)
        const mins = (planes || []) as any[]
        setMinuta(mins.find(m => m.activo) || mins[0] || null)
        console.log('[Minutas Cargadas]', mins.length, 'planes')

        const res = await fetch(`/api/portal/mediciones?pacienteId=${session.paciente_id}`)
        const { antrop, bio } = await res.json()

        const { data: consultas } = await supabase
          .from('consultas')
          .select('*')
          .eq('paciente_id', session.paciente_id)

        const { data: notas } = await supabase
          .from('notas_clinicas')
          .select('*')
          .eq('paciente_id', session.paciente_id)
          .eq('tipo', 'paciente')
          .order('created_at', { ascending: false })

        const { data: citas } = await supabase
          .from('citas')
          .select('*')
          .eq('paciente_id', session.paciente_id)
          .order('fecha', { ascending: false })

        setAntrop((antrop || []) as any[])
        setBioimpedancia((bio || []) as any[])
        setConsultas((consultas || []) as any[])
        setNotas((notas || []) as any[])
        setCitas((citas || []) as any[])
      } catch (err) {
        console.error('Error in portal dashboard:', err)
        logout()
      }
    }

    loadPacienteData()
  }, [session, loading])

  if (loading || !paciente) {
    return <div className="min-h-screen flex items-center justify-center bg-emerald-50"><div className="h-5 w-5 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" /></div>
  }

  const primera = antrop[antrop.length - 1]
  const ultima = antrop[0]

  const chartData = antrop.slice().reverse().map((a, i) => ({
    fecha: formatFechaCorta(a.fecha),
    peso: a.peso_kg,
    imc: a.imc,
    cintura: a.perimetro_cintura_cm || null,
    pesoCambio: i > 0 ? (a.peso_kg - antrop[antrop.length - 1 - i + 1].peso_kg) : 0,
    imcCambio: i > 0 ? (a.imc - antrop[antrop.length - 1 - i + 1].imc) : 0,
    cinturaCambio: i > 0 && a.perimetro_cintura_cm && antrop[antrop.length - 1 - i + 1].perimetro_cintura_cm ? (a.perimetro_cintura_cm - antrop[antrop.length - 1 - i + 1].perimetro_cintura_cm) : 0,
  }))

  const MedicionCard = ({ label, valor, unidad, cambio, incluirEnGrafico }: { label: string; valor: number | undefined; unidad: string; cambio?: { value: string; sign: string; dir: 'up' | 'down' | 'same' }; incluirEnGrafico: boolean }) => (
    <div className={`p-3 rounded-lg border ${incluirEnGrafico ? 'border-emerald-200 bg-emerald-50' : 'border-neutral-200 bg-neutral-50'}`}>
      <p className="text-xs text-neutral-600 mb-1">{label}</p>
      <p className="text-lg font-semibold text-neutral-900">
        {valor?.toFixed(1) || '—'} <span className="text-sm text-neutral-500">{unidad}</span>
      </p>
      {cambio && primera && primera !== ultima && (
        <p className={`text-xs mt-1 font-medium ${cambio.dir === 'down' ? 'text-green-600' : cambio.dir === 'up' ? 'text-red-600' : 'text-neutral-500'}`}>
          {cambio.dir === 'down' ? '↓' : cambio.dir === 'up' ? '↑' : '—'} {cambio.value}
        </p>
      )}
    </div>
  )

  const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
  const comidas = ['desayuno', 'colacion_am', 'almuerzo', 'colacion_pm', 'cena', 'cena_tardia']
  const minutaDesglosada = (minuta?.estructura || {}) as any

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-neutral-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo-benestar.png" alt="Benestar" width={48} height={48} className="rounded-lg" />
            <div>
              <span className="text-sm font-semibold text-neutral-900">Benestar</span>
              <p className="text-xs text-neutral-500">{paciente.nombre_completo.split(' ')[0]}</p>
            </div>
          </div>
          <button onClick={logout} className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors" title="Cerrar sesión">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* INICIO */}
        {tab === 'inicio' && (
          <div className="space-y-6">
            {/* Bienvenida */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-2">Bienvenido, {paciente.nombre_completo.split(' ')[0]}! 👋</h2>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  Esperamos que te encuentres bien. Aquí encontrarás tu progreso, tus planes de alimentación y todas las indicaciones de tu nutricionista. Recuerda que cada paso cuenta en tu camino hacia tus objetivos.
                </p>
                {paciente.objetivo && (
                  <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                    <p className="text-xs text-emerald-700 font-medium mb-1">📍 Tu objetivo</p>
                    <p className="text-sm text-emerald-900">{paciente.objetivo}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Nota del control más reciente */}
            {consultas.length > 0 && consultas[0].nota_para_paciente && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Nota del control - {formatFechaCorta(consultas[0].fecha)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">
                    {consultas[0].nota_para_paciente}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Controles */}
            {citas.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Tus controles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {citas.slice(0, 5).map((cita, i) => (
                    <div key={i} className={`p-3 rounded-lg border ${cita.estado === 'programada' ? 'border-neutral-200 bg-white' : cita.estado === 'realizada' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm text-neutral-900">{formatFechaCorta(cita.fecha)}</p>
                          <p className="text-xs mt-0.5 text-neutral-500">📅 {cita.hora}</p>
                          {cita.motivo && <p className="text-xs mt-1 text-neutral-600">{cita.motivo}</p>}
                        </div>
                        <Badge variant={cita.estado === 'programada' ? 'outline' : cita.estado === 'realizada' ? 'default' : 'secondary'} className={cita.estado === 'realizada' ? 'bg-green-100 text-green-700' : cita.estado === 'cancelada' ? 'bg-red-100 text-red-700' : ''}>
                          {cita.estado === 'programada' ? 'Programada' : cita.estado === 'realizada' ? 'Realizada' : 'Cancelada'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}


          </div>
        )}

        {/* MINUTA */}
        {tab === 'minuta' && (
          <div className="space-y-6">
            {minuta ? (
              <>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Tu minuta actual</CardTitle>
                    <p className="text-xs text-neutral-500 mt-2">Válida desde {formatFechaCorta(minuta.fecha_inicio)}</p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {diasSemana.map(dia => (
                      <div key={dia} className="border border-neutral-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setMinutaDiasExpandidos(prev => ({ ...prev, [dia]: !prev[dia] }))}
                          className="w-full flex items-center justify-between p-3 bg-neutral-50 hover:bg-neutral-100 transition-colors"
                        >
                          <p className="font-medium text-sm text-neutral-900 capitalize">{dia.charAt(0).toUpperCase() + dia.slice(1)}</p>
                          <ChevronDown className={`h-4 w-4 text-neutral-500 transition-transform ${minutaDiasExpandidos[dia] ? 'rotate-180' : ''}`} />
                        </button>
                        {minutaDiasExpandidos[dia] && (
                          <div className="p-3 bg-white space-y-3 border-t border-neutral-200">
                            <div className="grid grid-cols-2 gap-3">
                              {comidas.map(comida => {
                                const label = comida === 'desayuno' ? 'Desayuno' : comida === 'colacion_am' ? 'Colación AM' : comida === 'almuerzo' ? 'Almuerzo' : comida === 'colacion_pm' ? 'Colación PM' : comida === 'cena' ? 'Cena' : 'Once'
                                const contenido = (minutaDesglosada as any)?.[dia]?.[comida] || '—'
                                return (
                                  <div key={comida} className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                                    <p className="text-xs font-medium text-neutral-600 mb-2">{label}</p>
                                    <p className="text-sm text-neutral-700">{contenido}</p>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Suplementación */}
                {(minutaDesglosada.suplementacion || minutaDesglosada.indicaciones) && (
                  <>
                    {minutaDesglosada.suplementacion && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">Suplementación</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">{minutaDesglosada.suplementacion}</p>
                        </CardContent>
                      </Card>
                    )}

                    {minutaDesglosada.indicaciones && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">Indicaciones adicionales</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">{minutaDesglosada.indicaciones}</p>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-neutral-500">
                  <p className="text-sm">No hay minuta asignada aún</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* MEDICIONES */}
        {tab === 'mediciones' && (
          <div className="space-y-6">
            {/* Comparación Primer vs Último Control */}
            {primera && ultima && primera !== ultima && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Tu progreso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Primer control */}
                  <div>
                    <p className="text-xs text-neutral-500 mb-3 font-medium">Primer control - {formatFechaCorta(primera.fecha)}</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50">
                        <p className="text-xs text-neutral-600 mb-1">Peso</p>
                        <p className="text-lg font-semibold text-neutral-900">{primera.peso_kg.toFixed(1)} <span className="text-sm text-neutral-500">kg</span></p>
                      </div>
                      <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50">
                        <p className="text-xs text-neutral-600 mb-1">IMC</p>
                        <p className="text-lg font-semibold text-neutral-900">{primera.imc.toFixed(1)}</p>
                      </div>
                      <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50">
                        <p className="text-xs text-neutral-600 mb-1">Cintura</p>
                        <p className="text-lg font-semibold text-neutral-900">{(primera.perimetro_cintura_cm || 0).toFixed(1)} <span className="text-sm text-neutral-500">cm</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Último control */}
                  <div>
                    <p className="text-xs text-neutral-500 mb-3 font-medium">Último control - {formatFechaCorta(ultima.fecha)}</p>
                    <div className="grid grid-cols-3 gap-3">
                      {/* Peso */}
                      <div className={`p-3 rounded-lg border ${ultima.peso_kg < primera.peso_kg ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <p className="text-xs text-neutral-600 mb-1">Peso</p>
                        <p className="text-lg font-semibold text-neutral-900">{ultima.peso_kg.toFixed(1)} <span className="text-sm text-neutral-500">kg</span></p>
                        <p className={`text-xs font-medium mt-2 ${ultima.peso_kg < primera.peso_kg ? 'text-green-700' : 'text-red-700'}`}>
                          {ultima.peso_kg < primera.peso_kg ? '↓' : '↑'} {Math.abs(((ultima.peso_kg - primera.peso_kg) / primera.peso_kg) * 100).toFixed(1)}%
                        </p>
                      </div>
                      {/* IMC */}
                      <div className={`p-3 rounded-lg border ${ultima.imc < primera.imc ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <p className="text-xs text-neutral-600 mb-1">IMC</p>
                        <p className="text-lg font-semibold text-neutral-900">{ultima.imc.toFixed(1)}</p>
                        <p className={`text-xs font-medium mt-2 ${ultima.imc < primera.imc ? 'text-green-700' : 'text-red-700'}`}>
                          {ultima.imc < primera.imc ? '↓' : '↑'} {Math.abs(((ultima.imc - primera.imc) / primera.imc) * 100).toFixed(1)}%
                        </p>
                      </div>
                      {/* Cintura */}
                      <div className={`p-3 rounded-lg border ${ultima.perimetro_cintura_cm && primera.perimetro_cintura_cm && ultima.perimetro_cintura_cm < primera.perimetro_cintura_cm ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <p className="text-xs text-neutral-600 mb-1">Cintura</p>
                        <p className="text-lg font-semibold text-neutral-900">{(ultima.perimetro_cintura_cm || 0).toFixed(1)} <span className="text-sm text-neutral-500">cm</span></p>
                        {ultima.perimetro_cintura_cm && primera.perimetro_cintura_cm && (
                          <p className={`text-xs font-medium mt-2 ${ultima.perimetro_cintura_cm < primera.perimetro_cintura_cm ? 'text-green-700' : 'text-red-700'}`}>
                            {ultima.perimetro_cintura_cm < primera.perimetro_cintura_cm ? '↓' : '↑'} {Math.abs(((ultima.perimetro_cintura_cm - primera.perimetro_cintura_cm) / primera.perimetro_cintura_cm) * 100).toFixed(1)}%
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ANTROPOMETRÍA - Gráfico y expandibles */}
            {chartData.length > 1 && (
              <>
                {/* Indicadores de cambio ANTROPOMETRÍA */}
                {ultima && primera && ultima !== primera && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className={`p-3 rounded-lg text-center ${ultima.peso_kg < primera.peso_kg ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      <p className="text-xs text-neutral-600 mb-1">Peso</p>
                      <p className={`text-xl font-bold ${ultima.peso_kg < primera.peso_kg ? 'text-green-700' : 'text-red-700'}`}>
                        {ultima.peso_kg < primera.peso_kg ? '↓' : '↑'} {Math.abs(ultima.peso_kg - primera.peso_kg).toFixed(1)}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg text-center ${ultima.imc < primera.imc ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      <p className="text-xs text-neutral-600 mb-1">IMC</p>
                      <p className={`text-xl font-bold ${ultima.imc < primera.imc ? 'text-green-700' : 'text-red-700'}`}>
                        {ultima.imc < primera.imc ? '↓' : '↑'} {Math.abs(ultima.imc - primera.imc).toFixed(1)}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg text-center ${ultima.perimetro_cintura_cm && primera.perimetro_cintura_cm && ultima.perimetro_cintura_cm < primera.perimetro_cintura_cm ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      <p className="text-xs text-neutral-600 mb-1">Cintura</p>
                      <p className={`text-xl font-bold ${ultima.perimetro_cintura_cm && primera.perimetro_cintura_cm && ultima.perimetro_cintura_cm < primera.perimetro_cintura_cm ? 'text-green-700' : 'text-red-700'}`}>
                        {ultima.perimetro_cintura_cm && primera.perimetro_cintura_cm && ultima.perimetro_cintura_cm < primera.perimetro_cintura_cm ? '↓' : '↑'} {ultima.perimetro_cintura_cm && primera.perimetro_cintura_cm ? Math.abs(ultima.perimetro_cintura_cm - primera.perimetro_cintura_cm).toFixed(1) : '—'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Gráfico ANTROPOMETRÍA */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Antropometría</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 -mx-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="fecha" stroke="#999" style={{ fontSize: '12px' }} />
                          <YAxis stroke="#999" style={{ fontSize: '12px' }} />
                          <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                          <Legend />
                          {visibles.peso && <Line type="monotone" dataKey="peso" stroke="#059669" strokeWidth={2} dot={false} name="Peso" />}
                          {visibles.imc && <Line type="monotone" dataKey="imc" stroke="#0284c7" strokeWidth={2} dot={false} name="IMC" />}
                          {visibles.cintura && <Line type="monotone" dataKey="cintura" stroke="#dc2626" strokeWidth={2} dot={false} name="Cintura" />}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Expandible Antropometría */}
                    <button
                      onClick={() => setExpandidos(e => ({ ...e, antropometriaExpanded: !e.antropometriaExpanded }))}
                      className="w-full mt-4 flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors border border-neutral-200"
                    >
                      <span className="text-sm font-medium text-neutral-700">Más antropometría</span>
                      <ChevronDown className={`h-4 w-4 text-neutral-500 transition-transform ${expandidos.antropometriaExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {expandidos.antropometriaExpanded && (
                      <div className="mt-3 space-y-2 pt-3 border-t border-neutral-200">
                        {(['cintura', 'cadera', 'brazo', 'torax', 'abdomen', 'muslo', 'pantorrilla'] as const).map(key => (
                          <button
                            key={key}
                            onClick={() => setVisibles(v => ({ ...v, [key]: !v[key] }))}
                            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 transition-colors"
                          >
                            <span className="text-sm text-neutral-700">{key === 'cintura' ? 'Perímetro cintura' : key === 'cadera' ? 'Perímetro cadera' : key === 'brazo' ? 'Perímetro brazo' : key === 'torax' ? 'Perímetro tórax' : key === 'abdomen' ? 'Perímetro abdomen' : key === 'muslo' ? 'Perímetro muslo' : 'Perímetro pantorrilla'}</span>
                            {visibles[key] ? <Eye className="h-4 w-4 text-emerald-600" /> : <EyeOff className="h-4 w-4 text-neutral-400" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* BIOIMPEDANCIA - Gráfico y expandibles */}
            {bioimpedancia.length > 0 && (
              <>
                {/* Indicadores de cambio BIOIMPEDANCIA */}
                {bioimpedancia.length > 1 && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className={`p-3 rounded-lg text-center ${bioimpedancia[0].masa_grasa_pct < bioimpedancia[bioimpedancia.length - 1].masa_grasa_pct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      <p className="text-xs text-neutral-600 mb-1">Masa Grasa %</p>
                      <p className={`text-xl font-bold ${bioimpedancia[0].masa_grasa_pct < bioimpedancia[bioimpedancia.length - 1].masa_grasa_pct ? 'text-green-700' : 'text-red-700'}`}>
                        {bioimpedancia[0].masa_grasa_pct < bioimpedancia[bioimpedancia.length - 1].masa_grasa_pct ? '↓' : '↑'} {Math.abs(bioimpedancia[0].masa_grasa_pct - bioimpedancia[bioimpedancia.length - 1].masa_grasa_pct).toFixed(1)}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg text-center ${bioimpedancia[0].agua_corporal_pct < bioimpedancia[bioimpedancia.length - 1].agua_corporal_pct ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                      <p className="text-xs text-neutral-600 mb-1">Agua Corporal %</p>
                      <p className={`text-xl font-bold ${bioimpedancia[0].agua_corporal_pct < bioimpedancia[bioimpedancia.length - 1].agua_corporal_pct ? 'text-red-700' : 'text-green-700'}`}>
                        {bioimpedancia[0].agua_corporal_pct < bioimpedancia[bioimpedancia.length - 1].agua_corporal_pct ? '↓' : '↑'} {Math.abs(bioimpedancia[0].agua_corporal_pct - bioimpedancia[bioimpedancia.length - 1].agua_corporal_pct).toFixed(1)}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg text-center ${bioimpedancia[0].masa_grasa_kg < bioimpedancia[bioimpedancia.length - 1].masa_grasa_kg ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      <p className="text-xs text-neutral-600 mb-1">Masa Grasa kg</p>
                      <p className={`text-xl font-bold ${bioimpedancia[0].masa_grasa_kg < bioimpedancia[bioimpedancia.length - 1].masa_grasa_kg ? 'text-green-700' : 'text-red-700'}`}>
                        {bioimpedancia[0].masa_grasa_kg < bioimpedancia[bioimpedancia.length - 1].masa_grasa_kg ? '↓' : '↑'} {Math.abs(bioimpedancia[0].masa_grasa_kg - bioimpedancia[bioimpedancia.length - 1].masa_grasa_kg).toFixed(1)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Gráfico BIOIMPEDANCIA */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Bioimpedancia</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 -mx-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={bioimpedancia.slice().reverse().map((b, i) => ({
                          fecha: formatFechaCorta(b.fecha),
                          masa_grasa_kg: b.masa_grasa_kg,
                          masa_grasa_pct: b.masa_grasa_pct,
                          agua_corporal_pct: b.agua_corporal_pct,
                        }))} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="fecha" stroke="#999" style={{ fontSize: '12px' }} />
                          <YAxis stroke="#999" style={{ fontSize: '12px' }} />
                          <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                          <Legend />
                          {visibles.masa_grasa_kg && <Line type="monotone" dataKey="masa_grasa_kg" stroke="#f59e0b" strokeWidth={2} dot={false} name="Masa Grasa (kg)" />}
                          {visibles.masa_grasa_pct && <Line type="monotone" dataKey="masa_grasa_pct" stroke="#ef4444" strokeWidth={2} dot={false} name="Masa Grasa (%)" />}
                          {visibles.agua_corporal_pct && <Line type="monotone" dataKey="agua_corporal_pct" stroke="#3b82f6" strokeWidth={2} dot={false} name="Agua Corporal (%)" />}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Expandible Bioimpedancia */}
                    <button
                      onClick={() => setExpandidos(e => ({ ...e, bioimpedanciaExpanded: !e.bioimpedanciaExpanded }))}
                      className="w-full mt-4 flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors border border-neutral-200"
                    >
                      <span className="text-sm font-medium text-neutral-700">Más bioimpedancia</span>
                      <ChevronDown className={`h-4 w-4 text-neutral-500 transition-transform ${expandidos.bioimpedanciaExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {expandidos.bioimpedanciaExpanded && (
                      <div className="mt-3 space-y-2 pt-3 border-t border-neutral-200">
                        {['masa_grasa_kg', 'masa_grasa_pct', 'agua_corporal_pct'].map(key => (
                          <button
                            key={key}
                            onClick={() => setVisibles(v => ({ ...v, [key as keyof MedicionesVisibles]: !v[key as keyof MedicionesVisibles] }))}
                            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 transition-colors"
                          >
                            <span className="text-sm text-neutral-700">{key === 'masa_grasa_kg' ? 'Masa Grasa (kg)' : key === 'masa_grasa_pct' ? 'Masa Grasa (%)' : 'Agua Corporal (%)'}</span>
                            {visibles[key as keyof MedicionesVisibles] ? <Eye className="h-4 w-4 text-emerald-600" /> : <EyeOff className="h-4 w-4 text-neutral-400" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Historial */}
            {antrop.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Historial de mediciones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {antrop.map((a, i) => (
                    <div key={i} className={`p-3 rounded-lg border ${i === 0 ? 'border-emerald-200 bg-emerald-50' : 'border-neutral-200'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-neutral-600">{formatFechaCorta(a.fecha)}</p>
                        {i === 0 && <Badge variant="default" className="text-xs">Más reciente</Badge>}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-neutral-500">Peso</p>
                          <p className="font-semibold text-neutral-900">{a.peso_kg.toFixed(1)} kg</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500">IMC</p>
                          <p className="font-semibold text-neutral-900">{a.imc.toFixed(1)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500">Cintura</p>
                          <p className="font-semibold text-neutral-900">{(a.perimetro_cintura_cm || 0).toFixed(1)} cm</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* NOTAS */}
        {tab === 'notas' && (
          <div className="space-y-4">
            {notas.length > 0 ? (
              notas.map((nota, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-sm">{nota.titulo || 'Nota'}</CardTitle>
                        <p className="text-xs text-neutral-500 mt-1">{formatFechaCorta(nota.created_at)}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">{nota.contenido}</p>
                    {(nota.archivos?.length || 0) > 0 && (
                      <div className="mt-3 pt-3 border-t border-neutral-200 space-y-1">
                        {nota.archivos?.map((arch, idx) => (
                          <a
                            key={idx}
                            href={nota.archivos_urls?.[idx]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs text-emerald-600 hover:text-emerald-700"
                          >
                            📎 {arch}
                          </a>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-neutral-500">
                <p className="text-sm">No hay notas aún</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200">
        <div className="max-w-2xl mx-auto px-4 flex gap-0">
          {(['inicio', 'minuta', 'mediciones', 'notas'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 px-1 text-xs font-medium flex flex-col items-center gap-1 border-t-2 transition-colors ${
                tab === t
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {t === 'inicio' && <Home className="h-4 w-4" />}
              {t === 'minuta' && <Utensils className="h-4 w-4" />}
              {t === 'mediciones' && <TrendingDown className="h-4 w-4" />}
              {t === 'notas' && <FileText className="h-4 w-4" />}
              <span className="text-xs">{t === 'inicio' ? 'Inicio' : t === 'minuta' ? 'Minuta' : t === 'mediciones' ? 'Med.' : 'Notas'}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
