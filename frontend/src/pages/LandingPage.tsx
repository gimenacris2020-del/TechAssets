import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Cpu,
  Laptop,
  Layers,
  Monitor,
  Network,
  Printer,
  Projector,
  Shield,
  Sparkles,
  Tablet,
  UserCheck,
  Users,
  Wrench,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TechAssetLogo } from '@/components/shared/TechAssetLogo'
import { useAuth } from '@/components/shared/AuthProvider'

const BENTO_FEATURES = [
  {
    icon: Cpu,
    tag: 'Catálogo Patrimonial',
    title: 'Inventario Tecnológico en Tiempo Real',
    desc: 'Cada activo cuenta con código patrimonial único, categoría, marca, ubicación física y trazabilidad de estados.',
    gradient: 'from-purple-600 to-indigo-600',
  },
  {
    icon: ClipboardCheck,
    tag: 'Página + Selector Modal',
    title: 'Flujo de Préstamos sin Conflictos',
    desc: 'Registro de solicitudes en página dedicada con selector modal interactivo, validación de disponibilidad y redirección.',
    gradient: 'from-fuchsia-600 to-purple-600',
  },
  {
    icon: BarChart3,
    tag: 'Auditoría Completa',
    title: 'Analítica por Área y Bitácora',
    desc: 'Visualiza qué áreas demandan más equipamiento, cuáles son los activos más utilizados y cada transición de estado.',
    gradient: 'from-violet-600 to-purple-700',
  },
  {
    icon: Users,
    tag: 'Control de Acceso',
    title: 'Directorio Corporativo por Roles',
    desc: 'Permisos diferenciados para Administradores, Responsables de Tecnología y Colaboradores por área funcional.',
    gradient: 'from-indigo-600 to-violet-600',
  },
]

const CATEGORIES = [
  { icon: Laptop, label: 'Laptops' },
  { icon: Cpu, label: 'PCs de Escritorio' },
  { icon: Monitor, label: 'Monitores' },
  { icon: Printer, label: 'Impresoras' },
  { icon: Tablet, label: 'Tablets' },
  { icon: Projector, label: 'Proyectores' },
  { icon: Network, label: 'Equipos de Red' },
]

const ROLES = [
  {
    icon: Shield,
    name: 'Administrador',
    badge: 'Control Total',
    items: [
      'Gestión de usuarios y deshabilitación de cuentas',
      'Alta, edición, baja y eliminación de equipos sin historial',
      'Aprobación, rechazo y recepción de devoluciones',
      'Reportes globales y bitácora de auditoría',
    ],
  },
  {
    icon: Wrench,
    name: 'Responsable de Tecnología',
    badge: 'Operación TI',
    items: [
      'Registro y actualización de activos tecnológicos',
      'Evaluación y aprobación de solicitudes pendientes',
      'Devoluciones con observaciones obligatorias',
      'Cambio de estado operativo (Disponible, Mantenimiento, Baja)',
    ],
  },
  {
    icon: UserCheck,
    name: 'Colaborador',
    badge: 'Autoservicio',
    items: [
      'Exploración de equipos disponibles en tiempo real',
      'Solicitud de préstamo con selector modal de equipos',
      'Seguimiento de estado (Pendiente, Activo, Devuelto)',
      'Consulta de su historial personal de asignaciones',
    ],
  },
]

