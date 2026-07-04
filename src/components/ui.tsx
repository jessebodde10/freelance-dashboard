import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'
import { accent, colors } from '../theme'
import type { SaveState } from '../store'
import { useTheme } from '../hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Schakel naar lichte modus' : 'Schakel naar donkere modus'}
      title={dark ? 'Lichte modus' : 'Donkere modus'}
      style={{
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        color: colors.subtle,
        padding: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 'none',
      }}
    >
      {dark ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}

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
        background: colors.surface,
        color: colors.ink,
        border: `1px solid ${colors.borderStrong}`,
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

export function Skeleton({
  width = '100%',
  height = 16,
  radius = 8,
  style,
}: {
  width?: number | string
  height?: number | string
  radius?: number
  style?: CSSProperties
}) {
  return <div className="skeleton" style={{ width, height, borderRadius: radius, ...style }} />
}

/** Generic screen placeholder shown while the user's data loads. */
export function LoadingSkeleton() {
  return (
    <div aria-busy="true" aria-label="Laden">
      <Skeleton width={220} height={26} style={{ marginBottom: 22 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 16 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 14, padding: 18 }}
          >
            <Skeleton width="60%" height={12} style={{ marginBottom: 14 }} />
            <Skeleton width="45%" height={22} />
          </div>
        ))}
      </div>
      <div
        style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 14, padding: 18 }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0' }}>
            <Skeleton width="40%" height={14} />
            <Skeleton width={70} height={14} style={{ marginLeft: 'auto' }} />
            <Skeleton width={90} height={14} />
          </div>
        ))}
      </div>
    </div>
  )
}

/** Subtle autosave status shown in editor headers. */
export function SaveIndicator({ state }: { state: SaveState }) {
  if (state === 'idle') return null
  const saving = state === 'saving'
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12.5,
        color: saving ? colors.subtle : colors.positive,
        fontWeight: 500,
      }}
    >
      {saving ? (
        <svg width="13" height="13" viewBox="0 0 24 24" className="spin" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 3a9 9 0 1 0 9 9" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M4 10.5l3.5 3.5L16 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {saving ? 'Opslaan…' : 'Opgeslagen'}
    </span>
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
          border: `1px solid ${colors.borderStrong}`,
          borderRadius: 8,
          fontSize: 13.5,
          color: colors.ink,
          background: colors.surface,
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
    border: `1px solid ${colors.border}`,
    background: colors.surface,
    color: colors.text,
    cursor: 'pointer',
  }
  const active: CSSProperties = {
    ...idle,
    background: accent.solid,
    color: '#fff',
    border: `1px solid ${accent.solid}`,
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
