'use client'

import { Download } from 'lucide-react'
import type { Paciente, PerfilProfesional } from '@/lib/types'
import { generarPDFPaciente } from '@/lib/pdf'
import { FichaPDFContent } from './ficha-pdf-content'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  paciente: Paciente
  perfil: PerfilProfesional
  primeraAntrop?: { peso_kg: number; talla_cm: number; imc: number; perimetro_cintura_cm: number; perimetro_cadera_cm: number }
  medicamentos: any[]
}

export function FichaPDFPreview({ open, onOpenChange, paciente, perfil, primeraAntrop, medicamentos }: Props) {
  function descargar() {
    generarPDFPaciente(paciente, medicamentos, perfil, primeraAntrop)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle>Vista previa — Ficha del paciente</DialogTitle>
          <Button variant="ghost" size="sm" onClick={() => descargar()} className="gap-1.5">
            <Download className="h-4 w-4" /> Descargar PDF
          </Button>
        </DialogHeader>

        {/* Preview */}
        <div className="flex-1 overflow-y-auto bg-neutral-100 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-full p-6">
            <FichaPDFContent
              paciente={paciente}
              perfil={perfil}
              primeraAntrop={primeraAntrop}
              medicamentos={medicamentos}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
