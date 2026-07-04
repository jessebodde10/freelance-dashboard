import { requireSupabase } from './supabase'
import type {
  Client,
  Expense,
  ExpenseCategory,
  Invoice,
  LineItem,
  Profile,
  ProfileInput,
  Project,
  ProjectStatus,
  Quote,
  QuoteStatus,
  InvoiceStatus,
  RecurrenceInterval,
  TimeEntry,
  VatRate,
} from '../types'

// ---- row shapes (snake_case, as stored in Postgres) ----
interface ClientRow {
  id: string
  bedrijf: string
  contact: string | null
  email: string | null
  plaats: string | null
}
interface ProjectRow {
  id: string
  naam: string
  klant_id: string | null
  status: string
  deadline: string | null
  uren: number
  raming: number
  tarief: number
  offerte_id: string | null
  time_entries: TimeEntry[] | null
}
interface QuoteRow {
  id: string
  nr: string
  klant_id: string | null
  project: string | null
  status: string
  datum: string | null
  geldig_tot: string | null
  notitie: string | null
  lines: LineItem[] | null
}
interface InvoiceRow {
  id: string
  nr: string
  klant_id: string | null
  status: string
  verval: string | null
  datum: string | null
  notitie: string | null
  lines: LineItem[] | null
  herhaling: string | null
  volgende_factuurdatum: string | null
}
interface ExpenseRow {
  id: string
  omschrijving: string
  bedrag: number
  btw: number
  categorie: string
  datum: string | null
}

// ---- mappers ----
const toClient = (r: ClientRow): Client => ({
  id: r.id,
  bedrijf: r.bedrijf,
  contact: r.contact ?? '',
  email: r.email ?? '',
  plaats: r.plaats ?? '',
})
const toProject = (r: ProjectRow): Project => ({
  id: r.id,
  naam: r.naam,
  klantId: r.klant_id ?? '',
  status: r.status as ProjectStatus,
  deadline: r.deadline ?? '',
  uren: Number(r.uren),
  raming: Number(r.raming),
  tarief: Number(r.tarief),
  offerteId: r.offerte_id ?? '',
  entries: r.time_entries ?? [],
})
const toQuote = (r: QuoteRow): Quote => ({
  id: r.id,
  nr: r.nr,
  klantId: r.klant_id ?? '',
  project: r.project ?? '',
  status: r.status as QuoteStatus,
  datum: r.datum ?? '',
  geldigTot: r.geldig_tot ?? '',
  notitie: r.notitie ?? '',
  lines: r.lines ?? [],
})
const toInvoice = (r: InvoiceRow): Invoice => ({
  id: r.id,
  nr: r.nr,
  klantId: r.klant_id ?? '',
  status: r.status as InvoiceStatus,
  verval: r.verval ?? '',
  datum: r.datum ?? '',
  notitie: r.notitie ?? '',
  lines: r.lines ?? [],
  herhaling: (r.herhaling ?? 'geen') as RecurrenceInterval,
  volgendeFactuurdatum: r.volgende_factuurdatum ?? '',
})
const toExpense = (r: ExpenseRow): Expense => ({
  id: r.id,
  omschrijving: r.omschrijving,
  bedrag: Number(r.bedrag),
  btw: Number(r.btw) as VatRate,
  categorie: r.categorie as ExpenseCategory,
  datum: r.datum ?? '',
})

// ---- profile ----
export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await requireSupabase()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return {
    id: data.id,
    email: data.email ?? '',
    voornaam: data.voornaam ?? '',
    achternaam: data.achternaam ?? '',
    bedrijf: data.bedrijf ?? '',
    adres: data.adres ?? '',
    postcode: data.postcode ?? '',
    plaats: data.plaats ?? '',
    telefoon: data.telefoon ?? '',
    website: data.website ?? '',
    iban: data.iban ?? '',
    kvk: data.kvk ?? '',
    btw: data.btw ?? '',
  }
}

export async function updateProfile(userId: string, input: ProfileInput): Promise<void> {
  const { error } = await requireSupabase()
    .from('profiles')
    .update({
      voornaam: input.voornaam,
      achternaam: input.achternaam,
      bedrijf: input.bedrijf,
      adres: input.adres,
      postcode: input.postcode,
      plaats: input.plaats,
      telefoon: input.telefoon,
      website: input.website,
      iban: input.iban,
      kvk: input.kvk,
      btw: input.btw,
    })
    .eq('id', userId)
  if (error) throw error
}

// ---- bulk load for the signed-in user ----
export interface UserData {
  clients: Client[]
  projects: Project[]
  quotes: Quote[]
  invoices: Invoice[]
  expenses: Expense[]
}

export async function fetchUserData(): Promise<UserData> {
  const sb = requireSupabase()
  const [clients, projects, quotes, invoices, expenses] = await Promise.all([
    sb.from('clients').select('*').order('created_at', { ascending: true }),
    sb.from('projects').select('*').order('created_at', { ascending: true }),
    sb.from('quotes').select('*').order('created_at', { ascending: false }),
    sb.from('invoices').select('*').order('created_at', { ascending: false }),
    sb.from('expenses').select('*').order('created_at', { ascending: false }),
  ])
  for (const r of [clients, projects, quotes, invoices, expenses]) if (r.error) throw r.error
  return {
    clients: (clients.data as ClientRow[]).map(toClient),
    projects: (projects.data as ProjectRow[]).map(toProject),
    quotes: (quotes.data as QuoteRow[]).map(toQuote),
    invoices: (invoices.data as InvoiceRow[]).map(toInvoice),
    expenses: (expenses.data as ExpenseRow[]).map(toExpense),
  }
}

