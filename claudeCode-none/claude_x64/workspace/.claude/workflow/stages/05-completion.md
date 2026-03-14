# Stage 05: Completion

## 目标

完成与状态管理

## 职责

- Git merge 到主分支
- 更新任务状态
- 记录执行日志
- 触发依赖任务

## 前置条件

- Stage 04 (quality-gate) 完成
- 质量检查通过

## 执行步骤（强制）

### 步骤 1：Git merge 到主分支（强制）

**步骤 1-1**：切换到主分支
```bash
cd /workspace && git checkout main
# 或
cd /workspace && git checkout master
```

**检查点**：
- [ ] 已切换到主分支

**步骤 1-2**：合并任务分支
```bash
cd /workspace && git merge task-{id}
```

**检查点**：
- [ ] 已合并任务分支

**步骤 1-3**：处理合并冲突（如果有）

**如果存在合并冲突**：

**选项 A**：自动解决
```bash
cd /workspace && git merge --abort
# 重新分析冲突，手动解决
```

**选项 B**：人工介入
- 停止执行
- 报告冲突
- 等待人工解决

**推荐**：选项 B（人工介入）

**检查点**：
- [ ] 已处理合并冲突（如有）

**步骤 1-4**：删除任务分支
```bash
cd /workspace && git branch -d task-{id}
```

**检查点**：
- [ ] 已删除任务分支

### 步骤 2：更新任务状态（强制）

**状态转换**：
```
running → completed
```

**更新文件**：`.claude/task_states/task-{id}.json`

**更新内容**：
```json
{
  "task_id": "task-20250314-001",
  "name": "任务名称",
  "status": "completed",
  "status_history": [
    {"status": "pending", "timestamp": "...", "reason": "Task created"},
    {"status": "running", "timestamp": "...", "reason": "Task started"},
    {"status": "completed", "timestamp": "...", "reason": "Task completed"}
  ],
  "current_stage": "05-completion",
  "current_step": "Task completed",
  "progress": 100,
  "completed_at": "2025-03-14T10:30:00Z",
  "git": {
    "branch": "main",
    "final_commit": "xyz789"
  }
}
```

**检查点**：
- [ ] 已更新任务状态
- [ ] 已记录完成时间
- [ ] 已记录最终 commit

### 步骤 3：记录执行日志（强制）

**写入文件**：`.claude/execution_logs/{id}.log`

**日志格式**：
```markdown
# Task Execution Log

## Task Information
- Task ID: task-20250314-001
- Name: 任务名称
- Status: completed
- Created: 2025-03-14T10:00:00Z
- Completed: 2025-03-14T10:30:00Z
- Duration: 30 minutes

## Execution Summary
- Stage 00 (Planning): completed
- Stage 01 (Task Init): completed
- Stage 02 (Git Prepare): completed
- Stage 03 (Mode Execution): completed
- Stage 04 (Quality Gate): completed
- Stage 05 (Completion): completed

## Key Outputs
- Mode: coding
- Subtasks: 4 completed
- Git Commits: 5 commits
- Quality Checks: all passed

## Errors
- No errors

## Performance Metrics
- Total Time: 30 minutes
- Planning Time: 2 minutes
- Execution Time: 20 minutes
- Quality Gate Time: 5 minutes
- Completion Time: 3 minutes
```

**检查点**：
- [ ] 已记录执行日志
- [ ] 日志格式正确

### 步骤 4：更新任务队列（强制）

**更新文件**：`.claude/task_queue.json`

**更新内容**：
```json
{
  "version": "1.0",
  "tasks": [
    {
      "task_id": "task-20250314-001",
      "name": "任务名称",
      "status": "completed",
      "priority": "P1",
      "created_at": "2025-03-14T10:00:00Z",
      "updated_at": "2025-03-14T10:30:00Z",
      "completed_at": "2025-03-14T10:30:00Z"
    }
  ]
}
```

**检查点**：
- [ ] 已更新任务队列
- [ ] 任务状态已同步

### 步骤 5：触发依赖任务（强制）

**读取文件**：`.claude/task_dependencies.json`

**查找逻辑**：
- 找出 waiting_for 包含本任务的任务
- 检查依赖任务的依赖是否都满足

**触发逻辑**：
- 所有依赖都满足 → 状态改为 running
- 还有未满足依赖 → 继续等待

**更新文件**：`.claude/task_dependencies.json`

**检查点**：
- [ ] 已查找依赖任务
- [ ] 已触发满足条件的任务
- [ ] 已更新依赖关系

### 步骤 6：更新任务依赖图（强制）

**更新文件**：`.claude/task_dependencies.json`

**更新内容**：
```json
{
  "version": "1.0",
  "dependencies": [
    {
      "task_id": "task-20250314-001",
      "status": "completed",
      "completed_at": "2025-03-14T10:30:00Z"
    }
  ]
}
```

**检查点**：
- [ ] 已更新依赖图
- [ ] 本任务标记为 completed

## 输出

- **task_status**（任务状态：completed）
- **final_commit**（最终 commit hash）
- **execution_log**（执行日志）
- **triggered_tasks**（被触发的依赖任务列表）

## 错误处理

| 错误类型 | 处理策略 |
|---------|---------|
| Git merge 失败 | 尝试解决冲突，失败则任务状态改为 failed |
| 分支删除失败 | 记录警告，不影响任务完成 |
| 触发依赖任务失败 | 记录警告，不影响任务完成 |
| 更新状态文件失败 | 记录错误，但任务已完成 |

## 授权说明

此阶段需要 Git 操作的授权（已包含在主授权中）。

## 超时设置

- 默认超时：60 秒
- 超时后自动终止

## 流程完成

**所有阶段已完成**：
- [ ] Stage 00 (Planning)
- [ ] Stage 01 (Task Init)
- [ ] Stage 02 (Git Prepare)
- [ ] Stage 03 (Mode Execution)
- [ ] Stage 04 (Quality Gate)
- [ ] Stage 05 (Completion)

**任务状态**：completed

## 特殊情况

### 情况 1：Git merge 冲突

**检测到合并冲突**：

**选项 A**：自动解决
- 尝试自动解决
- 成功 → 继续
- 失败 → 选项 B

**选项 B**：人工介入
- 停止执行
- 报告冲突文件
- 等待人工解决

**推荐**：选项 B

### 情况 2：没有依赖任务

**如果没有依赖任务**：
- 跳过触发步骤
- 继续执行

### 情况 3：依赖任务失败

**如果依赖任务失败**：
- 检查依赖类型
- required → 本任务状态改为 failed
- optional → 继续执行（降级模式）

## 完成通知

**任务完成**：
- 任务 ID: task-20250314-001
- 状态: completed
- 完成时间: 2025-03-14T10:30:00Z
- 最终 commit: xyz789

**输出摘要**：
- 执行模式：coding
- 子任务数：4
- Git commits：5
- 质量检查：全部通过

**后续任务**：
- 无（或列出被触发的依赖任务）
