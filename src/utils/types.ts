/**
 * Type definitions for create-rolldown
 */

/**
 * Color function type for framework display
 */
export type ColorFunc = (str: string | number) => string;

/**
 * CLI Arguments interface
 */
export interface CLIArguments {
  _: string[]; // Positional arguments
  template?: string; // Template name (-t, --template)
  help?: boolean; // Show help (-h, --help)
  overwrite?: boolean; // Overwrite existing files (--overwrite)
  immediate?: boolean; // Install and start immediately (-i, --immediate)
  interactive?: boolean; // Force interactive/non-interactive mode (--interactive, --no-interactive)
}

/**
 * Framework variant interface (deprecated - kept for backward compatibility)
 */
export interface FrameworkVariant {
  name: string; // Variant identifier (template name)
  display: string; // Display name
  color: ColorFunc; // Color function
  customCommand?: string; // Custom creation command (optional)
}

/**
 * Framework interface
 */
export interface Framework {
  name: string; // Framework identifier (also used as template name)
  display: string; // Display name
  color: ColorFunc; // Color function
}

/**
 * Package manager information
 */
export interface PkgInfo {
  name: string;
  version: string;
}
