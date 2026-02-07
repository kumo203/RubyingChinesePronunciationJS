import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/RubyingChinesePronunciationJS/', // Replace with your GitHub repo name
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
