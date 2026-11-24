import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Cpu,
  ExternalLink,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { QuickTooltip, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuth } from '@/components/shared/AuthProvider'
import { RolBadge } from '@/components/shared/StatusBadge'
import { TechAssetLogo } from '@/components/shared/TechAssetLogo'
import { ROL_LABELS } from '@/services/types'
import { cn } from '@/services/utils'

const SIDEBAR_STORAGE_KEY = 'techasset_sidebar_collapsed'

interface NavItem {
  to: string
  label: string
  subtitle: string
  badge: string
  icon: typeof LayoutDashboard
  roles?: string[]
}

const NAV_ITEMS: NavItem[] = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    subtitle: 'Métricas operativas y distribución de activos en vivo',
    badge: 'KPIs',
    icon: LayoutDashboard,
  },
  {
    to: '/equipos',
    label: 'Catálogo de Equipos',
    subtitle: 'Gestión de inventario tecnológico y disponibilidad',
    badge: 'Activos',
    icon: Cpu,
  },
  {
    to: '/prestamos',
    label: 'Bandeja de Préstamos',
    subtitle: 'Centro de solicitudes, aprobaciones y devoluciones',
    badge: 'Flujo',
    icon: ClipboardList,
  },
  {
    to: '/reportes',
    label: 'Analítica y Bitácora',
    subtitle: 'Ranking de uso, demanda por área e historial',
    badge: 'Reportes',
    icon: BarChart3,
    roles: ['Administrador', 'ResponsableTecnologia'],
  },
  {
    to: '/usuarios',
    label: 'Directorio Usuarios',
    subtitle: 'Administración de cuentas corporativas y roles',
    badge: 'Accesos',
    icon: Users,
    roles: ['Administrador'],
  },
]

const ROLE_GUIDES: Record<string, string[]> = {
  Administrador: [
    'Registrar, actualizar y deshabilitar cuentas de usuarios.',
    'Gestionar equipos, estados y eliminar activos sin historial.',
    'Aprobar o rechazar préstamos y registrar devoluciones.',
    'Acceder al dashboard completo, reportes por área y movimientos.',
  ],
  ResponsableTecnologia: [
    'Registrar y actualizar equipos tecnológicos en inventario.',
    'Aprobar o rechazar solicitudes de préstamo pendientes.',
    'Registrar devoluciones con observaciones obligatorias.',
    'Consultar reportes de uso por área e historial de movimientos.',
  ],
  Colaborador: [
    'Consultar el inventario de equipos disponibles en línea.',
    'Solicitar préstamos seleccionando el equipo desde un modal.',
    'Hacer seguimiento a sus solicitudes y su historial personal.',
  ],
}

