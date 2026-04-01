---
name: brainstorming
description: 设计探索技能。在进行任何创造性工作之前必须使用此技能——包括创建功能、构建组件、添加行为、修改行为等。仅在用户明确要求时使用。
disable-model-invocation: false
---

# 设计探索技能（Brainstorming）

## 何时激活

### 自动识别与触发

**触发条件（自动识别）**：

当识别到以下**高复杂度**任务类型时，**自动启用** brainstorming：

- 系统架构设计或重构
- 跨多个模块/组件的集成
- 需要探索多种技术方案的选择
- 影响系统核心逻辑的变更

**不触发的情况**：

- 单文件、单函数的简单修改
- 明确的实现任务（方案已确定）
- 文件操作、查询、信息查看
- **安全研究和 PoC 开发**（使用相应的 security skills）

### 用户主动要求

当用户明确说以下内容时，直接启用：

- "使用 brainstorming"
- "先进行设计探索"
- "帮我设计方案"
- "探索一下方案"

**询问方式**：
```xml
<tool_calls>
<invoke name="AskUserQuestion">
<parameter name="questions">[{
  "question": "检测到这是一个[高/中低]复杂度任务：[任务描述]。是否需要使用 brainstorming 进行设计探索？",
  "header": "设计探索",
  "options": [
    {
      "label": "需要 brainstorming",
      "description": "进行设计探索，探索多种方案后再实现"
    },
    {
      "label": "不需要，直接规划",
      "description": "跳过设计探索，直接进入任务规划阶段"
    }
  ],
  "multiSelect": false
}]</parameter>
</invoke>
</tool_calls>
```

### 用户明确要求使用

当用户明确说以下内容时，直接使用（无需询问）：

- "使用 brainstorming"
- "先进行设计探索"
- "帮我设计方案"
- "探索一下方案"

### 不需要使用（直接执行）

- 文件操作：解压、复制、移动、删除
- 查询操作：查看文件、搜索代码、查看日志
- 简单命令：ls, cat, grep, find
- 信息查看：git status, git log, ps aux
- **安全研究**：PoC 编写、漏洞验证（直接使用 poc-exploit skill）

---

## 流程图

```digraph
brainstorming {
  node [shape=box, style=rounded, fontname="Arial"]
  edge [fontname="Arial", fontsize=10]

  start [label="开始 brainstorming", shape=ellipse, style=filled, fillcolor=lightblue]
  explore [label="探索项目上下文\n检查文件结构、文档、最近提交"]
  clarify [label="提出澄清问题\n一次一个，理解目的、约束、成功标准"]
  propose [label="提出 2-3 个方案\n使用 AskUserQuestion 让用户选择"]
  present [label="呈现设计\n架构、组件、数据流、错误处理、测试"]
  approve [label="使用 AskUserQuestion 等待用户批准\n⚠️ 呈现方案后必须立即停止！", shape=diamond, style=filled, fillcolor=yellow]
  modify [label="根据用户反馈修改", shape=ellipse]
  write_doc [label="撰写设计文档\n保存到 docs/specs/"]
  call_planner [label="调用 research-planner agent\n生成执行计划", shape=ellipse, style=filled, fillcolor=lightgreen]

  start -> explore
  explore -> clarify
  clarify -> propose
  propose -> present
  present -> approve

  approve -> modify [label="需要修改"]
  modify -> present

  approve -> write_doc [label="批准"]
  write_doc -> call_planner

  {rank=same; modify approve}
}
```

---

## 执行流程

### 1. 探索项目上下文

```bash
# 检查文件结构
ls -la
tree -L 2

# 查看文档
cat README.md
cat CLAUDE.md

# 查看最近提交
git log --oneline -10
```

**目的**：理解当前项目状态、技术栈、代码结构

---

### 2. 提出澄清问题

**一次一个**，循序渐进地理解：

- 目的：为什么要做这个？
- 约束：有什么限制？
- 成功标准：如何判断成功？

