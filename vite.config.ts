import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const lambdaStub = fileURLToPath(new URL('./src/test/lambda-stub.ts', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Lambda deps live in functions/price-checker, not the root; stub them for its parsing tests.
    alias: {
      'firebase-admin/app': lambdaStub,
      'firebase-admin/firestore': lambdaStub,
      '@aws-sdk/client-ssm': lambdaStub,
    },
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.test.{ts,tsx}', 'functions/**/*.test.mjs'],
  },
})
