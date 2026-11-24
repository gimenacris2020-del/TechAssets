import { cn } from '@/services/utils'

interface TechAssetLogoProps {
  size?: 'sm' | 'md' | 'lg'
  lightText?: boolean
  showSubtitle?: boolean
  collapsed?: boolean
  className?: string
}

export function TechAssetLogo({
  size = 'md',
  lightText = false,
  showSubtitle = true,
  collapsed = false,
  className,
}: TechAssetLogoProps) {
  const iconBox =
    size === 'lg' ? 'h-14 w-14 rounded-2xl' : size === 'sm' ? 'h-9 w-9 rounded-xl' : 'h-11 w-11 rounded-xl'
  const titleSize =
    size === 'lg' ? 'text-3xl sm:text-4xl' : size === 'sm' ? 'text-base' : 'text-xl'
  const subSize = size === 'lg' ? 'text-sm' : 'text-xs'

  return (
    <div className={cn('inline-flex items-center gap-3.5', collapsed && 'gap-0', className)}>
      <div
        className={cn(
          'relative flex shrink-0 items-center justify-center bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-700 p-2 shadow-lg shadow-purple-950/35 ring-1 ring-white/25',
          iconBox,
        )}
      >
        <svg viewBox="0 0 48 48" fill="none" className="h-full w-full">
          {/* Anillo exterior romboidal */}
          <path
            d="M24 4L42 24L24 44L6 24L24 4Z"
            stroke="white"
            strokeOpacity="0.35"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* NÃºcleo hexagonal entrelazado */}
          <path
            d="M24 9L38 17V31L24 39L10 31V17L24 9Z"
            fill="white"
            fillOpacity="0.16"
            stroke="white"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          {/* Chip interior */}
          <rect
            x="18"
            y="18"
            width="12"
            height="12"
            rx="3.5"
            fill="white"
            fillOpacity="0.92"
          />
          <circle cx="24" cy="24" r="2.8" fill="#6D28D9" />
          {/* Puntos de conexiÃ³n */}
          <circle cx="24" cy="9" r="2.3" fill="#F5D0FE" />
          <circle cx="38" cy="17" r="2.1" fill="#E9D5FF" />
          <circle cx="10" cy="17" r="2.1" fill="#E9D5FF" />
          <circle cx="24" cy="39" r="2.3" fill="#F5D0FE" />
        </svg>
      </div>

      {!collapsed && (
        <div className="leading-none">
          <div
            className={cn(
              'font-extrabold tracking-tight',
              titleSize,
              lightText ? 'text-white' : 'text-foreground',
            )}
          >
            Tech
            <span
              className={
                lightText
                  ? 'bg-gradient-to-r from-fuchsia-300 via-purple-300 to-indigo-200 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent'
              }
            >
              Asset
            </span>
          </div>
          {showSubtitle && (
            <p
              className={cn(
                'mt-1 font-medium tracking-wide',
                subSize,
                lightText ? 'text-purple-200/75' : 'text-muted-foreground',
              )}
            >
              Innovatech Solutions S.A.C.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