**示例**：
```
Q1: 这个功能的主要目的是什么？
A: [用户回答]

Q2: 目标用户是谁？
A: [用户回答]

Q3: 有什么技术限制？
A: [用户回答]
```

---

### 3. 提出 2-3 个方案（使用 AskUserQuestion）

**必须使用 AskUserQuestion 工具让用户选择方案**

```markdown
## 方案选择

请选择技术方案：
```

**使用 AskUserQuestion 工具**：
- 问题："请选择技术方案"
- 选项：
  - "方案 A：JWT（推荐）- 无状态、易于扩展，但无法主动失效"
  - "方案 B：Session - 可控制、安全性高，但需要存储、扩展性差"
  - "方案 C：OAuth 2.0 - 第三方登录，但实现复杂"

- multiSelect: false

**用户选择后才能继续下一步**

---

### 4. 呈现设计

**按复杂度分节**呈现：

#### 架构设计

采用模块化架构，分为三个层次：
1. UI 层：负责用户交互
2. 业务逻辑层：处理数据
3. 数据访问层：与后端通信

#### 组件结构

- LoginForm：登录表单
- AuthProvider：认证上下文
- API：API 客户端

#### 数据流

```
用户输入 → LoginForm → AuthProvider → API → 后端
                              ↓
                         存储到 localStorage
```

#### 错误处理

- 网络错误：显示友好提示
- 认证失败：显示错误消息
- 表单验证：实时反馈

#### 测试策略

- 单元测试：组件、工具函数
- 集成测试：API 交互
- E2E 测试：完整登录流程

---

### ⛔ 工具调用强制要求（CRITICAL）

**呈现设计方案后，必须立即执行以下操作**：

**步骤 1：调用 AskUserQuestion 工具**

```xml
<tool_calls>
<invoke name="AskUserQuestion">
<parameter name="questions">[{
  "question": "设计方案已完成，请选择下一步操作",
  "header": "设计批准",
  "options": [
    {
      "label": "批准并开始规划",
      "description": "批准设计方案，进入 research-planner 任务规划阶段"
    },
    {
      "label": "需要修改方案",
      "description": "对设计方案提出修改意见"
    },
    {
      "label": "跳过设计阶段",
      "description": "跳过设计，直接开始实现"
    }
  ],
  "multiSelect": false
}]</parameter>
</invoke>
</tool_calls>
```

**步骤 2：工具调用后立即停止**

- ✅ 调用 AskUserQuestion 工具
- ❌ 禁止输出任何后续文本
- ❌ 禁止创建任何文件
- ❌ 禁止执行任何代码
- ❌ 禁止调用任何其他工具

**步骤 3：等待系统返回用户选择**

系统会显示 UI 让用户选择，然后将用户选择返回给你。

**收到用户选择后**：
- 如果选择"批准并开始规划" → 撰写设计文档 → 调用 research-planner
- 如果选择"需要修改方案" → 根据意见修改 → 再次调用 AskUserQuestion
- 如果选择"跳过设计阶段" → 直接调用 research-planner

**示例对话**：
```
AI: [设计方案输出完成]

[使用 AskUserQuestion 工具]
问题：设计方案已完成，请选择下一步操作
选项：
- "批准并开始规划"
- "需要修改方案"
- "跳过设计阶段"

[AI 等待用户选择...]

用户: [选择"批准并开始规划"]

AI: 收到用户批准。
    ↓
    撰写设计文档 → 调用 research-planner...
```

---

### 5. 撰写设计文档

**用户批准后**，撰写设计文档并保存。

**重要**：所有与任务相关的内容都必须在**项目目录**内，而不是 `/workspace` 根目录。

**项目目录结构**：参见 `CLAUDE.md` 中的"项目目录结构"定义

**设计文档路径**：`xxx-project/docs/specs/YYYY-MM-DD-<topic>-design.md`

**创建步骤**：
1. 确认项目目录已创建（如果未创建，先创建 `mkdir xxx-project && cd xxx-project && git init`）
2. 在项目目录下创建 `docs/specs/` 目录（`mkdir -p docs/specs`）
3. 撰写设计文档

