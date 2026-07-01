import { useNavigate, useOutletContext } from 'react-router-dom'
import { euro, totalOf } from '../format'
import { colors } from '../theme'
import { useLookups, useStore } from '../store'
import type { LayoutContext } from '../components/Layout'
import { Card, FilterChips, PageHeader, PrimaryButton } from '../components/ui'
import { Pill } from '../components/Pill'
import { EmptyState } from '../components/EmptyState'

const filterOptions = [
  { key: 'alle', label: 'Alle' },
  { key: 'open', label: 'Open' },
  { key: 'betaald', label: 'Betaald' },
  { key: 'te laat', label: 'Te laat' },
]

const GRID = '1.1fr 1.8fr 1fr 1.1fr 1fr'

export function FacturenList() {
  const { isMobile } = useOutletContext<LayoutContext>()
  const navigate = useNavigate()
  const { invoices, invoiceFilter, setInvoiceFilter, createDraftInvoice } = useStore()
  const { clientName } = useLookups()

  const rows = invoices
    .filter((i) => invoiceFilter === 'alle' || i.status === invoiceFilter)
    .map((i) => ({
      id: i.id,
      nr: i.nr,
      klant: clientName(i.klantId),
      status: i.status,
      verval: i.verval,
      vervalColor: i.status === 'te laat' ? colors.negative : colors.text,
      bedrag: euro(totalOf(i.lines)),
    }))

  const newBtn = (
    <PrimaryButton onClick={async () => navigate(`/facturen/${await createDraftInvoice()}`)}>
      <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Nieuwe factuur
    </PrimaryButton>
  )

  if (invoices.length === 0) {
    return (
      <>
        <PageHeader title="Facturen" actions={newBtn} />
        <EmptyState
          title="Nog geen facturen"
          hint="Maak je eerste factuur met regels, vervaldatum en PDF-voorbeeld."
          action={newBtn}
        />
      </>
    )
  }

  const header = (
    <>
      <PageHeader title="Facturen" actions={newBtn} />
      <FilterChips options={filterOptions} value={invoiceFilter} onChange={setInvoiceFilter} />
    </>
  )

  if (isMobile) {
    return (
      <>
        {header}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {rows.map((i) => (
            <Card key={i.id} hoverable style={{ padding: 14 }} onClick={() => navigate(`/facturen/${i.id}`)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                <span className="num" style={{ fontWeight: 600, fontSize: 13 }}>{i.nr}</span>
                <Pill status={i.status} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13.5 }}>{i.klant}</div>
                  <div className="num" style={{ fontSize: 12, color: i.vervalColor, marginTop: 2 }}>
                    verval {i.verval}
                  </div>
                </div>
                <span className="num" style={{ fontWeight: 600, fontSize: 14 }}>{i.bedrag}</span>
              </div>
            </Card>
          ))}
          {rows.length === 0 && (
            <div style={{ color: colors.subtle, fontSize: 13, padding: '8px 2px' }}>
              Geen facturen met deze status.
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
          <span>Status</span>
          <span>Vervaldatum</span>
          <span style={{ textAlign: 'right' }}>Bedrag</span>
        </div>
        {rows.map((i) => (
          <div
            key={i.id}
            className="row-hoverable"
            onClick={() => navigate(`/facturen/${i.id}`)}
            style={{
              display: 'grid',
              gridTemplateColumns: GRID,
              alignItems: 'center',
              padding: '14px 18px',
              borderTop: `1px solid ${colors.borderSoft}`,
              cursor: 'pointer',
            }}
          >
            <span className="num" style={{ fontWeight: 500, fontSize: 13 }}>{i.nr}</span>
            <span>{i.klant}</span>
            <span>
              <Pill status={i.status} />
            </span>
            <span className="num" style={{ color: i.vervalColor, fontSize: 13 }}>{i.verval}</span>
            <span className="num" style={{ textAlign: 'right', fontWeight: 600 }}>{i.bedrag}</span>
          </div>
        ))}
        {rows.length === 0 && (
          <div style={{ color: colors.subtle, fontSize: 13, padding: '16px 18px', borderTop: `1px solid ${colors.borderSoft}` }}>
            Geen facturen met deze status.
          </div>
        )}
      </Card>
    </>
  )
}
