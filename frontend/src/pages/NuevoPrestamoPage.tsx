import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Cpu,
  Layers,
  MapPin,
  Search,
  Send,
  Sparkles,
  Tag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SeleccionarEquipoModal } from '@/components/prestamos/SeleccionarEquipoModal'
import { useAuth } from '@/components/shared/AuthProvider'
import { FormField } from '@/components/shared/FormField'
import { EquipoStatusBadge } from '@/components/shared/StatusBadge'
import { useToast } from '@/components/shared/ToastProvider'
import { equipoService } from '@/services/equipoService'
import { prestamoService } from '@/services/prestamoService'
import { CATEGORIA_LABELS, type Equipo } from '@/services/types'

function formatearFechaLocalInput(date: Date): string {
  const offsetMs = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

function obtenerInicioDeHoy(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
}

export function NuevoPrestamoPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const equipoPreseleccionadoId = searchParams.get('equipoId') ?? ''

  const { user } = useAuth()
  const { showSuccess, showError } = useToast()

  const [equiposDisponibles, setEquiposDisponibles] = useState<Equipo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [equipoId, setEquipoId] = useState<string>(equipoPreseleccionadoId)
  const [modalEquipoAbierto, setModalEquipoAbierto] = useState(false)
  const [fechaPrestamo, setFechaPrestamo] = useState(() => formatearFechaLocalInput(new Date()))
  const [fechaDevolucionEstimada, setFechaDevolucionEstimada] = useState(() => {
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    return formatearFechaLocalInput(nextWeek)
  })
  const [observacion, setObservacion] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const cargarEquiposDisponibles = useCallback(async () => {
    setIsLoading(true)
    try {
      const lista = await equipoService.listarCatalogo({ estado: 'Disponible' })
      setEquiposDisponibles(lista)
    } catch (err) {
      showError('Error al cargar equipos disponibles', err instanceof Error ? err.message : undefined)
    } finally {
      setIsLoading(false)
    }
  }, [showError])

  useEffect(() => {
    void cargarEquiposDisponibles()
  }, [cargarEquiposDisponibles])

  useEffect(() => {
    if (equipoPreseleccionadoId && equiposDisponibles.some((e) => e.id === equipoPreseleccionadoId)) {
      setEquipoId(equipoPreseleccionadoId)
    }
  }, [equipoPreseleccionadoId, equiposDisponibles])

  const equipoSeleccionado = useMemo(
    () => equiposDisponibles.find((e) => e.id === equipoId) ?? null,
    [equiposDisponibles, equipoId],
  )

  const minTodayDateTime = useMemo(() => formatearFechaLocalInput(obtenerInicioDeHoy()), [])

  const minDevolucionDateTime =
    fechaPrestamo && fechaPrestamo > minTodayDateTime ? fechaPrestamo : minTodayDateTime

  const validarFormularioSolicitud = () => {
    const nextErrors: Record<string, string> = {}
    const startOfToday = obtenerInicioDeHoy()

    if (!equipoId || !equipoSeleccionado) {
      nextErrors.equipoId = 'Debes seleccionar un equipo disponible mediante el selector modal.'
    }

    if (!fechaPrestamo) {
      nextErrors.fechaPrestamo = 'La fecha de préstamo es obligatoria.'
    } else if (new Date(fechaPrestamo) < startOfToday) {
      nextErrors.fechaPrestamo = 'La fecha de préstamo debe ser desde hoy en adelante.'
    }

    if (!fechaDevolucionEstimada) {
      nextErrors.fechaDevolucionEstimada = 'La fecha estimada de devolución es obligatoria.'
    } else if (new Date(fechaDevolucionEstimada) < startOfToday) {
      nextErrors.fechaDevolucionEstimada = 'La fecha de devolución debe ser desde hoy en adelante.'
    } else if (fechaPrestamo && new Date(fechaDevolucionEstimada) <= new Date(fechaPrestamo)) {
      nextErrors.fechaDevolucionEstimada =
        'La fecha de devolución debe ser posterior a la fecha de préstamo.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const registrarSolicitudPrestamo = async (e: FormEvent) => {
    e.preventDefault()
    if (!validarFormularioSolicitud()) return

    setIsSubmitting(true)
    try {
      await prestamoService.enviarSolicitud({
        equipoId,
        fechaPrestamo: new Date(fechaPrestamo).toISOString(),
        fechaDevolucionEstimada: new Date(fechaDevolucionEstimada).toISOString(),
        observacion: observacion.trim() || undefined,
      })

      showSuccess(
        'Solicitud registrada con éxito',
        'El préstamo quedó en estado Pendiente y fuiste redirigido al listado general.',
      )
      navigate('/prestamos', { replace: true })
    } catch (err) {
      showError('No se pudo registrar la solicitud', err instanceof Error ? err.message : undefined)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800">
            <Sparkles className="h-3.5 w-3.5" />
            Nueva Solicitud de Activo Tecnológico
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Registrar Solicitud de Préstamo</h2>
          <p className="text-sm text-muted-foreground">
            Selecciona el equipo tecnológico desde el catálogo modal y define el periodo de asignación.
          </p>
        </div>

        <Link to="/prestamos">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" />
            Volver a Préstamos
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
        <Card className="overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600" />
          <CardHeader>
            <CardTitle>Datos del Préstamo</CardTitle>
            <CardDescription>
              Al confirmar el registro serás redireccionado automáticamente al historial de préstamos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={registrarSolicitudPrestamo} className="space-y-6">
              <FormField
                label="Equipo tecnológico a solicitar"
                htmlFor="btn-select-equipo"
                error={errors.equipoId}
                required
              >
                {equipoSeleccionado ? (
                  <div className="flex flex-col justify-between gap-4 rounded-2xl border border-purple-300 bg-gradient-to-r from-purple-50/90 via-violet-50/60 to-indigo-50/50 p-4 sm:flex-row sm:items-center">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-2.5 py-0.5 font-mono text-xs font-bold text-white">
                          {equipoSeleccionado.codigoPatrimonial}
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {equipoSeleccionado.nombre}
                        </span>
                        <EquipoStatusBadge estado={equipoSeleccionado.estado} />
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Tag className="h-3.5 w-3.5 text-primary" />
                          {CATEGORIA_LABELS[equipoSeleccionado.categoria] ??
                            equipoSeleccionado.categoria}{' '}
                          • {equipoSeleccionado.marca}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          {equipoSeleccionado.ubicacion}
                        </span>
                      </div>
                    </div>

                    <Button
                      id="btn-select-equipo"
                      type="button"
                      variant="outline"
                      onClick={() => setModalEquipoAbierto(true)}
                      className="shrink-0 border-purple-300 bg-white hover:bg-purple-50"
                    >
                      <Search className="h-4 w-4 text-primary" />
                      Cambiar equipo
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border-2 border-dashed border-purple-300/80 bg-purple-50/40 p-6 text-center sm:flex-row sm:text-left">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/20">
                        <Cpu className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          Ningún equipo seleccionado
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isLoading
                            ? 'Cargando catálogo disponible...'
                            : `${equiposDisponibles.length} equipo(s) disponibles para préstamo inmediato.`}
                        </p>
                      </div>
                    </div>

                    <Button
                      id="btn-select-equipo"
                      type="button"
                      onClick={() => setModalEquipoAbierto(true)}
                      disabled={isLoading || equiposDisponibles.length === 0}
                    >
                      <Search className="h-4 w-4" />
                      Seleccionar equipo en modal
                    </Button>
                  </div>
                )}
              </FormField>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Fecha y hora de inicio"
                  htmlFor="pr-inicio"
                  error={errors.fechaPrestamo}
                  required
                >
                  <Input
                    id="pr-inicio"
                    type="datetime-local"
                    min={minTodayDateTime}
                    value={fechaPrestamo}
                    onChange={(e) => {
                      setFechaPrestamo(e.target.value)
                      setErrors((prev) => ({ ...prev, fechaPrestamo: '' }))
                    }}
                  />
                </FormField>

                <FormField
                  label="Devolución estimada"
                  htmlFor="pr-fin"
                  error={errors.fechaDevolucionEstimada}
                  required
                >
                  <Input
                    id="pr-fin"
                    type="datetime-local"
                    min={minDevolucionDateTime}
                    value={fechaDevolucionEstimada}
                    onChange={(e) => {
                      setFechaDevolucionEstimada(e.target.value)
                      setErrors((prev) => ({ ...prev, fechaDevolucionEstimada: '' }))
                    }}
                  />
                </FormField>
              </div>

              <FormField label="Justificación / Observación de la solicitud" htmlFor="pr-obs">
                <Textarea
                  id="pr-obs"
                  rows={4}
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  placeholder="Describe brevemente el proyecto, actividad o motivo por el cual solicitas el equipo..."
                />
              </FormField>

              <div className="flex flex-col-reverse justify-end gap-3 border-t border-border pt-4 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/prestamos')}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting || equiposDisponibles.length === 0}>
                  <Send className="h-4 w-4" />
                  {isSubmitting ? 'Registrando solicitud...' : 'Confirmar y registrar préstamo'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-purple-200/80 bg-gradient-to-br from-[#1b0f36] via-[#27154d] to-[#170c2e] text-white">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-purple-200 ring-1 ring-white/20">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-purple-200/80">
                    Solicitante Autenticado
                  </p>
                  <p className="text-base font-bold text-white">
                    {user?.nombres} {user?.apellidos}
                  </p>
                </div>
              </div>

              <div className="space-y-2 rounded-2xl bg-white/8 p-4 text-xs text-purple-100/90 ring-1 ring-white/10">
                <div className="flex justify-between">
                  <span className="text-purple-200/70">Área funcional:</span>
                  <span className="font-semibold text-white">{user?.area}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200/70">Correo:</span>
                  <span className="font-mono text-white">{user?.correo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200/70">Estado inicial:</span>
                  <span className="font-semibold text-amber-300">Pendiente de aprobación</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarClock className="h-4 w-4 text-primary" />
                Reglas de Negocio Aplicadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  Solo puedes elegir equipos cuyo estado sea <strong>Disponible</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  La fecha estimada de devolución debe ser posterior a la fecha de inicio del préstamo.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  Un Responsable de Tecnología revisará y aprobará la entrega del activo.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <SeleccionarEquipoModal
        open={modalEquipoAbierto}
        onOpenChange={setModalEquipoAbierto}
        equiposDisponibles={equiposDisponibles}
        selectedEquipoId={equipoId}
        onSelectEquipo={(eq) => {
          setEquipoId(eq.id)
          setErrors((prev) => ({ ...prev, equipoId: '' }))
        }}
      />
    </div>
  )
}
