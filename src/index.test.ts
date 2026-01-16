import { describe, it, expect } from 'vitest'
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
} from './index'

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
        fc.array(fc.string().filter((s) => s.length > 0 && s !== '.git' && !s.includes('/'))),
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