**内容**：
```markdown
# [Topic] 设计文档

## 概述
[功能描述]

## 需求分析
[用户需求]

## 方案选择
- 方案 1：[描述]
- 方案 2：[描述]
- **推荐方案**：[方案名称]
- **选择原因**：[理由]

## 设计
### 架构设计
[架构描述]

### 组件结构
[组件列表]

### 数据流
[数据流描述]

### 错误处理
[错误处理策略]

### 测试策略
[测试计划]

## 实现计划
[下一步行动]
```

---

### 6. 调用 research-planner agent

**撰写设计文档后**，调用 research-planner agent 生成执行计划：

```
设计方案已获得用户批准，设计文档已保存到 xxx-project/docs/specs/。

现在调用 research-planner agent 生成执行计划...
```

> **brainstorming vs research-planner 的区别**：
> - **brainstorming（设计阶段）**：探索多种技术方案、架构设计、组件设计
> - **research-planner（规划阶段）**：拆解任务、制定执行计划、识别风险和依赖
> - **流程**：brainstorming → 用户批准 → research-planner → 执行

---

## 🚫 禁止行为

**绝对禁止**：

- ❌ **不要在输出方案后立即继续**
- ❌ **不要自动写设计文档**
- ❌ **不要自动进入实现阶段**
- ❌ **不要创建任何文件**
- ❌ **不要调用任何实现技能**（dev, tdd-guide 等）

**重要声明**：

> **Do NOT invoke any implementation skill or agent (dev, tdd-guide, etc.) until you have presented a design and the user has approved it.**
>
> **This applies to EVERY project regardless of perceived simplicity.**
>
> **All creative work must go through the design exploration process first.**

---

## 设计原则

### 1. 隔离与清晰

**将系统拆成职责单一的小单元**

每个单元必须能回答：
- 它做什么？
- 如何使用？
- 它依赖什么？

**单元必须可独立理解与测试**

### 2. 文件大小

**文件过大通常意味着职责不清**

- 警惕：超过 300 行
- 危险：超过 500 行
- 考虑拆分

### 3. 在现有代码库中工作

- 先理解现有结构
- 遵循现有模式
- 如果现有代码影响当前工作，可提出针对性改进
- **不要提出与当前目标无关的重构**

---

## 必须完成的检查清单

按顺序完成每一项：

- [ ] 探索项目上下文
- [ ] 提出澄清问题（一次一个）
- [ ] 提出 2-3 个方案（使用 AskUserQuestion）
- [ ] 呈现设计（架构、组件、数据流、错误处理、测试）
- [ ] 使用 AskUserQuestion 等待用户批准
- [ ] 撰写设计文档（用户批准后）
- [ ] 调用 research-planner agent

---

## 示例：添加登录功能

```
# 1. 探索项目上下文
[检查现有代码，发现没有认证]

# 2. 澄清问题
Q: 需要支持哪些登录方式？
A: 邮箱密码 + 第三方登录（Google、GitHub）

Q: 是否需要多因素认证？
A: 暂时不需要

# 3. 提出方案
[使用 AskUserQuestion]
问题：请选择认证方案
选项：
- "方案 A：JWT（推荐）"
- "方案 B：Session"
- "方案 C：OAuth 2.0"

用户选择：方案 A

# 4. 呈现设计
[分节呈现架构、组件、数据流、错误处理、测试]

# 5. 等待批准
[使用 AskUserQuestion]
问题：设计方案已完成，请选择下一步操作
选项：
- "批准并开始规划"
- "需要修改方案"
- "跳过设计阶段"

用户选择：批准并开始规划

# 6. 撰写设计文档
保存到 login-project/docs/specs/2026-03-16-login-design.md

# 7. 调用 research-planner
设计方案已获得用户批准，设计文档已保存。
现在调用 research-planner agent 生成执行计划...
```

---

**记住**：所有创造性工作都必须先经过设计探索。这是确保项目成功的关键步骤。
