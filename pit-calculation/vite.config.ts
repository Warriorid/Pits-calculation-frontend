import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const isTauri = !!process.env.TAURI_ENV

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Отключаем PWA в Tauri режиме
      registerType: isTauri ? undefined : 'autoUpdate'
    })
  ],
  base: isTauri ? './' : '/Pits-calculation-frontend/',
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: !isTauri ? {
      '/api': {
        target: 'http://192.168.1.70:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      }
    } : undefined
  },
  build: {
    assetsDir: 'assets',
    outDir: 'dist'
  },
  publicDir: 'public',
  root: '.'
})