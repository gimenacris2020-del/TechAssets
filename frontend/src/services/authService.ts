import type { AuthUser, LoginRequest, LoginResponse } from '@/services/types'
import { apiRequest } from './api'

export const authService = {
  autenticarUsuario: (payload: LoginRequest) =>
    apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  obtenerPerfilSesion: () => apiRequest<AuthUser>('/auth/me'),
}
