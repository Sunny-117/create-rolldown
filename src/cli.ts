#!/usr/bin/env node

/**
 * create-rolldown - Scaffolding tool for Rolldown projects
 * CLI entry point
 */

import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';
import {
  parseArguments,
  displayHelp,
  shouldUseInteractiveMode,
  formatTargetDir,
  isEmpty,
  emptyDir,
  toValidPackageName,
  isValidPackageName,
  copyTemplate,
  pkgFromUserAgent,
  getInstallCommand,
  getRunCommand,
  install,
  start,
  promptProjectName,
  promptOverwrite,
  promptPackageName,
  promptFramework,
  promptImmediate,
  FRAMEWORKS,
  TEMPLATES,
  gradientBanner,
  defaultBanner,
} from './utils';

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
 * Main initialization function
 * Orchestrates the entire project creation workflow
 */
async function init(): Promise<void> {
  try {
    // Display banner
    console.log();
    const supportsColor = process.stdout.isTTY && process.env.TERM !== 'dumb';
    console.log(supportsColor ? gradientBanner : defaultBanner);
    console.log();

    const args = parseArguments();

    // Display help if requested
    if (args.help) {
      displayHelp();
      return;
    }

    // Detect interactive mode
    const interactive = shouldUseInteractiveMode(args);

    // Detect AI agent environment and provide guidance
    if (!interactive && !process.stdout.isTTY) {
      console.log(pc.yellow('\nDetected non-interactive environment (AI agent or CI/CD).'));
      console.log(
        pc.yellow(
          'For best results, use: create-rolldown <project-name> --template <template> --no-interactive\n'
        )
      );
    }

    // Get target directory from arguments or use default
    const defaultProjectName = 'rolldown-project';
    let targetDir = formatTargetDir(args._[0]);

    // Get project name (interactive or from args)
    let projectName: string;
    if (interactive && !targetDir) {
      projectName = await promptProjectName(defaultProjectName);
      targetDir = formatTargetDir(projectName);
    } else {
      projectName = targetDir || defaultProjectName;
      targetDir = projectName;
    }

    // Resolve to absolute path
    const root = path.resolve(process.cwd(), targetDir);

    // Handle directory conflicts
    if (fs.existsSync(root) && !isEmpty(root)) {
      if (interactive) {
        const overwrite = await promptOverwrite(targetDir);

        if (overwrite === 'no') {
          console.log(pc.red('\nOperation cancelled'));
          exitProcess(0);
        } else if (overwrite === 'yes') {
          console.log(pc.cyan(`\nRemoving existing files in ${targetDir}...`));
          try {
            emptyDir(root);
          } catch (error) {
            console.error(pc.red(`\n✗ Failed to remove existing files`));
            if (error instanceof Error) {
              console.error(pc.red(`Error: ${error.message}`));
            }
            exitProcess(1);
          }
        }
        // If 'ignore', continue without clearing
      } else {
        // Non-interactive mode
        if (args.overwrite) {
          console.log(pc.cyan(`\nRemoving existing files in ${targetDir}...`));
          try {
            emptyDir(root);
          } catch (error) {
            console.error(pc.red(`\n✗ Failed to remove existing files`));
            if (error instanceof Error) {
              console.error(pc.red(`Error: ${error.message}`));
            }
            exitProcess(1);
          }
        } else {
          console.log(pc.red(`\nTarget directory "${targetDir}" is not empty.`));
          console.log(
            pc.red(
              'Use --overwrite flag to overwrite existing files, or choose a different directory.'
            )
          );
          exitProcess(1);
        }
      }
    }

    // Get package name
    let packageName = toValidPackageName(projectName);
    if (interactive && !isValidPackageName(projectName)) {
      packageName = await promptPackageName(packageName);
    }

    // Get template
    let template = args.template;

    if (interactive && !template) {
      // Prompt for framework (directly get template name)
      const framework = await promptFramework(FRAMEWORKS);
      template = framework.name; // Use framework name directly as template
    } else if (!template) {
      // Non-interactive mode without template - use default
      template = 'vanilla';
    }

    // Validate template
    if (!TEMPLATES.includes(template)) {
      if (interactive) {
        console.log(
          pc.yellow(`\n"${template}" isn't a valid template. Please choose from below:\n`)
        );
        const framework = await promptFramework(FRAMEWORKS);
        template = framework.name; // Use framework name directly as template
      } else {
        console.log(
          pc.yellow(`\nTemplate "${template}" not found. Using default template "vanilla".\n`)
        );
        template = 'vanilla';
      }
    }

    // Detect package manager
    const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent);
    const pkgManager = pkgInfo?.name || 'npm';

    // Ask about immediate installation (interactive only)
    let shouldInstall = false;
    if (args.immediate === true) {
      shouldInstall = true;
    } else if (args.immediate === false) {
      shouldInstall = false;
    } else if (interactive) {
      shouldInstall = await promptImmediate(pkgManager);
    }

    // Start scaffolding
    console.log(pc.cyan(`\nScaffolding project in ${root}...`));

    // Get template directory
    const templateDir = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      '..',
      `template-${template}`
    );

    // Create target directory if it doesn't exist
    try {
      if (!fs.existsSync(root)) {
        fs.mkdirSync(root, { recursive: true });
      }
    } catch (error) {
      console.error(pc.red(`\n✗ Failed to create project directory`));
      if (error instanceof Error) {
        console.error(pc.red(`Error: ${error.message}`));
      }
      exitProcess(1);
    }

    // Copy template files
    try {
      copyTemplate(templateDir, root, projectName, packageName);
    } catch (error) {
      console.error(pc.red(`\n✗ Failed to copy template files`));
      if (error instanceof Error) {
        console.error(pc.red(`Error: ${error.message}`));
      }
      exitProcess(1);
    }

    console.log(pc.green('\n✓ Project created successfully!'));

    // Install dependencies and start server if requested
    if (shouldInstall) {
      try {
        install(root, pkgManager);
        console.log(pc.green('\n✓ Dependencies installed successfully!'));

        start(root, pkgManager);
      } catch (error) {
        console.error(pc.red('\n✗ Failed to install dependencies or start server'));
        if (error instanceof Error) {
          console.error(pc.red(`Error: ${error.message}`));
        }
        exitProcess(1);
      }
    } else {
      // Display next steps
      console.log(pc.cyan('\nDone. Now run:\n'));

      const cdCommand = path.relative(process.cwd(), root);
      if (cdCommand) {
        console.log(pc.cyan(`  cd ${cdCommand}`));
      }

      const installCmd = getInstallCommand(pkgManager).join(' ');
      console.log(pc.cyan(`  ${installCmd}`));

      const runCmd = getRunCommand(pkgManager, 'dev').join(' ');
      console.log(pc.cyan(`  ${runCmd}`));

      console.log();
    }
  } catch (error) {
    // Handle any unexpected errors
    if (error instanceof Error) {
      console.error(pc.red(`\n✗ An unexpected error occurred: ${error.message}`));
    } else {
      console.error(pc.red(`\n✗ An unexpected error occurred: ${String(error)}`));
    }
    exitProcess(1);
  }
}

// Run init function
init().catch((error) => {
  // Error handling is already done in init(), but catch any unhandled errors
  if (error instanceof Error && error.message !== 'process.exit called with code 0') {
    console.error(pc.red(`\n✗ Fatal error: ${error.message}`));
  }
  if (!process.env._ROLLDOWN_TEST_CLI && !process.env.VITEST) {
    exitProcess(1);
  }
});
