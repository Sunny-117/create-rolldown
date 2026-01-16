/**
 * Constants for create-rolldown
 */
import pc from 'picocolors';
import type { Framework } from './types';

/**
 * Supported frameworks with their variants
 * Note: Only TypeScript templates are supported (vanilla and react)
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
