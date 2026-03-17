# claudeSandBox

> 🛡️ 专为**安全研究、安全开发和日常开发**设计的 Claude Code 沙箱环境

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude-Code-4.6-purple.svg)](https://claude.com/claude-code)
[![Version](https://img.shields.io/badge/version-2.2.0-green.svg)](CHANGELOG.md)

## 📖 简介

claudeSandBox 是一个基于 Docker 的隔离开发环境，预配置了 Claude Code CLI 和专为安全场景优化的工具集。

**核心特点**：
- 🤖 **智能体驱动** - 专业智能体，主动触发
- 🧠 **技能库（Skills）** - 按需加载的知识库
- 💬 **命令系统（Commands）** - 快捷命令，特定场景
- 🛡️ **规则系统（Rules）** - 强制约束

**专注场景**：
- 🔍 安全研究 - 漏洞分析、安全审计、渗透测试
- 🔒 安全开发 - 安全编码、代码审查
- 💻 日常开发 - 调试、测试、重构

---

## ✨ 核心特性

### 🤖 智能体驱动（Agent-Driven）

**8 个专业智能体，主动触发**：

**架构类**：
- `system-architect` - 系统架构设计、模块边界规划

**规划类**：
- `planner` - 任务规划与分解、需求分析

**开发类**：
- `tdd-guide` - 测试驱动开发（80%+ 覆盖率）
- `dev` - 日常开发（Web/API/工具开发）
- `research` - 安全研究（PoC、漏洞复现、代码安全审计）

**质量类**：
- `reviewer` - 代码审查（逻辑/架构/质量，不含安全）

**运维类**：
- `ops` - 运维自动化、部署脚本、监控配置

**文档类**：
- `doc-updater` - 文档维护、代码映射图生成

**特点**：
- ✅ **主动触发** - "应主动（PROACTIVELY）使用"机制，自动识别场景
- ✅ **职责清晰** - research 负责安全，reviewer 负责质量
- ✅ **模型优化** - haiku（文档）、sonnet（大部分）

### 🧠 技能库（Skills）

按需加载的知识库：

**设计技能**：
- `brainstorming` - 高复杂度任务的设计探索

**安全技能**：
- `security/web-whitebox-audit` - Web 白盒安全审计（8 阶段流程）
- `security/iot-audit` - IoT 安全审计（自动识别固件/源码/混合）
- `security/vuln-patterns` - OWASP Top 10 漏洞模式
- `security/poc-exploit` - PoC 开发和漏洞利用

**开发技能**：
- `frontend-patterns` - React/Next.js 前端模式
- `backend-patterns` - 后端开发模式
- `debugging` - 调试方法论
- `code-review` - 代码审查清单
- `auto-fix-monitor` - 开发环境日志监控和自动修复

### 💬 命令系统（Commands）

特定场景的快捷命令：

**学习命令**：
- `/learn` - 从会话中提取模式并保存为技能
- `/learn-eval` - 评估已学习的模式质量

**开发命令**：
- `/tdd` - 测试驱动开发工作流（RED → GREEN → REFACTOR）

**实用命令**：
- `/debug` - 系统化调试流程，定位问题根因并修复
- `/test` - 运行测试套件，检查代码覆盖率
- `/deploy` - 部署应用到目标环境

### 🛡️ 规则系统（Rules）

**编排规则**：
- `agents.md` - 智能体编排规则、职责边界、协作模式

**安全规则**（`security.md`）：
- ❌ 禁止硬编码密钥
- ❌ 禁止 SQL 注入
- ❌ 禁止 XSS 漏洞
- ❌ 禁止弱加密
- ✅ 必须输入验证
- ✅ 必须输出编码
- ✅ 遵循认证/授权规范
- ✅ 正确使用加密

**工作流规则**：
- `git-workflow.md` - Git 工作流（提交格式、PR 流程、分支管理）

**编码规范**（语言特定）：
- `python/coding-style.md` - Python 编码规范（PEP 8、类型注解）
- `javascript/coding-style.md` - JavaScript/TypeScript 编码规范
- `go/coding-style.md` - Go 编码规范（命名、并发安全）
- `java/coding-style.md` - Java 编码规范（Spring、异常处理）

---

## 🚀 快速开始

### 第一步：构建并启动容器

```bash
# 克隆仓库
git clone https://github.com/xxipv6/claudeSandBox.git
cd claudeSandBox

# 选择变体（4 个选项）
cd claudeCode-none/claude_arm64  # 推荐：无 LSP，ARM64

# 构建镜像
docker build -t claude-sandbox:latest .

# 启动容器
docker run -it --rm \
  -v $(pwd)/workspace:/workspace \
  claude-sandbox:latest
```

### 第二步：开始使用

```bash
# 容器内启动 Claude Code
claude

# 开始对话
你：帮我审计这个登录模块的安全问题
Claude：[自动识别安全审计场景，调用 research agent]
```

---

## 📋 命令参考

### 学习命令

#### /learn
从当前会话中提取有价值的模式，并保存为可复用的技能。

**功能**：
- 自动识别会话中的代码模式、问题解决方法、最佳实践
- 将提取的模式保存为 `.claude/skills/learned/{pattern-name}/SKILL.md`

**使用示例**：
```bash
/learn
/learn "React form validation patterns"
```

#### /learn-eval
评估已学习模式的质量，提供改进建议。

### 开发命令

#### /tdd
测试驱动开发工作流，强制执行"测试先行"方法论。

**工作流程**：
1. **RED** - 编写失败的测试
2. **GREEN** - 编写最小代码使测试通过
3. **REFACTOR** - 重构代码，保持测试通过

**特点**：
- 80%+ 测试覆盖率要求
- 自动使用 tdd-guide 智能体

---

## 🛠️ 工具集

### 命令行工具

容器内预装的命令行工具：

```bash
nc -nv <IP> <PORT>     # Netcat 端口扫描
curl -X POST <URL>     # HTTP 请求
sqlite3 <db>           # SQLite 数据库
```

### 配置文件位置

```bash
~/.claude/              # 用户级配置
  ├── CLAUDE.md         # 用户约定
  ├── settings.json     # 用户设置
  └── memory/           # 自动记忆

.claude/                # 项目级配置
  ├── CLAUDE.md         # 项目约定（统一协作契约）
  ├── commands/         # 命令定义
  ├── skills/           # 技能库
  ├── agents/           # 智能体定义
  ├── agent-memory/     # Agent 持久记忆
  ├── rules/            # 强制规则
  └── settings.json     # 项目设置
```

### 环境变量配置

```bash
# 在 ~/.claude/settings.json 或 .claude/settings.json 中配置

{
  "env": {
    "CLAUDE_API_KEY": "sk-ant-...",    # API Key
    "HTTP_PROXY": "http://127.0.0.1:7890"
  }
}
```

---

## 📁 项目结构

```
claudeSandBox/
├── claudeCode-none/          # 无 LSP 变体（推荐）
│   ├── claude_arm64/         # ARM64 架构
│   └── claude_x64/           # x64 架构
├── claudeCode-lsp/           # 有 LSP 变体
│   ├── claude_arm64/
│   └── claude_x64/
│
├── README.md                 # 主项目文档
├── CHANGELOG.md              # 版本历史
├── MAINTENANCE.md            # 维护手册
└── LICENSE                   # MIT 许可证

# 每个变体内部结构（claudeCode-none/claude_arm64/）
workspace/                    # 工作目录
└── .claude/
    ├── CLAUDE.md             # 项目约定（统一协作契约）
    ├── commands/             # 命令定义（6 个）
    │   ├── debug.md
    │   ├── deploy.md
    │   ├── learn.md
    │   ├── learn-eval.md
    │   ├── tdd.md
    │   └── test.md
    ├── skills/               # 技能库（10 个）
    │   ├── auto-fix-monitor/
    │   ├── brainstorming/
    │   ├── backend-patterns/
    │   ├── code-review/
    │   ├── debugging/
    │   ├── frontend-patterns/
    │   └── security/
    │       ├── web-whitebox-audit/
    │       ├── iot-audit/
    │       ├── vuln-patterns/
    │       └── poc-exploit/
    ├── agents/               # 智能体定义（8 个）
    │   ├── system-architect.md
    │   ├── planner.md
    │   ├── research.md
    │   ├── dev.md
    │   ├── reviewer.md
    │   ├── ops.md
    │   ├── doc-updater.md
    │   └── tdd-guide.md
    ├── agent-memory/         # Agent 持久记忆（8 个）
    │   ├── system-architect/
    │   ├── planner/
    │   ├── research/
    │   ├── dev/
    │   ├── reviewer/
    │   ├── ops/
    │   ├── doc-updater/
    │   └── tdd-guide/
    └── rules/                # 强制规则
        ├── agents.md
        ├── security.md
        ├── git-workflow.md
        ├── python/coding-style.md
        ├── javascript/coding-style.md
        ├── go/coding-style.md
        └── java/coding-style.md
```

---

## 🔄 版本对比

| 变体 | LSP | 架构 | 推荐场景 |
|------|-----|------|---------|
| **claudeCode-none/claude_arm64** | ❌ | ARM64 | ✅ 推荐（性能好，稳定） |
| **claudeCode-none/claude_x64** | ❌ | x64 | ✅ Intel/AMD 处理器 |
| **claudeCode-lsp/claude_arm64** | ✅ | ARM64 | 需要代码补全 |
| **claudeCode-lsp/claude_x64** | ✅ | x64 | x64 + 代码补全 |

**选择建议**：
- 推荐使用 `claudeCode-none` 版本，性能更好且更稳定
- ARM64 版本在 Apple Silicon 和 ARM 服务器上性能最佳
- 如果需要代码补全功能，使用 `claudeCode-lsp` 版本

---

## 📚 使用场景

### 1. 安全研究

```
你：帮我审计这个登录模块的安全问题
Claude：[自动识别安全审计场景，调用 research agent]
[执行完整安全审计]
- 执行模型还原
- 越权专项审计
- 状态机分析
- 生成审计报告
```

### 2. 代码审查

```
你：帮我审查这段代码的质量
Claude：[自动识别代码审查场景，调用 reviewer agent]
[执行代码质量审查]
- 检查逻辑正确性
- 检查架构边界
- 检查命名风格
- 生成审查报告
```

### 3. 新功能开发

```
你：帮我实现用户登录功能
Claude：[自动识别新功能开发，调用 planner agent]
[规划任务]
- 调用 tdd-guide（测试先行）
- 调用 dev（实现代码）
- 调用 reviewer（审查质量）
- 完成功能
```

### 4. 系统设计

```
你：帮我设计一个微服务架构
Claude：[自动识别系统设计，调用 system-architect agent]
[执行系统架构设计]
- 模块边界规划
- 技术选型
- 架构风险评估
- 生成架构文档
```

---

## 🛠️ 开发指南

### 添加自定义智能体

在 `.claude/agents/` 创建新的 `.md` 文件：

```markdown
---
name: my-agent
description: 我的智能体。当需要 XXX 时，应主动（PROACTIVELY）使用此 agent。
model: sonnet
tools: [Read, Write, Edit, Bash, Grep, Glob]
memory: project
---

# My Agent（我的智能体）

## Role
智能体职责描述

## Responsibilities
- 职责 1
- 职责 2

## When to Invoke
- 场景 1
- 场景 2

## Characteristics
关键特性描述

## Stop Conditions
- 停止条件 1
- 停止条件 2
```

### 添加自定义技能

在 `.claude/skills/` 创建新的技能目录：

```
.claude/skills/my-category/my-skill/
└── SKILL.md
```

**技能模板**：

```markdown
---
name: my-skill
description: 我的技能。当需要 XXX 时，应主动（PROACTIVELY）使用此 skill。
disable-model-invocation: false
---

# My Skill（我的技能）

## 何时激活

- 场景 1
- 场景 2

---

## 核心内容

技能内容详细描述...

---

## 示例

代码示例...
```

---

## 📖 文档

### 完整文档
- [CHANGELOG.md](CHANGELOG.md) - 版本历史
- [MAINTENANCE.md](MAINTENANCE.md) - 维护手册
- [CLAUDE.md](claudeCode-none/claude_arm64/workspace/.claude/CLAUDE.md) - 项目约定

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License

---

## 🙏 致谢

本项目参考了以下优秀项目：
- [everything-claude-code](https://github.com/affaan-m/everything-claude-code)
- [Claude Code 官方文档](https://code.claude.com/docs)
