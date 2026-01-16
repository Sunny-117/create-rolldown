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
    variants: [
      {
        name: 'vanilla',
        display: 'TypeScript',
        color: pc.blue,
      },
    ],
  },
  {
    name: 'react',
    display: 'React',
    color: pc.cyan,
    variants: [
      {
        name: 'react',
        display: 'TypeScript',
        color: pc.blue,
      },
    ],
  },
  {
    name: 'vue',
    display: 'Vue',
    color: pc.green,
    variants: [
      {
        name: 'vue',
        display: 'TypeScript',
        color: pc.blue,
      },
    ],
  },
  {
    name: 'solid',
    display: 'Solid',
    color: pc.blue,
    variants: [
      {
        name: 'solid',
        display: 'TypeScript',
        color: pc.blue,
      },
    ],
  },
  {
    name: 'svelte',
    display: 'Svelte',
    color: pc.red,
    variants: [
      {
        name: 'svelte',
        display: 'TypeScript',
        color: pc.blue,
      },
    ],
  },
];

/**
 * All available template names (flat list)
 */
export const TEMPLATES: string[] = FRAMEWORKS.map((f) => f.variants.map((v) => v.name)).flat();

/**
 * File rename mappings for special files
 */
export const renameFiles: Record<string, string | undefined> = {
  _gitignore: '.gitignore',
};
