import { useState } from 'react'
import { useAuth } from '../auth'
import { accent, colors } from '../theme'
import type { ProfileInput } from '../types'
import { Modal } from './Modal'
import { AuthError, Field } from './AuthLayout'

const groupLabel = {
  fontSize: 11.5,
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: colors.faint,
  margin: '18px 0 10px',
} as const

export function ProfileModal({ onClose }: { onClose: () => void }) {
  const { profile, user, updateProfile } = useAuth()

  const [form, setForm] = useState<ProfileInput>({
    voornaam: profile?.voornaam ?? '',
    achternaam: profile?.achternaam ?? '',
    bedrijf: profile?.bedrijf ?? '',
    adres: profile?.adres ?? '',
    postcode: profile?.postcode ?? '',
    plaats: profile?.plaats ?? '',
    iban: profile?.iban ?? '',
    kvk: profile?.kvk ?? '',
    btw: profile?.btw ?? '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)

  const set = (key: keyof ProfileInput) => (v: string) => {
    setForm((f) => ({ ...f, [key]: v }))
    setSaved(false)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await updateProfile(form)
      setSaved(true)
      setTimeout(onClose, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Opslaan mislukt')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title="Profiel bewerken" onClose={onClose}>
      <form onSubmit={submit}>
        <AuthError message={error} />

        <p style={{ margin: '0 0 4px', fontSize: 13, color: colors.muted, lineHeight: 1.5 }}>
          Deze gegevens verschijnen als afzender op je offertes en facturen.
        </p>
        {user?.email && (
          <p style={{ margin: '2px 0 0', fontSize: 12.5, color: colors.subtle }}>
            Ingelogd als {user.email}
          </p>
        )}

        <div style={groupLabel}>Persoonlijk</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Voornaam" value={form.voornaam} onChange={set('voornaam')} />
          <Field label="Achternaam" value={form.achternaam} onChange={set('achternaam')} />
        </div>

        <div style={groupLabel}>Bedrijf</div>
        <Field label="Bedrijfsnaam" value={form.bedrijf} onChange={set('bedrijf')} />

        <div style={groupLabel}>Adres</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="Adres" value={form.adres} onChange={set('adres')} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 12 }}>
            <Field label="Postcode" value={form.postcode} onChange={set('postcode')} />
            <Field label="Plaats" value={form.plaats} onChange={set('plaats')} />
          </div>
        </div>

        <div style={groupLabel}>Zakelijk</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="IBAN" value={form.iban} onChange={set('iban')} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="KVK" value={form.kvk} onChange={set('kvk')} />
            <Field label="BTW-nummer" value={form.btw} onChange={set('btw')} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 16px',
              background: colors.surface,
              color: colors.ink,
              border: `1px solid ${colors.borderStrong}`,
              borderRadius: 9,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Annuleren
          </button>
          <button
            type="submit"
            disabled={busy}
            style={{
              padding: '10px 18px',
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
            {busy ? 'Bezig…' : saved ? 'Opgeslagen ✓' : 'Opslaan'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
