import { useMemo } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { monthShort, parseShortDate, todayLabel } from '../data'
import { dutchNum, euro, euro0, subtotalOf, totalOf } from '../format'
import { accent, colors } from '../theme'
import { useLookups, useStore } from '../store'
import type { LayoutContext } from '../components/Layout'
import type { Expense, Invoice } from '../types'
import { Card, PrimaryButton } from '../components/ui'
import { Pill } from '../components/Pill'
import { RevenueUpIcon } from '../components/icons'
import { useIdentity } from '../hooks/useIdentity'

// Time-of-day greeting in Dutch.
function greeting(): string {
  const h = new Date().getHours()
  if (h < 6) return 'Goedenacht'
  if (h < 12) return 'Goedemorgen'
  if (h < 18) return 'Goedemiddag'
  return 'Goedenavond'
}

// Sum of paid invoices per calendar month, for the last `count` months.
function monthlyRevenue(invoices: Invoice[], count: number) {
  const now = new Date()
  const buckets: { key: string; label: string; v: number }[] = []
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: monthShort(d), v: 0 })
  }
  for (const inv of invoices) {
    if (inv.status !== 'betaald') continue
    const d = parseShortDate(inv.datum)
    if (!d) continue
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const b = buckets.find((x) => x.key === key)
    if (b) b.v += totalOf(inv.lines)
  }
  return buckets
}

// Sum of expenses booked in the current calendar month.
function monthlyExpenses(expenses: Expense[]): number {
  const now = new Date()
  return expenses.reduce((s, e) => {
    const d = parseShortDate(e.datum)
    if (!d || d.getFullYear() !== now.getFullYear() || d.getMonth() !== now.getMonth()) return s
    return s + e.bedrag
  }, 0)
}

function useDashboardData() {
  const { invoices, quotes, projects, expenses } = useStore()
  const { clientName } = useLookups()
  const navigate = useNavigate()

  return useMemo(() => {
    const openInv = invoices.filter((i) => i.status !== 'betaald')
    const openstaandTotaal = openInv.reduce((s, i) => s + totalOf(i.lines), 0)
    const teLaat = invoices.filter((i) => i.status === 'te laat')
    const waiting = quotes.filter((q) => q.status === 'verstuurd')
    const active = projects.filter((p) => p.status === 'lopend')
    const concepts = projects.filter((p) => p.status === 'concept')

    const months = monthlyRevenue(invoices, 6)
    const maxV = Math.max(1, ...months.map((c) => c.v))
    const omzetMaand = months[months.length - 1].v
    const omzetVorige = months[months.length - 2]?.v ?? 0
    const delta = omzetVorige > 0 ? Math.round(((omzetMaand - omzetVorige) / omzetVorige) * 1000) / 10 : null
    const kostenMaand = monthlyExpenses(expenses)
    const winstMaand = omzetMaand - kostenMaand

    const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
    const stripYear = (s: string) => s.replace(/\s\d{4}$/, '')

    return {
      teLaat,
      waiting,
      hasRevenue: months.some((m) => m.v > 0),
      omzetMaand: euro0(omzetMaand),
      omzetDelta: delta === null ? null : `${delta >= 0 ? '+' : ''}${dutchNum(delta)}%`,
      kostenMaand: euro0(kostenMaand),
      winstMaand: euro0(winstMaand),
      hasKosten: kostenMaand > 0,
      openstaandTotaal: euro0(openstaandTotaal),
      teLaatLabel: plural(teLaat.length, 'factuur te laat', 'facturen te laat'),
      actiefCount: String(active.length),
      conceptLabel: plural(concepts.length, 'in concept', 'in concept'),
      offerteWachtCount: String(waiting.length),
      offerteWachtTotaal: euro0(waiting.reduce((s, q) => s + subtotalOf(q.lines), 0)),
      focusCount: String(teLaat.length + waiting.length),
      chart: months.map((c, i) => ({
        label: c.label,
        h: `${Math.round((c.v / maxV) * 100)}%`,
        color: i === months.length - 1 ? accent.solid : colors.border,
      })),
      openInvoices: openInv.map((i) => ({
        id: i.id,
        klant: clientName(i.klantId),
        bedrag: euro(totalOf(i.lines)),
        nr: i.nr,
        verval: stripYear(i.verval),
        status: i.status,
        onClick: () => navigate(`/facturen/${i.id}`),
      })),
      activeProjects: active.map((p) => ({
        id: p.id,
        naam: p.naam,
        klant: clientName(p.klantId),
        deadline: p.deadline,
        status: p.status,
        onClick: () => navigate(`/opdrachten/${p.id}`),
      })),
      waitingQuotes: waiting.map((q) => ({
        id: q.id,
        klant: clientName(q.klantId),
        bedrag: euro0(subtotalOf(q.lines)),
        ago: `Verstuurd ${stripYear(q.datum)}`,
      })),
      focusItems: [
        ...teLaat.map((i) => ({
          key: i.id,
          dot: colors.danger,
          title: `Factuur ${i.nr} te laat`,
          sub: `${clientName(i.klantId)} · verviel ${stripYear(i.verval)}`,
          amount: euro(totalOf(i.lines)),
          onClick: () => navigate(`/facturen/${i.id}`),
        })),
        ...waiting.map((q) => ({
          key: q.id,
          dot: '#f79009',
          title: `Offerte ${q.nr} wacht op reactie`,
          sub: `${clientName(q.klantId)} · verstuurd ${stripYear(q.datum)}`,
          amount: euro0(subtotalOf(q.lines)),
          onClick: () => navigate('/offertes'),
        })),
      ],
    }
  }, [invoices, quotes, projects, expenses, clientName, navigate])
}

