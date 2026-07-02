import { useState } from 'react'
import { Navigate, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { dutchNum, euro0, initials, subtotalOf } from '../format'
import { shortDate } from '../data'
import { accent, colors } from '../theme'
import { useLookups, useStore } from '../store'
import type { LayoutContext } from '../components/Layout'
import type { ProjectStatus } from '../types'
import { BackLink, Card, PrimaryButton } from '../components/ui'
import { Pill } from '../components/Pill'

const sectionTitle = {
  margin: '0 0 14px',
  fontSize: 13,
  fontWeight: 600,
  color: colors.subtle,
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
} as const

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: 'concept', label: 'Concept' },
  { value: 'lopend', label: 'Lopend' },
  { value: 'afgerond', label: 'Afgerond' },
  { value: 'gefactureerd', label: 'Gefactureerd' },
]

const smallSelect = {
  padding: '6px 9px',
  border: '1px solid #d3d7de',
  borderRadius: 8,
  fontSize: 13,
  color: colors.ink,
  background: '#fff',
} as const

const entryInput = {
  padding: '8px 10px',
  border: '1px solid #d3d7de',
  borderRadius: 8,
  fontSize: 13,
  color: colors.ink,
  background: '#fff',
  width: '100%',
} as const

export function OpdrachtDetail() {
  const { isMobile } = useOutletContext<LayoutContext>()
  const { id } = useParams()
  const navigate = useNavigate()
  const { projects, createDraftInvoice, setProjectStatus, addTimeEntry, removeTimeEntry } = useStore()
  const { clientById, quoteById } = useLookups()

  const [adding, setAdding] = useState(false)
  const [datum, setDatum] = useState(shortDate())
  const [oms, setOms] = useState('')
  const [uren, setUren] = useState('')

  const p = projects.find((x) => x.id === id)
  if (!p) return <Navigate to="/opdrachten" replace />

  const klant = clientById(p.klantId)!
  const offerte = quoteById(p.offerteId)
  const urenPct = p.raming > 0 ? Math.min(100, Math.round((p.uren / p.raming) * 100)) : 0
  const factureer = async () => navigate(`/facturen/${await createDraftInvoice()}`)

  const resetForm = () => {
    setDatum(shortDate())
    setOms('')
    setUren('')
    setAdding(false)
  }
  const submitEntry = () => {
    const hours = parseFloat(uren.replace(',', '.'))
    if (!oms.trim() || !Number.isFinite(hours) || hours <= 0) return
    addTimeEntry(p.id, { datum: datum.trim() || shortDate(), oms: oms.trim(), uren: hours })
    resetForm()
  }

  const statusSelect = (
    <select
      value={p.status}
      onChange={(e) => setProjectStatus(p.id, e.target.value as ProjectStatus)}
      style={smallSelect}
      aria-label="Status van de opdracht"
    >
      {statusOptions.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )

  const addForm = adding ? (
    <div
      style={{
        marginTop: 12,
        padding: 12,
        border: `1px solid ${colors.border}`,
        borderRadius: 10,
        background: colors.rowHover,
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 2.4fr 0.8fr',
        gap: 8,
      }}
    >
      <input value={datum} onChange={(e) => setDatum(e.target.value)} placeholder="Datum" style={entryInput} />
      <input
        value={oms}
        onChange={(e) => setOms(e.target.value)}
        placeholder="Omschrijving"
        style={entryInput}
        autoFocus
        onKeyDown={(e) => e.key === 'Enter' && submitEntry()}
      />
      <input
        value={uren}
        onChange={(e) => setUren(e.target.value)}
        placeholder="Uren"
        inputMode="decimal"
        style={entryInput}
        onKeyDown={(e) => e.key === 'Enter' && submitEntry()}
      />
      <div style={{ display: 'flex', gap: 8, gridColumn: isMobile ? 'auto' : '1 / -1' }}>
        <PrimaryButton onClick={submitEntry} style={{ padding: '8px 14px' }}>
          Toevoegen
        </PrimaryButton>
        <button
          onClick={resetForm}
          style={{
            border: '1px solid #d3d7de',
            background: '#fff',
            borderRadius: 8,
            padding: '8px 14px',
            fontSize: 13,
            fontWeight: 500,
            color: colors.text,
            cursor: 'pointer',
          }}
        >
          Annuleren
        </button>
      </div>
    </div>
  ) : (
    <button
      onClick={() => setAdding(true)}
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
  )

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
            {' '}/ {dutchNum(p.raming)} u{isMobile ? '' : ' geraamd'}
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
      {p.entries.length === 0 && (
        <div style={{ color: colors.subtle, fontSize: 13, padding: '4px 0 2px' }}>
          Nog geen uren geregistreerd.
        </div>
      )}
      {p.entries.map((e) => (
        <div
          key={e.id}
          className="row-hoverable"
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr auto auto' : '1fr 3fr 0.7fr auto',
            alignItems: 'center',
            gap: 10,
            padding: isMobile ? '8px 0' : '9px 0',
            borderTop: '1px solid #f4f5f7',
            fontSize: isMobile ? 13 : 13.5,
          }}
        >
          {isMobile ? (
            <>
              <span style={{ flex: 1 }}>{e.oms}</span>
              <span className="num" style={{ color: colors.subtle }}>{e.datum}</span>
            </>
          ) : (
            <>
              <span className="num" style={{ color: colors.subtle }}>{e.datum}</span>
              <span>{e.oms}</span>
            </>
          )}
          <span className="num" style={{ textAlign: 'right', fontWeight: 500 }}>{dutchNum(e.uren)}</span>
          <button
            onClick={() => removeTimeEntry(p.id, e.id)}
            aria-label="Regel verwijderen"
            title="Verwijderen"
            style={{
              border: 'none',
              background: 'none',
              color: colors.faint,
              cursor: 'pointer',
              fontSize: 16,
              lineHeight: 1,
              padding: '0 2px',
            }}
          >
            ×
          </button>
        </div>
      ))}
      {addForm}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <h1 style={{ margin: 0, fontSize: 19, fontWeight: 600 }}>{p.naam}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          {statusSelect}
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
        <div style={{ marginBottom: 12 }}>
          <PrimaryButton onClick={factureer} style={{ width: '100%', justifyContent: 'center' }}>
            Factureren
          </PrimaryButton>
        </div>
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
            {statusSelect}
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
