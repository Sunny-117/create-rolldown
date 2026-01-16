# Requirements Document

## Introduction

create-rolldown 是一个命令行工具，用于快速搭建基于 Rolldown 打包工具的项目脚手架。该工具参考 create-vite 的设计，提供交互式和非交互式两种模式，支持多种前端框架模板，帮助开发者快速启动新项目。

## Glossary

- **CLI**: Command Line Interface，命令行界面
- **Scaffolding_Tool**: 脚手架工具，用于生成项目初始结构的工具
- **Template**: 模板，预定义的项目结构和配置文件集合
- **Framework**: 前端框架，如 React、Vue、Svelte 等
- **Variant**: 变体，同一框架的不同配置版本（如 TypeScript/JavaScript）
- **Package_Manager**: 包管理器，如 npm、pnpm、yarn、bun
- **Interactive_Mode**: 交互模式，通过命令行提示引导用户输入
- **Non_Interactive_Mode**: 非交互模式，通过命令行参数直接指定所有选项
- **Target_Directory**: 目标目录，项目将被创建的位置
- **Rolldown**: 基于 Rust 的高性能 JavaScript 打包工具

## Requirements

### Requirement 1: CLI 入口和参数解析

**User Story:** 作为开发者，我希望能够通过命令行快速调用 create-rolldown，并支持多种参数选项，以便灵活地创建项目。

#### Acceptance Criteria

1. WHEN 用户执行 `npm create rolldown` 或 `create-rolldown` 命令 THEN THE CLI SHALL 启动并进入交互模式或非交互模式
2. WHEN 用户提供 `--help` 或 `-h` 参数 THEN THE CLI SHALL 显示帮助信息并退出
3. WHEN 用户提供目标目录作为第一个参数 THEN THE CLI SHALL 使用该目录作为项目创建位置
4. WHEN 用户提供 `--template` 或 `-t` 参数 THEN THE CLI SHALL 使用指定的模板
5. WHEN 用户提供 `--overwrite` 参数 THEN THE CLI SHALL 在目标目录非空时覆盖现有文件
6. WHEN 用户提供 `--immediate` 或 `-i` 参数 THEN THE CLI SHALL 在创建项目后立即安装依赖并启动开发服务器
7. WHEN 用户提供 `--interactive` 或 `--no-interactive` 参数 THEN THE CLI SHALL 强制进入或退出交互模式

### Requirement 2: 交互式项目配置

**User Story:** 作为开发者，我希望通过友好的交互式界面配置项目，以便在不记住所有参数的情况下创建项目。

#### Acceptance Criteria

1. WHEN CLI 在 TTY 环境中运行且未指定 `--no-interactive` THEN THE CLI SHALL 进入交互模式
2. WHEN 在交互模式下且未提供项目名称 THEN THE CLI SHALL 提示用户输入项目名称
3. WHEN 用户输入的项目名称为空或无效 THEN THE CLI SHALL 显示验证错误并要求重新输入
4. WHEN 目标目录已存在且非空 THEN THE CLI SHALL 提示用户选择操作（取消、删除现有文件、忽略文件）
5. WHEN 项目名称不符合 npm 包命名规范 THEN THE CLI SHALL 提示用户输入有效的包名称
6. WHEN 在交互模式下且未指定模板 THEN THE CLI SHALL 显示框架选择菜单
7. WHEN 用户选择框架后 THEN THE CLI SHALL 显示该框架的变体选择菜单
8. WHEN 在交互模式下 THEN THE CLI SHALL 询问用户是否立即安装依赖并启动开发服务器

### Requirement 3: 模板系统

**User Story:** 作为开发者，我希望能够选择不同的框架和配置模板，以便快速启动符合我技术栈的项目。

#### Acceptance Criteria

1. THE Scaffolding_Tool SHALL 支持至少以下框架模板：vanilla、vue、react、svelte、solid、qwik
2. WHEN 框架支持 TypeScript THEN THE Scaffolding_Tool SHALL 提供 TypeScript 和 JavaScript 两种变体
3. WHEN 用户指定的模板名称无效 THEN THE CLI SHALL 在交互模式下显示可用模板列表，在非交互模式下使用默认模板
4. THE Template SHALL 包含完整的项目结构，包括源代码、配置文件、依赖声明
5. THE Template SHALL 使用 Rolldown 作为打包工具
6. WHEN 模板被应用 THEN THE Scaffolding_Tool SHALL 正确处理特殊文件名（如 _gitignore 重命名为 .gitignore）

### Requirement 4: 项目文件生成

**User Story:** 作为开发者，我希望工具能够正确生成项目文件，以便我可以立即开始开发。

#### Acceptance Criteria

