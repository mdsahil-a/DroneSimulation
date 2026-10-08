import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Proxy /api to your friend's Express backend (change the port if needed)
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:5000' } },
})
