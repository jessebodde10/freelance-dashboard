// No seed/business data lives here anymore — every account starts empty and
// all clients, projects, quotes and invoices come from Supabase per user.
// This module only holds small presentation helpers.

const DAYS = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag']
const MONTHS = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
]
const MONTHS_SHORT = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']

/** "Woensdag 1 juli 2026" — today, for the dashboard greeting. */
export function todayLabel(d = new Date()): string {
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/** "1 jul 2026" — short date used on documents. */
export function shortDate(d = new Date()): string {
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`
}

/** A default due/validity date N days out, formatted like the documents. */
export function datePlusDays(days: number, from = new Date()): string {
  const d = new Date(from)
  d.setDate(d.getDate() + days)
  return shortDate(d)
}

/** Parse a short Dutch date like "1 jul 2026" back into a Date (or null). */
export function parseShortDate(s: string): Date | null {
  const m = s.trim().match(/^(\d{1,2})\s+([a-z]{3})\.?\s+(\d{4})$/i)
  if (!m) return null
  const month = MONTHS_SHORT.indexOf(m[2].toLowerCase())
  if (month < 0) return null
  return new Date(Number(m[3]), month, Number(m[1]))
}

/** Short month labels, exported for the revenue chart. */
export const monthShort = (d: Date): string => MONTHS_SHORT[d.getMonth()]

/** 1-4, the calendar quarter a date falls in. */
export function quarterOf(d: Date): number {
  return Math.floor(d.getMonth() / 3) + 1
}

/** "Q2 2026" label for the BTW-overview quarter picker. */
export function quarterLabel(year: number, q: number): string {
  return `Q${q} ${year}`
}

/** True when a date string (or its parsed date) falls in the given quarter. */
export function inQuarter(dateStr: string, year: number, q: number): boolean {
  const d = parseShortDate(dateStr)
  if (!d) return false
  return d.getFullYear() === year && quarterOf(d) === q
}

/** Step a {year, quarter} pair forward or backward by one quarter. */
export function shiftQuarter(year: number, q: number, delta: number): { year: number; q: number } {
  const total = year * 4 + (q - 1) + delta
  return { year: Math.floor(total / 4), q: (((total % 4) + 4) % 4) + 1 }
}

const RECURRENCE_MONTHS: Record<'maandelijks' | 'per_kwartaal' | 'jaarlijks', number> = {
  maandelijks: 1,
  per_kwartaal: 3,
  jaarlijks: 12,
}

/**
 * Advances a short Dutch date by a recurring-invoice interval. Falls back to
 * today when the source date can't be parsed, so a broken/empty date never
 * blocks the recurrence from advancing.
 */
export function advanceDate(dateStr: string, interval: 'maandelijks' | 'per_kwartaal' | 'jaarlijks'): string {
  const from = parseShortDate(dateStr) ?? new Date()
  const months = RECURRENCE_MONTHS[interval]
  const d = new Date(from)
  d.setMonth(d.getMonth() + months)
  return shortDate(d)
}

