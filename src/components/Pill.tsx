import type { CSSProperties } from 'react'

type PillColor = 'gray' | 'blue' | 'green' | 'amber' | 'red' | 'indigo'

// Maps every domain status onto a semantic colour.
const statusColor: Record<string, PillColor> = {
  // project
  concept: 'gray',
  lopend: 'blue',
  afgerond: 'green',
  gefactureerd: 'indigo',
  // quote
  verstuurd: 'blue',
  geaccepteerd: 'green',
  geweigerd: 'red',
  verlopen: 'amber',
  // invoice
  open: 'amber',
  betaald: 'green',
  'te laat': 'red',
}

const palette: Record<PillColor, { fg: string; bg: string; dot: string }> = {
  gray: { fg: '#475467', bg: '#f2f4f7', dot: '#98a2b3' },
  blue: { fg: '#175cd3', bg: '#eff8ff', dot: '#2e90fa' },
  green: { fg: '#067647', bg: '#ecfdf3', dot: '#17b26a' },
  amber: { fg: '#b54708', bg: '#fffaeb', dot: '#f79009' },
  red: { fg: '#b42318', bg: '#fef3f2', dot: '#f04438' },
  indigo: { fg: '#3538cd', bg: '#eef4ff', dot: '#6172f3' },
}

export function Pill({ status }: { status: string }) {
  const c = palette[statusColor[status] ?? 'gray']
  const style: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '2px 9px 2px 7px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 500,
    lineHeight: '18px',
    background: c.bg,
    color: c.fg,
    whiteSpace: 'nowrap',
  }
  const label = status.charAt(0).toUpperCase() + status.slice(1)
  return (
    <span style={style}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: c.dot,
          flex: 'none',
        }}
      />
      {label}
    </span>
  )
}
