import { defineConfig } from 'rolldown';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'esm',
  },
  external: ['vue'],
  plugins: [vue()],
});
