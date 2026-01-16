/**
 * Constants for create-rolldown
 */
import pc from 'picocolors';
import type { Framework } from './types';

/**
 * Supported frameworks with their variants
 */
export const FRAMEWORKS: Framework[] = [
  {
    name: 'vanilla',
    display: 'Vanilla',
    color: pc.yellow,
    variants: [
      {
        name: 'vanilla-ts',
        display: 'TypeScript',
        color: pc.blue,
      },
      {
        name: 'vanilla',
        display: 'JavaScript',
        color: pc.yellow,
      },
    ],
  },
  {
    name: 'vue',
    display: 'Vue',
    color: pc.green,
    variants: [
      {
        name: 'vue-ts',
        display: 'TypeScript',
        color: pc.blue,
      },
      {
        name: 'vue',
        display: 'JavaScript',
        color: pc.yellow,
      },
    ],
  },
  {
    name: 'react',
    display: 'React',
    color: pc.cyan,
    variants: [
      {
        name: 'react-ts',
        display: 'TypeScript',
        color: pc.blue,
      },
      {
        name: 'react',
        display: 'JavaScript',
        color: pc.yellow,
      },
    ],
  },
  {
    name: 'svelte',
    display: 'Svelte',
    color: pc.red,
    variants: [
      {
        name: 'svelte-ts',
        display: 'TypeScript',
        color: pc.blue,
      },
      {
        name: 'svelte',
        display: 'JavaScript',
        color: pc.yellow,
      },
    ],
  },
  {
    name: 'solid',
    display: 'Solid',
    color: pc.blue,
    variants: [
      {
        name: 'solid-ts',
        display: 'TypeScript',
        color: pc.blue,
      },
      {
        name: 'solid',
        display: 'JavaScript',
        color: pc.yellow,
      },
    ],
  },
  {
    name: 'qwik',
    display: 'Qwik',
    color: pc.magenta,
    variants: [
      {
        name: 'qwik-ts',
        display: 'TypeScript',
        color: pc.blue,
      },
      {
        name: 'qwik',
        display: 'JavaScript',
        color: pc.yellow,
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
