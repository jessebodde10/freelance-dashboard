import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from './auth'
import { datePlusDays, shortDate } from './data'
import * as db from './lib/db'
import { debounce, type Debounced } from './lib/debounce'
import type {
  Client,
  Invoice,
  InvoiceStatus,
  LineItem,
  Project,
  ProjectStatus,
  Quote,
  QuoteStatus,
  TimeEntry,
  VatRate,
} from './types'

export type DashVariant = 'a' | 'b'
export type SaveState = 'idle' | 'saving' | 'saved'
type DocKind = 'quote' | 'invoice'

interface Store {
  loading: boolean
  error: string | null
  saveState: SaveState

  clients: Client[]
  projects: Project[]
  quotes: Quote[]
  invoices: Invoice[]

  dashVariant: DashVariant
  setDashVariant: (v: DashVariant) => void

  projectFilter: string
  setProjectFilter: (v: string) => void
  quoteFilter: string
  setQuoteFilter: (v: string) => void
  invoiceFilter: string
  setInvoiceFilter: (v: string) => void

  getQuote: (id: string) => Quote | undefined
  getInvoice: (id: string) => Invoice | undefined

  addClient: (c: Omit<Client, 'id'>) => Promise<Client>
  addProject: (p: Omit<Project, 'id'>) => Promise<Project>
  setProjectStatus: (id: string, status: ProjectStatus) => void
  addTimeEntry: (projectId: string, entry: Omit<TimeEntry, 'id'>) => void
  removeTimeEntry: (projectId: string, entryId: number) => void

  addLine: (kind: DocKind, docId: string) => void
  updateLine: (
    kind: DocKind,
    docId: string,
    lineId: number,
    field: keyof LineItem,
    value: string,
  ) => void
  removeLine: (kind: DocKind, docId: string, lineId: number) => void
  setDocClient: (kind: DocKind, docId: string, klantId: string) => void
  setQuoteGeldigTot: (docId: string, value: string) => void
  setInvoiceVerval: (docId: string, value: string) => void
  setQuoteStatus: (docId: string, status: QuoteStatus) => void
  setInvoiceStatus: (docId: string, status: InvoiceStatus) => void

  createDraftQuote: () => Promise<string>
  createDraftInvoice: () => Promise<string>
}

const StoreContext = createContext<Store | null>(null)

function coerce(field: keyof LineItem, value: string): string | number {
  if (field === 'qty' || field === 'price') return parseFloat(value) || 0
  if (field === 'vat') return (parseInt(value, 10) || 0) as VatRate
  return value
}

function blankLine(): LineItem {
  return { id: Date.now() + Math.floor(Math.random() * 1000), desc: '', qty: 1, price: 0, vat: 21 }
}

