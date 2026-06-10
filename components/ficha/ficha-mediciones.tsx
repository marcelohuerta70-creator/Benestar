'use client'

import { useEffect, useState } from 'react'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, AreaChart, Area,
} from 'recharts'
import { supabase } from '@/lib/supabase'
import { formatFechaCorta } from '@/lib/utils'
import type { Antropometria, Bioimpedancia } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Props { pacienteId: string }

export function FichaMediciones({ pacienteId }: Props) {
  const [antrop, setAntrop] = useState<Antropometria[]>([])
  const [bio, setBio] = useState<Bioimpedancia[]>([])

  useEffect(() => {
    const loadMediciones = async () => {
      try {
        const [{ data: antropData }, { data: bioData }] = await Promise.all([
          supabase.from('mediciones_antropometria').select('*').eq('paciente_id', pacienteId).order('fecha', { ascending: false }),
          supabase.from('mediciones_bioimpedancia').select('*').eq('paciente_id', pacienteId).order('fecha', { ascending: false }),
        ])
        setAntrop((antropData as Antropometria[]) || [])
        setBio((bioData as Bioimpedancia[]) || [])
      } catch (err) {
        console.error('[Load Mediciones Error]', err)
      }
    }
    loadMediciones()
  }, [pacienteId])

  if (antrop.length === 0 && bio.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3">
          <TrendingDown className="h-6 w-6 text-neutral-400" />
        </div>
        <p className="text-neutral-500 font-medium">Sin mediciones registradas</p>
        <p className="text-sm text-neutral-400 mt-1">
          Las mediciones se registran desde el tab <strong>Controles</strong> al crear una consulta.
        </p>
      </div>
    )
  }

  // Calcular progreso (primer vs último)
  const primera = antrop[0]
  const ultima = antrop[antrop.length - 1]
  const primeraBio = bio[0]
  const ultimaBio = bio[bio.length - 1]

  // Data para gráficos combinada
  const chartData = antrop.map(a => {
    const b = bio.find(x => x.fecha === a.fecha)
    return {
      fecha: formatFechaCorta(a.fecha),
      peso: a.peso_kg,
      imc: a.imc,
      cintura: a.perimetro_cintura_cm || null,
      icc: a.icc || null,
      grasa_pct: b?.masa_grasa_pct || null,
      musculo: b?.masa_magra_kg || null,
      agua: b?.agua_corporal_pct || null,
    }
  })

  // Datos solo bioimpedancia
  const bioData = bio.map(b => ({
    fecha: formatFechaCorta(b.fecha),
    grasa: b.masa_grasa_kg,
    musculo: b.masa_magra_kg,
    agua: b.agua_corporal_lt,
    metabolismo: b.metabolismo_basal_kcal,
  }))

  function delta(first: number, last: number) {
    const d = last - first
    return { value: Math.abs(d).toFixed(1), direction: d > 0 ? 'up' : d < 0 ? 'down' : 'same', sign: d > 0 ? '+' : d < 0 ? '-' : '' }
  }

  const PROGRESS_CARDS = [
    ...(primera && ultima ? [
      { label: 'Peso', unit: 'kg', d: delta(primera.peso_kg, ultima.peso_kg), good: 'down' },
      primera.perimetro_cintura_cm && ultima.perimetro_cintura_cm
        ? { label: 'Cintura', unit: 'cm', d: delta(primera.perimetro_cintura_cm, ultima.perimetro_cintura_cm), good: 'down' }
        : null,
    ] : []),
    ...(primeraBio && ultimaBio ? [
      { label: '% Grasa', unit: '%', d: delta(primeraBio.masa_grasa_pct, ultimaBio.masa_grasa_pct), good: 'down' },
      { label: 'Masa magra', unit: 'kg', d: delta(primeraBio.masa_magra_kg, ultimaBio.masa_magra_kg), good: 'up' },
    ] : []),
  ].filter(Boolean) as Array<{ label: string; unit: string; d: ReturnType<typeof delta>; good: string }>

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold text-neutral-900">Historial de mediciones</h2>
        <p className="text-sm text-neutral-500 mt-0.5">
          Datos registrados desde los controles · {antrop.length} medición(es)
        </p>
      </div>

      {/* Progreso desde primera consulta */}
      {PROGRESS_CARDS.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Progreso desde la primera consulta</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PROGRESS_CARDS.map(card => {
              const isGood = (card.good === 'down' && card.d.direction === 'down') || (card.good === 'up' && card.d.direction === 'up')
              const isBad = (card.good === 'down' && card.d.direction === 'up') || (card.good === 'up' && card.d.direction === 'down')
              return (
                <div key={card.label} className={`rounded-xl border p-4 ${isGood ? 'border-emerald-200 bg-emerald-50' : isBad ? 'border-red-100 bg-red-50' : 'border-neutral-200 bg-white'}`}>
                  <p className="text-xs text-neutral-500 mb-1">{card.label}</p>
                  <div className="flex items-center gap-1">
                    {card.d.direction === 'down' ? <TrendingDown className={`h-4 w-4 ${isGood ? 'text-emerald-600' : 'text-red-500'}`} /> :
                     card.d.direction === 'up' ? <TrendingUp className={`h-4 w-4 ${isGood ? 'text-emerald-600' : 'text-red-500'}`} /> :
                     <Minus className="h-4 w-4 text-neutral-400" />}
                    <span className={`text-xl font-bold ${isGood ? 'text-emerald-700' : isBad ? 'text-red-600' : 'text-neutral-700'}`}>
                      {card.d.sign}{card.d.value} {card.unit}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Última medición */}
      {ultima && (
        <div>
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Última medición — {formatFechaCorta(ultima.fecha)}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Peso" value={`${ultima.peso_kg} kg`} />
            <StatCard label="IMC" value={String(ultima.imc)} sub={clasificarIMC(ultima.imc)} subColor={imcColor(ultima.imc)} />
            {ultima.perimetro_cintura_cm > 0 && <StatCard label="Cintura" value={`${ultima.perimetro_cintura_cm} cm`} />}
            {ultima.icc > 0 && <StatCard label="ICC" value={String(ultima.icc)} />}
            {ultimaBio && <>
              <StatCard label="% Grasa" value={`${ultimaBio.masa_grasa_pct}%`} />
              <StatCard label="Masa magra" value={`${ultimaBio.masa_magra_kg} kg`} />
              {ultimaBio.agua_corporal_lt > 0 && <StatCard label="Agua corporal" value={`${ultimaBio.agua_corporal_lt} L`} />}
              {ultimaBio.metabolismo_basal_kcal > 0 && <StatCard label="Metab. basal" value={`${ultimaBio.metabolismo_basal_kcal} kcal`} />}
            </>}
          </div>
        </div>
      )}

      {/* Gráficos — solo si hay más de 1 dato */}
      {antrop.length > 1 && (
        <>
          <ChartCard title="Peso (kg)">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
              <defs><linearGradient id="gPeso" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#059669" stopOpacity={0.2} /><stop offset="95%" stopColor="#059669" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Area type="monotone" dataKey="peso" name="Peso (kg)" stroke="#059669" fill="url(#gPeso)" strokeWidth={2} dot={{ r: 4 }} />
            </AreaChart>
          </ChartCard>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ChartCard title="IMC" small>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="fecha" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Line type="monotone" dataKey="imc" name="IMC" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ChartCard>

            {chartData.some(d => d.cintura) && (
              <ChartCard title="Cintura (cm)" small>
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Line type="monotone" dataKey="cintura" name="Cintura (cm)" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ChartCard>
            )}
          </div>
        </>
      )}

      {bio.length > 1 && (
        <>
          <ChartCard title="Masa grasa vs. Masa magra (kg)">
            <LineChart data={bioData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="grasa" name="Masa grasa (kg)" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="musculo" name="Masa magra (kg)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ChartCard>

          {chartData.some(d => d.grasa_pct) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ChartCard title="% Grasa corporal" small>
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Line type="monotone" dataKey="grasa_pct" name="% Grasa" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ChartCard>
              {chartData.some(d => d.agua) && (
                <ChartCard title="% Agua corporal" small>
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="fecha" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Line type="monotone" dataKey="agua" name="% Agua" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ChartCard>
              )}
            </div>
          )}
        </>
      )}

      {/* Tabla historial */}
      {antrop.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle>Historial completo</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100">
                    {['Fecha', 'Peso (kg)', 'Talla (cm)', 'IMC', 'Clasificación', 'Cintura (cm)', 'Cadera (cm)', 'ICC'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...antrop].reverse().map(a => (
                    <tr key={a.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                      <td className="px-4 py-3 text-neutral-600">{formatFechaCorta(a.fecha)}</td>
                      <td className="px-4 py-3 font-semibold text-neutral-900">{a.peso_kg}</td>
                      <td className="px-4 py-3 text-neutral-600">{a.talla_cm}</td>
                      <td className="px-4 py-3"><span className={`font-semibold ${imcColor(a.imc)}`}>{a.imc}</span></td>
                      <td className="px-4 py-3"><Badge variant="secondary" className="text-xs">{clasificarIMC(a.imc)}</Badge></td>
                      <td className="px-4 py-3 text-neutral-600">{a.perimetro_cintura_cm || '—'}</td>
                      <td className="px-4 py-3 text-neutral-600">{a.perimetro_cadera_cm || '—'}</td>
                      <td className="px-4 py-3 text-neutral-600">{a.icc || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {bio.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle>Historial bioimpedancia</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100">
                    {['Fecha', 'Grasa (kg)', '% Grasa', 'Magra (kg)', 'Agua (L)', 'MB (kcal)', 'Edad metab.'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...bio].reverse().map(b => (
                    <tr key={b.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                      <td className="px-4 py-3 text-neutral-600">{formatFechaCorta(b.fecha)}</td>
                      <td className="px-4 py-3 text-neutral-700">{b.masa_grasa_kg}</td>
                      <td className="px-4 py-3 text-neutral-700">{b.masa_grasa_pct}%</td>
                      <td className="px-4 py-3 font-semibold text-neutral-900">{b.masa_magra_kg}</td>
                      <td className="px-4 py-3 text-neutral-700">{b.agua_corporal_lt}</td>
                      <td className="px-4 py-3 text-neutral-700">{b.metabolismo_basal_kcal || '—'}</td>
                      <td className="px-4 py-3 text-neutral-700">{b.edad_metabolica || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatCard({ label, value, sub, subColor }: { label: string; value: string; sub?: string; subColor?: string }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4">
      <p className="text-xs text-neutral-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-neutral-900">{value}</p>
      {sub && <p className={`text-xs mt-0.5 ${subColor || 'text-neutral-500'}`}>{sub}</p>}
    </div>
  )
}

function ChartCard({ title, children, small }: { title: string; children: React.ReactNode; small?: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm">{title}</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={small ? 160 : 220}>
          {children as React.ReactElement}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function imcColor(imc: number): string {
  if (imc < 18.5) return 'text-blue-600'
  if (imc < 25) return 'text-emerald-600'
  if (imc < 30) return 'text-yellow-600'
  return 'text-red-600'
}

function clasificarIMC(imc: number): string {
  if (imc < 18.5) return 'Bajo peso'
  if (imc < 25) return 'Normal'
  if (imc < 30) return 'Sobrepeso'
  if (imc < 35) return 'Obesidad I'
  return 'Obesidad II+'
}
