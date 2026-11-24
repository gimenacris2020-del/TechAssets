import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Cpu,
  Edit,
  HandHelping,
  Info,
  LayoutGrid,
  List,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { QuickTooltip, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { CambiarEstadoModal } from '@/components/equipos/CambiarEstadoModal'
import { EquipoFormModal } from '@/components/equipos/EquipoFormModal'
import { useAuth } from '@/components/shared/AuthProvider'
import { ConfirmPopover } from '@/components/shared/ConfirmPopover'
import { EmptyState } from '@/components/shared/EmptyState'
import { EquipoStatusBadge } from '@/components/shared/StatusBadge'
import { useToast } from '@/components/shared/ToastProvider'
import { equipoService } from '@/services/equipoService'
import { CATEGORIA_LABELS, CATEGORIAS_EQUIPO, ESTADOS_EQUIPO, type Equipo } from '@/services/types'
import { cn } from '@/services/utils'

export function EquiposPage() {
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const { showSuccess, showError } = useToast()
  const canManage = hasRole('Administrador', 'ResponsableTecnologia')
  const isAdmin = hasRole('Administrador')

  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoriaFilter, setCategoriaFilter] = useState<string>('')
  const [estadoFilter, setEstadoFilter] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  const [formOpen, setFormOpen] = useState(false)
  const [selectedEquipo, setSelectedEquipo] = useState<Equipo | null>(null)
  const [estadoModalOpen, setEstadoModalOpen] = useState(false)

  const cargarInventarioEquipos = useCallback(async () => {
    setIsLoading(true)
    try {
      const resultado = await equipoService.listarCatalogo({
        search,
        categoria: categoriaFilter,
        estado: estadoFilter,
      })
      setEquipos(resultado)
    } catch (err) {
      showError('Error al cargar inventario', err instanceof Error ? err.message : undefined)
    } finally {
      setIsLoading(false)
    }
  }, [search, categoriaFilter, estadoFilter, showError])

  useEffect(() => {
    void cargarInventarioEquipos()
  }, [cargarInventarioEquipos])

  const eliminarEquipoSeleccionado = async (equipo: Equipo) => {
    try {
      await equipoService.removerActivo(equipo.id)
      showSuccess('Equipo eliminado', `Se eliminó ${equipo.codigoPatrimonial} del inventario.`)
      await cargarInventarioEquipos()
    } catch (err) {
      showError('No se pudo eliminar', err instanceof Error ? err.message : undefined)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-purple-200/80 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-0.5 text-xs font-extrabold text-purple-800">
            <Cpu className="h-3.5 w-3.5" />
            Parque Tecnológico
          </span>
          <h2 className="mt-1.5 text-2xl font-black tracking-tight">Catálogo de Equipos</h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Explora los activos por estado o categoría, registra nuevos equipos en su página dedicada o solicita un préstamo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" onClick={() => navigate('/prestamos/nuevo')}>
            <HandHelping className="h-4 w-4 text-primary" />
            Solicitar préstamo
          </Button>
          {canManage && (
            <Button onClick={() => navigate('/equipos/nuevo')}>
              <Plus className="h-4 w-4" />
              Registrar equipo
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-purple-200/80 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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
              Todos ({equipos.length})
            </button>
            {ESTADOS_EQUIPO.map((est) => (
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

          <div className="inline-flex items-center gap-1 self-start rounded-2xl border border-purple-200 bg-purple-50/60 p-1">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer',
                viewMode === 'grid'
                  ? 'bg-white text-purple-900 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Tarjetas
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer',
                viewMode === 'table'
                  ? 'bg-white text-purple-900 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <List className="h-3.5 w-3.5" />
              Tabla
            </button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[1.5fr_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código patrimonial, modelo, marca o ubicación..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={categoriaFilter} onChange={(e) => setCategoriaFilter(e.target.value)}>
            <option value="">Todas las categorías tecnológicas</option>
            {CATEGORIAS_EQUIPO.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORIA_LABELS[cat]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-purple-200/80 bg-white p-12 text-center text-sm text-muted-foreground">
          Cargando inventario tecnológico...
        </div>
      ) : equipos.length === 0 ? (
        <div className="rounded-3xl border border-purple-200/80 bg-white p-6">
          <EmptyState
            title="No se encontraron equipos"
            description="Ajusta los filtros de búsqueda o registra un nuevo equipo tecnológico."
          />
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {equipos.map((eq) => (
            <div
              key={eq.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-purple-200/90 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-950/5"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-1 font-mono text-xs font-extrabold text-white shadow-xs">
                    {eq.codigoPatrimonial}
                  </span>
                  <EquipoStatusBadge estado={eq.estado} />
                </div>

                <h3 className="mt-4 text-base font-extrabold text-foreground group-hover:text-primary">
                  {eq.nombre}
                </h3>

                <div className="mt-3 space-y-1.5 rounded-2xl bg-purple-50/60 p-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="truncate font-medium text-foreground">
                      {CATEGORIA_LABELS[eq.categoria] ?? eq.categoria}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-purple-800">{eq.marca}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="truncate">{eq.ubicacion}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3.5">
                {eq.estado === 'Disponible' ? (
                  <Button
                    size="sm"
                    onClick={() => navigate(`/prestamos/nuevo?equipoId=${eq.id}`)}
                    className="h-8 text-xs"
                  >
                    <HandHelping className="h-3.5 w-3.5" />
                    Solicitar préstamo
                  </Button>
                ) : (
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    Alta: {new Date(eq.fechaRegistro).toLocaleDateString('es-PE')}
                  </span>
                )}

                <div className="flex items-center gap-1">
                  {canManage && (
                    <>
                      <QuickTooltip label="Editar equipo">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => {
                            setSelectedEquipo(eq)
                            setFormOpen(true)
                          }}
                          aria-label="Editar equipo"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </QuickTooltip>
                      <QuickTooltip label="Cambiar estado operativo">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => {
                            setSelectedEquipo(eq)
                            setEstadoModalOpen(true)
                          }}
                          aria-label="Cambiar estado"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </QuickTooltip>
                    </>
                  )}
                  {isAdmin && (
                    <ConfirmPopover
                      title={`¿Eliminar ${eq.codigoPatrimonial}?`}
                      description={`Se eliminará "${eq.nombre}" de forma permanente si no cuenta con historial de préstamos.`}
                      confirmLabel="Sí, eliminar"
                      confirmVariant="destructive"
                      tooltip="Eliminar equipo"
                      onConfirm={() => eliminarEquipoSeleccionado(eq)}
                    >
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        aria-label="Eliminar equipo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </ConfirmPopover>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-purple-200/80 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipos.map((eq) => (
                <TableRow key={eq.id}>
                  <TableCell className="font-mono text-xs font-bold text-primary">
                    {eq.codigoPatrimonial}
                  </TableCell>
                  <TableCell className="font-semibold">{eq.nombre}</TableCell>
                  <TableCell>{CATEGORIA_LABELS[eq.categoria] ?? eq.categoria}</TableCell>
                  <TableCell>{eq.marca}</TableCell>
                  <TableCell>{eq.ubicacion}</TableCell>
                  <TableCell>
                    <EquipoStatusBadge estado={eq.estado} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Popover>
                        <Tooltip>
                          <PopoverTrigger asChild>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                aria-label="Ver ficha del equipo"
                              >
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </TooltipTrigger>
                          </PopoverTrigger>
                          <TooltipContent>Ver ficha técnica</TooltipContent>
                        </Tooltip>
                        <PopoverContent align="end" className="w-80 space-y-3 text-left">
                          <div className="flex items-center justify-between border-b border-border pb-2">
                            <span className="font-mono text-xs font-bold text-primary">
                              {eq.codigoPatrimonial}
                            </span>
                            <EquipoStatusBadge estado={eq.estado} />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-foreground">{eq.nombre}</p>
                            <p className="text-xs text-muted-foreground">
                              {CATEGORIA_LABELS[eq.categoria] ?? eq.categoria} • {eq.marca}
                            </p>
                          </div>
                          <div className="space-y-1 rounded-xl bg-muted/60 p-2.5 text-xs text-muted-foreground">
                            <p>
                              <span className="font-semibold text-foreground">Ubicación:</span>{' '}
                              {eq.ubicacion}
                            </p>
                            <p>
                              <span className="font-semibold text-foreground">Registrado:</span>{' '}
                              {new Date(eq.fechaRegistro).toLocaleDateString('es-PE')}
                            </p>
                          </div>
                        </PopoverContent>
                      </Popover>
                      {eq.estado === 'Disponible' && (
                        <QuickTooltip label="Ir a la página de solicitud con este equipo">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/prestamos/nuevo?equipoId=${eq.id}`)}
                          >
                            <HandHelping className="h-3.5 w-3.5" />
                            Solicitar
                          </Button>
                        </QuickTooltip>
                      )}
                      {canManage && (
                        <>
                          <QuickTooltip label="Editar equipo">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setSelectedEquipo(eq)
                                setFormOpen(true)
                              }}
                              aria-label="Editar equipo"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </QuickTooltip>
                          <QuickTooltip label="Cambiar estado operativo">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setSelectedEquipo(eq)
                                setEstadoModalOpen(true)
                              }}
                              aria-label="Cambiar estado"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </QuickTooltip>
                        </>
                      )}
                      {isAdmin && (
                        <ConfirmPopover
                          title={`¿Eliminar ${eq.codigoPatrimonial}?`}
                          description={`Se eliminará "${eq.nombre}" de forma permanente si no cuenta con historial de préstamos.`}
                          confirmLabel="Sí, eliminar"
                          confirmVariant="destructive"
                          tooltip="Eliminar equipo"
                          onConfirm={() => eliminarEquipoSeleccionado(eq)}
                        >
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            aria-label="Eliminar equipo"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </ConfirmPopover>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <EquipoFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        equipo={selectedEquipo}
        onSaved={cargarInventarioEquipos}
      />

      <CambiarEstadoModal
        open={estadoModalOpen}
        onOpenChange={setEstadoModalOpen}
        equipo={selectedEquipo}
        onSaved={cargarInventarioEquipos}
      />
    </div>
  )
}
