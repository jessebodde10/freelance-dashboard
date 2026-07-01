import { Navigate, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { dutchNum, euro, euro0, initials, subtotalOf, totalOf } from '../format'
import { colors } from '../theme'
import { useLookups, useStore } from '../store'
import type { LayoutContext } from '../components/Layout'
import { BackLink, Card } from '../components/ui'
import { Pill } from '../components/Pill'

const sectionH2 = { margin: 0, fontSize: 14.5, fontWeight: 600 } as const

export function KlantDetail() {
  const { isMobile } = useOutletContext<LayoutContext>()
  const { id } = useParams()
  const navigate = useNavigate()
  const { clients } = useStore()
  const { invoicesOf, projectsOf, quotesOf } = useLookups()

  const c = clients.find((x) => x.id === id)
  if (!c) return <Navigate to="/klanten" replace />

  const inv = invoicesOf(c.id)
  const proj = projectsOf(c.id)
  const quo = quotesOf(c.id)
  const omzet = euro0(inv.filter((i) => i.status === 'betaald').reduce((s, i) => s + totalOf(i.lines), 0))
  const openstaand = euro0(inv.filter((i) => i.status !== 'betaald').reduce((s, i) => s + totalOf(i.lines), 0))

  const projectRows = (
    <Card style={{ overflow: 'hidden' }}>
      <div style={{ padding: '15px 18px 11px' }}>
        <h2 style={sectionH2}>Opdrachten</h2>
      </div>
      {proj.map((p) => (
        <div
          key={p.id}
          className="row-hoverable"
          onClick={() => navigate(`/opdrachten/${p.id}`)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            padding: '12px 18px',
            borderTop: `1px solid ${colors.borderSoft}`,
            cursor: 'pointer',
          }}
        >
          <div>
            <div style={{ fontWeight: 500, fontSize: 13.5 }}>{p.naam}</div>
            <div className="num" style={{ fontSize: 12, color: colors.subtle, marginTop: 2 }}>
              {dutchNum(p.uren)} u · {p.deadline}
            </div>
          </div>
          <Pill status={p.status} />
        </div>
      ))}
    </Card>
  )

  const quoteRows = (
    <Card style={{ overflow: 'hidden' }}>
      <div style={{ padding: '15px 18px 11px' }}>
        <h2 style={sectionH2}>Offertes</h2>
      </div>
      {quo.map((q) => (
        <div
          key={q.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            padding: '12px 18px',
            borderTop: `1px solid ${colors.borderSoft}`,
          }}
        >
          <div>
            <div className="num" style={{ fontWeight: 500, fontSize: 13 }}>{q.nr}</div>
            <div style={{ fontSize: 12, color: colors.subtle, marginTop: 2 }}>{q.project}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="num" style={{ fontWeight: 600, fontSize: 13 }}>{euro0(subtotalOf(q.lines))}</div>
            <Pill status={q.status} />
          </div>
        </div>
      ))}
    </Card>
  )

  const invoiceRows = (
    <Card style={{ overflow: 'hidden' }}>
      <div style={{ padding: '15px 18px 11px' }}>
        <h2 style={sectionH2}>Facturen</h2>
      </div>
      {inv.map((i) => (
        <div
          key={i.id}
          className="row-hoverable"
          onClick={() => navigate(`/facturen/${i.id}`)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            padding: '12px 18px',
            borderTop: `1px solid ${colors.borderSoft}`,
            cursor: 'pointer',
          }}
        >
          <div>
            <div className="num" style={{ fontWeight: 500, fontSize: 13 }}>{i.nr}</div>
            <div style={{ fontSize: 12, color: colors.subtle, marginTop: 2 }}>verval {i.verval}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="num" style={{ fontWeight: 600, fontSize: 13 }}>{euro(totalOf(i.lines))}</div>
            <Pill status={i.status} />
          </div>
        </div>
      ))}
    </Card>
  )

  if (isMobile) {
    return (
      <>
        <BackLink label="Terug" onClick={() => navigate('/klanten')} />
        <div style={{ fontSize: 13, color: colors.muted, marginBottom: 16 }}>
          {c.contact} · {c.plaats}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginBottom: 16 }}>
          <Card style={{ padding: 14 }}>
            <div style={{ fontSize: 11.5, color: colors.muted }}>Omzet</div>
            <div className="num" style={{ fontSize: 17, fontWeight: 600, marginTop: 4 }}>{omzet}</div>
          </Card>
          <Card style={{ padding: 14 }}>
            <div style={{ fontSize: 11.5, color: colors.muted }}>Openstaand</div>
            <div className="num" style={{ fontSize: 17, fontWeight: 600, marginTop: 4 }}>{openstaand}</div>
          </Card>
        </div>
        <div style={{ marginBottom: 16 }}>{projectRows}</div>
        {invoiceRows}
      </>
    )
  }

  return (
    <>
      <BackLink label="Klanten" onClick={() => navigate('/klanten')} />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 13,
            background: colors.borderSoft,
            color: colors.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            fontSize: 18,
            flex: 'none',
          }}
        >
          {initials(c.bedrijf)}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 23, fontWeight: 600, letterSpacing: '-0.02em' }}>{c.bedrijf}</h1>
          <p style={{ margin: '6px 0 0', color: colors.muted, fontSize: 14 }}>
            {c.contact} · {c.email} · {c.plaats}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 16 }}>
        <Card style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: 12.5, color: colors.muted }}>Totale omzet</div>
          <div className="num" style={{ fontSize: 22, fontWeight: 600, marginTop: 4 }}>{omzet}</div>
        </Card>
        <Card style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: 12.5, color: colors.muted }}>Openstaand</div>
          <div className="num" style={{ fontSize: 22, fontWeight: 600, marginTop: 4 }}>{openstaand}</div>
        </Card>
        <Card style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: 12.5, color: colors.muted }}>Opdrachten</div>
          <div className="num" style={{ fontSize: 22, fontWeight: 600, marginTop: 4 }}>{proj.length}</div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
        {projectRows}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {quoteRows}
          {invoiceRows}
        </div>
      </div>
    </>
  )
}
