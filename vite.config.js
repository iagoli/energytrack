import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Em desenvolvimento nativo, o backend Express está em localhost:3001.
// Dentro do docker-compose, o serviço se chama "api" — definimos via env.
const apiTarget = process.env.VITE_API_TARGET || 'http://localhost:3001'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,            // bind 0.0.0.0 — necessário para acessar do host quando dentro de container
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
})
