import { useState } from 'react'
import { useStore } from '../store'
import { accent, colors } from '../theme'
import type { Project } from '../types'
import { Modal } from './Modal'
import { AuthError, Field } from './AuthLayout'

export function NewProjectModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated?: (p: Project) => void
}) {
  const { addProject, clients } = useStore()
  const [naam, setNaam] = useState('')
  const [klantId, setKlantId] = useState(clients[0]?.id ?? '')
  const [deadline, setDeadline] = useState('')
  const [raming, setRaming] = useState('0')
  const [tarief, setTarief] = useState('0')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!naam.trim()) {
      setError('Geef de opdracht een naam.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const created = await addProject({
        naam: naam.trim(),
        klantId,
        status: 'concept',
        deadline,
        uren: 0,
        raming: parseFloat(raming) || 0,
        tarief: parseFloat(tarief) || 0,
        offerteId: '',
      })
      onCreated?.(created)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Opslaan mislukt')
    } finally {
      setBusy(false)
    }
  }

  const selectStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d3d7de',
    borderRadius: 9,
    fontSize: 14,
    color: colors.ink,
    background: '#fff',
  } as const
  const labelStyle = { fontSize: 12.5, color: colors.muted, display: 'block', marginBottom: 5, fontWeight: 500 } as const

  return (
    <Modal title="Nieuwe opdracht" onClose={onClose}>
      {clients.length === 0 ? (
        <p style={{ margin: 0, color: colors.text, fontSize: 14, lineHeight: 1.6 }}>
          Voeg eerst een klant toe voordat je een opdracht aanmaakt.
        </p>
      ) : (
        <form onSubmit={submit}>
          <AuthError message={error} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Naam van de opdracht" value={naam} onChange={setNaam} required />
            <label style={{ display: 'block' }}>
              <span style={labelStyle}>Klant</span>
              <select value={klantId} onChange={(e) => setKlantId(e.target.value)} style={selectStyle}>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.bedrijf}
                  </option>
                ))}
              </select>
            </label>
            <Field label="Deadline" value={deadline} onChange={setDeadline} placeholder="bv. 12 jul" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Uren geraamd" type="number" value={raming} onChange={setRaming} />
              <Field label="Uurtarief (€)" type="number" value={tarief} onChange={setTarief} />
            </div>
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
            {busy ? 'Bezig…' : 'Opdracht opslaan'}
          </button>
        </form>
      )}
    </Modal>
  )
}
