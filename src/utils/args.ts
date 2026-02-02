/**
 * Command line argument parsing utilities
 */
import mri from 'mri';
import type { CLIArguments } from './types';

/**
 * Parse command line arguments
 * @param argv - Command line arguments (defaults to process.argv.slice(2))
 * @returns Parsed CLI arguments
 */
export function parseArguments(argv: string[] = process.argv.slice(2)): CLIArguments {
  const args = mri(argv, {
    alias: {
      h: 'help',
      t: 'template',
      i: 'immediate',
    },
    boolean: ['help', 'overwrite', 'immediate', 'interactive'],
    string: ['template'],
    default: {
      immediate: undefined,
      interactive: undefined,
    },
  });

  return {
    _: args._,
    template: args.template,
    help: args.help,
    overwrite: args.overwrite,
    immediate: args.immediate,
    interactive: args.interactive,
  };
}

/**
 * Display help information
 */
export function displayHelp(): void {
  console.log(`
Usage: create-rolldown [project-name] [options]

Options:
  -t, --template <name>     Use a specific template
  -h, --help                Display this help message
  --overwrite               Overwrite existing files in target directory
  -i, --immediate           Install dependencies and start dev server immediately
  --no-immediate            Skip dependency installation
  --interactive             Force interactive mode
  --no-interactive          Force non-interactive mode

Available templates:
  vanilla                   Vanilla TypeScript library (default)
  react                     React library with TypeScript
  vue                       Vue library with TypeScript
  solid                     SolidJS library with TypeScript
  svelte                    Svelte library with TypeScript

Examples:
  $ npm create rolldown
  $ npm create rolldown my-lib
  $ npm create rolldown my-lib --template react
  $ npm create rolldown my-lib -t vue --immediate
  $ npm create rolldown my-lib --no-interactive --template solid
`);
}

/**
 * Detect if CLI should run in interactive mode
 * @param args - Parsed CLI arguments
 * @returns true if interactive mode should be used
 */
export function shouldUseInteractiveMode(args: CLIArguments): boolean {
  // If explicitly set via --interactive or --no-interactive, use that
  if (args.interactive !== undefined) {
    return args.interactive;
  }

  // Check if running in a TTY environment
  const isTTY = process.stdout.isTTY && process.stdin.isTTY;

  // Check for AI agent environment (common CI/CD or agent indicators)
  const isAIAgent =
    process.env.CI === 'true' || process.env.CONTINUOUS_INTEGRATION === 'true' || !isTTY;

  return !isAIAgent;
}
