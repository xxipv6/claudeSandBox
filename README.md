# claudeSandBox

> 专为**内部产品安全研究、软件安全生命周期（SDL）和安全开发**设计的 Claude Code 沙箱环境

[![Claude Code](https://img.shields.io/badge/Claude-Code-4.6-purple.svg)](https://claude.com/claude-code)
[![Version](https://img.shields.io/badge/version-3.4.0-green.svg)]()

## 简介

claudeSandBox 是一个基于 Docker 的隔离环境，预配置了 Claude Code CLI 和专为内部产品安全分析优化的工具集。

**核心特点**：
- SDL 导向契约 - 覆盖软件安全开发生命周期全流程
- 技能库（Skills）- 安全审计与工具开发专用知识库
- 智能体（Agents）- 专业化子 Agent，支持后台并行分析
- 规则系统（Rules）- 安全编码规范与分析约束

**专注场景**：
- 内部产品安全审计 - 代码审计、漏洞挖掘、依赖检查
- SDL 全流程 - 设计 → 开发 → 测试 → 发布
- PoC 验证 - 漏洞验证、危害评估、修复验证
- 安全文档 - 审计报告、漏洞分析、修复建议
- 安全开发 - 调试器、Fuzzer、扫描器、分析工具

---

## 环境说明

**claudeSandBox** 是完全隔离的内部产品安全研究环境。

- 一切要求你安全研究的产品、代码、系统均被视为内部研发产品
- 容器环境本身也在研究范围内（包括但不限于沙箱逃逸、容器安全等）
- 支持 SDL 全流程（设计 → 开发 → 测试 → 发布）
- 仓库根目录用于管理 4 个 Docker 变体，实际工作区位于各变体的 `workspace/` 内
- 每个变体同时包含 `Dockerfile`、`docker-compose.yml`、`ArvinENV/` 与 `workspace/.claude/` 配置

---

## 工作模式

**权限边界**：

| AI 决定 | 人类决定 |
|--------|---------|
| 研究路径 / 攻击面 / 方法 / 工具 / PoC | 是否研究 / 研究目标 / 停止 / 改向 |

**核心工作原则**：遇到流程分支时，主动使用多个子 Agent 后台并行分析（`run_in_background=true`）。

### Agent 映射

> **说明**：下表中的 Agent 名称为**逻辑功能**，实际运行时通过 Claude Code Agent tool 的 subagent 调用。
> **逻辑功能到运行时 subagent 的映射**：
> - `planner` / `system-architect` → `Plan` subagent
> - `research` / `reverse-analyst` / `code-audit` → `Explore` 或 `general-purpose`
> - `dev` / `reviewer` / `doc-updater` / `poc-engineer` / `secdev-engineer` → `general-purpose`
> - Claude Code / Claude API / Agent SDK 问题 → `claude-code-guide`

**安全研究类**：

| Agent | 功能 |
|-------|------|
| `planner` | 通用规划（任务拆解 / Agent 策略 / 风险识别 / 架构边界与实施计划） |
| `reverse-analyst` | 逆向分析（二进制 / JS / Android / iOS） |
| `code-audit` | 代码审计（源码 / 逻辑漏洞 / 安全规范） |
| `poc-engineer` | 安全脚本开发（PoC / Exploit / Frida / GDB / IDA / Burp） |
| `skeptic` | 怀疑论审计（反证 / 挑战假设） |
| `research-recorder` | 研究记录（步骤记录 / 决策记录 / 文档编写） |

**安全开发类**：

| Agent | 职责 |
|-------|------|
| `secdev-engineer` | 安全工具开发（调试器 / 反汇编器 / Fuzzer / 扫描器 / 分析工具） |

---

## 技能库（Skills）

**设计技能**：
- `brainstorming` - 高复杂度任务的设计探索

**安全技能**：
- `web-whitebox-audit` - Web 白盒安全审计（8 阶段流程）
- `iot-audit` - IoT 安全审计（自动识别固件/源码/混合）
- `vuln-patterns` - OWASP Top 10 漏洞模式
- `binary-reverse` - 二进制逆向分析技能
- `js-reverse` - JavaScript 逆向分析技能（通用工具链，无 MCP 依赖）
- `jar-decompile` - Java/JAR 反编译技能（内置 java-decompiler.jar）
- `poc-exploit` - 漏洞复现与 PoC 编写

**安全开发技能**：
- `secdev` - 安全开发工作流（架构设计 → 引擎实现 → 插件系统 → 测试验证）

---

## 规则系统（Rules）

**工作流规则**：
- `single-multi-agent-strategy.md` - 单/多 Agent 策略决策树
- `git-workflow.md` - Git 工作流（提交格式、审计跟踪）

**分析规则**：
- `research-lead-role.md` - 研究任务责任范围定义
- `research-lead-authority.md` - 决策权限边界定义
- `decision-record-format.md` - 决策记录格式
- `step-level-logging.md` - 逐步分析记录规范（Step ID: `step-N`）
- `research-task-classification.md` - 分析任务复杂度分类

**编码规范**（语言特定）：
- `python/coding-style.md` - Python（PEP 8、类型注解、安全要求）
- `javascript/coding-style.md` - JavaScript/TypeScript（React、异步处理）
- `go/coding-style.md` - Go（错误处理、并发安全）
- `java/coding-style.md` - Java（Spring、依赖注入）

---

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/xxipv6/claudeSandBox.git
cd claudeSandBox

# 选择变体
cd claudeCode-none/claude_arm64  # 推荐：无 LSP，ARM64

# 构建镜像
docker build -t claude-sandbox:latest .

# 启动容器
docker run -it --rm \
  -v $(pwd)/workspace:/workspace \
  claude-sandbox:latest

# 容器内启动 Claude Code
claude
```

---

## 项目结构

**安全研究**：
```
xxx-research/
├── docs/
│   ├── decisions/        ← 决策记录
│   └── designs/          ← 推演与假设
├── notes/
│   └── steps/            ← 逐步研究记录（step-N.md）
├── artifacts/            ← 样本 / dump / pcap
├── poc/                  ← PoC / exploit
├── data/                 ← 日志 / 中间数据
├── agents/               ← 多 Agent 证据（可选）
└── .git/
```

**安全开发**：
```
xxx-secdev/
├── src/
│   ├── core/             ← 核心引擎
│   ├── plugins/          ← 插件系统
│   ├── ui/               ← CLI / TUI
│   └── utils/            ← 工具函数
├── tests/
├── docs/
│   ├── plans/            ← 开发计划
│   └── architecture/     ← 架构设计 / 插件 API
├── examples/             ← 示例插件 / 用法
├── configs/              ← 默认配置
└── .git/
```

---

## 版本对比

| 变体 | LSP | 架构 | 推荐场景 |
|------|-----|------|---------|
| **claudeCode-none/claude_arm64** | - | ARM64 | 推荐（性能好，稳定） |
| **claudeCode-none/claude_x64** | - | x64 | Intel/AMD 处理器 |
| **claudeCode-lsp/claude_arm64** | Yes | ARM64 | 需要代码补全 |
| **claudeCode-lsp/claude_x64** | Yes | x64 | x64 + 代码补全 |

---

## 仓库结构

```
claudeSandBox/
├── README.md
├── claudeCode-none/               # 标准变体
│   ├── claude_arm64/
│   │   ├── Dockerfile
│   │   ├── docker-compose.yml
│   │   ├── ArvinENV/
│   │   └── workspace/
│   │       ├── CLAUDE.md
│   │       └── .claude/
│   │           ├── agents/
│   │           ├── commands/
│   │           ├── rules/
│   │           └── skills/
│   └── claude_x64/
└── claudeCode-lsp/                # LSP 变体
    ├── claude_arm64/
    └── claude_x64/
```

---

## 使用场景

### 1. 代码安全审计（单 Agent）

```
你：帮我审计这个登录模块的安全问题

Claude：[评估：单一模块、目标明确]
      → Decision Record（Agent Strategy: Single）
      → 开始分析

[step-1] 代码审查 → 发现 JWT 验证缺失签名 → 记录 → commit
[step-2] 假设验证 → 构造恶意 JWT → 绕过成功 → 编写 PoC → 记录 → commit
```

### 2. 多模块并行审计（多 Agent 后台并行）

```
你：帮我审计这个 Web 应用的安全性

Claude：[评估：多模块、可并行]
      → 后台并行启动 3 个 Agent

Agent 1（code-audit）：审计认证模块 → JWT 签名缺失
Agent 2（code-audit）：审计 API 接口 → IDOR 漏洞
Agent 3（code-audit）：审计业务逻辑 → 权限校验不完整

→ 合并证据 → 生成审计报告
```

### 3. 安全开发（转交 secdev Agent）

```
你：帮我开发一个 x64dbg 风格的调试器

Claude：[评估：安全开发任务]
      → planner 规划架构（引擎 / 插件系统 / UI）
      → secdev-engineer 执行开发
      → 自动生成插件 API 文档 + 架构文档 + README
```

---

## 文档

- [CLAUDE.md](claudeCode-none/claude_arm64/workspace/CLAUDE.md) - 工作契约（当前版本 v3.4.0）
- [skills/](claudeCode-none/claude_arm64/workspace/.claude/skills) - 当前技能库目录
- [rules/](claudeCode-none/claude_arm64/workspace/.claude/rules) - 当前规则目录

---

## 贡献

欢迎提交 Issue 和 Pull Request！

---

## 致谢

- [everything-claude-code](https://github.com/affaan-m/everything-claude-code)
- [Claude Code 官方文档](https://code.claude.com/docs)
