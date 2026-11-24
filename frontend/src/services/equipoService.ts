import type {
  Equipo,
  EquipoPayload,
  UpdateEstadoEquipoPayload,
} from '@/services/types'
import { apiRequest, buildQueryString } from './api'

export interface EquipoFilters {
  search?: string
  categoria?: string
  estado?: string
}

export const equipoService = {
  listarCatalogo: (filters: EquipoFilters = {}) =>
    apiRequest<Equipo[]>(`/equipos${buildQueryString(filters as Record<string, string | undefined>)}`),

  registrarActivo: (payload: EquipoPayload) =>
    apiRequest<Equipo>('/equipos', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  modificarActivo: (id: string, payload: EquipoPayload) =>
    apiRequest<Equipo>(`/equipos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  cambiarEstadoActivo: (id: string, payload: UpdateEstadoEquipoPayload) =>
    apiRequest<Equipo>(`/equipos/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  removerActivo: (id: string) =>
    apiRequest<void>(`/equipos/${id}`, {
      method: 'DELETE',
    }),
}
