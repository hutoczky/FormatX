import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/license-center.spec.js'],
    globals: false,
  },
});
