import { useState } from 'react'
import { accent, colors } from '../theme'
import { Modal } from './Modal'
import { SecondaryButton } from './ui'

const labelStyle = { fontSize: 12.5, color: colors.muted, display: 'block', marginBottom: 5, fontWeight: 500 } as const
const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: `1px solid ${colors.borderStrong}`,
  borderRadius: 9,
  fontSize: 14,
  color: colors.ink,
  background: colors.surface,
} as const

/**
 * Lets the user review and edit the e-mail (subject + message) before sending.
 * The PDF is attached automatically. `onSend` performs the actual send and
 * throws on failure; the dialog closes itself on success.
 */
export function SendEmailModal({
  title,
  to,
  defaultSubject,
  defaultMessage,
  onSend,
  onClose,
}: {
  title: string
  to: string | undefined
  defaultSubject: string
  defaultMessage: string
  onSend: (subject: string, message: string) => Promise<void>
  onClose: () => void
}) {
  const [subject, setSubject] = useState(defaultSubject)
  const [message, setMessage] = useState(defaultMessage)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const noEmail = !to

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (noEmail || busy) return
    setBusy(true)
    setError('')
    try {
      await onSend(subject.trim() || defaultSubject, message)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Versturen mislukt')
      setBusy(false)
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={submit}>
        {error && (
          <div
            style={{
              background: 'rgba(240,68,56,0.10)',
              color: colors.negative,
              border: '1px solid rgba(240,68,56,0.30)',
              borderRadius: 9,
              padding: '9px 12px',
              fontSize: 13,
              marginBottom: 14,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <span style={labelStyle}>Aan</span>
          <div
            style={{
              ...inputStyle,
              color: noEmail ? colors.negative : colors.ink,
              background: colors.rowHover,
            }}
          >
            {to || 'Deze klant heeft geen e-mailadres'}
          </div>
        </div>

        <label style={{ display: 'block', marginBottom: 14 }}>
          <span style={labelStyle}>Onderwerp</span>
          <input style={inputStyle} value={subject} onChange={(e) => setSubject(e.target.value)} />
        </label>

        <label style={{ display: 'block' }}>
          <span style={labelStyle}>Bericht</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={7}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5, fontFamily: 'inherit' }}
          />
        </label>

        <p style={{ margin: '10px 0 0', fontSize: 12.5, color: colors.subtle }}>
          De PDF wordt automatisch als bijlage meegestuurd.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
          <SecondaryButton type="button" onClick={onClose} disabled={busy}>
            Annuleren
          </SecondaryButton>
          <button
            type="submit"
            disabled={busy || noEmail}
            style={{
              padding: '10px 18px',
              background: accent.solid,
              color: '#fff',
              border: 'none',
              borderRadius: 9,
              fontSize: 14,
              fontWeight: 600,
              cursor: busy || noEmail ? 'default' : 'pointer',
              opacity: busy || noEmail ? 0.6 : 1,
            }}
          >
            {busy ? 'Versturen…' : 'Versturen'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
