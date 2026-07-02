// Accent palette. The design defaults to Indigo; the other options are kept
// so the accent can be swapped in one place if branding ever changes.
export interface Accent {
  solid: string
  hover: string
  soft: string
  ink: string
}

export const accents: Record<string, Accent> = {
  // soft/ink resolve through CSS variables so they adapt to the active theme.
  Indigo: { solid: '#4f46e5', hover: '#4338ca', soft: 'var(--accent-soft)', ink: 'var(--accent-ink)' },
  Slate: { solid: '#334155', hover: '#1e293b', soft: '#f1f5f9', ink: '#334155' },
  Teal: { solid: '#0e7490', hover: '#155e75', soft: '#ecfeff', ink: '#0e7490' },
  Groen: { solid: '#047857', hover: '#065f46', soft: '#ecfdf5', ink: '#047857' },
}

export const accent: Accent = accents.Indigo

// Neutral tokens — resolved from CSS variables (see index.css) so the whole UI
// switches with [data-theme]. Semantic colours stay fixed across themes.
export const colors = {
  appBg: 'var(--app-bg)',
  surface: 'var(--surface)',
  border: 'var(--border)',
  borderSoft: 'var(--border-soft)',
  borderStrong: 'var(--border-strong)',
  rowHover: 'var(--surface-2)',
  ink: 'var(--ink)',
  text: 'var(--text)',
  muted: 'var(--muted)',
  subtle: 'var(--subtle)',
  faint: 'var(--faint)',
  positive: '#12a150',
  negative: '#f04438',
  danger: '#f04438',
}
