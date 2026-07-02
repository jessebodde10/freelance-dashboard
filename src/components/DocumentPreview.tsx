import type { ReactNode } from 'react'
import { computeTotals, euro } from '../format'
import { colors } from '../theme'
import { useIdentity } from '../hooks/useIdentity'
import type { LineItem } from '../types'
import { BrandMark } from './icons'

const GRID = '1fr 40px 62px 66px'

/** The live PDF-style preview shared by the offerte and factuur editors. */
export function DocumentPreview({
  docType,
  nr,
  datum,
  klantBedrijf,
  klantContact,
  lines,
  totalLabel,
  footer,
}: {
  docType: 'OFFERTE' | 'FACTUUR'
  nr: string
  datum: string
  klantBedrijf: string
  klantContact: string
  lines: LineItem[]
  totalLabel: string
  footer: ReactNode
}) {
  const { subtotaal, btwGroups, totaal } = computeTotals(lines)
  const me = useIdentity()
  const addressLine = [me.postcode, me.plaats].filter(Boolean).join(' ')

  return (
    <div style={{ position: 'sticky', top: 0 }}>
      <div
        style={{
          fontSize: 12,
          color: colors.subtle,
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#17b26a' }} />
        Live preview
      </div>

      <div
        className="doc-preview"
        style={{
          background: '#fff',
          border: `1px solid ${colors.border}`,
          borderRadius: 8,
          boxShadow: '0 6px 24px rgba(16,24,40,0.08)',
          padding: '34px 32px',
          fontSize: 11,
          color: colors.ink,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 30,
          }}
        >
          <div>
            <div style={{ marginBottom: 10 }}>
              <BrandMark size={22} />
            </div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{me.senderName}</div>
            <div style={{ color: colors.subtle, lineHeight: 1.6 }}>
              {me.bedrijf && me.fullName ? (
                <>
                  {me.fullName}
                  <br />
                </>
              ) : null}
              {me.adres}
              {me.adres && addressLine ? <br /> : null}
              {addressLine}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '0.02em' }}>{docType}</div>
            <div className="num" style={{ color: colors.subtle, marginTop: 4 }}>
              {nr}
            </div>
            <div className="num" style={{ color: colors.subtle }}>
              {datum}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 22 }}>
          <div style={{ color: colors.subtle, marginBottom: 3 }}>Aan</div>
          <div style={{ fontWeight: 600, fontSize: 12 }}>{klantBedrijf}</div>
          <div style={{ color: colors.subtle }}>t.a.v. {klantContact}</div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: GRID,
            gap: 6,
            paddingBottom: 7,
            borderBottom: '1px solid #1a1f36',
            fontSize: 9.5,
            color: colors.subtle,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          <span>Omschrijving</span>
          <span style={{ textAlign: 'right' }}>Aantal</span>
          <span style={{ textAlign: 'right' }}>Prijs</span>
          <span style={{ textAlign: 'right' }}>Bedrag</span>
        </div>

        {lines.map((l) => (
          <div
            key={l.id}
            style={{
              display: 'grid',
              gridTemplateColumns: GRID,
              gap: 6,
              padding: '8px 0',
              borderBottom: `1px solid ${colors.borderSoft}`,
              fontSize: 10.5,
            }}
          >
            <span>{l.desc}</span>
            <span className="num" style={{ textAlign: 'right' }}>
              {l.qty}
            </span>
            <span className="num" style={{ textAlign: 'right' }}>
              {euro(l.price)}
            </span>
            <span className="num" style={{ textAlign: 'right' }}>
              {euro(l.qty * l.price)}
            </span>
          </div>
        ))}

        <div
          style={{
            marginTop: 14,
            marginLeft: 'auto',
            width: '60%',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            fontSize: 10.5,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.text }}>
            <span>Subtotaal</span>
            <span className="num">{euro(subtotaal)}</span>
          </div>
          {btwGroups.map((b) => (
            <div
              key={b.pct}
              style={{ display: 'flex', justifyContent: 'space-between', color: colors.text }}
            >
              <span>BTW {b.pct}%</span>
              <span className="num">{euro(b.bedrag)}</span>
            </div>
          ))}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 700,
              paddingTop: 6,
              borderTop: '1px solid #1a1f36',
              fontSize: 12,
            }}
          >
            <span>{totalLabel}</span>
            <span className="num">{euro(totaal)}</span>
          </div>
        </div>

        <div
          style={{
            marginTop: 30,
            paddingTop: 14,
            borderTop: `1px solid ${colors.borderSoft}`,
            color: colors.faint,
            fontSize: 9,
            lineHeight: 1.7,
            textAlign: 'center',
          }}
        >
          {footer}
        </div>
      </div>
    </div>
  )
}
