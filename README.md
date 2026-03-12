# claudeSandBox

> 🛡️ 专为安全研究和复杂项目设计的 Claude Code 沙箱环境

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude-Code-4.6-purple.svg)](https://claude.com/claude-code)

## 📖 简介

claudeSandBox 是一个基于 Docker 的隔离开发环境，预配置了 Claude Code CLI 和专为安全研究优化的多 Agent 团队架构。无论是漏洞分析、安全工具开发，还是复杂系统设计，都能提供强大的支持。

## ✨ 核心特性

### 🎯 双模式调度架构

- **Analysis Mode（默认）**：智能意图识别，自动分析任务复杂度
- **Coding Mode（执行模式）**：明确条件触发，持续调用执行层 agents

### 🤖 多 Agent 团队

#### 分析层（6 个 Agents）
- 📋 **task-planner**：任务拆解、优先级排序、依赖识别、资源规划
- 📊 **product-manager**：需求与业务目标分析
- 🔧 **backend-engineer**：系统结构与状态机分析
- 🎨 **frontend-engineer**：输入面与攻击面分析
- 🧪 **qa-engineer**：失败路径与边界场景分析
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
- ❌ **corrections.md**：错误学习库（15 个预填充模式）

### 🎨 意图识别决策

```
用户输入 → 意图识别 → 判断任务复杂度
                        ↓
          明确跳过 + 极简任务 → Coding Mode
          其他所有情况（默认） → Analysis Mode
```

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
key -k <token> -u <url>  # 同时修改
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

Claude：[自动进入 Analysis Mode]
- 并行调度 5 个分析层 agents
- 输出 Research Ledger
- 标记风险点和攻击路径
```

### 2. PoC 开发

```
你：帮我写一个利用这个漏洞的 PoC

Claude：[Analysis Mode 分析漏洞]
[完成后切换到 Coding Mode]
- 调用 script-coder
- 输出可运行的 PoC 代码
```

### 3. 设计评审

```
你：这个流程设计合理吗？

Claude：[自动进入 Analysis Mode]
- 从 5 个不同角色分析
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

## 📚 项目结构

```
claudeSandBox/
├── claudeCode-none/          # 无 LSP 版本（推荐）
│   ├── claude_arm64/
│   │   ├── Dockerfile
│   │   └── workspace/
│   │       ├── .claude/
│   │       │   ├── agents/          # 9 个 agent 定义
│   │       │   └── agent-memory/    # Agent 记忆目录
│   │       ├── knowledge/           # 共享知识库
│   │       │   ├── patterns.md
│   │       │   ├── domains.md
│   │       │   ├── tools.md
│   │       │   └── corrections.md
│   │       └── CLAUDE.md            # 主配置文件
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

### 最新更新（2026-03-12）

- ✨ Agent 架构优化：6 分析层 + 2 执行层 + 1 支持层
- 🎯 分级调度：根据任务复杂度动态分配 2-6 个 agent
- 📋 行动决策：分析完成后提供可执行的下一步选项
- 🔍 轻量分析：Coding Mode 下 30 秒快速上下文理解
- ✅ 证据有效性：Research Ledger 验证机制
- 🎨 通用化：适用于所有类型的安全研究和复杂项目
- 🔧 上下文感知修复

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [Claude Code 官方文档](https://claude.com/claude-code)
- [Claude API 文档](https://docs.anthropic.com/)
- [Docker 官方文档](https://docs.docker.com/)

---

**提示**：推荐使用 `claudeCode-none` 版本，性能更好且更稳定。
