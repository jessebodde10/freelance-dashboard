import { Suspense, useEffect, useState, type ReactNode } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { colors } from '../theme'
import { useIsMobile } from '../hooks/useIsMobile'
import { useStore } from '../store'
import { useIdentity } from '../hooks/useIdentity'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { LoadingSkeleton, ThemeToggle } from './ui'
import { CommandPalette, openCommandPalette } from './CommandPalette'
import { ProfileModal } from './ProfileModal'

function ContentGate({ children }: { children: ReactNode }) {
  const { loading, error } = useStore()
  if (error)
    return (
      <div style={{ padding: '40px 4px', color: colors.negative, fontSize: 14 }}>{error}</div>
    )
  if (loading) return <LoadingSkeleton />
  return <>{children}</>
}

function useMobileTitle(): string {
  const { pathname } = useLocation()
  const { projects, clients } = useStore()
  const seg = pathname.split('/').filter(Boolean)

  if (seg.length === 0) return 'Overzicht'
  const [root, id] = seg
  switch (root) {
    case 'opdrachten':
      return id ? projects.find((p) => p.id === id)?.naam ?? 'Opdracht' : 'Opdrachten'
    case 'klanten':
      return id ? clients.find((c) => c.id === id)?.bedrijf ?? 'Klant' : 'Klanten'
    case 'offertes':
      return id ? 'Offerte' : 'Offertes'
    case 'facturen':
      return id ? 'Factuur' : 'Facturen'
    default:
      return 'Kompas'
  }
}

function MobileLayout() {
  const title = useMobileTitle()
  const identity = useIdentity()
  const [menuOpen, setMenuOpen] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: colors.appBg,
        color: colors.ink,
      }}
    >
      <header
        style={{
          flex: 'none',
          padding: '12px 18px',
          background: colors.surface,
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Menu openen"
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{ width: 20, height: 2, borderRadius: 2, background: colors.ink }}
              />
            ))}
          </button>
          <span
            style={{
              fontWeight: 600,
              fontSize: 19,
              letterSpacing: '-0.01em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={openCommandPalette}
            aria-label="Snelzoeken"
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: colors.subtle,
              padding: 4,
              display: 'flex',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="7" cy="7" r="5" />
              <path d="M11 11l3.5 3.5" strokeLinecap="round" />
            </svg>
          </button>
          <ThemeToggle />
          <button
            onClick={() => setShowProfile(true)}
            aria-label="Profiel bewerken"
            style={{
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: '#e9eafe',
              color: '#4338ca',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: 11,
            }}
          >
            {identity.initials}
          </button>
        </div>
      </header>

      <main style={{ flex: 1, overflowY: 'auto', padding: '16px 15px 24px' }}>
        <ContentGate>
          <Suspense fallback={<LoadingSkeleton />}>
            <Outlet context={{ isMobile: true }} />
          </Suspense>
        </ContentGate>
      </main>

      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </div>
  )
}

function DesktopLayout() {
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        background: colors.appBg,
        color: colors.ink,
        overflow: 'hidden',
        fontSize: 14,
      }}
    >
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '30px 40px 64px' }}>
          <ContentGate>
            <Suspense fallback={<LoadingSkeleton />}>
              <Outlet context={{ isMobile: false }} />
            </Suspense>
          </ContentGate>
        </div>
      </main>
    </div>
  )
}

export function Layout() {
  const isMobile = useIsMobile()
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
      }
    }
    const onOpen = () => setPaletteOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('kompas:command-palette', onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('kompas:command-palette', onOpen)
    }
  }, [])

  return (
    <>
      {isMobile ? <MobileLayout /> : <DesktopLayout />}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  )
}

// Screens read this to branch between desktop and mobile markup.
export interface LayoutContext {
  isMobile: boolean
}
