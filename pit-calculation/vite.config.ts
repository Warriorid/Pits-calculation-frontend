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
        start_url: "/Pits-calculation-frontend/",
        display: "standalone",
        background_color: "#000000",
        theme_color: "#FFCD11",
        orientation: "portrait-primary",
        icons: [
          {
            src: "/Pits-calculation-frontend/static/img/main_image.png",
            type: "image/png",
            sizes: "192x192"
          },
          {
            src: "/Pits-calculation-frontend/static/img/main_image.png", 
            type: "image/png",
            sizes: "512x512"
          }
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp4}']
      }
    })
  ],
  base: '/Pits-calculation-frontend/'
})