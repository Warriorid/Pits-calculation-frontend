import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, ""),
      },
    },
    watch: {
      usePolling: true,
    }, 
    host: true,
    strictPort: true,
    port: 3000,
    hmr: {
      overlay: false
    }
  },
  // ПРАВИЛЬНЫЕ настройки esbuild
  esbuild: {
    include: /\.(ts|tsx|js|jsx)$/,
    exclude: /node_modules/,
  }
});