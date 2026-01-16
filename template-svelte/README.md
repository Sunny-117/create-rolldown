# Rolldown Svelte Starter

A starter template for creating a Svelte library with Rolldown.

## Features

- ⚡️ Fast bundling with [Rolldown](https://rolldown.rs)
- 🔥 Svelte 5 support
- 🎮 Playground for development with Vite
- 📦 Ready for publishing to npm
- 🔧 TypeScript support
- 💡 Perfect for Svelte components and actions

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
├── src/                # Library source code
│   ├── index.ts        # Main entry point
│   └── MyButton.svelte # Example component
├── playground/         # Development playground
│   ├── src/
│   │   ├── App.svelte  # Playground app
│   │   ├── main.ts     # Playground entry
│   │   └── style.css   # Playground styles
│   └── index.html
├── dist/               # Build output
└── rolldown.config.js
```

## Usage

After building, you can import from your library:

```svelte
<script>
  import { MyButton } from 'your-library-name';
</script>

<MyButton label="Click me" />
```
