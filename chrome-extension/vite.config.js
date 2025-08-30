import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath, URL } from 'url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    
    // Environment variables configuration
    define: {
      __DEV__: mode === 'development',
      __PROD__: mode === 'production'
    },
    
    build: {
      rollupOptions: {
        input: {
          main: resolve(fileURLToPath(new URL('.', import.meta.url)), 'index.html'),
          sidebar: resolve(fileURLToPath(new URL('.', import.meta.url)), 'src/sidebar.jsx')
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: 'chunk-[hash].js',
          assetFileNames: '[name].[ext]'
        }
      },
      outDir: 'dist',
      emptyOutDir: true
    }
  }
})
