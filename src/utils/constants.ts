/**
 * Constants for create-rolldown
 */
import pc from 'picocolors';
import type { Framework } from './types';

/**
 * Supported frameworks with their variants
 * All templates use TypeScript and are designed for library development
 * (utility libraries, component libraries, tools, hooks, composables, etc.)
 */
export const FRAMEWORKS: Framework[] = [
  {
    name: 'vanilla',
    display: 'Vanilla',
    color: pc.yellow,
  },
  {
    name: 'react',
    display: 'React',
    color: pc.cyan,
  },
  {
    name: 'vue',
    display: 'Vue',
    color: pc.green,
  },
  {
    name: 'solid',
    display: 'Solid',
    color: pc.blue,
  },
  {
    name: 'svelte',
    display: 'Svelte',
    color: pc.red,
  },
];

/**
 * All available template names (flat list)
 */
export const TEMPLATES: string[] = FRAMEWORKS.map((f) => f.name);

/**
 * File rename mappings for special files
 */
export const renameFiles: Record<string, string | undefined> = {
  _gitignore: '.gitignore',
};

/**
 * Banner text for create-rolldown
 * Displayed at the start of the CLI
 */
export const defaultBanner = 'Rolldown - Blazing Fast Rust-based bundler for JavaScript';

/**
 * Gradient banner with Rolldown brand colors (orange gradient)
 * Uses ANSI escape codes for RGB colors
 */
export const gradientBanner =
  '\x1B[38;2;255;107;0mR\x1B[39m\x1B[38;2;255;105;4mo\x1B[39m\x1B[38;2;255;103;8ml\x1B[39m\x1B[38;2;255;101;12ml\x1B[39m\x1B[38;2;255;99;16md\x1B[39m\x1B[38;2;255;97;20mo\x1B[39m\x1B[38;2;255;95;24mw\x1B[39m\x1B[38;2;255;93;28mn\x1B[39m \x1B[38;2;255;91;32m-\x1B[39m \x1B[38;2;255;89;36mB\x1B[39m\x1B[38;2;255;87;40ml\x1B[39m\x1B[38;2;255;85;44ma\x1B[39m\x1B[38;2;255;83;48mz\x1B[39m\x1B[38;2;255;81;52mi\x1B[39m\x1B[38;2;255;79;56mn\x1B[39m\x1B[38;2;255;77;60mg\x1B[39m \x1B[38;2;255;75;64mF\x1B[39m\x1B[38;2;255;73;68ma\x1B[39m\x1B[38;2;255;71;72ms\x1B[39m\x1B[38;2;255;69;76mt\x1B[39m \x1B[38;2;255;67;80mR\x1B[39m\x1B[38;2;255;65;84mu\x1B[39m\x1B[38;2;255;63;88ms\x1B[39m\x1B[38;2;255;61;92mt\x1B[39m\x1B[38;2;255;59;96m-\x1B[39m\x1B[38;2;255;57;100mb\x1B[39m\x1B[38;2;255;55;104ma\x1B[39m\x1B[38;2;255;53;108ms\x1B[39m\x1B[38;2;255;51;112me\x1B[39m\x1B[38;2;255;49;116md\x1B[39m \x1B[38;2;255;47;120mb\x1B[39m\x1B[38;2;255;45;124mu\x1B[39m\x1B[38;2;255;43;128mn\x1B[39m\x1B[38;2;255;41;132md\x1B[39m\x1B[38;2;255;39;136ml\x1B[39m\x1B[38;2;255;37;140me\x1B[39m\x1B[38;2;255;35;144mr\x1B[39m \x1B[38;2;255;33;148mf\x1B[39m\x1B[38;2;255;31;152mo\x1B[39m\x1B[38;2;255;29;156mr\x1B[39m \x1B[38;2;255;27;160mJ\x1B[39m\x1B[38;2;255;25;164ma\x1B[39m\x1B[38;2;255;23;168mv\x1B[39m\x1B[38;2;255;21;172ma\x1B[39m\x1B[38;2;255;19;176mS\x1B[39m\x1B[38;2;255;17;180mc\x1B[39m\x1B[38;2;255;15;184mr\x1B[39m\x1B[38;2;255;13;188mi\x1B[39m\x1B[38;2;255;11;192mp\x1B[39m\x1B[38;2;255;9;196mt\x1B[39m';
