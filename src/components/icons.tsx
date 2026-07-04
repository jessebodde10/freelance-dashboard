import type { SVGProps } from 'react'
import { accent } from '../theme'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function base({ size = 18, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 18 18',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    ...props,
  }
}

export const DashboardIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="2" y="2" width="5.5" height="5.5" rx="1.4" />
    <rect x="10.5" y="2" width="5.5" height="5.5" rx="1.4" />
    <rect x="2" y="10.5" width="5.5" height="5.5" rx="1.4" />
    <rect x="10.5" y="10.5" width="5.5" height="5.5" rx="1.4" />
  </svg>
)

export const OpdrachtenIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="2.5" y="5.5" width="13" height="9" rx="1.6" />
    <path d="M6.3 5.5V4.4A1.3 1.3 0 0 1 7.6 3.1h2.8a1.3 1.3 0 0 1 1.3 1.3v1.1" />
    <path d="M2.5 9.4h13" />
  </svg>
)

export const KlantenIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="6.6" cy="6" r="2.6" />
    <path d="M2.4 15c0-2.5 1.9-4 4.2-4s4.2 1.5 4.2 4" />
    <path d="M12 4.2a2.4 2.4 0 0 1 0 4.5" />
    <path d="M12.8 15c0-2.2-1-3.5-2.4-3.9" />
  </svg>
)

export const OffertesIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4.6 2.5h4.9l4 4v9a1 1 0 0 1-1 1H4.6a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1z" />
    <path d="M9.4 2.6v4h4" />
    <path d="M6.4 10.2h5.2M6.4 12.6h5.2" />
  </svg>
)

export const FacturenIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 2.6h10v12.8l-2-1.1-1.5 1.1-1.5-1.1-1.5 1.1-1.5-1.1-2 1.1z" />
    <path d="M6.4 6.4h5.2M6.4 9.2h3.4" />
  </svg>
)

export const KostenIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4.5 2.5h9v13l-1.6-1-1.4 1-1.5-1-1.5 1-1.4-1-1.6 1z" />
    <path d="M6.6 6h4.8M6.6 8.6h4.8M6.6 11.2h3" />
  </svg>
)

export const BtwIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="9" cy="9" r="6.6" />
    <path d="M6.6 11.4 11.4 6.6" />
    <circle cx="7.3" cy="7.3" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="10.7" cy="10.7" r="0.9" fill="currentColor" stroke="none" />
  </svg>
)

export const RevenueUpIcon = ({ size = 13, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    {...props}
  >
    <path d="M6 9.5V2.5M6 2.5L3 5.5M6 2.5l3 3" />
  </svg>
)

export const DownloadIcon = ({ size = 15, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}
  >
    <path d="M8 2v8M8 10L5 7M8 10l3-3M3 12v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1" />
  </svg>
)

// Small brand mark: rotated square inside an indigo rounded tile.
export function BrandMark({ size = 28 }: { size?: number }) {
  const inner = Math.round(size * 0.4)
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.29,
        background: accent.solid,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 'none',
      }}
    >
      <div
        style={{
          width: inner,
          height: inner,
          border: '2px solid #fff',
          borderRadius: 3,
          transform: 'rotate(45deg)',
        }}
      />
    </div>
  )
}
