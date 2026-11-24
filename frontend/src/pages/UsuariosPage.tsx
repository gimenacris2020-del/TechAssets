import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Edit, Mail, Plus, Power, Search, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { QuickTooltip } from '@/components/ui/tooltip'
import { useAuth } from '@/components/shared/AuthProvider'
import { ConfirmPopover } from '@/components/shared/ConfirmPopover'
import { EmptyState } from '@/components/shared/EmptyState'
import { RolBadge, UsuarioEstadoBadge } from '@/components/shared/StatusBadge'
import { useToast } from '@/components/shared/ToastProvider'
import { UsuarioFormModal } from '@/components/usuarios/UsuarioFormModal'
import { ROL_LABELS, ROLES_USUARIO, type Usuario } from '@/services/types'
import { usuarioService } from '@/services/usuarioService'
import { cn } from '@/services/utils'

export function UsuariosPage() {
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const { showSuccess, showError } = useToast()

  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [rolFilter, setRolFilter] = useState<string>('')
  const [estadoFilter, setEstadoFilter] = useState<'' | 'true' | 'false'>('')

  const [formOpen, setFormOpen] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)

  const cargarDirectorioUsuarios = useCallback(async () => {
    setIsLoading(true)
    try {
      const lista = await usuarioService.listarDirectorio({
        search,
        rol: rolFilter,
        estado: estadoFilter === '' ? '' : estadoFilter === 'true',
      })
      setUsuarios(lista)
    } catch (err) {
      showError('Error al cargar usuarios', err instanceof Error ? err.message : undefined)
    } finally {
      setIsLoading(false)
    }
  }, [search, rolFilter, estadoFilter, showError])

  useEffect(() => {
    void cargarDirectorioUsuarios()
  }, [cargarDirectorioUsuarios])

  const alternarEstadoUsuario = async (usuario: Usuario) => {
    const nextEstado = !usuario.estado

    try {
      await usuarioService.alternarEstadoCuenta(usuario.id, nextEstado)
      showSuccess(
        nextEstado ? 'Usuario habilitado' : 'Usuario deshabilitado',
        `La cuenta de ${usuario.nombreCompleto} fue actualizada.`,
      )
      await cargarDirectorioUsuarios()
    } catch (err) {
      showError('No se pudo cambiar el estado', err instanceof Error ? err.message : undefined)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-purple-200/80 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-0.5 text-xs font-extrabold text-purple-800">
            <Users className="h-3.5 w-3.5" />
            Cuentas Corporativas
          </span>
          <h2 className="mt-1.5 text-2xl font-black tracking-tight">Directorio de Usuarios</h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Gestiona los perfiles de colaboradores, responsables de tecnología y administradores.
          </p>
        </div>

        <Button onClick={() => navigate('/usuarios/nuevo')}>
          <Plus className="h-4 w-4" />
          Registrar usuario
        </Button>
      </div>

      <div className="rounded-3xl border border-purple-200/80 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setRolFilter('')}
            className={cn(
              'rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer',
              rolFilter === ''
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                : 'bg-purple-50 text-purple-900 hover:bg-purple-100',
            )}
          >
            Todos los roles ({usuarios.length})
          </button>
          {ROLES_USUARIO.map((rol) => (
            <button
              key={rol}
              type="button"
              onClick={() => setRolFilter(rol)}
              className={cn(
                'rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer',
                rolFilter === rol
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                  : 'bg-purple-50 text-purple-900 hover:bg-purple-100',
              )}
            >
              {ROL_LABELS[rol]}
            </button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-[1.6fr_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, apellido, correo o área funcional..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value as '' | 'true' | 'false')}
          >
            <option value="">Todos los estados de cuenta</option>
            <option value="true">Solo cuentas activas</option>
            <option value="false">Solo cuentas deshabilitadas</option>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-purple-200/80 bg-white p-12 text-center text-sm text-muted-foreground">
          Cargando directorio de usuarios...
        </div>
      ) : usuarios.length === 0 ? (
        <div className="rounded-3xl border border-purple-200/80 bg-white p-6">
          <EmptyState
            title="No se encontraron usuarios"
            description="Ajusta los filtros de búsqueda o registra un nuevo usuario."
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {usuarios.map((u) => {
            const initials = `${u.nombres.charAt(0)}${u.apellidos.charAt(0)}`.toUpperCase()
            return (
              <div
                key={u.id}
                className="flex flex-col justify-between rounded-3xl border border-purple-200/90 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-purple-400 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-600 text-sm font-black text-white shadow-sm">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-extrabold text-foreground">
                          {u.nombreCompleto}
                        </h3>
                        <div className="mt-1">
                          <RolBadge rol={u.rol} />
                        </div>
                      </div>
                    </div>

                    <UsuarioEstadoBadge activo={u.estado} />
                  </div>

                  <div className="mt-4 space-y-2 rounded-2xl bg-purple-50/60 p-3.5 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="truncate font-mono text-foreground">{u.correo}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="truncate font-semibold text-purple-900">{u.area}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3.5">
                  <span className="text-[11px] text-muted-foreground">
                    Alta: {new Date(u.fechaCreacion).toLocaleDateString('es-PE')}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <QuickTooltip label="Editar usuario">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2.5 text-xs"
                        onClick={() => {
                          setSelectedUsuario(u)
                          setFormOpen(true)
                        }}
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Editar
                      </Button>
                    </QuickTooltip>

                    <ConfirmPopover
                      title={u.estado ? '¿Deshabilitar usuario?' : '¿Habilitar usuario?'}
                      description={
                        u.estado
                          ? `${u.nombreCompleto} no podrá iniciar sesión ni solicitar préstamos mientras esté deshabilitado.`
                          : `${u.nombreCompleto} volverá a tener acceso al sistema.`
                      }
                      confirmLabel={u.estado ? 'Deshabilitar' : 'Habilitar'}
                      confirmVariant={u.estado ? 'destructive' : 'default'}
                      tooltip={u.estado ? 'Deshabilitar cuenta' : 'Habilitar cuenta'}
                      onConfirm={() => alternarEstadoUsuario(u)}
                    >
                      <Button
                        size="sm"
                        variant={u.estado ? 'outline' : 'default'}
                        className="h-8 px-2.5 text-xs"
                        disabled={currentUser?.id === u.id && u.estado}
                      >
                        <Power className="h-3.5 w-3.5" />
                        {u.estado ? 'Deshabilitar' : 'Habilitar'}
                      </Button>
                    </ConfirmPopover>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <UsuarioFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        usuario={selectedUsuario}
        onSaved={cargarDirectorioUsuarios}
      />
    </div>
  )
}
