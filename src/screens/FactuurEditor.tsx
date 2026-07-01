import { Navigate, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { colors } from '../theme'
import { useIdentity } from '../hooks/useIdentity'
import { useLookups, useStore } from '../store'
import type { LayoutContext } from '../components/Layout'
import { BackLink, Card, PrimaryButton, SecondaryButton } from '../components/ui'
import { Pill } from '../components/Pill'
import { LineItemsEditor } from '../components/LineItemsEditor'
import { DocumentPreview } from '../components/DocumentPreview'
import { DownloadIcon } from '../components/icons'

const fieldLabel = { fontSize: 12.5, color: colors.muted, display: 'block', marginBottom: 5 } as const
const fieldInput = {
  width: '100%',
  padding: '9px 11px',
  border: '1px solid #d3d7de',
  borderRadius: 8,
  fontSize: 13.5,
  color: colors.ink,
  background: '#fff',
} as const

export function FactuurEditor() {
  const { isMobile } = useOutletContext<LayoutContext>()
  const { id } = useParams()
  const navigate = useNavigate()
  const { getInvoice, clients, setDocClient, setInvoiceVerval } = useStore()
  const { clientById } = useLookups()
  const me = useIdentity()

  const invoice = id ? getInvoice(id) : undefined
  if (!invoice) return <Navigate to="/facturen" replace />

  const klant = clientById(invoice.klantId)

  const form = (
    <Card style={{ padding: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 22 }}>
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
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <SecondaryButton>
            <DownloadIcon />
            PDF-export
          </SecondaryButton>
          <PrimaryButton>Versturen</PrimaryButton>
        </div>
      </div>

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
