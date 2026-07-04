import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { accent, colors } from '../theme'
import { useIsMobile } from '../hooks/useIsMobile'
import { euro0 } from '../format'
import { requireSupabase } from '../lib/supabase'
import { BrandMark, FacturenIcon, KlantenIcon, OpdrachtenIcon, OffertesIcon } from '../components/icons'
import { Card } from '../components/ui'
import { Modal } from '../components/Modal'
import { Field, AuthError, labelStyle, inputStyle } from '../components/AuthLayout'

function LockIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3.5" y="8" width="11" height="7" rx="1.6" />
      <path d="M5.8 8V5.6a3.2 3.2 0 0 1 6.4 0V8" />
    </svg>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease', flex: 'none' }}
    >
      <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Staggered fade-up entrance for hero content; --fade-delay drives the
 *  per-element CSS animation-delay (see .hero-fade-up in index.css), which
 *  also carries the prefers-reduced-motion override. */
function fadeStyle(delaySeconds: number): CSSProperties {
  return { '--fade-delay': `${delaySeconds}s` } as CSSProperties
}

/** Link styled like the app's buttons (PrimaryButton/SecondaryButton render
 *  <button>, which can't carry routing semantics as cleanly as an anchor). */
function HeroLink({
  to,
  variant = 'primary',
  children,
}: {
  to: string
  variant?: 'primary' | 'secondary'
  children: ReactNode
}) {
  const primary = variant === 'primary'
  return (
    <Link
      to={to}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '13px 26px',
        borderRadius: 11,
        fontSize: 15.5,
        fontWeight: 600,
        textDecoration: 'none',
        background: primary ? accent.solid : colors.surface,
        color: primary ? '#fff' : colors.ink,
        border: primary ? 'none' : `1px solid ${colors.borderStrong}`,
      }}
    >
      {children}
    </Link>
  )
}

function MarketingHeader({ isMobile }: { isMobile: boolean }) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: 1080,
        margin: '0 auto',
        padding: isMobile ? '18px 20px' : '22px 32px',
      }}
    >
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <BrandMark size={30} />
        <span style={{ fontWeight: 700, fontSize: 19, letterSpacing: '-0.01em', color: colors.ink }}>
          Freezo
        </span>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 18 }}>
        {!isMobile && (
          <Link to="/login" style={{ fontSize: 14.5, fontWeight: 500, color: colors.text, textDecoration: 'none' }}>
            Inloggen
          </Link>
        )}
        <HeroLink to="/register">{isMobile ? 'Registreren' : 'Gratis registreren'}</HeroLink>
      </div>
    </header>
  )
}

function Hero({ isMobile }: { isMobile: boolean }) {
  return (
    <section
      style={{
        maxWidth: 1080,
        margin: '0 auto',
        padding: isMobile ? '32px 20px 12px' : '56px 32px 24px',
        textAlign: 'center',
      }}
    >
      <div
        className="hero-fade-up"
        style={{
          ...fadeStyle(0),
          fontSize: 13,
          fontWeight: 600,
          color: colors.subtle,
          marginBottom: 10,
        }}
      >
        Jouw freelance dashboard
      </div>
      <div
        className="hero-fade-up"
        style={{
          ...fadeStyle(0.08),
          display: 'inline-block',
          fontSize: 13,
          fontWeight: 600,
          color: accent.ink,
          background: accent.soft,
          padding: '5px 14px',
          borderRadius: 999,
          marginBottom: 20,
        }}
      >
        Voor zelfstandig ondernemers
      </div>
      <h1
        className="hero-fade-up"
        style={{
          ...fadeStyle(0.16),
          margin: 0,
          fontSize: isMobile ? 34 : 58,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          lineHeight: 1.08,
          color: colors.ink,
        }}
      >
        Offertes, facturen en uren.
        <br />
        Eén overzicht.
      </h1>
      <p
        className="hero-fade-up"
        style={{
          ...fadeStyle(0.24),
          margin: isMobile ? '18px auto 0' : '22px auto 0',
          maxWidth: 560,
          fontSize: isMobile ? 15.5 : 18,
          lineHeight: 1.6,
          color: colors.muted,
        }}
      >
        Freezo is het dashboard voor zzp&apos;ers: verstuur offertes en facturen per
        e-mail, houd uren per opdracht bij en zie in één oogopslag wat je nog
        moet ontvangen.
      </p>
      <div
        className="hero-fade-up"
        style={{
          ...fadeStyle(0.32),
          display: 'flex',
          justifyContent: 'center',
          gap: 12,
          marginTop: isMobile ? 26 : 32,
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center',
        }}
      >
        <HeroLink to="/register">Gratis registreren</HeroLink>
        <HeroLink to="/login" variant="secondary">
          Inloggen
        </HeroLink>
      </div>
    </section>
  )
}

