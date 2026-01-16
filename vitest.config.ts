import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'json-summary'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '__tests__/**',
        'template-*/**',
        '*.config.{js,ts}',
        'index.js',
      ],
      include: ['src/**/*.ts'],
    },
  },
});
