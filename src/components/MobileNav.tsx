import { useEffect, type CSSProperties } from 'react'
import { NavLink } from 'react-router-dom'
import { accent, colors } from '../theme'
import { useAuth } from '../auth'
import { useIdentity } from '../hooks/useIdentity'
import {
  BtwIcon,
  DashboardIcon,
  FacturenIcon,
  KlantenIcon,
  KostenIcon,
  OffertesIcon,
  OpdrachtenIcon,
} from './icons'

const tabs = [
  { to: '/', label: 'Overzicht', Icon: DashboardIcon, end: true },
  { to: '/opdrachten', label: 'Opdrachten', Icon: OpdrachtenIcon },
  { to: '/klanten', label: 'Klanten', Icon: KlantenIcon },
  { to: '/offertes', label: 'Offertes', Icon: OffertesIcon },
  { to: '/facturen', label: 'Facturen', Icon: FacturenIcon },
  { to: '/kosten', label: 'Kosten', Icon: KostenIcon },
  { to: '/btw', label: 'BTW-overzicht', Icon: BtwIcon },
]

const DRAWER_WIDTH = 232

const linkStyle = (active: boolean): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '11px 14px',
  borderRadius: 10,
  textDecoration: 'none',
  color: active ? accent.ink : colors.text,
  background: active ? accent.soft : 'transparent',
  fontSize: 15,
  fontWeight: active ? 600 : 500,
})

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { signOut } = useAuth()
  const identity = useIdentity()
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  return (
    <>
      {/* Backdrop: dims the content and closes the drawer on tap. */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--overlay)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.2s ease',
          zIndex: 40,
        }}
      />

      {/* Left drawer: slides in from the left, collapses off-screen when closed. */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: DRAWER_WIDTH,
          background: colors.surface,
          borderRight: `1px solid ${colors.border}`,
          boxShadow: open ? '2px 0 16px rgba(16,24,40,0.12)' : 'none',
          transform: open ? 'translateX(0)' : `translateX(-${DRAWER_WIDTH + 20}px)`,
          transition: 'transform 0.22s ease',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          padding: '14px 12px calc(14px + env(safe-area-inset-bottom))',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: '4px 6px 12px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.01em' }}>Freezo</span>
            <span style={{ fontSize: 11, color: colors.subtle }}>Jouw freelance dashboard</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Menu sluiten"
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 22,
              lineHeight: 1,
              color: colors.subtle,
              padding: 4,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {tabs.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              style={({ isActive }) => linkStyle(isActive)}
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} style={{ color: isActive ? accent.ink : colors.subtle }} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div
          style={{
            marginTop: 'auto',
            paddingTop: 12,
            borderTop: `1px solid ${colors.borderSoft}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 8px 10px',
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: '#e9eafe',
                color: '#4338ca',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: 12,
                flex: 'none',
              }}
            >
              {identity.initials}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 13.5,
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: colors.ink,
                }}
              >
                {identity.displayName}
              </div>
              <div style={{ fontSize: 12, color: colors.subtle, lineHeight: 1.3 }}>
                {identity.displaySub}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              onClose()
              signOut()
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              width: '100%',
              padding: '11px 14px',
              borderRadius: 10,
              border: 'none',
              background: 'transparent',
              color: colors.text,
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M7 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h3" />
              <path d="M11.5 12.5 15 9l-3.5-3.5" />
              <path d="M15 9H7" />
            </svg>
            Uitloggen
          </button>
        </div>
      </nav>
    </>
  )
}
