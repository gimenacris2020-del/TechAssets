import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  Check,
  ClipboardList,
  CornerDownLeft,
  MessageSquareText,
  Plus,
  Search,
  UserCheck,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { QuickTooltip } from '@/components/ui/tooltip'
import { RechazarPrestamoModal } from '@/components/prestamos/RechazarPrestamoModal'
import { useAuth } from '@/components/shared/AuthProvider'
import { ConfirmPopover } from '@/components/shared/ConfirmPopover'
import { EmptyState } from '@/components/shared/EmptyState'
import { PrestamoStatusBadge } from '@/components/shared/StatusBadge'
import { useToast } from '@/components/shared/ToastProvider'
import { prestamoService } from '@/services/prestamoService'
import { CATEGORIA_LABELS, ESTADOS_PRESTAMO, type Prestamo } from '@/services/types'
import { cn } from '@/services/utils'

function formatearFechaHora(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString('es-PE', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export function PrestamosPage() {
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const { showSuccess, showError } = useToast()
  const canApprove = hasRole('Administrador', 'ResponsableTecnologia')

  const [prestamos, setPrestamos] = useState<Prestamo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [estadoFilter, setEstadoFilter] = useState<string>('')
  const [areaFilter, setAreaFilter] = useState('')

  const [selectedPrestamo, setSelectedPrestamo] = useState<Prestamo | null>(null)
  const [rechazarOpen, setRechazarOpen] = useState(false)

  const cargarListadoPrestamos = useCallback(async () => {
    setIsLoading(true)
    try {
      const lista = await prestamoService.listarSolicitudes({
        search,
        estado: estadoFilter,
        area: areaFilter,
      })
      setPrestamos(lista)
    } catch (err) {
      showError('Error al cargar préstamos', err instanceof Error ? err.message : undefined)
    } finally {
      setIsLoading(false)
    }
  }, [search, estadoFilter, areaFilter, showError])

  useEffect(() => {
    void cargarListadoPrestamos()
  }, [cargarListadoPrestamos])

  const autorizarPrestamoSeleccionado = async (prestamo: Prestamo) => {
    try {
      await prestamoService.autorizarSolicitud(prestamo.id)
      showSuccess(
        'Préstamo aprobado',
        `Se asignó ${prestamo.equipoCodigoPatrimonial} a ${prestamo.usuarioNombre}.`,
      )
      await cargarListadoPrestamos()
    } catch (err) {
      showError('No se pudo aprobar el préstamo', err instanceof Error ? err.message : undefined)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-purple-200/80 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-0.5 text-xs font-extrabold text-purple-800">
            <ClipboardList className="h-3.5 w-3.5" />
            Centro de Asignaciones
          </span>
          <h2 className="mt-1.5 text-2xl font-black tracking-tight">Bandeja de Préstamos</h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Registra solicitudes en página dedicada con selector modal, aprueba entregas o registra devoluciones.
          </p>
        </div>

        <Button onClick={() => navigate('/prestamos/nuevo')}>
          <Plus className="h-4 w-4" />
          Registrar nuevo préstamo
        </Button>
      </div>

      <div className="rounded-3xl border border-purple-200/80 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setEstadoFilter('')}
            className={cn(
              'rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer',
              estadoFilter === ''
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                : 'bg-purple-50 text-purple-900 hover:bg-purple-100',
            )}
          >
            Todos ({prestamos.length})
          </button>
          {ESTADOS_PRESTAMO.map((est) => (
            <button
              key={est}
              type="button"
              onClick={() => setEstadoFilter(est)}
              className={cn(
                'rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer',
                estadoFilter === est
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                  : 'bg-purple-50 text-purple-900 hover:bg-purple-100',
              )}
            >
              {est}
            </button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código patrimonial, equipo o nombre del colaborador..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Input
            placeholder="Filtrar por área funcional (ej. Ingeniería, Analítica)..."
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-purple-200/80 bg-white p-12 text-center text-sm text-muted-foreground">
          Cargando solicitudes y préstamos...
        </div>
      ) : prestamos.length === 0 ? (
        <div className="rounded-3xl border border-purple-200/80 bg-white p-6">
          <EmptyState
            title="No se encontraron préstamos"
            description="No hay registros que coincidan con los filtros seleccionados."
          />
        </div>
      ) : (
        <div className="space-y-3.5">
          {prestamos.map((pr) => (
            <div
              key={pr.id}
              className="group relative overflow-hidden rounded-3xl border border-purple-200/90 bg-white p-5 shadow-sm transition-all hover:border-purple-300 hover:shadow-md"
            >
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div className="space-y-2 lg:w-1/3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-2.5 py-0.5 font-mono text-xs font-extrabold text-white">
                      {pr.equipoCodigoPatrimonial}
                    </span>
                    <PrestamoStatusBadge estado={pr.estado} />
                  </div>
                  <p className="text-base font-extrabold text-foreground">{pr.equipoNombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {CATEGORIA_LABELS[pr.equipoCategoria] ?? pr.equipoCategoria}
                  </p>
                </div>

                <div className="grid flex-1 gap-3 rounded-2xl bg-purple-50/60 p-3.5 text-xs sm:grid-cols-3">
                  <div>
                    <p className="font-bold uppercase text-[10px] tracking-wider text-purple-700">
                      Solicitante
                    </p>
                    <p className="mt-0.5 font-bold text-foreground">{pr.usuarioNombre}</p>
                    <p className="text-muted-foreground">{pr.usuarioArea}</p>
                  </div>

                  <div>
                    <p className="font-bold uppercase text-[10px] tracking-wider text-purple-700">
                      Vigencia
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-foreground">
                      <Calendar className="h-3 w-3 text-primary" />
                      Inicio: {formatearFechaHora(pr.fechaPrestamo)}
                    </p>
                    <p className="text-muted-foreground">
                      Est: {formatearFechaHora(pr.fechaDevolucionEstimada)}
                    </p>
                    {pr.fechaDevolucion && (
                      <p className="font-bold text-emerald-700">
                        Devuelto: {formatearFechaHora(pr.fechaDevolucion)}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="font-bold uppercase text-[10px] tracking-wider text-purple-700">
                      Responsable TI
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 font-semibold text-foreground">
                      <UserCheck className="h-3.5 w-3.5 text-primary" />
                      {pr.responsableNombre ?? 'Por asignar'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  {(pr.observacion || pr.observacionDevolucion) && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button size="sm" variant="outline" className="h-9 px-3 text-xs">
                          <MessageSquareText className="h-3.5 w-3.5 text-primary" />
                          Notas
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-80 space-y-2.5">
                        <p className="border-b border-border pb-2 text-xs font-bold text-foreground">
                          Observaciones — {pr.equipoCodigoPatrimonial}
                        </p>
                        {pr.observacion && (
                          <div className="space-y-0.5">
                            <p className="text-[11px] font-semibold uppercase text-muted-foreground">
                              Solicitud
                            </p>
                            <p className="text-xs text-foreground">{pr.observacion}</p>
                          </div>
                        )}
                        {pr.observacionDevolucion && (
                          <div className="space-y-0.5 rounded-xl bg-muted/60 p-2.5">
                            <p className="text-[11px] font-semibold uppercase text-muted-foreground">
                              Recepción / Resolución
                            </p>
                            <p className="text-xs text-foreground">{pr.observacionDevolucion}</p>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                  )}

                  {canApprove && pr.estado === 'Pendiente' && (
                    <>
                      <ConfirmPopover
                        title="¿Aprobar préstamo?"
                        description={`Se asignará ${pr.equipoCodigoPatrimonial} (${pr.equipoNombre}) a ${pr.usuarioNombre}.`}
                        confirmLabel="Aprobar"
                        tooltip="Aprobar solicitud de préstamo"
                        onConfirm={() => autorizarPrestamoSeleccionado(pr)}
                      >
                        <Button size="sm" variant="default">
                          <Check className="h-3.5 w-3.5" />
                          Aprobar
                        </Button>
                      </ConfirmPopover>

                      <QuickTooltip label="Rechazar solicitud">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedPrestamo(pr)
                            setRechazarOpen(true)
                          }}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Rechazar
                        </Button>
                      </QuickTooltip>
                    </>
                  )}

                  {canApprove && pr.estado === 'Activo' && (
                    <QuickTooltip label="Registrar devolución del equipo en página dedicada">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/prestamos/${pr.id}/devolver`)}
                      >
                        <CornerDownLeft className="h-3.5 w-3.5 text-primary" />
                        Registrar Devolución
                      </Button>
                    </QuickTooltip>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <RechazarPrestamoModal
        open={rechazarOpen}
        onOpenChange={setRechazarOpen}
        prestamo={selectedPrestamo}
        onSaved={cargarListadoPrestamos}
      />
    </div>
  )
}
