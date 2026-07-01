import { Navigate, Route, Routes } from 'react-router-dom'
import { isSupabaseConfigured } from './lib/supabase'
import { RequireAuth } from './auth'
import { Layout } from './components/Layout'
import { SetupNeeded } from './screens/SetupNeeded'
import { Login } from './screens/Login'
import { Register } from './screens/Register'
import { Dashboard } from './screens/Dashboard'
import { OpdrachtenList } from './screens/OpdrachtenList'
import { OpdrachtDetail } from './screens/OpdrachtDetail'
import { KlantenList } from './screens/KlantenList'
import { KlantDetail } from './screens/KlantDetail'
import { OffertesList } from './screens/OffertesList'
import { OfferteEditor } from './screens/OfferteEditor'
import { FacturenList } from './screens/FacturenList'
import { FactuurEditor } from './screens/FactuurEditor'

export function App() {
  if (!isSupabaseConfigured) return <SetupNeeded />

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <RequireAuth>
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
