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
- 3 阶段并发执行（task-planner → 分析类 agents 并发 → dev-coder）
- Agent 超时：600 秒
- 简洁报告（≤500 行）
- 适用于：项目分析、功能实现、代码审查

**完整模式**（重量级）：
- 强制 task-planner 预规划
- 6 个执行阶段（Planning → Init → Git → Execution → Quality → Completion）
- 3 阶段并发执行（task-planner → 分析类 agents 并发 → dev-coder）
- Agent 超时：600 秒
- 详细状态追踪、日志记录、Git 分支管理
- 完整验证闭环（类似问题检查 + 回归检查 + 完整性检查）
- 适用于：架构级任务、需要完整流程的大型项目

---

## ⚙️ 完整模式开启指南

### 如何开启完整模式？

有 **3 种方式**可以开启完整模式：

#### 方式 1：使用 mode 命令（推荐）

在容器内使用 `mode` 命令切换模式：

```bash
# 在容器内执行
mode full

# 输出：
# ✓ Mode switched to: 完整
# ✓ CLAUDE_FULL_MODE set to: 1
# ✓ Please restart the container to apply changes

# 重启容器使配置生效
exit  # 退出容器
docker restart <container-id>  # 重启容器
```

**优点**：
- 简单直接，一条命令即可
- 持久化保存，重启后依然有效
- 不需要修改 Dockerfile 或 docker-compose.yml

#### 方式 2：环境变量设置

```bash
# 在 docker run 时设置
docker run -it --rm \
  -v $(pwd)/workspace:/workspace \
  -e CLAUDE_FULL_MODE=1 \
  claude-sandbox:latest

# 在 docker-compose.yml 中设置
services:
  claude-sandbox:
    environment:
      - CLAUDE_FULL_MODE=1
```

#### 方式 3：在 Dockerfile 中设置

```dockerfile
# 在 Dockerfile 中添加
ENV CLAUDE_FULL_MODE=1
```

**然后重新构建镜像**：
```bash
docker build -t claude-sandbox:latest .
```

**验证是否开启**：

```bash
# 在容器内执行 mode 命令查看当前模式
mode
# 输出示例：
# Current mode: standard
# CLAUDE_FULL_MODE: 0
```

**判断标准**：
- ✅ **已开启**：`CLAUDE_FULL_MODE: 1`，系统会输出 "MODE DECISION: Selected mode: 完整"
- ❌ **未开启**：`CLAUDE_FULL_MODE: 0` 或未设置，系统会输出 "MODE DECISION: Selected mode: 标准"

**如果未开启，快速启用**：

```bash
# 在容器内执行（推荐方式）
mode full

# 重启容器使配置生效
exit
docker restart <container-id>

# 重新进入容器
docker run -it --rm -v $(pwd)/workspace:/workspace claude-sandbox:latest

# 验证已开启
mode
# 输出：CLAUDE_FULL_MODE: 1
```

### 模式对比表

| 特性 | 标准模式 | 完整模式 |
|------|----------|----------|
| **触发条件** | 默认模式 | 需要设置 `CLAUDE_FULL_MODE=1` |
| **Task Planner** | 可选 | 强制执行 |
| **Agent 执行** | 3 阶段并发（可选 task-planner → 分析类并发 → dev-coder） | 6 个完整阶段 + 3 阶段并发 |
| **并发策略** | 支持阶段内并发 | 支持阶段内并发 |
| **Agent 超时** | 600 秒 | 600 秒 |
| **状态追踪** | 无 | 完整状态文件 + 日志 |
| **Git 分支** | 不创建 | 自动创建任务分支 |
| **质量门禁** | 可选 | 强制执行（静态分析 + 安全扫描 + 测试）|
| **修复循环** | 建议 | 最多 3 次自动修复尝试 + 完整验证闭环 |
| **执行报告** | 简洁报告（≤500 行） | 详细执行报告 |
| **崩溃恢复** | 不支持 | 支持中断恢复 |
| **适用场景** | 日常任务 | 大型项目 |

### 标准模式 vs 完整模式：执行流程对比

**标准模式执行流程**：
```
用户输入
    ↓
MODE DECISION → 标准模式
    ↓
可选 task-planner（Stage 1）
    ↓
并发启动 agents（Stage 2: 分析类 agents 并发 → Stage 3: 执行类 agent）
    ↓
输出简洁报告（≤500 行）
    ↓
完成
```

**完整模式执行流程**：
```
用户输入
    ↓
MODE DECISION → 完整模式（✓ CLAUDE_FULL_MODE=1）
    ↓
Stage 00: Planning（task-planner 规划任务）
    ↓
Stage 01: Task Init（创建状态文件和日志）
    ↓
Stage 02: Git Prepare（创建任务分支 task-xxx）
    ↓
Stage 03: Mode Execution（读取知识库 + 启动 agents）
    ↓
Stage 04: Quality Gate（静态分析 + 安全扫描 + 测试）
    ↓
Stage 05: Completion（合并分支 + 生成执行报告）
    ↓
完成（详细执行报告）
```

