/**
 * Utility functions for create-rolldown
 * These are exported for testing purposes
 */

// Types
export type { CLIArguments, Framework, FrameworkVariant, ColorFunc, PkgInfo } from './types';

// Constants
export { FRAMEWORKS, TEMPLATES, renameFiles, defaultBanner, gradientBanner } from './constants';

// File operations
export { isEmpty, emptyDir, copy, copyDir, write, editFile, copyTemplate } from './file';

// Validation
export { formatTargetDir, isValidPackageName, toValidPackageName } from './validation';

// Package manager
export { pkgFromUserAgent, getInstallCommand, getRunCommand } from './package-manager';

// Prompts
export {
  promptProjectName,
  promptOverwrite,
  promptPackageName,
  promptFramework,
  promptImmediate,
} from './prompts';

// Command execution
export { run, install, start } from './command';

// Argument parsing
export { parseArguments, displayHelp, shouldUseInteractiveMode } from './args';
