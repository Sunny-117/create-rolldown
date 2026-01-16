# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-01-16

### Added

- Initial release of create-rolldown
- Interactive CLI for project scaffolding
- Non-interactive mode for CI/CD and automation
- TypeScript-first approach (all templates use TypeScript)
- Support for frameworks:
  - Vanilla TypeScript
  - React with TypeScript
  - (Vue, Svelte, Solid, Qwik planned for future releases)
- Smart package manager detection (npm, pnpm, yarn, bun, deno)
- Immediate install and start option (`--immediate` flag)
- Directory conflict handling with overwrite option
- Automatic package name validation and conversion
- Comprehensive test suite with 90+ tests
- Property-based testing for correctness guarantees
- CLI options:
  - `--template` / `-t`: Specify template (vanilla or react)
  - `--overwrite`: Overwrite existing files
  - `--immediate` / `-i`: Install and start immediately
  - `--interactive` / `--no-interactive`: Force mode
  - `--help` / `-h`: Display help

### Features

- 🚀 Fast project setup with Rolldown bundler
- 🎨 2 TypeScript templates (Vanilla and React)
- 🔧 Flexible interactive and non-interactive modes
- 📦 Automatic package manager detection
- ⚡ Optional immediate dependency installation and dev server start
- ✅ Comprehensive testing with unit and property-based tests
- 💙 TypeScript-first approach

### Technical Details

- Built with TypeScript
- Uses tsdown for building
- Dependencies:
  - @clack/prompts for interactive CLI
  - mri for argument parsing
  - cross-spawn for command execution
  - picocolors for colored output
  - @vercel/detect-agent for package manager detection
- Node.js requirement: ^20.19.0 || >=22.12.0

[Unreleased]: https://github.com/rolldown/create-rolldown/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/rolldown/create-rolldown/releases/tag/v0.1.0
