import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  CornerDownLeft,
  Cpu,
  Sparkles,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/shared/FormField'
import { PrestamoStatusBadge } from '@/components/shared/StatusBadge'
import { useToast } from '@/components/shared/ToastProvider'
import { prestamoService } from '@/services/prestamoService'
import { CATEGORIA_LABELS, type Prestamo } from '@/services/types'

function toLocalDateTimeInput(date: Date): string {
  const offsetMs = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

export function RegistrarDevolucionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()

  const [prestamo, setPrestamo] = useState<Prestamo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fechaDevolucion, setFechaDevolucion] = useState(() => toLocalDateTimeInput(new Date()))
  const [observacionDevolucion, setObservacionDevolucion] = useState('')
  const [enviarAMantenimiento, setEnviarAMantenimiento] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const cargarPrestamo = useCallback(async () => {
    setIsLoading(true)
    try {
      const lista = await prestamoService.listarSolicitudes({})
      setPrestamo(lista.find((p) => p.id === id) ?? null)
    } catch (err) {
      showError('Error al cargar el préstamo', err instanceof Error ? err.message : undefined)
    } finally {
      setIsLoading(false)
    }
  }, [id, showError])

  useEffect(() => {
    void cargarPrestamo()
    setFechaDevolucion(toLocalDateTimeInput(new Date()))
  }, [cargarPrestamo])

  const validarRecepcion = () => {
    const nextErrors: Record<string, string> = {}
    if (!fechaDevolucion) {
      nextErrors.fechaDevolucion = 'La fecha de devolución es obligatoria.'
    } else if (prestamo && new Date(fechaDevolucion) <= new Date(prestamo.fechaPrestamo)) {
      nextErrors.fechaDevolucion =
        'La fecha de devolución debe ser posterior a la fecha de inicio del préstamo.'
    }

    if (observacionDevolucion.trim().length < 3) {
      nextErrors.observacionDevolucion =
        'Toda devolución debe registrar observaciones (mínimo 3 caracteres).'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const procesarDevolucionEnPagina = async (e: FormEvent) => {
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
        'Devolución registrada con éxito',
        `El activo ${prestamo.equipoCodigoPatrimonial} fue recepcionado y fuiste redirigido a préstamos.`,
      )
      navigate('/prestamos', { replace: true })
    } catch (err) {
      showError('No se pudo registrar la devolución', err instanceof Error ? err.message : undefined)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-purple-200/80 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-0.5 text-xs font-extrabold text-purple-800">
            <Sparkles className="h-3.5 w-3.5" />
            Recepción y Auditoría de Activo
          </span>
          <h2 className="mt-1.5 text-2xl font-black tracking-tight">
            Registrar Devolución de Equipo
          </h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Documenta el estado físico en el que retorna el equipo. Al confirmar serás redirigido a la bandeja de préstamos.
          </p>
        </div>

        <Link to="/prestamos">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" />
            Volver a Préstamos
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-purple-200/80 bg-white p-12 text-center text-sm text-muted-foreground">
          Cargando datos del préstamo activo...
        </div>
      ) : !prestamo ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
          No se encontró el préstamo solicitado o ya no está disponible.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
          <Card className="overflow-hidden rounded-3xl border-purple-200/80">
            <div className="h-1.5 bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600" />
            <CardHeader>
              <CardTitle>Acta de Recepción del Equipo</CardTitle>
              <CardDescription>
                Registra la fecha real de entrega y las observaciones de revisión técnica.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={procesarDevolucionEnPagina} className="space-y-5">
                <FormField
                  label="Fecha y hora real de devolución"
                  htmlFor="dev-fecha"
                  error={errors.fechaDevolucion}
                  required
                >
                  <Input
                    id="dev-fecha"
                    type="datetime-local"
                    value={fechaDevolucion}
                    onChange={(e) => {
                      setFechaDevolucion(e.target.value)
                      setErrors((prev) => ({ ...prev, fechaDevolucion: '' }))
                    }}
                  />
                </FormField>

                <FormField
                  label="Observaciones obligatorias de recepción"
                  htmlFor="dev-obs"
                  error={errors.observacionDevolucion}
                  required
                >
                  <Textarea
                    id="dev-obs"
                    rows={4}
                    value={observacionDevolucion}
                    onChange={(e) => {
                      setObservacionDevolucion(e.target.value)
                      setErrors((prev) => ({ ...prev, observacionDevolucion: '' }))
                    }}
                    placeholder="Ej. Equipo devuelto en óptimas condiciones operativas, incluye cargador original y maletín..."
                  />
                </FormField>

                <label className="flex items-start gap-3 rounded-2xl border border-purple-200 bg-purple-50/50 p-4 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enviarAMantenimiento}
                    onChange={(e) => setEnviarAMantenimiento(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
                  />
                  <div>
                    <p className="font-bold text-foreground">
                      Enviar activo a Mantenimiento tras la devolución
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Marca esta casilla si el equipo requiere revisión técnica antes de volver a estar Disponible.
                    </p>
                  </div>
                </label>

                <div className="flex flex-col-reverse justify-end gap-3 border-t border-border pt-4 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/prestamos')}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    <CornerDownLeft className="h-4 w-4" />
                    {isSubmitting ? 'Registrando devolución...' : 'Confirmar recepción del equipo'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="rounded-3xl bg-gradient-to-br from-[#190a36] via-[#2c1259] to-[#170930] p-6 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="rounded-xl bg-white/15 px-3 py-1 font-mono text-xs font-extrabold text-fuchsia-200">
                  {prestamo.equipoCodigoPatrimonial}
                </span>
                <PrestamoStatusBadge estado={prestamo.estado} />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-purple-200 ring-1 ring-white/20">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-black text-white">{prestamo.equipoNombre}</p>
                  <p className="text-xs text-purple-200/80">
                    {CATEGORIA_LABELS[prestamo.equipoCategoria] ?? prestamo.equipoCategoria}
                  </p>
                </div>
              </div>

              <div className="space-y-2 rounded-2xl bg-white/8 p-4 text-xs text-purple-100 ring-1 ring-white/10">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-fuchsia-300" />
                  <span>
                    Colaborador: <strong className="text-white">{prestamo.usuarioNombre}</strong> ({prestamo.usuarioArea})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-3.5 w-3.5 text-fuchsia-300" />
                  <span>
                    Inicio:{' '}
                    <strong className="text-white">
                      {new Date(prestamo.fechaPrestamo).toLocaleString('es-PE', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            <Card className="rounded-3xl border-purple-200/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Reglas de Devolución</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    La fecha de devolución debe ser posterior a la fecha de préstamo.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    Toda devolución exige observaciones detalladas.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
