import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { accent, colors } from '../theme'
import { useIsMobile } from '../hooks/useIsMobile'
import { BrandMark } from '../components/icons'

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: 28 }}>
      <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600, color: colors.ink }}>{title}</h3>
      <div style={{ fontSize: 14, lineHeight: 1.7, color: colors.text }}>{children}</div>
    </section>
  )
}

export function Privacy() {
  const isMobile = useIsMobile()

  return (
    <div style={{ background: colors.appBg, minHeight: '100vh', color: colors.ink }}>
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
        <Link to="/" style={{ fontSize: 14, fontWeight: 500, color: accent.ink, textDecoration: 'none' }}>
          ← Terug naar de website
        </Link>
      </header>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: isMobile ? '20px 20px 80px' : '20px 32px 100px' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: isMobile ? 28 : 34, fontWeight: 700, letterSpacing: '-0.01em' }}>
          Privacy &amp; voorwaarden
        </h1>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: colors.muted }}>Laatst bijgewerkt: juli 2026</p>

        <div
          style={{
            background: accent.soft,
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            padding: '14px 16px',
            marginBottom: 36,
            fontSize: 13.5,
            lineHeight: 1.65,
            color: colors.text,
          }}
        >
          Dit is een eerste, concept-versie van ons privacybeleid en onze voorwaarden, geschreven
          om helder te maken welke gegevens Freezo verwerkt en hoe. Het is nog niet juridisch
          getoetst. Zodra Freezo breder wordt gebruikt dan een klein aantal vertrouwde testers,
          laten we deze tekst nalopen door een jurist voordat we hem als definitief beschouwen.
        </div>

        <h2 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 700, margin: '0 0 16px' }}>Privacybeleid</h2>

        <Section id="wie" title="Wie zijn wij">
          <p style={{ margin: 0 }}>
            Freezo is een dashboard voor zelfstandig ondernemers om offertes, facturen, opdrachten,
            klanten en kosten bij te houden. Als je een account aanmaakt, ben jij verwerkingsverantwoordelijke
            voor de gegevens van jouw eigen klanten die je in Freezo invoert; wij verwerken die gegevens
            namens jou, als verwerker.
          </p>
        </Section>

        <Section id="gegevens" title="Welke gegevens we verzamelen">
          <p style={{ margin: '0 0 10px' }}>Bij het aanmaken van een account en het gebruik van Freezo verzamelen we:</p>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li><strong>Accountgegevens:</strong> e-mailadres en wachtwoord (versleuteld opgeslagen).</li>
            <li>
              <strong>Bedrijfsprofiel:</strong> voor- en achternaam, bedrijfsnaam, adres, postcode, plaats,
              telefoonnummer, website, IBAN, KVK-nummer en BTW-nummer — deze verschijnen als afzender op
              je offertes en facturen.
            </li>
            <li>
              <strong>Klantgegevens die je zelf invoert:</strong> bedrijfsnaam, contactpersoon, e-mailadres
              en plaats van jouw klanten.
            </li>
            <li>
              <strong>Financiële/administratieve gegevens:</strong> offertes, facturen, regels en bedragen,
              opdrachten, urenregistratie en kostenposten die je zelf aanmaakt.
            </li>
            <li>
              <strong>Contactformulier:</strong> als je ons via de website benadert, verwerken we je naam,
              e-mailadres en bericht om te kunnen reageren.
            </li>
          </ul>
        </Section>

        <Section id="gebruik" title="Waarvoor we deze gegevens gebruiken">
          <p style={{ margin: 0 }}>
            Uitsluitend om Freezo te laten werken: je account beveiligen, je offertes en facturen
            genereren en (op jouw verzoek) per e-mail versturen aan jouw klanten, je dashboard en
            BTW-overzicht berekenen, en om te reageren als je contact met ons opneemt. We gebruiken
            je gegevens niet voor advertenties en verkopen niets door aan derden.
          </p>
        </Section>

        <Section id="derden" title="Welke derde partijen we gebruiken">
          <p style={{ margin: '0 0 10px' }}>
            Freezo draait op een aantal gespecialiseerde diensten, die uitsluitend de technische
            infrastructuur leveren:
          </p>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li><strong>Supabase</strong> — database en inloggen. Elk account is beveiligd met row-level
              security: alleen jij hebt toegang tot jouw eigen gegevens.</li>
            <li><strong>Resend</strong> — het versturen van offertes, facturen en contactformulier-e-mails.</li>
            <li><strong>Vercel</strong> — hosting van de website en applicatie.</li>
            <li><strong>Google Fonts</strong> — het laden van het lettertype van de website.</li>
          </ul>
        </Section>

        <Section id="bewaartermijn" title="Bewaartermijn">
          <p style={{ margin: 0 }}>
            We bewaren je gegevens zolang je account bestaat. Verwijder je je account (neem hiervoor
            contact met ons op), dan verwijderen we je gegevens, tenzij we wettelijk verplicht zijn
            bepaalde administratieve gegevens langer te bewaren.
          </p>
        </Section>

        <Section id="rechten" title="Jouw rechten">
          <p style={{ margin: 0 }}>
            Je hebt het recht om je gegevens in te zien, te corrigeren of te laten verwijderen, en om
            een exportkopie van je gegevens op te vragen. Neem hiervoor contact met ons op via het
            contactformulier op de homepage.
          </p>
        </Section>

        <h2 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 700, margin: '40px 0 16px' }}>Algemene voorwaarden</h2>

        <Section id="toepasselijkheid" title="Toepasselijkheid">
          <p style={{ margin: 0 }}>
            Deze voorwaarden gelden voor ieder gebruik van Freezo. Door een account aan te maken ga
            je hiermee akkoord.
          </p>
        </Section>

        <Section id="gebruik-dienst" title="Gebruik van de dienst">
          <p style={{ margin: 0 }}>
            Je gebruikt Freezo voor je eigen administratie als zelfstandig ondernemer en bent zelf
            verantwoordelijk voor de juistheid van de gegevens die je invoert, waaronder de gegevens
            op offertes en facturen richting jouw klanten.
          </p>
        </Section>

        <Section id="accounts" title="Accounts">
          <p style={{ margin: 0 }}>
            Je bent verantwoordelijk voor het geheimhouden van je inloggegevens en voor alle activiteit
            onder jouw account.
          </p>
        </Section>

        <Section id="beschikbaarheid" title="Beschikbaarheid">
          <p style={{ margin: 0 }}>
            Freezo bevindt zich nog in een vroege fase. We doen ons best om de dienst beschikbaar en
            foutloos te houden, maar kunnen geen ononderbroken beschikbaarheid garanderen.
          </p>
        </Section>

        <Section id="aansprakelijkheid" title="Aansprakelijkheid">
          <p style={{ margin: 0 }}>
            Freezo is een hulpmiddel bij je administratie en vervangt geen fiscaal of juridisch advies
            (bijvoorbeeld rond BTW-aangifte). Wij zijn niet aansprakelijk voor schade die voortvloeit
            uit het gebruik van berekeningen of gegevens in de applicatie; controleer belangrijke
            cijfers altijd zelf of met je boekhouder.
          </p>
        </Section>

        <Section id="wijzigingen" title="Wijzigingen">
          <p style={{ margin: 0 }}>
            We kunnen deze voorwaarden en dit privacybeleid van tijd tot tijd aanpassen. Bij
            belangrijke wijzigingen laten we dit weten.
          </p>
        </Section>

        <Section id="contact" title="Contact">
          <p style={{ margin: 0 }}>
            Vragen over privacy of deze voorwaarden? Gebruik het contactformulier op de{' '}
            <Link to="/" style={{ color: accent.ink, fontWeight: 500 }}>homepage</Link>.
          </p>
        </Section>
      </div>
    </div>
  )
}
