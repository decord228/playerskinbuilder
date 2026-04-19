import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/playerskinbuilder/' : '/',
  server: {
    port: 3000,
    strictPort: true,
    watch: {
      // Watch public folder for changes
      ignored: ['!**/public/default_project/**']
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
