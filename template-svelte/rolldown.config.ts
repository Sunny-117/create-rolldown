import { defineConfig } from 'rolldown';
import svelte from 'rollup-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';

export default defineConfig({
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'esm',
  },
  external: ['svelte', 'svelte/internal'],
  plugins: [
    svelte({
      preprocess: sveltePreprocess(),
      compilerOptions: {
        dev: false,
      },
    }),
  ],
  resolve: {
    extensions: ['.ts', '.svelte'],
  },
});
