import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Playwright specs under e2e/ are run by `pnpm test:e2e`, not vitest.
    include: ['src/**/*.{test,spec}.ts?(x)'],
    exclude: ['node_modules/**', 'dist/**', '.next/**', 'e2e/**'],
  },
});
