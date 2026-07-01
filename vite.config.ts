import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `--mode standalone` inlines every asset into one portable index.html
// (used for shareable, server-less previews). The default build is a normal
// multi-file production bundle.
export default defineConfig(({ mode }) => {
  const standalone = mode === 'standalone'
  return {
    base: standalone ? './' : '/',
    plugins: [react(), ...(standalone ? [viteSingleFile()] : [])],
  }
})
