import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { inQuarter, quarterLabel, quarterOf, shiftQuarter } from '../data'
import { euro, subtotalOf, totalOf } from '../format'
import { colors } from '../theme'
import { useStore } from '../store'
import type { LayoutContext } from '../components/Layout'
import { Card, PageHeader } from '../components/ui'

function useQuarter() {
  const now = new Date()
  const [state, setState] = useState({ year: now.getFullYear(), q: quarterOf(now) })
  return {
    ...state,
    prev: () => setState((s) => shiftQuarter(s.year, s.q, -1)),
    next: () => setState((s) => shiftQuarter(s.year, s.q, 1)),
  }
}

const row = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '11px 0',
  borderTop: `1px solid ${colors.borderSoft}`,
  fontSize: 14,
} as const

export function BtwOverzicht() {
  const { isMobile } = useOutletContext<LayoutContext>()
  const { invoices, expenses } = useStore()
  const { year, q, prev, next } = useQuarter()

  const data = useMemo(() => {
    const invIn = invoices.filter((i) => inQuarter(i.datum, year, q))
    const expIn = expenses.filter((e) => inQuarter(e.datum, year, q))
    const omzetExclBtw = invIn.reduce((s, i) => s + subtotalOf(i.lines), 0)
    const btwOmzet = invIn.reduce((s, i) => s + (totalOf(i.lines) - subtotalOf(i.lines)), 0)
    const kostenExclBtw = expIn.reduce((s, e) => s + e.bedrag, 0)
    const btwKosten = expIn.reduce((s, e) => s + (e.bedrag * e.btw) / 100, 0)
    const netto = btwOmzet - btwKosten
    return {
      invoiceCount: invIn.length,
      expenseCount: expIn.length,
      omzetExclBtw,
      btwOmzet,
      kostenExclBtw,
      btwKosten,
      netto,
    }
  }, [invoices, expenses, year, q])

  return (
    <>
      <PageHeader title="BTW-overzicht" />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <button
          onClick={prev}
          aria-label="Vorig kwartaal"
          style={{ border: `1px solid ${colors.border}`, background: colors.surface, borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: colors.text }}
        >
          ←
        </button>
        <span className="num" style={{ fontSize: 16, fontWeight: 600, minWidth: 90, textAlign: 'center' }}>
          {quarterLabel(year, q)}
        </span>
        <button
          onClick={next}
          aria-label="Volgend kwartaal"
          style={{ border: `1px solid ${colors.border}`, background: colors.surface, borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: colors.text }}
        >
          →
        </button>
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <Card style={{ padding: isMobile ? 18 : 24 }}>
          <div style={{ fontSize: 12.5, color: colors.muted, marginBottom: 2 }}>
            Gebaseerd op {data.invoiceCount} {data.invoiceCount === 1 ? 'factuur' : 'facturen'} en{' '}
            {data.expenseCount} {data.expenseCount === 1 ? 'kostenpost' : 'kostenposten'} met factuur-/kostendatum in dit kwartaal.
          </div>

          <div style={row}>
            <span style={{ color: colors.muted }}>Omzet excl. BTW</span>
            <span className="num" style={{ fontWeight: 500 }}>{euro(data.omzetExclBtw)}</span>
          </div>
          <div style={row}>
            <span style={{ color: colors.muted }}>BTW over omzet (af te dragen)</span>
            <span className="num" style={{ fontWeight: 500 }}>{euro(data.btwOmzet)}</span>
          </div>
          <div style={row}>
            <span style={{ color: colors.muted }}>Kosten excl. BTW</span>
            <span className="num" style={{ fontWeight: 500 }}>{euro(data.kostenExclBtw)}</span>
          </div>
          <div style={row}>
            <span style={{ color: colors.muted }}>BTW over kosten (voorbelasting)</span>
            <span className="num" style={{ fontWeight: 500 }}>{euro(data.btwKosten)}</span>
          </div>
          <div
            style={{
              ...row,
              borderTop: `1px solid ${colors.ink}`,
              marginTop: 4,
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            <span>{data.netto >= 0 ? 'Netto af te dragen' : 'Netto terug te vragen'}</span>
            <span className="num">{euro(Math.abs(data.netto))}</span>
          </div>
        </Card>

        <p style={{ fontSize: 12.5, color: colors.subtle, lineHeight: 1.6, marginTop: 16, textAlign: 'center' }}>
          Dit overzicht gaat uit van de factuur- en kostendatum (factuurstelsel), niet van de betaaldatum,
          en is bedoeld als indicatie. Controleer je BTW-aangifte altijd met je boekhouder of de Belastingdienst.
        </p>
      </div>
    </>
  )
}
