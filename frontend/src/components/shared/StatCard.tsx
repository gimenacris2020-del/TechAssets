import type { LucideIcon } from 'lucide-react'
import { cn } from '@/services/utils'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  tone?: 'default' | 'success' | 'info' | 'warning' | 'destructive'
}

const toneStyles: Record<
  NonNullable<StatCardProps['tone']>,
  { iconBg: string; pill: string; accentBar: string }
> = {
  default: {
    iconBg: 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/20',
    pill: 'bg-purple-100 text-purple-800',
    accentBar: 'from-purple-600 via-violet-500 to-indigo-500',
  },
  success: {
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-900/20',
    pill: 'bg-emerald-100 text-emerald-800',
    accentBar: 'from-emerald-500 to-teal-400',
  },
  info: {
    iconBg: 'bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white shadow-md shadow-fuchsia-900/20',
    pill: 'bg-fuchsia-100 text-fuchsia-800',
    accentBar: 'from-fuchsia-500 via-purple-500 to-violet-500',
  },
  warning: {
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-amber-900/20',
    pill: 'bg-amber-100 text-amber-800',
    accentBar: 'from-amber-500 to-orange-400',
  },
  destructive: {
    iconBg: 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md shadow-rose-900/20',
    pill: 'bg-rose-100 text-rose-800',
    accentBar: 'from-rose-500 to-red-500',
  },
}

export function StatCard({ title, value, subtitle, icon: Icon, tone = 'default' }: StatCardProps) {
  const style = toneStyles[tone]

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-purple-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-950/5">
      {/* Barra vertical izquierda en gradiente */}
      <div
        className={cn(
          'pointer-events-none absolute inset-y-4 left-0 w-1.5 rounded-r-full bg-gradient-to-b',
          style.accentBar,
        )}
      />

      <div className="pl-2.5 flex flex-col justify-between gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl', style.iconBg)}>
            <Icon className="h-5 w-5" />
          </div>
          <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-bold', style.pill)}>
            {title}
          </span>
        </div>

        <div>
          <p className="text-3xl font-black tracking-tight text-foreground">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs font-medium text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  )
}
