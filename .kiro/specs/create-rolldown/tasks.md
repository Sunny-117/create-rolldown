# Implementation Plan: create-rolldown

## Overview

本实现计划将 create-rolldown 的开发分解为一系列增量式的编码任务。每个任务都建立在前面任务的基础上，确保项目逐步完善并在每个阶段都能验证核心功能。

实现策略：
1. 首先搭建项目基础结构和配置
2. 实现核心工具函数和验证逻辑
3. 开发 CLI 参数解析和模式检测
4. 实现文件系统操作和模板复制
5. 添加交互式界面
6. 集成包管理器检测和命令执行
7. 完善错误处理和用户反馈
8. 创建项目模板
9. 编写测试并验证

## Tasks

- [x] 1. 项目初始化和基础配置
  - 创建 package.json 配置文件，包含必要的依赖和脚本
  - 创建 tsconfig.json 配置 TypeScript 编译选项
  - 创建 tsdown.config.ts 配置构建工具
  - 创建 index.js 入口文件指向编译后的代码
  - 创建基本的目录结构（src/、template-* 等）
  - _Requirements: 9.1, 9.2_

- [x] 2. 实现核心工具函数
  - [x] 2.1 实现字符串验证和格式化函数
    - 实现 formatTargetDir：去除尾部斜杠和空格
    - 实现 isValidPackageName：验证 npm 包名称格式
    - 实现 toValidPackageName：转换为有效的包名称
    - _Requirements: 1.3, 2.5, 10.5_

  - [x] 2.2 编写工具函数的属性测试
    - **Property 3: 目录名称格式化幂等性**
    - **Property 4: 包名称验证和转换正确性**
    - **Property 15: 包名称转换往返一致性**
    - **Validates: Requirements 1.3, 2.5, 10.5**

  - [x] 2.3 实现文件系统工具函数
    - 实现 isEmpty：检查目录是否为空（忽略 .git）
    - 实现 emptyDir：清空目录但保留 .git
    - 实现 copy：复制文件或目录
    - 实现 copyDir：递归复制目录
    - _Requirements: 4.2, 4.5, 4.6_

  - [x] 2.4 编写文件系统函数的属性测试
    - **Property 11: 目录清空保留 .git**
    - **Validates: Requirements 4.6**

- [x] 3. 实现包管理器检测和命令生成
  - [x] 3.1 实现包管理器相关函数
    - 实现 pkgFromUserAgent：从环境变量解析包管理器信息
    - 实现 getInstallCommand：生成安装命令数组
    - 实现 getRunCommand：生成运行脚本命令数组
    - _Requirements: 5.1, 5.2, 5.3, 6.2_

  - [x] 3.2 编写包管理器函数的属性测试
    - **Property 12: 包管理器命令格式正确性**
    - **Validates: Requirements 5.3, 6.2**

- [x] 4. 实现命令行参数解析
  - [x] 4.1 定义 CLI 参数接口和解析逻辑
    - 使用 mri 解析命令行参数
    - 定义 CLIArguments 接口
    - 实现帮助信息显示
    - 实现模式检测逻辑（交互/非交互）
    - _Requirements: 1.1, 1.2, 1.7, 2.1, 10.1_

  - [x] 4.2 编写参数解析的属性测试
    - **Property 1: CLI 模式检测正确性**
    - **Property 2: 命令行参数应用正确性**
    - **Validates: Requirements 1.1, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 10.1**

- [x] 5. 定义框架和模板数据结构
  - 定义 Framework 和 FrameworkVariant 接口
  - 创建 FRAMEWORKS 常量数组，包含所有支持的框架
  - 创建 TEMPLATES 常量数组，包含所有模板名称
  - 定义 renameFiles 映射对象
  - _Requirements: 3.1, 3.2, 3.6_

- [x] 5.1 编写框架数据结构的单元测试
  - 验证所有必需的框架都已定义
  - 验证 TypeScript 变体对称性
  - _Requirements: 3.1, 3.2_

- [x] 6. 实现交互式提示功能
  - [x] 6.1 实现项目配置提示函数
    - 实现项目名称输入提示
    - 实现目录冲突处理提示
    - 实现包名称输入提示
    - 实现框架选择提示
    - 实现变体选择提示
    - 实现立即安装确认提示
    - pnpm test全部通过
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [x] 6.2 编写交互提示的单元测试
    - 测试各种输入验证逻辑
    - 测试取消操作处理
    - pnpm test全部通过
    - _Requirements: 2.3, 2.5, 8.3_

- [x] 7. 实现文件生成和模板处理
  - [x] 7.1 实现模板文件复制逻辑
    - 实现 write 函数：处理文件写入和特殊文件
    - 实现 package.json 更新逻辑
    - 实现 index.html 标题更新逻辑
    - 实现文件重命名逻辑
    - pnpm test全部通过
    - _Requirements: 3.6, 4.1, 4.2, 4.3, 4.4_

  - [x] 7.2 编写文件生成的属性测试
    - **Property 7: 文件重命名一致性**
    - **Property 8: 目录结构保持性**
    - **Property 9: package.json 名称替换正确性**
    - **Property 10: index.html 标题更新正确性**
    - pnpm test全部通过
    - **Validates: Requirements 3.6, 4.1, 4.2, 4.3, 4.4**

- [ ] 8. 实现命令执行功能
  - [ ] 8.1 实现外部命令执行函数
    - 实现 run 函数：使用 cross-spawn 执行命令
    - 实现 install 函数：安装依赖
    - 实现 start 函数：启动开发服务器
    - 添加测试环境检测和跳过逻辑
    - pnpm test全部通过
    - _Requirements: 5.3, 5.4, 5.5, 6.1, 6.2, 6.3_

  - [ ] 8.2 编写命令执行的单元测试
    - 测试命令执行成功和失败场景
    - 测试测试环境下的跳过逻辑
    - pnpm test全部通过
    - _Requirements: 5.4, 5.5, 6.3_

