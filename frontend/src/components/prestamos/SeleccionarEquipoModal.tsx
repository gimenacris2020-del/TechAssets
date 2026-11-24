import { useMemo, useState } from 'react'
import { Check, Cpu, MapPin, Search, Tag } from 'lucide-react'
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
import { Select } from '@/components/ui/select'
import { EquipoStatusBadge } from '@/components/shared/StatusBadge'
import { cn } from '@/services/utils'
import { CATEGORIA_LABELS, CATEGORIAS_EQUIPO, type Equipo } from '@/services/types'

interface SeleccionarEquipoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  equiposDisponibles: Equipo[]
  selectedEquipoId: string
  onSelectEquipo: (equipo: Equipo) => void
}

export function SeleccionarEquipoModal({
  open,
  onOpenChange,
  equiposDisponibles,
  selectedEquipoId,
  onSelectEquipo,
}: SeleccionarEquipoModalProps) {
  const [busqueda, setBusqueda] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('')

  const equiposFiltrados = useMemo(() => {
    const term = busqueda.trim().toLowerCase()
    return equiposDisponibles.filter((eq) => {
      const matchCategoria = !categoriaFiltro || eq.categoria === categoriaFiltro
      const matchTexto =
        !term ||
        eq.codigoPatrimonial.toLowerCase().includes(term) ||
        eq.nombre.toLowerCase().includes(term) ||
        eq.marca.toLowerCase().includes(term) ||
        eq.ubicacion.toLowerCase().includes(term) ||
        (CATEGORIA_LABELS[eq.categoria] ?? eq.categoria).toLowerCase().includes(term)

      return matchCategoria && matchTexto
    })
  }, [equiposDisponibles, busqueda, categoriaFiltro])

  const elegirEquipo = (equipo: Equipo) => {
    onSelectEquipo(equipo)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Seleccionar Equipo TecnolÃ³gico Disponible</DialogTitle>
          <DialogDescription>
            Explora el catÃ¡logo de equipos disponibles y haz clic sobre el activo que deseas solicitar en prÃ©stamo.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-[1fr_210px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cÃ³digo, modelo, marca o ubicaciÃ³n..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)}>
            <option value="">Todas las categorÃ­as</option>
            {CATEGORIAS_EQUIPO.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORIA_LABELS[cat]}
              </option>
            ))}
          </Select>
        </div>

        <div className="max-h-96 space-y-2.5 overflow-y-auto pr-1">
          {equiposFiltrados.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <Cpu className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm font-semibold text-foreground">
                No se encontraron equipos disponibles
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Intenta cambiar los criterios de bÃºsqueda o categorÃ­a.
              </p>
            </div>
          ) : (
            equiposFiltrados.map((eq) => {
              const isSelected = eq.id === selectedEquipoId
              return (
                <button
                  key={eq.id}
                  type="button"
                  onClick={() => elegirEquipo(eq)}
                  className={cn(
                    'flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition-all cursor-pointer',
                    isSelected
                      ? 'border-purple-600 bg-gradient-to-r from-purple-50 via-violet-50/70 to-indigo-50/50 ring-2 ring-purple-500/25'
                      : 'border-border bg-card hover:border-purple-400/70 hover:bg-accent/40',
                  )}
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-2.5 py-0.5 font-mono text-xs font-bold text-white">
                        {eq.codigoPatrimonial}
                      </span>
                      <span className="truncate text-sm font-bold text-foreground">{eq.nombre}</span>
                      <EquipoStatusBadge estado={eq.estado} />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Tag className="h-3.5 w-3.5 text-primary" />
                        {CATEGORIA_LABELS[eq.categoria] ?? eq.categoria} â€¢ {eq.marca}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        {eq.ubicacion}
                      </span>
                    </div>
                  </div>

                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors',
                      isSelected
                        ? 'border-purple-600 bg-purple-600 text-white'
                        : 'border-border bg-background text-muted-foreground',
                    )}
                  >
                    <Check className="h-4 w-4" />
                  </div>
                </button>
              )
            })
          )}
        </div>

        <DialogFooter className="items-center justify-between sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Mostrando <span className="font-bold text-foreground">{equiposFiltrados.length}</span> de{' '}
            {equiposDisponibles.length} equipos disponibles
          </p>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar ventana
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
