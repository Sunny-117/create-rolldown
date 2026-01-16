import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fc from 'fast-check'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import {
  formatTargetDir,
  isValidPackageName,
  toValidPackageName,
  isEmpty,
  emptyDir,
  pkgFromUserAgent,
  getInstallCommand,
  getRunCommand,
  parseArguments,
  shouldUseInteractiveMode,
  promptProjectName,
  promptOverwrite,
  promptPackageName,
  promptFramework,
  promptVariant,
  promptImmediate,
  FRAMEWORKS,
  TEMPLATES,
  renameFiles,
  type CLIArguments,
  type Framework,
} from './index'

// Mock @clack/prompts module
vi.mock('@clack/prompts', () => ({
  text: vi.fn(),
  select: vi.fn(),
  confirm: vi.fn(),
  cancel: vi.fn(),
  isCancel: vi.fn(),
}))

describe('Property Tests - String Validation and Formatting', () => {
  it('Property 3: Directory name formatting idempotence', () => {
    // Feature: create-rolldown, Property 3: 目录名称格式化幂等性
    // Validates: Requirements 1.3
    fc.assert(
      fc.property(fc.string(), (dirName) => {
        const formatted1 = formatTargetDir(dirName)
        const formatted2 = formatTargetDir(formatted1)
        expect(formatted1).toBe(formatted2)
      }),
      { numRuns: 100 }
    )
  })

  it('Property 4: Package name validation and conversion correctness', () => {
    // Feature: create-rolldown, Property 4: 包名称验证和转换正确性
    // Validates: Requirements 2.5, 10.5
    fc.assert(
      fc.property(fc.string(), (name) => {
        const validName = toValidPackageName(name)
        expect(isValidPackageName(validName)).toBe(true)
      }),
      { numRuns: 100 }
    )
  })

  it('Property 15: Package name conversion round-trip consistency', () => {
    // Feature: create-rolldown, Property 15: 包名称转换往返一致性
    // Validates: Requirements 2.5, 10.5
    fc.assert(
      fc.property(
        fc
          .string()
          .filter((s) => isValidPackageName(s) && s.length > 0),
        (validName) => {
          const converted = toValidPackageName(validName)
          expect(isValidPackageName(converted)).toBe(true)
          // If it was already valid, it should remain valid after conversion
          expect(isValidPackageName(validName)).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Property Tests - File System Operations', () => {
  it('Property 11: Directory emptying preserves .git', () => {
    // Feature: create-rolldown, Property 11: 目录清空保留 .git
    // Validates: Requirements 4.6
    fc.assert(
      fc.property(
        fc.array(fc.string().filter((s) => s.length > 0 && s !== '.git' && s !== '.' && s !== '..' && !s.includes('/'))),
        (fileNames) => {
          // Create a temporary directory for testing
          const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-emptydir-'))
          
          try {
            // Create .git directory
            const gitDir = path.join(tempDir, '.git')
            fs.mkdirSync(gitDir)
            fs.writeFileSync(path.join(gitDir, 'config'), 'test')
            
            // Create other files
            for (const fileName of fileNames) {
              const filePath = path.join(tempDir, fileName)
              fs.writeFileSync(filePath, 'test content')
            }
            
            // Empty the directory
            emptyDir(tempDir)
            
            // Check that .git still exists
            expect(fs.existsSync(gitDir)).toBe(true)
            expect(fs.existsSync(path.join(gitDir, 'config'))).toBe(true)
            
            // Check that other files are removed
            const remainingFiles = fs.readdirSync(tempDir)
            expect(remainingFiles).toEqual(['.git'])
          } finally {
            // Cleanup
            fs.rmSync(tempDir, { recursive: true, force: true })
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Property Tests - Package Manager Detection', () => {
  it('Property 12: Package manager command format correctness', () => {
    // Feature: create-rolldown, Property 12: 包管理器命令格式正确性
    // Validates: Requirements 5.3, 6.2
    fc.assert(
      fc.property(
        fc.constantFrom('npm', 'pnpm', 'yarn', 'bun', 'deno'),
        fc.string().filter((s) => s.length > 0),
        (agent, script) => {
          // Test install command format
          const installCmd = getInstallCommand(agent)
          expect(Array.isArray(installCmd)).toBe(true)
          expect(installCmd.length).toBeGreaterThan(0)
          expect(installCmd[0]).toBe(agent)
          
          // Verify specific command formats
          switch (agent) {
            case 'npm':
              expect(installCmd).toEqual(['npm', 'install'])
              break
            case 'pnpm':
              expect(installCmd).toEqual(['pnpm', 'install'])
              break
            case 'yarn':
              expect(installCmd).toEqual(['yarn'])
              break
            case 'bun':
              expect(installCmd).toEqual(['bun', 'install'])
              break
            case 'deno':
              expect(installCmd).toEqual(['deno', 'install'])
              break
          }
          
          // Test run command format
          const runCmd = getRunCommand(agent, script)
          expect(Array.isArray(runCmd)).toBe(true)
          expect(runCmd.length).toBeGreaterThan(0)
          expect(runCmd[0]).toBe(agent)
          expect(runCmd).toContain(script)
          
          // Verify specific run command formats
          switch (agent) {
            case 'npm':
              expect(runCmd).toEqual(['npm', 'run', script])
              break
            case 'pnpm':
              expect(runCmd).toEqual(['pnpm', script])
              break
            case 'yarn':
              expect(runCmd).toEqual(['yarn', script])
              break
            case 'bun':
              expect(runCmd).toEqual(['bun', 'run', script])
              break
            case 'deno':
              expect(runCmd).toEqual(['deno', 'task', script])
              break
          }
        }
      ),
      { numRuns: 100 }
    )
  })
  
  it('pkgFromUserAgent parses valid user agent strings', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('npm', 'pnpm', 'yarn', 'bun', 'deno'),
        fc.string().filter((s) => s.length > 0 && !s.includes(' ') && !s.includes('/')),
        (agent, version) => {
          const userAgent = `${agent}/${version} node/v18.0.0`
          const result = pkgFromUserAgent(userAgent)
          
          expect(result).toBeDefined()
          expect(result?.name).toBe(agent)
          expect(result?.version).toBe(version)
        }
      ),
      { numRuns: 100 }
    )
  })
  
  it('pkgFromUserAgent returns undefined for invalid input', () => {
    expect(pkgFromUserAgent(undefined)).toBeUndefined()
    expect(pkgFromUserAgent('')).toBeUndefined()
    expect(pkgFromUserAgent('invalid')).toBeUndefined()
  })
})

describe('Property Tests - CLI Argument Parsing', () => {
  it('Property 1: CLI mode detection correctness', () => {
    // Feature: create-rolldown, Property 1: CLI 模式检测正确性
    // Validates: Requirements 1.1, 1.7, 2.1, 10.1
    fc.assert(
      fc.property(
        fc.boolean(), // interactive flag
        fc.boolean(), // isTTY
        fc.boolean(), // isCI
        (interactiveFlag, isTTY, isCI) => {
          // Create mock args with explicit interactive flag or undefined
          const args: CLIArguments = {
            _: [],
            interactive: fc.sample(fc.constantFrom(true, false, undefined), 1)[0],
          }
          
          // Save original values
          const originalStdoutIsTTY = process.stdout.isTTY
          const originalStdinIsTTY = process.stdin.isTTY
          const originalCI = process.env.CI
          
          try {
            // Mock TTY and CI environment
            Object.defineProperty(process.stdout, 'isTTY', {
              value: isTTY,
              writable: true,
              configurable: true,
            })
            Object.defineProperty(process.stdin, 'isTTY', {
              value: isTTY,
              writable: true,
              configurable: true,
            })
            if (isCI) {
              process.env.CI = 'true'
            } else {
              delete process.env.CI
            }
            
            const result = shouldUseInteractiveMode(args)
            
            // If interactive is explicitly set, it should be used
            if (args.interactive !== undefined) {
              expect(result).toBe(args.interactive)
            } else {
              // Otherwise, should be interactive only if TTY and not CI
              expect(result).toBe(isTTY && !isCI)
            }
          } finally {
            // Restore original values
            Object.defineProperty(process.stdout, 'isTTY', {
              value: originalStdoutIsTTY,
              writable: true,
              configurable: true,
            })
            Object.defineProperty(process.stdin, 'isTTY', {
              value: originalStdinIsTTY,
              writable: true,
              configurable: true,
            })
            if (originalCI !== undefined) {
              process.env.CI = originalCI
            } else {
              delete process.env.CI
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })
  
  it('Property 2: Command line argument application correctness', () => {
    // Feature: create-rolldown, Property 2: 命令行参数应用正确性
    // Validates: Requirements 1.1, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 10.1
    fc.assert(
      fc.property(
        fc.array(fc.string().filter((s) => !s.startsWith('-'))), // positional arguments (exclude flags)
        fc.option(fc.string().filter((s) => s.length > 0 && !s.startsWith('-')), { nil: undefined }), // template (non-empty, not starting with -)
        fc.boolean(), // help
        fc.boolean(), // overwrite
        fc.boolean(), // immediate
        fc.option(fc.boolean(), { nil: undefined }), // interactive
        (positional, template, help, overwrite, immediate, interactive) => {
          // Build argv array
          const argv: string[] = [...positional]
          
          if (template) {
            argv.push('--template', template)
          }
          if (help) {
            argv.push('--help')
          }
          if (overwrite) {
            argv.push('--overwrite')
          }
          if (immediate) {
            argv.push('--immediate')
          }
          if (interactive === true) {
            argv.push('--interactive')
          } else if (interactive === false) {
            argv.push('--no-interactive')
          }
          
          // Parse arguments
          const result = parseArguments(argv)
          
          // Verify all arguments are correctly parsed
          expect(result._).toEqual(positional)
          expect(result.template).toBe(template)
          expect(result.help).toBe(help || undefined)
          expect(result.overwrite).toBe(overwrite || undefined)
          expect(result.immediate).toBe(immediate || undefined)
          expect(result.interactive).toBe(interactive)
        }
      ),
      { numRuns: 100 }
    )
  })
  
  it('parseArguments handles short flags correctly', () => {
    const result1 = parseArguments(['-h'])
    expect(result1.help).toBe(true)
    
    const result2 = parseArguments(['-t', 'react'])
    expect(result2.template).toBe('react')
    
    const result3 = parseArguments(['-i'])
    expect(result3.immediate).toBe(true)
    
    const result4 = parseArguments(['my-app', '-t', 'vue-ts', '-i'])
    expect(result4._).toEqual(['my-app'])
    expect(result4.template).toBe('vue-ts')
    expect(result4.immediate).toBe(true)
  })
  
  it('parseArguments handles long flags correctly', () => {
    const result1 = parseArguments(['--help'])
    expect(result1.help).toBe(true)
    
    const result2 = parseArguments(['--template', 'react'])
    expect(result2.template).toBe('react')
    
    const result3 = parseArguments(['--immediate'])
    expect(result3.immediate).toBe(true)
    
    const result4 = parseArguments(['--overwrite'])
    expect(result4.overwrite).toBe(true)
    
    const result5 = parseArguments(['--interactive'])
    expect(result5.interactive).toBe(true)
    
    const result6 = parseArguments(['--no-interactive'])
    expect(result6.interactive).toBe(false)
  })
  
  it('parseArguments handles mixed arguments correctly', () => {
    const result = parseArguments([
      'my-project',
      '--template',
      'svelte-ts',
      '--overwrite',
      '-i',
    ])
    
    expect(result._).toEqual(['my-project'])
    expect(result.template).toBe('svelte-ts')
    expect(result.overwrite).toBe(true)
    expect(result.immediate).toBe(true)
  })
  
  it('shouldUseInteractiveMode respects explicit interactive flag', () => {
    const args1: CLIArguments = { _: [], interactive: true }
    expect(shouldUseInteractiveMode(args1)).toBe(true)
    
    const args2: CLIArguments = { _: [], interactive: false }
    expect(shouldUseInteractiveMode(args2)).toBe(false)
  })
})

describe('Unit Tests - Framework Data Structures', () => {
  it('verifies all required frameworks are defined', () => {
    // Requirements: 3.1
    const requiredFrameworks = ['vanilla', 'vue', 'react', 'svelte', 'solid', 'qwik']
    const definedFrameworks = FRAMEWORKS.map((f) => f.name)
    
    for (const required of requiredFrameworks) {
      expect(definedFrameworks).toContain(required)
    }
    
    expect(FRAMEWORKS.length).toBe(requiredFrameworks.length)
  })
  
  it('verifies TypeScript variant symmetry', () => {
    // Requirements: 3.2
    // For any framework that supports TypeScript, there must be a corresponding JavaScript variant
    for (const framework of FRAMEWORKS) {
      const variantNames = framework.variants.map((v) => v.name)
      const hasTypeScript = variantNames.some((name) => name.endsWith('-ts'))
      const hasJavaScript = variantNames.some((name) => !name.endsWith('-ts'))
      
      if (hasTypeScript) {
        // If there's a TypeScript variant, there must be a JavaScript variant
        expect(hasJavaScript).toBe(true)
        
        // Verify that for each TypeScript variant, there's a corresponding JavaScript variant
        const tsVariants = variantNames.filter((name) => name.endsWith('-ts'))
        for (const tsVariant of tsVariants) {
          const jsVariant = tsVariant.replace('-ts', '')
          expect(variantNames).toContain(jsVariant)
        }
      }
    }
  })
  
  it('verifies all frameworks have at least one variant', () => {
    for (const framework of FRAMEWORKS) {
      expect(framework.variants.length).toBeGreaterThan(0)
    }
  })
  
  it('verifies all framework properties are defined', () => {
    for (const framework of FRAMEWORKS) {
      expect(framework.name).toBeDefined()
      expect(framework.display).toBeDefined()
      expect(framework.color).toBeDefined()
      expect(typeof framework.color).toBe('function')
      expect(framework.variants).toBeDefined()
      expect(Array.isArray(framework.variants)).toBe(true)
    }
  })
  
  it('verifies all variant properties are defined', () => {
    for (const framework of FRAMEWORKS) {
      for (const variant of framework.variants) {
        expect(variant.name).toBeDefined()
        expect(variant.display).toBeDefined()
        expect(variant.color).toBeDefined()
        expect(typeof variant.color).toBe('function')
      }
    }
  })
  
  it('verifies TEMPLATES contains all variant names', () => {
    const allVariantNames: string[] = []
    for (const framework of FRAMEWORKS) {
      for (const variant of framework.variants) {
        allVariantNames.push(variant.name)
      }
    }
    
    expect(TEMPLATES.length).toBe(allVariantNames.length)
    
    for (const variantName of allVariantNames) {
      expect(TEMPLATES).toContain(variantName)
    }
  })
  
  it('verifies renameFiles mapping is defined', () => {
    expect(renameFiles).toBeDefined()
    expect(typeof renameFiles).toBe('object')
    expect(renameFiles._gitignore).toBe('.gitignore')
  })
  
  it('verifies color functions work correctly', () => {
    for (const framework of FRAMEWORKS) {
      const coloredText = framework.color('test')
      expect(typeof coloredText).toBe('string')
      expect(coloredText.length).toBeGreaterThan(0)
      
      for (const variant of framework.variants) {
        const variantColoredText = variant.color('test')
        expect(typeof variantColoredText).toBe('string')
        expect(variantColoredText.length).toBeGreaterThan(0)
      }
    }
  })
  
  it('verifies variant names match expected pattern', () => {
    for (const framework of FRAMEWORKS) {
      for (const variant of framework.variants) {
        // Variant name should either be the framework name or framework name + '-ts'
        const isJavaScript = variant.name === framework.name
        const isTypeScript = variant.name === `${framework.name}-ts`
        expect(isJavaScript || isTypeScript).toBe(true)
      }
    }
  })
})

describe('Unit Tests - Interactive Prompts', () => {
  // Import the mocked prompts - will be mocked by vi.mock at the top
  let prompts: any
  
  beforeEach(async () => {
    prompts = await import('@clack/prompts')
    vi.clearAllMocks()
  })
  
  // Mock process.exit to prevent tests from actually exiting
  const mockExit = vi.spyOn(process, 'exit').mockImplementation((code?: number) => {
    throw new Error(`process.exit called with code ${code}`)
  })
  
  afterEach(() => {
    mockExit.mockClear()
    vi.clearAllMocks()
  })
  
  describe('promptProjectName', () => {
    it('returns user input when valid project name is provided', async () => {
      // Requirements: 2.2
      vi.mocked(prompts.text).mockResolvedValue('my-project')
      vi.mocked(prompts.isCancel).mockReturnValue(false)
      
      const result = await promptProjectName('default-project')
      
      expect(result).toBe('my-project')
      expect(prompts.text).toHaveBeenCalledWith({
        message: 'Project name:',
        placeholder: 'default-project',
        defaultValue: 'default-project',
        validate: expect.any(Function),
      })
    })
    
    it('validates empty project names', async () => {
      // Requirements: 2.3
      vi.mocked(prompts.text).mockResolvedValue('test')
      vi.mocked(prompts.isCancel).mockReturnValue(false)
      
      await promptProjectName('default')
      
      const call = vi.mocked(prompts.text).mock.calls[0][0]
      const validateFn = call.validate
      
      // Test validation function
      expect(validateFn('')).toBe('Project name cannot be empty')
      expect(validateFn('   ')).toBe('Project name cannot be empty')
      expect(validateFn('valid-name')).toBeUndefined()
    })
    
    it('exits when user cancels', async () => {
      // Requirements: 8.3
      vi.mocked(prompts.text).mockResolvedValue(Symbol.for('clack.cancel'))
      vi.mocked(prompts.isCancel).mockReturnValue(true)
      vi.mocked(prompts.cancel).mockImplementation(() => {})
      
      await expect(promptProjectName('default')).rejects.toThrow('process.exit called with code 0')
      
      expect(prompts.cancel).toHaveBeenCalledWith('Operation cancelled')
      expect(mockExit).toHaveBeenCalledWith(0)
    })
  })
  
  describe('promptOverwrite', () => {
    it('returns user selection for overwrite options', async () => {
      // Requirements: 2.4
      vi.mocked(prompts.select).mockResolvedValue('yes')
      vi.mocked(prompts.isCancel).mockReturnValue(false)
      
      const result = await promptOverwrite('/path/to/dir')
      
      expect(result).toBe('yes')
      expect(prompts.select).toHaveBeenCalledWith({
        message: 'Target directory "/path/to/dir" is not empty. Please choose how to proceed:',
        options: [
          { value: 'yes', label: 'Remove existing files and continue' },
          { value: 'no', label: 'Cancel operation' },
          { value: 'ignore', label: 'Ignore files and continue' },
        ],
      })
    })
    
    it('handles all three overwrite options', async () => {
      // Requirements: 2.4
      vi.mocked(prompts.isCancel).mockReturnValue(false)
      
      // Test 'yes' option
      vi.mocked(prompts.select).mockResolvedValueOnce('yes')
      expect(await promptOverwrite('/dir')).toBe('yes')
      
      // Test 'no' option
      vi.mocked(prompts.select).mockResolvedValueOnce('no')
      expect(await promptOverwrite('/dir')).toBe('no')
      
      // Test 'ignore' option
      vi.mocked(prompts.select).mockResolvedValueOnce('ignore')
      expect(await promptOverwrite('/dir')).toBe('ignore')
    })
    
    it('exits when user cancels', async () => {
      // Requirements: 8.3
      vi.mocked(prompts.select).mockResolvedValue(Symbol.for('clack.cancel'))
      vi.mocked(prompts.isCancel).mockReturnValue(true)
      vi.mocked(prompts.cancel).mockImplementation(() => {})
      
      await expect(promptOverwrite('/dir')).rejects.toThrow('process.exit called with code 0')
      
      expect(prompts.cancel).toHaveBeenCalledWith('Operation cancelled')
      expect(mockExit).toHaveBeenCalledWith(0)
    })
  })
  
  describe('promptPackageName', () => {
    it('returns valid package name when provided', async () => {
      // Requirements: 2.5
      vi.mocked(prompts.text).mockResolvedValue('my-package')
      vi.mocked(prompts.isCancel).mockReturnValue(false)
      
      const result = await promptPackageName('default-package')
      
      expect(result).toBe('my-package')
      expect(prompts.text).toHaveBeenCalledWith({
        message: 'Package name:',
        placeholder: 'default-package',
        defaultValue: 'default-package',
        validate: expect.any(Function),
      })
    })
    
    it('validates package names according to npm conventions', async () => {
      // Requirements: 2.5
      vi.mocked(prompts.text).mockResolvedValue('test')
      vi.mocked(prompts.isCancel).mockReturnValue(false)
      
      await promptPackageName('default')
      
      const call = vi.mocked(prompts.text).mock.calls[0][0]
      const validateFn = call.validate
      
      // Test validation function
      expect(validateFn('')).toBe('Package name cannot be empty')
      expect(validateFn('   ')).toBe('Package name cannot be empty')
      expect(validateFn('Invalid-Name')).toBe('Invalid package name (must follow npm naming conventions)')
      expect(validateFn('valid-name')).toBeUndefined()
      expect(validateFn('my-package')).toBeUndefined()
      expect(validateFn('@scope/package')).toBeUndefined()
    })
    
    it('exits when user cancels', async () => {
      // Requirements: 8.3
      vi.mocked(prompts.text).mockResolvedValue(Symbol.for('clack.cancel'))
      vi.mocked(prompts.isCancel).mockReturnValue(true)
      vi.mocked(prompts.cancel).mockImplementation(() => {})
      
      await expect(promptPackageName('default')).rejects.toThrow('process.exit called with code 0')
      
      expect(prompts.cancel).toHaveBeenCalledWith('Operation cancelled')
      expect(mockExit).toHaveBeenCalledWith(0)
    })
  })
  
  describe('promptFramework', () => {
    it('returns selected framework', async () => {
      // Requirements: 2.6
      vi.mocked(prompts.select).mockResolvedValue(FRAMEWORKS[0])
      vi.mocked(prompts.isCancel).mockReturnValue(false)
      
      const result = await promptFramework(FRAMEWORKS)
      
      expect(result).toBe(FRAMEWORKS[0])
      expect(prompts.select).toHaveBeenCalledWith({
        message: 'Select a framework:',
        options: expect.any(Array),
      })
    })
    
    it('formats framework options with colors', async () => {
      // Requirements: 2.6
      vi.mocked(prompts.select).mockResolvedValue(FRAMEWORKS[0])
      vi.mocked(prompts.isCancel).mockReturnValue(false)
      
      await promptFramework(FRAMEWORKS)
      
      const call = vi.mocked(prompts.select).mock.calls[0][0]
      const options = call.options
      
      expect(options).toHaveLength(FRAMEWORKS.length)
      
      for (let i = 0; i < FRAMEWORKS.length; i++) {
        expect(options[i].value).toBe(FRAMEWORKS[i])
        expect(typeof options[i].label).toBe('string')
      }
    })
    
    it('exits when user cancels', async () => {
      // Requirements: 8.3
      vi.mocked(prompts.select).mockResolvedValue(Symbol.for('clack.cancel'))
      vi.mocked(prompts.isCancel).mockReturnValue(true)
      vi.mocked(prompts.cancel).mockImplementation(() => {})
      
      await expect(promptFramework(FRAMEWORKS)).rejects.toThrow('process.exit called with code 0')
      
      expect(prompts.cancel).toHaveBeenCalledWith('Operation cancelled')
      expect(mockExit).toHaveBeenCalledWith(0)
    })
  })
  
  describe('promptVariant', () => {
    it('returns selected variant name', async () => {
      // Requirements: 2.7
      const variants = FRAMEWORKS[0].variants
      vi.mocked(prompts.select).mockResolvedValue(variants[0].name)
      vi.mocked(prompts.isCancel).mockReturnValue(false)
      
      const result = await promptVariant(variants)
      
      expect(result).toBe(variants[0].name)
      expect(prompts.select).toHaveBeenCalledWith({
        message: 'Select a variant:',
        options: expect.any(Array),
      })
    })
    
    it('formats variant options with colors', async () => {
      // Requirements: 2.7
      const variants = FRAMEWORKS[0].variants
      vi.mocked(prompts.select).mockResolvedValue(variants[0].name)
      vi.mocked(prompts.isCancel).mockReturnValue(false)
      
      await promptVariant(variants)
      
      const call = vi.mocked(prompts.select).mock.calls[0][0]
      const options = call.options
      
      expect(options).toHaveLength(variants.length)
      
      for (let i = 0; i < variants.length; i++) {
        expect(options[i].value).toBe(variants[i].name)
        expect(typeof options[i].label).toBe('string')
      }
    })
    
    it('exits when user cancels', async () => {
      // Requirements: 8.3
      vi.mocked(prompts.select).mockResolvedValue(Symbol.for('clack.cancel'))
      vi.mocked(prompts.isCancel).mockReturnValue(true)
      vi.mocked(prompts.cancel).mockImplementation(() => {})
      
      await expect(promptVariant(FRAMEWORKS[0].variants)).rejects.toThrow('process.exit called with code 0')
      
      expect(prompts.cancel).toHaveBeenCalledWith('Operation cancelled')
      expect(mockExit).toHaveBeenCalledWith(0)
    })
  })
  
  describe('promptImmediate', () => {
    it('returns user confirmation for immediate installation', async () => {
      // Requirements: 2.8
      vi.mocked(prompts.confirm).mockResolvedValue(true)
      vi.mocked(prompts.isCancel).mockReturnValue(false)
      
      const result = await promptImmediate('pnpm')
      
      expect(result).toBe(true)
      expect(prompts.confirm).toHaveBeenCalledWith({
        message: 'Install dependencies and start dev server with pnpm?',
        initialValue: false,
      })
    })
    
    it('handles both true and false responses', async () => {
      // Requirements: 2.8
      vi.mocked(prompts.isCancel).mockReturnValue(false)
      
      // Test true response
      vi.mocked(prompts.confirm).mockResolvedValueOnce(true)
      expect(await promptImmediate('npm')).toBe(true)
      
      // Test false response
      vi.mocked(prompts.confirm).mockResolvedValueOnce(false)
      expect(await promptImmediate('yarn')).toBe(false)
    })
    
    it('includes package manager name in message', async () => {
      // Requirements: 2.8
      vi.mocked(prompts.confirm).mockResolvedValue(false)
      vi.mocked(prompts.isCancel).mockReturnValue(false)
      
      await promptImmediate('bun')
      
      expect(prompts.confirm).toHaveBeenCalledWith({
        message: 'Install dependencies and start dev server with bun?',
        initialValue: false,
      })
    })
    
    it('exits when user cancels', async () => {
      // Requirements: 8.3
      vi.mocked(prompts.confirm).mockResolvedValue(Symbol.for('clack.cancel'))
      vi.mocked(prompts.isCancel).mockReturnValue(true)
      vi.mocked(prompts.cancel).mockImplementation(() => {})
      
      await expect(promptImmediate('npm')).rejects.toThrow('process.exit called with code 0')
      
      expect(prompts.cancel).toHaveBeenCalledWith('Operation cancelled')
      expect(mockExit).toHaveBeenCalledWith(0)
    })
  })
})
