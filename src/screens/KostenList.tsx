import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { monthShort, parseShortDate } from '../data'
import { euro } from '../format'
import { colors } from '../theme'
import { useStore } from '../store'
import type { LayoutContext } from '../components/Layout'
import { Card, FilterChips, PageHeader, PrimaryButton, SearchField } from '../components/ui'
import { EmptyState } from '../components/EmptyState'
import { ExpenseModal } from '../components/ExpenseModal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import type { Expense } from '../types'

const GRID = '2fr 1.3fr 1fr 0.8fr 30px'

// "2026-6" style key so months sort/compare naturally, newest first.
function monthKeyOf(dateStr: string): string | null {
  const d = parseShortDate(dateStr)
  return d ? `${d.getFullYear()}-${d.getMonth()}` : null
}

function monthLabelOf(dateStr: string): string {
  const d = parseShortDate(dateStr)
  if (!d) return dateStr
  const label = monthShort(d)
  return `${label.charAt(0).toUpperCase()}${label.slice(1)} ${d.getFullYear()}`
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 4.5h10M6.5 4.5V3a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1.5M4.5 4.5 5 13a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1l.5-8.5" />
    </svg>
  )
}

export function KostenList() {
  const { isMobile } = useOutletContext<LayoutContext>()
  const { expenses, removeExpense } = useStore()
  const [filter, setFilter] = useState('alle')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Expense | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null)

  const monthOptions = useMemo(() => {
    const byKey = new Map<string, string>()
    for (const e of expenses) {
      const key = monthKeyOf(e.datum)
      if (key && !byKey.has(key)) byKey.set(key, monthLabelOf(e.datum))
    }
    const sorted = [...byKey.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1))
    return [{ key: 'alle', label: 'Alle' }, ...sorted.map(([key, label]) => ({ key, label }))]
  }, [expenses])

  const term = search.trim().toLowerCase()
  const rows = expenses
    .filter((e) => filter === 'alle' || monthKeyOf(e.datum) === filter)
    .filter((e) => !term || e.omschrijving.toLowerCase().includes(term))

  const emptyMsg = term ? `Geen kostenposten gevonden voor “${search}”.` : 'Geen kostenposten in deze maand.'

  const totaalExcl = rows.reduce((s, e) => s + e.bedrag, 0)
  const totaalIncl = rows.reduce((s, e) => s + e.bedrag * (1 + e.btw / 100), 0)

  const newBtn = (
    <PrimaryButton onClick={() => setShowNew(true)}>
      <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Nieuwe kostenpost
    </PrimaryButton>
  )

  const modals = (
    <>
      {showNew && <ExpenseModal onClose={() => setShowNew(false)} />}
      {editing && <ExpenseModal expense={editing} onClose={() => setEditing(null)} />}
      {pendingDelete && (
        <ConfirmDialog
          title="Kostenpost verwijderen"
          message={`Weet je zeker dat je “${pendingDelete.omschrijving}” definitief wilt verwijderen?`}
          onConfirm={() => removeExpense(pendingDelete.id)}
          onClose={() => setPendingDelete(null)}
        />
      )}
    </>
  )

  if (expenses.length === 0) {
    return (
      <>
        <PageHeader title="Kosten" actions={newBtn} />
        <EmptyState
          title="Nog geen kosten"
          hint="Houd je zakelijke uitgaven bij, zoals software, reiskosten of verzekeringen."
          action={newBtn}
        />
        {modals}
      </>
    )
  }

  const header = (
    <>
      <PageHeader title="Kosten" actions={newBtn} />
      <FilterChips options={monthOptions} value={filter} onChange={setFilter} />
      <SearchField value={search} onChange={setSearch} placeholder="Zoek op omschrijving" />
    </>
  )

  const totalsCard = rows.length > 0 && (
    <Card style={{ padding: '14px 18px', marginTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 12.5, color: colors.muted }}>
          {rows.length} {rows.length === 1 ? 'kostenpost' : 'kostenposten'} · totaal excl. BTW
        </span>
        <span className="num" style={{ fontWeight: 600, fontSize: 15 }}>{euro(totaalExcl)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 }}>
        <span style={{ fontSize: 12, color: colors.subtle }}>Totaal incl. BTW</span>
        <span className="num" style={{ fontSize: 12.5, color: colors.subtle }}>{euro(totaalIncl)}</span>
      </div>
    </Card>
  )

  if (isMobile) {
    return (
      <>
        {header}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {rows.map((e) => (
            <Card key={e.id} hoverable style={{ padding: 14 }} onClick={() => setEditing(e)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                <span style={{ fontWeight: 600, fontSize: 13.5 }}>{e.omschrijving}</span>
                <span className="num" style={{ fontWeight: 600, fontSize: 14 }}>{euro(e.bedrag)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: colors.subtle }}>
                <span>{e.categorie} · {e.datum}</span>
                <button
                  onClick={(ev) => {
                    ev.stopPropagation()
                    setPendingDelete(e)
                  }}
                  aria-label="Verwijderen"
                  style={{ border: 'none', background: 'none', color: colors.faint, cursor: 'pointer', padding: 0 }}
                >
                  <TrashIcon />
                </button>
              </div>
            </Card>
          ))}
          {rows.length === 0 && (
            <div style={{ color: colors.subtle, fontSize: 13, padding: '8px 2px' }}>{emptyMsg}</div>
          )}
        </div>
        {totalsCard}
        {modals}
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
          <span>Omschrijving</span>
          <span>Categorie</span>
          <span>Datum</span>
          <span style={{ textAlign: 'right' }}>Bedrag</span>
          <span />
        </div>
        {rows.map((e) => (
          <div
            key={e.id}
            className="row-hoverable"
            onClick={() => setEditing(e)}
            style={{
              display: 'grid',
              gridTemplateColumns: GRID,
              alignItems: 'center',
              padding: '14px 18px',
              borderTop: `1px solid ${colors.borderSoft}`,
              cursor: 'pointer',
            }}
          >
            <span style={{ fontWeight: 500 }}>{e.omschrijving}</span>
            <span style={{ color: colors.text, fontSize: 13 }}>{e.categorie}</span>
            <span className="num" style={{ color: colors.text, fontSize: 13 }}>{e.datum}</span>
            <span className="num" style={{ textAlign: 'right', fontWeight: 600 }}>{euro(e.bedrag)}</span>
            <button
              onClick={(ev) => {
                ev.stopPropagation()
                setPendingDelete(e)
              }}
              aria-label="Verwijderen"
              style={{ border: 'none', background: 'none', color: colors.faint, cursor: 'pointer', justifySelf: 'end' }}
            >
              <TrashIcon />
            </button>
          </div>
        ))}
        {rows.length === 0 && (
          <div style={{ color: colors.subtle, fontSize: 13, padding: '16px 18px', borderTop: `1px solid ${colors.borderSoft}` }}>
            {emptyMsg}
          </div>
        )}
      </Card>
      {totalsCard}
      {modals}
    </>
  )
}
