import { computeTotals, euro } from '../format'
import type { Identity } from '../hooks/useIdentity'
import type { Client, Quote } from '../types'

// A4 in points.
const PAGE_W = 595.28
const MARGIN = 48

/**
 * Builds a clean, vector quote PDF (matching the on-screen document) and
 * returns it as base64 (no data-URI prefix), ready as a Resend attachment.
 * jsPDF is imported dynamically so it stays out of the main bundle.
 */
export async function quotePdfBase64(quote: Quote, klant: Client | undefined, me: Identity): Promise<string> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  const ink: [number, number, number] = [26, 31, 54]
  const gray: [number, number, number] = [105, 115, 134]
  const right = PAGE_W - MARGIN
  let y = MARGIN + 8

  // ---- header: sender (left) + document meta (right) ----
  doc.setFont('helvetica', 'bold').setFontSize(13).setTextColor(...ink)
  doc.text(me.senderName || 'Jouw bedrijf', MARGIN, y)

  doc.setFont('helvetica', 'bold').setFontSize(16)
  doc.text('OFFERTE', right, y, { align: 'right' })

  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...gray)
  const senderLines = [
    me.bedrijf && me.fullName ? me.fullName : '',
    me.adres,
    [me.postcode, me.plaats].filter(Boolean).join(' '),
  ].filter(Boolean)
  let sy = y + 15
  for (const line of senderLines) {
    doc.text(line, MARGIN, sy)
    sy += 13
  }
  doc.text(quote.nr, right, y + 15, { align: 'right' })
  doc.text(quote.datum, right, y + 28, { align: 'right' })

  y = Math.max(sy, y + 40) + 20

  // ---- recipient ----
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...gray)
  doc.text('Aan', MARGIN, y)
  doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(...ink)
  doc.text(klant?.bedrijf || 'Nog geen klant gekozen', MARGIN, y + 14)
  if (klant?.contact) {
    doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...gray)
    doc.text(`t.a.v. ${klant.contact}`, MARGIN, y + 27)
  }
  y += 52

  // ---- line items table ----
  const colQty = right - 250
  const colPrice = right - 150
  const colAmount = right

  doc.setFont('helvetica', 'bold').setFontSize(8.5).setTextColor(...gray)
  doc.text('OMSCHRIJVING', MARGIN, y)
  doc.text('AANTAL', colQty, y, { align: 'right' })
  doc.text('PRIJS', colPrice, y, { align: 'right' })
  doc.text('BEDRAG', colAmount, y, { align: 'right' })
  y += 6
  doc.setDrawColor(26, 31, 54).setLineWidth(0.8).line(MARGIN, y, right, y)
  y += 16

  doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(...ink)
  for (const l of quote.lines) {
    const descLines = doc.splitTextToSize(l.desc || '—', colQty - MARGIN - 12) as string[]
    doc.text(descLines, MARGIN, y)
    doc.text(String(l.qty), colQty, y, { align: 'right' })
    doc.text(euro(l.price), colPrice, y, { align: 'right' })
    doc.text(euro(l.qty * l.price), colAmount, y, { align: 'right' })
    y += Math.max(descLines.length, 1) * 13 + 6
    doc.setDrawColor(240, 241, 244).setLineWidth(0.5).line(MARGIN, y - 6, right, y - 6)
  }

  // ---- totals ----
  const { subtotaal, btwGroups, totaal } = computeTotals(quote.lines)
  y += 10
  const labelX = right - 150
  const drawTotal = (label: string, value: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal').setFontSize(bold ? 11 : 10)
    doc.setTextColor(...(bold ? ink : gray))
    doc.text(label, labelX, y, { align: 'right' })
    doc.setTextColor(...ink)
    doc.text(value, colAmount, y, { align: 'right' })
    y += bold ? 18 : 15
  }
  drawTotal('Subtotaal', euro(subtotaal))
  for (const b of btwGroups) drawTotal(`BTW ${b.pct}%`, euro(b.bedrag))
  y += 2
  doc.setDrawColor(26, 31, 54).setLineWidth(0.8).line(labelX - 30, y - 8, right, y - 8)
  drawTotal('Totaal', euro(totaal), true)

  // ---- footer ----
  doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(...gray)
  const footerY = 800
  const footer = [
    `IBAN ${me.iban || '—'}  ·  KVK ${me.kvk || '—'}  ·  BTW ${me.btw || '—'}`,
    `Offerte geldig tot ${quote.geldigTot}`,
  ]
  let fy = footerY
  for (const line of footer) {
    doc.text(line, PAGE_W / 2, fy, { align: 'center' })
    fy += 12
  }

  const dataUri = doc.output('datauristring')
  return dataUri.split(',')[1] ?? ''
}
