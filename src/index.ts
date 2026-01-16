// create-rolldown - Scaffolding tool for Rolldown projects
// Main entry point

import fs from 'node:fs'
import path from 'node:path'

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

async function init(): Promise<void> {
  // TODO: Implement initialization logic
  console.log('create-rolldown - Coming soon!')
}

init().catch((error) => {
  console.error(error)
  process.exit(1)
})