export function LandingPage() {
  const { isAuthenticated } = useAuth()
  const primaryHref = isAuthenticated ? '/dashboard' : '/login'

  return (
    <div className="min-h-screen bg-[#f6f3ff] text-foreground">
      {/* Hero Banner Centrado con Gradiente Morado Profundo */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#110624] via-[#210d45] to-[#2c125c] text-white">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-96 w-[750px] -translate-x-1/2 rounded-full bg-fuchsia-500/20 blur-3xl" />

        {/* Navbar */}
        <header className="relative z-20 mx-auto flex h-22 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/">
            <TechAssetLogo size="sm" lightText />
          </Link>

          <nav className="hidden items-center gap-2 rounded-2xl border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-bold text-purple-100 backdrop-blur-md md:flex">
            <a href="#arquitectura" className="rounded-xl px-3 py-1.5 transition-colors hover:bg-white/10">
              Módulos
            </a>
            <a href="#ciclo" className="rounded-xl px-3 py-1.5 transition-colors hover:bg-white/10">
              Ciclo de Préstamo
            </a>
            <a href="#perfiles" className="rounded-xl px-3 py-1.5 transition-colors hover:bg-white/10">
              Perfiles
            </a>
          </nav>

          <Link to={primaryHref}>
            <Button className="bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 text-white border border-white/20">
              {isAuthenticated ? 'Ir al Workspace' : 'Acceder al Portal'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </header>

        {/* Contenido Hero Centrado */}
        <section className="relative z-10 mx-auto max-w-5xl px-4 pb-20 pt-12 text-center sm:px-6 lg:px-8 lg:pb-24 lg:pt-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/35 bg-fuchsia-500/15 px-4 py-1.5 text-xs font-bold text-fuchsia-200 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            Innovatech Solutions S.A.C. • Ecosistema TechAsset v1.0
          </div>

          <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-white sm:text-6xl">
            Plataforma inteligente de{' '}
            <span className="bg-gradient-to-r from-fuchsia-300 via-purple-200 to-indigo-200 bg-clip-text text-transparent">
              activos y préstamos TI
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-purple-100/80 sm:text-lg">
            Centraliza el inventario tecnológico institucional, agiliza la solicitud de equipos mediante
            catálogo modal y garantiza trazabilidad completa desde la entrega hasta la devolución.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to={primaryHref}>
              <Button size="lg" className="h-13 px-8 text-base shadow-xl shadow-purple-950/50">
                {isAuthenticated ? 'Abrir Panel Operativo' : 'Iniciar Sesión Corporativa'}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <a href="#arquitectura">
              <Button
                size="lg"
                variant="outline"
                className="h-13 border-white/20 bg-white/10 px-7 text-base text-white hover:bg-white/20 hover:text-white"
              >
                Conocer el sistema
              </Button>
            </a>
          </div>

          {/* Cinta de Categorías dentro del Hero */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-2.5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              return (
                <div
                  key={cat.label}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold text-purple-100 backdrop-blur-md"
                >
                  <Icon className="h-4 w-4 text-fuchsia-300" />
                  <span>{cat.label}</span>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      {/* Bento Grid de Módulos */}
      <section id="arquitectura" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3.5 py-1 text-xs font-extrabold text-purple-800">
              <Layers className="h-3.5 w-3.5" />
              Arquitectura Funcional
            </span>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Diseñado para el control patrimonial moderno
            </h2>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            Cada módulo aplica validaciones de negocio tanto en la interfaz como en el servidor para
            impedir préstamos duplicados o pérdida de historial.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {BENTO_FEATURES.map((feat) => {
            const Icon = feat.icon
            return (
              <div
                key={feat.title}
                className="group relative overflow-hidden rounded-3xl border border-purple-200/90 bg-white p-7 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-950/5"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feat.gradient} text-white shadow-md`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 ring-1 ring-purple-200">
                    {feat.tag}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-extrabold text-foreground">{feat.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feat.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Ciclo de Préstamo en Banda Morada */}
      <section id="ciclo" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#180a33] via-[#2b1259] to-[#1e0c40] p-8 text-white shadow-xl sm:p-12">
          <div className="max-w-xl space-y-2">
            <span className="rounded-full bg-fuchsia-500/20 px-3 py-1 text-xs font-bold text-fuchsia-200">
              Flujo Operativo
            </span>
            <h2 className="text-2xl font-black sm:text-3xl">
              De la solicitud a la devolución en 3 etapas
            </h2>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/15 bg-white/8 p-6 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-black text-fuchsia-300">PASO 01</span>
                <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-200">
                  Pendiente
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold">Registro con Selector Modal</h3>
              <p className="mt-2 text-xs leading-relaxed text-purple-100/80">
                El colaborador accede a la página de nuevo préstamo, elige un equipo disponible desde el
                modal interactivo y al guardar es redirigido al listado.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/8 p-6 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-black text-purple-300">PASO 02</span>
                <span className="rounded-full bg-purple-400/25 px-3 py-1 text-xs font-bold text-purple-100">
                  Activo
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold">Autorización de Tecnología</h3>
              <p className="mt-2 text-xs leading-relaxed text-purple-100/80">
                El Responsable de Tecnología aprueba la entrega; el activo cambia automáticamente a estado
                Prestado y queda asociado al responsable.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/8 p-6 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-black text-emerald-300">PASO 03</span>
                <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-200">
                  Devuelto
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold">Recepción y Observaciones</h3>
              <p className="mt-2 text-xs leading-relaxed text-purple-100/80">
                Al recibir el equipo se registran observaciones obligatorias y se decide si vuelve a
                Disponible o pasa a Mantenimiento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Perfiles de Usuario */}
      <section id="perfiles" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="text-center space-y-2">
          <span className="inline-flex items-center rounded-full bg-purple-100 px-3.5 py-1 text-xs font-extrabold text-purple-800">
            Seguridad Basada en Roles
          </span>
          <h2 className="text-3xl font-black tracking-tight">Tres perfiles, un solo ecosistema</h2>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {ROLES.map((role) => {
            const Icon = role.icon
            return (
              <div
                key={role.name}
                className="flex flex-col justify-between rounded-3xl border border-purple-200/90 bg-white p-7 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
                      {role.badge}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-extrabold">{role.name}</h3>
                  <ul className="mt-4 space-y-2.5 text-xs text-muted-foreground">
                    {role.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 border-t border-border pt-4">
                  <Link to={primaryHref} className="text-xs font-bold text-primary hover:underline">
                    Ingresar con este perfil →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-200/80 bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <TechAssetLogo size="sm" showSubtitle={false} />
          <p>© 2026 Innovatech Solutions S.A.C. — TechAsset Workspace v1.0</p>
        </div>
      </footer>
    </div>
  )
}
