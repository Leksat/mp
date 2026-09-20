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

export const RotateIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <rect x="9" y="9" width="6" height="12" rx="1.5" />
    <path d="M4 12a8 8 0 0 1 16 0" />
    <path d="M1.5 9.5 4 12l2.5-2.5" />
    <path d="M17.5 9.5 20 12l2.5-2.5" />
  </Svg>
)

export const MinusIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M5 12h14" />
  </Svg>
)

export const PlusIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M12 5v14M5 12h14" />
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

export const GearIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2.5l1.6 2.6 3-.5.6 3 2.7 1.4-1.4 2.7 1.4 2.7-2.7 1.4-.6 3-3-.5L12 21.5l-1.6-2.6-3 .5-.6-3-2.7-1.4L5.5 12 4.1 9.3l2.7-1.4.6-3 3 .5z" />
  </Svg>
)

export const LayoutTopIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <rect x="6.5" y="6.5" width="11" height="4" rx="1.5" fill="currentColor" />
  </Svg>
)

export const LayoutBottomIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <rect x="6.5" y="13.5" width="11" height="4" rx="1.5" fill="currentColor" />
  </Svg>
)

export const TrashIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M4 7h16M10 4h4M6 7l1 13h10l1-13" />
    <path d="M10 11v6M14 11v6" />
  </Svg>
)

export const DownloadIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M12 3v11" />
    <path d="M7.5 10l4.5 4.5 4.5-4.5" />
    <path d="M4.5 20h15" />
  </Svg>
)

export const ResetIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M20 12a8 8 0 11-2.3-5.6" />
    <path d="M20 4v5h-5" />
  </Svg>
)

