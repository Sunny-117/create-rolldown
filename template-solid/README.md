# Rolldown SolidJS Starter

> 🚀 Created with [create-rolldown](https://github.com/sunny-117/create-rolldown) - Fast scaffolding for Rolldown library projects

A modern SolidJS component library starter powered by Rolldown - the blazingly fast JavaScript bundler written in Rust.

## ✨ Features

- ⚡️ **Lightning Fast** - Powered by [Rolldown](https://rolldown.rs), a Rust-based bundler
- 🎯 **SolidJS** - Fine-grained reactivity with true reactivity
- 🎮 **Live Playground** - Vite-powered dev environment with HMR
- 📦 **NPM Ready** - Pre-configured for publishing Solid libraries
- 🔧 **TypeScript First** - Full type safety and IntelliSense
- 🔄 **Watch Mode** - Instant feedback during library development
- 💡 **Perfect For** - Solid components, primitives, utilities, and reactive libraries

## 🚀 Quick Start

Install dependencies:

```bash
npm install
# or
pnpm install
# or
yarn install
```

## 📦 Development Workflow

### 🎮 Run the playground (Recommended for development)

```bash
npm run play
```

Opens a Vite dev server at `http://localhost:5173` with:
- ⚡️ Hot Module Replacement (HMR)
- 🔄 Instant updates when you edit components
- 🎨 Live preview of your library

**Tip**: Edit `src/MyButton.tsx` and see changes instantly in the playground!

### 📦 Build the library

```bash
npm run build
```

Outputs to `dist/` directory with:
- `index.js` - ESM bundle
- `index.jsx` - Solid-specific JSX output
- `index.d.ts` - TypeScript declarations

### 🔄 Watch mode for library development

```bash
npm run dev
```

Automatically rebuilds the library on file changes. Use this when:
- Testing your library in another project
- Preparing for publishing
- Running alongside the playground

### 🔍 Type checking

```bash
npm run typecheck
```

## 📁 Project Structure

```
your-library/
├── src/                    # 📚 Your library source code
│   ├── index.ts           # 📝 Main entry - export your components here
│   └── MyButton.tsx       # 🎨 Example component (replace with yours)
│
├── playground/            # 🎮 Development playground (Vite)
│   ├── src/
│   │   ├── App.tsx       # 🎪 Test your components here
│   │   ├── index.tsx     # 🚪 Playground entry point
│   │   └── style.css     # 🎨 Playground styles
│   ├── index.html        # 📄 HTML template
│   └── public/           # 📁 Static assets
│
├── dist/                  # 📦 Build output (generated)
│   ├── index.js          # ESM bundle
│   ├── index.jsx         # Solid JSX output
│   └── index.d.ts        # Type declarations
│
├── rolldown.config.js     # ⚙️ Rolldown bundler config
├── vite.config.ts         # ⚡️ Vite playground config
├── tsconfig.json          # 🔧 TypeScript config
└── package.json           # 📋 Package metadata
```

## 💡 Usage Example

After building and publishing, users can import your components:

```tsx
import { MyButton } from 'your-library-name';
import { createSignal } from 'solid-js';

function App() {
  return (
    <div>
      <MyButton />
    </div>
  );
}
```

## 📤 Publishing to NPM

1. Update `package.json` with your library details:
   - `name` - Your package name (e.g., `@yourname/solid-components`)
   - `version` - Semantic version (start with `0.1.0`)
   - `description` - What your library does
   - `author` - Your name and email
   - `repository` - Your git repository URL
   - `keywords` - Help users find your package

2. Build the library:
   ```bash
   npm run build
   ```

3. Test the build locally:
   ```bash
   npm pack
   # Creates a .tgz file you can test in another project
   ```

4. Publish to npm:
   ```bash
   npm publish
   ```

The `prepublishOnly` script ensures your library is built before publishing.

## 🎯 Best Practices

- **Export Strategy**: Export all public components from `src/index.ts`
- **Peer Dependencies**: SolidJS is a peer dependency (users provide it)
- **Tree Shaking**: Use named exports for better tree-shaking
- **TypeScript**: Add proper types and JSDoc comments
- **Reactivity**: Leverage Solid's fine-grained reactivity
- **Testing**: Test components in the playground before publishing
- **Versioning**: Follow [semantic versioning](https://semver.org/)

## 🔗 Learn More

- [Rolldown Documentation](https://rolldown.rs)
- [create-rolldown](https://github.com/sunny-117/create-rolldown)
- [SolidJS Documentation](https://www.solidjs.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

Built with ❤️ using create-rolldown
