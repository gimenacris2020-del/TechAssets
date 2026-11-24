import { Badge } from '@/components/ui/badge'
import { ROL_LABELS, type EstadoEquipo, type EstadoPrestamo, type RolUsuario } from '@/services/types'

function StatusDot({ colorClass }: { colorClass: string }) {
  return <span className={`h-2 w-2 rounded-full ${colorClass}`} />
}

export function EquipoStatusBadge({ estado }: { estado: EstadoEquipo }) {
  const config: Record<
    string,
    { label: string; variant: 'success' | 'info' | 'warning' | 'destructive'; dot: string }
  > = {
    Disponible: { label: 'Disponible', variant: 'success', dot: 'bg-emerald-500' },
    Prestado: { label: 'Prestado', variant: 'info', dot: 'bg-purple-600' },
    Mantenimiento: { label: 'Mantenimiento', variant: 'warning', dot: 'bg-amber-500' },
    Baja: { label: 'Baja', variant: 'destructive', dot: 'bg-rose-500' },
  }
  const { label, variant, dot } = config[estado] ?? {
    label: estado,
    variant: 'info',
    dot: 'bg-purple-600',
  }
  return (
    <Badge variant={variant}>
      <StatusDot colorClass={dot} />
      {label}
    </Badge>
  )
}

export function PrestamoStatusBadge({ estado }: { estado: EstadoPrestamo }) {
  const config: Record<
    string,
    { label: string; variant: 'warning' | 'info' | 'success' | 'destructive'; dot: string }
  > = {
    Pendiente: { label: 'Pendiente', variant: 'warning', dot: 'bg-amber-500' },
    Activo: { label: 'Activo', variant: 'info', dot: 'bg-purple-600' },
    Devuelto: { label: 'Devuelto', variant: 'success', dot: 'bg-emerald-500' },
    Rechazado: { label: 'Rechazado', variant: 'destructive', dot: 'bg-rose-500' },
  }
  const { label, variant, dot } = config[estado] ?? {
    label: estado,
    variant: 'info',
    dot: 'bg-purple-600',
  }
  return (
    <Badge variant={variant}>
      <StatusDot colorClass={dot} />
      {label}
    </Badge>
  )
}

export function UsuarioEstadoBadge({ activo }: { activo: boolean }) {
  return (
    <Badge variant={activo ? 'success' : 'destructive'}>
      <StatusDot colorClass={activo ? 'bg-emerald-500' : 'bg-rose-500'} />
      {activo ? 'Activo' : 'Deshabilitado'}
    </Badge>
  )
}

export function RolBadge({ rol }: { rol: RolUsuario }) {
  const variant =
    rol === 'Administrador' ? 'default' : rol === 'ResponsableTecnologia' ? 'info' : 'secondary'
  return <Badge variant={variant}>{ROL_LABELS[rol] ?? rol}</Badge>
}
