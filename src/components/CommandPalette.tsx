import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { colors } from '../theme'
import { useStore } from '../store'

/** Fire this to open the palette from anywhere (sidebar/mobile triggers). */
export function openCommandPalette() {
  window.dispatchEvent(new CustomEvent('kompas:command-palette'))
}

interface Command {
  id: string
  label: string
  hint?: string
  group: string
  keywords?: string
  run: () => void | Promise<void>
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const { clients, projects, quotes, invoices, createDraftQuote, createDraftInvoice } = useStore()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const go = (to: string) => {
    onClose()
    navigate(to)
  }
  const clientName = (id: string) => clients.find((c) => c.id === id)?.bedrijf ?? ''

  const commands = useMemo<Command[]>(() => {
    const actions: Command[] = [
      {
        id: 'new-quote',
        label: 'Nieuwe offerte',
        group: 'Acties',
        keywords: 'offerte quote maken',
        run: async () => {
          const id = await createDraftQuote()
          go(`/offertes/${id}`)
        },
      },
      {
        id: 'new-invoice',
        label: 'Nieuwe factuur',
        group: 'Acties',
        keywords: 'factuur invoice maken',
        run: async () => {
          const id = await createDraftInvoice()
          go(`/facturen/${id}`)
        },
      },
      { id: 'nav-klanten-new', label: 'Nieuwe klant', group: 'Acties', keywords: 'klant toevoegen', run: () => go('/klanten') },
      { id: 'nav-opdr-new', label: 'Nieuwe opdracht', group: 'Acties', keywords: 'opdracht project toevoegen', run: () => go('/opdrachten') },
    ]
    const nav: Command[] = [
      { id: 'nav-dashboard', label: 'Dashboard', group: 'Navigatie', run: () => go('/') },
      { id: 'nav-opdrachten', label: 'Opdrachten', group: 'Navigatie', run: () => go('/opdrachten') },
      { id: 'nav-klanten', label: 'Klanten', group: 'Navigatie', run: () => go('/klanten') },
      { id: 'nav-offertes', label: 'Offertes', group: 'Navigatie', run: () => go('/offertes') },
      { id: 'nav-facturen', label: 'Facturen', group: 'Navigatie', run: () => go('/facturen') },
    ]
    const entities: Command[] = [
      ...clients.map((c) => ({
        id: `c-${c.id}`,
        label: c.bedrijf,
        hint: 'Klant',
        group: 'Klanten',
        keywords: `${c.contact} ${c.plaats}`,
        run: () => go(`/klanten/${c.id}`),
      })),
      ...projects.map((p) => ({
        id: `p-${p.id}`,
        label: p.naam,
        hint: `Opdracht · ${clientName(p.klantId)}`,
        group: 'Opdrachten',
        keywords: clientName(p.klantId),
        run: () => go(`/opdrachten/${p.id}`),
      })),
      ...quotes.map((q) => ({
        id: `q-${q.id}`,
        label: `${q.nr} — ${clientName(q.klantId)}`,
        hint: 'Offerte',
        group: 'Offertes',
        keywords: `${q.project} ${clientName(q.klantId)}`,
        run: () => go(`/offertes/${q.id}`),
      })),
      ...invoices.map((i) => ({
        id: `i-${i.id}`,
        label: `${i.nr} — ${clientName(i.klantId)}`,
        hint: 'Factuur',
        group: 'Facturen',
        keywords: clientName(i.klantId),
        run: () => go(`/facturen/${i.id}`),
      })),
    ]
    return [...actions, ...nav, ...entities]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clients, projects, quotes, invoices])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands.filter((c) => c.group === 'Acties' || c.group === 'Navigatie')
    return commands.filter(
      (c) => c.label.toLowerCase().includes(q) || (c.keywords ?? '').toLowerCase().includes(q),
    )
  }, [commands, query])

  // Reset selection when the result set changes; keep it in range.
  useEffect(() => {
    setActive(0)
  }, [query, open])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      // Focus after the panel mounts.
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  if (!open) return null

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      filtered[active]?.run()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  // Group headers are rendered inline as we walk the flat filtered list.
  let lastGroup = ''

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--overlay)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '12vh 16px 16px',
        zIndex: 200,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Snelzoeken"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
        style={{
          width: '100%',
          maxWidth: 560,
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: 14,
          boxShadow: '0 24px 70px rgba(16,24,40,0.35)',
          overflow: 'hidden',
        }}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Zoek of voer een actie uit…"
          style={{
            width: '100%',
            border: 'none',
            borderBottom: `1px solid ${colors.border}`,
            padding: '15px 18px',
            fontSize: 15,
            color: colors.ink,
            background: 'transparent',
          }}
        />
        <div ref={listRef} style={{ maxHeight: 360, overflowY: 'auto', padding: 6 }}>
          {filtered.length === 0 && (
            <div style={{ padding: '18px', color: colors.subtle, fontSize: 13.5, textAlign: 'center' }}>
              Geen resultaten voor “{query}”.
            </div>
          )}
          {filtered.map((c, idx) => {
            const showGroup = c.group !== lastGroup
            lastGroup = c.group
            const isActive = idx === active
            return (
              <div key={c.id}>
                {showGroup && (
                  <div
                    style={{
                      padding: '10px 12px 5px',
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      color: colors.faint,
                    }}
                  >
                    {c.group}
                  </div>
                )}
                <button
                  onMouseEnter={() => setActive(idx)}
                  onClick={() => c.run()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    width: '100%',
                    textAlign: 'left',
                    border: 'none',
                    background: isActive ? colors.rowHover : 'transparent',
                    color: colors.ink,
                    padding: '9px 12px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 13.5,
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.label}
                  </span>
                  {c.hint && (
                    <span style={{ flex: 'none', fontSize: 11.5, color: colors.subtle }}>{c.hint}</span>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
