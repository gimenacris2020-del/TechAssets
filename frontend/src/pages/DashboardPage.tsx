import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Cpu,
  Laptop,
  Plus,
  Sparkles,
  Wrench,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/shared/AuthProvider'
import { StatCard } from '@/components/shared/StatCard'
import { reporteService } from '@/services/reporteService'
import type { DashboardData, EquiposPorEstado } from '@/services/types'

const INITIAL_DASHBOARD: DashboardData = {
  totalEquipos: 0,
  equiposDisponibles: 0,
  equiposPrestados: 0,
  equiposMantenimiento: 0,
  equiposBaja: 0,
  totalPrestamos: 0,
  prestamosPendientes: 0,
  prestamosActivos: 0,
  areaMayorUso: 'Sin registros',
  areaMayorUsoCantidad: 0,
}

export function DashboardPage() {
  const { user } = useAuth()

  const [dashboard, setDashboard] = useState<DashboardData>(INITIAL_DASHBOARD)
  const [porEstado, setPorEstado] = useState<EquiposPorEstado[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarResumenOperativo = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [indicadores, distribucion] = await Promise.all([
        reporteService.consultarIndicadores(),
        reporteService.consultarDistribucionEstados(),
      ])
      setDashboard(indicadores)
      setPorEstado(distribucion)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los indicadores.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void cargarResumenOperativo()
  }, [cargarResumenOperativo])

  const disponibilidadPct =
    dashboard.totalEquipos > 0
      ? Math.round((dashboard.equiposDisponibles / dashboard.totalEquipos) * 100)
      : 0

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-[1.65fr_1fr]">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#170930] via-[#2c125e] to-[#4c1d95] p-6 text-white shadow-xl shadow-purple-950/15 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="relative z-10 flex flex-col justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-xs font-bold text-fuchsia-200 ring-1 ring-white/20">
                <Sparkles className="h-3.5 w-3.5" />
                Centro de Operaciones TI
              </span>
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                Hola, {user?.nombres} {user?.apellidos}
              </h2>
              <p className="max-w-xl text-xs leading-relaxed text-purple-100/85 sm:text-sm">
                Supervisa el estado en vivo del parque tecnológico de Innovatech Solutions, gestiona
                solicitudes de préstamo y controla la disponibilidad por área funcional.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link to="/prestamos/nuevo">
                <Button className="bg-white text-purple-950 hover:bg-purple-50 shadow-md">
                  <Plus className="h-4 w-4 text-purple-700" />
                  Solicitar equipo ahora
                </Button>
              </Link>
              <Link to="/equipos">
                <Button
                  variant="outline"
                  className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  Explorar catálogo
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-3xl border border-purple-200/90 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-extrabold text-purple-800">
              Índice de Disponibilidad
            </span>
            <span className="font-mono text-xs font-bold text-muted-foreground">
              {dashboard.equiposDisponibles} / {dashboard.totalEquipos} activos
            </span>
          </div>

          <div className="my-4 flex items-baseline gap-3">
            <span className="bg-gradient-to-r from-purple-700 via-violet-600 to-fuchsia-600 bg-clip-text text-5xl font-black text-transparent">
              {isLoading ? '...' : `${disponibilidadPct}%`}
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              listos para asignación inmediata
            </span>
          </div>

          <div className="space-y-2">
            <div className="h-3 w-full overflow-hidden rounded-full bg-purple-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-600 via-violet-500 to-fuchsia-500 transition-all duration-500"
                style={{ width: `${disponibilidadPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
              <span>{dashboard.prestamosPendientes} solicitud(es) por aprobar</span>
              <span>{dashboard.prestamosActivos} en préstamo activo</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Parque Total"
          value={isLoading ? '...' : dashboard.totalEquipos}
          subtitle="Equipos registrados en inventario"
          icon={Cpu}
        />
        <StatCard
          title="Disponibles"
          value={isLoading ? '...' : dashboard.equiposDisponibles}
          subtitle="Habilitados para nuevo préstamo"
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          title="En Préstamo"
          value={isLoading ? '...' : dashboard.equiposPrestados}
          subtitle={`${dashboard.prestamosActivos} asignación(es) en curso`}
          icon={Laptop}
          tone="info"
        />
        <StatCard
          title="Mantenimiento"
          value={isLoading ? '...' : dashboard.equiposMantenimiento}
          subtitle={`Revisión técnica (+${dashboard.equiposBaja} en baja)`}
          icon={Wrench}
          tone="warning"
        />
        <StatCard
          title="Préstamos Totales"
          value={isLoading ? '...' : dashboard.totalPrestamos}
          subtitle={`${dashboard.prestamosPendientes} pendiente(s) de revisión`}
          icon={ClipboardCheck}
        />
        <StatCard
          title="Área Líder"
          value={isLoading ? '...' : dashboard.areaMayorUso}
          subtitle={`${dashboard.areaMayorUsoCantidad} préstamo(s) acumulados`}
          icon={Building2}
          tone="info"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <div className="rounded-3xl border border-purple-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="text-base font-extrabold text-foreground">
                Mosaico de Estados del Inventario
              </h3>
              <p className="text-xs text-muted-foreground">
                Desglose porcentual por condición operativa actual
              </p>
            </div>
            <Link to="/equipos" className="text-xs font-bold text-primary hover:underline">
              Ver equipos →
            </Link>
          </div>

          <div className="mt-5 grid gap-3.5 sm:grid-cols-2">
            {porEstado.map((item) => {
              const pct =
                dashboard.totalEquipos > 0
                  ? Math.round((item.cantidad / dashboard.totalEquipos) * 100)
                  : 0
              const accent =
                item.estado === 'Disponible'
                  ? 'border-emerald-200 bg-emerald-50/50 text-emerald-800'
                  : item.estado === 'Prestado'
                    ? 'border-purple-200 bg-purple-50/60 text-purple-900'
                    : item.estado === 'Mantenimiento'
                      ? 'border-amber-200 bg-amber-50/50 text-amber-900'
                      : 'border-rose-200 bg-rose-50/50 text-rose-900'

              const bar =
                item.estado === 'Disponible'
                  ? 'bg-emerald-500'
                  : item.estado === 'Prestado'
                    ? 'bg-gradient-to-r from-purple-600 to-fuchsia-500'
                    : item.estado === 'Mantenimiento'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'

              return (
                <div key={item.estado} className={`rounded-2xl border p-4 ${accent}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider">
                      {item.estadoNombre}
                    </span>
                    <span className="font-mono text-xs font-bold">{pct}%</span>
                  </div>
                  <p className="mt-2 text-2xl font-black">{item.cantidad}</p>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/80">
                    <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-3xl border border-purple-200/80 bg-white p-6 shadow-sm">
          <div>
            <div className="border-b border-border pb-4">
              <h3 className="text-base font-extrabold text-foreground">
                Monitor de Solicitudes
              </h3>
              <p className="text-xs text-muted-foreground">
                Actividad actual en la bandeja de préstamos
              </p>
            </div>

            <div className="mt-5 space-y-3.5">
              <div className="flex items-center justify-between rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-amber-950">Por Aprobar</p>
                    <p className="text-xs text-amber-800/80">
                      Solicitudes en estado Pendiente
                    </p>
                  </div>
                </div>
                <span className="text-3xl font-black text-amber-900">
                  {dashboard.prestamosPendientes}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-purple-200/80 bg-purple-50/60 p-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white shadow-sm">
                    <Laptop className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-purple-950">En Curso</p>
                    <p className="text-xs text-purple-800/80">
                      Equipos entregados a colaboradores
                    </p>
                  </div>
                </div>
                <span className="text-3xl font-black text-purple-900">
                  {dashboard.prestamosActivos}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 border-t border-border pt-4">
            <Link to="/prestamos">
              <Button variant="outline" className="w-full justify-between">
                <span>Ir a la bandeja de préstamos</span>
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
