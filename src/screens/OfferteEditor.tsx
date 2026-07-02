import { useState } from 'react'
import { Navigate, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { colors } from '../theme'
import { requireSupabase } from '../lib/supabase'
import { useIdentity } from '../hooks/useIdentity'
import { useLookups, useStore } from '../store'
import type { LayoutContext } from '../components/Layout'
import { BackLink, Card, PrimaryButton, SaveIndicator, SecondaryButton } from '../components/ui'
import { Pill } from '../components/Pill'
import { LineItemsEditor } from '../components/LineItemsEditor'
import { DocumentPreview } from '../components/DocumentPreview'
import { DownloadIcon } from '../components/icons'
import { celebrate } from '../components/Celebration'

const fieldLabel = { fontSize: 12.5, color: colors.muted, display: 'block', marginBottom: 5 } as const
const fieldInput = {
  width: '100%',
  padding: '9px 11px',
  border: `1px solid ${colors.borderStrong}`,
  borderRadius: 8,
  fontSize: 13.5,
  color: colors.ink,
  background: colors.surface,
} as const

export function OfferteEditor() {
  const { isMobile } = useOutletContext<LayoutContext>()
  const { id } = useParams()
  const navigate = useNavigate()
  const { getQuote, clients, setDocClient, setQuoteGeldigTot, setQuoteStatus, saveState } = useStore()
  const { clientById } = useLookups()
  const me = useIdentity()

  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')

  const quote = id ? getQuote(id) : undefined
  if (!quote) return <Navigate to="/offertes" replace />

  const klant = clientById(quote.klantId)

  async function verstuur() {
    if (!quote) return
    setSendError('')
    if (!klant) {
      setSendError('Koppel eerst een klant aan de offerte.')
      return
    }
    if (!klant.email) {
      setSendError('Deze klant heeft geen e-mailadres. Voeg er een toe bij de klant.')
      return
    }
    setSending(true)
    try {
      const { quotePdfBase64 } = await import('../lib/pdf')
      const pdfBase64 = await quotePdfBase64(quote, klant, me)
      const { error } = await requireSupabase().functions.invoke('send-quote', {
        body: { quoteId: quote.id, pdfBase64 },
      })
      if (error) {
        let msg = error.message
        try {
          const body = await (error as { context?: Response }).context?.json?.()
          if (body?.error) msg = body.error
        } catch {
          /* keep default message */
        }
        throw new Error(msg)
      }
      setQuoteStatus(quote.id, 'verstuurd')
      celebrate('Offerte verzonden')
    } catch (e) {
      setSendError(e instanceof Error ? e.message : 'Versturen mislukt')
    } finally {
      setSending(false)
    }
  }

  const form = (
    <Card style={{ padding: 20 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
          gap: 14,
          marginBottom: 22,
        }}
      >
        <label style={{ display: 'block' }}>
          <span style={fieldLabel}>Klant</span>
          <select
            value={quote.klantId}
            onChange={(e) => setDocClient('quote', quote.id, e.target.value)}
            style={fieldInput}
          >
            {clients.length === 0 && <option value="">Nog geen klanten</option>}
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.bedrijf}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: 'block' }}>
          <span style={fieldLabel}>Status</span>
          <select
            value={quote.status}
            onChange={(e) => setQuoteStatus(quote.id, e.target.value as typeof quote.status)}
            style={fieldInput}
          >
            <option value="concept">Concept</option>
            <option value="verstuurd">Verstuurd</option>
            <option value="geaccepteerd">Geaccepteerd</option>
            <option value="geweigerd">Geweigerd</option>
            <option value="verlopen">Verlopen</option>
          </select>
        </label>
        <label style={{ display: 'block' }}>
          <span style={fieldLabel}>Geldig tot</span>
          <input
            value={quote.geldigTot}
            onChange={(e) => setQuoteGeldigTot(quote.id, e.target.value)}
            style={fieldInput}
          />
        </label>
      </div>

      <div style={{ fontSize: 12.5, color: colors.muted, fontWeight: 500, marginBottom: 8 }}>Regels</div>
      <LineItemsEditor kind="quote" docId={quote.id} lines={quote.lines} totalLabel="Totaal" />
    </Card>
  )

  const preview = (
    <DocumentPreview
      docType="OFFERTE"
      nr={quote.nr}
      datum={quote.datum}
      klantBedrijf={klant?.bedrijf ?? 'Nog geen klant gekozen'}
      klantContact={klant?.contact ?? ''}
      lines={quote.lines}
      totalLabel="Totaal"
      footer={
        <>
          IBAN {me.iban || '—'} · KVK {me.kvk || '—'} · BTW {me.btw || '—'}
          <br />
          Offerte geldig tot {quote.geldigTot}
        </>
      }
    />
  )

  return (
    <>
      <BackLink label="Offertes" onClick={() => navigate('/offertes')} />
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 22,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 className="num" style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>
            {quote.nr}
          </h1>
          <Pill status={quote.status} />
          <SaveIndicator state={saveState} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <SecondaryButton onClick={() => window.print()}>
            <DownloadIcon />
            PDF-export
          </SecondaryButton>
          {quote.status === 'concept' && (
            <PrimaryButton onClick={verstuur} disabled={sending}>
              {sending ? 'Versturen…' : 'Versturen'}
            </PrimaryButton>
          )}
          {quote.status === 'verstuurd' && (
            <PrimaryButton onClick={() => setQuoteStatus(quote.id, 'geaccepteerd')}>
              Markeer als geaccepteerd
            </PrimaryButton>
          )}
        </div>
      </div>

      {sendError && (
        <div
          style={{
            background: 'rgba(240,68,56,0.10)',
            color: colors.negative,
            border: `1px solid rgba(240,68,56,0.30)`,
            borderRadius: 9,
            padding: '10px 14px',
            fontSize: 13.5,
            marginBottom: 16,
          }}
        >
          {sendError}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.15fr 0.85fr',
          gap: 20,
          alignItems: 'start',
        }}
      >
        {form}
        {preview}
      </div>
    </>
  )
}
