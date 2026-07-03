import type { CSSProperties } from 'react'
import { computeTotals, euro } from '../format'
import { colors } from '../theme'
import type { LineItem } from '../types'
import { useStore } from '../store'

const GRID = '1fr 58px 82px 62px 88px 26px'

const inputStyle: CSSProperties = {
  padding: '8px 10px',
  border: `1px solid ${colors.border}`,
  borderRadius: 7,
  fontSize: 13,
  width: '100%',
  background: colors.surface,
  color: colors.ink,
}
const numInput: CSSProperties = { ...inputStyle, padding: '8px 8px', textAlign: 'right' }

export function LineItemsEditor({
  kind,
  docId,
  lines,
  totalLabel,
  isMobile,
}: {
  kind: 'quote' | 'invoice'
  docId: string
  lines: LineItem[]
  totalLabel: string
  isMobile?: boolean
}) {
  const { addLine, updateLine, removeLine } = useStore()
  const { subtotaal, btwGroups, totaal } = computeTotals(lines)

  const miniLabel = { fontSize: 10.5, color: colors.faint, display: 'block', marginBottom: 3 } as const

  return (
    <div>
      {isMobile ? (
        lines.map((l) => (
          <div
            key={l.id}
            style={{
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              padding: 12,
              marginBottom: 10,
            }}
          >
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 10 }}>
              <input
                value={l.desc}
                placeholder="Omschrijving"
                onChange={(e) => updateLine(kind, docId, l.id, 'desc', e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={() => removeLine(kind, docId, l.id)}
                aria-label="Regel verwijderen"
                style={{
                  border: 'none',
                  background: 'none',
                  color: colors.faint,
                  cursor: 'pointer',
                  fontSize: 18,
                  lineHeight: 1,
                  padding: '8px 2px',
                  flex: 'none',
                }}
              >
                ×
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
              <label>
                <span style={miniLabel}>Aantal</span>
                <input
                  value={l.qty}
                  type="number"
                  className="num"
                  onChange={(e) => updateLine(kind, docId, l.id, 'qty', e.target.value)}
                  style={numInput}
                />
              </label>
              <label>
                <span style={miniLabel}>Prijs</span>
                <input
                  value={l.price}
                  type="number"
                  className="num"
                  onChange={(e) => updateLine(kind, docId, l.id, 'price', e.target.value)}
                  style={numInput}
                />
              </label>
              <label>
                <span style={miniLabel}>BTW</span>
                <select
                  value={l.vat}
                  className="num"
                  onChange={(e) => updateLine(kind, docId, l.id, 'vat', e.target.value)}
                  style={{ ...numInput, textAlign: 'left', background: colors.surface }}
                >
                  <option value="21">21%</option>
                  <option value="9">9%</option>
                  <option value="0">0%</option>
                </select>
              </label>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: 8,
                borderTop: `1px solid ${colors.borderSoft}`,
                fontSize: 13,
              }}
            >
              <span style={{ color: colors.subtle }}>Bedrag</span>
              <span className="num" style={{ fontWeight: 600 }}>{euro(l.qty * l.price)}</span>
            </div>
          </div>
        ))
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: GRID,
              gap: 8,
              padding: '0 2px 6px',
              fontSize: 11.5,
              color: colors.faint,
            }}
          >
            <span>Omschrijving</span>
            <span style={{ textAlign: 'right' }}>Aantal</span>
            <span style={{ textAlign: 'right' }}>Prijs</span>
            <span style={{ textAlign: 'right' }}>BTW</span>
            <span style={{ textAlign: 'right' }}>Bedrag</span>
            <span />
          </div>

          {lines.map((l) => (
            <div
              key={l.id}
              style={{
                display: 'grid',
                gridTemplateColumns: GRID,
                gap: 8,
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <input
                value={l.desc}
                onChange={(e) => updateLine(kind, docId, l.id, 'desc', e.target.value)}
                style={inputStyle}
              />
              <input
                value={l.qty}
                type="number"
                className="num"
                onChange={(e) => updateLine(kind, docId, l.id, 'qty', e.target.value)}
                style={numInput}
              />
              <input
                value={l.price}
                type="number"
                className="num"
                onChange={(e) => updateLine(kind, docId, l.id, 'price', e.target.value)}
                style={numInput}
              />
              <select
                value={l.vat}
                className="num"
                onChange={(e) => updateLine(kind, docId, l.id, 'vat', e.target.value)}
                style={{ ...numInput, padding: '8px 4px', background: colors.surface }}
              >
                <option value="21">21%</option>
                <option value="9">9%</option>
                <option value="0">0%</option>
              </select>
              <span className="num" style={{ textAlign: 'right', fontSize: 13, fontWeight: 500 }}>
                {euro(l.qty * l.price)}
              </span>
              <button
                onClick={() => removeLine(kind, docId, l.id)}
                aria-label="Regel verwijderen"
                style={{
                  border: 'none',
                  background: 'none',
                  color: colors.faint,
                  cursor: 'pointer',
                  fontSize: 16,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </>
      )}

      <button
        onClick={() => addLine(kind, docId)}
        style={{
          marginTop: 6,
          padding: '8px 12px',
          border: `1px dashed ${colors.borderStrong}`,
          background: colors.rowHover,
          borderRadius: 8,
          color: colors.muted,
          fontSize: 13,
          cursor: 'pointer',
          fontWeight: 500,
        }}
      >
        + Regel toevoegen
      </button>

      <div
        style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: `1px solid ${colors.borderSoft}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 9,
          fontSize: 13.5,
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
            fontWeight: 600,
            fontSize: 15,
            paddingTop: 7,
            borderTop: `1px solid ${colors.borderSoft}`,
          }}
        >
          <span>{totalLabel}</span>
          <span className="num">{euro(totaal)}</span>
        </div>
      </div>
    </div>
  )
}
