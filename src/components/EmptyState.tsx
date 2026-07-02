import type { ReactNode } from 'react'
import { colors } from '../theme'

/** Consistent empty-list placeholder used across screens. */
export function EmptyState({
  title,
  hint,
  action,
  compact,
}: {
  title: string
  hint?: string
  action?: ReactNode
  compact?: boolean
}) {
  return (
    <div
      style={{
        border: `1px dashed ${colors.borderStrong}`,
        borderRadius: 14,
        background: colors.surface,
        padding: compact ? '28px 20px' : '48px 24px',
        textAlign: 'center',
        color: colors.muted,
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 15, color: colors.ink }}>{title}</div>
      {hint && <div style={{ fontSize: 13.5, marginTop: 6, maxWidth: 360, marginInline: 'auto' }}>{hint}</div>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  )
}
