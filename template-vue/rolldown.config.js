import { defineConfig } from 'rolldown';
import Vue from 'unplugin-vue/rolldown';

export default defineConfig({
  input: 'src/main.js',
  output: {
    dir: 'dist',
    format: 'esm',
  },
  plugins: [Vue()],
});
