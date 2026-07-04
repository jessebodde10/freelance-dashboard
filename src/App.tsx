import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { isSupabaseConfigured } from './lib/supabase'
import { RequireAuth, FullscreenMessage } from './auth'
import { Layout } from './components/Layout'
import { SetupNeeded } from './screens/SetupNeeded'

// Route screens are code-split so the initial load only ships the shell.
const Marketing = lazy(() => import('./screens/Marketing').then((m) => ({ default: m.Marketing })))
const Login = lazy(() => import('./screens/Login').then((m) => ({ default: m.Login })))
const Register = lazy(() => import('./screens/Register').then((m) => ({ default: m.Register })))
const Privacy = lazy(() => import('./screens/Privacy').then((m) => ({ default: m.Privacy })))
const Dashboard = lazy(() => import('./screens/Dashboard').then((m) => ({ default: m.Dashboard })))
const OpdrachtenList = lazy(() =>
  import('./screens/OpdrachtenList').then((m) => ({ default: m.OpdrachtenList })),
)
const OpdrachtDetail = lazy(() =>
  import('./screens/OpdrachtDetail').then((m) => ({ default: m.OpdrachtDetail })),
)
const KlantenList = lazy(() => import('./screens/KlantenList').then((m) => ({ default: m.KlantenList })))
const KlantDetail = lazy(() => import('./screens/KlantDetail').then((m) => ({ default: m.KlantDetail })))
const OffertesList = lazy(() => import('./screens/OffertesList').then((m) => ({ default: m.OffertesList })))
const OfferteEditor = lazy(() =>
  import('./screens/OfferteEditor').then((m) => ({ default: m.OfferteEditor })),
)
const FacturenList = lazy(() => import('./screens/FacturenList').then((m) => ({ default: m.FacturenList })))
const FactuurEditor = lazy(() =>
  import('./screens/FactuurEditor').then((m) => ({ default: m.FactuurEditor })),
)
const KostenList = lazy(() => import('./screens/KostenList').then((m) => ({ default: m.KostenList })))
const BtwOverzicht = lazy(() =>
  import('./screens/BtwOverzicht').then((m) => ({ default: m.BtwOverzicht })),
)

export function App() {
  if (!isSupabaseConfigured) return <SetupNeeded />

  return (
    <Suspense fallback={<FullscreenMessage text="Laden…" />}>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/privacy" element={<Privacy />} />

      <Route
        element={
          <RequireAuth publicFallback={<Marketing />}>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="opdrachten" element={<OpdrachtenList />} />
        <Route path="opdrachten/:id" element={<OpdrachtDetail />} />
        <Route path="klanten" element={<KlantenList />} />
        <Route path="klanten/:id" element={<KlantDetail />} />
        <Route path="offertes" element={<OffertesList />} />
        <Route path="offertes/:id" element={<OfferteEditor />} />
        <Route path="facturen" element={<FacturenList />} />
        <Route path="facturen/:id" element={<FactuurEditor />} />
        <Route path="kosten" element={<KostenList />} />
        <Route path="btw" element={<BtwOverzicht />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
    </Suspense>
  )
}
