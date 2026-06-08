import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
      '/uploads': { target: 'http://localhost:3001', changeOrigin: true },
      '/ws': { target: 'ws://localhost:3001', ws: true, changeOrigin: true }
    }
  },
  build: {
    chunkSizeWarningLimit: 800,
    minify: 'esbuild',
    target: 'es2020',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom')) return 'react-dom';
            if (id.includes('react-router')) return 'react-router';
            if (id.includes('recharts') || id.includes('d3-')) return 'charts';
            if (id.includes('react-icons')) return 'icons';
            if (id.includes('date-fns')) return 'date-utils';
            if (id.includes('qrcode') || id.includes('html5-qrcode')) return 'qrcode';
            if (id.includes('simplewebauthn')) return 'webauthn';
            if (id.includes('axios')) return 'http';
            return 'vendor';
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios']
  }
})
