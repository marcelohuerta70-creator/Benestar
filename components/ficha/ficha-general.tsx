'use client'

import { useState } from 'react'
import { Edit2, Check, X, Mail, Phone, MapPin, Globe, ShieldCheck, UserCheck } from 'lucide-react'
import type { Paciente } from '@/lib/types'
import { calcularEdad, formatFecha } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  paciente: Paciente
  onUpdate: (p: Paciente) => void
}

export function FichaGeneral({ paciente, onUpdate }: Props) {
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState(paciente)

  function update(field: keyof Paciente, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function guardar() { onUpdate(form); setEditando(false) }
  function cancelar() { setForm(paciente); setEditando(false) }

  const edad = calcularEdad(paciente.fecha_nacimiento)

  const PREVISION_LABEL: Record<string, string> = {
    fonasa: 'Fonasa', isapre: 'Isapre', particular: 'Particular', otro: 'Otro',
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Actions */}
      <div className="flex justify-end">
        {!editando ? (
          <Button variant="outline" size="sm" onClick={() => setEditando(true)} className="gap-1.5">
            <Edit2 className="h-3.5 w-3.5" /> Editar ficha
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={cancelar} className="gap-1.5">
              <X className="h-3.5 w-3.5" /> Cancelar
            </Button>
            <Button size="sm" onClick={guardar} className="gap-1.5">
              <Check className="h-3.5 w-3.5" /> Guardar
            </Button>
          </div>
        )}
      </div>

      {/* Datos personales */}
      <Card>
        <CardHeader className="pb-3"><CardTitle>Datos personales</CardTitle></CardHeader>
        <CardContent>
          {!editando ? (
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Nombre completo" value={paciente.nombre_completo} className="col-span-2" />
              <InfoRow label="RUT" value={paciente.rut} />
              <InfoRow label="Fecha de nacimiento" value={`${formatFecha(paciente.fecha_nacimiento)} · ${edad} años`} />
              <InfoRow label="Sexo" value={paciente.sexo === 'F' ? 'Femenino' : 'Masculino'} />
              <InfoRow label="Género" value={paciente.genero || '—'} />
              <InfoRow label="Objetivo" value={paciente.objetivo} className="col-span-2" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nombre completo" className="col-span-2">
                <Input value={form.nombre_completo} onChange={e => update('nombre_completo', e.target.value)} />
              </Field>
              <Field label="RUT">
                <Input value={form.rut} onChange={e => update('rut', e.target.value)} />
              </Field>
              <Field label="Fecha de nacimiento">
                <Input type="date" value={form.fecha_nacimiento} onChange={e => update('fecha_nacimiento', e.target.value)} />
              </Field>
              <Field label="Sexo">
                <Select value={form.sexo} onValueChange={v => update('sexo', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="F">Femenino</SelectItem>
                    <SelectItem value="M">Masculino</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Género (opcional)">
                <Select value={form.genero || ''} onValueChange={v => update('genero', v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="femenino">Femenino</SelectItem>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="no_binario">No binario</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                    <SelectItem value="no_responde">Prefiero no responder</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Objetivo" className="col-span-2">
                <Input value={form.objetivo} onChange={e => update('objetivo', e.target.value)} />
              </Field>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contacto */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2"><Phone className="h-4 w-4 text-neutral-400" /> Contacto</CardTitle>
        </CardHeader>
        <CardContent>
          {!editando ? (
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Teléfono" value={paciente.telefono || '—'} />
              <InfoRow label="Correo electrónico" value={paciente.email || '—'} />
              <InfoRow label="Contacto de emergencia" value={paciente.contacto_emergencia || '—'} />
              <InfoRow label="Teléfono emergencia" value={paciente.telefono_emergencia || '—'} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Teléfono">
                <Input value={form.telefono} onChange={e => update('telefono', e.target.value)} placeholder="+56 9 1234 5678" />
              </Field>
              <Field label="Correo electrónico">
                <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="correo@ejemplo.cl" />
              </Field>
              <Field label="Contacto de emergencia">
                <Input value={form.contacto_emergencia || ''} onChange={e => update('contacto_emergencia', e.target.value)} placeholder="Nombre del contacto" />
              </Field>
              <Field label="Teléfono emergencia">
                <Input value={form.telefono_emergencia || ''} onChange={e => update('telefono_emergencia', e.target.value)} placeholder="+56 9 8765 4321" />
              </Field>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Domicilio */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2"><MapPin className="h-4 w-4 text-neutral-400" /> Domicilio</CardTitle>
        </CardHeader>
        <CardContent>
          {!editando ? (
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Dirección" value={paciente.direccion || '—'} className="col-span-2" />
              <InfoRow label="Comuna" value={paciente.comuna || '—'} />
              <InfoRow label="Ciudad" value={paciente.ciudad || '—'} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Dirección" className="col-span-2">
                <Input value={form.direccion || ''} onChange={e => update('direccion', e.target.value)} placeholder="Av. Providencia 1234, Depto. 5" />
              </Field>
              <Field label="Comuna">
                <Input value={form.comuna || ''} onChange={e => update('comuna', e.target.value)} placeholder="Providencia" />
              </Field>
              <Field label="Ciudad">
                <Input value={form.ciudad || ''} onChange={e => update('ciudad', e.target.value)} placeholder="Santiago" />
              </Field>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sistema de salud */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-neutral-400" /> Sistema de salud</CardTitle>
        </CardHeader>
        <CardContent>
          {!editando ? (
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Previsión" value={paciente.prevision ? PREVISION_LABEL[paciente.prevision] + (paciente.prevision === 'otro' && paciente.prevision_otro ? ` (${paciente.prevision_otro})` : '') : '—'} />
              <InfoRow label="CESFAM" value={paciente.cesfam || '—'} />
              <InfoRow label="Médico tratante" value={paciente.medico_tratante || '—'} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Previsión">
                <Select value={form.prevision || ''} onValueChange={v => update('prevision', v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fonasa">Fonasa</SelectItem>
                    <SelectItem value="isapre">Isapre</SelectItem>
                    <SelectItem value="particular">Particular</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              {form.prevision === 'otro' && (
                <Field label="¿Cuál?">
                  <Input value={form.prevision_otro || ''} onChange={e => update('prevision_otro', e.target.value)} placeholder="Especificar..." />
                </Field>
              )}
              <Field label="CESFAM">
                <Input value={form.cesfam || ''} onChange={e => update('cesfam', e.target.value)} placeholder="Nombre del CESFAM" />
              </Field>
              <Field label="Médico tratante">
                <Input value={form.medico_tratante || ''} onChange={e => update('medico_tratante', e.target.value)} placeholder="Dr./Dra. Nombre Apellido" />
              </Field>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Portal */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Globe className="h-4 w-4 text-neutral-500" />
              <div>
                <p className="text-sm font-medium text-neutral-900">Portal del paciente</p>
                <p className="text-xs text-neutral-500 mt-0.5">Acceso de solo lectura para el paciente</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={paciente.portal_activo ? 'default' : 'secondary'}>
                {paciente.portal_activo ? 'Activado' : 'Desactivado'}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => {
                const updated = { ...paciente, portal_activo: !paciente.portal_activo }
                onUpdate(updated)
              }}>
                {paciente.portal_activo ? 'Desactivar' : 'Activar'}
              </Button>
            </div>
          </div>
          {paciente.portal_activo && (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 rounded-lg">
                <p className="text-xs text-emerald-700 font-medium mb-2">Datos de acceso</p>
                <p className="text-xs text-emerald-700">
                  RUT: <strong>{paciente.rut}</strong>
                </p>
              </div>
              {!editando ? (
                <div className="p-3 bg-neutral-100 rounded-lg">
                  <p className="text-xs text-neutral-600 font-medium mb-2">Contraseña</p>
                  <p className="text-xs text-neutral-700 font-mono">••••••••</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="password" className="text-xs">Contraseña del paciente</Label>
                  <Input
                    id="password"
                    type="text"
                    placeholder="Ingresa una contraseña (mínimo 6 caracteres)"
                    value={form.contraseña_hash || ''}
                    onChange={e => update('contraseña_hash', e.target.value)}
                  />
                  <p className="text-xs text-neutral-500">Comparte esta contraseña con el paciente para que acceda al portal.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notas generales */}
      <Card>
        <CardHeader className="pb-3"><CardTitle>Notas generales</CardTitle></CardHeader>
        <CardContent>
          {!editando ? (
            <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">
              {paciente.notas_generales || <span className="text-neutral-400 italic">Sin notas.</span>}
            </p>
          ) : (
            <Textarea
              value={form.notas_generales}
              onChange={e => update('notas_generales', e.target.value)}
              placeholder="Antecedentes generales, observaciones..."
              rows={4}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function InfoRow({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs text-neutral-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-neutral-900">{value || '—'}</p>
    </div>
  )
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className || ''}`}>
      <Label>{label}</Label>
      {children}
    </div>
  )
}
