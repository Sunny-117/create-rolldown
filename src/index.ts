// create-rolldown - Scaffolding tool for Rolldown projects
// Main entry point

import fs from 'node:fs'
import path from 'node:path'
import { SpawnOptions } from 'node:child_process'
import mri from 'mri'
import pc from 'picocolors'
import * as prompts from '@clack/prompts'
import spawn from 'cross-spawn'

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
 * Color function type for framework display
 */
export type ColorFunc = (str: string | number) => string

/**
 * Framework variant interface
 */
export interface FrameworkVariant {
  name: string                   // Variant identifier (template name)
  display: string                // Display name
  color: ColorFunc               // Color function
  customCommand?: string         // Custom creation command (optional)
}

/**
 * Framework interface
 */
export interface Framework {
  name: string                   // Framework identifier
  display: string                // Display name
  color: ColorFunc               // Color function
  variants: FrameworkVariant[]   // Variant list
}

/**
 * Supported frameworks with their variants
 */
export const FRAMEWORKS: Framework[] = [
  {
    name: 'vanilla',
    display: 'Vanilla',
    color: pc.yellow,
    variants: [
      {
        name: 'vanilla-ts',
        display: 'TypeScript',
        color: pc.blue,
      },
      {
        name: 'vanilla',
        display: 'JavaScript',
        color: pc.yellow,
      },
    ],
  },
  {
    name: 'vue',
    display: 'Vue',
    color: pc.green,
    variants: [
      {
        name: 'vue-ts',
        display: 'TypeScript',
        color: pc.blue,
      },
      {
        name: 'vue',
        display: 'JavaScript',
        color: pc.yellow,
      },
    ],
  },
  {
    name: 'react',
    display: 'React',
    color: pc.cyan,
    variants: [
      {
        name: 'react-ts',
        display: 'TypeScript',
        color: pc.blue,
      },
      {
        name: 'react',
        display: 'JavaScript',
        color: pc.yellow,
      },
    ],
  },
  {
    name: 'svelte',
    display: 'Svelte',
    color: pc.red,
    variants: [
      {
        name: 'svelte-ts',
        display: 'TypeScript',
        color: pc.blue,
      },
      {
        name: 'svelte',
        display: 'JavaScript',
        color: pc.yellow,
      },
    ],
  },
  {
    name: 'solid',
    display: 'Solid',
    color: pc.blue,
    variants: [
      {
        name: 'solid-ts',
        display: 'TypeScript',
        color: pc.blue,
      },
      {
        name: 'solid',
        display: 'JavaScript',
        color: pc.yellow,
      },
    ],
  },
  {
    name: 'qwik',
    display: 'Qwik',
    color: pc.magenta,
    variants: [
      {
        name: 'qwik-ts',
        display: 'TypeScript',
        color: pc.blue,
      },
      {
        name: 'qwik',
        display: 'JavaScript',
        color: pc.yellow,
      },
    ],
  },
]

/**
 * All available template names (flat list)
 */
export const TEMPLATES: string[] = FRAMEWORKS.map((f) =>
  f.variants.map((v) => v.name)
).flat()

/**
 * File rename mappings for special files
 */
export const renameFiles: Record<string, string | undefined> = {
  _gitignore: '.gitignore',
}

/**
 * Exit the process (skipped in test mode)
 * @param code - Exit code
 */
function exitProcess(code: number): void {
  if (!process.env._ROLLDOWN_TEST_CLI) {
    process.exit(code)
  }
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
 * @throws Error if directory emptying fails
 */
export function emptyDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    return
  }
  try {
    for (const file of fs.readdirSync(dir)) {
      if (file === '.git') {
        continue
      }
      fs.rmSync(path.resolve(dir, file), { recursive: true, force: true })
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to empty directory ${dir}: ${error.message}`)
    }
    throw error
  }
}

/**
 * Copy a file or directory
 * @param src - Source path
 * @param dest - Destination path
 * @throws Error if copy operation fails
 */
export function copy(src: string, dest: string): void {
  try {
    const stat = fs.statSync(src)
    if (stat.isDirectory()) {
      copyDir(src, dest)
    } else {
      fs.copyFileSync(src, dest)
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to copy from ${src} to ${dest}: ${error.message}`)
    }
    throw error
  }
}

