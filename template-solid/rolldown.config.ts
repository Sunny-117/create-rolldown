import solid from 'rolldown-plugin-solid';
import { defineConfig } from 'rolldown';

export default defineConfig({
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'esm',
  },
  external: ['solid-js'],
  plugins: [solid()],
});