export function MainLayout() {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(
    () => localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true',
  )

  const alternarBarraLateral = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next))
      return next
    })
  }

  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.roles || hasRole(...item.roles),
  )

  const currentPage =
    visibleNavItems.find((item) => location.pathname.startsWith(item.to)) ?? visibleNavItems[0]

  const initials = user
    ? `${user.nombres.charAt(0)}${user.apellidos.charAt(0)}`.toUpperCase()
    : 'TA'

  const cerrarSesionActual = () => {
    logout()
    navigate('/login')
  }

  const renderSidebarContent = (isMobile = false) => {
    const collapsed = !isMobile && sidebarCollapsed

    return (
      <div className="relative flex h-full flex-col overflow-hidden bg-gradient-to-b from-[#140729] via-[#1e0b3d] to-[#110522] text-white shadow-2xl">
        <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />

        <div
          className={cn(
            'relative z-10 flex h-20 items-center border-b border-white/10',
            collapsed ? 'justify-center px-3' : 'justify-between px-6',
          )}
        >
          <Link to="/" className="transition-opacity hover:opacity-90">
            <TechAssetLogo size="sm" lightText showSubtitle={!collapsed} collapsed={collapsed} />
          </Link>
          {isMobile && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl p-1.5 text-purple-200 hover:bg-white/10 hover:text-white cursor-pointer"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className={cn('relative z-10 pt-5', collapsed ? 'px-2.5' : 'px-4')}>
          {collapsed ? (
            <QuickTooltip label="Registrar nuevo préstamo" side="right">
              <button
                type="button"
                onClick={() => {
                  if (isMobile) setMobileMenuOpen(false)
                  navigate('/prestamos/nuevo')
                }}
                className="flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 text-white shadow-lg shadow-fuchsia-950/40 ring-1 ring-white/25 transition-transform hover:scale-[1.02] cursor-pointer"
                aria-label="Nuevo préstamo"
              >
                <Plus className="h-5 w-5" />
              </button>
            </QuickTooltip>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (isMobile) setMobileMenuOpen(false)
                navigate('/prestamos/nuevo')
              }}
              className="flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-fuchsia-500 via-purple-600 to-indigo-600 px-4 py-3 text-left text-xs font-extrabold text-white shadow-lg shadow-purple-950/50 ring-1 ring-white/20 transition-all hover:brightness-110 cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/20">
                  <Plus className="h-4 w-4" />
                </span>
                <span>Nuevo Préstamo</span>
              </span>
              <Sparkles className="h-4 w-4 text-fuchsia-200" />
            </button>
          )}
        </div>

        <div className={cn('relative z-10 flex-1 overflow-y-auto py-5', collapsed ? 'px-2.5' : 'px-4')}>
          {!collapsed && (
            <p className="mb-2.5 px-3 text-[10px] font-extrabold uppercase tracking-widest text-purple-300/60">
              Navegación Operativa
            </p>
          )}

          <nav className="space-y-1.5">
            {visibleNavItems.map((item) => {
              const Icon = item.icon
              const link = (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => isMobile && setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex w-full items-center rounded-2xl text-sm font-bold transition-all',
                      collapsed ? 'justify-center px-2 py-3' : 'justify-between px-3.5 py-3',
                      isActive
                        ? 'bg-white/14 text-white shadow-md ring-1 ring-purple-300/30 backdrop-blur-md'
                        : 'text-purple-100/70 hover:bg-white/8 hover:text-white',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="flex items-center gap-3 min-w-0">
                        <span
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all',
                            isActive
                              ? 'bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white shadow-sm'
                              : 'bg-white/6 text-purple-200 group-hover:bg-white/12 group-hover:text-white',
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </span>
                      {!collapsed && (
                        <span
                          className={cn(
                            'rounded-lg px-2 py-0.5 text-[10px] font-extrabold',
                            isActive
                              ? 'bg-fuchsia-400/25 text-fuchsia-200'
                              : 'bg-white/5 text-purple-300/70',
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              )

              return collapsed ? (
                <QuickTooltip key={item.to} label={item.label} side="right">
                  <div className="w-full">{link}</div>
                </QuickTooltip>
              ) : (
                link
              )
            })}
          </nav>
        </div>

        {user && (
          <div className={cn('relative z-10 border-t border-white/10 p-3.5', collapsed && 'px-2')}>
            {collapsed ? (
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-indigo-600 text-xs font-black text-white">
                  {initials}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/6 p-3 backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-indigo-600 text-xs font-black text-white">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-extrabold text-white">
                      {user.nombres} {user.apellidos}
                    </p>
                    <p className="truncate text-[11px] text-purple-200/75">{user.area}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#f6f3ff] text-foreground">
      <aside
        className={cn(
          'hidden shrink-0 transition-all duration-200 ease-in-out md:sticky md:top-0 md:flex md:h-screen md:flex-col',
          sidebarCollapsed ? 'w-22' : 'w-74',
        )}
      >
        {renderSidebarContent(false)}
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-purple-950/70 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 w-76 max-w-[85vw] shadow-2xl">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-purple-200/80 bg-white/90 px-4 shadow-xs backdrop-blur-md md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menú lateral"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <QuickTooltip
              label={sidebarCollapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
              side="bottom"
            >
              <Button
                variant="outline"
                size="icon"
                className="hidden border-purple-200 bg-purple-50/50 text-purple-900 hover:bg-purple-100 md:inline-flex"
                onClick={alternarBarraLateral}
                aria-label={sidebarCollapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="h-5 w-5" />
                ) : (
                  <PanelLeftClose className="h-5 w-5" />
                )}
              </Button>
            </QuickTooltip>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-purple-100 px-2 py-0.5 text-[11px] font-extrabold text-purple-800">
                  {currentPage?.badge ?? 'Panel'}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                <h1 className="truncate text-base font-black tracking-tight text-foreground sm:text-lg">
                  {currentPage?.label ?? 'Workspace'}
                </h1>
              </div>
              <p className="hidden truncate text-xs text-muted-foreground sm:block">
                {currentPage?.subtitle}
              </p>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-2.5">
              <Popover>
                <Tooltip>
                  <PopoverTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-purple-200 bg-purple-50/50 hover:bg-purple-100"
                        aria-label="Guía rápida de permisos"
                      >
                        <HelpCircle className="h-5 w-5 text-primary" />
                      </Button>
                    </TooltipTrigger>
                  </PopoverTrigger>
                  <TooltipContent>Permisos de tu rol</TooltipContent>
                </Tooltip>
                <PopoverContent align="end" className="w-84 space-y-3">
                  <div className="flex items-center justify-between border-b border-border pb-2.5">
                    <div>
                      <p className="text-sm font-bold text-foreground">Guía de tu rol</p>
                      <p className="text-xs text-muted-foreground">
                        Permisos activos en TechAsset
                      </p>
                    </div>
                    <RolBadge rol={user.rol} />
                  </div>

                  <ul className="space-y-2 text-xs text-muted-foreground">
                    {(ROLE_GUIDES[user.rol] ?? []).map((tip) => (
                      <li key={tip} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </PopoverContent>
              </Popover>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-3 rounded-2xl border border-purple-200/90 bg-purple-50/40 px-3 py-1.5 text-left transition-all hover:border-purple-400 hover:bg-purple-100/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-600 text-xs font-black text-white shadow-sm">
                      {initials}
                    </div>
                    <div className="hidden min-w-0 sm:block">
                      <p className="truncate text-xs font-extrabold leading-none text-foreground">
                        {user.nombres} {user.apellidos}
                      </p>
                      <p className="mt-1 truncate text-[11px] font-semibold text-purple-700">
                        {ROL_LABELS[user.rol] ?? user.rol}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-76">
                  <DropdownMenuLabel className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-sm font-bold text-white">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="truncate text-sm font-bold text-foreground">
                          {user.nombres} {user.apellidos}
                        </p>
                        <RolBadge rol={user.rol} />
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 rounded-xl bg-muted/60 p-2.5 text-xs font-medium text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="truncate">{user.correo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="truncate">{user.area}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span>Cuenta {user.estado ? 'Activa' : 'Deshabilitada'}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onSelect={() => navigate('/prestamos')}>
                    <ClipboardList className="h-4 w-4 text-primary" />
                    Mis préstamos y solicitudes
                  </DropdownMenuItem>

                  <DropdownMenuItem onSelect={() => navigate('/')}>
                    <ExternalLink className="h-4 w-4 text-primary" />
                    Ver portada pública
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onSelect={cerrarSesionActual}
                    className="text-destructive focus:bg-rose-50 focus:text-rose-700"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </header>

        <main className="flex-1 p-4 md:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
