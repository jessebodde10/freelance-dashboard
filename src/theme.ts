// Accent palette. The design defaults to Indigo; the other options are kept
// so the accent can be swapped in one place if branding ever changes.
export interface Accent {
  solid: string
  hover: string
  soft: string
  ink: string
}

export const accents: Record<string, Accent> = {
  Indigo: { solid: '#4f46e5', hover: '#4338ca', soft: '#eef2ff', ink: '#4338ca' },
  Slate: { solid: '#334155', hover: '#1e293b', soft: '#f1f5f9', ink: '#334155' },
  Teal: { solid: '#0e7490', hover: '#155e75', soft: '#ecfeff', ink: '#0e7490' },
  Groen: { solid: '#047857', hover: '#065f46', soft: '#ecfdf5', ink: '#047857' },
}

export const accent: Accent = accents.Indigo

// Neutral tokens used across the UI.
export const colors = {
  appBg: '#f6f7f9',
  surface: '#ffffff',
  border: '#e7e9ed',
  borderSoft: '#f0f1f4',
  rowHover: '#fafbfc',
  ink: '#1a1f36',
  text: '#4b5563',
  muted: '#697386',
  subtle: '#8a94a6',
  faint: '#a4abb8',
  positive: '#067647',
  negative: '#b42318',
  danger: '#f04438',
}
