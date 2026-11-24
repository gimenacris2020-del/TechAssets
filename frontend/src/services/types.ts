export type RolUsuario = string

export type EstadoEquipo = string

export type CategoriaEquipo = string

export type EstadoPrestamo = string

export type TipoMovimiento = string

export const ROLES_USUARIO = ['Administrador', 'ResponsableTecnologia', 'Colaborador'] as const

export const ESTADOS_EQUIPO = ['Disponible', 'Prestado', 'Mantenimiento', 'Baja'] as const

export const CATEGORIAS_EQUIPO = [
  'Laptop',
  'ComputadoraEscritorio',
  'Monitor',
  'Impresora',
  'Tablet',
  'ProyectorMultimedia',
  'EquipoRed',
] as const

export const ESTADOS_PRESTAMO = ['Pendiente', 'Activo', 'Devuelto', 'Rechazado'] as const

export interface AuthUser {
  id: string
  nombres: string
  apellidos: string
  correo: string
  area: string
  rol: string
  estado: boolean
}

export interface LoginRequest {
  correo: string
  password: string
}

export interface LoginResponse {
  token: string
  expiration: string
  usuario: AuthUser
}

export interface Usuario {
  id: string
  nombres: string
  apellidos: string
  nombreCompleto: string
  correo: string
  area: string
  rol: string
  estado: boolean
  fechaCreacion: string
}

export interface CreateUsuarioPayload {
  nombres: string
  apellidos: string
  correo: string
  password: string
  area: string
  rol: string
}

export interface UpdateUsuarioPayload {
  nombres: string
  apellidos: string
  correo: string
  password?: string
  area: string
  rol: string
}

export interface Equipo {
  id: string
  codigoPatrimonial: string
  nombre: string
  categoria: string
  marca: string
  ubicacion: string
  estado: string
  fechaRegistro: string
}

export interface EquipoPayload {
  codigoPatrimonial: string
  nombre: string
  categoria: string
  marca: string
  ubicacion: string
}

export interface UpdateEstadoEquipoPayload {
  estado: string
  motivo?: string
}

export interface Prestamo {
  id: string
  fechaSolicitud: string
  fechaPrestamo: string
  fechaDevolucionEstimada: string
  fechaDevolucion: string | null
  estado: string
  observacion: string | null
  observacionDevolucion: string | null
  usuarioId: string
  usuarioNombre: string
  usuarioArea: string
  responsableId: string | null
  responsableNombre: string | null
  equipoId: string
  equipoCodigoPatrimonial: string
  equipoNombre: string
  equipoCategoria: string
}

export interface SolicitarPrestamoPayload {
  equipoId: string
  fechaPrestamo: string
  fechaDevolucionEstimada: string
  observacion?: string
}

export interface RegistrarDevolucionPayload {
  fechaDevolucion: string
  observacionDevolucion: string
  enviarAMantenimiento: boolean
}

export interface DashboardData {
  totalEquipos: number
  equiposDisponibles: number
  equiposPrestados: number
  equiposMantenimiento: number
  equiposBaja: number
  totalPrestamos: number
  prestamosPendientes: number
  prestamosActivos: number
  areaMayorUso: string
  areaMayorUsoCantidad: number
}

export interface EquiposPorEstado {
  estado: string
  estadoNombre: string
  cantidad: number
}

export interface EquipoMasUtilizado {
  equipoId: string
  codigoPatrimonial: string
  nombre: string
  categoria: string
  marca: string
  totalPrestamos: number
}

export interface PrestamosPorArea {
  area: string
  totalPrestamos: number
  prestamosActivos: number
}

export interface MovimientoEquipo {
  id: string
  equipoId: string
  equipoCodigoPatrimonial: string
  equipoNombre: string
  usuarioResponsableId: string | null
  usuarioResponsableNombre: string | null
  tipoMovimiento: string
  estadoAnterior: string | null
  estadoNuevo: string
  fechaMovimiento: string
  detalle: string
}

export const CATEGORIA_LABELS: Record<string, string> = {
  Laptop: 'Laptop',
  ComputadoraEscritorio: 'Computadora de escritorio',
  Monitor: 'Monitor',
  Impresora: 'Impresora',
  Tablet: 'Tablet',
  ProyectorMultimedia: 'Proyector multimedia',
  EquipoRed: 'Equipo de red',
}

export const ROL_LABELS: Record<string, string> = {
  Administrador: 'Administrador',
  ResponsableTecnologia: 'Responsable de Tecnología',
  Colaborador: 'Colaborador',
}
