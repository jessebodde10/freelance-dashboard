import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import './index.css'
import { App } from './App'
import { AuthProvider } from './auth'
import { StoreProvider } from './store'
import { ThemeProvider } from './hooks/useTheme'

// The single-file standalone build runs from file://, where the History API
// has no server to fall back on, so it uses hash-based routing instead.
const Router = import.meta.env.MODE === 'standalone' ? HashRouter : BrowserRouter

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <StoreProvider>
          <Router>
            <App />
          </Router>
        </StoreProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
