import fs from 'node:fs';
import path from 'node:path';
import type { SyncOptions } from 'execa';
import { execaCommandSync } from 'execa';
import { afterAll, beforeAll, expect, test } from 'vitest';

const CLI_PATH = path.join(__dirname, '..');

const projectName = 'test-app';
const genPath = path.join(__dirname, projectName);
const genPathWithSubfolder = path.join(__dirname, 'subfolder', projectName);

const run = (args: string[], options?: SyncOptions) => {
  return execaCommandSync(`node ${CLI_PATH} ${args.join(' ')}`, {
    env: { ...process.env, _ROLLDOWN_TEST_CLI: 'true' },
    ...options,
  });
};

// Helper to create a non-empty directory
const createNonEmptyDir = (overrideFolder?: string) => {
  // Create the temporary directory
  const newNonEmptyFolder = overrideFolder || genPath;
  fs.mkdirSync(newNonEmptyFolder, { recursive: true });

  // Create a package.json file
  const pkgJson = path.join(newNonEmptyFolder, 'package.json');
  fs.writeFileSync(pkgJson, '{ "foo": "bar" }');
};

// React starter template
const templateFiles = fs
  .readdirSync(path.join(CLI_PATH, 'template-react'))
  // _gitignore is renamed to .gitignore
  .map((filePath) => (filePath === '_gitignore' ? '.gitignore' : filePath))
  .sort();

const clearAnyPreviousFolders = () => {
  if (fs.existsSync(genPath)) {
    fs.rmSync(genPath, { recursive: true, force: true });
  }
  if (fs.existsSync(genPathWithSubfolder)) {
    fs.rmSync(genPathWithSubfolder, { recursive: true, force: true });
  }
  // Clean up the subfolder directory if it exists
  const subfolderPath = path.join(__dirname, 'subfolder');
  if (fs.existsSync(subfolderPath)) {
    fs.rmSync(subfolderPath, { recursive: true, force: true });
  }
  // Clean up rolldown-project if it exists in the root
  const rolldownProjectPath = path.join(CLI_PATH, 'rolldown-project');
  if (fs.existsSync(rolldownProjectPath)) {
    fs.rmSync(rolldownProjectPath, { recursive: true, force: true });
  }
  // Clean up any test-* directories in __tests__
  const testDirs = fs
    .readdirSync(__dirname)
    .filter((file) => file.startsWith('test-') || file.startsWith('My-Invalid-'));
  testDirs.forEach((dir) => {
    const dirPath = path.join(__dirname, dir);
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  });
};

beforeAll(() => clearAnyPreviousFolders());
// Only clean up after all tests complete to avoid interfering with tests that read files
afterAll(() => clearAnyPreviousFolders());

test('prompts for the project name if none supplied', () => {
  const { stdout } = run(['--interactive']);
  expect(stdout).toContain('Project name:');
});

test('prompts for the framework if none supplied', () => {
  const { stdout } = run([projectName, '--interactive']);
  expect(stdout).toContain('Select a framework:');
});

test('successfully scaffolds a project based on react starter template', () => {
  const { stdout } = run([projectName, '--no-interactive', '--template', 'react'], {
    cwd: __dirname,
  });
  const generatedFiles = fs.readdirSync(genPath).sort();

  // Assertions
  expect(stdout).toContain(`Scaffolding project in ${genPath}`);
  expect(templateFiles).toEqual(generatedFiles);
});

test('accepts command line override for --overwrite', () => {
  createNonEmptyDir();
  const { stdout } = run(['.', '--no-interactive', '--overwrite'], {
    cwd: genPath,
  });
  expect(stdout).not.toContain(`Target directory "." is not empty.`);
  expect(stdout).toContain('Scaffolding project');
});

test('skip prompts when --no-interactive is passed', () => {
  const { stdout } = run([projectName, '--no-interactive'], { cwd: __dirname });
  expect(stdout).not.toContain('Project name:');
  expect(stdout).toContain('Done. Now run:');
});

test('return help usage how to use create-rolldown', () => {
  const { stdout } = run(['--help'], { cwd: __dirname });
  const message = 'Usage: create-rolldown';
  expect(stdout).toContain(message);
});

test('sets index.html title to project name in playground', () => {
  const { stdout } = run([projectName, '--template', 'react', '--no-interactive'], {
    cwd: __dirname,
  });

  const indexHtmlPath = path.join(genPath, 'playground', 'index.html');
  const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf-8');

  expect(stdout).toContain(`Scaffolding project in ${genPath}`);
  expect(indexHtmlContent).toContain(`<title>${projectName}</title>`);
});

test('uses default template when none specified in non-interactive mode', () => {
  const { stdout } = run([projectName, '--no-interactive'], {
    cwd: __dirname,
  });

  expect(stdout).toContain(`Scaffolding project in ${genPath}`);
  expect(fs.existsSync(genPath)).toBe(true);

  // Should use vanilla as default
  const pkgJsonPath = path.join(genPath, 'package.json');
  expect(fs.existsSync(pkgJsonPath)).toBe(true);
});

test('converts invalid package name to valid one', () => {
  const invalidName = 'My-Invalid-Package-Name';

  // Run the CLI with the invalid package name
  const { stdout } = run([invalidName, '--no-interactive'], {
    cwd: __dirname,
  });

  const targetPath = path.join(__dirname, invalidName);
  const pkgJsonPath = path.join(targetPath, 'package.json');

  expect(stdout).toContain(`Scaffolding project in ${targetPath}`);
  expect(fs.existsSync(targetPath)).toBe(true);

  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
  // Should be converted to valid package name (lowercase)
  expect(pkgJson.name).toBe('my-invalid-package-name');

  // Cleanup
  fs.rmSync(targetPath, { recursive: true, force: true });
});

test('handles all supported templates', () => {
  const templates = ['vanilla', 'react', 'vue', 'solid', 'svelte'];

  templates.forEach((template) => {
    const testPath = path.join(__dirname, `test-${template}`);

    const { stdout } = run([`test-${template}`, '--template', template, '--no-interactive'], {
      cwd: __dirname,
    });

    expect(stdout).toContain(`Scaffolding project in ${testPath}`);
    expect(fs.existsSync(testPath)).toBe(true);

    // Cleanup
    fs.rmSync(testPath, { recursive: true, force: true });
  });
});
