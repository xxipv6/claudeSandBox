# Single vs Multi-Agent Strategy

## 核心规则

默认单 Agent。

在做出 Single-Agent / Multi-Agent 决策前，必须先读取本文件；不要只凭记忆判断，也不要退回 Claude Code 默认行为。

满足任一条件时，升级为 Multi-Agent：
- 研究路径出现明显分叉
- 需要不同角色同时提供证据（逆向 + 审计 + PoC）
- 多个攻击面或模块可独立并行分析
- 单 Agent 会明显拖慢定位或验证
- 失败成本高，需要并行降低不确定性
- 已经触发 `Must Use Agent`，且存在 2 个以上互不依赖的开放子任务

如果只是目标清晰、攻击面单一、路径明确，保持 Single Agent。

---

## Single Agent

适用场景：
- 单一目标
- 单一攻击面或模块
- 验证路径明确
- 不需要并行收集证据

工作方式：
- 主 Agent 负责决策、执行、分析与结论
- 只在关键节点记录
- 不要因为“可以开 Agent”就机械并行

---

## Multi-Agent

适用场景：
- 多条合理路径需要同时探索
- 需要多个专业视角交叉验证
- 多个模块之间无依赖，可并行分析
- 需要同时做分析与验证

工作方式：
- 主 Agent 负责拆分、调度、整合
- Specialist Agents 负责搜索、分析、验证和证据
- 默认后台并行执行
- 主 Agent 不得把开放式探索、并行证据收集或子任务分解全部自己做完再总结

---

## Runtime Agent Mapping

在 Claude Code Agent tool 中，统一按运行时 subagent 选择，不要使用不存在的角色名直接调用。

项目角色到运行时 Agent 的映射：
- `planner` -> `Plan`
- `system-architect` -> `Plan`
- `research` -> `Explore` 或 `general-purpose`
- `dev` -> `general-purpose`
- `reviewer` -> `general-purpose`
- `doc-updater` -> `general-purpose`

基础选择规则：
- 开放式搜索、代码库理解、大范围定位：`Explore`
- 方案设计、架构拆解、实施分解：`Plan`
- 通用实现、验证、审查、文档更新：`general-purpose`
- Claude Code / Claude API / Agent SDK 问题：`claude-code-guide`

---

## Escalation Rules

满足任一条件时，必须从 Single-Agent 升级为 Multi-Agent：
- 搜索超过 3 轮仍未稳定定位
- 同时存在“定位问题”与“验证假设”两个可独立推进的任务
- 同时存在“代码搜索”与“架构判断”两个可独立推进的任务
- 同时存在“静态分析”与“PoC/动态验证”两个可独立推进的任务
- 用户明确要求并行，且满足并行安全条件

如果探索后重新收敛为单一路径，应降回 Single-Agent。

---

## Recommended Patterns

研究/审计：
- 开放式仓库探索：`Explore`
- 架构设计：`Plan`
- 安全审计：`Explore` + `general-purpose`
- 漏洞复现/验证：`general-purpose`
- 审计 + PoC 并行：`Explore` + `general-purpose`

开发/维护：
- 大范围定位 + 实现拆解：`Explore` + `Plan`
- 实现 + 审查并行：`general-purpose` + `general-purpose`
- 重构 + 验证并行：`Plan` + `general-purpose`
- 单模块开发或小 bug 修复：单 Agent 或 `general-purpose`

---

## Parallel Safety Checks

并行前确认：
1. 前置条件已完成
2. 任务之间无依赖
3. 不会写同一资源
4. 不会产生数据竞争
5. 主 Agent 能清楚描述每个子 Agent 的目标与边界

不满足以上条件时，改回串行。

---

## Hard Constraints

- 命中 Multi-Agent 条件时，不要继续让主 Agent 独自完成所有开放式探索
- 需要并行时，优先在同一条消息中一次性发起多个 Agent tool 调用
- 不要用 `EnterPlanMode` 代替本文件里的 Agent Strategy 判断
- Plan 与 Agent 同时命中时，先完成规则读取和方案拆解，再决定单 Agent 还是多 Agent
