import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer'],
      globals: { Buffer: true },
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    global: 'globalThis',
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'stellar-vendor': ['@stellar/stellar-sdk', '@creit.tech/stellar-wallets-kit'],
          'ui-vendor': ['framer-motion', 'lucide-react', 'recharts'],
          'query-vendor': ['@tanstack/react-query', 'zustand'],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
})
