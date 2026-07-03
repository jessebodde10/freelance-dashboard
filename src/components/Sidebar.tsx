import { useState, type CSSProperties, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { accent, colors } from '../theme'
import { useAuth } from '../auth'
import { useIdentity } from '../hooks/useIdentity'
import { useStore } from '../store'
import { ThemeToggle } from './ui'
import { openCommandPalette } from './CommandPalette'
import { ProfileModal } from './ProfileModal'
import {
  BrandMark,
  DashboardIcon,
  FacturenIcon,
  KlantenIcon,
  OffertesIcon,
  OpdrachtenIcon,
} from './icons'

const items: { to: string; label: string; icon: ReactNode; end?: boolean }[] = [
  { to: '/', label: 'Dashboard', icon: <DashboardIcon />, end: true },
  { to: '/opdrachten', label: 'Opdrachten', icon: <OpdrachtenIcon /> },
  { to: '/klanten', label: 'Klanten', icon: <KlantenIcon /> },
  { to: '/offertes', label: 'Offertes', icon: <OffertesIcon /> },
  { to: '/facturen', label: 'Facturen', icon: <FacturenIcon /> },
]

const navBase: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '8px 10px',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 500,
  color: colors.text,
  cursor: 'pointer',
  width: '100%',
  textAlign: 'left',
  textDecoration: 'none',
}
const navActive: CSSProperties = {
  ...navBase,
  background: accent.soft,
  color: accent.ink,
  fontWeight: 600,
}

const quickBtn: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '8px 10px',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 500,
  color: colors.text,
  cursor: 'pointer',
  border: 'none',
  background: 'transparent',
  width: '100%',
  textAlign: 'left',
}

export function Sidebar() {
  const navigate = useNavigate()
  const { createDraftQuote, createDraftInvoice } = useStore()
  const { signOut } = useAuth()
  const identity = useIdentity()
  const [showProfile, setShowProfile] = useState(false)

  return (
    <aside
      style={{
        width: 246,
        flex: 'none',
        background: colors.surface,
        borderRight: `1px solid ${colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        padding: '18px 14px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px 20px' }}>
        <BrandMark />
        <span style={{ fontWeight: 600, fontSize: 15.5, letterSpacing: '-0.01em' }}>
          Freezo
        </span>
      </div>

      <button
        onClick={openCommandPalette}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          padding: '8px 10px',
          marginBottom: 12,
          border: `1px solid ${colors.border}`,
          borderRadius: 8,
          background: colors.rowHover,
          color: colors.muted,
          fontSize: 13,
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="7" cy="7" r="5" />
          <path d="M11 11l3.5 3.5" strokeLinecap="round" />
        </svg>
        <span style={{ flex: 1 }}>Zoeken…</span>
        <span
          className="num"
          style={{
            fontSize: 11,
            color: colors.faint,
            border: `1px solid ${colors.border}`,
            borderRadius: 5,
            padding: '1px 5px',
          }}
        >
          ⌘K
        </span>
      </button>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            style={({ isActive }) => (isActive ? navActive : navBase)}
          >
            {it.icon}
            {it.label}
          </NavLink>
        ))}
      </nav>

      <div
        style={{
          marginTop: 22,
          padding: '0 8px',
          fontSize: 11.5,
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: colors.faint,
        }}
      >
        Snel
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 8 }}>
        <button style={quickBtn} onClick={async () => navigate(`/offertes/${await createDraftQuote()}`)}>
          <span style={{ width: 18, textAlign: 'center', color: colors.faint, fontSize: 16 }}>
            +
          </span>
          Nieuwe offerte
        </button>
        <button style={quickBtn} onClick={async () => navigate(`/facturen/${await createDraftInvoice()}`)}>
          <span style={{ width: 18, textAlign: 'center', color: colors.faint, fontSize: 16 }}>
            +
          </span>
          Nieuwe factuur
        </button>
      </div>

      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 8px',
          borderTop: `1px solid ${colors.borderSoft}`,
        }}
      >
        <button
          onClick={() => setShowProfile(true)}
          title="Profiel bewerken"
          className="row-hoverable"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flex: 1,
            minWidth: 0,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            padding: '4px 6px',
            margin: '-4px -6px',
            borderRadius: 8,
            textAlign: 'left',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#e9eafe',
              color: '#4338ca',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: 12.5,
              flex: 'none',
            }}
          >
            {identity.initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13.5, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: colors.ink }}>
              {identity.displayName}
            </div>
            <div style={{ fontSize: 12, color: colors.subtle, lineHeight: 1.3 }}>{identity.displaySub}</div>
          </div>
        </button>
        <ThemeToggle />
        <button
          onClick={() => signOut()}
          title="Uitloggen"
          aria-label="Uitloggen"
          style={{ border: 'none', background: 'none', cursor: 'pointer', color: colors.subtle, padding: 4, flex: 'none' }}
        >
          <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M7 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h3" />
            <path d="M11.5 12.5 15 9l-3.5-3.5" />
            <path d="M15 9H7" />
          </svg>
        </button>
      </div>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </aside>
  )
}
