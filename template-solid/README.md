# Rolldown SolidJS Starter

A starter template for creating a SolidJS library with Rolldown.

## Features

- ⚡️ Fast bundling with [Rolldown](https://rolldown.rs)
- 🎯 SolidJS support
- 🎮 Playground for development with Vite
- 📦 Ready for publishing to npm
- 🔧 TypeScript support
- 💡 Perfect for Solid components and primitives

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
│   └── MyButton.tsx  # Example component
├── playground/       # Development playground
│   ├── src/
│   │   ├── App.tsx   # Playground app
│   │   ├── index.tsx # Playground entry
│   │   └── style.css # Playground styles
│   └── index.html
├── dist/             # Build output
└── rolldown.config.js
```

## Usage

After building, you can import from your library:

```tsx
import { MyButton } from 'your-library-name';

function App() {
  return <MyButton type="primary" />;
}
```
