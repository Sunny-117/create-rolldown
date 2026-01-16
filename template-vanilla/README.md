# Rolldown Vanilla Starter

> 🚀 Created with [create-rolldown](https://github.com/sunny-117/create-rolldown) - Fast scaffolding for Rolldown library projects

A minimal TypeScript library starter powered by Rolldown - the blazingly fast JavaScript bundler written in Rust.

## ✨ Features

- ⚡️ **Lightning Fast** - Powered by [Rolldown](https://rolldown.rs), a Rust-based bundler
- 📦 **NPM Ready** - Pre-configured for publishing to npm with proper exports
- 🔧 **TypeScript First** - Full TypeScript support with type declarations
- 🎯 **Zero Config** - Minimal setup, maximum productivity
- 🔄 **Watch Mode** - Hot reload during development
- 💡 **Perfect For** - Utility libraries, tools, helpers, and pure JavaScript/TypeScript packages

## 🚀 Quick Start

Install dependencies:

```bash
npm install
# or
pnpm install
# or
yarn install
```

## 📦 Development

### Build the library

```bash
npm run build
```

Outputs to `dist/` directory with:
- `index.js` - ESM bundle
- `index.d.ts` - TypeScript declarations

### Watch mode for development

```bash
npm run dev
```

Automatically rebuilds on file changes.

### Type checking

```bash
npm run typecheck
```

## 📁 Project Structure

```
your-library/
├── src/
│   └── index.ts          # 📝 Main entry point - export your library here
├── dist/                 # 📦 Build output (generated)
│   ├── index.js         # ESM bundle
│   └── index.d.ts       # Type declarations
├── rolldown.config.js    # ⚙️ Rolldown configuration
├── tsconfig.json         # 🔧 TypeScript configuration
└── package.json          # 📋 Package metadata
```

## 💡 Usage Example

After building, your library can be imported:

```typescript
import { greet, Counter } from 'your-library-name';

// Use the greeting function
console.log(greet('World')); // "Hello, World!"

// Use the Counter class
const counter = new Counter();
counter.increment(); // 1
counter.increment(); // 2
console.log(counter.value); // 2
```

## 📤 Publishing to NPM

1. Update `package.json` with your library details:
   - `name` - Your package name
   - `version` - Semantic version
   - `description` - Package description
   - `author` - Your name and email
   - `repository` - Your git repository URL

2. Build the library:
   ```bash
   npm run build
   ```

3. Publish to npm:
   ```bash
   npm publish
   ```

The `prepublishOnly` script ensures your library is built before publishing.

## 🎯 Best Practices

- Keep your public API in `src/index.ts`
- Use named exports for better tree-shaking
- Add JSDoc comments for better IDE support
- Run `npm run typecheck` before committing
- Version your releases using semantic versioning

## 🔗 Learn More

- [Rolldown Documentation](https://rolldown.rs)
- [create-rolldown](https://github.com/sunny-117/create-rolldown)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

Built with ❤️ using create-rolldown
