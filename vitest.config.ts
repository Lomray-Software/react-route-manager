import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['__tests__/**/*.ts'],
    setupFiles: ['__helpers__/setup.ts'],
    coverage: {
      include: ['src/**/*'],
      exclude: ['src/interfaces.ts'],
      reporter: ['text', 'text-summary', 'lcov', 'html'],
    },
  },
});
