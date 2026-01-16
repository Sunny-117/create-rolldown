# create-rolldown

[![npm version](https://img.shields.io/npm/v/create-rolldown.svg)](https://www.npmjs.com/package/create-rolldown)
[![license](https://img.shields.io/npm/l/create-rolldown.svg)](https://github.com/rolldown/create-rolldown/blob/main/LICENSE)

Scaffolding tool for [Rolldown](https://rolldown.rs) projects - a fast JavaScript bundler written in Rust.

## Features

- 🚀 **Fast Setup** - Create a new Rolldown project in seconds
- 🎨 **TypeScript First** - All templates use TypeScript by default
- 🔧 **Interactive & Non-Interactive Modes** - Flexible usage for both manual and automated workflows
- 📦 **Smart Package Manager Detection** - Automatically detects and uses your preferred package manager (npm, pnpm, yarn, bun, deno)
- ⚡ **Immediate Start** - Optional flag to install dependencies and start dev server immediately

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
2. Choose a framework (React or Vanilla)
3. Optionally install dependencies and start the dev server immediately

> **Note**: All templates use TypeScript by default.

### Non-Interactive Mode

For automated workflows or CI/CD pipelines:

```bash
# Create a project with all options specified
npm create rolldown@latest my-app -- --template react --no-interactive

# With immediate install and start
npm create rolldown@latest my-app -- --template vanilla --immediate --no-interactive

# Overwrite existing directory
npm create rolldown@latest my-app -- --template react --overwrite --no-interactive
```

## Command Line Options

```
Usage: create-rolldown [project-name] [options]

Options:
  -t, --template <template>    Specify a template (vanilla or react)
  --overwrite                  Overwrite existing files in target directory
  -i, --immediate              Install dependencies and start dev server immediately
  --interactive                Force interactive mode (default in TTY)
  --no-interactive             Force non-interactive mode (default in non-TTY)
  -h, --help                   Display this help message

Available templates:
  vanilla                      Vanilla TypeScript (default)
  react                        React with TypeScript
```

## Examples

### Create a React TypeScript project

```bash
npm create rolldown@latest my-react-app
# Select "react"
```

### Create a Vanilla TypeScript project and start immediately

```bash
npm create rolldown@latest my-vanilla-app -- --template vanilla --immediate
```

### Create a project in CI/CD

```bash
npm create rolldown@latest my-app -- --template react --no-interactive
```

## Supported Templates

| Template | Description |
|----------|-------------|
| `vanilla` | Vanilla TypeScript (default) |
| `react` | React with TypeScript |

> **Note**: All templates use TypeScript. More framework templates (Vue, Svelte, Solid, Qwik) are planned for future releases.

## Development

### Prerequisites

- Node.js 20.19.0+ or 22.12.0+
- pnpm (recommended) or npm

### Setup

```bash
# Clone the repository
git clone https://github.com/rolldown/create-rolldown.git
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

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Format code
pnpm format

# Check formatting
pnpm format:check
```

### Project Structure

```
create-rolldown/
├── src/
│   ├── cli.ts             # Main CLI entry point
│   └── utils/             # Utility modules
│       ├── args.ts        # Argument parsing
│       ├── command.ts     # Command execution
│       ├── constants.ts   # Framework definitions
│       ├── file.ts        # File operations
│       ├── package-manager.ts  # Package manager detection
│       ├── prompts.ts     # Interactive prompts
│       ├── types.ts       # TypeScript types
│       └── validation.ts  # Input validation
├── __tests__/
│   └── cli.spec.ts        # Integration tests
├── template-vanilla/      # Vanilla JS template
├── template-react/        # React JS template
├── index.js               # CLI entry point
├── package.json
└── tsconfig.json
```

### Testing

The project uses a comprehensive testing strategy:

- **Unit Tests**: Test specific functions and edge cases
- **Property-Based Tests**: Test universal properties across many inputs using [fast-check](https://github.com/dubzzz/fast-check)
- **Integration Tests**: Test complete CLI workflows

Current test coverage: **90+ tests** covering core functionality, edge cases, and correctness properties.

Run tests:
```bash
# Run all tests once
pnpm test

# Run tests in watch mode
pnpm test:watch
```

### Adding a New Template

1. Create a new directory: `template-{framework}` (e.g., `template-vue`)
2. Add all necessary project files (package.json, config files, src/, etc.)
3. Use `_gitignore` instead of `.gitignore` (will be renamed during scaffolding)
4. Update `FRAMEWORKS` array in `src/utils/constants.ts`
5. Test the new template with both JS and TS variants

**Note**: Currently, only `template-vanilla` and `template-react` are implemented. Other frameworks defined in the code are placeholders for future development.

## How It Works

1. **Parse CLI arguments** using `mri`
2. **Detect mode** (interactive vs non-interactive based on TTY and flags)
3. **Collect configuration** (project name, template, options)
4. **Validate inputs** (package name format, directory conflicts)
5. **Copy template files** to target directory
6. **Update files** (package.json name, index.html title)
7. **Optionally install dependencies** and start dev server

## Requirements

- Node.js ^20.19.0 || >=22.12.0

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT - see [LICENSE](./LICENSE) file for details

## Related Projects

- [Rolldown](https://rolldown.rs) - Fast JavaScript bundler written in Rust
- [create-vite](https://github.com/vitejs/vite/tree/main/packages/create-vite) - Inspiration for this project
