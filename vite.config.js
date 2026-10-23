import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  /* El HTML de referencia (docs/) NO forma parte del app bundle;
     Vite lo escaneaba como entry por accidente y fallaba al resolver
     scripts externos (gtm, OneTrust, etc.). Lo excluimos aquí. */
  optimizeDeps: {
    entries: ['index.html'],
  },
  server: {
    fs: {
      /* Permitimos leer /src pero bloqueamos accidentes con /docs */
      allow: ['src', 'node_modules', 'public', 'index.html'],
    },
    watch: {
      ignored: ['**/docs/**'],
    },
  },
})
