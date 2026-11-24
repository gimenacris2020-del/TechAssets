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
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/shared/FormField'
import { useToast } from '@/components/shared/ToastProvider'
import { prestamoService } from '@/services/prestamoService'
import type { Prestamo } from '@/services/types'

interface RechazarPrestamoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prestamo: Prestamo | null
  onSaved: () => void
}

export function RechazarPrestamoModal({ open, onOpenChange, prestamo, onSaved }: RechazarPrestamoModalProps) {
  const { showSuccess, showError } = useToast()
  const [motivo, setMotivo] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setMotivo('')
      setError(undefined)
    }
  }, [open])

  const procesarDenegacion = async (e: FormEvent) => {
    e.preventDefault()
    if (!prestamo) return

    if (motivo.trim().length < 3) {
      setError('Debe indicar el motivo del rechazo (mÃ­nimo 3 caracteres).')
      return
    }

    setIsSubmitting(true)
    try {
      await prestamoService.denegarSolicitud(prestamo.id, motivo.trim())
      showSuccess('Solicitud rechazada', 'La solicitud de prÃ©stamo fue marcada como Rechazada.')
      onOpenChange(false)
      onSaved()
    } catch (err) {
      showError('No se pudo rechazar la solicitud', err instanceof Error ? err.message : undefined)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rechazar Solicitud de PrÃ©stamo</DialogTitle>
          <DialogDescription>
            {prestamo
              ? `${prestamo.equipoCodigoPatrimonial} solicitado por ${prestamo.usuarioNombre}`
              : ''}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={procesarDenegacion} className="space-y-4">
          <FormField label="Motivo del rechazo" htmlFor="rec-motivo" error={error} required>
            <Textarea
              id="rec-motivo"
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value)
                setError(undefined)
              }}
              placeholder="Ej. Equipo reservado para capacitaciÃ³n interna."
            />
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting ? 'Rechazando...' : 'Rechazar solicitud'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
