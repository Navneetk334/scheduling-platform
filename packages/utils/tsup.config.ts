import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/scheduling/index.ts',
    'src/validation/index.ts',
    'src/billing/index.ts',
  ],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  // Resolve workspace + third-party deps at runtime instead of bundling.
  external: ['@invincible/types', 'luxon', 'zod'],
});
