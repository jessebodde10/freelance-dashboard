import { useEffect, useRef, useState } from 'react'
import { colors } from '../theme'

/** Trigger the brief confirmation animation from anywhere. */
export function celebrate(message: string) {
  window.dispatchEvent(new CustomEvent('kompas:celebrate', { detail: message }))
}

interface Shown {
  id: number
  message: string
}

export function Celebration() {
  const [shown, setShown] = useState<Shown | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const onCelebrate = (e: Event) => {
      const message = (e as CustomEvent<string>).detail || 'Gelukt'
      setShown({ id: Date.now(), message })
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setShown(null), 1900)
    }
    window.addEventListener('kompas:celebrate', onCelebrate)
    return () => {
      window.removeEventListener('kompas:celebrate', onCelebrate)
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  if (!shown) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 300,
      }}
    >
      <div
        key={shown.id}
        className="celebrate-pop"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
          padding: '28px 36px',
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: 18,
          boxShadow: '0 24px 70px rgba(16,24,40,0.28)',
        }}
      >
        <div style={{ position: 'relative', width: 64, height: 64 }}>
          <span
            className="celebrate-ring"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: `2px solid ${colors.positive}`,
            }}
          />
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(18,161,80,0.14)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={colors.positive} strokeWidth="2.6">
              <path className="celebrate-check" d="M5 12.5l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: colors.ink }}>{shown.message}</div>
      </div>
    </div>
  )
}
