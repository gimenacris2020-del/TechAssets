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
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/shared/FormField'
import { useToast } from '@/components/shared/ToastProvider'
import { equipoService } from '@/services/equipoService'
import type { Equipo } from '@/services/types'

interface CambiarEstadoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipo: Equipo | null
  onSaved: () => void
}

const ESTADOS_OPERATIVOS: string[] = ['Disponible', 'Mantenimiento', 'Baja']

export function CambiarEstadoModal({ open, onOpenChange, equipo, onSaved }: CambiarEstadoModalProps) {
  const { showSuccess, showError } = useToast()
  const [estado, setEstado] = useState<string>('Disponible')
  const [motivo, setMotivo] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open && equipo) {
      setEstado(equipo.estado === 'Prestado' ? 'Disponible' : equipo.estado)
      setMotivo('')
    }
  }, [open, equipo])

  const procesarCambioEstado = async (e: FormEvent) => {
    e.preventDefault()
    if (!equipo) return

    setIsSubmitting(true)
    try {
      await equipoService.cambiarEstadoActivo(equipo.id, {
        estado,
        motivo: motivo.trim() || undefined,
      })
      showSuccess('Estado actualizado', `El equipo ahora se encuentra en estado '${estado}'.`)
      onOpenChange(false)
      onSaved()
    } catch (err) {
      showError('No se pudo actualizar el estado', err instanceof Error ? err.message : undefined)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Actualizar Estado del Equipo</DialogTitle>
          <DialogDescription>
            {equipo ? `${equipo.codigoPatrimonial} â€” ${equipo.nombre}` : ''}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={procesarCambioEstado} className="space-y-4">
          <FormField label="Nuevo estado" htmlFor="estado-eq" required>
            <Select
              id="estado-eq"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              {ESTADOS_OPERATIVOS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Motivo o detalle del movimiento" htmlFor="motivo-eq">
            <Textarea
              id="motivo-eq"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej. Mantenimiento preventivo / equipo obsoleto..."
            />
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Actualizando...' : 'Confirmar cambio'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
