import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "Калькулятор котлованов",
        short_name: "Котлованы", 
        description: "Система расчета котлованов и строительных материалов",
        start_url: "/Pits-calculation-frontend/",
        display: "standalone",
        background_color: "#000000",
        theme_color: "#FFCD11",
        orientation: "portrait-primary",
        categories: ["business", "productivity"],
        icons: [
          {
            src: "static/img/logo192.png",
            type: "image/png",
            sizes: "192x192"
          },
          {
            src: "static/img/logo512.png",
            type: "image/png",
            sizes: "512x512"
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp4,json}']
      }
    })
  ],
  base: '/Pits-calculation-frontend/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  server: {
    port: 3000,
    host: '0.0.0.0'
  }
})