### 何时使用完整模式？

**✅ 应该使用完整模式**：
- 实现完整功能模块（如：用户系统、订单系统）
- 需要代码质量保证（静态分析、安全扫描）
- 需要可追溯的执行记录
- 需要版本控制和回滚能力
- 大型重构或架构变更

**❌ 不应该使用完整模式**：
- 简单问题分析
- 单个 bug 修复
- 快速代码查看
- 概念验证（PoC）
- 小型代码调整

### 完整模式要求清单

使用完整模式前，请确保：
- [ ] 已设置环境变量 `CLAUDE_FULL_MODE=1`
- [ ] Git 已正确配置
- [ ] 有足够的磁盘空间（用于日志和状态文件）
- [ ] 任务确实是架构级或大型项目
- [ ] 用户明确说"完整实现"或"完整分析"

---

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

容器内预配置了便捷管理工具，用于快速配置和管理 Claude Code 环境。

### 命令列表

```bash
config              # 查看所有配置信息（Token、URL、Model、代理等）
mode                # 查看当前模式
mode <模式>         # 切换模式（standard/full）
key -k <token>      # 修改 API Token
key -u <url>        # 修改 Base URL
key -m <model>      # 修改 Model
key -k <token> -u <url> -m <model>  # 同时修改多个配置
rms                 # 清理配置和缓存
```

### 配置文件位置

所有配置保存在容器内的 `~/.claude/` 目录：
- `config.json` - Claude Code 配置文件
- `api_key` - API Token 存储
- `settings.json` - 用户设置
- `cache/` - 缓存目录

### 使用示例

```bash
# 查看当前配置
config
# 输出：
# API Token: sk-ant-xxxxx
# Base URL: https://api.anthropic.com
# Model: claude-sonnet-4-6
# HTTP Proxy: http://host.docker.internal:1087
# Execution Mode: standard

# 查看当前模式
mode
# 输出：
# Current mode: standard
# CLAUDE_FULL_MODE: 0

# 切换到完整模式
mode full
# 输出：
# Mode switched to: full
# CLAUDE_FULL_MODE: 1
# 重启容器后生效

# 切换到标准模式
mode standard
# 输出：
# Mode switched to: standard
# CLAUDE_FULL_MODE: 0
# 重启容器后生效

# 更新 Token
key "sk-ant-xxxxx"

# 更新 Base URL（支持第三方 API）
key -u "https://api.anthropic.com"

# 更新 Model
key -m "claude-sonnet-4-6"

# 同时更新多个配置
key -k "sk-ant-xxxxx" -u "https://api.anthropic.com" -m "claude-sonnet-4-6"

# 清理缓存和配置（重置为默认）
rms
```

### 环境变量配置

除了使用命令工具，也可以通过环境变量配置：

```bash
# 在 docker run 时设置
docker run -it --rm \
  -e ANTHROPIC_AUTH_TOKEN="sk-ant-xxxxx" \
  -e ANTHROPIC_BASE_URL="https://api.anthropic.com" \
  -e CLAUDE_DEFAULT_MODEL="claude-sonnet-4-6" \
  -e CLAUDE_FULL_MODE=1 \
  claude-sandbox:latest

# 在 docker-compose.yml 中设置
services:
  claude-sandbox:
    environment:
      - ANTHROPIC_AUTH_TOKEN=sk-ant-xxxxx
      - ANTHROPIC_BASE_URL=https://api.anthropic.com
      - CLAUDE_DEFAULT_MODEL=claude-sonnet-4-6
      - CLAUDE_FULL_MODE=1
```

**模式设置方式对比**：

| 方式 | 命令 | 生效时间 | 持久性 |
|------|------|---------|--------|
| **mode 命令** | `mode full` | 重启容器后 | 持久（写入配置） |
| **环境变量** | `CLAUDE_FULL_MODE=1` | 容器启动时 | 仅当前容器 |
| **Dockerfile** | `ENV CLAUDE_FULL_MODE=1` | 构建时 | 永久（镜像级别） |

### 代理配置

Claude Code 支持通过环境变量配置代理：

```bash
# HTTP 代理
export HTTP_PROXY=http://host.docker.internal:1087
export HTTPS_PROXY=http://host.docker.internal:1087

# 或在 docker run 时设置
docker run -it --rm \
  -e HTTP_PROXY=http://host.docker.internal:1087 \
  -e HTTPS_PROXY=http://host.docker.internal:1087 \
  claude-sandbox:latest
```

### 模式管理

**mode 命令**用于查看和切换执行模式（标准模式/完整模式）：

```bash
# 查看当前模式
mode
# 输出示例：
# MODE DECISION: Current mode is [标准]
# CLAUDE_FULL_MODE: 0
# Config file: /root/.claude/mode.json

# 切换到完整模式
mode full
# 输出：
# ✓ Mode switched to: 完整
# ✓ CLAUDE_FULL_MODE set to: 1
# ✓ Please restart the container to apply changes
# 提示：使用 docker restart <container> 重启容器

# 切换到标准模式
mode standard
# 输出：
# ✓ Mode switched to: 标准
# ✓ CLAUDE_FULL_MODE set to: 0
# ✓ Please restart the container to apply changes

# 查看模式帮助
mode help
```

