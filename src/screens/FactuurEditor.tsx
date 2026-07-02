import { useState } from 'react'
import { Navigate, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { colors } from '../theme'
import { useIdentity } from '../hooks/useIdentity'
import { useLookups, useStore } from '../store'
import { requireSupabase } from '../lib/supabase'
import { invoicePdfBase64 } from '../lib/pdf'
import type { LayoutContext } from '../components/Layout'
import { BackLink, Card, PrimaryButton, SaveIndicator, SecondaryButton } from '../components/ui'
import { Pill } from '../components/Pill'
import { LineItemsEditor } from '../components/LineItemsEditor'
import { DocumentPreview } from '../components/DocumentPreview'
import { DownloadIcon } from '../components/icons'
import { celebrate } from '../components/Celebration'

// Overridable edge-function slug (see the quote editor for why).
const SEND_INVOICE_FN = (import.meta.env.VITE_SEND_INVOICE_FN as string | undefined) || 'send-invoice'

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

export function FactuurEditor() {
  const { isMobile } = useOutletContext<LayoutContext>()
  const { id } = useParams()
  const navigate = useNavigate()
  const { getInvoice, clients, setDocClient, setInvoiceVerval, setInvoiceStatus, saveState } = useStore()
  const { clientById } = useLookups()
  const me = useIdentity()

  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')

  const invoice = id ? getInvoice(id) : undefined
  if (!invoice) return <Navigate to="/facturen" replace />

  const klant = clientById(invoice.klantId)

  async function verstuur() {
    if (!invoice) return
    setSendError('')
    if (!klant) {
      setSendError('Koppel eerst een klant aan de factuur.')
      return
    }
    if (!klant.email) {
      setSendError('Deze klant heeft geen e-mailadres. Voeg er een toe bij de klant.')
      return
    }
    setSending(true)
    try {
      const pdfBase64 = await invoicePdfBase64(invoice, klant, me)
      const { error } = await requireSupabase().functions.invoke(SEND_INVOICE_FN, {
        body: { invoiceId: invoice.id, pdfBase64 },
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
      celebrate('Factuur verzonden')
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
            value={invoice.klantId}
            onChange={(e) => setDocClient('invoice', invoice.id, e.target.value)}
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
            value={invoice.status}
            onChange={(e) => setInvoiceStatus(invoice.id, e.target.value as typeof invoice.status)}
            style={fieldInput}
          >
            <option value="open">Open</option>
            <option value="betaald">Betaald</option>
            <option value="te laat">Te laat</option>
          </select>
        </label>
        <label style={{ display: 'block' }}>
          <span style={fieldLabel}>Vervaldatum</span>
          <input
            value={invoice.verval}
            onChange={(e) => setInvoiceVerval(invoice.id, e.target.value)}
            style={fieldInput}
          />
        </label>
      </div>

      <LineItemsEditor kind="invoice" docId={invoice.id} lines={invoice.lines} totalLabel="Te betalen" />
    </Card>
  )

  const preview = (
    <DocumentPreview
      docType="FACTUUR"
      nr={invoice.nr}
      datum={invoice.datum}
      klantBedrijf={klant?.bedrijf ?? 'Nog geen klant gekozen'}
      klantContact={klant?.contact ?? ''}
      lines={invoice.lines}
      totalLabel="Te betalen"
      footer={
        <>
          Gelieve te betalen voor {invoice.verval} o.v.v. {invoice.nr}
          <br />
          IBAN {me.iban || '—'} · KVK {me.kvk || '—'} · BTW {me.btw || '—'}
        </>
      }
    />
  )

  return (
    <>
      <BackLink label="Facturen" onClick={() => navigate('/facturen')} />
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
            Factuur {invoice.nr}
          </h1>
          <Pill status={invoice.status} />
          <SaveIndicator state={saveState} />
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <SecondaryButton onClick={() => window.print()}>
            <DownloadIcon />
            PDF-export
          </SecondaryButton>
          {invoice.status === 'betaald' ? (
            <SecondaryButton onClick={() => setInvoiceStatus(invoice.id, 'open')}>
              Markeer als open
            </SecondaryButton>
          ) : (
            <SecondaryButton
              onClick={() => {
                setInvoiceStatus(invoice.id, 'betaald')
                celebrate('Factuur betaald')
              }}
            >
              Markeer als betaald
            </SecondaryButton>
          )}
          <PrimaryButton onClick={verstuur} disabled={sending}>
            {sending ? 'Versturen…' : 'Versturen per e-mail'}
          </PrimaryButton>
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
