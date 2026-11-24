import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/services/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-purple-200 bg-purple-50 text-purple-800',
        secondary: 'border-slate-200 bg-slate-100 text-slate-700',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        warning: 'border-amber-200 bg-amber-50 text-amber-800',
        info: 'border-violet-200 bg-violet-50 text-violet-800',
        destructive: 'border-rose-200 bg-rose-50 text-rose-700',
        outline: 'border-border text-foreground bg-background',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
