import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: [
      'src/**/*.test.{ts,tsx}',
      'tests/unit/**/*.test.{ts,tsx}',
      'tests/sub-agents/**/*.test.{ts,tsx}',
    ],
    exclude: ['e2e/**', 'tests/e2e/**', 'node_modules/**', '.next/**', 'dist/**', '.git/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html', 'lcov'],
      reportsDirectory: './coverage',
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 65,
        statements: 70,
      },
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/tests/**',
        '**/.next/**',
        '**/node_modules/**',
        '**/dist/**',
        '**/*.config.{ts,js}',
        '**/tailwind.config.ts',
        '**/postcss.config.js',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/tests': path.resolve(__dirname, './tests'),
    },
  },
});
