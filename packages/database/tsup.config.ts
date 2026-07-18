import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  // Prisma client + generated types must resolve at runtime, not be bundled.
  external: ['@invincible/types', '@prisma/client', '.prisma/client'],
});
