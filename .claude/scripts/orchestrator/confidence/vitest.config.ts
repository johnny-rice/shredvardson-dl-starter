import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['.claude/scripts/orchestrator/confidence/**/*.ts'],
      exclude: [
        '.claude/scripts/orchestrator/confidence/__tests__/**',
        '.claude/scripts/orchestrator/confidence/**/*.test.ts',
        '.claude/scripts/orchestrator/confidence/**/*.spec.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
});
