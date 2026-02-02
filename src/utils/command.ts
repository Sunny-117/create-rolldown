/**
 * Command execution utilities
 */
import { SpawnOptions } from 'node:child_process';
import spawn from 'cross-spawn';
import pc from 'picocolors';
import { getInstallCommand, getRunCommand } from './package-manager';

/**
 * Execute a command using cross-spawn
 * @param command - Command array [command, ...args]
 * @param options - Spawn options
 * @throws Error if command execution fails
 */
export function run(command: string[], options?: SpawnOptions): void {
  // Skip actual command execution in test environment
  if (process.env._ROLLDOWN_TEST_CLI) {
    return;
  }

  const [cmd, ...args] = command;

  try {
    const result = spawn.sync(cmd, args, {
      stdio: 'inherit',
      ...options,
    });

    if (result.error) {
      throw new Error(
        `Failed to execute command: ${cmd} ${args.join(' ')}\n${result.error.message}`
      );
    }

    if (result.status !== 0) {
      throw new Error(`Command failed with exit code ${result.status}: ${cmd} ${args.join(' ')}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(pc.red(`\n✗ Command execution failed: ${error.message}`));
    } else {
      console.error(pc.red(`\n✗ Command execution failed: ${String(error)}`));
    }
    throw error;
  }
}

/**
 * Install dependencies in the project directory
 * @param root - Project root directory
 * @param agent - Package manager name
 * @throws Error if installation fails
 */
export function install(root: string, agent: string): void {
  const installCmd = getInstallCommand(agent);
  console.log(pc.cyan(`\nInstalling dependencies with ${agent}...`));

  // Skip actual installation in test environment
  if (process.env._ROLLDOWN_TEST_CLI) {
    return;
  }

  try {
    run(installCmd, { cwd: root });
  } catch (error) {
    console.error(pc.red(`\n✗ Failed to install dependencies with ${agent}`));
    if (error instanceof Error) {
      console.error(pc.red(`Error: ${error.message}`));
    }
    throw error;
  }
}

/**
 * Start the development server
 * @param root - Project root directory
 * @param agent - Package manager name
 * @throws Error if server start fails
 */
export function start(root: string, agent: string): void {
  const runCmd = getRunCommand(agent, 'dev');
  console.log(pc.cyan(`\nStarting dev server...`));

  // Skip actual server start in test environment
  if (process.env._ROLLDOWN_TEST_CLI) {
    return;
  }

  try {
    run(runCmd, { cwd: root });
  } catch (error) {
    console.error(pc.red(`\n✗ Failed to start dev server with ${agent}`));
    if (error instanceof Error) {
      console.error(pc.red(`Error: ${error.message}`));
    }
    throw error;
  }
}
