/**
 * File system utilities
 */
import fs from 'node:fs';
import path from 'node:path';
import { renameFiles } from './constants';

/**
 * Check if a directory is empty (ignoring .git)
 * @param path - The directory path to check
 * @returns true if empty or only contains .git, false otherwise
 */
export function isEmpty(path: string): boolean {
  const files = fs.readdirSync(path);
  return files.length === 0 || (files.length === 1 && files[0] === '.git');
}

/**
 * Empty a directory but preserve .git folder
 * @param dir - The directory to empty
 * @throws Error if directory emptying fails
 */
export function emptyDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    return;
  }
  try {
    for (const file of fs.readdirSync(dir)) {
      if (file === '.git') {
        continue;
      }
      fs.rmSync(path.resolve(dir, file), { recursive: true, force: true });
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to empty directory ${dir}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Copy a file or directory
 * @param src - Source path
 * @param dest - Destination path
 * @throws Error if copy operation fails
 */
export function copy(src: string, dest: string): void {
  try {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
      copyDir(src, dest);
    } else {
      fs.copyFileSync(src, dest);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to copy from ${src} to ${dest}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Recursively copy a directory
 * @param srcDir - Source directory
 * @param destDir - Destination directory
 * @throws Error if directory copy fails
 */
export function copyDir(srcDir: string, destDir: string): void {
  try {
    fs.mkdirSync(destDir, { recursive: true });
    for (const file of fs.readdirSync(srcDir)) {
      const srcFile = path.resolve(srcDir, file);
      const destFile = path.resolve(destDir, file);
      copy(srcFile, destFile);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to copy directory from ${srcDir} to ${destDir}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Write a file with optional content transformation
 * Handles special file renaming (e.g., _gitignore -> .gitignore)
 * @param file - File path to write
 * @param content - Optional content to write (if undefined, copies from template)
 */
export function write(file: string, content?: string): void {
  const targetPath = renameFiles[path.basename(file)] ?? file;
  if (content) {
    fs.writeFileSync(targetPath, content);
  } else {
    copy(file, targetPath);
  }
}

/**
 * Edit a file by applying a transformation function to its content
 * @param file - File path to edit
 * @param callback - Function that transforms the file content
 */
export function editFile(file: string, callback: (content: string) => string): void {
  const content = fs.readFileSync(file, 'utf-8');
  fs.writeFileSync(file, callback(content));
}

/**
 * Copy template files to target directory with transformations
 * @param templateDir - Source template directory
 * @param root - Target root directory
 * @param projectName - Project name for replacements
 * @param packageName - Package name for package.json
 * @throws Error if template copy fails or template directory doesn't exist
 */
export function copyTemplate(
  templateDir: string,
  root: string,
  projectName: string,
  packageName: string
): void {
  // Validate template directory exists
  if (!fs.existsSync(templateDir)) {
    throw new Error(`Template directory not found: ${templateDir}`);
  }

  try {
    // Create target directory if it doesn't exist
    if (!fs.existsSync(root)) {
      fs.mkdirSync(root, { recursive: true });
    }

    const files = fs.readdirSync(templateDir);

    for (const file of files) {
      const srcFile = path.join(templateDir, file);
      const stat = fs.statSync(srcFile);

      if (stat.isDirectory()) {
        // Recursively copy directories
        const destDir = path.join(root, file);
        copyDir(srcFile, destDir);
      } else {
        // Handle file renaming for special files
        const destFileName = renameFiles[file] ?? file;
        const destFile = path.join(root, destFileName);

        // Copy the file
        fs.copyFileSync(srcFile, destFile);
      }
    }

    // Update package.json with the correct package name
    const pkgJsonPath = path.join(root, 'package.json');
    if (fs.existsSync(pkgJsonPath)) {
      editFile(pkgJsonPath, (content) => {
        const pkg = JSON.parse(content);
        pkg.name = packageName;
        return JSON.stringify(pkg, null, 2) + '\n';
      });
    }

    // Update index.html with the correct project name (check both root and playground)
    const indexHtmlPath = path.join(root, 'index.html');
    const playgroundIndexHtmlPath = path.join(root, 'playground', 'index.html');

    if (fs.existsSync(indexHtmlPath)) {
      editFile(indexHtmlPath, (content) => {
        // Use a replacement function to avoid issues with special regex characters
        return content.replace(/<title>.*?<\/title>/, () => `<title>${projectName}</title>`);
      });
    }

    if (fs.existsSync(playgroundIndexHtmlPath)) {
      editFile(playgroundIndexHtmlPath, (content) => {
        // Use a replacement function to avoid issues with special regex characters
        return content.replace(/<title>.*?<\/title>/, () => `<title>${projectName}</title>`);
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to copy template: ${error.message}`);
    }
    throw error;
  }
}
