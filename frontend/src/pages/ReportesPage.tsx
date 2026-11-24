import { useCallback, useEffect, useState } from 'react'
import { Activity, Award, BarChart3, Building2, Eye, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { EmptyState } from '@/components/shared/EmptyState'
import { useToast } from '@/components/shared/ToastProvider'
import { reporteService } from '@/services/reporteService'
import {
  CATEGORIA_LABELS,
  type EquipoMasUtilizado,
  type MovimientoEquipo,
  type PrestamosPorArea,
} from '@/services/types'

const TIPOS_MOVIMIENTO: { value: string; label: string }[] = [
  { value: 'Registro', label: 'Registro de equipo' },
  { value: 'PrestamoAprobado', label: 'Préstamo aprobado' },
  { value: 'Devolucion', label: 'Devolución' },
  { value: 'CambioEstado', label: 'Cambio de estado' },
  { value: 'Actualizacion', label: 'Actualización' },
]

export function ReportesPage() {
  const { showError } = useToast()

  const [movSearch, setMovSearch] = useState('')
  const [tipoFilter, setTipoFilter] = useState<string>('')
  const [masUtilizados, setMasUtilizados] = useState<EquipoMasUtilizado[]>([])
  const [porArea, setPorArea] = useState<PrestamosPorArea[]>([])
  const [movimientos, setMovimientos] = useState<MovimientoEquipo[]>([])
  const [loadingResumen, setLoadingResumen] = useState(true)
  const [loadingMovs, setLoadingMovs] = useState(true)

  const cargarEstadisticas = useCallback(async () => {
    setLoadingResumen(true)
    try {
      const [ranking, areas] = await Promise.all([
        reporteService.consultarRankingEquipos(10),
        reporteService.consultarMetricasAreas(),
      ])
      setMasUtilizados(ranking)
      setPorArea(areas)
    } catch (err) {
      showError('Error al cargar reportes', err instanceof Error ? err.message : undefined)
    } finally {
      setLoadingResumen(false)
    }
  }, [showError])

  const cargarBitacoraMovimientos = useCallback(async () => {
    setLoadingMovs(true)
    try {
      const bitacora = await reporteService.consultarBitacoraMovimientos({
        search: movSearch,
        tipoMovimiento: tipoFilter,
      })
      setMovimientos(bitacora)
    } catch (err) {
      showError('Error al cargar movimientos', err instanceof Error ? err.message : undefined)
    } finally {
      setLoadingMovs(false)
    }
  }, [movSearch, tipoFilter, showError])

  useEffect(() => {
    void cargarEstadisticas()
  }, [cargarEstadisticas])

  useEffect(() => {
    void cargarBitacoraMovimientos()
  }, [cargarBitacoraMovimientos])

  const maxPrestamosEquipo = Math.max(1, ...masUtilizados.map((item) => item.totalPrestamos))
  const maxPrestamosArea = Math.max(1, ...porArea.map((item) => item.totalPrestamos))

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-purple-200/80 bg-white p-6 shadow-sm">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-0.5 text-xs font-extrabold text-purple-800">
          <BarChart3 className="h-3.5 w-3.5" />
          Inteligencia Operativa
        </span>
        <h2 className="mt-1.5 text-2xl font-black tracking-tight">
          Analítica y Bitácora de Auditoría
        </h2>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Ranking de utilización de equipos, demanda por área funcional y línea de tiempo de movimientos.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-purple-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-border pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-foreground">Top Equipos Más Utilizados</h3>
              <p className="text-xs text-muted-foreground">
                Activos con mayor rotación de préstamos
              </p>
            </div>
          </div>

          <div className="mt-5">
            {loadingResumen ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Cargando ranking...</div>
            ) : masUtilizados.length === 0 ? (
              <EmptyState
                title="Sin préstamos registrados"
                description="Cuando existan préstamos aprobados o devueltos aparecerán aquí."
              />
            ) : (
              <div className="space-y-3.5">
                {masUtilizados.map((item, idx) => {
                  const pct = Math.round((item.totalPrestamos / maxPrestamosEquipo) * 100)
                  return (
                    <div
                      key={item.equipoId}
                      className="rounded-2xl border border-purple-100 bg-purple-50/40 p-3.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-purple-600 font-mono text-xs font-bold text-white">
                            {idx + 1}
                          </span>
                          <span className="rounded-md bg-white px-2 py-0.5 font-mono text-xs font-bold text-purple-800 ring-1 ring-purple-200">
                            {item.codigoPatrimonial}
                          </span>
                          <span className="truncate text-sm font-bold text-foreground">
                            {item.nombre}
                          </span>
                        </div>
                        <span className="shrink-0 text-xs font-extrabold text-purple-900">
                          {item.totalPrestamos} préstamo(s)
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>
                          {CATEGORIA_LABELS[item.categoria] ?? item.categoria} • {item.marca}
                        </span>
                      </div>

                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-purple-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-purple-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-border pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-600 to-purple-600 text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-foreground">Demanda por Área Funcional</h3>
              <p className="text-xs text-muted-foreground">
                Préstamos activos y acumulados por departamento
              </p>
            </div>
          </div>

          <div className="mt-5">
            {loadingResumen ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Cargando áreas...</div>
            ) : porArea.length === 0 ? (
              <EmptyState
                title="Sin datos por área"
                description="Aún no se registran préstamos asociados a áreas funcionales."
              />
            ) : (
              <div className="space-y-3.5">
                {porArea.map((item) => {
                  const pct = Math.round((item.totalPrestamos / maxPrestamosArea) * 100)
                  return (
                    <div
                      key={item.area}
                      className="rounded-2xl border border-purple-100 bg-purple-50/40 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-extrabold text-foreground">{item.area}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="rounded-full bg-purple-100 px-2.5 py-0.5 font-bold text-purple-800">
                            {item.prestamosActivos} activo(s)
                          </span>
                          <span className="font-extrabold text-foreground">
                            {item.totalPrestamos} total
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-purple-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-600 to-indigo-600"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-purple-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-foreground">Bitácora de Movimientos</h3>
              <p className="text-xs text-muted-foreground">
                Auditoría cronológica de altas, préstamos, devoluciones y cambios de estado
              </p>
            </div>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar código, equipo o detalle..."
                value={movSearch}
                onChange={(e) => setMovSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={tipoFilter} onChange={(e) => setTipoFilter(e.target.value)}>
              <option value="">Todos los tipos de evento</option>
              {TIPOS_MOVIMIENTO.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="mt-5">
          {loadingMovs ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Cargando historial de movimientos...
            </div>
          ) : movimientos.length === 0 ? (
            <EmptyState
              title="Sin movimientos registrados"
              description="No existen movimientos para los filtros aplicados."
            />
          ) : (
            <div className="space-y-3">
              {movimientos.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-col justify-between gap-3 rounded-2xl border border-purple-100 bg-purple-50/35 p-4 transition-colors hover:border-purple-300 hover:bg-purple-50/70 sm:flex-row sm:items-center"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-2.5 py-0.5 font-mono text-xs font-bold text-white">
                        {m.equipoCodigoPatrimonial}
                      </span>
                      <span className="text-sm font-extrabold text-foreground">
                        {m.equipoNombre}
                      </span>
                      <Badge variant="default">{m.tipoMovimiento}</Badge>
                      <span className="rounded-full bg-white px-2.5 py-0.5 font-mono text-[11px] font-semibold text-purple-800 ring-1 ring-purple-200">
                        {m.estadoAnterior ? `${m.estadoAnterior} → ${m.estadoNuevo}` : m.estadoNuevo}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">{m.detalle}</p>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="text-right text-xs">
                      <p className="font-bold text-foreground">
                        {m.usuarioResponsableNombre ?? 'Sistema'}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(m.fechaMovimiento).toLocaleString('es-PE', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>

                    <Popover>
                      <Tooltip>
                        <PopoverTrigger asChild>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 shrink-0 bg-white"
                              aria-label="Ver ficha del movimiento"
                            >
                              <Eye className="h-4 w-4 text-primary" />
                            </Button>
                          </TooltipTrigger>
                        </PopoverTrigger>
                        <TooltipContent>Ver detalle completo</TooltipContent>
                      </Tooltip>
                      <PopoverContent align="end" className="w-84 space-y-2.5">
                        <div className="flex items-center justify-between border-b border-border pb-2">
                          <span className="font-mono text-xs font-bold text-primary">
                            {m.equipoCodigoPatrimonial}
                          </span>
                          <Badge variant="outline">{m.tipoMovimiento}</Badge>
                        </div>
                        <p className="text-xs font-semibold text-foreground">{m.equipoNombre}</p>
                        <p className="text-xs leading-relaxed text-muted-foreground">{m.detalle}</p>
                        <div className="rounded-lg bg-muted/60 px-2.5 py-1.5 text-[11px] text-muted-foreground">
                          Responsable:{' '}
                          <span className="font-semibold text-foreground">
                            {m.usuarioResponsableNombre ?? 'Sistema'}
                          </span>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
