import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronsUpDown, Search, X } from 'lucide-react'
import { cn } from '@/services/utils'

export interface ComboboxOption {
  value: string
  label: string
  description?: string
  badge?: string
  searchText?: string
}

interface ComboboxProps {
  id?: string
  options: ComboboxOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
}

export function Combobox({
  id,
  options,
  value,
  onChange,
  placeholder = 'Seleccionar una opciÃ³n...',
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'No se encontraron resultados.',
  disabled = false,
  className,
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value) ?? null,
    [options, value],
  )

  const filteredOptions = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return options
    return options.filter((opt) => {
      const haystack = `${opt.label} ${opt.description ?? ''} ${opt.badge ?? ''} ${opt.searchText ?? ''}`.toLowerCase()
      return haystack.includes(term)
    })
  }, [options, query])

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (open) {
      setTimeout(() => searchInputRef.current?.focus(), 0)
    } else {
      setQuery('')
    }
  }, [open])

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-input bg-background px-3.5 py-2 text-left text-sm shadow-xs transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
          open && 'border-primary ring-3 ring-primary/20',
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2 truncate">
          {selectedOption ? (
            <>
              {selectedOption.badge && (
                <span className="shrink-0 rounded-md bg-secondary px-2 py-0.5 font-mono text-xs font-semibold text-secondary-foreground">
                  {selectedOption.badge}
                </span>
              )}
              <span className="truncate font-medium text-foreground">{selectedOption.label}</span>
            </>
          ) : (
            <span className="truncate text-muted-foreground">{placeholder}</span>
          )}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-xl animate-in fade-in-0 zoom-in-95"
        >
          <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                aria-label="Limpiar bÃºsqueda"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto p-1.5">
            {filteredOptions.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">{emptyMessage}</p>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(opt.value)
                      setOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors cursor-pointer',
                      isSelected
                        ? 'bg-secondary/80 text-secondary-foreground font-semibold'
                        : 'hover:bg-accent hover:text-accent-foreground',
                    )}
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2">
                        {opt.badge && (
                          <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold text-foreground">
                            {opt.badge}
                          </span>
                        )}
                        <span className="truncate font-medium">{opt.label}</span>
                      </div>
                      {opt.description && (
                        <p className="truncate text-xs text-muted-foreground">{opt.description}</p>
                      )}
                    </div>
                    {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
