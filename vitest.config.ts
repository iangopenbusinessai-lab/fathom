import { defineConfig } from 'vitest/config';

// Separate from vite.config.ts, which is finalized and must not be modified.
// Vitest prefers this file when both are present, so the build config is left
// entirely alone.
export default defineConfig({
  test: {
    // Still no DOM: the one component test renders through
    // react-dom/server rather than mounting, so the node environment is
    // enough. See src/__tests__.
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
