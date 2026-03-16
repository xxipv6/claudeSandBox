# claudeSandBox 架构设计（v2.1.0）

## 系统定位

claudeSandBox 是一个**命令驱动**的 Claude Code 沙箱环境，专为**安全研究、安全开发和日常开发**设计。

**核心特点**：
- 🚀 **命令驱动** - 快捷命令，按需执行
- 🧠 **技能库** - 按需加载的知识库
- 🤖 **智能体** - 专门任务，按需调用
- 🛡️ **规则系统** - 强制约束（安全、编码、测试）

---

## 核心架构

### 命令驱动系统

```
用户输入 → 命令执行 → 完成任务
```

**核心命令**：
```bash
/security-audit     # 安全审计
/code-review        # 代码审查（前后端）
/debug              # 调试问题
/test               # 功能测试
/e2e                # 全部测试（前端 + 后端，并发）
```

**设计原则**：
- ✅ 简洁直观 - 直接使用命令，无需模式选择
- ✅ 按需调用 - 根据任务选择合适的命令/skill/agent
- ✅ 专注安全 - 所有命令都针对安全场景优化

---

### 四大组件

#### 1. 命令（Commands）

**定义位置**：`.claude/commands/{command-name}.md`

**可用命令**：
- `/security-audit` - 安全审计（Web 白盒 + IoT）
- `/code-review` - 代码审查（前后端）
- `/debug` - 调试问题
- `/test` - 功能测试
- `/e2e` - 全部测试（并发）

#### 2. 技能库（Skills）

**定义位置**：`.claude/skills/{category}/{skill-name}/SKILL.md`

**安全技能**：
- `security/whitebox-audit` - Web 白盒安全审计（8 阶段流程）
- `security/iot-audit` - IoT 安全审计（自动识别固件/源码/混合）

**开发技能**：
- `development/debugging` - 调试方法论
- `development/code-review` - 代码审查清单
- `development/tdd-workflow` - TDD 工作流

**测试技能**：
- `testing/e2e-testing` - E2E 测试（Playwright）

**分析技能**：
- `analysis/domains` - 10 个分析维度

#### 3. 智能体（Agents）

**定义位置**：`.claude/agents/{agent-name}.md`

**规划类**：
- `task-planner` - 任务规划与分解

**分析类**（可并发）：
- `product-manager` - 产品需求分析
- `backend-engineer` - 后端架构分析（使用 `code-review` skill）
- `frontend-engineer` - 前端实现分析（使用 `code-review` skill）
- `security-tester` - 安全测试与漏洞分析（使用 `whitebox-audit` + `iot-audit` skills）

**执行类**：
- `dev-coder` - 代码实现（使用 `tdd-workflow` skill）

#### 4. 规则（Rules）

**定义位置**：`.claude/rules/{rule-name}.md`

- `security.md` - 安全规则（禁止硬编码密钥、SQL 注入、XSS 等）
- `coding-style.md` - 代码风格
- `testing.md` - 测试要求

---

## 工作流程

### 标准工作流程

```
用户输入 → 任务规划 → 用户确认 → 执行任务 → 完成反馈
   ↓           ↓          ↓          ↓          ↓
 理解意图    调用 planner  等待确认   执行操作   输出结果
```

### 工作流程示例

```bash
# 用户输入
你：帮我实现用户登录功能

# 第一步：任务规划
Claude：让我先规划一下这个任务...

## 任务规划
### 1. 任务理解
**目标**：实现用户登录功能
**边界**：前端登录页面 + 后端登录 API
**成功标准**：用户可以使用邮箱密码登录

### 2. 任务拆解
- 子任务 1：设计数据库表结构
- 子任务 2：实现后端登录 API
- 子任务 3：实现前端登录页面
- 子任务 4：集成前后端

### 3. 依赖关系
T1（数据库）→ T2（后端 API）→ T3（前端页面）→ T4（集成）

### 4. 执行顺序
1. T1 → T2 → T3 → T4（串行）
2. 预估时间：30 分钟

### 5. 命令选择
**选择的命令**：不使用命令，直接实现
**理由**：这是完整的功能实现任务

### 6. 资源规划
- backend-engineer：设计数据库和 API
- frontend-engineer：设计登录页面
- dev-coder：实现代码

---

# 第二步：等待用户确认
是否开始执行？请确认。

# 第三步：用户确认后执行
你：确认，开始执行。

# 第四步：执行并反馈
Claude：开始执行...
[执行过程]
完成！登录功能已实现。
```

---

## 命令详解

### /security-audit - 安全审计

**功能**：完整的安全审计，支持 Web 应用和 IoT 设备

**支持类型**：
- **Web 白盒审计**（`whitebox-audit` skill）
  - 8 阶段流程：执行模型 → 依赖分析 → 执行链 → 路由枚举 → 业务流程 → 越权审计 → 状态机 → 攻击路径
  - 重点：越权作为主线、跨接口联动、状态机建模

- **IoT 审计**（`iot-audit` skill）
  - 自动识别资产形态（仅固件/仅源码/混合）
  - 统一模型：入口 → 权限 → 状态 → 副作用

**使用示例**：
```bash
# Web 应用审计
/security-audit
/security-audit src/auth/

# IoT 设备审计
/security-audit firmware.bin
/security-audit src/
```

**输出**：
- 漏洞清单（高/中/低风险）
- 攻击路径
- 修复建议

### /code-review - 代码审查

**功能**：前后端代码审查（6 维度）