/**
 * Recursively copy a directory
 * @param srcDir - Source directory
 * @param destDir - Destination directory
 * @throws Error if directory copy fails
 */
export function copyDir(srcDir: string, destDir: string): void {
  try {
    fs.mkdirSync(destDir, { recursive: true })
    for (const file of fs.readdirSync(srcDir)) {
      const srcFile = path.resolve(srcDir, file)
      const destFile = path.resolve(destDir, file)
      copy(srcFile, destFile)
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to copy directory from ${srcDir} to ${destDir}: ${error.message}`)
    }
    throw error
  }
}

/**
 * Write a file with optional content transformation
 * Handles special file renaming (e.g., _gitignore -> .gitignore)
 * @param file - File path to write
 * @param content - Optional content to write (if undefined, copies from template)
 */
export function write(file: string, content?: string): void {
  const targetPath = renameFiles[path.basename(file)] ?? file
  if (content) {
    fs.writeFileSync(targetPath, content)
  } else {
    copy(file, targetPath)
  }
}

/**
 * Edit a file by applying a transformation function to its content
 * @param file - File path to edit
 * @param callback - Function that transforms the file content
 */
export function editFile(file: string, callback: (content: string) => string): void {
  const content = fs.readFileSync(file, 'utf-8')
  fs.writeFileSync(file, callback(content))
}

/**
 * Copy template files to target directory with transformations
 * @param templateDir - Source template directory
 * @param root - Target root directory
 * @param projectName - Project name for replacements
 * @param packageName - Package name for package.json
 * @throws Error if template copy fails or template directory doesn't exist
 */
export function copyTemplate(
  templateDir: string,
  root: string,
  projectName: string,
  packageName: string
): void {
  // Validate template directory exists
  if (!fs.existsSync(templateDir)) {
    throw new Error(`Template directory not found: ${templateDir}`)
  }
  
  try {
    // Create target directory if it doesn't exist
    if (!fs.existsSync(root)) {
      fs.mkdirSync(root, { recursive: true })
    }
    
    const files = fs.readdirSync(templateDir)
    
    for (const file of files) {
      const srcFile = path.join(templateDir, file)
      const stat = fs.statSync(srcFile)
      
      if (stat.isDirectory()) {
        // Recursively copy directories
        const destDir = path.join(root, file)
        copyDir(srcFile, destDir)
      } else {
        // Handle file renaming for special files
        const destFileName = renameFiles[file] ?? file
        const destFile = path.join(root, destFileName)
        
        // Copy the file
        fs.copyFileSync(srcFile, destFile)
      }
    }
    
    // Update package.json with the correct package name
    const pkgJsonPath = path.join(root, 'package.json')
    if (fs.existsSync(pkgJsonPath)) {
      editFile(pkgJsonPath, (content) => {
        const pkg = JSON.parse(content)
        pkg.name = packageName
        return JSON.stringify(pkg, null, 2) + '\n'
      })
    }
    
    // Update index.html with the correct project name
    const indexHtmlPath = path.join(root, 'index.html')
    if (fs.existsSync(indexHtmlPath)) {
      editFile(indexHtmlPath, (content) => {
        // Use a replacement function to avoid issues with special regex characters
        return content.replace(/<title>.*?<\/title>/, () => `<title>${projectName}</title>`)
      })
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to copy template: ${error.message}`)
    }
    throw error
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
    default: {
      immediate: undefined,
      interactive: undefined,
    },
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
  --no-immediate            Skip dependency installation
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

/**
 * Prompt user for project name
 * @param defaultValue - Default project name
 * @returns Project name entered by user
 */
export async function promptProjectName(defaultValue: string): Promise<string> {
  const result = await prompts.text({
    message: 'Project name:',
    placeholder: defaultValue,
    defaultValue,
    validate: (value) => {
      if (!value || value.trim().length === 0) {
        return 'Project name cannot be empty'
      }
    },
  })
  
  if (prompts.isCancel(result)) {
    prompts.cancel('Operation cancelled')
    exitProcess(0)
  }
  
  return result as string
}

/**
 * Prompt user for how to handle existing directory
 * @param targetDir - The target directory path
 * @returns User's choice: 'yes' (overwrite), 'no' (cancel), or 'ignore' (merge)
 */
export async function promptOverwrite(
  targetDir: string
): Promise<'yes' | 'no' | 'ignore'> {
  const displayDir = targetDir === '.' ? 'Current directory' : `Target directory "${targetDir}"`
  const message = `${displayDir} is not empty. Please choose how to proceed:`
  
  const result = await prompts.select({
    message,
    options: [
      {
        value: 'yes',
        label: 'Remove existing files and continue',
      },
      {
        value: 'no',
        label: 'Cancel operation',
      },
      {
        value: 'ignore',
        label: 'Ignore files and continue',
      },
    ],
  })
  
  if (prompts.isCancel(result)) {
    prompts.cancel('Operation cancelled')
    exitProcess(0)
  }
  
  return result as 'yes' | 'no' | 'ignore'
}

/**
 * Prompt user for package name
 * @param defaultValue - Default package name
 * @returns Valid package name entered by user
 */
export async function promptPackageName(defaultValue: string): Promise<string> {
  const result = await prompts.text({
    message: 'Package name:',
    placeholder: defaultValue,
    defaultValue,
    validate: (value) => {
      if (!value || value.trim().length === 0) {
        return 'Package name cannot be empty'
      }
      if (!isValidPackageName(value)) {
        return 'Invalid package name (must follow npm naming conventions)'
      }
    },
  })
  
  if (prompts.isCancel(result)) {
    prompts.cancel('Operation cancelled')
    exitProcess(0)
  }
  
  return result as string
}

/**
 * Prompt user to select a framework
 * @param frameworks - Array of available frameworks
 * @returns Selected framework
 */
export async function promptFramework(
  frameworks: Framework[]
): Promise<Framework> {
  const result = await prompts.select({
    message: 'Select a framework:',
    options: frameworks.map((framework) => ({
      value: framework,
      label: framework.color(framework.display),
    })),
  })
  
  if (prompts.isCancel(result)) {
    prompts.cancel('Operation cancelled')
    exitProcess(0)
  }
  
  return result as Framework
}

/**
 * Prompt user to select a framework variant
 * @param variants - Array of available variants
 * @returns Selected variant name (template name)
 */
export async function promptVariant(
  variants: FrameworkVariant[]
): Promise<string> {
  const result = await prompts.select({
    message: 'Select a variant:',
    options: variants.map((variant) => ({
      value: variant.name,
      label: variant.color(variant.display),
    })),
  })
  
  if (prompts.isCancel(result)) {
    prompts.cancel('Operation cancelled')
    exitProcess(0)
  }
  
  return result as string
}

/**
 * Prompt user to confirm immediate installation and start
 * @param pkgManager - Package manager name
 * @returns true if user wants to install and start immediately
 */
export async function promptImmediate(pkgManager: string): Promise<boolean> {
  const result = await prompts.confirm({
    message: `Install dependencies and start dev server with ${pkgManager}?`,
    initialValue: false,
  })
  
  if (prompts.isCancel(result)) {
    prompts.cancel('Operation cancelled')
    exitProcess(0)
  }
  
  return result as boolean
}

/**
 * Execute a command using cross-spawn
 * @param command - Command array [command, ...args]
 * @param options - Spawn options
 * @throws Error if command execution fails
 */
export function run(command: string[], options?: SpawnOptions): void {
  // Skip actual command execution in test environment
  if (process.env._ROLLDOWN_TEST_CLI) {
    return
  }
  
  const [cmd, ...args] = command
  
  try {
    const result = spawn.sync(cmd, args, {
      stdio: 'inherit',
      ...options,
    })
    
    if (result.error) {
      throw new Error(`Failed to execute command: ${cmd} ${args.join(' ')}\n${result.error.message}`)
    }
    
    if (result.status !== 0) {
      throw new Error(`Command failed with exit code ${result.status}: ${cmd} ${args.join(' ')}`)
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(pc.red(`\n✗ Command execution failed: ${error.message}`))
    } else {
      console.error(pc.red(`\n✗ Command execution failed: ${String(error)}`))
    }
    throw error
  }
}

/**
 * Install dependencies in the project directory
 * @param root - Project root directory
 * @param agent - Package manager name
 * @throws Error if installation fails
 */
export function install(root: string, agent: string): void {
  const installCmd = getInstallCommand(agent)
  console.log(pc.cyan(`\nInstalling dependencies with ${agent}...`))
  
  // Skip actual installation in test environment
  if (process.env._ROLLDOWN_TEST_CLI) {
    return
  }
  
  try {
    run(installCmd, { cwd: root })
  } catch (error) {
    console.error(pc.red(`\n✗ Failed to install dependencies with ${agent}`))
    if (error instanceof Error) {
      console.error(pc.red(`Error: ${error.message}`))
    }
    throw error
  }
}

/**
 * Start the development server
 * @param root - Project root directory
 * @param agent - Package manager name
 * @throws Error if server start fails
 */
export function start(root: string, agent: string): void {
  const runCmd = getRunCommand(agent, 'dev')
  console.log(pc.cyan(`\nStarting dev server...`))
  
  // Skip actual server start in test environment
  if (process.env._ROLLDOWN_TEST_CLI) {
    return
  }
  
  try {
    run(runCmd, { cwd: root })
  } catch (error) {
    console.error(pc.red(`\n✗ Failed to start dev server with ${agent}`))
    if (error instanceof Error) {
      console.error(pc.red(`Error: ${error.message}`))
    }
    throw error
  }
}

/**
 * Main initialization function
 * Orchestrates the entire project creation workflow
 */
export async function init(): Promise<void> {
  try {
    const args = parseArguments()
    
    // Display help if requested
    if (args.help) {
      displayHelp()
      return
    }
    
    // Detect interactive mode
    const interactive = shouldUseInteractiveMode(args)
    
    // Detect AI agent environment and provide guidance
    if (!interactive && !process.stdout.isTTY) {
      console.log(pc.yellow('\nDetected non-interactive environment (AI agent or CI/CD).'))
      console.log(pc.yellow('For best results, use: create-rolldown <project-name> --template <template> --no-interactive\n'))
    }
    
    // Get target directory from arguments or use default
    const defaultProjectName = 'rolldown-project'
    let targetDir = formatTargetDir(args._[0])
    
    // Get project name (interactive or from args)
    let projectName: string
    if (interactive && !targetDir) {
      projectName = await promptProjectName(defaultProjectName)
      targetDir = formatTargetDir(projectName)
    } else {
      projectName = targetDir || defaultProjectName
      targetDir = projectName
    }
    
    // Resolve to absolute path
    const root = path.resolve(process.cwd(), targetDir)
    
    // Handle directory conflicts
    if (fs.existsSync(root) && !isEmpty(root)) {
      if (interactive) {
        const overwrite = await promptOverwrite(targetDir)
        
        if (overwrite === 'no') {
          console.log(pc.red('\nOperation cancelled'))
          exitProcess(0)
        } else if (overwrite === 'yes') {
          console.log(pc.cyan(`\nRemoving existing files in ${targetDir}...`))
          try {
            emptyDir(root)
          } catch (error) {
            console.error(pc.red(`\n✗ Failed to remove existing files`))
            if (error instanceof Error) {
              console.error(pc.red(`Error: ${error.message}`))
            }
            exitProcess(1)
          }
        }
        // If 'ignore', continue without clearing
      } else {
        // Non-interactive mode
        if (args.overwrite) {
          console.log(pc.cyan(`\nRemoving existing files in ${targetDir}...`))
          try {
            emptyDir(root)
          } catch (error) {
            console.error(pc.red(`\n✗ Failed to remove existing files`))
            if (error instanceof Error) {
              console.error(pc.red(`Error: ${error.message}`))
            }
            exitProcess(1)
          }
        } else {
          console.log(pc.red(`\nTarget directory "${targetDir}" is not empty.`))
          console.log(pc.red('Use --overwrite flag to overwrite existing files, or choose a different directory.'))
          exitProcess(1)
        }
      }
    }
    
    // Get package name
    let packageName = toValidPackageName(projectName)
    if (interactive && !isValidPackageName(projectName)) {
      packageName = await promptPackageName(packageName)
    }
    
    // Get template
    let template = args.template
    
    if (interactive && !template) {
      // Prompt for framework
      const framework = await promptFramework(FRAMEWORKS)
      
      // Prompt for variant
      template = await promptVariant(framework.variants)
    } else if (!template) {
      // Non-interactive mode without template - use default
      template = 'vanilla-ts'
    }
    
    // Validate template
    if (!TEMPLATES.includes(template)) {
      if (interactive) {
        console.log(pc.yellow(`\n"${template}" isn't a valid template. Please choose from below:\n`))
        const framework = await promptFramework(FRAMEWORKS)
        template = await promptVariant(framework.variants)
      } else {
        console.log(pc.yellow(`\nTemplate "${template}" not found. Using default template "vanilla-ts".\n`))
        template = 'vanilla-ts'
      }
    }
    
    // Detect package manager
    const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent)
    const pkgManager = pkgInfo?.name || 'npm'
    
    // Ask about immediate installation (interactive only)
    let shouldInstall = false
    if (args.immediate === true) {
      shouldInstall = true
    } else if (args.immediate === false) {
      shouldInstall = false
    } else if (interactive) {
      shouldInstall = await promptImmediate(pkgManager)
    }
    
    // Start scaffolding
    console.log(pc.cyan(`\nScaffolding project in ${root}...`))
    
    // Get template directory
    const templateDir = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      '..',
      `template-${template}`
    )
    
    // Create target directory if it doesn't exist
    try {
      if (!fs.existsSync(root)) {
        fs.mkdirSync(root, { recursive: true })
      }
    } catch (error) {
      console.error(pc.red(`\n✗ Failed to create project directory`))
      if (error instanceof Error) {
        console.error(pc.red(`Error: ${error.message}`))
      }
      exitProcess(1)
    }
    
    // Copy template files
    try {
      copyTemplate(templateDir, root, projectName, packageName)
    } catch (error) {
      console.error(pc.red(`\n✗ Failed to copy template files`))
      if (error instanceof Error) {
        console.error(pc.red(`Error: ${error.message}`))
      }
      exitProcess(1)
    }
    
    console.log(pc.green('\n✓ Project created successfully!'))
    
    // Install dependencies and start server if requested
    if (shouldInstall) {
      try {
        install(root, pkgManager)
        console.log(pc.green('\n✓ Dependencies installed successfully!'))
        
        start(root, pkgManager)
      } catch (error) {
        console.error(pc.red('\n✗ Failed to install dependencies or start server'))
        if (error instanceof Error) {
          console.error(pc.red(`Error: ${error.message}`))
        }
        exitProcess(1)
      }
    } else {
      // Display next steps
      console.log(pc.cyan('\nDone. Now run:\n'))
      
      const cdCommand = path.relative(process.cwd(), root)
      if (cdCommand) {
        console.log(pc.cyan(`  cd ${cdCommand}`))
      }
      
      const installCmd = getInstallCommand(pkgManager).join(' ')
      console.log(pc.cyan(`  ${installCmd}`))
      
      const runCmd = getRunCommand(pkgManager, 'dev').join(' ')
      console.log(pc.cyan(`  ${runCmd}`))
      
      console.log()
    }
  } catch (error) {
    // Handle any unexpected errors
    if (error instanceof Error) {
      console.error(pc.red(`\n✗ An unexpected error occurred: ${error.message}`))
    } else {
      console.error(pc.red(`\n✗ An unexpected error occurred: ${String(error)}`))
    }
    exitProcess(1)
  }
}

// Run init function
init().catch((error) => {
  // Error handling is already done in init(), but catch any unhandled errors
  if (error instanceof Error && error.message !== 'process.exit called with code 0') {
    console.error(pc.red(`\n✗ Fatal error: ${error.message}`))
  }
  if (!process.env._ROLLDOWN_TEST_CLI && !process.env.VITEST) {
    exitProcess(1)
  }
})
