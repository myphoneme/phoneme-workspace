import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  preview: {
    host: '0.0.0.0',
    allowedHosts: ['api.phoneme.in', 'phoneme.in'],
  },
  server: {
    host: 'localhost',
    port: 5173,
  },
})
