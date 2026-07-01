import { colors } from '../theme'
import { AuthLayout } from '../components/AuthLayout'

/** Shown when the Supabase env vars are missing, so the app never renders a
 *  broken auth form against a null client. */
export function SetupNeeded() {
  const code = {
    background: '#f6f7f9',
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 12.5,
    fontFamily: "'Geist Mono', ui-monospace, monospace",
    whiteSpace: 'pre-wrap' as const,
    color: colors.text,
    marginTop: 10,
  }
  return (
    <AuthLayout
      wide
      title="Supabase instellen"
      subtitle="De app heeft een Supabase-project nodig voor accounts en opslag."
      footer={<span>Herstart de dev-server nadat je .env hebt ingevuld.</span>}
    >
      <ol style={{ margin: 0, paddingLeft: 18, color: colors.text, fontSize: 13.5, lineHeight: 1.7 }}>
        <li>Maak een gratis project op supabase.com.</li>
        <li>Draai <code>supabase/schema.sql</code> in de SQL-editor.</li>
        <li>Kopieer <code>.env.example</code> naar <code>.env</code> en vul in:</li>
      </ol>
      <div style={code}>VITE_SUPABASE_URL=https://JOUW-PROJECT.supabase.co{'\n'}VITE_SUPABASE_ANON_KEY=JOUW-ANON-KEY</div>
    </AuthLayout>
  )
}
