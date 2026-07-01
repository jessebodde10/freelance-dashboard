import { useNavigate, useOutletContext } from 'react-router-dom'
import { euro0, subtotalOf } from '../format'
import { colors } from '../theme'
import { useLookups, useStore } from '../store'
import type { LayoutContext } from '../components/Layout'
import { Card, FilterChips, PageHeader, PrimaryButton } from '../components/ui'
import { Pill } from '../components/Pill'
import { EmptyState } from '../components/EmptyState'

const filterOptions = [
  { key: 'alle', label: 'Alle' },
  { key: 'concept', label: 'Concept' },
  { key: 'verstuurd', label: 'Verstuurd' },
  { key: 'geaccepteerd', label: 'Geaccepteerd' },
  { key: 'geweigerd', label: 'Geweigerd' },
  { key: 'verlopen', label: 'Verlopen' },
]

const GRID = '1.1fr 1.6fr 1.4fr 1fr 1fr'

export function OffertesList() {
  const { isMobile } = useOutletContext<LayoutContext>()
  const navigate = useNavigate()
  const { quotes, quoteFilter, setQuoteFilter, createDraftQuote } = useStore()
  const { clientName } = useLookups()

  const rows = quotes
    .filter((q) => quoteFilter === 'alle' || q.status === quoteFilter)
    .map((q) => ({
      id: q.id,
      nr: q.nr,
      klant: clientName(q.klantId),
      project: q.project,
      status: q.status,
      bedrag: euro0(subtotalOf(q.lines)),
    }))

  const newBtn = (
    <PrimaryButton onClick={async () => navigate(`/offertes/${await createDraftQuote()}`)}>
      <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Nieuwe offerte
    </PrimaryButton>
  )

  if (quotes.length === 0) {
    return (
      <>
        <PageHeader title="Offertes" actions={newBtn} />
        <EmptyState
          title="Nog geen offertes"
          hint="Stel je eerste offerte op met regels, BTW en een live PDF-voorbeeld."
          action={newBtn}
        />
      </>
    )
  }

  const header = (
    <>
      <PageHeader title="Offertes" actions={newBtn} />
      <FilterChips options={filterOptions} value={quoteFilter} onChange={setQuoteFilter} />
    </>
  )

  if (isMobile) {
    return (
      <>
        {header}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {rows.map((q) => (
            <Card key={q.id} hoverable style={{ padding: 14 }} onClick={() => navigate(`/offertes/${q.id}`)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                <span className="num" style={{ fontWeight: 600, fontSize: 13 }}>{q.nr}</span>
                <Pill status={q.status} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13.5 }}>{q.klant}</div>
                  <div style={{ fontSize: 12, color: colors.subtle, marginTop: 2 }}>{q.project}</div>
                </div>
                <span className="num" style={{ fontWeight: 600, fontSize: 14 }}>{q.bedrag}</span>
              </div>
            </Card>
          ))}
          {rows.length === 0 && (
            <div style={{ color: colors.subtle, fontSize: 13, padding: '8px 2px' }}>
              Geen offertes met deze status.
            </div>
          )}
        </div>
      </>
    )
  }

  return (
    <>
      {header}
      <Card style={{ overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: GRID,
            padding: '11px 18px',
            background: colors.rowHover,
            borderBottom: '1px solid #eceef1',
            fontSize: 12,
            fontWeight: 500,
            color: colors.subtle,
          }}
        >
          <span>Nummer</span>
          <span>Klant</span>
          <span>Onderwerp</span>
          <span>Status</span>
          <span style={{ textAlign: 'right' }}>Bedrag</span>
        </div>
        {rows.map((q) => (
          <div
            key={q.id}
            className="row-hoverable"
            onClick={() => navigate(`/offertes/${q.id}`)}
            style={{
              display: 'grid',
              gridTemplateColumns: GRID,
              alignItems: 'center',
              padding: '14px 18px',
              borderTop: `1px solid ${colors.borderSoft}`,
              cursor: 'pointer',
            }}
          >
            <span className="num" style={{ fontWeight: 500, fontSize: 13 }}>{q.nr}</span>
            <span style={{ color: colors.ink }}>{q.klant}</span>
            <span style={{ color: colors.text, fontSize: 13 }}>{q.project}</span>
            <span>
              <Pill status={q.status} />
            </span>
            <span className="num" style={{ textAlign: 'right', fontWeight: 600 }}>{q.bedrag}</span>
          </div>
        ))}
        {rows.length === 0 && (
          <div style={{ color: colors.subtle, fontSize: 13, padding: '16px 18px', borderTop: `1px solid ${colors.borderSoft}` }}>
            Geen offertes met deze status.
          </div>
        )}
      </Card>
    </>
  )
}
