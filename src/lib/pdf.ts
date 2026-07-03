import { computeTotals, euro } from '../format'
import type { Identity } from '../hooks/useIdentity'
import type { Client, Invoice, Quote } from '../types'

// A4 in points.
const PAGE_W = 595.28
const MARGIN = 48

interface DocInput {
  docType: 'OFFERTE' | 'FACTUUR'
  nr: string
  datum: string
  klant: Client | undefined
  me: Identity
  lines: Quote['lines']
  totalLabel: string
  footerLines: string[]
  status?: string
  notitie?: string
}

const STAMP_RGB: Record<string, [number, number, number]> = {
  concept: [138, 148, 166],
  verstuurd: [23, 92, 211],
  geaccepteerd: [6, 118, 71],
  geweigerd: [180, 35, 24],
  verlopen: [181, 71, 8],
  open: [181, 71, 8],
  betaald: [6, 118, 71],
  'te laat': [180, 35, 24],
}

/**
 * Builds a clean, vector document PDF (matching the on-screen preview) and
 * returns it as base64 (no data-URI prefix), ready as a Resend attachment.
 * jsPDF is imported dynamically so it stays out of the main bundle.
 */
async function buildPdfBase64(input: DocInput): Promise<string> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  const ink: [number, number, number] = [26, 31, 54]
  const gray: [number, number, number] = [105, 115, 134]
  const right = PAGE_W - MARGIN
  const { me, klant } = input
  let y = MARGIN + 8

  // ---- header: sender (left) + document meta (right) ----
  doc.setFont('helvetica', 'bold').setFontSize(13).setTextColor(...ink)
  doc.text(me.senderName || 'Jouw bedrijf', MARGIN, y)

  doc.setFont('helvetica', 'bold').setFontSize(16)
  doc.text(input.docType, right, y, { align: 'right' })

  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...gray)
  const senderLines = [
    me.bedrijf && me.fullName ? me.fullName : '',
    me.adres,
    [me.postcode, me.plaats].filter(Boolean).join(' '),
    [me.email, me.telefoon, me.website].filter(Boolean).join('  ·  '),
  ].filter(Boolean)
  let sy = y + 15
  for (const line of senderLines) {
    doc.text(line, MARGIN, sy)
    sy += 13
  }
  doc.text(input.nr, right, y + 15, { align: 'right' })
  doc.text(input.datum, right, y + 28, { align: 'right' })

  // Status stamp (bordered badge) under the date.
  const stamp = input.status ? STAMP_RGB[input.status] ?? STAMP_RGB.concept : null
  if (input.status && stamp) {
    const label = input.status.toUpperCase()
    doc.setFont('helvetica', 'bold').setFontSize(9)
    const boxW = doc.getTextWidth(label) + 12
    const by = y + 38
    doc.setDrawColor(...stamp).setLineWidth(1)
    doc.roundedRect(right - boxW, by, boxW, 15, 3, 3)
    doc.setTextColor(...stamp)
    doc.text(label, right - 6, by + 10, { align: 'right' })
  }

  y = Math.max(sy, y + 56) + 20

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
  for (const l of input.lines) {
    const descLines = doc.splitTextToSize(l.desc || '—', colQty - MARGIN - 12) as string[]
    doc.text(descLines, MARGIN, y)
    doc.text(String(l.qty), colQty, y, { align: 'right' })
    doc.text(euro(l.price), colPrice, y, { align: 'right' })
    doc.text(euro(l.qty * l.price), colAmount, y, { align: 'right' })
    y += Math.max(descLines.length, 1) * 13 + 9
    doc.setDrawColor(240, 241, 244).setLineWidth(0.5).line(MARGIN, y - 7, right, y - 7)
  }

  // ---- totals ----
  const { subtotaal, btwGroups, totaal } = computeTotals(input.lines)
  y += 20
  const labelX = right - 150
  const drawTotal = (label: string, value: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal').setFontSize(bold ? 12 : 10)
    doc.setTextColor(...(bold ? ink : gray))
    doc.text(label, labelX, y, { align: 'right' })
    doc.setTextColor(...ink)
    doc.text(value, colAmount, y, { align: 'right' })
    y += bold ? 20 : 17
  }
  drawTotal('Subtotaal', euro(subtotaal))
  for (const b of btwGroups) drawTotal(`BTW ${b.pct}%`, euro(b.bedrag))
  y += 5
  doc.setDrawColor(26, 31, 54).setLineWidth(0.8).line(labelX - 30, y - 10, right, y - 10)
  drawTotal(input.totalLabel, euro(totaal), true)

  // ---- optional note ----
  if (input.notitie && input.notitie.trim()) {
    y += 22
    doc.setDrawColor(240, 241, 244).setLineWidth(0.5).line(MARGIN, y - 10, right, y - 10)
    doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(...gray)
    doc.text('Notitie', MARGIN, y)
    y += 13
    doc.setTextColor(...ink)
    const noteLines = doc.splitTextToSize(input.notitie.trim(), right - MARGIN) as string[]
    doc.text(noteLines, MARGIN, y)
  }

  // ---- footer ----
  doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(...gray)
  let fy = 800
  for (const line of input.footerLines) {
    doc.text(line, PAGE_W / 2, fy, { align: 'center' })
    fy += 12
  }

  const dataUri = doc.output('datauristring')
  return dataUri.split(',')[1] ?? ''
}

const senderBlock = (me: Identity) =>
  `IBAN ${me.iban || '—'}  ·  KVK ${me.kvk || '—'}  ·  BTW ${me.btw || '—'}`

/** Offerte PDF (base64) for the send-quote e-mail attachment. */
export function quotePdfBase64(quote: Quote, klant: Client | undefined, me: Identity): Promise<string> {
  return buildPdfBase64({
    docType: 'OFFERTE',
    nr: quote.nr,
    datum: quote.datum,
    klant,
    me,
    lines: quote.lines,
    totalLabel: 'Totaal',
    status: quote.status,
    notitie: quote.notitie,
    footerLines: [senderBlock(me), `Offerte geldig tot ${quote.geldigTot}`],
  })
}

/** Factuur PDF (base64) for the send-invoice e-mail attachment. */
export function invoicePdfBase64(invoice: Invoice, klant: Client | undefined, me: Identity): Promise<string> {
  return buildPdfBase64({
    docType: 'FACTUUR',
    nr: invoice.nr,
    datum: invoice.datum,
    klant,
    me,
    lines: invoice.lines,
    totalLabel: 'Te betalen',
    status: invoice.status,
    notitie: invoice.notitie,
    footerLines: [
      `Gelieve te betalen voor ${invoice.verval} o.v.v. ${invoice.nr}`,
      senderBlock(me),
    ],
  })
}
