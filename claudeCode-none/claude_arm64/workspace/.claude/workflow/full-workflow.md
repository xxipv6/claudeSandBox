# 完整流程参考（仅用于完整模式）

> **注意**：这是参考文档，不是配置文件。
> 只有在环境变量 `CLAUDE_FULL_MODE=1` 且用户明确要求时才使用。

---

## 完整模式执行流程

### 前置条件
- 环境变量 `CLAUDE_FULL_MODE=1` 已设置
- 用户明确说"完整分析"或"完整编排"
- 任务是架构级别的

### 执行阶段

#### Stage 00: Planning
- 启动 task-planner 制定执行计划
- 输出：`.claude/task_plans/task-{id}.json`

#### Stage 01: Task Init
- 创建任务记录和状态文件
- 创建 `.claude/task_queue.json`
- 创建 `.claude/task_states/task-{id}.json`

#### Stage 02: Git Prepare
- 初始化 Git（如果需要）
- 创建任务分支：`task-{id}`
- 记录起点 commit

#### Stage 03: Mode Execution
- 按照 task-planner 的建议执行
- Analysis Mode：启动 2-4 个分析 agents（顺序执行）
- Coding Mode：启动执行 agents
- 更新子任务状态

#### Stage 04: Quality Gate
- 静态分析（语法检查、代码风格）
- 安全扫描（漏洞扫描、依赖检查）
- 自动测试（运行测试、验证功能）
- 失败则触发修复循环（最多 3 次）

#### Stage 05: Completion
- Git merge 到主分支
- 更新任务状态为 completed
- 清理临时文件

---

## Analysis Mode（完整模式）

### 启动的 Agents（顺序执行）
1. **product-manager**：需求与业务目标分析
2. **backend-engineer**：系统结构与状态机分析
3. **frontend-engineer**：输入面与攻击面分析
4. **security-tester**：攻击路径与漏洞分析

### 输出格式

```markdown
## 分析结果

### Goal
[研究目标]

### System Model
[来自 ≥2 个 agent 的系统模型]

### Verified Facts
[已验证的事实，带证据]

### Active Hypotheses
[活跃假设，来自不同视角]

### Rejected Hypotheses
[已否定的假设，含失败路径]

### Key Decisions
[关键决策]

### Artifacts
[产物：流程图、状态机、攻击路径图等]

### Open Questions
[未解决问题]

### Next Actions
[下一步行动，≤3 项]
```

---

## Coding Mode（完整模式）

### 启动的 Agents
- **dev-coder**：所有代码开发
- **script-coder**：安全脚本（按需）
- **ops-engineer**：环境配置（按需）

### 执行流程
1. 按拓扑序排序子任务
2. 逐个执行子任务
3. 每个子任务完成后 Git commit
4. 更新子任务状态

---

## 状态文件格式

### task-state.json
```json
{
  "task_id": "task-001",
  "status": "running",
  "current_stage": "03-mode-execution",
  "progress": 60
}
```

### subtask-state.json
```json
{
  "subtask_id": "subtask-001",
  "status": "completed",
  "dependencies": ["subtask-000"]
}
```

---

## 超时设置

| 操作 | 超时时间 |
|------|---------|
| 单个 agent | 120 秒 |
| Analysis Mode 整体 | 300 秒 |
| Coding Mode 单次输出 | 180 秒 |

---

## 注意事项

1. **顺序执行 agents**，不并发
2. **每个 stage 完成后更新状态文件**
3. **Git commits 记录每个步骤**
4. **失败时询问用户处理策略**