function MiniBar({
  h,
  active,
  grown,
  delay = 0,
}: {
  h: string
  active?: boolean
  grown: boolean
  delay?: number
}) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', height: '100%' }}>
      <div
        className="mini-bar-fill"
        style={{
          ...({ '--bar-delay': `${delay}s` } as CSSProperties),
          width: '100%',
          height: grown ? h : '0%',
          borderRadius: '4px 4px 0 0',
          background: active ? accent.solid : colors.border,
        }}
      />
    </div>
  )
}

function DashboardPreview({ isMobile }: { isMobile: boolean }) {
  const [grown, setGrown] = useState(false)
  useEffect(() => {
    // Double rAF so the bars reliably paint at 0% before flipping to their
    // target height, letting the CSS transition (see .mini-bar-fill) animate.
    let id2 = 0
    const id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => setGrown(true))
    })
    return () => {
      cancelAnimationFrame(id1)
      cancelAnimationFrame(id2)
    }
  }, [])
  return (
    <section style={{ maxWidth: 880, margin: '0 auto', padding: isMobile ? '20px 20px 8px' : '20px 32px 8px' }}>
      <Card
        style={{
          padding: isMobile ? 18 : 26,
          transform: isMobile ? 'none' : 'rotate(-0.6deg)',
          boxShadow: '0 20px 50px rgba(16,24,40,0.10)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
            gap: isMobile ? 10 : 14,
            marginBottom: isMobile ? 14 : 18,
          }}
        >
          <div style={{ padding: isMobile ? 12 : 14, background: colors.rowHover, borderRadius: 10 }}>
            <div style={{ fontSize: 12, color: colors.muted }}>Omzet deze maand</div>
            <div className="num" style={{ fontSize: isMobile ? 18 : 21, fontWeight: 600, marginTop: 4 }}>
              {euro0(4250)}
            </div>
          </div>
          <div style={{ padding: isMobile ? 12 : 14, background: colors.rowHover, borderRadius: 10 }}>
            <div style={{ fontSize: 12, color: colors.muted }}>Openstaand</div>
            <div className="num" style={{ fontSize: isMobile ? 18 : 21, fontWeight: 600, marginTop: 4 }}>
              {euro0(1180)}
            </div>
          </div>
          <div
            style={{
              padding: isMobile ? 12 : 14,
              background: colors.rowHover,
              borderRadius: 10,
              gridColumn: isMobile ? '1 / -1' : 'auto',
            }}
          >
            <div style={{ fontSize: 12, color: colors.muted }}>Actieve opdrachten</div>
            <div className="num" style={{ fontSize: isMobile ? 18 : 21, fontWeight: 600, marginTop: 4 }}>
              3
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: isMobile ? 60 : 76 }}>
          <MiniBar h="35%" grown={grown} delay={0} />
          <MiniBar h="50%" grown={grown} delay={0.06} />
          <MiniBar h="42%" grown={grown} delay={0.12} />
          <MiniBar h="65%" grown={grown} delay={0.18} />
          <MiniBar h="58%" grown={grown} delay={0.24} />
          <MiniBar h="100%" grown={grown} delay={0.3} active />
        </div>
      </Card>
    </section>
  )
}

function HowItWorks({ isMobile }: { isMobile: boolean }) {
  const steps = [
    {
      title: 'Registreer',
      text: 'Maak een gratis account met je bedrijfsgegevens. Je bent binnen een minuut klaar.',
    },
    {
      title: 'Voeg een klant toe',
      text: 'Zet de gegevens van je eerste klant klaar, zodat je meteen kunt koppelen.',
    },
    {
      title: 'Verstuur je eerste offerte',
      text: 'Stel de regels en BTW samen en verstuur de offerte direct per e-mail met de PDF als bijlage.',
    },
  ]
  return (
    <section style={{ maxWidth: 1080, margin: '0 auto', padding: isMobile ? '48px 20px' : '72px 32px' }}>
      <h2
        style={{
          textAlign: 'center',
          margin: '0 0 36px',
          fontSize: isMobile ? 26 : 32,
          fontWeight: 700,
          letterSpacing: '-0.01em',
          color: colors.ink,
        }}
      >
        Hoe het werkt
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: isMobile ? 24 : 20,
        }}
      >
        {steps.map((s, i) => (
          <div key={s.title}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: accent.soft,
                color: accent.ink,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 14.5,
                marginBottom: 14,
              }}
            >
              {i + 1}
            </div>
            <div style={{ fontWeight: 600, fontSize: 15.5, marginBottom: 6, color: colors.ink }}>{s.title}</div>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: colors.muted }}>{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: ReactNode
  title: string
  text: string
}) {
  return (
    <Card style={{ padding: 22 }}>
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: accent.soft,
          color: accent.ink,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 14,
        }}
      >
        {icon}
      </div>
      <div style={{ fontWeight: 600, fontSize: 15.5, marginBottom: 6, color: colors.ink }}>{title}</div>
      <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: colors.muted }}>{text}</p>
    </Card>
  )
}

