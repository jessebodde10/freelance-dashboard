// Domain models for the Kompas freelancer dashboard.

export type ProjectStatus = 'concept' | 'lopend' | 'afgerond' | 'gefactureerd'
export type QuoteStatus =
  | 'concept'
  | 'verstuurd'
  | 'geaccepteerd'
  | 'geweigerd'
  | 'verlopen'
export type InvoiceStatus = 'open' | 'betaald' | 'te laat'

export type VatRate = 21 | 9 | 0

export interface Profile {
  id: string
  email: string
  voornaam: string
  achternaam: string
  bedrijf: string
  adres: string
  postcode: string
  plaats: string
  iban: string
  kvk: string
  btw: string
}

/** Fields collected during registration (everything on Profile except id/email). */
export type ProfileInput = Omit<Profile, 'id' | 'email'>

export interface Client {
  id: string
  bedrijf: string
  contact: string
  email: string
  plaats: string
}

export interface TimeEntry {
  id: number
  datum: string
  oms: string
  uren: number
}

export interface Project {
  id: string
  naam: string
  klantId: string
  status: ProjectStatus
  deadline: string
  uren: number
  raming: number
  tarief: number
  offerteId: string
  entries: TimeEntry[]
}

export interface LineItem {
  id: number
  desc: string
  qty: number
  price: number
  vat: VatRate
}

export interface Quote {
  id: string
  nr: string
  klantId: string
  project: string
  status: QuoteStatus
  datum: string
  geldigTot: string
  lines: LineItem[]
}

export interface Invoice {
  id: string
  nr: string
  klantId: string
  status: InvoiceStatus
  verval: string
  datum: string
  lines: LineItem[]
}

export interface ChartPoint {
  label: string
  v: number
}
