import type { CSSProperties, ReactNode } from 'react'
import { colors } from '../theme'
import { BrandMark } from './icons'

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  wide,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
  wide?: boolean
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.appBg,
        padding: '32px 16px',
      }}
    >
      <div style={{ width: '100%', maxWidth: wide ? 520 : 400 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BrandMark />
            <span style={{ fontWeight: 600, fontSize: 18, letterSpacing: '-0.01em' }}>Freezo</span>
          </div>
          <span style={{ fontSize: 13, color: colors.muted }}>Jouw freelance dashboard</span>
        </div>
        <div
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: 16,
            padding: 28,
            boxShadow: '0 4px 24px rgba(16,24,40,0.05)',
          }}
        >
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em' }}>{title}</h1>
          <p style={{ margin: '6px 0 22px', color: colors.muted, fontSize: 13.5 }}>{subtitle}</p>
          {children}
        </div>
        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13.5, color: colors.muted }}>{footer}</div>
      </div>
    </div>
  )
}

const labelStyle: CSSProperties = {
  fontSize: 12.5,
  color: colors.muted,
  display: 'block',
  marginBottom: 5,
  fontWeight: 500,
}
const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: `1px solid ${colors.borderStrong}`,
  borderRadius: 9,
  fontSize: 14,
  color: colors.ink,
  background: colors.surface,
}

export function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  autoComplete,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  required?: boolean
  autoComplete?: string
}) {
  return (
    <label style={{ display: 'block' }}>
      <span style={labelStyle}>
        {label}
        {required && <span style={{ color: colors.negative }}> *</span>}
      </span>
      <input
        style={inputStyle}
        value={value}
        type={type}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

export function AuthError({ message }: { message: string }) {
  if (!message) return null
  return (
    <div
      style={{
        background: '#fef3f2',
        color: colors.negative,
        border: '1px solid #fecdca',
        borderRadius: 9,
        padding: '9px 12px',
        fontSize: 13,
        marginBottom: 14,
      }}
    >
      {message}
    </div>
  )
}
