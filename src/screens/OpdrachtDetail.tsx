import { Navigate, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { dutchNum, euro0, initials, subtotalOf } from '../format'
import { accent, colors } from '../theme'
import { useLookups, useStore } from '../store'
import type { LayoutContext } from '../components/Layout'
import type { TimeEntry } from '../types'
import { BackLink, Card, PrimaryButton } from '../components/ui'
import { Pill } from '../components/Pill'

// Time entries are not yet a persisted feature — new projects start with none.
const timeEntries: TimeEntry[] = []

const sectionTitle = {
  margin: '0 0 14px',
  fontSize: 13,
  fontWeight: 600,
  color: colors.subtle,
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
} as const

export function OpdrachtDetail() {
  const { isMobile } = useOutletContext<LayoutContext>()
  const { id } = useParams()
  const navigate = useNavigate()
  const { projects, createDraftInvoice } = useStore()
  const { clientById, quoteById } = useLookups()

  const p = projects.find((x) => x.id === id)
  if (!p) return <Navigate to="/opdrachten" replace />

  const klant = clientById(p.klantId)!
  const offerte = quoteById(p.offerteId)
  const urenPct = Math.min(100, Math.round((p.uren / p.raming) * 100))
  const factureer = async () => navigate(`/facturen/${await createDraftInvoice()}`)

  const urenCard = (
    <Card style={{ padding: isMobile ? 16 : 18 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: isMobile ? 12 : 14,
        }}
      >
        <h2 style={{ margin: 0, fontSize: isMobile ? 14 : 15, fontWeight: 600 }}>Urenregistratie</h2>
        <div style={{ textAlign: 'right' }}>
          <span className="num" style={{ fontSize: isMobile ? 16 : 18, fontWeight: 600 }}>
            {dutchNum(p.uren)} u
          </span>
          <span style={{ color: colors.subtle, fontSize: isMobile ? 12 : 13 }}>
            {' '}/ {p.raming} u{isMobile ? '' : ' geraamd'}
          </span>
        </div>
      </div>
      <div
        style={{
          height: 6,
          background: colors.borderSoft,
          borderRadius: 99,
          overflow: 'hidden',
          marginBottom: isMobile ? 14 : 16,
        }}
      >
        <div style={{ height: '100%', width: `${urenPct}%`, background: accent.solid, borderRadius: 99 }} />
      </div>
      {timeEntries.length === 0 && (
        <div style={{ color: colors.subtle, fontSize: 13, padding: '4px 0 2px' }}>
          Nog geen uren geregistreerd.
        </div>
      )}
      {timeEntries.map((e, idx) =>
        isMobile ? (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 10,
              padding: '8px 0',
              borderTop: `1px solid #f4f5f7`,
              fontSize: 13,
            }}
          >
            <span style={{ flex: 1 }}>{e.oms}</span>
            <span className="num" style={{ color: colors.subtle }}>{e.datum}</span>
            <span className="num" style={{ fontWeight: 500, width: 36, textAlign: 'right' }}>{e.uren}</span>
          </div>
        ) : (
          <div
            key={idx}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 3fr 0.7fr',
              alignItems: 'center',
              padding: '9px 0',
              borderTop: '1px solid #f4f5f7',
              fontSize: 13.5,
            }}
          >
            <span className="num" style={{ color: colors.subtle }}>{e.datum}</span>
            <span>{e.oms}</span>
            <span className="num" style={{ textAlign: 'right', fontWeight: 500 }}>{e.uren}</span>
          </div>
        ),
      )}
      {!isMobile && (
        <button
          style={{
            marginTop: 12,
            width: '100%',
            padding: 9,
            border: '1px dashed #d3d7de',
            background: '#fafbfc',
            borderRadius: 8,
            color: colors.muted,
            fontSize: 13,
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          + Uren toevoegen
        </button>
      )}
    </Card>
  )

  const offerteCard = (
    <Card hoverable style={{ padding: isMobile ? 16 : 18 }} onClick={() => navigate('/offertes')}>
      <h3 style={isMobile ? { ...sectionTitle, fontSize: 11.5, margin: '0 0 10px' } : sectionTitle}>
        Gekoppelde offerte
      </h3>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="num" style={{ fontWeight: 600, fontSize: 14 }}>{offerte?.nr ?? '—'}</div>
          <div style={{ fontSize: 12.5, color: colors.subtle, marginTop: 2 }}>
            {offerte ? `${euro0(subtotalOf(offerte.lines))} excl. btw` : ''}
          </div>
        </div>
        {offerte && <Pill status={offerte.status} />}
      </div>
    </Card>
  )

  if (isMobile) {
    return (
      <>
        <BackLink label="Terug" onClick={() => navigate('/opdrachten')} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Pill status={p.status} />
          <span style={{ fontSize: 13, color: colors.muted }}>voor {klant.bedrijf}</span>
        </div>
        <div style={{ marginBottom: 12 }}>{urenCard}</div>
        <Card
          style={{
            padding: 16,
            marginBottom: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            fontSize: 13.5,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: colors.subtle }}>Deadline</span>
            <span className="num" style={{ fontWeight: 500 }}>{p.deadline} 2026</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: colors.subtle }}>Uurtarief</span>
            <span className="num" style={{ fontWeight: 500 }}>{euro0(p.tarief)} /uur</span>
          </div>
        </Card>
        {offerteCard}
      </>
    )
  }

  return (
    <>
      <BackLink label="Opdrachten" onClick={() => navigate('/opdrachten')} />
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 22,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ margin: 0, fontSize: 23, fontWeight: 600, letterSpacing: '-0.02em' }}>{p.naam}</h1>
            <Pill status={p.status} />
          </div>
          <p style={{ margin: '7px 0 0', color: colors.muted, fontSize: 14 }}>voor {klant.bedrijf}</p>
        </div>
        <PrimaryButton onClick={factureer}>Factureren</PrimaryButton>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{urenCard}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card style={{ padding: 18 }}>
            <h3 style={sectionTitle}>Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11, fontSize: 13.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: colors.subtle }}>Deadline</span>
                <span className="num" style={{ fontWeight: 500 }}>{p.deadline} 2026</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: colors.subtle }}>Uurtarief</span>
                <span className="num" style={{ fontWeight: 500 }}>{euro0(p.tarief)} /uur</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: colors.subtle }}>Waarde</span>
                <span className="num" style={{ fontWeight: 500 }}>{euro0(p.raming * p.tarief)}</span>
              </div>
            </div>
          </Card>

          <Card hoverable style={{ padding: 18 }} onClick={() => navigate(`/klanten/${klant.id}`)}>
            <h3 style={sectionTitle}>Klant</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: colors.borderSoft,
                  color: colors.text,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: 12.5,
                }}
              >
                {initials(klant.bedrijf)}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{klant.bedrijf}</div>
                <div style={{ fontSize: 12.5, color: colors.subtle }}>{klant.contact}</div>
              </div>
            </div>
          </Card>

          {offerteCard}
        </div>
      </div>
    </>
  )
}
