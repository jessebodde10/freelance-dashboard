import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { Navigate, useLocation } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import { fetchProfile } from './lib/db'
import type { Profile, ProfileInput } from './types'

interface AuthState {
  ready: boolean
  user: User | null
  profile: Profile | null
  signUp: (
    email: string,
    password: string,
    profile: ProfileInput,
  ) => Promise<{ needsConfirmation: boolean }>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!isSupabaseConfigured)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // Load the profile whenever the signed-in user changes.
  const userId = session?.user.id ?? null
  useEffect(() => {
    let cancelled = false
    if (!userId) {
      setProfile(null)
      return
    }
    fetchProfile(userId)
      .then((p) => {
        if (!cancelled) setProfile(p)
      })
      .catch(() => {
        if (!cancelled) setProfile(null)
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  const value = useMemo<AuthState>(
    () => ({
      ready,
      user: session?.user ?? null,
      profile,
      async signUp(email, password, profileInput) {
        if (!supabase) throw new Error('Supabase niet geconfigureerd')
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: profileInput },
        })
        if (error) throw error
        // No session means email confirmation is required.
        return { needsConfirmation: !data.session }
      },
      async signIn(email, password) {
        if (!supabase) throw new Error('Supabase niet geconfigureerd')
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      },
      async signOut() {
        if (!supabase) return
        await supabase.auth.signOut()
      },
    }),
    [ready, session, profile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

/** Gate for the app: redirects to /login when there is no session. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { ready, user } = useAuth()
  const location = useLocation()
  if (!ready) return <FullscreenMessage text="Laden…" />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <>{children}</>
}

export function FullscreenMessage({ text }: { text: string }) {
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#697386',
        fontSize: 14,
      }}
    >
      {text}
    </div>
  )
}
