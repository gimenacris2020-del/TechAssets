import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { clearStoredAuth, getStoredToken, getStoredUserRaw, setStoredAuth } from '@/services/api'
import { authService } from '@/services/authService'
import type { AuthUser, LoginRequest } from '@/services/types'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  hasRole: (...roles: string[]) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = getStoredUserRaw()
    if (!raw) return null
    try {
      return JSON.parse(raw) as AuthUser
    } catch {
      return null
    }
  })
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(getStoredToken()))

  const logout = useCallback(() => {
    clearStoredAuth()
    setUser(null)
  }, [])

  useEffect(() => {
    const token = getStoredToken()
    if (!token) {
      setIsLoading(false)
      return
    }

    authService
      .obtenerPerfilSesion()
      .then((freshUser) => {
        setUser(freshUser)
        setStoredAuth(token, JSON.stringify(freshUser))
      })
      .catch(() => {
        logout()
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [logout])

  useEffect(() => {
    const handleUnauthorized = () => logout()
    window.addEventListener('techasset:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('techasset:unauthorized', handleUnauthorized)
  }, [logout])

  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await authService.autenticarUsuario(credentials)
    setStoredAuth(response.token, JSON.stringify(response.usuario))
    setUser(response.usuario)
  }, [])

  const hasRole = useCallback(
    (...roles: string[]) => Boolean(user && roles.includes(user.rol)),
    [user],
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth debe utilizarse dentro de AuthProvider.')
  }
  return ctx
}
