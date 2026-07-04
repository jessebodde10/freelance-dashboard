import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { parseShortDate } from '../data'
import { euro, totalOf } from '../format'
import { colors } from '../theme'
import { useLookups, useStore } from '../store'
import type { LayoutContext } from '../components/Layout'
import { Card, FilterChips, PageHeader, PrimaryButton, SecondaryButton, SearchField } from '../components/ui'
import { Pill } from '../components/Pill'
import { EmptyState } from '../components/EmptyState'
import { celebrate } from '../components/Celebration'

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
  const { invoices, invoiceFilter, setInvoiceFilter, createDraftInvoice, genereerHerhalingNu } = useStore()
  const { clientName } = useLookups()
  const [search, setSearch] = useState('')
  const [generatingId, setGeneratingId] = useState<string | null>(null)

  const today = new Date()
  const dueRecurring = invoices.filter((i) => {
    if (i.herhaling === 'geen' || !i.volgendeFactuurdatum) return false
    const d = parseShortDate(i.volgendeFactuurdatum)
    return d !== null && d <= today
  })

  async function generateNow(id: string) {
    setGeneratingId(id)
    try {
      const newId = await genereerHerhalingNu(id)
      celebrate('Nieuwe factuur aangemaakt')
      navigate(`/facturen/${newId}`)
    } finally {
      setGeneratingId(null)
    }
  }

  const term = search.trim().toLowerCase()
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
    .filter((r) => !term || r.nr.toLowerCase().includes(term) || r.klant.toLowerCase().includes(term))

  const emptyMsg = term ? `Geen facturen gevonden voor “${search}”.` : 'Geen facturen met deze status.'

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

  const recurringBanner = dueRecurring.length > 0 && (
    <Card style={{ padding: 16, marginBottom: 16, borderColor: colors.borderStrong }}>
      <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 10 }}>
        {dueRecurring.length} {dueRecurring.length === 1 ? 'terugkerende factuur staat' : 'terugkerende facturen staan'} klaar
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {dueRecurring.map((i) => (
          <div key={i.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <span style={{ fontSize: 13.5 }}>
              <span className="num" style={{ fontWeight: 500 }}>{i.nr}</span> — {clientName(i.klantId)}
            </span>
            <SecondaryButton
              style={{ padding: '6px 12px', fontSize: 13 }}
              disabled={generatingId === i.id}
              onClick={() => generateNow(i.id)}
            >
              {generatingId === i.id ? 'Bezig…' : 'Nu aanmaken'}
            </SecondaryButton>
          </div>
        ))}
      </div>
    </Card>
  )

  const header = (
    <>
      {recurringBanner}
      <PageHeader title="Facturen" actions={newBtn} />
      <FilterChips options={filterOptions} value={invoiceFilter} onChange={setInvoiceFilter} />
      <SearchField value={search} onChange={setSearch} placeholder="Zoek op nummer of klant" />
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
            <div style={{ color: colors.subtle, fontSize: 13, padding: '8px 2px' }}>{emptyMsg}</div>
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
            borderBottom: `1px solid ${colors.border}`,
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
            {emptyMsg}
          </div>
        )}
      </Card>
    </>
  )
}
