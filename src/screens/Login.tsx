import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { accent } from '../theme'
import { AuthError, AuthLayout, Field } from '../components/AuthLayout'

export function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await signIn(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Inloggen mislukt')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      title="Inloggen"
      subtitle="Welkom terug. Log in op je Freezo-account."
      footer={
        <>
          Nog geen account?{' '}
          <Link to="/register" style={{ color: accent.ink, fontWeight: 500 }}>
            Registreren
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit}>
        <AuthError message={error} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="E-mailadres" type="email" value={email} onChange={setEmail} required autoComplete="email" />
          <Field
            label="Wachtwoord"
            type="password"
            value={password}
            onChange={setPassword}
            required
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          style={{
            marginTop: 20,
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
          {busy ? 'Bezig…' : 'Inloggen'}
        </button>
      </form>
    </AuthLayout>
  )
}