function Features({ isMobile }: { isMobile: boolean }) {
  return (
    <section style={{ maxWidth: 1080, margin: '0 auto', padding: isMobile ? '48px 20px' : '80px 32px' }}>
      <h2
        style={{
          textAlign: 'center',
          margin: '0 0 36px',
          fontSize: isMobile ? 26 : 32,
          fontWeight: 700,
          letterSpacing: '-0.01em',
          color: colors.ink,
        }}
      >
        Alles wat je nodig hebt als zzp&apos;er
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 16,
        }}
      >
        <FeatureCard
          icon={<OffertesIcon size={19} />}
          title="Offertes"
          text="Regels met BTW-groepen, live PDF-preview en in één klik per e-mail versturen met de PDF als bijlage."
        />
        <FeatureCard
          icon={<FacturenIcon size={19} />}
          title="Facturen"
          text="Vervaldatum en status bijhouden, PDF-export, en versturen zodra een klant moet betalen."
        />
        <FeatureCard
          icon={<OpdrachtenIcon size={19} />}
          title="Opdrachten"
          text="Uren registreren per opdracht, koppelen aan een offerte en met één knop factureren wat je hebt gewerkt."
        />
        <FeatureCard
          icon={<KlantenIcon size={19} />}
          title="Klanten"
          text="De volledige historie per klant: opdrachten, offertes, facturen en wat er nog openstaat."
        />
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          justifyContent: 'center',
        }}
      >
        {['Snelzoeken met ⌘K', 'Donkere modus', 'Werkt op elk scherm'].map(
          (t) => (
            <span
              key={t}
              style={{
                fontSize: 13,
                color: colors.text,
                background: colors.rowHover,
                border: `1px solid ${colors.border}`,
                borderRadius: 999,
                padding: '7px 14px',
              }}
            >
              {t}
            </span>
          ),
        )}
      </div>
    </section>
  )
}

function PrivacyTrust({ isMobile }: { isMobile: boolean }) {
  return (
    <section style={{ maxWidth: 880, margin: '0 auto', padding: isMobile ? '8px 20px 48px' : '8px 32px 72px' }}>
      <Card
        style={{
          padding: isMobile ? 22 : 30,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 16 : 24,
          alignItems: isMobile ? 'flex-start' : 'center',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: accent.soft,
            color: accent.ink,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 'none',
          }}
        >
          <LockIcon size={22} />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 6, color: colors.ink }}>
            Jouw data blijft van jou
          </div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: colors.muted }}>
            Freezo start met een leeg account, zonder nepdata of demo-cijfers.
            Alles wat je invoert (klanten, offertes, facturen) wordt via Supabase
            beveiligd opgeslagen met row-level security, zodat alleen jij toegang
            hebt tot jouw gegevens.
          </p>
        </div>
      </Card>
    </section>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: `1px solid ${colors.border}` }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '18px 2px',
          background: 'none',
          border: 'none',
          textAlign: 'left',
          cursor: 'pointer',
          fontWeight: 500,
          fontSize: 15,
          color: colors.ink,
        }}
      >
        {question}
        <ChevronIcon open={open} />
      </button>
      {open && (
        <p style={{ margin: '0 2px 18px', fontSize: 13.5, lineHeight: 1.65, color: colors.muted }}>{answer}</p>
      )}
    </div>
  )
}

