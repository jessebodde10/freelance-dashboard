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

const tabStyle = (active: boolean): CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 3,
  flex: 1,
  textDecoration: 'none',
  color: active ? accent.ink : '#98a2b3',
  fontSize: 10,
  fontWeight: active ? 600 : 500,
  padding: '2px 0',
})

export function MobileNav() {
  return (
    <nav
      style={{
        flex: 'none',
        background: '#fff',
        borderTop: '1px solid #eceef1',
        display: 'flex',
        padding: '9px 8px calc(10px + env(safe-area-inset-bottom))',
      }}
    >
      {tabs.map(({ to, label, Icon, end }) => (
        <NavLink key={to} to={to} end={end} style={({ isActive }) => tabStyle(isActive)}>
          {({ isActive }) => (
            <>
              <Icon size={21} style={{ color: isActive ? accent.ink : '#98a2b3' }} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
