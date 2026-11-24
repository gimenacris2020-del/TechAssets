import type {
  Prestamo,
  RegistrarDevolucionPayload,
  SolicitarPrestamoPayload,
} from '@/services/types'
import { apiRequest, buildQueryString } from './api'

export interface PrestamoFilters {
  search?: string
  estado?: string
  area?: string
}

export const prestamoService = {
  listarSolicitudes: (filters: PrestamoFilters = {}) =>
    apiRequest<Prestamo[]>(`/prestamos${buildQueryString(filters as Record<string, string | undefined>)}`),

  enviarSolicitud: (payload: SolicitarPrestamoPayload) =>
    apiRequest<Prestamo>('/prestamos/solicitar', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  autorizarSolicitud: (id: string) =>
    apiRequest<Prestamo>(`/prestamos/${id}/aprobar`, {
      method: 'PATCH',
    }),

  denegarSolicitud: (id: string, motivo: string) =>
    apiRequest<Prestamo>(`/prestamos/${id}/rechazar`, {
      method: 'PATCH',
      body: JSON.stringify({ motivo }),
    }),

  confirmarDevolucion: (id: string, payload: RegistrarDevolucionPayload) =>
    apiRequest<Prestamo>(`/prestamos/${id}/devolver`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
}
