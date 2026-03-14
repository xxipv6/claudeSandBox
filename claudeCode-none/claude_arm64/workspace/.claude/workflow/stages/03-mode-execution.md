# Stage 03: Mode Execution

## 目标

执行模式（Analysis/Coding）

## 职责

- 根据 task-planner 的建议选择模式
- 执行 Analysis Mode 或 Coding Mode
- 管理子任务执行（Coding Mode）
- 输出结果

## 前置条件

- Stage 02 (git-prepare) 完成
- 有 task-planner 的模式选择建议
- Git 分支已创建

## 执行步骤（强制）

### 步骤 1：读取规划结果（强制）

**现在读取**：`.claude/task_plans/task-{id}.json`

**解析内容**：
- mode: "analysis" 或 "coding"
- subtasks: 子任务列表（Coding Mode）
- required_agents: 需要的 agents

**检查点**：
- [ ] 已读取规划结果
- [ ] 已解析模式选择

### 步骤 2：模式选择（强制）

**根据 task-planner 的建议**：
- mode = "analysis" → 执行 Analysis Mode
- mode = "coding" → 执行 Coding Mode

**检查点**：
- [ ] 已确定执行模式
- [ ] 已准备执行相应模式

### 步骤 3A：执行 Analysis Mode（如果 mode = "analysis")

#### 步骤 3A-1：并发启动分析层 subagents（强制）

**现在读取** agent 定义文件：
- `.claude/agents/product-manager.md`
- `.claude/agents/backend-engineer.md`
- `.claude/agents/frontend-engineer.md`
- `.claude/agents/security-tester.md`

**按照每个 agent 的定义执行**

**检查点**：
- [ ] 已读取所有 agent 定义
- [ ] 已并发启动所有分析层 subagents

#### 步骤 3A-2：等待所有返回（强制）

**等待时间**：
- 单个 subagent：120 秒
- 整体：300 秒

**超时处理**：
- 单个 subagent 超时 → 记录失败，继续等待其他
- 整体超时 → 任务状态改为 failed

**失败处理**：
- 单个 subagent 失败 → 单次重试
- 重试仍失败 → 降级策略（从其他 subagent 补充）

**检查点**：
- [ ] 所有 subagent 已返回
- [ ] 已处理超时和失败

#### 步骤 3A-3：合并结果（强制）

**合并逻辑**：
- 收集所有 subagent 的输出
- 解析冲突
- 剪枝假设
- 综合多视角

**检查点**：
- [ ] 已合并所有结果
- [ ] 已解析冲突

#### 步骤 3A-4：置信度评估（强制）

**评估标准**：
- 高置信度：≥3 个 subagent 一致
- 中置信度：2 个 subagent 一致
- 低置信度：≤1 个 subagent 或冲突严重

**处理逻辑**：
- 低置信度 → 触发反馈循环
- 中/高置信度 → 继续

**检查点**：
- [ ] 已评估置信度
- [ ] 已决定是否触发反馈循环

#### 步骤 3A-5：反馈循环（仅低置信度）（强制）

**循环逻辑**：
1. 识别缺失信息
2. 补充分析（重新启动相关 subagent）
3. 重新评估置信度
4. 最多循环 3 次

**检查点**：
- [ ] 已执行反馈循环（如需要）
- [ ] 置信度已提升或达到最大循环次数

#### 步骤 3A-6：输出 Research Ledger（强制）

**现在读取**：`.claude/workflow/stages/templates/research-ledger.md`

**按照模板格式输出**

**检查点**：
- [ ] 已读取模板
- [ ] 已输出 Research Ledger

#### 步骤 3A-7：Git commit（强制）

**执行命令**：
```bash
cd /workspace && git add .
cd /workspace && git commit -m "Analysis: Task {id} completed"
```

**检查点**：
- [ ] 已提交分析结果
- [ ] Git commit 成功

### 步骤 3B：执行 Coding Mode（如果 mode = "coding")

#### 步骤 3B-1：遍历子任务（强制）

**读取**：`.claude/task_plans/task-{id}.json`

**按拓扑序排序子任务**：
- 无依赖的子任务优先
- 有依赖的子任务等待依赖完成

**检查点**：
- [ ] 已读取子任务列表
- [ ] 已按拓扑序排序

#### 步骤 3B-2：子任务执行循环（强制）

**循环逻辑**：
```
对于每个子任务：
1. 检查子任务依赖是否满足
2. 满足 → 执行子任务
3. 不满足 → 跳过，等待依赖完成
4. 更新子任务状态
5. Git commit
```

**子任务执行步骤**：

**步骤 1**：更新子任务状态
```json
{
  "subtask_id": "subtask-001",
  "status": "running"
}
```

**步骤 2**：读取 coder agent 定义
**现在读取**：`.claude/agents/{agent-name}.md`

**按照定义执行**

**步骤 3**：生成代码
- 输出代码文件
- 输出使用说明

**步骤 4**：Git commit
```bash
cd /workspace && git add .
cd /workspace && git commit -m "Subtask {subtask-id}: {description}"
```

**步骤 5**：更新子任务状态
```json
{
  "subtask_id": "subtask-001",
  "status": "completed"
}
```

**检查点**：
- [ ] 子任务已执行
- [ ] 代码已生成
- [ ] Git commit 成功
- [ ] 子任务状态已更新

#### 步骤 3B-3：处理子任务失败（强制）

**失败处理**：
- 询问用户处理策略
- 选项 A：保留已完成的，跳过失败的
- 选项 B：全部回滚，重新执行
- 选项 C：只重新执行失败的

**检查点**：
- [ ] 已处理子任务失败
- [ ] 已执行用户选择的策略

### 步骤 4：更新任务状态（强制）

**更新文件**：`.claude/task_states/task-{id}.json`

**Analysis Mode 更新**：
```json
{
  "status": "running",
  "current_stage": "03-mode-execution",
  "current_step": "analysis_completed",
  "progress": 60
}
```

**Coding Mode 更新**：
```json
{
  "status": "running",
  "current_stage": "03-mode-execution",
  "current_step": "coding_completed",
  "progress": 60,
  "subtasks": {
    "total": 4,
    "completed": 4,
    "running": 0,
    "pending": 0,
    "failed": 0
  }
}
```

**检查点**：
- [ ] 已更新任务状态
- [ ] 已记录执行进度

## 输出

### Analysis Mode
- **Research Ledger**（分析结果）
- **git_commit**（分析结果 commit）

### Coding Mode
- **代码文件**
- **使用说明**
- **git_commits**（所有子任务的 commits）

## 错误处理

| 错误类型 | 处理策略 |
|---------|---------|
| subagent 启动失败 | 单次重试，仍失败则降级 |
| 子任务执行失败 | 询问用户处理策略 |
| 置信度低（3次循环） | 询问用户是否继续 |
| Git commit 失败 | 任务状态改为 failed |

## 授权说明

此阶段需要启动 agents 的授权（已包含在主授权中）。

## 超时设置

- 默认超时：600 秒
- 单个 subagent：120 秒
- Analysis Mode 整体：300 秒

## 下一阶段

完成后进入 **Stage 04: Quality Gate**

## 特殊情况

### 情况 1：子任务依赖不满足

**检测到依赖不满足**：
- 跳过当前子任务
- 执行其他无依赖的子任务
- 等待依赖完成后再执行

### 情况 2：子任务循环依赖

**检测到循环依赖**：
- 报错
- 停止执行
- 等待人工介入

### 情况 3：用户取消任务

**用户取消**：
- 停止所有正在执行的 subagent/coder
- Git 回滚到起点 commit
- 任务状态改为 cancelled
