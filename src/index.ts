// create-rolldown - Scaffolding tool for Rolldown projects
// Main entry point

import fs from 'node:fs'
import path from 'node:path'
import mri from 'mri'

/**
 * CLI Arguments interface
 */
export interface CLIArguments {
  _: string[]                    // Positional arguments
  template?: string              // Template name (-t, --template)
  help?: boolean                 // Show help (-h, --help)
  overwrite?: boolean            // Overwrite existing files (--overwrite)
  immediate?: boolean            // Install and start immediately (-i, --immediate)
  interactive?: boolean          // Force interactive/non-interactive mode (--interactive, --no-interactive)
}

/**
 * Format target directory by removing trailing slashes and whitespace
 * @param targetDir - The directory path to format
 * @returns Formatted directory path
 */
export function formatTargetDir(targetDir: string | undefined): string {
  return targetDir?.trim().replace(/\/+$/g, '') ?? ''
}

/**
 * Validate if a string is a valid npm package name
 * @param projectName - The project name to validate
 * @returns true if valid, false otherwise
 */
export function isValidPackageName(projectName: string): boolean {
  return /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(
    projectName
  )
}

/**
 * Convert a string to a valid npm package name
 * @param projectName - The project name to convert
 * @returns Valid npm package name
 */
export function toValidPackageName(projectName: string): string {
  const converted = projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^a-z0-9-~]+/g, '-')
  
  // If the result is empty or invalid, return a default valid name
  return converted || 'package'
}

/**
 * Check if a directory is empty (ignoring .git)
 * @param path - The directory path to check
 * @returns true if empty or only contains .git, false otherwise
 */
export function isEmpty(path: string): boolean {
  const files = fs.readdirSync(path)
  return files.length === 0 || (files.length === 1 && files[0] === '.git')
}

/**
 * Empty a directory but preserve .git folder
 * @param dir - The directory to empty
 */
export function emptyDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    return
  }
  for (const file of fs.readdirSync(dir)) {
    if (file === '.git') {
      continue
    }
    fs.rmSync(path.resolve(dir, file), { recursive: true, force: true })
  }
}

/**
 * Copy a file or directory
 * @param src - Source path
 * @param dest - Destination path
 */
export function copy(src: string, dest: string): void {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    copyDir(src, dest)
  } else {
    fs.copyFileSync(src, dest)
  }
}

/**
 * Recursively copy a directory
 * @param srcDir - Source directory
 * @param destDir - Destination directory
 */
export function copyDir(srcDir: string, destDir: string): void {
  fs.mkdirSync(destDir, { recursive: true })
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file)
    const destFile = path.resolve(destDir, file)
    copy(srcFile, destFile)
  }
}

/**
 * Package manager information
 */
export interface PkgInfo {
  name: string
  version: string
}

/**
 * Parse package manager information from user agent string
 * @param userAgent - The user agent string (typically from npm_config_user_agent)
 * @returns Package manager info or undefined if not found
 */
export function pkgFromUserAgent(
  userAgent: string | undefined
): PkgInfo | undefined {
  if (!userAgent) return undefined
  
  const pkgSpec = userAgent.split(' ')[0]
  const pkgSpecArr = pkgSpec.split('/')
  
  if (pkgSpecArr.length !== 2) return undefined
  
  return {
    name: pkgSpecArr[0],
    version: pkgSpecArr[1],
  }
}

/**
 * Get install command for a package manager
 * @param agent - Package manager name (npm, pnpm, yarn, bun, deno)
 * @returns Array of command parts
 */
export function getInstallCommand(agent: string): string[] {
  switch (agent) {
    case 'npm':
      return ['npm', 'install']
    case 'pnpm':
      return ['pnpm', 'install']
    case 'yarn':
      return ['yarn']
    case 'bun':
      return ['bun', 'install']
    case 'deno':
      return ['deno', 'install']
    default:
      return ['npm', 'install']
  }
}

/**
 * Get run command for a package manager
 * @param agent - Package manager name (npm, pnpm, yarn, bun, deno)
 * @param script - Script name to run
 * @returns Array of command parts
 */
export function getRunCommand(agent: string, script: string): string[] {
  switch (agent) {
    case 'npm':
      return ['npm', 'run', script]
    case 'pnpm':
      return ['pnpm', script]
    case 'yarn':
      return ['yarn', script]
    case 'bun':
      return ['bun', 'run', script]
    case 'deno':
      return ['deno', 'task', script]
    default:
      return ['npm', 'run', script]
  }
}

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
  })
  
  return {
    _: args._,
    template: args.template,
    help: args.help,
    overwrite: args.overwrite,
    immediate: args.immediate,
    interactive: args.interactive,
  }
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
  --interactive             Force interactive mode
  --no-interactive          Force non-interactive mode

Examples:
  $ npm create rolldown
  $ npm create rolldown my-app
  $ npm create rolldown my-app --template react-ts
  $ npm create rolldown my-app -t vue --immediate
  $ npm create rolldown my-app --no-interactive --template vanilla-ts
`)
}

/**
 * Detect if CLI should run in interactive mode
 * @param args - Parsed CLI arguments
 * @returns true if interactive mode should be used
 */
export function shouldUseInteractiveMode(args: CLIArguments): boolean {
  // If explicitly set via --interactive or --no-interactive, use that
  if (args.interactive !== undefined) {
    return args.interactive
  }
  
  // Check if running in a TTY environment
  const isTTY = process.stdout.isTTY && process.stdin.isTTY
  
  // Check for AI agent environment (common CI/CD or agent indicators)
  const isAIAgent = 
    process.env.CI === 'true' ||
    process.env.CONTINUOUS_INTEGRATION === 'true' ||
    !isTTY
  
  return !isAIAgent
}

async function init(): Promise<void> {
  const args = parseArguments()
  
  // Display help if requested
  if (args.help) {
    displayHelp()
    return
  }
  
  // Detect interactive mode
  const interactive = shouldUseInteractiveMode(args)
  
  // Get target directory from arguments or use default
  const argTargetDir = formatTargetDir(args._[0])
  
  // TODO: Implement rest of initialization logic
  console.log('create-rolldown')
  console.log('Arguments:', args)
  console.log('Interactive mode:', interactive)
  console.log('Target directory:', argTargetDir || 'rolldown-project')
}

init().catch((error) => {
  console.error(error)
  process.exit(1)
})