**审查维度**：
- 功能性、性能、可读性、可维护性、测试、安全性（基础安全）

**使用示例**：
```bash
/code-review
/code-review src/auth/login.js
```

**输出**：
- 问题清单
- 修复建议
- 优先级排序

### /debug - 调试问题

**功能**：系统化调试

**特点**：
- 自动识别前端/后端
- 前端：自动使用 Playwright

**使用示例**：
```bash
/debug "登录按钮点击没反应"
/debug "API 返回 500 错误"
```

### /test - 功能测试

**功能**：功能测试（前端或后端）

**特点**：
- 自动识别前端/后端
- 前端：自动使用 Playwright

**使用示例**：
```bash
/test "测试登录按钮"
/test "测试 API 返回"
```

### /e2e - 全部测试

**功能**：并发运行所有测试

**执行内容**：
- 后端测试（npm test）
- 前端 E2E 测试（Playwright）

**使用示例**：
```bash
/e2e
/e2e "只运行包含 login 的测试"
```

---

## Agents ↔ Skills 对齐

| Agent | 使用 Skill | 职责 |
|-------|-----------|------|
| **security-tester** | `whitebox-audit` + `iot-audit` | 安全测试与漏洞分析 |
| **backend-engineer** | `code-review`（后端） | 后端架构分析 |
| **frontend-engineer** | `code-review`（前端） | 前端实现分析 |
| **dev-coder** | `tdd-workflow` | 代码实现（TDD） |
| **task-planner** | 无 | 任务规划与分解 |
| **product-manager** | 无 | 产品需求分析 |

---

## 强制要求

### 规划优先

**所有任务都必须先规划**：
1. ✅ 简单任务：快速规划（1-2 分钟）
2. ✅ 复杂任务：详细规划（使用 task-planner agent）
3. ✅ 规划内容包括：任务拆解、依赖关系、执行顺序、所需资源

### 必须等待确认

1. ✅ 规划完成后必须等待用户确认
2. ✅ 展示规划结果
3. ✅ 说明预期耗时和影响范围
4. ✅ 等待用户明确确认后再执行

### 规划未确认不得执行

1. ❌ 不得跳过规划直接执行
2. ❌ 不得假设用户会同意
3. ❌ 不得在规划阶段就开始修改代码

---

## 全局禁止

1. ❌ **跳过规划直接执行任务**（最严重的违规）
2. ❌ 跳过用户确认就执行大规模修改
3. ❌ 违反安全规则（硬编码密钥、缺少输入验证等）
4. ❌ 过度形式化（输出冗长的分析报告）
5. ❌ 忽略用户的安全研究授权范围

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
        │   ├── security-audit.md
        │   ├── code-review.md
        │   ├── debug.md
        │   ├── test.md
        │   └── e2e.md
        ├── skills/           # 技能库
        │   ├── security/     # 安全技能
        │   │   ├── whitebox-audit/
        │   │   └── iot-audit/
        │   ├── development/  # 开发技能
        │   │   ├── debugging/
        │   │   ├── code-review/
        │   │   └── tdd-workflow/
        │   ├── testing/      # 测试技能
        │   │   └── e2e-testing/
        │   └── analysis/     # 分析技能
        │       └── domains/
        ├── agents/           # 智能体定义
        │   ├── task-planner.md
        │   ├── product-manager.md
        │   ├── backend-engineer.md
        │   ├── frontend-engineer.md
        │   ├── security-tester.md
        │   └── dev-coder.md
        ├── agent-memory/     # Agent 持久记忆
        │   ├── task-planner/
        │   ├── product-manager/
        │   ├── backend-engineer/
        │   ├── frontend-engineer/
        │   ├── security-tester/
        │   └── dev-coder/
        └── rules/            # 强制规则
            ├── security.md
            ├── coding-style.md
            └── testing.md
```

---

## 版本历史

### v2.1.0 (2026-03-16)

**重大更新**：从模式驱动重构为命令驱动

**核心变化**：
- ✅ 删除双模式系统（标准模式/完整模式）
- ✅ 删除 6 阶段流程系统
- ✅ 删除状态管理系统
- ✅ 添加命令驱动系统
- ✅ 添加技能库（按需加载）
- ✅ 创建 whitebox-audit 和 iot-audit skills
- ✅ 对齐 Agents 和 Skills
- ✅ 添加"所有任务都必须先规划"的强制要求

**删除的功能**：
- ❌ 快速模式
- ❌ 标准模式
- ❌ 完整模式
- ❌ 6 个执行阶段
- ❌ 任务状态管理
- ❌ Git 分支管理
- ❌ 质量门禁
- ❌ Knowledge 系统（改为 Skills）

**新增的功能**：
- ✅ 命令驱动（5 个核心命令）
- ✅ 技能库（7 个 skills）
- ✅ 强制规划要求
- ✅ 自动识别（前端/后端，固件/源码）

### v2.0.0 (2026-03-15)

**重大更新**：配置驱动的流程编排系统

详见旧版本文档。

---

## 适用场景

- ✅ 安全研究（漏洞分析、PoC 开发、渗透测试）
- ✅ 安全开发（安全编码、威胁建模、代码审查）
- ✅ 日常开发（调试、测试、重构）

---

## 版本对比

### v2.1.0（当前）- 命令驱动

```bash
# 直接使用命令
/security-audit
/code-review
/debug
/test
/e2e
```

**特点**：
- ✅ 简洁直观
- ✅ 按需调用
- ✅ 无模式选择
- ✅ 专注安全场景

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
