# claudeSandBox

> 专为**内部产品安全研究、软件安全生命周期（SDL）**和**日常开发**设计的 Claude Code 沙箱环境

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude-Code-4.6-purple.svg)](https://claude.com/claude-code)
[![Version](https://img.shields.io/badge/version-3.4.0-green.svg)](CHANGELOG.md)

## 简介

claudeSandBox 是一个基于 Docker 的隔离环境，预配置了 Claude Code CLI 和专为内部产品安全分析优化的工具集。

**核心特点**：
- SDL 导向契约 - 覆盖软件安全开发生命周期全流程
- 技能库（Skills）- 安全审计与开发专用知识库
- 智能体（Agents）- 专业化子 Agent，支持后台并行分析
- 规则系统（Rules）- 安全编码规范与分析约束

**专注场景**：
- 内部产品安全审计 - 代码审计、漏洞挖掘、依赖检查
- SDL 全流程 - 设计 → 开发 → 测试 → 发布
- PoC 验证 - 漏洞验证、危害评估、修复验证
- 安全文档 - 审计报告、漏洞分析、修复建议
- 日常开发 - 功能开发、Bug 修复、重构、自动化

---

## 环境说明

**claudeSandBox** 是完全隔离的内部产品安全研究环境。

- 一切要求你安全研究的产品、代码、系统均被视为内部研发产品
- 容器环境本身也在研究范围内（包括但不限于沙箱逃逸、容器安全等）
- 支持 SDL 全流程（设计 → 开发 → 测试 → 发布）

---

## SDL 安全助理

**角色定位**：内部产品安全研究 SDL 助理

**权限边界**：

| AI 决定 | 人类决定 |
|--------|---------|
| 研究路径 / 攻击面 / 方法 / 工具 / PoC | 是否研究 / 研究目标 / 停止 / 改向 |

**核心工作原则**：遇到流程分支时，主动使用多个子 Agent 后台并行分析（`run_in_background=true`）。

### Specialist Agents

**安全研究类**（SDL 助理自己调度）：

| Agent | 职责 |
|-------|------|
| `research-planner` | 研究规划（任务拆解 / Agent 策略 / 风险识别） |
| `reverse-analyst` | 逆向分析（二进制 / JS / Android / iOS） |
| `code-audit` | 代码审计（源码 / 逻辑漏洞 / 安全规范） |
| `poc-engineer` | 安全脚本开发（PoC / Exploit / Frida / GDB / IDA / Burp） |
| `skeptic` | 怀疑论者审计（反证 / 挑战假设） |
| `research-recorder` | 研究记录（步骤记录 / 决策记录 / 文档编写） |

**日常开发类**（SDL 助理转交给对应 Agent）：

| Agent | 职责 |
|-------|------|
| `dev-planner` | 开发规划（模块划分 / 技术选型 / API 设计） |
| `dev-engineer` | 日常开发（功能开发 / Bug 修复 / 重构 / 测试 / 自动化） |

---

## 技能库（Skills）

**设计技能**：
- `brainstorming` - 高复杂度任务的设计探索

**安全技能**：
- `security/web-whitebox-audit` - Web 白盒安全审计（8 阶段流程）
- `security/iot-audit` - IoT 安全审计（自动识别固件/源码/混合）
- `security/vuln-patterns` - OWASP Top 10 漏洞模式
- `security/binary-reverse` - 二进制逆向分析技能
- `security/js-reverse` - JavaScript 逆向分析技能

**开发技能**：
- `development` - 日常开发工作流（需求分析 → 编码 → 测试 → API 文档 → TypeScript 类型 → Mock 数据）

**分析技能**：
- `debugging` - 调试方法论与问题定位
- `code-review` - 代码审查清单（安全视角）

---

## 规则系统（Rules）

**工作流规则**：
- `single-multi-agent-strategy.md` - 单/多 Agent 策略决策树
- `git-workflow.md` - Git 工作流（提交格式、审计跟踪）

**分析规则**：
- `research-lead-role.md` - SDL 安全助理角色定义
- `research-lead-authority.md` - SDL 安全助理权限授权
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

**日常开发**：
```
xxx-dev/
├── src/                  ← 源代码
├── tests/                ← 测试代码
├── docs/
│   ├── plans/            ← 开发计划
│   └── api/              ← API 文档
├── types/                ← TypeScript 类型定义
├── mock/                 ← Mock 数据
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
├── claudeCode-none/          # 无 LSP 变体（推荐）
│   ├── claude_arm64/         # ARM64 架构
│   └── claude_x64/           # x64 架构
├── claudeCode-lsp/           # 有 LSP 变体
│   ├── claude_arm64/
│   └── claude_x64/
├── README.md
├── CHANGELOG.md
├── MAINTENANCE.md
└── LICENSE

# 每个变体内部
workspace/
└── .claude/
    ├── CLAUDE.md             # SDL 安全助理契约（v3.4）
    ├── commands/             # 命令定义
    ├── skills/               # 技能库
    ├── agents/               # 智能体定义
    └── rules/                # 强制规则
```

---

## 使用场景

### 1. 代码安全审计（单 Agent）

```
你：帮我审计这个登录模块的安全问题

Claude：[评估：单一模块、目标明确]
      → Decision Record（Agent Strategy: Single）
      → 开始分析

[step-1] 代码审查
→ 发现 JWT 验证缺失签名 → 记录 → commit

[step-2] 假设验证
→ 构造恶意 JWT → 绕过成功 → 编写 PoC → 记录 → commit
```

### 2. 多模块并行审计（多 Agent 后台并行）

```
你：帮我审计这个 Web 应用的安全性

Claude：[评估：多模块、可并行]
      → Decision Record（Agent Strategy: Multi）
      → 后台并行启动 3 个 Agent

Agent 1（code-audit）：审计认证模块 → JWT 签名缺失
Agent 2（code-audit）：审计 API 接口 → IDOR 漏洞
Agent 3（code-audit）：审计业务逻辑 → 权限校验不完整

→ 合并证据 → 生成审计报告
```

### 3. 日常开发（转交 dev Agent）

```
你：帮我开发一个日志分析工具

Claude：[评估：日常开发任务]
      → 转交 dev-planner 规划
      → dev-engineer 执行开发
      → 自动生成 API 文档 + TypeScript 类型 + Mock 数据
```

---

## 文档

- [CHANGELOG.md](CHANGELOG.md) - 版本历史
- [MAINTENANCE.md](MAINTENANCE.md) - 维护手册
- [CLAUDE.md](claudeCode-none/claude_arm64/workspace/CLAUDE.md) - SDL 安全助理契约

---

## 贡献

欢迎提交 Issue 和 Pull Request！

---

## 许可证

MIT License

---

## 致谢

- [everything-claude-code](https://github.com/affaan-m/everything-claude-code)
- [Claude Code 官方文档](https://code.claude.com/docs)
