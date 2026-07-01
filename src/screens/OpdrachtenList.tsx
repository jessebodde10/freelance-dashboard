import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { dutchNum } from '../format'
import { colors } from '../theme'
import { useLookups, useStore } from '../store'
import type { LayoutContext } from '../components/Layout'
import { Card, FilterChips, PageHeader, PrimaryButton } from '../components/ui'
import { Pill } from '../components/Pill'
import { EmptyState } from '../components/EmptyState'
import { NewProjectModal } from '../components/NewProjectModal'

const filterOptions = [
  { key: 'alle', label: 'Alle' },
  { key: 'concept', label: 'Concept' },
  { key: 'lopend', label: 'Lopend' },
  { key: 'afgerond', label: 'Afgerond' },
  { key: 'gefactureerd', label: 'Gefactureerd' },
]

const GRID = '2fr 1.4fr 1.1fr 1fr 0.8fr'

export function OpdrachtenList() {
  const { isMobile } = useOutletContext<LayoutContext>()
  const navigate = useNavigate()
  const { projects, projectFilter, setProjectFilter } = useStore()
  const { clientName } = useLookups()
  const [showNew, setShowNew] = useState(false)

  const rows = projects
    .filter((p) => projectFilter === 'alle' || p.status === projectFilter)
    .map((p) => ({
      id: p.id,
      naam: p.naam,
      klant: clientName(p.klantId),
      status: p.status,
      deadline: `${p.deadline} 2026`,
      uren: `${dutchNum(p.uren)} u`,
    }))

  const modal = showNew && (
    <NewProjectModal onClose={() => setShowNew(false)} onCreated={(p) => navigate(`/opdrachten/${p.id}`)} />
  )

  if (projects.length === 0) {
    return (
      <>
        <PageHeader
          title="Opdrachten"
          actions={
            <PrimaryButton onClick={() => setShowNew(true)}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Nieuwe opdracht
            </PrimaryButton>
          }
        />
        <EmptyState
          title="Nog geen opdrachten"
          hint="Maak je eerste opdracht aan om uren, deadlines en facturen bij te houden."
          action={
            <PrimaryButton onClick={() => setShowNew(true)}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Nieuwe opdracht
            </PrimaryButton>
          }
        />
        {modal}
      </>
    )
  }

  const header = (
    <>
      <PageHeader
        title="Opdrachten"
        actions={
          <PrimaryButton onClick={() => setShowNew(true)}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Nieuwe opdracht
          </PrimaryButton>
        }
      />
      <FilterChips options={filterOptions} value={projectFilter} onChange={setProjectFilter} />
    </>
  )

  if (isMobile) {
    return (
      <>
        {header}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {rows.map((p) => (
            <Card key={p.id} hoverable style={{ padding: 14 }} onClick={() => navigate(`/opdrachten/${p.id}`)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{p.naam}</span>
                <Pill status={p.status} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: colors.muted }}>
                <span>{p.klant}</span>
                <span className="num">{p.uren} · {p.deadline}</span>
              </div>
            </Card>
          ))}
          {rows.length === 0 && (
            <div style={{ color: colors.subtle, fontSize: 13, padding: '8px 2px' }}>
              Geen opdrachten met deze status.
            </div>
          )}
        </div>
        {modal}
      </>
    )
  }

  return (
    <>
      {header}
      <Card style={{ overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: GRID,
            padding: '11px 18px',
            background: colors.rowHover,
            borderBottom: '1px solid #eceef1',
            fontSize: 12,
            fontWeight: 500,
            color: colors.subtle,
          }}
        >
          <span>Opdracht</span>
          <span>Klant</span>
          <span>Status</span>
          <span>Deadline</span>
          <span style={{ textAlign: 'right' }}>Uren</span>
        </div>
        {rows.map((p) => (
          <div
            key={p.id}
            className="row-hoverable"
            onClick={() => navigate(`/opdrachten/${p.id}`)}
            style={{
              display: 'grid',
              gridTemplateColumns: GRID,
              alignItems: 'center',
              padding: '14px 18px',
              borderTop: `1px solid ${colors.borderSoft}`,
              cursor: 'pointer',
            }}
          >
            <span style={{ fontWeight: 500 }}>{p.naam}</span>
            <span style={{ color: colors.text }}>{p.klant}</span>
            <span>
              <Pill status={p.status} />
            </span>
            <span className="num" style={{ color: colors.text, fontSize: 13 }}>{p.deadline}</span>
            <span className="num" style={{ textAlign: 'right', color: colors.text }}>{p.uren}</span>
          </div>
        ))}
        {rows.length === 0 && (
          <div style={{ color: colors.subtle, fontSize: 13, padding: '16px 18px', borderTop: `1px solid ${colors.borderSoft}` }}>
            Geen opdrachten met deze status.
          </div>
        )}
      </Card>
      {modal}
    </>
  )
}
