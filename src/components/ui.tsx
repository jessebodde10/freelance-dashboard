import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'
import { accent, colors } from '../theme'

export function Card({
  children,
  style,
  onClick,
  hoverable,
}: {
  children: ReactNode
  style?: CSSProperties
  onClick?: () => void
  hoverable?: boolean
}) {
  return (
    <div
      onClick={onClick}
      className={hoverable ? 'card-hoverable' : undefined}
      style={{
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 14,
        ...(onClick ? { cursor: 'pointer' } : null),
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function PrimaryButton({
  children,
  style,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: '9px 15px',
        background: accent.solid,
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

export function SecondaryButton({
  children,
  style,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: '9px 14px',
        background: '#fff',
        color: colors.ink,
        border: '1px solid #d3d7de',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 500,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

export function PageHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 22,
      }}
    >
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em' }}>
        {title}
      </h1>
      {actions}
    </div>
  )
}

export function BackLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        color: colors.muted,
        fontSize: 13.5,
        cursor: 'pointer',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 16,
      }}
    >
      ← {label}
    </button>
  )
}

export function SearchField({
  value,
  onChange,
  placeholder = 'Zoeken…',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 340, marginBottom: 16 }}>
      <svg
        width="15"
        height="15"
        viewBox="0 0 16 16"
        fill="none"
        stroke={colors.subtle}
        strokeWidth="1.6"
        style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
      >
        <circle cx="7" cy="7" r="5" />
        <path d="M11 11l3.5 3.5" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 12px 8px 34px',
          border: '1px solid #d3d7de',
          borderRadius: 8,
          fontSize: 13.5,
          color: colors.ink,
          background: '#fff',
        }}
      />
    </div>
  )
}

export interface FilterOption {
  key: string
  label: string
}

export function FilterChips({
  options,
  value,
  onChange,
}: {
  options: FilterOption[]
  value: string
  onChange: (key: string) => void
}) {
  const idle: CSSProperties = {
    padding: '6px 13px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    border: '1px solid #e2e5ea',
    background: '#fff',
    color: colors.text,
    cursor: 'pointer',
  }
  const active: CSSProperties = {
    ...idle,
    background: colors.ink,
    color: '#fff',
    border: `1px solid ${colors.ink}`,
  }
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
      {options.map((o) => (
        <button
          key={o.key}
          style={value === o.key ? active : idle}
          onClick={() => onChange(o.key)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
