const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5065/api'

const TOKEN_STORAGE_KEY = 'techasset_token'
const USER_STORAGE_KEY = 'techasset_user'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setStoredAuth(token: string, userJson: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
  localStorage.setItem(USER_STORAGE_KEY, userJson)
}

export function clearStoredAuth(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
}

export function getStoredUserRaw(): string | null {
  return localStorage.getItem(USER_STORAGE_KEY)
}

export function buildQueryString(params: Record<string, string | boolean | number | undefined | null>): string {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  }
  const qs = searchParams.toString()
  return qs ? `?${qs}` : ''
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken()
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    let errorMessage = data?.message || 'Error en la comunicación con el servidor.'

    // Extraer primer mensaje cuando ASP.NET devuelve ValidationProblemDetails
    if (data?.errors && typeof data.errors === 'object') {
      const firstErrors = Object.values(data.errors).flat()
      if (firstErrors.length > 0 && typeof firstErrors[0] === 'string') {
        errorMessage = firstErrors[0]
      }
    }

    if (response.status === 401 && path !== '/auth/login') {
      clearStoredAuth()
      window.dispatchEvent(new Event('techasset:unauthorized'))
    }

    throw new ApiError(errorMessage, response.status)
  }

  return data as T
}
