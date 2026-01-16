import { defineConfig } from 'rolldown'
import babel from '@rolldown/plugin-babel'

export default defineConfig({
  input: 'src/main.jsx',
  output: {
    dir: 'dist',
    format: 'esm',
  },
  plugins: [
    babel({
      presets: ['@babel/preset-react'],
    }),
  ],
})
