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
- 📋 **task-planner**：任务拆解、优先级排序、依赖识别、模式选择（独立于 Analysis Mode）

#### 分析层（4 个 Agents）
- 📊 **product-manager**：需求与业务目标分析
- 🔧 **backend-engineer**：系统结构与状态机分析
- 🎨 **frontend-engineer**：输入面与攻击面分析
- 🛡️ **security-tester**：攻击路径与漏洞分析

#### 执行层（2 个 Coder Agents）
- 💻 **dev-coder**：所有代码开发（前端、后端、全栈、API、组件、数据库）
- 🔓 **script-coder**：安全脚本（PoC、Exploit、Fuzzer、扫描工具）

#### 支持层（1 个 Agent）
- ⚙️ **ops-engineer**：环境配置、工具安装、系统调试、依赖管理

### 🧠 Knowledge 共享知识库

- 📚 **patterns.md**：系统性失败模式（状态、边界、信任、时间、资源、组合）
- 🌐 **domains.md**：统一安全问题空间（入侵链、漏洞分类、控制基线）
- 🔧 **tools.md**：工具视角认知（选用决策、能力边界、组合工作流）
- ❌ **corrections.md**：错误学习库（22 个预填充模式）

### 🎨 意图识别决策

```
用户输入 → task-planner（前置规划）→ 模式选择
                                        ↓
                          明确跳过 + 极简任务 → Coding Mode
                          其他所有情况（默认） → Analysis Mode
```

### 🔄 分级调度

| 任务类型 | Agent 数量 | 组成 |
|---------|-----------|------|
| **简单任务** | 4 个 | product-manager + 3个核心专家 |
| **标准任务** | 4 个 | product-manager + backend-engineer + 2个专家 |
| **深度任务** | 4 个 | 全部分析层 agents |

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

### 1. 漏洞分析

```
你：这个登录接口有没有越权风险？

Claude：[task-planner 规划 → Analysis Mode]
- 并行调度 4 个分析层 agents
- 输出 Research Ledger
- 标记风险点和攻击路径
```

### 2. PoC 开发

```
你：帮我写一个利用这个漏洞的 PoC

Claude：[task-planner 规划 → Analysis Mode 分析漏洞]
[完成后切换到 Coding Mode]
- 拆解为子任务
- 按拓扑序执行子任务
- 输出可运行的 PoC 代码
```

### 3. 设计评审

```
你：这个流程设计合理吗？

Claude：[task-planner 规划 → Analysis Mode]
- 从 4 个不同角色分析
- 识别潜在问题
- 提供改进建议
```

### 4. 快速实现

```
你：直接写个 hello world

Claude：[识别为简单任务，进入 Coding Mode]
- 调用相应 coder agent
- 直接输出代码
```

### 5. 复杂系统开发（v2.0.0 新增）

```
你：帮我实现一个用户系统

Claude：[task-planner 规划 → 拆解为子任务]
[创建任务分支 → 按子任务执行]
- 子任务 1：设计数据库
- 子任务 2：实现 API
- 子任务 3：实现前端
- 子任务 4：编写测试
[质量门禁 → 合并到主分支]
```

## 📚 项目结构

```
claudeSandBox/
├── claudeCode-none/          # 无 LSP 版本（推荐）
│   ├── claude_arm64/
│   │   ├── Dockerfile
│   │   └── workspace/
│   │       ├── CLAUDE.md            # 主配置文件（流程引擎）
│   │       ├── .claude/
│   │       │   ├── PROTOCOL.md          # 协议声明（新增）
│   │       │   ├── workflow/            # 流程编排配置（新增）
│   │       │   │   ├── config.yaml     # 主流程配置
│   │       │   │   ├── stages/         # 各阶段详细配置
│   │       │   │   │   ├── 00-planning.md
│   │       │   │   │   ├── 01-task-init.md
│   │       │   │   │   ├── 02-git-prepare.md
│   │       │   │   │   ├── 03-mode-execution.md
│   │       │   │   │   ├── 04-quality-gate.md
│   │       │   │   │   ├── 05-completion.md
│   │       │   │   │   └── templates/   # 模板文件
│   │       │   │   ├── agents/          # 8 个 agent 定义
│   │       │   │   ├── task_queue.json  # 任务队列（新增）
│   │       │   │   ├── task_states/     # 任务状态存储（新增）
│   │       │   │   ├── task_plans/      # 任务规划存储（新增）
│   │       │   │   ├── subtask_queues/  # 子任务队列存储（新增）
│   │       │   │   ├── task_dependencies.json  # 任务依赖（新增）
│   │       │   │   ├── execution_logs/  # 执行日志（新增）
│   │       │   │   ├── agent-memory/    # Agent 记忆目录
│   │       │   │   └── settings.local.json
│   │       └── knowledge/           # 共享知识库
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

- 🎯 **配置驱动的流程编排**：6 个执行阶段，每个阶段独立配置
- 📋 **task-planner 前置规划**：独立于 Analysis Mode，负责任务拆解和模式选择
- 🔄 **任务生命周期管理**：完整的状态机，支持状态持久化
- 🌿 **Git 分支管理**：每个任务独立分支，支持失败回滚
- 🔗 **任务依赖管理**：支持任务间依赖，自动触发和等待
- 📦 **子任务管理**：支持主任务拆解为子任务，拓扑序执行
- ✅ **质量门禁**：静态分析、安全扫描、自动测试
- 🚫 **移除 qa-engineer**：分析层从 6 个减少到 4 个
- 📜 **协议声明**：明确系统性质和强制协议

## 🎓 核心原则

1. **唯一真理源**：CLAUDE.md 是唯一入口
2. **显式引用**：所有文件必须显式读取
3. **状态驱动**：状态只能来自文件
4. **严格顺序**：按照配置执行

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
- v2.0.0 采用配置驱动架构，需要显式引用所有配置文件
- 确保 Git 已正确配置，以便任务分支管理正常工作