**模式说明**：

| 模式 | 说明 | 适用场景 |
|------|------|---------|
| **standard** | 标准模式（默认） | 日常任务、项目分析、功能实现 |
| **full** | 完整模式 | 大型项目、架构级任务、需要完整流程 |

**注意事项**：
- 切换模式后需要重启容器才能生效
- 完整模式需要设置 `CLAUDE_FULL_MODE=1`
- 标准模式是默认模式，无需特殊配置

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
- 启动 task-planner 规划分析任务（Stage 1）
- 并发启动 backend-engineer + frontend-engineer（Stage 2）
- 输出架构分析报告
```

### 4. 复杂系统开发（完整模式）

**前置准备**：
```bash
# 在容器内开启完整模式
mode full
# 重启容器
exit
docker restart <container-id>
```

**执行流程**：
```
你：完整实现一个用户系统

Claude：[MODE DECISION: 完整模式]
- Stage 00: Planning（task-planner 规划任务）
- Stage 01: Task Init（创建任务状态文件）
- Stage 02: Git Prepare（创建任务分支 task-xxx）
- Stage 03: Mode Execution（并发启动 agents：分析类 → dev-coder）
- Stage 04: Quality Gate（质量门禁 + 完整验证闭环）
- Stage 05: Completion（合并分支 + 生成执行报告）
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

## 🧰 预装工具集

容器内预装了常用的安全研究和开发工具，开箱即用。

### 开发工具

| 工具 | 说明 | 用途 |
|------|------|------|
| **git** | 版本控制 | 代码管理、分支操作 |
| **vim / nano** | 文本编辑器 | 快速编辑配置文件 |
| **curl / wget** | 网络工具 | 下载文件、API 测试 |
| **jq** | JSON 处理 | JSON 数据解析和格式化 |
| **ripgrep (rg)** | 快速搜索 | 代码搜索和内容查找 |
| **fd** | 快速文件查找 | 文件名搜索 |
| **bat** | 增强版 cat | 代码高亮显示 |
| **htop / btop** | 系统监控 | 资源使用情况查看 |

### 编程语言环境

| 语言 | 版本 | 说明 |
|------|------|------|
| **Python 3** | 最新版 | 脚本编写、安全工具开发 |
| **Node.js** | LTS | JavaScript/TypeScript 开发 |
| **Bun** | 最新版 | 快速 JavaScript 运行时 |
| **Go** | 最新版 | 高性能工具开发 |

### Claude Code CLI

- **claude** - Claude Code 命令行工具
- 支持交互式对话和代码生成
- 集成多 Agent 协作系统
- 配置驱动的流程编排

### 使用示例

```bash
# 搜索代码
rg "TODO" --type py

# 查找文件
fd "Dockerfile"

# 查看系统资源
htop

# JSON 数据处理
curl -s https://api.github.com/repos/anthropics/claude-code | jq '.description'

# Python 脚本
python3 -c "import anthropic; print('Claude SDK ready')"

# Node.js 开发
node --version
npm install

# Go 工具编译
go version
go build -o mytool main.go
```

### 工具更新

容器内的工具可以通过包管理器更新：

```bash
# 更新系统包
apt update && apt upgrade -y

# 安装新的 Python 包
pip install <package-name>

# 安装新的 Node.js 包
npm install -g <package-name>

# 安装 Go 工具
go install <package-path>@latest
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
- ⚡ **并发 Agent 执行**：支持阶段内并发，提升执行效率
- ⏱️ **Agent 超时调整**：从 120 秒调整为 600 秒
- 📜 **协议声明**：明确系统性质和强制协议
- 🚫 **移除快速模式**：简化为双模式架构
- 🧠 **Agent 持久记忆**：6 个 agent 各自拥有独立的记忆目录
- 🔍 **完整验证闭环**：修复后验证类似问题、回归检查、完整性检查

## 🎓 核心原则

1. **唯一真理源**：CLAUDE.md 是唯一入口
2. **显式引用**：所有 `.claude/` 目录下的文件必须显式读取
3. **状态驱动**：状态只能来自文件，支持崩溃恢复
4. **支持阶段内并发**：
   - Stage 1: task-planner（必须最先执行）
   - Stage 2: 分析类 agents 并发（product-manager + backend-engineer + frontend-engineer + security-tester）
   - Stage 3: 执行类 agent（dev-coder，等分析完成）
5. **保守策略**：任何不确定情况默认进入标准模式
6. **Agent 超时**：600 秒（10 分钟）

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
- **推荐使用 `mode` 命令开启完整模式**（无需修改环境变量或 Dockerfile）
- 如果 `CLAUDE_FULL_MODE` 未设置，请在容器内执行 `mode full` 然后重启容器
- 确保 Git 已正确配置，以便完整模式的任务分支管理正常工作
