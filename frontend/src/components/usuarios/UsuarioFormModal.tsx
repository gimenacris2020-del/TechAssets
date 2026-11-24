import { useEffect, useState, type FormEvent } from 'react'
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
import { FormField } from '@/components/shared/FormField'
import { useToast } from '@/components/shared/ToastProvider'
import { usuarioService } from '@/services/usuarioService'
import { ROL_LABELS, ROLES_USUARIO, type Usuario } from '@/services/types'

interface UsuarioFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  usuario?: Usuario | null
  onSaved: () => void
}

export function UsuarioFormModal({ open, onOpenChange, usuario, onSaved }: UsuarioFormModalProps) {
  const isEditing = Boolean(usuario)
  const { showSuccess, showError } = useToast()

  const [nombres, setNombres] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [area, setArea] = useState('')
  const [rol, setRol] = useState<string>('Colaborador')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setNombres(usuario?.nombres ?? '')
      setApellidos(usuario?.apellidos ?? '')
      setCorreo(usuario?.correo ?? '')
      setPassword('')
      setArea(usuario?.area ?? '')
      setRol(usuario?.rol ?? 'Colaborador')
      setErrors({})
    }
  }, [open, usuario])

  const validarDatosCuenta = () => {
    const nextErrors: Record<string, string> = {}
    if (!nombres.trim()) nextErrors.nombres = 'Los nombres son obligatorios.'
    if (!apellidos.trim()) nextErrors.apellidos = 'Los apellidos son obligatorios.'
    if (!correo.trim()) {
      nextErrors.correo = 'El correo electrÃ³nico es obligatorio.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      nextErrors.correo = 'El formato del correo electrÃ³nico no es vÃ¡lido.'
    }
    if (!isEditing && password.length < 6) {
      nextErrors.password = 'La contraseÃ±a debe tener al menos 6 caracteres.'
    } else if (isEditing && password && password.length < 6) {
      nextErrors.password = 'La nueva contraseÃ±a debe tener al menos 6 caracteres.'
    }
    if (!area.trim()) nextErrors.area = 'El Ã¡rea funcional es obligatoria.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const guardarCuentaUsuario = async (e: FormEvent) => {
    e.preventDefault()
    if (!validarDatosCuenta()) return

    setIsSubmitting(true)
    try {
      if (isEditing && usuario) {
        await usuarioService.modificarCuenta(usuario.id, {
          nombres: nombres.trim(),
          apellidos: apellidos.trim(),
          correo: correo.trim(),
          password: password.trim() || undefined,
          area: area.trim(),
          rol,
        })
        showSuccess('Usuario actualizado', 'Los datos del usuario se actualizaron correctamente.')
      } else {
        await usuarioService.registrarCuenta({
          nombres: nombres.trim(),
          apellidos: apellidos.trim(),
          correo: correo.trim(),
          password,
          area: area.trim(),
          rol,
        })
        showSuccess('Usuario registrado', 'El usuario fue creado correctamente.')
      }
      onOpenChange(false)
      onSaved()
    } catch (err) {
      showError('No se pudo guardar el usuario', err instanceof Error ? err.message : undefined)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Usuario' : 'Registrar Usuario'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica la informaciÃ³n del colaborador o administrador.'
              : 'Completa los campos para dar de alta a un nuevo usuario en TechAsset.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={guardarCuentaUsuario} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Nombres" htmlFor="u-nombres" error={errors.nombres} required>
              <Input
                id="u-nombres"
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                placeholder="Ej. Ana MarÃ­a"
              />
            </FormField>

            <FormField label="Apellidos" htmlFor="u-apellidos" error={errors.apellidos} required>
              <Input
                id="u-apellidos"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                placeholder="Ej. Torres Paredes"
              />
            </FormField>
          </div>

          <FormField label="Correo electrÃ³nico" htmlFor="u-correo" error={errors.correo} required>
            <Input
              id="u-correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="usuario@innovatech.com"
            />
          </FormField>

          <FormField
            label={isEditing ? 'Nueva contraseÃ±a (opcional)' : 'ContraseÃ±a'}
            htmlFor="u-password"
            error={errors.password}
            required={!isEditing}
          >
            <Input
              id="u-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEditing ? 'Dejar vacÃ­o para mantener la actual' : 'MÃ­nimo 6 caracteres'}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Ãrea" htmlFor="u-area" error={errors.area} required>
              <Input
                id="u-area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Ej. IngenierÃ­a de Producto"
              />
            </FormField>

            <FormField label="Rol" htmlFor="u-rol" required>
              <Select id="u-rol" value={rol} onChange={(e) => setRol(e.target.value)}>
                {ROLES_USUARIO.map((item) => (
                  <option key={item} value={item}>
                    {ROL_LABELS[item]}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Registrar usuario'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
