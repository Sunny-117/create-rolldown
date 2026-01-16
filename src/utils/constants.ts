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
