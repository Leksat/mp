interface IconProps {
  readonly size?: number
}

const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

const Svg = ({ size = 24, children }: IconProps & { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" {...strokeProps}>
    {children}
  </svg>
)

export const CheckIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M4 13l5 5L20 6" />
  </Svg>
)

export const CrossIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
)

export const GridIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
  </Svg>
)

export const CardIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <rect x="3" y="6" width="14" height="14" rx="2" />
    <path d="M7 3h12a2 2 0 012 2v12" />
  </Svg>
)

export const ResetIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M20 12a8 8 0 11-2.3-5.6" />
    <path d="M20 4v5h-5" />
  </Svg>
)

