# claudeSandBox

> 🛡️ 专为安全研究和复杂项目设计的 Claude Code 沙箱环境 - v2.0.0 配置驱动流程编排

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude-Code-4.6-purple.svg)](https://claude.com/claude-code)
[![Version](https://img.shields.io/badge/version-2.0.0-green.svg)](CHANGELOG.md)

## 📖 简介

claudeSandBox 是一个基于 Docker 的隔离开发环境，预配置了 Claude Code CLI 和专为安全研究优化的多 Agent 团队架构。采用配置驱动的流程编排系统，实现工程化的任务管理、状态追踪和质量保证。

## ✨ 核心特性

### 🎯 配置驱动的流程编排（v2.0.0 新增）

- **6 个执行阶段**：Planning → Task Init → Git Prepare → Mode Execution → Quality Gate → Completion
- **任务生命周期管理**：pending → running → completed/failed/cancelled/paused
- **状态持久化**：所有状态保存在文件中，支持崩溃恢复
- **Git 分支管理**：每个任务独立分支，支持失败回滚
- **任务依赖管理**：支持任务间依赖，自动触发和等待
- **子任务管理**：支持主任务拆解为子任务，拓扑序执行
- **质量门禁**：静态分析、安全扫描、自动测试

### 🤖 多 Agent 团队

#### 前置规划（1 个 Agent）
- 📋 **task-planner**：任务拆解、依赖识别、模式选择、资源规划

#### 分析层（3 个 Agents）
- 📊 **product-manager**：需求与业务目标分析
- 🔧 **backend-engineer**：系统结构与后端分析
- 🎨 **frontend-engineer**：前端与用户界面分析

#### 执行层（1 个 Coder Agent）
- 💻 **dev-coder**：所有代码开发（前端、后端、全栈、API、组件、数据库）

#### 质量层（1 个 Agent）
- 🛡️ **security-tester**：安全测试、漏洞扫描、质量验证

### 🧠 Knowledge 共享知识库

- 📚 **patterns.md**：系统性失败模式（状态、边界、信任、时间、资源、组合）
- 🌐 **domains.md**：统一安全问题空间（入侵链、漏洞分类、控制基线）
- 🔧 **tools.md**：工具视角认知（选用决策、能力边界、组合工作流）
- ❌ **corrections.md**：错误学习库（22 个预填充模式）

### 🎨 双模式决策系统

```
用户输入 → MODE DECISION
                ↓
    多文件操作 OR 代码分析 OR 不确定 → 标准模式（默认）
                ↓
    架构级任务 + 明确请求 + 环境变量 → 完整模式
```

**标准模式**（轻量级）：
- 可选 task-planner 预规划
- 1-2 个分析 agents + 1 个执行 agent
- 简洁报告（≤500 行）
- 适用于：项目分析、功能实现、代码审查

**完整模式**（重量级）：
- 强制 task-planner 预规划
- 6 个执行阶段（Planning → Init → Git → Execution → Quality → Completion）
- 详细状态追踪、日志记录、Git 分支管理
- 适用于：架构级任务、需要完整流程的大型项目

## 🚀 快速开始

### 前置要求

- Docker
- Docker Compose（可选）

### 配置代理

**重要**：修改 Dockerfile 中的代理地址

```dockerfile
ARG PROXY_HOST=host.docker.internal
ARG PROXY_PORT=1087
```

改为你的代理地址！

### 构建镜像

#### 选择版本

```
claudeSandBox/
├── claudeCode-none/      # 无 LSP 服务（推荐）
│   ├── claude_arm64/      # ARM64 架构
│   └── claude_x64/        # x64 架构
└── claudeCode-lsp/        # 带 LSP 服务
    ├── claude_arm64/
    └── claude_x64/
```

#### 构建命令

```bash
# 推荐：none 版本 + ARM64
cd claudeCode-none/claude_arm64
docker build -t claude-sandbox:latest .

# 或使用 x64
cd claudeCode-none/claude_x64
docker build -t claude-sandbox:latest .
```

### 启动容器

```bash
docker run -it --rm \
  -v $(pwd)/workspace:/workspace \
  claude-sandbox:latest
```

## 🛠️ ArvinENV 工具集

容器内预配置了便捷管理工具：

### 命令列表

```bash
config              # 查看所有配置信息
key -k <token>      # 修改 API Token
key -u <url>        # 修改 Base URL
key -m <model>      # 修改 Model
key -k <token> -u <url> -m <model>  # 同时修改
rms                 # 清理配置和缓存
```

### 使用示例

```bash
# 查看当前配置
config

# 更新 Token
key "sk-ant-xxxxx"

# 更新 Base URL
key -u "https://api.anthropic.com"

# 清理缓存
rms
```

## 📖 使用场景

### 1. 漏洞分析（标准模式）

```
你：这个登录接口有没有越权风险？

Claude：[MODE DECISION: 标准模式]
- 启动 backend-engineer 分析后端逻辑
- 启动 security-tester 识别安全风险
- 输出分析报告（≤500 行）
```

### 2. PoC 开发（标准模式）

```
你：帮我写一个利用这个漏洞的 PoC

Claude：[MODE DECISION: 标准模式]
- 先分析漏洞原理
- 启动 dev-coder 编写 PoC
- 输出可运行的 PoC 代码
```

### 3. 项目分析（标准模式）

```
你：帮我分析这个项目的架构

Claude：[MODE DECISION: 标准模式]
- 启动 task-planner 规划分析任务
- 并行启动 backend-engineer + frontend-engineer
- 输出架构分析报告
```

### 4. 复杂系统开发（完整模式）

```
你：完整实现一个用户系统（需要设置 CLAUDE_FULL_MODE=1）

Claude：[MODE DECISION: 完整模式]
- Stage 00: task-planner 规划任务
- Stage 01: 创建任务状态文件
- Stage 02: 创建 Git 分支 task-xxx
- Stage 03: 启动 agents（backend + frontend + dev-coder）
- Stage 04: 质量门禁（静态分析 + 安全扫描 + 测试）
- Stage 05: 合并分支，生成执行报告
```

## 📚 项目结构

```
claudeSandBox/
├── claudeCode-none/          # 无 LSP 版本（推荐）
│   ├── claude_arm64/
│   │   ├── Dockerfile
│   │   └── workspace/
│   │       ├── CLAUDE.md            # 主配置文件（唯一入口）
│   │       ├── .claude/
│   │       │   ├── PROTOCOL.md          # 协议声明
│   │       │   ├── workflow/            # 流程编排配置
│   │       │   │   ├── standard-mode.md # 标准模式流程
│   │       │   │   ├── full-mode.md     # 完整模式流程
│   │       │   │   ├── stages/          # 各阶段配置
│   │       │   │   │   ├── 00-planning.md
│   │       │   │   │   ├── 01-task-init.md
│   │       │   │   │   ├── 02-git-prepare.md
│   │       │   │   │   ├── 03-mode-execution.md
│   │       │   │   │   ├── 04-quality-gate.md
│   │       │   │   │   ├── 05-completion.md
│   │       │   │   │   └── templates/   # 模板文件
│   │       │   │   │       ├── task-state.json
│   │       │   │   │       ├── subtask-state.json
│   │       │   │   │       └── research-ledger.md
│   │       │   │   └── agents/          # 6 个 agent 定义
│   │       │   │       ├── task-planner.md
│   │       │   │       ├── product-manager.md
│   │       │   │       ├── backend-engineer.md
│   │       │   │       ├── frontend-engineer.md
│   │       │   │       ├── dev-coder.md
│   │       │   │       └── security-tester.md
│   │       │   ├── agent-memory/        # Agent 持久记忆
│   │       │   │   ├── task-planner/
│   │       │   │   ├── product-manager/
│   │       │   │   ├── backend-engineer/
│   │       │   │   ├── frontend-engineer/
│   │       │   │   ├── dev-coder/
│   │       │   │   └── security-tester/
│   │       │   ├── task_logs/           # 执行日志
│   │       │   ├── task_states/         # 任务状态文件
│   │       │   ├── task_plans/          # 任务规划存储
│   │       │   ├── subtask_queues/      # 子任务队列存储
│   │       │   └── task_reports/        # 执行报告
│   │       └── knowledge/               # 共享知识库
│   │           ├── patterns.md
│   │           ├── domains.md
│   │           ├── tools.md
│   │           └── corrections.md
│   └── claude_x64/
└── claudeCode-lsp/            # 带 LSP 版本
    ├── claude_arm64/
    └── claude_x64/
```

## 🔧 高级配置

### 环境变量

```bash
# 代理设置
HTTP_PROXY=http://host.docker.internal:1087
HTTPS_PROXY=http://host.docker.internal:1087

# Claude API
ANTHROPIC_AUTH_TOKEN=sk-ant-xxxxx
ANTHROPIC_BASE_URL=https://api.anthropic.com
```

### 挂载卷

```bash
docker run -it --rm \
  -v $(pwd)/workspace:/workspace \
  -v ~/.claude:/root/.claude \
  claude-sandbox:latest
```

## 📝 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解详细更新历史。

### 最新更新（v2.0.0 - 2026-03-15）

- 🎯 **配置驱动的流程编排**：6 个执行阶段，每个阶段独立配置文件
- 📋 **task-planner 前置规划**：负责任务拆解、依赖识别、模式选择
- 🔄 **任务生命周期管理**：完整的状态机，支持状态持久化和崩溃恢复
- 🌿 **Git 分支管理**：每个任务独立分支，支持失败回滚
- ✅ **质量门禁**：静态分析、安全扫描、自动测试，最多 3 次修复尝试
- 🎭 **双模式系统**：标准模式（轻量）+ 完整模式（重量）
- 📜 **协议声明**：明确系统性质和强制协议
- 🚫 **移除快速模式**：简化为双模式架构
- 🧠 **Agent 持久记忆**：6 个 agent 各自拥有独立的记忆目录

## 🎓 核心原则

1. **唯一真理源**：CLAUDE.md 是唯一入口
2. **显式引用**：所有 `.claude/` 目录下的文件必须显式读取
3. **状态驱动**：状态只能来自文件，支持崩溃恢复
4. **严格顺序**：agents 顺序执行，不并发
5. **保守策略**：任何不确定情况默认进入标准模式

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [Claude Code 官方文档](https://claude.com/claude-code)
- [Claude API 文档](https://docs.anthropic.com/)
- [Docker 官方文档](https://docs.docker.com/)

---

**提示**：
- 推荐使用 `claudeCode-none` 版本，性能更好且更稳定
- v2.0.0 采用配置驱动架构，双模式系统（标准模式 + 完整模式）
- 完整模式需要设置环境变量 `CLAUDE_FULL_MODE=1`
- 确保 Git 已正确配置，以便完整模式的任务分支管理正常工作
