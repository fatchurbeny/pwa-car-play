import { existsSync, readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

const certificate = new URL('./.certs/local.pem', import.meta.url)
const key = new URL('./.certs/local-key.pem', import.meta.url)
const https = existsSync(certificate) && existsSync(key)
  ? { cert: readFileSync(certificate), key: readFileSync(key) }
  : undefined

export default defineConfig({
  server: {
    host: true,
    https,
  },
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      manifest: {
        name: 'Car Auto Play',
        short_name: 'Car Play',
        description: 'Dashboard PWA untuk navigasi dan audio.',
        theme_color: '#090b10',
        background_color: '#090b10',
        display: 'standalone',
        orientation: 'landscape',
        icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
    }),
  ],
})
