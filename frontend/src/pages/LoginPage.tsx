import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Eye,
  EyeOff,
  HelpCircle,
  KeyRound,
  Layers,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/components/shared/AuthProvider'
import { FormField } from '@/components/shared/FormField'
import { TechAssetLogo } from '@/components/shared/TechAssetLogo'
import { useToast } from '@/components/shared/ToastProvider'

const REMEMBERED_EMAIL_KEY = 'techasset_remembered_email'

const CUENTAS_DEMO = [
  {
    rol: 'Administrador',
    nombre: 'Sebastián Valdivia',
    correo: 'svaldivia@innovatech.com',
    clave: 'Admin2026!',
  },
  {
    rol: 'Resp. Tecnología',
    nombre: 'Valeria Salazar',
    correo: 'vsalazar@innovatech.com',
    clave: 'Tecno2026!',
  },
  {
    rol: 'Colaborador',
    nombre: 'Mateo Gutiérrez',
    correo: 'mgutierrez@innovatech.com',
    clave: 'Colab2026!',
  },
]

const PILLARS = [
  {
    icon: Cpu,
    title: 'Control Patrimonial Unificado',
    desc: 'Trazabilidad en vivo de laptops, monitores, proyectores, tablets y equipos de red por ubicación.',
  },
  {
    icon: Layers,
    title: 'Ciclo de Préstamos Automatizado',
    desc: 'Solicitud con selector interactivo de activos disponibles, aprobación por TI y auditoría de retorno.',
  },
  {
    icon: Activity,
    title: 'Analítica y Bitácora Institucional',
    desc: 'Métricas de demanda por departamento, ranking de rotación y registro histórico inalterable.',
  },
]

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const { showError } = useToast()
  const navigate = useNavigate()

  const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? ''

  const [correo, setCorreo] = useState(rememberedEmail)
  const [password, setPassword] = useState('')
  const [rememberEmail, setRememberEmail] = useState(Boolean(rememberedEmail))
  const [showPassword, setShowPassword] = useState(false)
  const [capsLockOn, setCapsLockOn] = useState(false)
  const [showHelpNote, setShowHelpNote] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [errors, setErrors] = useState<{ correo?: string; password?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const validarCredenciales = () => {
    const nextErrors: { correo?: string; password?: string } = {}
    if (!correo.trim()) {
      nextErrors.correo = 'El correo electrónico es obligatorio.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      nextErrors.correo = 'Ingrese un correo electrónico válido.'
    }
    if (!password) {
      nextErrors.password = 'La contraseña es obligatoria.'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const detectarBloqMayus = (e: KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(e.getModifierState('CapsLock'))
  }

  const enviarFormularioAcceso = async (e: FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    if (!validarCredenciales()) return

    setIsSubmitting(true)
    try {
      const normalizedEmail = correo.trim()
      await login({ correo: normalizedEmail, password })

      if (rememberEmail) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, normalizedEmail)
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY)
      }

      navigate('/dashboard', { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Credenciales inválidas.'
      setAuthError(message)
      showError('Error al iniciar sesión', message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-screen bg-[#f6f3ff] lg:grid-cols-[1fr_1.18fr]">
      <div className="flex flex-col justify-between bg-white px-6 py-8 shadow-2xl shadow-purple-950/10 sm:px-12 lg:px-14 xl:px-20">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="transition-opacity hover:opacity-90">
            <TechAssetLogo size="sm" />
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50/60 px-3.5 py-2 text-xs font-bold text-purple-900 transition-colors hover:border-purple-400 hover:bg-purple-100"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver al inicio
          </Link>
        </div>

        <div className="mx-auto my-8 w-full max-w-md space-y-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-100 to-fuchsia-100 px-3 py-1 text-xs font-extrabold text-purple-800 ring-1 ring-purple-200">
              <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              Portal Corporativo TechAsset
            </span>
            <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              Iniciar sesión
            </h1>
            <p className="text-sm text-muted-foreground">
              Ingresa tus credenciales institucionales para acceder al ecosistema de inventario y préstamos.
            </p>
          </div>

          {authError && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <p className="font-medium">{authError}</p>
            </div>
          )}

          <form onSubmit={enviarFormularioAcceso} className="space-y-4">
            <FormField label="Correo institucional" htmlFor="login-correo" error={errors.correo} required>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="login-correo"
                  type="email"
                  value={correo}
                  onChange={(e) => {
                    setCorreo(e.target.value)
                    setAuthError(null)
                  }}
                  placeholder="usuario@innovatech.com"
                  className="h-12 pl-11"
                  autoComplete="email"
                />
              </div>
            </FormField>

            <FormField label="Contraseña" htmlFor="login-password" error={errors.password} required>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setAuthError(null)
                  }}
                  onKeyUp={detectarBloqMayus}
                  onKeyDown={detectarBloqMayus}
                  placeholder="Ingresa tu contraseña"
                  className="h-12 pl-11 pr-12"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {capsLockOn && (
                <p className="text-xs font-medium text-amber-700">
                  Bloq Mayús está activado.
                </p>
              )}
            </FormField>

            <div className="flex items-center justify-between gap-2 text-xs">
              <label className="flex items-center gap-2 font-semibold text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberEmail}
                  onChange={(e) => setRememberEmail(e.target.checked)}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                Recordar mi correo
              </label>

              <button
                type="button"
                onClick={() => setShowHelpNote((prev) => !prev)}
                className="inline-flex items-center gap-1 font-bold text-primary hover:underline cursor-pointer"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                ¿Problemas de acceso?
              </button>
            </div>

            {showHelpNote && (
              <div className="rounded-2xl border border-purple-200 bg-purple-50/80 p-3.5 text-xs leading-relaxed text-purple-950">
                Comunícate con la <span className="font-bold">Dirección de Sistemas</span> (
                <span className="font-mono">svaldivia@innovatech.com</span>) para restablecer tu clave
                o habilitar tu perfil.
              </div>
            )}

            <Button type="submit" size="lg" className="h-12 w-full text-base" disabled={isSubmitting}>
              {isSubmitting ? 'Verificando credenciales...' : 'Ingresar al Panel'}
              {!isSubmitting && <ArrowRight className="h-5 w-5" />}
            </Button>
          </form>

          <div className="rounded-2xl border border-purple-200/90 bg-purple-50/50 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-purple-900">
                <KeyRound className="h-3.5 w-3.5 text-primary" />
                Perfiles de prueba rápida
              </span>
              <span className="text-[11px] text-muted-foreground">Clic para autocompletar</span>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {CUENTAS_DEMO.map((cuenta) => {
                const isSelected = correo === cuenta.correo
                return (
                  <button
                    key={cuenta.correo}
                    type="button"
                    onClick={() => {
                      setCorreo(cuenta.correo)
                      setPassword(cuenta.clave)
                      setAuthError(null)
                      setErrors({})
                    }}
                    className={`rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-purple-600 bg-white shadow-sm ring-2 ring-purple-500/20'
                        : 'border-purple-200/80 bg-white/85 hover:border-purple-400 hover:bg-white'
                    }`}
                  >
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                      {cuenta.rol}
                    </p>
                    <p className="mt-0.5 truncate text-xs font-bold text-foreground">
                      {cuenta.nombre}
                    </p>
                    <p className="truncate font-mono text-[10px] text-muted-foreground">
                      {cuenta.correo}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>© 2026 Innovatech Solutions S.A.C.</span>
          <span className="inline-flex items-center gap-1 font-semibold text-purple-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Protegido con JWT
          </span>
        </div>
      </div>

      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#130726] via-[#271052] to-[#14082b] p-10 text-white lg:flex xl:p-14">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-12 h-96 w-96 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/15 px-4 py-1.5 text-xs font-bold text-fuchsia-200 backdrop-blur-md">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Ecosistema Operativo en Tiempo Real
          </div>
          <span className="rounded-xl border border-white/15 bg-white/10 px-3 py-1 font-mono text-xs font-bold text-purple-200 backdrop-blur-md">
            TechAsset v1.0
          </span>
        </div>

        <div className="relative z-10 my-auto space-y-7 py-6">
          <div className="max-w-xl space-y-3">
            <h2 className="text-3xl font-black leading-tight tracking-tight text-white xl:text-4xl">
              Arquitectura inteligente para el control de{' '}
              <span className="bg-gradient-to-r from-fuchsia-300 via-purple-200 to-indigo-200 bg-clip-text text-transparent">
                activos tecnológicos
              </span>
            </h2>
            <p className="text-sm leading-relaxed text-purple-100/80">
              Centraliza el inventario de más de 500 colaboradores, elimina las hojas de cálculo
              manuales y garantiza trazabilidad completa en cada préstamo y devolución.
            </p>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/8 p-5 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white shadow-md">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-white">Monitor de Trazabilidad TI</p>
                  <p className="text-[11px] text-purple-200/75">
                    Validación automática de disponibilidad y fechas
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-[11px] font-bold text-emerald-300">
                100% Sincronizado
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/25 p-3.5">
                <p className="text-[11px] font-semibold text-purple-200/75">Categorías TI</p>
                <p className="mt-1 text-2xl font-black text-fuchsia-300">07</p>
                <p className="mt-0.5 text-[10px] text-purple-200/60">Laptops, Red, Monitores+</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-3.5">
                <p className="text-[11px] font-semibold text-purple-200/75">Flujo de Estados</p>
                <p className="mt-1 text-2xl font-black text-purple-200">04</p>
                <p className="mt-0.5 text-[10px] text-purple-200/60">Disponible → Prestado</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-3.5">
                <p className="text-[11px] font-semibold text-purple-200/75">Perfiles de Rol</p>
                <p className="mt-1 text-2xl font-black text-indigo-300">03</p>
                <p className="mt-0.5 text-[10px] text-purple-200/60">Admin, TI y Colaborador</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/12 bg-gradient-to-r from-purple-900/60 via-violet-900/50 to-fuchsia-900/40 px-4 py-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                <div>
                  <p className="text-xs font-bold text-white">
                    INV-LAP-001 • ThinkPad T14 Gen 4
                  </p>
                  <p className="text-[11px] text-purple-200/80">
                    Código patrimonial único verificado • Almacén TI Piso 3
                  </p>
                </div>
              </div>
              <span className="rounded-lg bg-emerald-500/20 px-2.5 py-1 font-mono text-[10px] font-bold text-emerald-200">
                DISPONIBLE
              </span>
            </div>
          </div>

          <div className="grid gap-3">
            {PILLARS.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="flex items-start gap-3.5 rounded-2xl border border-white/12 bg-white/6 p-3.5 backdrop-blur-md transition-colors hover:bg-white/10"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/30 to-fuchsia-500/30 text-fuchsia-200 ring-1 ring-white/15">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-white">{item.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-purple-100/75">
                      {item.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-purple-200/70">
          <span>Innovatech Solutions S.A.C. — Gestión de Inventario y Préstamos</span>
          <span className="font-mono text-fuchsia-300">Plataforma v1.0</span>
        </div>
      </div>
    </div>
  )
}
