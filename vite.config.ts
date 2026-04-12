import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Windows: weniger HMR-Fehler, wenn Editoren die CSS-Datei kurz exklusiv sperren (EBUSY).
    watch: {
      usePolling: true,
      interval: 800,
      awaitWriteFinish: {
        stabilityThreshold: 250,
        pollInterval: 100,
      },
    },
  },
})
