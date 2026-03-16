# claudeSandBox 架构设计（v2.2.0）

## 系统定位

claudeSandBox 是一个**智能体驱动**的 Claude Code 沙箱环境，专为**安全研究、安全开发和日常开发**设计。

**核心特点**：
- 🤖 **智能体驱动** - 专业智能体，主动触发
- 🧠 **技能库** - 按需加载的知识库
- 💬 **命令系统** - 快捷命令，特定场景
- 🛡️ **规则系统** - 强制约束（安全、编码、测试）

**设计理念**：
- ✅ **职责清晰** - 每个智能体有明确的职责边界
- ✅ **主动触发** - "应主动（PROACTIVELY）使用"机制
- ✅ **渐进式披露** - 技能和规则按需加载
- ✅ **成本优化** - haiku 处理文档，sonnet 处理复杂任务

---

## 核心架构

### 智能体驱动系统

```
用户输入 → 意图识别 → 智能体调度 → 完成任务
   ↓           ↓          ↓          ↓
 理解需求    匹配场景   调用agent   输出结果
```

**核心智能体**（9个）：
- `system-architect` - 系统架构设计
- `planner` - 任务规划
- `tdd-guide` - 测试驱动开发
- `research` - 安全研究（PoC、漏洞复现、协议分析、代码安全审计）
- `dev` - 日常开发
- `reviewer` - 代码审查（逻辑/架构/质量，不含安全）
- `ops` - 运维自动化
- `doc-updater` - 文档维护

**设计原则**：
- ✅ **职责分离** - research 负责安全，reviewer 负责质量
- ✅ **主动触发** - 描述中包含"应主动（PROACTIVELY）使用"时自动调用
- ✅ **模型选择** - haiku（文档）、sonnet（大部分）、opus（极复杂）

---

## 四大组件

### 1. 智能体（Agents）

**定义位置**：`.claude/agents/{agent-name}.md`

**架构类**：
- `system-architect` - 系统架构设计、模块边界规划、架构风险评估

**规划类**：
- `planner` - 任务规划与分解、需求分析

**开发类**：
- `tdd-guide` - 测试驱动开发（80%+ 覆盖率要求）
- `dev` - 日常开发（Web/API/工具开发、工程规范遵守）
- `research` - 安全研究、PoC 开发、漏洞复现、协议分析、代码安全审计

**质量类**：
- `reviewer` - 代码审查（逻辑正确性、架构边界、命名风格、可维护性）

**运维类**：
- `ops` - 运维自动化、部署脚本、监控配置

**文档类**：
- `doc-updater` - 文档维护、代码映射图生成、README 更新

### 2. 技能库（Skills）

**定义位置**：`.claude/skills/{category}/{skill-name}/SKILL.md`

**安全技能**：
- `security/web-whitebox-audit` - Web 白盒安全审计（8 阶段流程）
- `security/iot-audit` - IoT 安全审计（自动识别固件/源码/混合）
- `vuln-patterns` - OWASP Top 10 漏洞模式

**开发技能**：
- `frontend-patterns` - React/Next.js 前端模式
- `backend-patterns` - 后端开发模式
- `debugging` - 调试方法论
- `code-review` - 代码审查清单
- `tdd-workflow` - TDD 工作流

### 3. 命令（Commands）

**定义位置**：`.claude/commands/{command-name}.md`

**学习命令**：
- `/learn` - 从会话中提取模式并保存为技能
- `/learn-eval` - 评估已学习的模式质量

**开发命令**：
- `/tdd` - 测试驱动开发工作流（RED → GREEN → REFACTOR）

### 4. 规则（Rules）

**定义位置**：`.claude/rules/{rule-name}.md`

**编排规则**：
- `agents.md` - 智能体编排规则、职责边界、协作模式

**安全规则**：
- `security.md` - 安全编码规范（输入验证、输出编码、认证授权等）

**工作流规则**：
- `git-workflow.md` - Git 工作流（提交格式、PR 流程、分支管理）

