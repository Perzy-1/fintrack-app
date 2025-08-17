import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { version } from './package.json'; // Import version from package.json

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/fintrack-app/',
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(version)
  },
  test: {
    environment: 'jsdom'
  }
})
