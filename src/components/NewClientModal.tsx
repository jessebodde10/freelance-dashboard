import { useState } from 'react'
import { useStore } from '../store'
import { accent } from '../theme'
import type { Client } from '../types'
import { Modal } from './Modal'
import { AuthError, Field } from './AuthLayout'

export function NewClientModal({
  client,
  onClose,
  onCreated,
}: {
  client?: Client
  onClose: () => void
  onCreated?: (c: Client) => void
}) {
  const { addClient, updateClient } = useStore()
  const isEdit = !!client
  const [bedrijf, setBedrijf] = useState(client?.bedrijf ?? '')
  const [contact, setContact] = useState(client?.contact ?? '')
  const [email, setEmail] = useState(client?.email ?? '')
  const [plaats, setPlaats] = useState(client?.plaats ?? '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!bedrijf.trim()) {
      setError('Bedrijfsnaam is verplicht.')
      return
    }
    setBusy(true)
    setError('')
    try {
      if (isEdit) {
        await updateClient({ ...client, bedrijf: bedrijf.trim(), contact, email, plaats })
      } else {
        const created = await addClient({ bedrijf: bedrijf.trim(), contact, email, plaats })
        onCreated?.(created)
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Opslaan mislukt')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title={isEdit ? 'Klantgegevens bewerken' : 'Nieuwe klant'} onClose={onClose}>
      <form onSubmit={submit}>
        <AuthError message={error} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Bedrijfsnaam" value={bedrijf} onChange={setBedrijf} required />
          <Field label="Contactpersoon" value={contact} onChange={setContact} />
          <Field label="E-mailadres" type="email" value={email} onChange={setEmail} />
          <Field label="Plaats" value={plaats} onChange={setPlaats} />
        </div>
        <button
          type="submit"
          disabled={busy}
          style={{
            marginTop: 20,
            width: '100%',
            padding: 11,
            background: accent.solid,
            color: '#fff',
            border: 'none',
            borderRadius: 9,
            fontSize: 14,
            fontWeight: 600,
            cursor: busy ? 'default' : 'pointer',
            opacity: busy ? 0.7 : 1,
          }}
        >
          {busy ? 'Bezig…' : isEdit ? 'Wijzigingen opslaan' : 'Klant opslaan'}
        </button>
      </form>
    </Modal>
  )
}