function Faq({ isMobile }: { isMobile: boolean }) {
  const items = [
    {
      question: 'Is Freezo gratis?',
      answer: 'Registreren is gratis. Zo kun je Freezo meteen uitproberen met je eigen klanten, offertes en facturen.',
    },
    {
      question: 'Is mijn data veilig?',
      answer:
        'Ja. Elk account is privé en je gegevens worden beveiligd opgeslagen met row-level security, zodat niemand anders erbij kan.',
    },
    {
      question: 'Kan ik offertes en facturen automatisch mailen naar klanten?',
      answer:
        'Ja, je stelt een offerte of factuur samen en verstuurt die direct per e-mail met de PDF als bijlage, vanuit het dashboard.',
    },
    {
      question: 'Werkt Freezo ook op mijn telefoon?',
      answer: 'Ja, het dashboard is volledig responsive en werkt net zo goed op mobiel als op desktop.',
    },
    {
      question: 'Heb ik nog steeds een boekhouder nodig?',
      answer:
        'Freezo helpt je met offertes, facturen en urenregistratie, maar vervangt geen boekhoudkundig advies. Het maakt je administratie wel een stuk overzichtelijker.',
    },
  ]
  return (
    <section style={{ maxWidth: 720, margin: '0 auto', padding: isMobile ? '0 20px 48px' : '0 32px 72px' }}>
      <h2
        style={{
          textAlign: 'center',
          margin: '0 0 28px',
          fontSize: isMobile ? 26 : 32,
          fontWeight: 700,
          letterSpacing: '-0.01em',
          color: colors.ink,
        }}
      >
        Veelgestelde vragen
      </h2>
      <div style={{ borderTop: `1px solid ${colors.border}` }}>
        {items.map((it) => (
          <FaqItem key={it.question} question={it.question} answer={it.answer} />
        ))}
      </div>
    </section>
  )
}

function ClosingCTA({ isMobile }: { isMobile: boolean }) {
  return (
    <section style={{ background: accent.soft }}>
      <div
        style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: isMobile ? '48px 20px' : '72px 32px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            margin: '0 0 12px',
            fontSize: isMobile ? 26 : 34,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: colors.ink,
          }}
        >
          Begin vandaag nog
        </h2>
        <p style={{ margin: '0 0 26px', fontSize: 15.5, color: colors.muted }}>
          Maak een gratis account en stuur je eerste offerte binnen een minuut.
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 12,
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
          }}
        >
          <HeroLink to="/register">Gratis registreren</HeroLink>
          <HeroLink to="/login" variant="secondary">
            Inloggen
          </HeroLink>
        </div>
      </div>
    </section>
  )
}

// Overridable edge-function slug, same pattern as send-quote/send-invoice —
// the Supabase dashboard sometimes auto-generates a different URL slug.
const SEND_CONTACT_FN = (import.meta.env.VITE_SEND_CONTACT_FN as string | undefined) || 'send-contact'

function ContactModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const { error: fnError } = await requireSupabase().functions.invoke(SEND_CONTACT_FN, {
        body: { name, email, message },
      })
      if (fnError) {
        let msg = fnError.message
        try {
          const body = await (fnError as { context?: Response }).context?.json?.()
          if (body?.error) msg = body.error
        } catch {
          /* keep default message */
        }
        throw new Error(msg)
      }
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Versturen mislukt')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title="Contact" onClose={onClose}>
      {sent ? (
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: colors.text }}>
          Bedankt voor je bericht. We reageren zo snel mogelijk per e-mail.
        </p>
      ) : (
        <form onSubmit={submit}>
          <AuthError message={error} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Naam" value={name} onChange={setName} required autoComplete="name" />
            <Field
              label="E-mailadres"
              type="email"
              value={email}
              onChange={setEmail}
              required
              autoComplete="email"
            />
            <label style={{ display: 'block' }}>
              <span style={labelStyle}>
                Bericht<span style={{ color: colors.negative }}> *</span>
              </span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              />
            </label>
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
            {busy ? 'Versturen…' : 'Versturen'}
          </button>
        </form>
      )}
    </Modal>
  )
}

function MarketingFooter() {
  const [showContact, setShowContact] = useState(false)
  return (
    <footer
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: '24px 20px',
        fontSize: 12.5,
        color: colors.subtle,
      }}
    >
      <span>© 2026 Freezo</span>
      <span aria-hidden="true">·</span>
      <button
        onClick={() => setShowContact(true)}
        style={{
          border: 'none',
          background: 'none',
          color: colors.subtle,
          fontSize: 12.5,
          textDecoration: 'underline',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        Contact
      </button>
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
    </footer>
  )
}

export function Marketing() {
  const isMobile = useIsMobile()
  return (
    <div style={{ background: colors.appBg, minHeight: '100vh', color: colors.ink }}>
      <MarketingHeader isMobile={isMobile} />
      <Hero isMobile={isMobile} />
      <DashboardPreview isMobile={isMobile} />
      <HowItWorks isMobile={isMobile} />
      <Features isMobile={isMobile} />
      <PrivacyTrust isMobile={isMobile} />
      <Faq isMobile={isMobile} />
      <ClosingCTA isMobile={isMobile} />
      <MarketingFooter />
    </div>
  )
}
