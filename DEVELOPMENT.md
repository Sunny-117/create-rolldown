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
