/**
 * Validation utilities
 */

/**
 * Format target directory by removing trailing slashes and whitespace
 * @param targetDir - The directory path to format
 * @returns Formatted directory path
 */
export function formatTargetDir(targetDir: string | undefined): string {
  return targetDir?.trim().replace(/\/+$/g, '') ?? '';
}

/**
 * Validate if a string is a valid npm package name
 * @param projectName - The project name to validate
 * @returns true if valid, false otherwise
 */
export function isValidPackageName(projectName: string): boolean {
  return /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(projectName);
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
    .replace(/[^a-z0-9-~]+/g, '-');

  // If the result is empty or invalid, return a default valid name
  return converted || 'package';
}
