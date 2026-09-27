import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/postcss'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  css: { postcss: { plugins: [tailwindcss()] } },
  base: './', // Relative paths so dist/index.html also works when opened directly
})
