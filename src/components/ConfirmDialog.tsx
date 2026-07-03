import { useState } from 'react'
import { colors } from '../theme'
import { Modal } from './Modal'
import { SecondaryButton } from './ui'

/** Confirmation dialog for destructive actions (e.g. deleting a document). */
export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Verwijderen',
  onConfirm,
  onClose,
}: {
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void | Promise<void>
  onClose: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function confirm() {
    setBusy(true)
    setError('')
    try {
      await onConfirm()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Er ging iets mis')
      setBusy(false)
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <p style={{ margin: '0 0 20px', fontSize: 14, color: colors.text, lineHeight: 1.6 }}>{message}</p>
      {error && (
        <div
          style={{
            background: 'rgba(240,68,56,0.10)',
            color: colors.negative,
            border: '1px solid rgba(240,68,56,0.30)',
            borderRadius: 9,
            padding: '9px 12px',
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <SecondaryButton onClick={onClose} disabled={busy}>
          Annuleren
        </SecondaryButton>
        <button
          onClick={confirm}
          disabled={busy}
          style={{
            padding: '9px 16px',
            background: colors.danger,
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: busy ? 'default' : 'pointer',
            opacity: busy ? 0.7 : 1,
          }}
        >
          {busy ? 'Bezig…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
