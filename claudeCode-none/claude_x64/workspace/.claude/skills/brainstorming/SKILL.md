---
name: brainstorming
description: 触发于用户明确要求先做设计探索、比较多个方案或发散实现方向的任务。不要把它当成所有创造性工作的全局前置入口；顶层路由仍由 workspace/CLAUDE.md 决定。
disable-model-invocation: false
---

# 设计探索技能（Brainstorming）

## Trigger

### TRIGGER WHEN
- 用户明确要求“先 brainstorm / 先发散方案 / 先比较设计方向 / 先做设计探索”
- 任务已经确定需要先做方案探索，但目标是比较 2–3 个设计方向，而不是直接进入实现规划
- 需要先讨论架构取舍、组件划分、交互方案或实现方向，再决定后续计划
- 需要把多个可行方案整理成用户可选择的设计选项

### DO NOT TRIGGER WHEN
- `workspace/CLAUDE.md` 已经可以直接判定为 direct execution 的小任务
- 任务只是常规 Plan Mode 规划，不需要额外的发散式设计探索
- 任务本质上是安全研究、漏洞审计、PoC 验证、逆向分析或漏洞分类
- 用户已经给出了明确实施路径，只需要执行或拆解计划
- 任务只是查询、读文件、简单修复、文档修改或配置调整

### USE WITH
- 顶层路由以 `workspace/CLAUDE.md` 为准；本 skill 不覆盖 direct execution / must plan first / must use agent 规则
- 设计方向确定后，再交给 `planner`、Plan Mode 或对应实现 agent / skill
- 安全研究场景优先交给 `web-whitebox-audit`、`poc-exploit`、`js-reverse`、`binary-reverse`、`iot-audit` 等专用 skill
- 安全工具开发场景在需要先比较设计方向时可短暂配合 `secdev`

### EXAMPLE PROMPTS
- “先帮我发散几个设计方向，再决定怎么做”
- “这个功能先别写，先给我 3 个方案比较一下”
- “帮我设计一下这个系统该怎么拆模块”
- “先 brainstorm 一下实现路径”

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
  call_planner [label="调用 planner agent\n生成执行计划", shape=ellipse, style=filled, fillcolor=lightgreen]

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
      "description": "批准设计方案，进入 planner 任务规划阶段"
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
- 如果选择"批准并开始规划" → 撰写设计文档 → 调用 planner
- 如果选择"需要修改方案" → 根据意见修改 → 再次调用 AskUserQuestion
- 如果选择"跳过设计阶段" → 直接调用 planner

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
    撰写设计文档 → 调用 planner...
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

### 6. 调用 planner agent

**撰写设计文档后**，调用 planner agent 生成执行计划：

```
设计方案已获得用户批准，设计文档已保存到 xxx-project/docs/specs/。

现在调用 planner agent 生成执行计划...
```

> **brainstorming vs planner 的区别**：
> - **brainstorming（设计阶段）**：探索多种技术方案、架构设计、组件设计
> - **planner（规划阶段）**：拆解任务、制定执行计划、识别风险和依赖
> - **流程**：brainstorming → 用户批准 → planner → 执行

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
- [ ] 调用 planner agent

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

# 7. 调用 planner
设计方案已获得用户批准，设计文档已保存。
现在调用 planner agent 生成执行计划...
```

---

**记住**：所有创造性工作都必须先经过设计探索。这是确保项目成功的关键步骤。
