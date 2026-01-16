# Rolldown Vue Starter

A starter template for creating a Vue library with Rolldown.

## Features

- ⚡️ Fast bundling with [Rolldown](https://rolldown.rs)
- 💚 Vue 3 support
- 🎮 Playground for development with Vite
- 📦 Ready for publishing to npm
- 🔧 TypeScript support
- 💡 Perfect for Vue components and composables

## Development

Install dependencies:

```bash
npm install
```

Run the playground for development:

```bash
npm run play
```

Build the library:

```bash
npm run build
```

Watch mode for library development:

```bash
npm run dev
```

Type checking:

```bash
npm run typecheck
```

## Project Structure

```
├── src/              # Library source code
│   ├── index.ts      # Main entry point
│   └── MyButton.vue  # Example component
├── playground/       # Development playground
│   ├── src/
│   │   ├── App.vue   # Playground app
│   │   ├── main.ts   # Playground entry
│   │   └── style.css # Playground styles
│   └── index.html
├── dist/             # Build output
└── rolldown.config.js
```

## Usage

After building, you can import from your library:

```vue
<script setup>
import { MyButton } from 'your-library-name';
</script>

<template>
  <MyButton type="primary" />
</template>
```