**编码规范**（语言特定）：
- `python/coding-style.md` - Python 编码规范（PEP 8、类型注解、安全要求）
- `javascript/coding-style.md` - JavaScript/TypeScript 编码规范（命名、TS 要求、React 规范）
- `go/coding-style.md` - Go 编码规范（命名、错误处理、并发安全）
- `java/coding-style.md` - Java 编码规范（命名、异常处理、Spring 规范）

---

## 主动触发机制

### 什么是"应主动（PROACTIVELY）使用"

所有智能体和技能的描述中都包含**"应主动（PROACTIVELY）使用"**标记，这意味着：

**智能体会在识别到相关场景时自动调用，无需等待用户明确指示。**

### 触发示例

```bash
# 用户输入
你：帮我审查这段代码的性能问题

# Claude 自动识别场景
识别到：代码审查场景
触发智能体：reviewer（应主动使用）
原因：描述中包含"当代码编写完成后需要审查代码质量时，应主动（PROACTIVELY）使用此 agent"

# 自动调用
Claude：让我调用 reviewer 智能体来审查代码质量...
[执行审查]
```

### 主动触发的优势

- ✅ **减少沟通成本** - 无需用户明确指定
- ✅ **提高效率** - 自动选择最合适的智能体
- ✅ **避免遗漏** - 关键步骤不会错过

---

## 智能体协作模式

### 1. 规划 → TDD → 审查流程

```
planner → tdd-guide → dev → reviewer → doc-updater
```

适用于：新功能开发、重大重构

**关键点**：
- tdd-guide 确保测试先行，80%+ 覆盖率
- reviewer 检查逻辑/架构/质量（不含安全）
- research 单独处理安全问题

### 2. 研究分离流程

```
research (安全审计) + reviewer (质量审查) → 并行
```

适用于：代码提交前审查

**职责边界**：
- **research**: 安全问题（SQL 注入、XSS、权限绕过等）
- **reviewer**: 逻辑正确性、架构边界、命名风格、可维护性

### 3. 架构驱动流程

```
system-architect → planner → dev → reviewer
```

适用于：新系统设计、复杂模块

### 4. 运维集成流程

```
dev → ops → doc-updater
```

适用于：部署、监控、配置管理

---

## 模型选择策略

### haiku（成本优化）

**适用场景**：
- 文档生成和维护（doc-updater）
- 代码映射图生成
- README 更新

**优势**：成本低，速度快

### sonnet（默认）

**适用场景**：
- 大部分智能体（system-architect, planner, tdd-guide, dev, reviewer, ops）
- 日常开发任务
- 代码审查

**优势**：平衡性能与成本

### opus（极复杂任务）

**适用场景**：
- 极其复杂的安全研究
- 深度漏洞分析
- 复杂协议逆向

**优势**：最高性能

---

## 职责边界清晰化

### research vs reviewer

| 维度 | research | reviewer |
|------|----------|----------|
| **安全** | ✅ 负责（SQL注入、XSS、权限绕过） | ❌ 不负责 |
| **逻辑正确性** | ❌ 不负责 | ✅ 负责 |
| **架构边界** | ❌ 不负责 | ✅ 负责 |
| **命名风格** | ❌ 不负责 | ✅ 负责 |
| **可维护性** | ❌ 不负责 | ✅ 负责 |

### system-architect vs planner

| 维度 | system-architect | planner |
|------|------------------|---------|
| **系统级架构** | ✅ 负责（模块边界、技术选型） | ❌ 不负责 |
| **功能实现计划** | ❌ 不负责 | ✅ 负责（任务拆解、依赖分析） |

---

## 文件结构

