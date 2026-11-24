import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'
import { cn } from '@/services/utils'

type ToastVariant = 'success' | 'error'

interface ToastItem {
  id: number
  title: string
  description?: string
  variant: ToastVariant
}

interface ToastContextValue {
  toast: (options: Omit<ToastItem, 'id'>) => void
  showSuccess: (title: string, description?: string) => void
  showError: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (options: Omit<ToastItem, 'id'>) => {
      const id = Date.now() + Math.floor(Math.random() * 1000)
      setToasts((prev) => [...prev, { ...options, id }])
      setTimeout(() => remove(id), 4500)
    },
    [remove],
  )

  const showSuccess = useCallback(
    (title: string, description?: string) => toast({ title, description, variant: 'success' }),
    [toast],
  )

  const showError = useCallback(
    (title: string, description?: string) => toast({ title, description, variant: 'error' }),
    [toast],
  )

  return (
    <ToastContext.Provider value={{ toast, showSuccess, showError }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={cn(
              'flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all',
              item.variant === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                : 'border-red-200 bg-red-50 text-red-950',
            )}
          >
            {item.variant === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            )}
            <div className="flex-1 text-sm">
              <p className="font-semibold">{item.title}</p>
              {item.description && <p className="mt-0.5 opacity-90">{item.description}</p>}
            </div>
            <button
              type="button"
              onClick={() => remove(item.id)}
              className="rounded p-1 opacity-60 hover:opacity-100"
              aria-label="Cerrar notificación"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast debe utilizarse dentro de ToastProvider.')
  }
  return ctx
}
