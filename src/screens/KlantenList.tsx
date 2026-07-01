import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { euro0, initials, totalOf } from '../format'
import { colors } from '../theme'
import { useLookups, useStore } from '../store'
import type { LayoutContext } from '../components/Layout'
import { Card, PageHeader, PrimaryButton } from '../components/ui'
import { EmptyState } from '../components/EmptyState'
import { NewClientModal } from '../components/NewClientModal'

export function KlantenList() {
  const { isMobile } = useOutletContext<LayoutContext>()
  const navigate = useNavigate()
  const { clients } = useStore()
  const { invoicesOf, projectsOf } = useLookups()
  const [showNew, setShowNew] = useState(false)

  const rows = clients.map((c) => {
    const open = invoicesOf(c.id)
      .filter((i) => i.status !== 'betaald')
      .reduce((s, i) => s + totalOf(i.lines), 0)
    return {
      id: c.id,
      bedrijf: c.bedrijf,
      contact: c.contact,
      initials: initials(c.bedrijf),
      openstaand: open > 0 ? euro0(open) : '—',
      opdrachtCount: String(projectsOf(c.id).length),
    }
  })

  const header = (
    <PageHeader
      title="Klanten"
      actions={
        <PrimaryButton onClick={() => setShowNew(true)}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Nieuwe klant
        </PrimaryButton>
      }
    />
  )

  const modal = showNew && (
    <NewClientModal
      onClose={() => setShowNew(false)}
      onCreated={(c) => navigate(`/klanten/${c.id}`)}
    />
  )

  if (clients.length === 0) {
    return (
      <>
        {header}
        <EmptyState
          title="Nog geen klanten"
          hint="Voeg je eerste klant toe om opdrachten, offertes en facturen te koppelen."
          action={
            <PrimaryButton onClick={() => setShowNew(true)}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Nieuwe klant
            </PrimaryButton>
          }
        />
        {modal}
      </>
    )
  }

  if (isMobile) {
    return (
      <>
        {header}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {rows.map((c) => (
            <Card key={c.id} hoverable style={{ padding: 14 }} onClick={() => navigate(`/klanten/${c.id}`)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: colors.borderSoft,
                    color: colors.text,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: 13,
                    flex: 'none',
                  }}
                >
                  {c.initials}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{c.bedrijf}</div>
                  <div style={{ fontSize: 12, color: colors.subtle }}>{c.contact}</div>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: 11,
                  borderTop: `1px solid ${colors.borderSoft}`,
                  fontSize: 12.5,
                }}
              >
                <span style={{ color: colors.subtle }}>
                  Openstaand{' '}
                  <span className="num" style={{ color: colors.ink, fontWeight: 600 }}>{c.openstaand}</span>
                </span>
                <span style={{ color: colors.subtle }}>
                  <span className="num" style={{ color: colors.ink, fontWeight: 600 }}>{c.opdrachtCount}</span>{' '}
                  opdrachten
                </span>
              </div>
            </Card>
          ))}
        </div>
        {modal}
      </>
    )
  }

  return (
    <>
      {header}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {rows.map((c) => (
          <Card key={c.id} hoverable style={{ padding: 18 }} onClick={() => navigate(`/klanten/${c.id}`)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: colors.borderSoft,
                  color: colors.text,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: 14,
                  flex: 'none',
                }}
              >
                {c.initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14.5 }}>{c.bedrijf}</div>
                <div style={{ fontSize: 12.5, color: colors.subtle }}>{c.contact}</div>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: 14,
                borderTop: `1px solid ${colors.borderSoft}`,
              }}
            >
              <div>
                <div style={{ fontSize: 11.5, color: colors.subtle }}>Openstaand</div>
                <div className="num" style={{ fontWeight: 600, fontSize: 14, marginTop: 2 }}>{c.openstaand}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11.5, color: colors.subtle }}>Opdrachten</div>
                <div className="num" style={{ fontWeight: 600, fontSize: 14, marginTop: 2 }}>{c.opdrachtCount}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {modal}
    </>
  )
}
