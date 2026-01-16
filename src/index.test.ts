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
