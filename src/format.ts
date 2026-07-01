import type { LineItem } from './types'

const nf2 = new Intl.NumberFormat('nl-NL', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
const nf0 = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 0 })

/** € 1.234,56 — full precision, for invoice amounts. */
export const euro = (n: number): string => `€ ${nf2.format(n)}`

/** € 1.234 — rounded, for KPI figures and quote subtotals. */
export const euro0 = (n: number): string => `€ ${nf0.format(n)}`

/** 3.5 -> "3,5" for Dutch decimal display of hours. */
export const dutchNum = (n: number): string => String(n).replace('.', ',')

/** Initials from a company name, e.g. "Bloem & Co" -> "BC". */
export const initials = (bedrijf: string): string =>
  bedrijf
    .split(/[\s&]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

export interface BtwGroup {
  pct: number
  bedrag: number
}

export interface Totals {
  subtotaal: number
  btwGroups: BtwGroup[]
  totaal: number
}

/** Subtotal, per-rate btw groups and grand total for a set of line items. */
export function computeTotals(lines: LineItem[]): Totals {
  const subtotaal = lines.reduce((s, l) => s + l.qty * l.price, 0)
  const groups: Record<number, number> = {}
  for (const l of lines) {
    groups[l.vat] = (groups[l.vat] || 0) + (l.qty * l.price * l.vat) / 100
  }
  const btwGroups = Object.keys(groups)
    .map(Number)
    .sort((a, b) => b - a)
    .map((pct) => ({ pct, bedrag: groups[pct] }))
  const totaal = subtotaal + btwGroups.reduce((s, g) => s + g.bedrag, 0)
  return { subtotaal, btwGroups, totaal }
}

/** Ex-btw subtotal only (used for quote list/summary amounts). */
export const subtotalOf = (lines: LineItem[]): number =>
  lines.reduce((s, l) => s + l.qty * l.price, 0)

/** Incl-btw grand total (used for invoice list/summary amounts). */
export const totalOf = (lines: LineItem[]): number => computeTotals(lines).totaal
