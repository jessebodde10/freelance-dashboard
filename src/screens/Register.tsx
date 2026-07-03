import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { accent, colors } from '../theme'
import { AuthError, AuthLayout, Field } from '../components/AuthLayout'
import type { ProfileInput } from '../types'

const emptyProfile: ProfileInput = {
  voornaam: '',
  achternaam: '',
  bedrijf: '',
  adres: '',
  postcode: '',
  plaats: '',
  telefoon: '',
  website: '',
  iban: '',
  kvk: '',
  btw: '',
}

export function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [profile, setProfile] = useState<ProfileInput>(emptyProfile)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<string | null>(null)

  const set = (k: keyof ProfileInput) => (v: string) => setProfile((p) => ({ ...p, [k]: v }))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Kies een wachtwoord van minimaal 6 tekens.')
      return
    }
    setBusy(true)
    try {
      const { needsConfirmation } = await signUp(email, password, profile)
      if (needsConfirmation) {
        setDone('We hebben je een bevestigingsmail gestuurd. Bevestig je adres en log daarna in.')
      } else {
        navigate('/', { replace: true })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registreren mislukt')
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <AuthLayout
        title="Bijna klaar"
        subtitle="Je account is aangemaakt."
        footer={
          <Link to="/login" style={{ color: accent.ink, fontWeight: 500 }}>
            Naar inloggen
          </Link>
        }
      >
        <p style={{ margin: 0, fontSize: 14, color: colors.text, lineHeight: 1.6 }}>{done}</p>
      </AuthLayout>
    )
  }

  const groupTitle = {
    fontSize: 11.5,
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: colors.faint,
    margin: '22px 0 12px',
  } as const

  return (
    <AuthLayout
      wide
      title="Account aanmaken"
      subtitle="Deze gegevens verschijnen als afzender op je offertes en facturen."
      footer={
        <>
          Heb je al een account?{' '}
          <Link to="/login" style={{ color: accent.ink, fontWeight: 500 }}>
            Inloggen
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit}>
        <AuthError message={error} />

        <div style={groupTitle}>Inloggegevens</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="E-mailadres" type="email" value={email} onChange={setEmail} required autoComplete="email" />
          <Field
            label="Wachtwoord"
            type="password"
            value={password}
            onChange={setPassword}
            required
            autoComplete="new-password"
            placeholder="Minimaal 6 tekens"
          />
        </div>

        <div style={groupTitle}>Naam &amp; bedrijf</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Voornaam" value={profile.voornaam} onChange={set('voornaam')} required />
          <Field label="Achternaam" value={profile.achternaam} onChange={set('achternaam')} required />
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Bedrijfsnaam" value={profile.bedrijf} onChange={set('bedrijf')} placeholder="Optioneel" />
          </div>
        </div>

        <div style={groupTitle}>Adres</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Straat en huisnummer" value={profile.adres} onChange={set('adres')} />
          </div>
          <Field label="Postcode" value={profile.postcode} onChange={set('postcode')} />
          <Field label="Plaats" value={profile.plaats} onChange={set('plaats')} />
        </div>

        <div style={groupTitle}>Contact</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Telefoon" value={profile.telefoon} onChange={set('telefoon')} placeholder="Optioneel" />
          <Field label="Website" value={profile.website} onChange={set('website')} placeholder="Optioneel" />
        </div>

        <div style={groupTitle}>Zakelijke gegevens</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="IBAN" value={profile.iban} onChange={set('iban')} placeholder="NL.. INGB ...." />
          </div>
          <Field label="KVK-nummer" value={profile.kvk} onChange={set('kvk')} />
          <Field label="BTW-nummer" value={profile.btw} onChange={set('btw')} placeholder="NL...B01" />
        </div>

        <button
          type="submit"
          disabled={busy}
          style={{
            marginTop: 24,
            width: '100%',
            padding: '11px',
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
          {busy ? 'Bezig…' : 'Account aanmaken'}
        </button>
      </form>
    </AuthLayout>
  )
}