1. WHEN 创建项目 THEN THE Scaffolding_Tool SHALL 在目标目录创建完整的项目结构
2. WHEN 复制模板文件 THEN THE Scaffolding_Tool SHALL 保持文件的目录结构
3. WHEN 处理 package.json 文件 THEN THE Scaffolding_Tool SHALL 使用用户指定的包名称替换模板中的名称
4. WHEN 处理 index.html 文件 THEN THE Scaffolding_Tool SHALL 使用用户指定的项目名称更新 title 标签
5. WHEN 目标目录不存在 THEN THE Scaffolding_Tool SHALL 递归创建目录
6. WHEN 用户选择覆盖现有文件 THEN THE Scaffolding_Tool SHALL 清空目录但保留 .git 文件夹

### Requirement 5: 包管理器检测和依赖安装

**User Story:** 作为开发者，我希望工具能够自动检测我使用的包管理器，并使用正确的命令安装依赖，以便保持项目的一致性。

#### Acceptance Criteria

1. WHEN CLI 运行时 THEN THE Scaffolding_Tool SHALL 从环境变量检测当前使用的包管理器
2. THE Scaffolding_Tool SHALL 支持以下包管理器：npm、pnpm、yarn、bun、deno
3. WHEN 用户选择立即安装依赖 THEN THE Scaffolding_Tool SHALL 使用检测到的包管理器执行安装命令
4. WHEN 安装命令执行失败 THEN THE CLI SHALL 显示错误信息并退出
5. WHEN 在测试环境中运行 THEN THE Scaffolding_Tool SHALL 跳过实际的依赖安装

### Requirement 6: 开发服务器启动

**User Story:** 作为开发者，我希望在项目创建后能够立即启动开发服务器，以便快速查看项目效果。

#### Acceptance Criteria

1. WHEN 用户选择立即启动 THEN THE Scaffolding_Tool SHALL 在安装依赖后启动开发服务器
2. WHEN 启动开发服务器 THEN THE Scaffolding_Tool SHALL 使用检测到的包管理器执行 dev 脚本
3. WHEN 在测试环境中运行 THEN THE Scaffolding_Tool SHALL 跳过实际的服务器启动

### Requirement 7: 用户反馈和提示

**User Story:** 作为开发者，我希望在项目创建过程中获得清晰的反馈信息，以便了解当前进度和后续步骤。

#### Acceptance Criteria

1. WHEN 开始创建项目 THEN THE CLI SHALL 显示 "Scaffolding project in {path}..." 消息
2. WHEN 安装依赖 THEN THE CLI SHALL 显示 "Installing dependencies with {package_manager}..." 消息
3. WHEN 启动开发服务器 THEN THE CLI SHALL 显示 "Starting dev server..." 消息
4. WHEN 项目创建完成且未选择立即安装 THEN THE CLI SHALL 显示后续步骤说明（cd 命令、安装命令、启动命令）
5. WHEN 用户取消操作 THEN THE CLI SHALL 显示 "Operation cancelled" 消息并退出
6. WHEN 检测到 AI 代理环境 THEN THE CLI SHALL 提示非交互模式的使用方法

### Requirement 8: 错误处理

**User Story:** 作为开发者，我希望工具能够优雅地处理错误情况，以便我能够理解问题并采取相应措施。

#### Acceptance Criteria

1. WHEN 命令执行失败 THEN THE CLI SHALL 显示错误信息并以非零状态码退出
2. WHEN 文件系统操作失败 THEN THE CLI SHALL 捕获错误并显示有意义的错误消息
3. WHEN 用户在交互模式下取消操作 THEN THE CLI SHALL 优雅退出而不创建任何文件
4. WHEN 目标目录已存在且用户选择取消 THEN THE CLI SHALL 退出而不修改任何文件

### Requirement 9: 项目构建配置

**User Story:** 作为开发者，我希望生成的项目包含完整的构建配置，以便我可以直接进行开发和构建。

#### Acceptance Criteria

1. THE Template SHALL 包含 rolldown.config.js 或 rolldown.config.ts 配置文件
2. THE Template SHALL 在 package.json 中定义 dev、build、preview 等脚本
3. WHEN 模板使用 TypeScript THEN THE Template SHALL 包含 tsconfig.json 配置文件
4. THE Template SHALL 包含适当的 .gitignore 文件
5. THE Template SHALL 包含 README.md 文件，说明项目的使用方法

### Requirement 10: 非交互模式支持

**User Story:** 作为开发者或 CI/CD 系统，我希望能够在非交互环境中使用工具，以便自动化项目创建流程。

#### Acceptance Criteria

1. WHEN CLI 在非 TTY 环境中运行 THEN THE CLI SHALL 自动进入非交互模式
2. WHEN 在非交互模式下且未提供项目名称 THEN THE CLI SHALL 使用默认项目名称 "rolldown-project"
3. WHEN 在非交互模式下且未提供模板 THEN THE CLI SHALL 使用默认模板 "vanilla-ts"
4. WHEN 在非交互模式下且目标目录非空且未指定 --overwrite THEN THE CLI SHALL 取消操作并退出
5. WHEN 在非交互模式下且包名称无效 THEN THE CLI SHALL 自动转换为有效的包名称
