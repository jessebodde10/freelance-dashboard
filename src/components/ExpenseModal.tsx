import { useState } from 'react'
import { shortDate } from '../data'
import { useStore } from '../store'
import { accent, colors } from '../theme'
import { EXPENSE_CATEGORIES, type Expense, type VatRate } from '../types'
import { Modal } from './Modal'
import { AuthError, Field, inputStyle, labelStyle } from './AuthLayout'

export function ExpenseModal({
  expense,
  onClose,
}: {
  expense?: Expense
  onClose: () => void
}) {
  const { addExpense, updateExpense } = useStore()
  const isEdit = !!expense

  const [omschrijving, setOmschrijving] = useState(expense?.omschrijving ?? '')
  const [bedrag, setBedrag] = useState(String(expense?.bedrag ?? ''))
  const [btw, setBtw] = useState<VatRate>(expense?.btw ?? 21)
  const [categorie, setCategorie] = useState(expense?.categorie ?? EXPENSE_CATEGORIES[0])
  const [datum, setDatum] = useState(expense?.datum ?? shortDate())
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!omschrijving.trim()) {
      setError('Geef de kostenpost een omschrijving.')
      return
    }
    const bedragNum = parseFloat(bedrag.replace(',', '.'))
    if (!Number.isFinite(bedragNum) || bedragNum <= 0) {
      setError('Vul een geldig bedrag in.')
      return
    }
    setBusy(true)
    setError('')
    try {
      if (isEdit) {
        await updateExpense({ ...expense, omschrijving: omschrijving.trim(), bedrag: bedragNum, btw, categorie, datum })
      } else {
        await addExpense({ omschrijving: omschrijving.trim(), bedrag: bedragNum, btw, categorie, datum })
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Opslaan mislukt')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title={isEdit ? 'Kostenpost bewerken' : 'Nieuwe kostenpost'} onClose={onClose}>
      <form onSubmit={submit}>
        <AuthError message={error} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field
            label="Omschrijving"
            value={omschrijving}
            onChange={setOmschrijving}
            placeholder="Bijv. Adobe-abonnement"
            required
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Bedrag excl. BTW" value={bedrag} onChange={setBedrag} placeholder="0,00" required />
            <label style={{ display: 'block' }}>
              <span style={labelStyle}>BTW</span>
              <select value={btw} onChange={(e) => setBtw(Number(e.target.value) as VatRate)} style={inputStyle}>
                <option value="21">21%</option>
                <option value="9">9%</option>
                <option value="0">0%</option>
              </select>
            </label>
          </div>
          <label style={{ display: 'block' }}>
            <span style={labelStyle}>Categorie</span>
            <select value={categorie} onChange={(e) => setCategorie(e.target.value as Expense['categorie'])} style={inputStyle}>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <Field label="Datum" value={datum} onChange={setDatum} placeholder="1 jul 2026" />
        </div>
        <p style={{ margin: '12px 2px 0', fontSize: 12, color: colors.subtle }}>
          Bedrag excl. BTW invullen; de BTW wordt hierboven apart berekend, net als bij offertes en facturen.
        </p>
        <button
          type="submit"
          disabled={busy}
          style={{
            marginTop: 16,
            width: '100%',
            padding: 11,
            background: accent.solid,
            color: '#fff',
            border: 'none',
            borderRadius: 9,
            fontSize: 14,
            fontWeight: 600,
            cursor: busy ? 'default' : 'pointer',
            opacity: busy ? 0.7 : 1,
          }}
        >
          {busy ? 'Bezig…' : 'Kostenpost opslaan'}
        </button>
      </form>
    </Modal>
  )
}
