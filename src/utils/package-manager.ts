/**
 * Package manager utilities
 */
import type { PkgInfo } from './types';

/**
 * Parse package manager information from user agent string
 * @param userAgent - The user agent string (typically from npm_config_user_agent)
 * @returns Package manager info or undefined if not found
 */
export function pkgFromUserAgent(userAgent: string | undefined): PkgInfo | undefined {
  if (!userAgent) return undefined;

  const pkgSpec = userAgent.split(' ')[0];
  const pkgSpecArr = pkgSpec.split('/');

  if (pkgSpecArr.length !== 2) return undefined;

  return {
    name: pkgSpecArr[0],
    version: pkgSpecArr[1],
  };
}

/**
 * Get install command for a package manager
 * @param agent - Package manager name (npm, pnpm, yarn, bun, deno)
 * @returns Array of command parts
 */
export function getInstallCommand(agent: string): string[] {
  switch (agent) {
    case 'npm':
      return ['npm', 'install'];
    case 'pnpm':
      return ['pnpm', 'install'];
    case 'yarn':
      return ['yarn'];
    case 'bun':
      return ['bun', 'install'];
    case 'deno':
      return ['deno', 'install'];
    default:
      return ['npm', 'install'];
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
      return ['npm', 'run', script];
    case 'pnpm':
      return ['pnpm', script];
    case 'yarn':
      return ['yarn', script];
    case 'bun':
      return ['bun', 'run', script];
    case 'deno':
      return ['deno', 'task', script];
    default:
      return ['npm', 'run', script];
  }
}
