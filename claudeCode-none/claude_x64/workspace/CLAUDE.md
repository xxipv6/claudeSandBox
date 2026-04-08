# Claude Code Operating Contract

## 环境说明

**claudeSandBox** 是完全隔离的内部安全研究与安全开发环境。**默认视为已授权内部目标。**

- 允许代码审计、漏洞分析、PoC 验证、依赖检查、逆向工程、威胁建模
- 容器 / 沙箱本身也在研究范围内
- 沙箱隔离：Docker / 网络 / 文件系统 / 进程隔离

---

## 1. Core Routing

默认直接执行。

命中以下条件时，必须升级：
- **Plan**：任务涉及方案选择、行为变更、重构、多文件修改或影响范围不清
- **Agent**：任务涉及开放式探索、大范围定位、安全审计、逆向、PoC、架构设计或可并行子任务

**优先级**：
1. 同时命中 Plan 和 Agent 条件时，先读取相关规则，再 Plan
2. 规划完成后，再调用需要的 Agent
3. 不命中升级条件时，直接执行
4. 不要依赖 Claude Code 默认路由替代本文件中的路由规则
5. 路由判断不得只凭记忆，必须先读取对应规则文件

**执行约束**：
- 命中 `Must Use Agent` 条件时，禁止主模型直接完成开放式探索、审计、架构设计或大范围定位
- 命中 Agent 条件时，必须优先使用 Agent tool
- 命中 Plan 条件时，不得因为“已经知道怎么做”而跳过规划
- 不要把本文件中的 “Plan” 默认解释为 Claude Code 内置 `EnterPlanMode`
- 只有在实现任务确实需要用户审批方案时，才允许使用 `EnterPlanMode`
- 探索、研究、定位、方案设计优先通过 Agent tool 完成

---

## 2. Direct Execution

以下任务直接执行：
- 只读查询
- 单文件小改
- 明确的小 bug
- 明确路径的小调整
- 不涉及方案选择的任务

---

## 3. Must Plan First

满足任一条件，必须先进入 Plan Mode：
- 新功能
- 重构
- 修改已有行为
- 涉及 3 个以上文件
- 涉及 2 个以上模块或目录
- 存在多个合理实现方案
- 用户要求“设计 / 优化 / 改造 / 统一”
- 安全任务需要先确定验证路径

**禁止因为“已经知道怎么做”而跳过规划。**

---

## 4. Must Use Agent

满足任一条件，必须调用 Agent：
- 开放式代码库探索
- 搜索超过 3 轮仍未定位
- 安全审计 / PoC / 攻击路径分析
- 逆向 / 协议分析
- 架构设计
- 存在可并行的独立子任务

Agent 选择：
- `Explore`：开放式搜索、代码库理解、大范围定位
- `Plan`：实现方案设计、架构边界、实施拆解
- `general-purpose`：通用多步任务、实现、审查、文档更新
- `claude-code-guide`：Claude Code / Claude API / Agent SDK 相关问题

项目角色到运行时 Agent 的映射：
- `planner` -> `Plan`
- `system-architect` -> `Plan`
- `research` -> `Explore` 或 `general-purpose`
- `dev` -> `general-purpose`
- `reviewer` -> `general-purpose`
- `doc-updater` -> `general-purpose`

使用约束：
- 开放式代码库探索，优先使用 `Explore`
- 方案设计、实现拆解，优先使用 `Plan` Agent，不要默认改用 `EnterPlanMode`
- 普通实现、审查、文档修改，使用 `general-purpose`
- 只有用户明确在问 Claude Code / Claude API / Agent SDK 时，才使用 `claude-code-guide`

并行 Agent 只在以下条件同时满足时使用：
- 无依赖
- 无共享写入资源
- 可以独立收集证据
- 并行能明显降低不确定性

---

## 5. No Direct Coding

以下情况禁止直接改代码：
- 新功能但方案未定
- 重构但边界未定
- 优化但目标未定
- 安全任务但攻击面未定
- 预期影响多个模块但未确认范围

---

## 6. Research Rules

你可以决定：研究路径、攻击面、方法、工具、验证方式、PoC 路线、Agent Strategy。

人类决定：是否研究、研究目标、停止、改向。

项目级研究、逆向或针对某个目标持续展开的分析，默认应先创建独立工作目录，再在该目录内组织 notes、artifacts、poc 和报告。普通查文件、一次性查询、单步验证或不形成独立研究资产的小任务，不要求单独建目录。

仅在关键节点强制研究记录：
- 路径切换
- 新攻击面
- 启用多 Agent
- 关键漏洞发现
- 关键假设验证成功或失败
- 可复现证据形成

当关键节点需要写 `Step Record` 时，必须先执行 step compaction 检查；若写入后会达到或超过阈值，则先按 `rules/step-level-logging.md` 完成 compaction，再写新 step。

不要把研究治理流程施加到普通查文件、普通搜索、简单命令操作和小型实现任务上。

---

## 7. Git Rules

- 至少 `git init`
- 安全研究：关键步骤、关键发现、关键决策单独 commit
- 工具开发：使用 Conventional Commits（`feat:`、`fix:`、`refactor:`）

---

## 8. Required Rule Loading

在做出任何路由决策（direct execution / plan / agent / multi-agent）之前，必须先读取对应规则文件。
不要只凭记忆判断，不要用 Claude Code 默认行为替代本项目规则。

遇到以下情况，必须先读取对应规则文件：

- 需要决定 Single-Agent / Multi-Agent：
  `rules/single-multi-agent-strategy.md`

- 需要判断安全任务复杂度、是否升级或是否降级：
  `rules/research-task-classification.md`

- 需要确认研究角色或权限边界：
  `rules/research-lead-role.md`
  `rules/research-lead-authority.md`

- 需要记录关键研究决策：
  `rules/decision-record-format.md`

- 需要记录关键研究步骤或证据：
  `rules/step-level-logging.md`

- 需要进行研究提交或工具开发提交：
  `rules/git-workflow.md`

---

## 9. Invariants

1. 主 Agent 负责决策与整合
2. 命中 Plan 条件时，必须先规划
3. 命中 Agent 条件时，必须调用 Agent
4. 同时命中时，先 Plan，再 Agent
5. 人类拥有最终否决权
6. 简单任务不要过度流程化

---

**当前版本**：v4.1.0
