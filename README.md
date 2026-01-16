# create-rolldown

[![npm version](https://img.shields.io/npm/v/create-rolldown.svg)](https://www.npmjs.com/package/create-rolldown)
[![license](https://img.shields.io/npm/l/create-rolldown.svg)](https://github.com/rolldown/create-rolldown/blob/main/LICENSE)
[![test](https://img.shields.io/badge/tests-77%20passed-brightgreen.svg)](https://github.com/sunny-117/create-rolldown)
[![coverage](https://img.shields.io/badge/coverage-60.87%25-yellow.svg)](https://github.com/sunny-117/create-rolldown)

Scaffolding tool for [Rolldown](https://rolldown.rs) library projects - a fast JavaScript bundler written in Rust.

## Features

- 🚀 **Fast Setup** - Create a new Rolldown project in seconds
- 🎨 **TypeScript First** - All templates use TypeScript by default
- 📦 **Library Development Focus** - Templates designed for building and publishing JavaScript/TypeScript libraries, component libraries, and utility packages
- 🎮 **Playground Included** - Framework templates include a Vite-powered playground for development and testing
- 🔧 **Interactive & Non-Interactive Modes** - Flexible usage for both manual and automated workflows
- 📦 **Smart Package Manager Detection** - Automatically detects and uses your preferred package manager (npm, pnpm, yarn, bun)
- ⚡ **Immediate Start** - Optional flag to install dependencies and start playground immediately

## Usage

### Interactive Mode (Recommended)

Simply run one of the following commands and follow the prompts:

```bash
# npm
npm create rolldown@latest

# pnpm
pnpm create rolldown

# yarn
yarn create rolldown

# bun
bun create rolldown
```

You'll be prompted to:

1. Enter a project name
2. Choose a framework (Vanilla, React, Vue, Solid, or Svelte)
3. Optionally install dependencies and start the playground immediately

> **Note**: All templates use TypeScript and are designed for library development (utility libraries, component libraries, tools, etc.).

### Non-Interactive Mode

For automated workflows or CI/CD pipelines:

```bash
# Create a project with all options specified
npm create rolldown@latest my-lib -- --template react --no-interactive

# With immediate install and start
npm create rolldown@latest my-lib -- --template vue --immediate --no-interactive

# Overwrite existing directory
npm create rolldown@latest my-lib -- --template solid --overwrite --no-interactive
```

## Command Line Options

```
Usage: create-rolldown [project-name] [options]

Options:
  -t, --template <template>    Specify a template (vanilla, react, vue, solid, svelte)
  --overwrite                  Overwrite existing files in target directory
  -i, --immediate              Install dependencies and start playground immediately
  --interactive                Force interactive mode (default in TTY)
  --no-interactive             Force non-interactive mode (default in non-TTY)
  -h, --help                   Display this help message

Available templates:
  vanilla                      Vanilla TypeScript library
  react                        React component library
  vue                          Vue component library
  solid                        SolidJS component library
  svelte                       Svelte component library
```

## Supported Templates

| Template  | Description                      | Use Cases                          | Playground |
| --------- | -------------------------------- | ---------------------------------- | ---------- |
| `vanilla` | Vanilla TypeScript library       | Utility libraries, tools, helpers  | ❌         |
| `react`   | React library with TypeScript    | React components, hooks, utilities | ✅ Vite    |
| `vue`     | Vue 3 library with TypeScript    | Vue components, composables        | ✅ Vite    |
| `solid`   | SolidJS library with TypeScript  | Solid components, primitives       | ✅ Vite    |
| `svelte`  | Svelte 5 library with TypeScript | Svelte components, actions         | ✅ Vite    |

## Development

### Prerequisites

- Node.js 20.19.0+ or 22.12.0+
- pnpm (recommended)

### Setup

```bash
# Clone the repository
git clone https://github.com/Sunny-117/create-rolldown.git
cd create-rolldown

# Install dependencies
pnpm install

# Run in development mode (watch mode)
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate test coverage report
pnpm test:coverage

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Format code
pnpm format

# Check formatting
pnpm format:check
```

### Adding a New Template

1. Create a new directory: `template-{framework}` (e.g., `template-preact`)
2. Add all necessary project files following the library structure:
   - `src/` - Library source code
   - `playground/` - Vite playground (optional, for framework templates)
   - `rolldown.config.js` - Rolldown configuration
   - `vite.config.ts` - Vite configuration (if playground exists)
   - `package.json` - With proper exports and scripts
   - `tsconfig.json` - TypeScript configuration
   - `.gitignore` - Git ignore rules
   - `README.md` - Template documentation
3. Use `.gitignore` (not `_gitignore`) - it will be preserved during scaffolding
4. Update `FRAMEWORKS` array in `src/utils/constants.ts`
5. Test the new template with both interactive and non-interactive modes

## How It Works

1. **Parse CLI arguments** using `mri`
2. **Detect mode** (interactive vs non-interactive based on TTY and flags)
3. **Collect configuration** (project name, template, options)
4. **Validate inputs** (package name format, directory conflicts)
5. **Copy template files** to target directory
6. **Update files** (package.json name, metadata)
7. **Optionally install dependencies** and start playground

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT - see [LICENSE](./LICENSE) file for details

## Related Projects

- [Rolldown](https://rolldown.rs) - Fast JavaScript bundler written in Rust
- [tsdown](https://tsdown.dev) - TypeScript bundler built on Rolldown
- [create-vite](https://github.com/vitejs/vite/tree/main/packages/create-vite) - Inspiration for this project
