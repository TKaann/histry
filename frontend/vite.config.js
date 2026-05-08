import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/auth': 'http://localhost:8080',
      '/content': 'http://localhost:8080',
      '/game': 'http://localhost:8080',
      '/suggestions': 'http://localhost:8080',
      '/admin': 'http://localhost:8080',
    }
  }
})
