import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Proxy /api to backend service
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:5000' } },
})
