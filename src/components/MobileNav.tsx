import type { CSSProperties } from 'react'
import { NavLink } from 'react-router-dom'
import { accent } from '../theme'
import {
  DashboardIcon,
  FacturenIcon,
  KlantenIcon,
  OffertesIcon,
  OpdrachtenIcon,
} from './icons'

const tabs = [
  { to: '/', label: 'Overzicht', Icon: DashboardIcon, end: true },
  { to: '/opdrachten', label: 'Opdrachten', Icon: OpdrachtenIcon },
  { to: '/klanten', label: 'Klanten', Icon: KlantenIcon },
  { to: '/offertes', label: 'Offertes', Icon: OffertesIcon },
  { to: '/facturen', label: 'Facturen', Icon: FacturenIcon },
]

const DRAWER_WIDTH = 232

const linkStyle = (active: boolean): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '11px 14px',
  borderRadius: 10,
  textDecoration: 'none',
  color: active ? accent.ink : '#475467',
  background: active ? '#f2f2fd' : 'transparent',
  fontSize: 15,
  fontWeight: active ? 600 : 500,
})

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {/* Backdrop: dims the content and closes the drawer on tap. */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(16,24,40,0.4)',
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
          background: '#fff',
          borderRight: '1px solid #eceef1',
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
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '4px 6px 12px',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.01em' }}>Kompas</span>
          <button
            onClick={onClose}
            aria-label="Menu sluiten"
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 22,
              lineHeight: 1,
              color: '#98a2b3',
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
                  <Icon size={20} style={{ color: isActive ? accent.ink : '#98a2b3' }} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}
