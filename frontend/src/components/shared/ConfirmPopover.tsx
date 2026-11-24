import { useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface ConfirmPopoverProps {
  title: string
  description: string
  confirmLabel?: string
  confirmVariant?: 'default' | 'destructive'
  tooltip?: string
  onConfirm: () => Promise<void> | void
  children: ReactNode
}

export function ConfirmPopover({
  title,
  description,
  confirmLabel = 'Confirmar',
  confirmVariant = 'default',
  tooltip,
  onConfirm,
  children,
}: ConfirmPopoverProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      setOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {tooltip ? (
        <Tooltip>
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
          </PopoverTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      ) : (
        <PopoverTrigger asChild>{children}</PopoverTrigger>
      )}
      <PopoverContent align="end" className="w-72 space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-bold text-foreground">{title}</p>
          <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            variant={confirmVariant}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Procesando...' : confirmLabel}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