```
claudeSandBox/
├── claudeCode-none/          # 无 LSP 变体（推荐）
│   ├── claude_arm64/         # ARM64 架构
│   └── claude_x64/           # x64 架构
├── claudeCode-lsp/           # 有 LSP 变体
│   ├── claude_arm64/
│   └── claude_x64/
│
└── workspace/                # 工作目录
    └── .claude/
        ├── CLAUDE.md         # 项目约定
        ├── commands/         # 命令定义
        │   ├── learn.md
        │   ├── learn-eval.md
        │   └── tdd.md
        ├── skills/           # 技能库
        │   ├── security/
        │   │   ├── web-whitebox-audit/
        │   │   └── iot-audit/
        │   ├── development/
        │   │   ├── frontend-patterns/
        │   │   ├── backend-patterns/
        │   │   ├── debugging/
        │   │   ├── code-review/
        │   │   └── tdd-workflow/
        │   └── vuln-patterns/
        ├── agents/           # 智能体定义
        │   ├── system-architect.md
        │   ├── planner.md
        │   ├── tdd-guide.md
        │   ├── research.md
        │   ├── dev.md
        │   ├── reviewer.md
        │   ├── ops.md
        │   └── doc-updater.md
        ├── agent-memory/     # Agent 持久记忆
        │   ├── system-architect/
        │   ├── planner/
        │   ├── tdd-guide/
        │   ├── research/
        │   ├── dev/
        │   ├── reviewer/
        │   ├── ops/
        │   └── doc-updater/
        └── rules/            # 强制规则
            ├── agents.md
            ├── security.md
            ├── git-workflow.md
            ├── python/
            │   └── coding-style.md
            ├── javascript/
            │   └── coding-style.md
            ├── go/
            │   └── coding-style.md
            └── java/
                └── coding-style.md
```

---

## 版本历史

### v2.2.0 (2026-03-16)

**重大更新**：从命令驱动重构为智能体驱动

**核心变化**：

1. **智能体驱动系统**
   - ✅ 新增 9 个专业智能体（system-architect, planner, tdd-guide, research, dev, reviewer, ops, doc-updater）
   - ✅ 主动触发机制："应主动（PROACTIVELY）使用"
   - ✅ 职责边界清晰化：research 负责安全，reviewer 负责质量
   - ✅ 模型选择策略：haiku（文档）、sonnet（大部分）、opus（极复杂）

2. **技能库扩展**
   - ✅ 新增 frontend-patterns skill（React/Next.js 模式）
   - ✅ 新增 backend-patterns skill（后端开发模式）
   - ✅ 新增 code-review skill（代码审查清单）
   - ✅ 新增 vuln-patterns skill（OWASP Top 10）

3. **命令系统优化**
   - ✅ 新增 learn 命令（从会话中提取模式）
   - ✅ 新增 learn-eval 命令（评估已学习的模式）
   - ✅ 新增 tdd 命令（测试驱动开发工作流）
   - ✅ 移除旧的通用命令（security-audit, code-review, debug, test, e2e）

4. **规则系统完善**
   - ✅ 新增 agents.md（智能体编排规则）
   - ✅ 新增 security.md（安全编码规范）
   - ✅ 新增 git-workflow.md（Git 工作流）
   - ✅ 新增语言特定编码规范（Python, JavaScript, Go, Java）

5. **文档优化**
   - ✅ CLAUDE.md 简化为"统一协作契约"（119 行）
   - ✅ 移除 Available Resources 部分（保持简洁）
   - ✅ 添加 Compact Instructions（控制上下文压缩）

### v2.1.0 (2026-03-16)

从模式驱动重构为命令驱动架构。

详见 v2.1.0 版本文档。

---

## 适用场景

- ✅ 安全研究（漏洞分析、PoC 开发、渗透测试）
- ✅ 安全开发（安全编码、威胁建模、代码审查）
- ✅ 日常开发（调试、测试、重构）

---

## 版本对比

### v2.2.0（当前）- 智能体驱动

```bash
# 自动触发智能体
你：帮我审查这段代码
Claude：[自动识别场景，调用 reviewer]
你：分析这个安全问题
Claude：[自动识别场景，调用 research]
```

**特点**：
- ✅ 智能体主动触发
- ✅ 职责边界清晰
- ✅ 模型选择优化
- ✅ 渐进式披露

### v2.1.0 - 命令驱动

```bash
# 手动使用命令
/security-audit
/code-review
/debug
/test
/e2e
```

**特点**：
- ⚠️ 需要手动选择命令
- ⚠️ 职责边界不够清晰
- ⚠️ 没有模型选择优化

### v2.0.0 - 模式驱动

```bash
# 先选择模式
标准模式 → 3-4 步流程
完整模式 → 6 步流程 + 质量门禁
```

**特点**：
- ⚠️ 需要选择模式
- ⚠️ 流程较重
- ⚠️ 6 个阶段