const cardLabel = { fontSize: 13, color: colors.muted } as const
const cardValue = {
  fontSize: 26,
  fontWeight: 600,
  marginTop: 8,
  letterSpacing: '-0.02em',
} as const

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 18px 12px',
      }}
    >
      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{title}</h2>
      {action}
    </div>
  )
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div
      style={{
        padding: '18px',
        borderTop: `1px solid ${colors.borderSoft}`,
        color: colors.subtle,
        fontSize: 13,
      }}
    >
      {text}
    </div>
  )
}

/* ------------------------------ Desktop dashboard ----------------------------- */

function DesktopDashboard() {
  const d = useDashboardData()
  const navigate = useNavigate()
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 16 }}>
        <Card style={{ padding: 18 }}>
          <div style={cardLabel}>Omzet deze maand</div>
          <div className="num" style={cardValue}>{d.omzetMaand}</div>
          {d.omzetDelta && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                marginTop: 6,
                fontSize: 12.5,
                color: colors.positive,
                fontWeight: 500,
              }}
            >
              <RevenueUpIcon />
              {d.omzetDelta} t.o.v. vorige maand
            </div>
          )}
          {d.hasKosten && (
            <div style={{ marginTop: 6, fontSize: 12.5, color: colors.muted }}>
              {d.kostenMaand} kosten · {d.winstMaand} winst
            </div>
          )}
        </Card>
        <Card style={{ padding: 18 }}>
          <div style={cardLabel}>Openstaand</div>
          <div className="num" style={cardValue}>{d.openstaandTotaal}</div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              marginTop: 6,
              fontSize: 12.5,
              color: colors.negative,
              fontWeight: 500,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors.danger }} />
            {d.teLaatLabel}
          </div>
        </Card>
        <Card style={{ padding: 18 }}>
          <div style={cardLabel}>Actieve opdrachten</div>
          <div className="num" style={cardValue}>{d.actiefCount}</div>
          <div style={{ marginTop: 6, fontSize: 12.5, color: colors.muted }}>{d.conceptLabel}</div>
        </Card>
        <Card style={{ padding: 18 }}>
          <div style={cardLabel}>Offertes verstuurd</div>
          <div className="num" style={cardValue}>{d.offerteWachtCount}</div>
          <div style={{ marginTop: 6, fontSize: 12.5, color: colors.muted }}>
            {d.offerteWachtTotaal} in afwachting
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card style={{ padding: '20px 22px' }}>
          <div style={cardLabel}>Omzet laatste 6 maanden</div>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 14,
              height: 120,
              marginTop: 18,
              position: 'relative',
            }}
          >
            {!d.hasRevenue && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.subtle,
                  fontSize: 13,
                }}
              >
                Nog geen betaalde facturen om omzet te tonen.
              </div>
            )}
            {d.chart.map((m) => (
              <div
                key={m.label}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  height: '100%',
                  justifyContent: 'flex-end',
                }}
              >
                <div
                  style={{ width: '100%', borderRadius: '6px 6px 0 0', background: m.color, height: m.h, transition: 'height .3s' }}
                />
                <div style={{ fontSize: 11, color: colors.subtle }}>{m.label}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Actie vereist</h2>
            {d.focusCount !== '0' && (
              <span
                className="num"
                style={{
                  fontSize: 12,
                  background: 'rgba(240,68,56,0.12)',
                  color: colors.negative,
                  padding: '1px 8px',
                  borderRadius: 999,
                  fontWeight: 600,
                }}
              >
                {d.focusCount}
              </span>
            )}
          </div>
          {d.focusItems.length === 0 && <EmptyRow text="Niets dat je aandacht nodig heeft. 🎉" />}
          {d.focusItems.map((i) => (
            <div
              key={i.key}
              className="row-hoverable"
              onClick={i.onClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '13px 18px',
                borderTop: `1px solid ${colors.borderSoft}`,
                cursor: 'pointer',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: i.dot, flex: 'none' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 13.5 }}>{i.title}</div>
                <div style={{ fontSize: 12, color: colors.subtle, marginTop: 2 }}>{i.sub}</div>
              </div>
              <div className="num" style={{ fontWeight: 600, fontSize: 13.5 }}>{i.amount}</div>
            </div>
          ))}
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 16 }}>
        <Card style={{ overflow: 'hidden' }}>
          <SectionHeader
            title="Openstaande facturen"
            action={
              <button
                onClick={() => navigate('/facturen')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: accent.ink,
                  fontWeight: 500,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Bekijk alle →
              </button>
            }
          />
          {d.openInvoices.length === 0 && <EmptyRow text="Geen openstaande facturen." />}
          {d.openInvoices.map((f) => (
            <div
              key={f.id}
              className="row-hoverable"
              onClick={f.onClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '13px 18px',
                borderTop: `1px solid ${colors.borderSoft}`,
                cursor: 'pointer',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 13.5 }}>{f.klant}</div>
                <div className="num" style={{ fontSize: 12, color: colors.subtle, marginTop: 2 }}>
                  {f.nr} · verval {f.verval}
                </div>
              </div>
              <Pill status={f.status} />
              <div className="num" style={{ fontWeight: 600, fontSize: 14, width: 96, textAlign: 'right' }}>
                {f.bedrag}
              </div>
            </div>
          ))}
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card style={{ overflow: 'hidden' }}>
            <SectionHeader title="Actieve opdrachten" />
            {d.activeProjects.length === 0 && <EmptyRow text="Geen actieve opdrachten." />}
            {d.activeProjects.map((p) => (
              <div
                key={p.id}
                className="row-hoverable"
                onClick={p.onClick}
                style={{ padding: '12px 18px', borderTop: `1px solid ${colors.borderSoft}`, cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontWeight: 500, fontSize: 13.5 }}>{p.naam}</span>
                  <Pill status={p.status} />
                </div>
                <div style={{ fontSize: 12, color: colors.subtle, marginTop: 3 }}>
                  {p.klant} · deadline {p.deadline}
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </>
  )
}

/* --------------------------------- Mobile --------------------------------- */

function MobileDashboard() {
  const d = useDashboardData()
  const miniLabel = { fontSize: 12, color: colors.muted } as const
  const miniValue = { fontSize: 20, fontWeight: 600, marginTop: 5 } as const
  const groupHeader = {
    fontSize: 13,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 9,
    paddingLeft: 2,
  } as const

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginBottom: 11 }}>
        <Card style={{ padding: 14 }}>
          <div style={miniLabel}>Omzet deze maand</div>
          <div className="num" style={miniValue}>{d.omzetMaand}</div>
          {d.omzetDelta && (
            <div style={{ fontSize: 11.5, color: colors.positive, fontWeight: 500, marginTop: 3 }}>
              {d.omzetDelta}
            </div>
          )}
          {d.hasKosten && (
            <div style={{ fontSize: 11, color: colors.muted, marginTop: 3 }}>{d.winstMaand} winst</div>
          )}
        </Card>
        <Card style={{ padding: 14 }}>
          <div style={miniLabel}>Openstaand</div>
          <div className="num" style={miniValue}>{d.openstaandTotaal}</div>
          <div style={{ fontSize: 11.5, color: colors.negative, fontWeight: 500, marginTop: 3 }}>
            {d.teLaatLabel}
          </div>
        </Card>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginBottom: 18 }}>
        <Card style={{ padding: 14 }}>
          <div style={miniLabel}>Actief</div>
          <div className="num" style={miniValue}>{d.actiefCount}</div>
        </Card>
        <Card style={{ padding: 14 }}>
          <div style={miniLabel}>Offertes uit</div>
          <div className="num" style={miniValue}>{d.offerteWachtCount}</div>
        </Card>
      </div>

      <div style={groupHeader}>Openstaande facturen</div>
      <Card style={{ overflow: 'hidden', marginBottom: 18 }}>
        {d.openInvoices.length === 0 && <EmptyRow text="Geen openstaande facturen." />}
        {d.openInvoices.map((f) => (
          <div
            key={f.id}
            onClick={f.onClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 14px',
              borderTop: `1px solid ${colors.borderSoft}`,
              cursor: 'pointer',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 500, fontSize: 13.5 }}>{f.klant}</div>
              <div className="num" style={{ fontSize: 11.5, color: colors.subtle, marginTop: 2 }}>
                verval {f.verval}
              </div>
            </div>
            <Pill status={f.status} />
            <div className="num" style={{ fontWeight: 600, fontSize: 13 }}>{f.bedrag}</div>
          </div>
        ))}
      </Card>

      <div style={groupHeader}>Actieve opdrachten</div>
      <Card style={{ overflow: 'hidden' }}>
        {d.activeProjects.length === 0 && <EmptyRow text="Geen actieve opdrachten." />}
        {d.activeProjects.map((p) => (
          <div
            key={p.id}
            onClick={p.onClick}
            style={{ padding: '12px 14px', borderTop: `1px solid ${colors.borderSoft}`, cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontWeight: 500, fontSize: 13.5 }}>{p.naam}</span>
              <Pill status={p.status} />
            </div>
            <div style={{ fontSize: 11.5, color: colors.subtle, marginTop: 3 }}>
              {p.klant} · deadline {p.deadline}
            </div>
          </div>
        ))}
      </Card>
    </>
  )
}

/* --------------------------------- Screen --------------------------------- */

export function Dashboard() {
  const { isMobile } = useOutletContext<LayoutContext>()
  const navigate = useNavigate()
  const { createDraftQuote } = useStore()
  const { fullName } = useIdentity()
  const firstName = fullName.split(' ')[0]

  if (isMobile) return <MobileDashboard />

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 26,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em' }}>
            {greeting()}{firstName ? ` ${firstName}` : ''}
          </h1>
          <p style={{ margin: '6px 0 0', color: colors.muted, fontSize: 14 }}>
            {todayLabel()} · hier is je overzicht
          </p>
        </div>
        <PrimaryButton onClick={async () => navigate(`/offertes/${await createDraftQuote()}`)}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Offerte
        </PrimaryButton>
      </div>

      <DesktopDashboard />
    </>
  )
}
