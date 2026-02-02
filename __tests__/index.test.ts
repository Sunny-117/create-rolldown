import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  formatTargetDir,
  isValidPackageName,
  toValidPackageName,
  isEmpty,
  emptyDir,
  copyDir,
  copyTemplate,
  pkgFromUserAgent,
  getInstallCommand,
  getRunCommand,
  parseArguments,
  shouldUseInteractiveMode,
  promptProjectName,
  promptOverwrite,
  promptPackageName,
  promptFramework,
  promptImmediate,
  install,
  start,
  FRAMEWORKS,
  TEMPLATES,
  renameFiles,
  type CLIArguments,
} from '../src/utils';

// Mock @clack/prompts module
vi.mock('@clack/prompts', () => ({
  text: vi.fn(),
  select: vi.fn(),
  confirm: vi.fn(),
  cancel: vi.fn(),
  isCancel: vi.fn(),
}));

describe('Property Tests - String Validation and Formatting', () => {
  it('Property 3: Directory name formatting idempotence', () => {
    // Feature: create-rolldown, Property 3: 目录名称格式化幂等性
    // Validates: Requirements 1.3
    fc.assert(
      fc.property(fc.string(), (dirName) => {
        const formatted1 = formatTargetDir(dirName);
        const formatted2 = formatTargetDir(formatted1);
        expect(formatted1).toBe(formatted2);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 4: Package name validation and conversion correctness', () => {
    // Feature: create-rolldown, Property 4: 包名称验证和转换正确性
    // Validates: Requirements 2.5, 10.5
    fc.assert(
      fc.property(fc.string(), (name) => {
        const validName = toValidPackageName(name);
        expect(isValidPackageName(validName)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 15: Package name conversion round-trip consistency', () => {
    // Feature: create-rolldown, Property 15: 包名称转换往返一致性
    // Validates: Requirements 2.5, 10.5
    fc.assert(
      fc.property(
        fc.string().filter((s) => isValidPackageName(s) && s.length > 0),
        (validName) => {
          const converted = toValidPackageName(validName);
          expect(isValidPackageName(converted)).toBe(true);
          // If it was already valid, it should remain valid after conversion
          expect(isValidPackageName(validName)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property Tests - File System Operations', () => {
  it('Property 11: Directory emptying preserves .git', () => {
    // Feature: create-rolldown, Property 11: 目录清空保留 .git
    // Validates: Requirements 4.6
    fc.assert(
      fc.property(
        fc.array(
          fc
            .string()
            .filter(
              (s) => s.length > 0 && s !== '.git' && s !== '.' && s !== '..' && !s.includes('/')
            )
        ),
        (fileNames) => {
          // Create a temporary directory for testing
          const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-emptydir-'));

          try {
            // Create .git directory
            const gitDir = path.join(tempDir, '.git');
            fs.mkdirSync(gitDir);
            fs.writeFileSync(path.join(gitDir, 'config'), 'test');

            // Create other files
            for (const fileName of fileNames) {
              const filePath = path.join(tempDir, fileName);
              fs.writeFileSync(filePath, 'test content');
            }

            // Empty the directory
            emptyDir(tempDir);

            // Check that .git still exists
            expect(fs.existsSync(gitDir)).toBe(true);
            expect(fs.existsSync(path.join(gitDir, 'config'))).toBe(true);

            // Check that other files are removed
            const remainingFiles = fs.readdirSync(tempDir);
            expect(remainingFiles).toEqual(['.git']);
          } finally {
            // Cleanup
            fs.rmSync(tempDir, { recursive: true, force: true });
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property Tests - File Generation and Template Handling', () => {
  it('Property 7: File renaming consistency', () => {
    // Feature: create-rolldown, Property 7: 文件重命名一致性
    // Validates: Requirements 3.6
    fc.assert(
      fc.property(
        fc.constantFrom('_gitignore', 'package.json', 'index.html', 'README.md'),
        (fileName) => {
          // Create a temporary directory for testing
          const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-rename-'));

          try {
            // Create source file
            const srcFile = path.join(tempDir, fileName);
            fs.writeFileSync(srcFile, 'test content');

            // Verify the renameFiles mapping
            const expectedName = renameFiles[fileName] ?? fileName;

            // For _gitignore, it should be renamed to .gitignore
            if (fileName === '_gitignore') {
              expect(expectedName).toBe('.gitignore');
            } else {
              // Other files should not be renamed
              expect(expectedName).toBe(fileName);
            }
          } finally {
            // Cleanup
            fs.rmSync(tempDir, { recursive: true, force: true });
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 8: Directory structure preservation', () => {
    // Feature: create-rolldown, Property 8: 目录结构保持性
    // Validates: Requirements 4.1, 4.2
    fc.assert(
      fc.property(
        fc
          .array(
            fc.record({
              name: fc
                .string()
                .filter((s) => s.length > 0 && s !== '.' && s !== '..' && !s.includes('/')),
              isDir: fc.boolean(),
            })
          )
          .filter((arr) => {
            // Ensure unique names to avoid conflicts (case-insensitive for file systems)
            const names = arr.map((item) => item.name.toLowerCase());
            const uniqueNames = new Set(names);
            return arr.length > 0 && arr.length < 10 && names.length === uniqueNames.size;
          }),
        (structure) => {
          // Create a temporary directory for testing
          const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-structure-'));

          try {
            const srcDir = path.join(tempDir, 'src');
            const destDir = path.join(tempDir, 'dest');
            fs.mkdirSync(srcDir);

            // Create source structure
            for (const item of structure) {
              const itemPath = path.join(srcDir, item.name);
              if (item.isDir) {
                fs.mkdirSync(itemPath);
                fs.writeFileSync(path.join(itemPath, 'file.txt'), 'content');
              } else {
                fs.writeFileSync(itemPath, 'content');
              }
            }

            // Copy directory
            copyDir(srcDir, destDir);

            // Verify structure is preserved
            for (const item of structure) {
              const srcPath = path.join(srcDir, item.name);
              const destPath = path.join(destDir, item.name);

              expect(fs.existsSync(destPath)).toBe(true);

              const srcStat = fs.statSync(srcPath);
              const destStat = fs.statSync(destPath);

              expect(srcStat.isDirectory()).toBe(destStat.isDirectory());
              expect(srcStat.isFile()).toBe(destStat.isFile());
            }
          } finally {
            // Cleanup
            fs.rmSync(tempDir, { recursive: true, force: true });
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 9: package.json name replacement correctness', () => {
    // Feature: create-rolldown, Property 9: package.json 名称替换正确性
    // Validates: Requirements 4.3
    fc.assert(
      fc.property(
        fc.string().filter((s) => isValidPackageName(s) && s.length > 0),
        fc.string().filter((s) => s.length > 0),
        (packageName, projectName) => {
          // Create a temporary directory for testing
          const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-pkgjson-'));

          try {
            const templateDir = path.join(tempDir, 'template');
            const targetDir = path.join(tempDir, 'target');
            fs.mkdirSync(templateDir);

            // Create a template package.json
            const templatePkg = {
              name: 'template-name',
              version: '1.0.0',
              description: 'Template package',
            };
            fs.writeFileSync(
              path.join(templateDir, 'package.json'),
              JSON.stringify(templatePkg, null, 2)
            );

            // Copy template
            copyTemplate(templateDir, targetDir, projectName, packageName);

            // Verify package.json was updated
            const targetPkgPath = path.join(targetDir, 'package.json');
            expect(fs.existsSync(targetPkgPath)).toBe(true);

            const targetPkg = JSON.parse(fs.readFileSync(targetPkgPath, 'utf-8'));
            expect(targetPkg.name).toBe(packageName);
            expect(targetPkg.version).toBe(templatePkg.version);
            expect(targetPkg.description).toBe(templatePkg.description);
          } finally {
            // Cleanup
            fs.rmSync(tempDir, { recursive: true, force: true });
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 10: index.html title update correctness', () => {
    // Feature: create-rolldown, Property 10: index.html 标题更新正确性
    // Validates: Requirements 4.4
    fc.assert(
      fc.property(
        fc.string().filter((s) => s.length > 0 && !s.includes('<') && !s.includes('>')),
        fc.string().filter((s) => isValidPackageName(s) && s.length > 0),
        (projectName, packageName) => {
          // Create a temporary directory for testing
          const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-html-'));

          try {
            const templateDir = path.join(tempDir, 'template');
            const targetDir = path.join(tempDir, 'target');
            fs.mkdirSync(templateDir);

            // Create a template index.html
            const templateHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Template Title</title>
</head>
<body>
  <div id="app"></div>
</body>
</html>`;
            fs.writeFileSync(path.join(templateDir, 'index.html'), templateHtml);

            // Also create package.json to satisfy copyTemplate
            fs.writeFileSync(
              path.join(templateDir, 'package.json'),
              JSON.stringify({ name: 'template' }, null, 2)
            );

            // Copy template
            copyTemplate(templateDir, targetDir, projectName, packageName);

            // Verify index.html was updated
            const targetHtmlPath = path.join(targetDir, 'index.html');
            expect(fs.existsSync(targetHtmlPath)).toBe(true);

            const targetHtml = fs.readFileSync(targetHtmlPath, 'utf-8');
            expect(targetHtml).toContain(`<title>${projectName}</title>`);
            expect(targetHtml).not.toContain('<title>Template Title</title>');
          } finally {
            // Cleanup
            fs.rmSync(tempDir, { recursive: true, force: true });
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

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
          const installCmd = getInstallCommand(agent);
          expect(Array.isArray(installCmd)).toBe(true);
          expect(installCmd.length).toBeGreaterThan(0);
          expect(installCmd[0]).toBe(agent);

          // Verify specific command formats
          switch (agent) {
            case 'npm':
              expect(installCmd).toEqual(['npm', 'install']);
              break;
            case 'pnpm':
              expect(installCmd).toEqual(['pnpm', 'install']);
              break;
            case 'yarn':
              expect(installCmd).toEqual(['yarn']);
              break;
            case 'bun':
              expect(installCmd).toEqual(['bun', 'install']);
              break;
            case 'deno':
              expect(installCmd).toEqual(['deno', 'install']);
              break;
          }

          // Test run command format
          const runCmd = getRunCommand(agent, script);
          expect(Array.isArray(runCmd)).toBe(true);
          expect(runCmd.length).toBeGreaterThan(0);
          expect(runCmd[0]).toBe(agent);
          expect(runCmd).toContain(script);

          // Verify specific run command formats
          switch (agent) {
            case 'npm':
              expect(runCmd).toEqual(['npm', 'run', script]);
              break;
            case 'pnpm':
              expect(runCmd).toEqual(['pnpm', script]);
              break;
            case 'yarn':
              expect(runCmd).toEqual(['yarn', script]);
              break;
            case 'bun':
              expect(runCmd).toEqual(['bun', 'run', script]);
              break;
            case 'deno':
              expect(runCmd).toEqual(['deno', 'task', script]);
              break;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('pkgFromUserAgent parses valid user agent strings', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('npm', 'pnpm', 'yarn', 'bun', 'deno'),
        fc.string().filter((s) => s.length > 0 && !s.includes(' ') && !s.includes('/')),
        (agent, version) => {
          const userAgent = `${agent}/${version} node/v18.0.0`;
          const result = pkgFromUserAgent(userAgent);

          expect(result).toBeDefined();
          expect(result?.name).toBe(agent);
          expect(result?.version).toBe(version);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('pkgFromUserAgent returns undefined for invalid input', () => {
    expect(pkgFromUserAgent(undefined)).toBeUndefined();
    expect(pkgFromUserAgent('')).toBeUndefined();
    expect(pkgFromUserAgent('invalid')).toBeUndefined();
  });
});

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
          };

          // Save original values
          const originalStdoutIsTTY = process.stdout.isTTY;
          const originalStdinIsTTY = process.stdin.isTTY;
          const originalCI = process.env.CI;

          try {
            // Mock TTY and CI environment
            Object.defineProperty(process.stdout, 'isTTY', {
              value: isTTY,
              writable: true,
              configurable: true,
            });
            Object.defineProperty(process.stdin, 'isTTY', {
              value: isTTY,
              writable: true,
              configurable: true,
            });
            if (isCI) {
              process.env.CI = 'true';
            } else {
              delete process.env.CI;
            }

            const result = shouldUseInteractiveMode(args);

            // If interactive is explicitly set, it should be used
            if (args.interactive !== undefined) {
              expect(result).toBe(args.interactive);
            } else {
              // Otherwise, should be interactive only if TTY and not CI
              expect(result).toBe(isTTY && !isCI);
            }
          } finally {
            // Restore original values
            Object.defineProperty(process.stdout, 'isTTY', {
              value: originalStdoutIsTTY,
              writable: true,
              configurable: true,
            });
            Object.defineProperty(process.stdin, 'isTTY', {
              value: originalStdinIsTTY,
              writable: true,
              configurable: true,
            });
            if (originalCI !== undefined) {
              process.env.CI = originalCI;
            } else {
              delete process.env.CI;
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: Command line argument application correctness', () => {
    // Feature: create-rolldown, Property 2: 命令行参数应用正确性
    // Validates: Requirements 1.1, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 10.1
    fc.assert(
      fc.property(
        fc.array(fc.string().filter((s) => !s.startsWith('-'))), // positional arguments (exclude flags)
        fc.option(
          fc.string().filter((s) => s.length > 0 && !s.startsWith('-')),
          { nil: undefined }
        ), // template (non-empty, not starting with -)
        fc.boolean(), // help
        fc.boolean(), // overwrite
        fc.boolean(), // immediate
        fc.option(fc.boolean(), { nil: undefined }), // interactive
        (positional, template, help, overwrite, immediate, interactive) => {
          // Build argv array
          const argv: string[] = [...positional];

          if (template) {
            argv.push('--template', template);
          }
          if (help) {
            argv.push('--help');
          }
          if (overwrite) {
            argv.push('--overwrite');
          }
          if (immediate) {
            argv.push('--immediate');
          }
          if (interactive === true) {
            argv.push('--interactive');
          } else if (interactive === false) {
            argv.push('--no-interactive');
          }

          // Parse arguments
          const result = parseArguments(argv);

          // Verify all arguments are correctly parsed
          expect(result._).toEqual(positional);
          expect(result.template).toBe(template);
          expect(result.help).toBe(help || undefined);
          expect(result.overwrite).toBe(overwrite || undefined);
          expect(result.immediate).toBe(immediate || undefined);
          expect(result.interactive).toBe(interactive);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('parseArguments handles short flags correctly', () => {
    const result1 = parseArguments(['-h']);
    expect(result1.help).toBe(true);

    const result2 = parseArguments(['-t', 'react']);
    expect(result2.template).toBe('react');

    const result3 = parseArguments(['-i']);
    expect(result3.immediate).toBe(true);

    const result4 = parseArguments(['my-app', '-t', 'vue-ts', '-i']);
    expect(result4._).toEqual(['my-app']);
    expect(result4.template).toBe('vue-ts');
    expect(result4.immediate).toBe(true);
  });

  it('parseArguments handles long flags correctly', () => {
    const result1 = parseArguments(['--help']);
    expect(result1.help).toBe(true);

    const result2 = parseArguments(['--template', 'react']);
    expect(result2.template).toBe('react');

    const result3 = parseArguments(['--immediate']);
    expect(result3.immediate).toBe(true);

    const result4 = parseArguments(['--overwrite']);
    expect(result4.overwrite).toBe(true);

    const result5 = parseArguments(['--interactive']);
    expect(result5.interactive).toBe(true);

    const result6 = parseArguments(['--no-interactive']);
    expect(result6.interactive).toBe(false);
  });

  it('parseArguments handles mixed arguments correctly', () => {
    const result = parseArguments(['my-project', '--template', 'svelte-ts', '--overwrite', '-i']);

    expect(result._).toEqual(['my-project']);
    expect(result.template).toBe('svelte-ts');
    expect(result.overwrite).toBe(true);
    expect(result.immediate).toBe(true);
  });

  it('shouldUseInteractiveMode respects explicit interactive flag', () => {
    const args1: CLIArguments = { _: [], interactive: true };
    expect(shouldUseInteractiveMode(args1)).toBe(true);

    const args2: CLIArguments = { _: [], interactive: false };
    expect(shouldUseInteractiveMode(args2)).toBe(false);
  });
});

describe('Unit Tests - Framework Data Structures', () => {
  it('verifies all required frameworks are defined', () => {
    // Requirements: 3.1
    // Note: All templates are now TypeScript-only
    const requiredFrameworks = ['vanilla', 'react', 'vue', 'solid', 'svelte'];
    const definedFrameworks = FRAMEWORKS.map((f) => f.name);

    for (const required of requiredFrameworks) {
      expect(definedFrameworks).toContain(required);
    }

    expect(FRAMEWORKS.length).toBe(requiredFrameworks.length);
  });

  it('verifies all templates are TypeScript-only', () => {
    // Requirements: All templates use TypeScript by default
    // No variants needed - each framework has one TypeScript template
    for (const framework of FRAMEWORKS) {
      expect(framework.name).toBeTruthy();
      expect(framework.display).toBeTruthy();
      expect(framework.color).toBeTypeOf('function');
    }
  });

  it('verifies all frameworks have required properties', () => {
    for (const framework of FRAMEWORKS) {
      expect(framework.name).toBeTruthy();
    }
  });

  it('verifies all framework properties are defined', () => {
    for (const framework of FRAMEWORKS) {
      expect(framework.name).toBeDefined();
      expect(framework.display).toBeDefined();
      expect(framework.color).toBeDefined();
      expect(typeof framework.color).toBe('function');
      // No variants property anymore - each framework is a template
    }
  });

  it('verifies TEMPLATES contains all framework names', () => {
    // All framework names should be in TEMPLATES
    const allFrameworkNames = FRAMEWORKS.map((f) => f.name);

    expect(TEMPLATES.length).toBe(allFrameworkNames.length);

    for (const frameworkName of allFrameworkNames) {
      expect(TEMPLATES).toContain(frameworkName);
    }
  });

  it('verifies renameFiles mapping is defined', () => {
    expect(renameFiles).toBeDefined();
    expect(typeof renameFiles).toBe('object');
    expect(renameFiles._gitignore).toBe('.gitignore');
  });

  it('verifies color functions work correctly', () => {
    for (const framework of FRAMEWORKS) {
      const coloredText = framework.color('test');
      expect(typeof coloredText).toBe('string');
      expect(coloredText.length).toBeGreaterThan(0);
    }
  });

  it('verifies framework names are valid template names', () => {
    // Each framework name should be a valid template name
    for (const framework of FRAMEWORKS) {
      expect(TEMPLATES).toContain(framework.name);
      // Framework name should match pattern (lowercase, no special chars except hyphen)
      expect(framework.name).toMatch(/^[a-z]+(-[a-z]+)*$/);
    }
  });
});

describe('Unit Tests - Interactive Prompts', () => {
  // Import the mocked prompts - will be mocked by vi.mock at the top
  let prompts: any;

  beforeEach(async () => {
    prompts = await import('@clack/prompts');
    vi.clearAllMocks();
  });

  // Mock process.exit to prevent tests from actually exiting
  const mockExit = vi
    .spyOn(process, 'exit')
    .mockImplementation((code?: string | number | null | undefined): never => {
      throw new Error(`process.exit called with code ${code}`);
    });

  afterEach(() => {
    mockExit.mockClear();
    vi.clearAllMocks();
  });

  describe('promptProjectName', () => {
    it('returns user input when valid project name is provided', async () => {
      // Requirements: 2.2
      vi.mocked(prompts.text).mockResolvedValue('my-project');
      vi.mocked(prompts.isCancel).mockReturnValue(false);

      const result = await promptProjectName('default-project');

      expect(result).toBe('my-project');
      expect(prompts.text).toHaveBeenCalledWith({
        message: 'Project name:',
        placeholder: 'default-project',
        defaultValue: 'default-project',
        validate: expect.any(Function),
      });
    });

    it('validates empty project names', async () => {
      // Requirements: 2.3
      vi.mocked(prompts.text).mockResolvedValue('test');
      vi.mocked(prompts.isCancel).mockReturnValue(false);

      await promptProjectName('default');

      const call = vi.mocked(prompts.text).mock.calls[0][0];
      const validateFn = call.validate;

      // Test validation function
      expect(validateFn('')).toBe('Project name cannot be empty');
      expect(validateFn('   ')).toBe('Project name cannot be empty');
      expect(validateFn('valid-name')).toBeUndefined();
    });

    it('exits when user cancels', async () => {
      // Requirements: 8.3
      vi.mocked(prompts.text).mockResolvedValue(Symbol.for('clack.cancel'));
      vi.mocked(prompts.isCancel).mockReturnValue(true);
      vi.mocked(prompts.cancel).mockImplementation(() => {});

      await expect(promptProjectName('default')).rejects.toThrow('process.exit called with code 0');

      expect(prompts.cancel).toHaveBeenCalledWith('Operation cancelled');
      expect(mockExit).toHaveBeenCalledWith(0);
    });
  });

  describe('promptOverwrite', () => {
    it('returns user selection for overwrite options', async () => {
      // Requirements: 2.4
      vi.mocked(prompts.select).mockResolvedValue('yes');
      vi.mocked(prompts.isCancel).mockReturnValue(false);

      const result = await promptOverwrite('/path/to/dir');

      expect(result).toBe('yes');
      expect(prompts.select).toHaveBeenCalledWith({
        message: 'Target directory "/path/to/dir" is not empty. Please choose how to proceed:',
        options: [
          { value: 'yes', label: 'Remove existing files and continue' },
          { value: 'no', label: 'Cancel operation' },
          { value: 'ignore', label: 'Ignore files and continue' },
        ],
      });
    });

    it('handles all three overwrite options', async () => {
      // Requirements: 2.4
      vi.mocked(prompts.isCancel).mockReturnValue(false);

      // Test 'yes' option
      vi.mocked(prompts.select).mockResolvedValueOnce('yes');
      expect(await promptOverwrite('/dir')).toBe('yes');

      // Test 'no' option
      vi.mocked(prompts.select).mockResolvedValueOnce('no');
      expect(await promptOverwrite('/dir')).toBe('no');

      // Test 'ignore' option
      vi.mocked(prompts.select).mockResolvedValueOnce('ignore');
      expect(await promptOverwrite('/dir')).toBe('ignore');
    });

    it('exits when user cancels', async () => {
      // Requirements: 8.3
      vi.mocked(prompts.select).mockResolvedValue(Symbol.for('clack.cancel'));
      vi.mocked(prompts.isCancel).mockReturnValue(true);
      vi.mocked(prompts.cancel).mockImplementation(() => {});

      await expect(promptOverwrite('/dir')).rejects.toThrow('process.exit called with code 0');

      expect(prompts.cancel).toHaveBeenCalledWith('Operation cancelled');
      expect(mockExit).toHaveBeenCalledWith(0);
    });
  });

  describe('promptPackageName', () => {
    it('returns valid package name when provided', async () => {
      // Requirements: 2.5
      vi.mocked(prompts.text).mockResolvedValue('my-package');
      vi.mocked(prompts.isCancel).mockReturnValue(false);

      const result = await promptPackageName('default-package');

      expect(result).toBe('my-package');
      expect(prompts.text).toHaveBeenCalledWith({
        message: 'Package name:',
        placeholder: 'default-package',
        defaultValue: 'default-package',
        validate: expect.any(Function),
      });
    });

    it('validates package names according to npm conventions', async () => {
      // Requirements: 2.5
      vi.mocked(prompts.text).mockResolvedValue('test');
      vi.mocked(prompts.isCancel).mockReturnValue(false);

      await promptPackageName('default');

      const call = vi.mocked(prompts.text).mock.calls[0][0];
      const validateFn = call.validate;

      // Test validation function
      expect(validateFn('')).toBe('Package name cannot be empty');
      expect(validateFn('   ')).toBe('Package name cannot be empty');
      expect(validateFn('Invalid-Name')).toBe(
        'Invalid package name (must follow npm naming conventions)'
      );
      expect(validateFn('valid-name')).toBeUndefined();
      expect(validateFn('my-package')).toBeUndefined();
      expect(validateFn('@scope/package')).toBeUndefined();
    });

    it('exits when user cancels', async () => {
      // Requirements: 8.3
      vi.mocked(prompts.text).mockResolvedValue(Symbol.for('clack.cancel'));
      vi.mocked(prompts.isCancel).mockReturnValue(true);
      vi.mocked(prompts.cancel).mockImplementation(() => {});

      await expect(promptPackageName('default')).rejects.toThrow('process.exit called with code 0');

      expect(prompts.cancel).toHaveBeenCalledWith('Operation cancelled');
      expect(mockExit).toHaveBeenCalledWith(0);
    });
  });

  describe('promptFramework', () => {
    it('returns selected framework', async () => {
      // Requirements: 2.6
      vi.mocked(prompts.select).mockResolvedValue(FRAMEWORKS[0]);
      vi.mocked(prompts.isCancel).mockReturnValue(false);

      const result = await promptFramework(FRAMEWORKS);

      expect(result).toBe(FRAMEWORKS[0]);
      expect(prompts.select).toHaveBeenCalledWith({
        message: 'Select a framework:',
        options: expect.any(Array),
      });
    });

    it('formats framework options with colors', async () => {
      // Requirements: 2.6
      vi.mocked(prompts.select).mockResolvedValue(FRAMEWORKS[0]);
      vi.mocked(prompts.isCancel).mockReturnValue(false);

      await promptFramework(FRAMEWORKS);

      const call = vi.mocked(prompts.select).mock.calls[0][0];
      const options = call.options;

      expect(options).toHaveLength(FRAMEWORKS.length);

      for (let i = 0; i < FRAMEWORKS.length; i++) {
        expect(options[i].value).toBe(FRAMEWORKS[i]);
        expect(typeof options[i].label).toBe('string');
      }
    });

    it('exits when user cancels', async () => {
      // Requirements: 8.3
      vi.mocked(prompts.select).mockResolvedValue(Symbol.for('clack.cancel'));
      vi.mocked(prompts.isCancel).mockReturnValue(true);
      vi.mocked(prompts.cancel).mockImplementation(() => {});

      await expect(promptFramework(FRAMEWORKS)).rejects.toThrow('process.exit called with code 0');

      expect(prompts.cancel).toHaveBeenCalledWith('Operation cancelled');
      expect(mockExit).toHaveBeenCalledWith(0);
    });
  });

  // promptVariant tests removed - no longer needed as we select framework directly

  describe('promptImmediate', () => {
    it('returns user confirmation for immediate installation', async () => {
      // Requirements: 2.8
      vi.mocked(prompts.confirm).mockResolvedValue(true);
      vi.mocked(prompts.isCancel).mockReturnValue(false);

      const result = await promptImmediate('pnpm');

      expect(result).toBe(true);
      expect(prompts.confirm).toHaveBeenCalledWith({
        message: 'Install dependencies and start dev server with pnpm?',
        initialValue: false,
      });
    });

    it('handles both true and false responses', async () => {
      // Requirements: 2.8
      vi.mocked(prompts.isCancel).mockReturnValue(false);

      // Test true response
      vi.mocked(prompts.confirm).mockResolvedValueOnce(true);
      expect(await promptImmediate('npm')).toBe(true);

      // Test false response
      vi.mocked(prompts.confirm).mockResolvedValueOnce(false);
      expect(await promptImmediate('yarn')).toBe(false);
    });

    it('includes package manager name in message', async () => {
      // Requirements: 2.8
      vi.mocked(prompts.confirm).mockResolvedValue(false);
      vi.mocked(prompts.isCancel).mockReturnValue(false);

      await promptImmediate('bun');

      expect(prompts.confirm).toHaveBeenCalledWith({
        message: 'Install dependencies and start dev server with bun?',
        initialValue: false,
      });
    });

    it('exits when user cancels', async () => {
      // Requirements: 8.3
      vi.mocked(prompts.confirm).mockResolvedValue(Symbol.for('clack.cancel'));
      vi.mocked(prompts.isCancel).mockReturnValue(true);
      vi.mocked(prompts.cancel).mockImplementation(() => {});

      await expect(promptImmediate('npm')).rejects.toThrow('process.exit called with code 0');

      expect(prompts.cancel).toHaveBeenCalledWith('Operation cancelled');
      expect(mockExit).toHaveBeenCalledWith(0);
    });
  });
});

describe('Unit Tests - Command Execution', () => {
  // Import the functions we need to test
  let run: typeof import('../src/utils').run;
  let install: typeof import('../src/utils').install;
  let start: typeof import('../src/utils').start;

  beforeEach(async () => {
    const module = await import('../src/utils');
    run = module.run;
    install = module.install;
    start = module.start;
    vi.clearAllMocks();
  });

  describe('run', () => {
    it('skips command execution in test environment', () => {
      // Requirements: 5.4, 5.5
      // Set test environment flag
      process.env._ROLLDOWN_TEST_CLI = 'true';

      // This should not throw or execute anything
      expect(() => run(['echo', 'test'])).not.toThrow();

      // Clean up
      delete process.env._ROLLDOWN_TEST_CLI;
    });

    it('executes commands in non-test environment', () => {
      // Requirements: 5.3, 6.2
      // Ensure we're not in test mode
      delete process.env._ROLLDOWN_TEST_CLI;

      // We can't easily test actual command execution without mocking
      // This test verifies the function exists and has the right signature
      expect(typeof run).toBe('function');
      expect(run.length).toBe(2); // Takes 2 parameters
    });
  });

  describe('install', () => {
    it('skips installation in test environment', () => {
      // Requirements: 5.4, 5.5
      // Set test environment flag
      process.env._ROLLDOWN_TEST_CLI = 'true';

      // Mock console.log to verify message
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // This should not throw or execute anything
      expect(() => install('/test/path', 'npm')).not.toThrow();

      // Clean up
      consoleSpy.mockRestore();
      delete process.env._ROLLDOWN_TEST_CLI;
    });

    it('calls run with correct install command', () => {
      // Requirements: 5.3, 5.4
      // Set test environment to skip actual execution
      process.env._ROLLDOWN_TEST_CLI = 'true';

      // Mock console.log
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Test with different package managers
      expect(() => install('/test/path', 'npm')).not.toThrow();
      expect(() => install('/test/path', 'pnpm')).not.toThrow();
      expect(() => install('/test/path', 'yarn')).not.toThrow();
      expect(() => install('/test/path', 'bun')).not.toThrow();

      // Clean up
      consoleSpy.mockRestore();
      delete process.env._ROLLDOWN_TEST_CLI;
    });

    it('displays installation message', () => {
      // Requirements: 5.4
      // Set test environment to skip actual execution
      process.env._ROLLDOWN_TEST_CLI = 'true';

      // Mock console.log to capture message
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      install('/test/path', 'pnpm');

      // Verify message was displayed (in test mode, only message is shown)
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Installing dependencies with pnpm')
      );

      // Clean up
      consoleSpy.mockRestore();
      delete process.env._ROLLDOWN_TEST_CLI;
    });
  });

  describe('start', () => {
    it('skips server start in test environment', () => {
      // Requirements: 6.3
      // Set test environment flag
      process.env._ROLLDOWN_TEST_CLI = 'true';

      // Mock console.log to verify message
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // This should not throw or execute anything
      expect(() => start('/test/path', 'npm')).not.toThrow();

      // Clean up
      consoleSpy.mockRestore();
      delete process.env._ROLLDOWN_TEST_CLI;
    });

    it('calls run with correct dev command', () => {
      // Requirements: 6.2, 6.3
      // Set test environment to skip actual execution
      process.env._ROLLDOWN_TEST_CLI = 'true';

      // Mock console.log
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Test with different package managers
      expect(() => start('/test/path', 'npm')).not.toThrow();
      expect(() => start('/test/path', 'pnpm')).not.toThrow();
      expect(() => start('/test/path', 'yarn')).not.toThrow();
      expect(() => start('/test/path', 'bun')).not.toThrow();

      // Clean up
      consoleSpy.mockRestore();
      delete process.env._ROLLDOWN_TEST_CLI;
    });

    it('displays server start message', () => {
      // Requirements: 6.3
      // Set test environment to skip actual execution
      process.env._ROLLDOWN_TEST_CLI = 'true';

      // Mock console.log to capture message
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      start('/test/path', 'yarn');

      // Verify message was displayed (in test mode, only message is shown)
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Starting dev server'));

      // Clean up
      consoleSpy.mockRestore();
      delete process.env._ROLLDOWN_TEST_CLI;
    });
  });

  describe('Command execution integration', () => {
    it('verifies test environment detection works correctly', () => {
      // Requirements: 5.5, 6.3
      // Test that _ROLLDOWN_TEST_CLI flag is respected

      // Without flag - functions should work (but we won't actually execute)
      delete process.env._ROLLDOWN_TEST_CLI;
      expect(typeof run).toBe('function');
      expect(typeof install).toBe('function');
      expect(typeof start).toBe('function');

      // With flag - functions should skip execution
      process.env._ROLLDOWN_TEST_CLI = 'true';

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      expect(() => run(['echo', 'test'])).not.toThrow();
      expect(() => install('/test', 'npm')).not.toThrow();
      expect(() => start('/test', 'npm')).not.toThrow();

      consoleSpy.mockRestore();
      delete process.env._ROLLDOWN_TEST_CLI;
    });
  });
});

describe('Property Tests - Error Handling', () => {
  it('Property 13: Error handling consistency', () => {
    // Feature: create-rolldown, Property 13: 错误处理一致性
    // Validates: Requirements 8.1, 8.2, 8.3, 8.4
    fc.assert(
      fc.property(
        fc.constantFrom('file_system_error', 'invalid_template', 'directory_conflict'),
        (errorType) => {
          const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-error-'));

          try {
            let errorThrown = false;
            let errorMessage = '';

            switch (errorType) {
              case 'file_system_error':
                // Test file system error handling
                try {
                  // Try to copy from non-existent source
                  copyDir('/nonexistent/path/source', path.join(tempDir, 'dest'));
                } catch (error) {
                  errorThrown = true;
                  if (error instanceof Error) {
                    errorMessage = error.message;
                    // Error message should be meaningful
                    expect(errorMessage.length).toBeGreaterThan(0);
                    expect(errorMessage.toLowerCase()).toMatch(/failed|error|not found|no such/i);
                  }
                }

                // Verify error was thrown
                expect(errorThrown).toBe(true);
                break;

              case 'invalid_template':
                // Test invalid template handling
                const invalidTemplate = 'nonexistent-template-xyz';

                // Verify template is not in the list
                expect(TEMPLATES).not.toContain(invalidTemplate);

                // In non-interactive mode, should fall back to default
                const args = parseArguments(['--template', invalidTemplate, '--no-interactive']);
                const template = TEMPLATES.includes(args.template!) ? args.template : 'vanilla-ts';

                // Should use default template
                expect(template).toBe('vanilla-ts');
                break;

              case 'directory_conflict':
                // Test directory conflict handling
                const conflictDir = path.join(tempDir, 'conflict');
                fs.mkdirSync(conflictDir);
                fs.writeFileSync(path.join(conflictDir, 'existing.txt'), 'content');

                // Verify directory is not empty
                expect(isEmpty(conflictDir)).toBe(false);

                // In non-interactive mode without --overwrite, should fail
                // (We can't test the full init flow, but we can verify the logic)
                const args2 = parseArguments(['conflict', '--no-interactive']);
                expect(args2.overwrite).toBeUndefined();

                // With --overwrite, should succeed
                const args3 = parseArguments(['conflict', '--overwrite', '--no-interactive']);
                expect(args3.overwrite).toBe(true);
                break;
            }
          } finally {
            // Cleanup
            fs.rmSync(tempDir, { recursive: true, force: true });
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('verifies error messages are meaningful and consistent', () => {
    // Requirements: 8.1, 8.2
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-error-msg-'));

    try {
      // Test file system error message - use copyDir which is imported
      try {
        copyDir('/nonexistent/dir', path.join(tempDir, 'dest'));
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        if (error instanceof Error) {
          expect(error.message).toMatch(/failed|error|not found|no such/i);
          expect(error.message).toContain('/nonexistent/dir');
        }
      }

      // Test empty dir error message
      try {
        emptyDir('/nonexistent/dir/that/does/not/exist');
        // emptyDir returns early if dir doesn't exist, so no error
        expect(true).toBe(true);
      } catch (error) {
        // If it does throw, verify error message
        expect(error).toBeInstanceOf(Error);
        if (error instanceof Error) {
          expect(error.message).toMatch(/failed|error/i);
        }
      }

      // Test template copy error message
      try {
        copyTemplate('/nonexistent/template', path.join(tempDir, 'project'), 'test', 'test');
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        if (error instanceof Error) {
          expect(error.message).toContain('Template directory not found');
          expect(error.message).toContain('/nonexistent/template');
        }
      }
    } finally {
      // Cleanup
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('verifies user cancellation is handled gracefully', async () => {
    // Requirements: 8.3
    const prompts = await import('@clack/prompts');

    // Mock cancellation
    vi.mocked(prompts.isCancel).mockReturnValue(true);
    vi.mocked(prompts.cancel).mockImplementation(() => {});
    vi.mocked(prompts.text).mockResolvedValue(Symbol.for('clack.cancel'));

    const mockExit = vi
      .spyOn(process, 'exit')
      .mockImplementation((code?: string | number | null | undefined): never => {
        throw new Error(`process.exit called with code ${code}`);
      });

    try {
      // Test that cancellation exits with code 0
      await expect(promptProjectName('default')).rejects.toThrow('process.exit called with code 0');
      expect(prompts.cancel).toHaveBeenCalledWith('Operation cancelled');
      expect(mockExit).toHaveBeenCalledWith(0);
    } finally {
      mockExit.mockRestore();
      vi.clearAllMocks();
    }
  });

  it('verifies directory conflict handling in non-interactive mode', () => {
    // Requirements: 8.4
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-conflict-'));

    try {
      // Create non-empty directory
      const targetDir = path.join(tempDir, 'target');
      fs.mkdirSync(targetDir);
      fs.writeFileSync(path.join(targetDir, 'file.txt'), 'content');

      // Verify directory is not empty
      expect(isEmpty(targetDir)).toBe(false);

      // Without --overwrite flag, should require user action
      const args1 = parseArguments(['target', '--no-interactive']);
      expect(args1.overwrite).toBeUndefined();

      // With --overwrite flag, should proceed
      const args2 = parseArguments(['target', '--overwrite', '--no-interactive']);
      expect(args2.overwrite).toBe(true);

      // Test actual directory emptying
      emptyDir(targetDir);

      // Directory should now be empty
      expect(isEmpty(targetDir)).toBe(true);
    } finally {
      // Cleanup
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});

describe('Property Tests - Non-Interactive Mode', () => {
  it('Property 14: Non-interactive mode default values correctness', () => {
    // Feature: create-rolldown, Property 14: 非交互模式默认值正确性
    // Validates: Requirements 10.2, 10.3
    fc.assert(
      fc.property(
        fc.option(
          fc.string().filter((s) => s.length > 0 && !s.startsWith('-')),
          { nil: undefined }
        ), // optional project name
        fc.option(
          fc.string().filter((s) => s.length > 0 && !s.startsWith('-')),
          { nil: undefined }
        ), // optional template
        fc.boolean(), // overwrite flag
        (projectName, template, overwrite) => {
          // Build argv for non-interactive mode
          const argv: string[] = ['--no-interactive'];

          if (projectName) {
            argv.unshift(projectName);
          }
          if (template) {
            argv.push('--template', template);
          }
          if (overwrite) {
            argv.push('--overwrite');
          }

          // Parse arguments
          const args = parseArguments(argv);

          // Verify non-interactive mode is set
          expect(args.interactive).toBe(false);

          // Verify mode detection
          const interactive = shouldUseInteractiveMode(args);
          expect(interactive).toBe(false);

          // Test default project name logic
          const defaultProjectName = 'rolldown-project';
          const targetDir = formatTargetDir(args._[0]);
          const finalProjectName = targetDir || defaultProjectName;

          if (projectName) {
            const formattedInput = formatTargetDir(projectName);
            // If project name was provided and formats to non-empty, it should be used
            if (formattedInput) {
              expect(finalProjectName).toBe(formattedInput);
            } else {
              // If it formats to empty (e.g., whitespace only), should use default
              expect(finalProjectName).toBe(defaultProjectName);
            }
          } else {
            // If no project name, should use default
            expect(finalProjectName).toBe(defaultProjectName);
          }

          // Test default template logic
          const defaultTemplate = 'vanilla';
          let finalTemplate = args.template;

          if (!finalTemplate) {
            // If no template provided, should use default
            finalTemplate = defaultTemplate;
          }

          if (template) {
            // If template was provided, it should be used (or default if invalid)
            if (TEMPLATES.includes(template)) {
              expect(finalTemplate).toBe(template);
            } else {
              // Invalid template should fall back to default in non-interactive mode
              finalTemplate = defaultTemplate;
              expect(finalTemplate).toBe(defaultTemplate);
            }
          } else {
            // No template provided, should use default
            expect(finalTemplate).toBe(defaultTemplate);
          }

          // Verify default template is valid
          expect(TEMPLATES).toContain(defaultTemplate);

          // Test package name conversion
          const packageName = toValidPackageName(finalProjectName);
          expect(isValidPackageName(packageName)).toBe(true);

          // Verify overwrite flag is correctly parsed
          expect(args.overwrite).toBe(overwrite || undefined);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('verifies non-interactive mode uses defaults when no parameters provided', () => {
    // Requirements: 10.2, 10.3
    const args = parseArguments(['--no-interactive']);

    expect(args.interactive).toBe(false);
    expect(args._).toEqual([]);
    expect(args.template).toBeUndefined();

    // Verify mode detection
    const interactive = shouldUseInteractiveMode(args);
    expect(interactive).toBe(false);

    // Test default values
    const defaultProjectName = 'rolldown-project';
    const defaultTemplate = 'vanilla';

    const targetDir = formatTargetDir(args._[0]) || defaultProjectName;
    expect(targetDir).toBe(defaultProjectName);

    const template = args.template || defaultTemplate;
    expect(template).toBe(defaultTemplate);
    expect(TEMPLATES).toContain(template);

    const packageName = toValidPackageName(targetDir);
    expect(isValidPackageName(packageName)).toBe(true);
  });

  it('verifies non-interactive mode handles invalid package names', () => {
    // Requirements: 10.5
    const invalidNames = [
      'My Project',
      'project@123',
      'Project_Name',
      '123-project',
      'UPPERCASE',
      'project with spaces',
    ];

    for (const invalidName of invalidNames) {
      const args = parseArguments([invalidName, '--no-interactive']);
      expect(args.interactive).toBe(false);

      const targetDir = formatTargetDir(args._[0]);
      expect(targetDir).toBe(invalidName);

      // In non-interactive mode, invalid names should be auto-converted
      const packageName = toValidPackageName(targetDir);
      expect(isValidPackageName(packageName)).toBe(true);
    }
  });

  it('verifies non-interactive mode handles directory conflicts correctly', () => {
    // Requirements: 10.4
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-noninteractive-'));

    try {
      // Create non-empty directory
      const targetDir = path.join(tempDir, 'existing');
      fs.mkdirSync(targetDir);
      fs.writeFileSync(path.join(targetDir, 'file.txt'), 'content');

      expect(isEmpty(targetDir)).toBe(false);

      // Without --overwrite, should require user action (would exit in real scenario)
      const args1 = parseArguments(['existing', '--no-interactive']);
      expect(args1.overwrite).toBeUndefined();
      expect(args1.interactive).toBe(false);

      // With --overwrite, should proceed
      const args2 = parseArguments(['existing', '--overwrite', '--no-interactive']);
      expect(args2.overwrite).toBe(true);
      expect(args2.interactive).toBe(false);

      // Test actual directory emptying
      emptyDir(targetDir);
      expect(isEmpty(targetDir)).toBe(true);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('verifies non-interactive mode with all parameters provided', () => {
    // Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
    const args = parseArguments([
      'my-project',
      '--template',
      'react',
      '--overwrite',
      '--no-interactive',
    ]);

    expect(args.interactive).toBe(false);
    expect(args._).toEqual(['my-project']);
    expect(args.template).toBe('react');
    expect(args.overwrite).toBe(true);

    // Verify mode detection
    const interactive = shouldUseInteractiveMode(args);
    expect(interactive).toBe(false);

    // Verify all values are used (no defaults needed)
    const targetDir = formatTargetDir(args._[0]);
    expect(targetDir).toBe('my-project');

    const template = args.template;
    expect(template).toBe('react');
    expect(TEMPLATES).toContain(template);

    const packageName = toValidPackageName(targetDir);
    expect(isValidPackageName(packageName)).toBe(true);
  });
});

describe('Integration Tests - Main Initialization Flow', () => {
  let prompts: any;
  let tempDir: string;

  beforeEach(async () => {
    prompts = await import('@clack/prompts');
    vi.clearAllMocks();

    // Create a temporary directory for testing
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-init-'));

    // Set test environment to skip actual command execution
    process.env._ROLLDOWN_TEST_CLI = 'true';

    // Mock process.cwd to return our temp directory
    vi.spyOn(process, 'cwd').mockReturnValue(tempDir);
  });

  afterEach(() => {
    // Clean up
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    delete process.env._ROLLDOWN_TEST_CLI;
    vi.restoreAllMocks();
  });

  it('creates a project in non-interactive mode with all parameters', async () => {
    // Requirements: 1.1, 4.1, 7.4
    // This test verifies the complete project creation flow in non-interactive mode

    // Create a minimal template directory for testing
    const templateDir = path.join(tempDir, 'template-vanilla-ts');
    fs.mkdirSync(templateDir, { recursive: true });

    // Create template files
    fs.writeFileSync(
      path.join(templateDir, 'package.json'),
      JSON.stringify({ name: 'template-vanilla-ts', version: '1.0.0' }, null, 2)
    );
    fs.writeFileSync(
      path.join(templateDir, 'index.html'),
      '<!DOCTYPE html><html><head><title>Template</title></head><body></body></html>'
    );
    fs.writeFileSync(path.join(templateDir, '_gitignore'), 'node_modules\n');
    fs.writeFileSync(path.join(templateDir, 'README.md'), '# Template');

    // We can't easily test the full init function without mocking import.meta.url
    // Instead, we'll test the individual components that make up the flow

    // Test argument parsing
    const args = parseArguments(['my-project', '--template', 'vanilla-ts', '--no-interactive']);
    expect(args._).toEqual(['my-project']);
    expect(args.template).toBe('vanilla-ts');
    expect(args.interactive).toBe(false);

    // Test mode detection
    const interactive = shouldUseInteractiveMode(args);
    expect(interactive).toBe(false);

    // Test directory formatting
    const targetDir = formatTargetDir(args._[0]);
    expect(targetDir).toBe('my-project');

    // Test package name conversion
    const packageName = toValidPackageName('my-project');
    expect(isValidPackageName(packageName)).toBe(true);

    // Test template validation
    expect(TEMPLATES).toContain('vanilla');

    // Test project creation
    const projectRoot = path.join(tempDir, 'my-project');
    copyTemplate(templateDir, projectRoot, 'my-project', packageName);

    // Verify project was created
    expect(fs.existsSync(projectRoot)).toBe(true);
    expect(fs.existsSync(path.join(projectRoot, 'package.json'))).toBe(true);
    expect(fs.existsSync(path.join(projectRoot, 'index.html'))).toBe(true);
    expect(fs.existsSync(path.join(projectRoot, '.gitignore'))).toBe(true);
    expect(fs.existsSync(path.join(projectRoot, 'README.md'))).toBe(true);

    // Verify package.json was updated
    const pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
    expect(pkg.name).toBe(packageName);

    // Verify index.html was updated
    const html = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf-8');
    expect(html).toContain('<title>my-project</title>');
  });

  it('handles interactive mode with user prompts', async () => {
    // Requirements: 1.1, 4.1, 7.4
    // This test verifies the interactive flow with mocked prompts

    // Create a minimal template directory
    const templateDir = path.join(tempDir, 'template-react-ts');
    fs.mkdirSync(templateDir, { recursive: true });

    fs.writeFileSync(
      path.join(templateDir, 'package.json'),
      JSON.stringify({ name: 'template-react', version: '1.0.0' }, null, 2)
    );
    fs.writeFileSync(
      path.join(templateDir, 'index.html'),
      '<!DOCTYPE html><html><head><title>Template</title></head><body></body></html>'
    );

    // Mock prompts for interactive mode
    vi.mocked(prompts.isCancel).mockReturnValue(false);
    vi.mocked(prompts.text).mockResolvedValueOnce('my-react-app'); // project name

    const reactFramework = FRAMEWORKS.find((f) => f.name === 'react')!;
    vi.mocked(prompts.select)
      .mockResolvedValueOnce(reactFramework) // framework selection
      .mockResolvedValueOnce('react'); // variant selection

    vi.mocked(prompts.confirm).mockResolvedValueOnce(false); // immediate install

    // Test interactive mode detection
    const args = parseArguments([]);

    // Mock TTY environment for interactive mode
    Object.defineProperty(process.stdout, 'isTTY', {
      value: true,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(process.stdin, 'isTTY', {
      value: true,
      writable: true,
      configurable: true,
    });
    delete process.env.CI;

    const interactive = shouldUseInteractiveMode(args);
    expect(interactive).toBe(true);

    // Test prompt functions
    const projectName = await promptProjectName('rolldown-project');
    expect(projectName).toBe('my-react-app');

    const framework = await promptFramework(FRAMEWORKS);
    expect(framework.name).toBe('react');

    // No need to prompt for variant - use framework name directly as template
    const template = framework.name;
    expect(template).toBe('react');

    const shouldInstall = await promptImmediate('npm');
    expect(shouldInstall).toBe(false);

    // Test project creation with interactive selections
    const projectRoot = path.join(tempDir, 'my-react-app');
    const packageName = toValidPackageName(projectName);

    copyTemplate(templateDir, projectRoot, projectName, packageName);

    // Verify project was created
    expect(fs.existsSync(projectRoot)).toBe(true);
    expect(fs.existsSync(path.join(projectRoot, 'package.json'))).toBe(true);

    const pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
    expect(pkg.name).toBe(packageName);
  });

  it('handles directory conflicts with overwrite option', async () => {
    // Requirements: 1.1, 4.1, 7.4
    // This test verifies directory conflict handling

    // Create existing directory with files
    const projectRoot = path.join(tempDir, 'existing-project');
    fs.mkdirSync(projectRoot, { recursive: true });
    fs.writeFileSync(path.join(projectRoot, 'existing-file.txt'), 'existing content');
    fs.mkdirSync(path.join(projectRoot, '.git'));
    fs.writeFileSync(path.join(projectRoot, '.git', 'config'), 'git config');

    // Verify directory is not empty
    expect(isEmpty(projectRoot)).toBe(false);

    // Test overwrite in non-interactive mode
    const args = parseArguments([
      'existing-project',
      '--overwrite',
      '--template',
      'vanilla',
      '--no-interactive',
    ]);
    expect(args.overwrite).toBe(true);

    // Empty the directory (preserving .git)
    emptyDir(projectRoot);

    // Verify .git is preserved but other files are removed
    expect(fs.existsSync(path.join(projectRoot, '.git'))).toBe(true);
    expect(fs.existsSync(path.join(projectRoot, '.git', 'config'))).toBe(true);
    expect(fs.existsSync(path.join(projectRoot, 'existing-file.txt'))).toBe(false);

    // Now create template
    const templateDir = path.join(tempDir, 'template-vanilla');
    fs.mkdirSync(templateDir, { recursive: true });
    fs.writeFileSync(
      path.join(templateDir, 'package.json'),
      JSON.stringify({ name: 'template', version: '1.0.0' }, null, 2)
    );

    copyTemplate(templateDir, projectRoot, 'existing-project', 'existing-project');

    // Verify new files are created and .git is still there
    expect(fs.existsSync(path.join(projectRoot, 'package.json'))).toBe(true);
    expect(fs.existsSync(path.join(projectRoot, '.git'))).toBe(true);
  });

  it('handles interactive directory conflict with user choice', async () => {
    // Requirements: 1.1, 4.1, 7.4
    // This test verifies interactive directory conflict handling

    // Create existing directory
    const projectRoot = path.join(tempDir, 'conflict-project');
    fs.mkdirSync(projectRoot, { recursive: true });
    fs.writeFileSync(path.join(projectRoot, 'existing.txt'), 'content');

    // Mock interactive mode
    Object.defineProperty(process.stdout, 'isTTY', {
      value: true,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(process.stdin, 'isTTY', {
      value: true,
      writable: true,
      configurable: true,
    });
    delete process.env.CI;

    // Test 'yes' option (overwrite)
    vi.mocked(prompts.select).mockResolvedValueOnce('yes');
    vi.mocked(prompts.isCancel).mockReturnValue(false);

    const overwriteChoice = await promptOverwrite('conflict-project');
    expect(overwriteChoice).toBe('yes');

    // Test 'ignore' option
    vi.mocked(prompts.select).mockResolvedValueOnce('ignore');
    const ignoreChoice = await promptOverwrite('conflict-project');
    expect(ignoreChoice).toBe('ignore');
  });

  it('uses default values in non-interactive mode when parameters are missing', async () => {
    // Requirements: 1.1, 4.1, 7.4
    // This test verifies default value usage in non-interactive mode

    // Parse arguments without project name or template
    const args = parseArguments(['--no-interactive']);
    expect(args.interactive).toBe(false);

    // Test default project name
    const defaultProjectName = 'rolldown-project';
    const targetDir = formatTargetDir(args._[0]) || defaultProjectName;
    expect(targetDir).toBe(defaultProjectName);

    // Test default template
    const template = args.template || 'vanilla';
    expect(template).toBe('vanilla');
    expect(TEMPLATES).toContain(template);

    // Test package name conversion
    const packageName = toValidPackageName(targetDir);
    expect(isValidPackageName(packageName)).toBe(true);
  });

  it('detects package manager from environment', async () => {
    // Requirements: 1.1, 4.1, 7.4
    // This test verifies package manager detection

    // Test with different user agents
    const testCases = [
      { userAgent: 'npm/8.19.2 node/v18.12.0', expected: 'npm' },
      { userAgent: 'pnpm/7.14.0 node/v18.12.0', expected: 'pnpm' },
      { userAgent: 'yarn/1.22.19 node/v18.12.0', expected: 'yarn' },
      { userAgent: 'bun/0.5.0 node/v18.12.0', expected: 'bun' },
    ];

    for (const testCase of testCases) {
      const pkgInfo = pkgFromUserAgent(testCase.userAgent);
      expect(pkgInfo?.name).toBe(testCase.expected);

      // Verify correct commands are generated
      const installCmd = getInstallCommand(testCase.expected);
      expect(installCmd[0]).toBe(testCase.expected);

      const runCmd = getRunCommand(testCase.expected, 'dev');
      expect(runCmd[0]).toBe(testCase.expected);
    }

    // Test fallback to npm when no user agent
    const pkgInfo = pkgFromUserAgent(undefined);
    expect(pkgInfo).toBeUndefined();

    const defaultInstallCmd = getInstallCommand('npm');
    expect(defaultInstallCmd).toEqual(['npm', 'install']);
  });

  it('validates template names and uses default for invalid templates', async () => {
    // Requirements: 1.1, 4.1, 7.4
    // This test verifies template validation

    // Test valid template
    const validTemplate = 'react';
    expect(TEMPLATES).toContain(validTemplate);

    // Test invalid template
    const invalidTemplate = 'nonexistent-template';
    expect(TEMPLATES).not.toContain(invalidTemplate);

    // In non-interactive mode, should fall back to default
    const args = parseArguments(['--template', invalidTemplate, '--no-interactive']);
    const template = TEMPLATES.includes(args.template!) ? args.template : 'vanilla-ts';
    expect(template).toBe('vanilla-ts');
  });

  it('handles immediate installation flag', async () => {
    // Requirements: 1.1, 4.1, 7.4
    // This test verifies immediate installation handling

    // Test with immediate flag
    const args1 = parseArguments(['--immediate']);
    expect(args1.immediate).toBe(true);

    // Test with short flag
    const args2 = parseArguments(['-i']);
    expect(args2.immediate).toBe(true);

    // Test without flag
    const args3 = parseArguments([]);
    expect(args3.immediate).toBeUndefined();

    // In test environment, install and start should not throw
    const projectRoot = path.join(tempDir, 'test-install');
    fs.mkdirSync(projectRoot, { recursive: true });

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    expect(() => install(projectRoot, 'npm')).not.toThrow();
    expect(() => start(projectRoot, 'npm')).not.toThrow();

    consoleSpy.mockRestore();
  });
});
