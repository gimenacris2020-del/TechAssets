import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/shared/FormField'
import { useToast } from '@/components/shared/ToastProvider'
import { prestamoService } from '@/services/prestamoService'
import type { Prestamo } from '@/services/types'

interface DevolucionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prestamo: Prestamo | null
  onSaved: () => void
}

function toLocalDateTimeInput(date: Date): string {
  const offsetMs = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

export function DevolucionModal({ open, onOpenChange, prestamo, onSaved }: DevolucionModalProps) {
  const { showSuccess, showError } = useToast()

  const [fechaDevolucion, setFechaDevolucion] = useState('')
  const [observacionDevolucion, setObservacionDevolucion] = useState('')
  const [enviarAMantenimiento, setEnviarAMantenimiento] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setFechaDevolucion(toLocalDateTimeInput(new Date()))
      setObservacionDevolucion('')
      setEnviarAMantenimiento(false)
      setErrors({})
    }
  }, [open])

  const validarRecepcion = () => {
    const nextErrors: Record<string, string> = {}
    if (!fechaDevolucion) {
      nextErrors.fechaDevolucion = 'La fecha de devoluciÃ³n es obligatoria.'
    } else if (prestamo && new Date(fechaDevolucion) <= new Date(prestamo.fechaPrestamo)) {
      nextErrors.fechaDevolucion =
        'La fecha de devoluciÃ³n debe ser posterior a la fecha de prÃ©stamo.'
    }

    if (observacionDevolucion.trim().length < 3) {
      nextErrors.observacionDevolucion =
        'Toda devoluciÃ³n debe registrar observaciones (mÃ­nimo 3 caracteres).'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const registrarRetornoEquipo = async (e: FormEvent) => {
    e.preventDefault()
    if (!prestamo || !validarRecepcion()) return

    setIsSubmitting(true)
    try {
      await prestamoService.confirmarDevolucion(prestamo.id, {
        fechaDevolucion: new Date(fechaDevolucion).toISOString(),
        observacionDevolucion: observacionDevolucion.trim(),
        enviarAMantenimiento,
      })
      showSuccess(
        'DevoluciÃ³n registrada',
        `El equipo ${prestamo.equipoCodigoPatrimonial} fue devuelto correctamente.`,
      )
      onOpenChange(false)
      onSaved()
    } catch (err) {
      showError('No se pudo registrar la devoluciÃ³n', err instanceof Error ? err.message : undefined)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar DevoluciÃ³n</DialogTitle>
          <DialogDescription>
            {prestamo
              ? `${prestamo.equipoCodigoPatrimonial} â€” ${prestamo.equipoNombre} (Colaborador: ${prestamo.usuarioNombre})`
              : ''}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={registrarRetornoEquipo} className="space-y-4">
          <FormField
            label="Fecha y hora de devoluciÃ³n"
            htmlFor="dev-fecha"
            error={errors.fechaDevolucion}
            required
          >
            <Input
              id="dev-fecha"
              type="datetime-local"
              value={fechaDevolucion}
              onChange={(e) => setFechaDevolucion(e.target.value)}
            />
          </FormField>

          <FormField
            label="Observaciones de recepciÃ³n"
            htmlFor="dev-obs"
            error={errors.observacionDevolucion}
            required
          >
            <Textarea
              id="dev-obs"
              value={observacionDevolucion}
              onChange={(e) => setObservacionDevolucion(e.target.value)}
              placeholder="Ej. Equipo devuelto en Ã³ptimas condiciones con cargador original."
            />
          </FormField>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={enviarAMantenimiento}
              onChange={(e) => setEnviarAMantenimiento(e.target.checked)}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            Enviar equipo a estado Mantenimiento despuÃ©s de la devoluciÃ³n
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registrando...' : 'Confirmar devoluciÃ³n'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
