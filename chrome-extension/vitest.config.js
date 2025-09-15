/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.js'],
    // Force sequential execution for e2e tests
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    // Ensure tests run one at a time
    fileParallelism: false,
    // Increase timeout for e2e tests since they run sequentially
    testTimeout: 120000,
    hookTimeout: 120000
  }
})
