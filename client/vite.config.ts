// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(), tailwindcss()],
//   preview: {
//     host: '0.0.0.0',
//     allowedHosts: ['api.phoneme.in', 'phoneme.in'],
//   },
//   server: {
//     host: '10.100.60.111',
//     port: 5173,
//     https: {
//       key: './certs/key.pem',
//       cert: './certs/cert.pem',
//     },
//   },
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  preview: {
    host: '0.0.0.0',
    // allowedHosts: ['api.phoneme.in', 'phoneme.in'],
    allowedHosts: true,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  },
})
