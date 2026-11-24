import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Building2, CheckCircle2, Mail, Shield, Sparkles, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { FormField } from '@/components/shared/FormField'
import { useToast } from '@/components/shared/ToastProvider'
import { ROL_LABELS, ROLES_USUARIO } from '@/services/types'
import { usuarioService } from '@/services/usuarioService'

export function NuevoUsuarioPage() {
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()

  const [nombres, setNombres] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [area, setArea] = useState('')
  const [rol, setRol] = useState<string>('Colaborador')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validarDatosCuenta = () => {
    const nextErrors: Record<string, string> = {}
    if (!nombres.trim()) nextErrors.nombres = 'Los nombres son obligatorios.'
    if (!apellidos.trim()) nextErrors.apellidos = 'Los apellidos son obligatorios.'
    if (!correo.trim()) {
      nextErrors.correo = 'El correo electrónico es obligatorio.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      nextErrors.correo = 'El formato del correo electrónico no es válido.'
    }
    if (password.length < 6) {
      nextErrors.password = 'La contraseña debe tener al menos 6 caracteres.'
    }
    if (!area.trim()) nextErrors.area = 'El área funcional es obligatoria.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const registrarNuevoUsuario = async (e: FormEvent) => {
    e.preventDefault()
    if (!validarDatosCuenta()) return

    setIsSubmitting(true)
    try {
      await usuarioService.registrarCuenta({
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        correo: correo.trim(),
        password,
        area: area.trim(),
        rol,
      })

      showSuccess(
        'Usuario corporativo registrado',
        `La cuenta de ${nombres.trim()} ${apellidos.trim()} fue creada y fuiste redirigido al directorio.`,
      )
      navigate('/usuarios', { replace: true })
    } catch (err) {
      showError('No se pudo registrar el usuario', err instanceof Error ? err.message : undefined)
    } finally {
      setIsSubmitting(false)
    }
  }

  const initials =
    `${nombres.trim().charAt(0) || 'N'}${apellidos.trim().charAt(0) || 'U'}`.toUpperCase()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-purple-200/80 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-0.5 text-xs font-extrabold text-purple-800">
            <Sparkles className="h-3.5 w-3.5" />
            Alta de Cuenta Institucional
          </span>
          <h2 className="mt-1.5 text-2xl font-black tracking-tight">
            Registrar Nuevo Usuario
          </h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Crea un nuevo perfil de acceso y al confirmar serás redirigido al directorio de usuarios.
          </p>
        </div>

        <Link to="/usuarios">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" />
            Volver al Directorio
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
        <Card className="overflow-hidden rounded-3xl border-purple-200/80">
          <div className="h-1.5 bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600" />
          <CardHeader>
            <CardTitle>Información Personal y Credenciales</CardTitle>
            <CardDescription>
              Asigna el área funcional y el rol que determinará los permisos dentro de TechAsset.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={registrarNuevoUsuario} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Nombres" htmlFor="u-nombres" error={errors.nombres} required>
                  <Input
                    id="u-nombres"
                    value={nombres}
                    onChange={(e) => {
                      setNombres(e.target.value)
                      setErrors((prev) => ({ ...prev, nombres: '' }))
                    }}
                    placeholder="Ej. Elena Sofía"
                  />
                </FormField>

                <FormField label="Apellidos" htmlFor="u-apellidos" error={errors.apellidos} required>
                  <Input
                    id="u-apellidos"
                    value={apellidos}
                    onChange={(e) => {
                      setApellidos(e.target.value)
                      setErrors((prev) => ({ ...prev, apellidos: '' }))
                    }}
                    placeholder="Ej. Montesinos Vega"
                  />
                </FormField>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Correo electrónico institucional"
                  htmlFor="u-correo"
                  error={errors.correo}
                  required
                >
                  <Input
                    id="u-correo"
                    type="email"
                    value={correo}
                    onChange={(e) => {
                      setCorreo(e.target.value)
                      setErrors((prev) => ({ ...prev, correo: '' }))
                    }}
                    placeholder="emontesinos@innovatech.com"
                  />
                </FormField>

                <FormField
                  label="Contraseña inicial"
                  htmlFor="u-password"
                  error={errors.password}
                  required
                >
                  <Input
                    id="u-password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setErrors((prev) => ({ ...prev, password: '' }))
                    }}
                    placeholder="Mínimo 6 caracteres"
                  />
                </FormField>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Área Funcional" htmlFor="u-area" error={errors.area} required>
                  <Input
                    id="u-area"
                    value={area}
                    onChange={(e) => {
                      setArea(e.target.value)
                      setErrors((prev) => ({ ...prev, area: '' }))
                    }}
                    placeholder="Ej. Ciberseguridad / Ingeniería"
                  />
                </FormField>

                <FormField label="Rol en el Sistema" htmlFor="u-rol" required>
                  <Select id="u-rol" value={rol} onChange={(e) => setRol(e.target.value)}>
                    {ROLES_USUARIO.map((item) => (
                      <option key={item} value={item}>
                        {ROL_LABELS[item]}
                      </option>
                    ))}
                  </Select>
                </FormField>
              </div>

              <div className="flex flex-col-reverse justify-end gap-3 border-t border-border pt-4 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/usuarios')}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <UserPlus className="h-4 w-4" />
                  {isSubmitting ? 'Registrando cuenta...' : 'Confirmar y crear usuario'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="rounded-3xl bg-gradient-to-br from-[#190a36] via-[#2c1259] to-[#170930] p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-fuchsia-200">
                {ROL_LABELS[rol] ?? rol}
              </span>
              <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-300">
                Cuenta Activa
              </span>
            </div>

            <div className="mt-5 flex items-center gap-3.5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-indigo-600 text-lg font-black text-white shadow-md">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-purple-200/75">
                  Vista previa de perfil
                </p>
                <p className="truncate text-lg font-black text-white">
                  {nombres.trim() || apellidos.trim()
                    ? `${nombres.trim()} ${apellidos.trim()}`.trim()
                    : 'Nombre del Colaborador'}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2 rounded-2xl bg-white/8 p-3.5 text-xs text-purple-100 ring-1 ring-white/10">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-fuchsia-300" />
                <span className="truncate font-mono">
                  {correo.trim() || 'usuario@innovatech.com'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-fuchsia-300" />
                <span className="truncate font-semibold text-white">
                  {area.trim() || 'Área funcional'}
                </span>
              </div>
            </div>
          </div>

          <Card className="rounded-3xl border-purple-200/80">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-primary" />
                Reglas de Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  El correo electrónico institucional debe ser único en todo el sistema.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  Solo los usuarios con rol Administrador pueden crear o deshabilitar cuentas.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