function nextNr(prefix: string, existing: string[]): string {
  const year = new Date().getFullYear()
  const max = existing.reduce((m, nr) => {
    const n = Number(nr.split('-').pop())
    return Number.isFinite(n) ? Math.max(m, n) : m
  }, 0)
  return `${prefix}${year}-${String(max + 1).padStart(3, '0')}`
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const userId = user?.id ?? null

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('idle')

  // Flash "saved" briefly after a successful persist, then settle to idle.
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const markSaved = useCallback(() => {
    setSaveState('saved')
    if (savedTimer.current) clearTimeout(savedTimer.current)
    savedTimer.current = setTimeout(() => setSaveState('idle'), 1600)
  }, [])
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])

  const [dashVariant, setDashVariant] = useState<DashVariant>('a')
  const [projectFilter, setProjectFilter] = useState('alle')
  const [quoteFilter, setQuoteFilter] = useState('alle')
  const [invoiceFilter, setInvoiceFilter] = useState('alle')

  // Keep synchronous mirrors so mutations can compute the row to persist.
  const quotesRef = useRef<Quote[]>([])
  const invoicesRef = useRef<Invoice[]>([])
  const projectsRef = useRef<Project[]>([])
  quotesRef.current = quotes
  invoicesRef.current = invoices
  projectsRef.current = projects

  // Load (or clear) the user's data whenever the signed-in user changes.
  useEffect(() => {
    if (!userId) {
      setClients([])
      setProjects([])
      setQuotes([])
      setInvoices([])
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    db.fetchUserData()
      .then((d) => {
        if (cancelled) return
        setClients(d.clients)
        setProjects(d.projects)
        setQuotes(d.quotes)
        setInvoices(d.invoices)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Laden mislukt')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  // One debounced saver per document id, persisting the whole row.
  const savers = useRef(new Map<string, Debounced<[Quote | Invoice]>>())
  const saverFor = useCallback((kind: DocKind, id: string) => {
    const key = `${kind}:${id}`
    let saver = savers.current.get(key)
    if (!saver) {
      saver = debounce<[Quote | Invoice]>((doc) => {
        setSaveState('saving')
        const op = kind === 'quote' ? db.saveQuote(doc as Quote) : db.saveInvoice(doc as Invoice)
        op.then(markSaved).catch((e) => setError(e instanceof Error ? e.message : 'Opslaan mislukt'))
      }, 500)
      savers.current.set(key, saver)
    }
    return saver
  }, [markSaved])

  const editQuote = useCallback(
    (id: string, updater: (q: Quote) => Quote) => {
      const current = quotesRef.current.find((q) => q.id === id)
      if (!current) return
      const updated = updater(current)
      setQuotes((qs) => qs.map((q) => (q.id === id ? updated : q)))
      saverFor('quote', id)(updated)
    },
    [saverFor],
  )
  const editInvoice = useCallback(
    (id: string, updater: (i: Invoice) => Invoice) => {
      const current = invoicesRef.current.find((i) => i.id === id)
      if (!current) return
      const updated = updater(current)
      setInvoices((is) => is.map((i) => (i.id === id ? updated : i)))
      saverFor('invoice', id)(updated)
    },
    [saverFor],
  )

  const withLines = (kind: DocKind, id: string, fn: (lines: LineItem[]) => LineItem[]) => {
    if (kind === 'quote') editQuote(id, (q) => ({ ...q, lines: fn(q.lines) }))
    else editInvoice(id, (i) => ({ ...i, lines: fn(i.lines) }))
  }

  const addLine = useCallback((kind: DocKind, docId: string) => {
    withLines(kind, docId, (lines) => [...lines, blankLine()])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editQuote, editInvoice])

  const updateLine = useCallback(
    (kind: DocKind, docId: string, lineId: number, field: keyof LineItem, value: string) => {
      withLines(kind, docId, (lines) =>
        lines.map((l) => (l.id === lineId ? { ...l, [field]: coerce(field, value) } : l)),
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editQuote, editInvoice],
  )

  const removeLine = useCallback(
    (kind: DocKind, docId: string, lineId: number) => {
      withLines(kind, docId, (lines) => lines.filter((l) => l.id !== lineId))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editQuote, editInvoice],
  )

  const setDocClient = useCallback(
    (kind: DocKind, docId: string, klantId: string) => {
      if (kind === 'quote') editQuote(docId, (q) => ({ ...q, klantId }))
      else editInvoice(docId, (i) => ({ ...i, klantId }))
    },
    [editQuote, editInvoice],
  )
  const setQuoteGeldigTot = useCallback(
    (docId: string, value: string) => editQuote(docId, (q) => ({ ...q, geldigTot: value })),
    [editQuote],
  )
  const setInvoiceVerval = useCallback(
    (docId: string, value: string) => editInvoice(docId, (i) => ({ ...i, verval: value })),
    [editInvoice],
  )
  const setQuoteStatus = useCallback(
    (docId: string, status: QuoteStatus) => editQuote(docId, (q) => ({ ...q, status })),
    [editQuote],
  )
  const setInvoiceStatus = useCallback(
    (docId: string, status: InvoiceStatus) => editInvoice(docId, (i) => ({ ...i, status })),
    [editInvoice],
  )

  const addClient = useCallback(
    async (c: Omit<Client, 'id'>) => {
      if (!userId) throw new Error('Niet ingelogd')
      const created = await db.insertClient(userId, c)
      setClients((cs) => [...cs, created])
      return created
    },
    [userId],
  )

  const addProject = useCallback(
    async (p: Omit<Project, 'id'>) => {
      if (!userId) throw new Error('Niet ingelogd')
      const created = await db.insertProject(userId, p)
      setProjects((ps) => [...ps, created])
      return created
    },
    [userId],
  )

  // Projects mutate rarely (status, hours), so persist immediately.
  const editProject = useCallback((id: string, updater: (p: Project) => Project) => {
    const current = projectsRef.current.find((p) => p.id === id)
    if (!current) return
    const updated = updater(current)
    setProjects((ps) => ps.map((p) => (p.id === id ? updated : p)))
    setSaveState('saving')
    db.saveProject(updated)
      .then(markSaved)
      .catch((e) => setError(e instanceof Error ? e.message : 'Opslaan mislukt'))
  }, [markSaved])

  const setProjectStatus = useCallback(
    (id: string, status: ProjectStatus) => editProject(id, (p) => ({ ...p, status })),
    [editProject],
  )

  const addTimeEntry = useCallback(
    (projectId: string, entry: Omit<TimeEntry, 'id'>) =>
      editProject(projectId, (p) => {
        const entries = [
          ...p.entries,
          { ...entry, id: Date.now() + Math.floor(Math.random() * 1000) },
        ]
        return { ...p, entries, uren: entries.reduce((s, e) => s + e.uren, 0) }
      }),
    [editProject],
  )

  const removeTimeEntry = useCallback(
    (projectId: string, entryId: number) =>
      editProject(projectId, (p) => {
        const entries = p.entries.filter((e) => e.id !== entryId)
        return { ...p, entries, uren: entries.reduce((s, e) => s + e.uren, 0) }
      }),
    [editProject],
  )

  const createDraftQuote = useCallback(async () => {
    if (!userId) throw new Error('Niet ingelogd')
    const draft: Omit<Quote, 'id'> = {
      nr: nextNr('OFF-', quotesRef.current.map((q) => q.nr)),
      klantId: clients[0]?.id ?? '',
      project: '',
      status: 'concept',
      datum: shortDate(),
      geldigTot: datePlusDays(14),
      lines: [blankLine()],
    }
    const created = await db.insertQuote(userId, draft)
    setQuotes((qs) => [created, ...qs])
    return created.id
  }, [userId, clients])

  const createDraftInvoice = useCallback(async () => {
    if (!userId) throw new Error('Niet ingelogd')
    const draft: Omit<Invoice, 'id'> = {
      nr: nextNr('', invoicesRef.current.map((i) => i.nr)),
      klantId: clients[0]?.id ?? '',
      status: 'open',
      verval: datePlusDays(14),
      datum: shortDate(),
      lines: [blankLine()],
    }
    const created = await db.insertInvoice(userId, draft)
    setInvoices((is) => [created, ...is])
    return created.id
  }, [userId, clients])

  const value = useMemo<Store>(
    () => ({
      loading,
      error,
      saveState,
      clients,
      projects,
      quotes,
      invoices,
      dashVariant,
      setDashVariant,
      projectFilter,
      setProjectFilter,
      quoteFilter,
      setQuoteFilter,
      invoiceFilter,
      setInvoiceFilter,
      getQuote: (id) => quotes.find((q) => q.id === id),
      getInvoice: (id) => invoices.find((i) => i.id === id),
      addClient,
      addProject,
      setProjectStatus,
      addTimeEntry,
      removeTimeEntry,
      addLine,
      updateLine,
      removeLine,
      setDocClient,
      setQuoteGeldigTot,
      setInvoiceVerval,
      setQuoteStatus,
      setInvoiceStatus,
      createDraftQuote,
      createDraftInvoice,
    }),
    [
      loading,
      error,
      saveState,
      clients,
      projects,
      quotes,
      invoices,
      dashVariant,
      projectFilter,
      quoteFilter,
      invoiceFilter,
      addClient,
      addProject,
      setProjectStatus,
      addTimeEntry,
      removeTimeEntry,
      addLine,
      updateLine,
      removeLine,
      setDocClient,
      setQuoteGeldigTot,
      setInvoiceVerval,
      setQuoteStatus,
      setInvoiceStatus,
      createDraftQuote,
      createDraftInvoice,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

export function useLookups() {
  const { clients, quotes, invoices, projects } = useStore()
  return useMemo(
    () => ({
      clientById: (id: string) => clients.find((c) => c.id === id),
      clientName: (id: string) => clients.find((c) => c.id === id)?.bedrijf ?? '',
      quoteById: (id: string) => quotes.find((q) => q.id === id),
      invoicesOf: (klantId: string) => invoices.filter((i) => i.klantId === klantId),
      projectsOf: (klantId: string) => projects.filter((p) => p.klantId === klantId),
      quotesOf: (klantId: string) => quotes.filter((q) => q.klantId === klantId),
    }),
    [clients, quotes, invoices, projects],
  )
}
