# Rolldown Vanilla Starter

A starter template for creating a TypeScript library with Rolldown.

## Features

- ⚡️ Fast bundling with [Rolldown](https://rolldown.rs)
- 📦 Ready for publishing to npm
- 🔧 TypeScript support
- 🎯 Minimal setup
- 💡 Perfect for utility libraries, tools, and helpers

## Development

Install dependencies:

```bash
npm install
```

Build the library:

```bash
npm run build
```

Watch mode for development:

```bash
npm run dev
```

Type checking:

```bash
npm run typecheck
```

## Project Structure

```
├── src/
│   └── index.ts      # Main entry point
├── dist/             # Build output
└── rolldown.config.ts
```

## Usage

After building, you can import functions from your library:

```typescript
import { fn } from 'your-library-name';

console.log(fn()); // Hello, Rolldown!
```