- [ ] 9. 实现主初始化流程
  - [ ] 9.1 实现 init 函数的核心逻辑
    - 整合参数解析、模式检测、交互提示
    - 实现目录创建和模板复制流程
    - 实现依赖安装和服务器启动流程
    - 实现完成消息显示
    - _Requirements: 1.1, 7.1, 7.2, 7.3, 7.4_

  - [ ] 9.2 编写主流程的集成测试
    - 测试完整的项目创建流程
    - 测试不同模式和参数组合
    - _Requirements: 1.1, 4.1, 7.4_
  - [ ] pnpm test全部通过

- [ ] 10. 实现错误处理和用户反馈
  - [ ] 10.1 添加错误处理逻辑
    - 实现命令执行错误处理
    - 实现文件系统错误处理
    - 实现用户取消操作处理
    - 实现无效模板处理
    - _Requirements: 3.3, 8.1, 8.2, 8.3, 8.4_

  - [ ] 10.2 编写错误处理的属性测试
    - **Property 13: 错误处理一致性**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**

  - [ ] 10.3 实现用户反馈消息
    - 添加项目创建进度消息
    - 添加依赖安装消息
    - 添加服务器启动消息
    - 添加完成后的后续步骤说明
    - 添加 AI 代理环境提示
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  - [ ] pnpm test全部通过

- [ ] 11. 实现非交互模式支持
  - [ ] 11.1 完善非交互模式逻辑
    - 实现默认值应用逻辑
    - 实现非交互模式下的错误处理
    - 实现目录冲突的非交互处理
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ] 11.2 编写非交互模式的属性测试
    - **Property 14: 非交互模式默认值正确性**
    - **Validates: Requirements 10.2, 10.3**

  - [ ] pnpm test全部通过
- [ ] 12. Checkpoint - 核心功能验证
  - 运行所有测试确保通过
  - 手动测试交互模式和非交互模式
  - 验证错误处理是否正常工作
  - 如有问题请向用户反馈
  - [ ] pnpm test全部通过

- [ ] 13. 创建项目模板
  - [ ] 13.1 创建 Vanilla 模板
    - 创建 template-vanilla 目录结构
    - 创建 template-vanilla-ts 目录结构
    - 添加 Rolldown 配置文件
    - 添加示例代码和样式
    - _Requirements: 3.1, 3.4, 3.5, 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ] 13.2 创建 Vue 模板
    - 创建 template-vue 目录结构
    - 创建 template-vue-ts 目录结构
    - 添加 Vue 相关配置和示例代码
    - _Requirements: 3.1, 3.4, 3.5, 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ] 13.3 创建 React 模板
    - 创建 template-react 目录结构
    - 创建 template-react-ts 目录结构
    - 添加 React 相关配置和示例代码
    - _Requirements: 3.1, 3.4, 3.5, 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ] 13.4 创建 Svelte 模板
    - 创建 template-svelte 目录结构
    - 创建 template-svelte-ts 目录结构
    - 添加 Svelte 相关配置和示例代码
    - _Requirements: 3.1, 3.4, 3.5, 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ] 13.5 创建 Solid 模板
    - 创建 template-solid 目录结构
    - 创建 template-solid-ts 目录结构
    - 添加 Solid 相关配置和示例代码
    - _Requirements: 3.1, 3.4, 3.5, 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ] 13.6 创建 Qwik 模板
    - 创建 template-qwik 目录结构
    - 创建 template-qwik-ts 目录结构
    - 添加 Qwik 相关配置和示例代码
    - _Requirements: 3.1, 3.4, 3.5, 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ] 13.7 编写模板验证的属性测试
    - **Property 5: 模板完整性**
    - **Property 6: 框架变体对称性**
    - **Validates: Requirements 3.2, 3.4, 9.1, 9.2, 9.3, 9.4, 9.5**

- [ ] 14. 完善文档和配置
  - 创建项目 README.md，说明使用方法
  - 创建 LICENSE 文件
  - 创建 CHANGELOG.md
  - 添加 .gitignore 文件
  - 验证 package.json 的发布配置
  - _Requirements: 9.5_

- [ ] 15. 最终测试和验证
  - [ ] 15.1 运行完整的测试套件
    - 运行所有单元测试
    - 运行所有属性测试
    - 验证测试覆盖率 >80%
    - _Requirements: All_

  - [ ] 15.2 端到端测试
    - 测试所有模板的项目创建
    - 测试不同包管理器的使用
    - 测试交互模式和非交互模式
    - 测试错误场景和边缘情况
    - _Requirements: All_

  - [ ] 15.3 性能和安全验证
    - 验证大文件复制性能
    - 验证路径安全性
    - 验证输入验证的完整性
    - _Requirements: 8.1, 8.2_

- [ ] 16. Final Checkpoint - 项目完成验证
  - 确保所有测试通过
  - 确保文档完整
  - 确保代码质量符合标准
  - 准备发布到 npm
  - 如有问题请向用户反馈

## Notes

- 所有测试任务都是必需的，确保从一开始就有全面的测试覆盖
- 每个任务都引用了具体的需求编号以便追溯
- Checkpoint 任务确保增量验证
- 属性测试验证通用正确性属性
- 单元测试验证特定示例和边缘情况
- 模板创建可以并行进行
- 建议先完成核心功能再创建所有模板