// ---- inserts ----
export async function insertClient(
  userId: string,
  c: Omit<Client, 'id'>,
): Promise<Client> {
  const { data, error } = await requireSupabase()
    .from('clients')
    .insert({ user_id: userId, ...c })
    .select('*')
    .single()
  if (error) throw error
  return toClient(data as ClientRow)
}

export async function insertProject(
  userId: string,
  p: Omit<Project, 'id'>,
): Promise<Project> {
  const { data, error } = await requireSupabase()
    .from('projects')
    .insert({
      user_id: userId,
      naam: p.naam,
      klant_id: p.klantId || null,
      status: p.status,
      deadline: p.deadline,
      uren: p.uren,
      raming: p.raming,
      tarief: p.tarief,
      offerte_id: p.offerteId || null,
      time_entries: p.entries ?? [],
    })
    .select('*')
    .single()
  if (error) throw error
  return toProject(data as ProjectRow)
}

export async function saveProject(p: Project): Promise<void> {
  const { error } = await requireSupabase()
    .from('projects')
    .update({
      naam: p.naam,
      klant_id: p.klantId || null,
      status: p.status,
      deadline: p.deadline,
      uren: p.uren,
      raming: p.raming,
      tarief: p.tarief,
      offerte_id: p.offerteId || null,
      time_entries: p.entries,
    })
    .eq('id', p.id)
  if (error) throw error
}

export async function insertQuote(
  userId: string,
  q: Omit<Quote, 'id'>,
): Promise<Quote> {
  const { data, error } = await requireSupabase()
    .from('quotes')
    .insert({
      user_id: userId,
      nr: q.nr,
      klant_id: q.klantId || null,
      project: q.project,
      status: q.status,
      datum: q.datum,
      geldig_tot: q.geldigTot,
      notitie: q.notitie,
      lines: q.lines,
    })
    .select('*')
    .single()
  if (error) throw error
  return toQuote(data as QuoteRow)
}

export async function insertInvoice(
  userId: string,
  inv: Omit<Invoice, 'id'>,
): Promise<Invoice> {
  const { data, error } = await requireSupabase()
    .from('invoices')
    .insert({
      user_id: userId,
      nr: inv.nr,
      klant_id: inv.klantId || null,
      status: inv.status,
      verval: inv.verval,
      datum: inv.datum,
      notitie: inv.notitie,
      lines: inv.lines,
      herhaling: inv.herhaling,
      volgende_factuurdatum: inv.volgendeFactuurdatum || null,
    })
    .select('*')
    .single()
  if (error) throw error
  return toInvoice(data as InvoiceRow)
}

// ---- updates (used by the editors; fire-and-forget with debounce upstream) ----
export async function saveQuote(q: Quote): Promise<void> {
  const { error } = await requireSupabase()
    .from('quotes')
    .update({
      klant_id: q.klantId || null,
      project: q.project,
      status: q.status,
      geldig_tot: q.geldigTot,
      notitie: q.notitie,
      lines: q.lines,
    })
    .eq('id', q.id)
  if (error) throw error
}

export async function saveInvoice(inv: Invoice): Promise<void> {
  const { error } = await requireSupabase()
    .from('invoices')
    .update({
      klant_id: inv.klantId || null,
      status: inv.status,
      verval: inv.verval,
      notitie: inv.notitie,
      lines: inv.lines,
      herhaling: inv.herhaling,
      volgende_factuurdatum: inv.volgendeFactuurdatum || null,
    })
    .eq('id', inv.id)
  if (error) throw error
}

// ---- deletes ----
export async function deleteQuote(id: string): Promise<void> {
  const { error } = await requireSupabase().from('quotes').delete().eq('id', id)
  if (error) throw error
}

export async function deleteInvoice(id: string): Promise<void> {
  const { error } = await requireSupabase().from('invoices').delete().eq('id', id)
  if (error) throw error
}

// ---- expenses ----
export async function insertExpense(userId: string, e: Omit<Expense, 'id'>): Promise<Expense> {
  const { data, error } = await requireSupabase()
    .from('expenses')
    .insert({
      user_id: userId,
      omschrijving: e.omschrijving,
      bedrag: e.bedrag,
      btw: e.btw,
      categorie: e.categorie,
      datum: e.datum,
    })
    .select('*')
    .single()
  if (error) throw error
  return toExpense(data as ExpenseRow)
}

export async function saveExpense(e: Expense): Promise<void> {
  const { error } = await requireSupabase()
    .from('expenses')
    .update({
      omschrijving: e.omschrijving,
      bedrag: e.bedrag,
      btw: e.btw,
      categorie: e.categorie,
      datum: e.datum,
    })
    .eq('id', e.id)
  if (error) throw error
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await requireSupabase().from('expenses').delete().eq('id', id)
  if (error) throw error
}
