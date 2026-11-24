import type { CreateUsuarioPayload, UpdateUsuarioPayload, Usuario } from '@/services/types'
import { apiRequest, buildQueryString } from './api'

export interface UsuarioFilters {
  search?: string
  area?: string
  rol?: string
  estado?: boolean | ''
}

export const usuarioService = {
  listarDirectorio: (filters: UsuarioFilters = {}) =>
    apiRequest<Usuario[]>(`/usuarios${buildQueryString(filters as Record<string, string | boolean | undefined>)}`),

  registrarCuenta: (payload: CreateUsuarioPayload) =>
    apiRequest<Usuario>('/usuarios', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  modificarCuenta: (id: string, payload: UpdateUsuarioPayload) =>
    apiRequest<Usuario>(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  alternarEstadoCuenta: (id: string, activo: boolean) =>
    apiRequest<Usuario>(`/usuarios/${id}/estado?activo=${activo}`, {
      method: 'PATCH',
    }),
}
