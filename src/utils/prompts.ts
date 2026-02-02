/**
 * User prompt utilities
 */
import * as prompts from '@clack/prompts';
import type { Framework, FrameworkVariant } from './types';
import { isValidPackageName } from './validation';

/**
 * Exit the process (skipped in test mode)
 * @param code - Exit code
 */
function exitProcess(code: number): void {
  if (!process.env._ROLLDOWN_TEST_CLI) {
    process.exit(code);
  }
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
        return 'Project name cannot be empty';
      }
    },
  });

  if (prompts.isCancel(result)) {
    prompts.cancel('Operation cancelled');
    exitProcess(0);
  }

  return result as string;
}

/**
 * Prompt user for how to handle existing directory
 * @param targetDir - The target directory path
 * @returns User's choice: 'yes' (overwrite), 'no' (cancel), or 'ignore' (merge)
 */
export async function promptOverwrite(targetDir: string): Promise<'yes' | 'no' | 'ignore'> {
  const displayDir = targetDir === '.' ? 'Current directory' : `Target directory "${targetDir}"`;
  const message = `${displayDir} is not empty. Please choose how to proceed:`;

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
  });

  if (prompts.isCancel(result)) {
    prompts.cancel('Operation cancelled');
    exitProcess(0);
  }

  return result as 'yes' | 'no' | 'ignore';
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
        return 'Package name cannot be empty';
      }
      if (!isValidPackageName(value)) {
        return 'Invalid package name (must follow npm naming conventions)';
      }
    },
  });

  if (prompts.isCancel(result)) {
    prompts.cancel('Operation cancelled');
    exitProcess(0);
  }

  return result as string;
}

/**
 * Prompt user to select a framework
 * @param frameworks - Array of available frameworks
 * @returns Selected framework
 */
export async function promptFramework(frameworks: Framework[]): Promise<Framework> {
  const result = await prompts.select({
    message: 'Select a framework:',
    options: frameworks.map((framework) => ({
      value: framework,
      label: framework.color(framework.display),
    })),
  });

  if (prompts.isCancel(result)) {
    prompts.cancel('Operation cancelled');
    exitProcess(0);
  }

  return result as Framework;
}

/**
 * Prompt user to select a framework variant
 * @param variants - Array of available variants
 * @returns Selected variant name (template name)
 */
export async function promptVariant(variants: FrameworkVariant[]): Promise<string> {
  const result = await prompts.select({
    message: 'Select a variant:',
    options: variants.map((variant) => ({
      value: variant.name,
      label: variant.color(variant.display),
    })),
  });

  if (prompts.isCancel(result)) {
    prompts.cancel('Operation cancelled');
    exitProcess(0);
  }

  return result as string;
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
  });

  if (prompts.isCancel(result)) {
    prompts.cancel('Operation cancelled');
    exitProcess(0);
  }

  return result as boolean;
}
