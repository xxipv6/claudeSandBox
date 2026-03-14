# Stage 01: Task Initialization

## 目标

创建任务记录，检查任务依赖

## 职责

- 生成任务 ID
- 创建任务记录
- 检查任务依赖
- 管理任务状态

## 前置条件

- Stage 00 (planning) 完成
- 有 task-planner 的规划结果

## 执行步骤（强制）

### 步骤 1：生成任务 ID（强制）

**格式**：`task-{timestamp}-{sequence}`

**示例**：
- `task-20250314-001`
- `task-20250314-002`

**检查点**：
- [ ] 已生成任务 ID
- [ ] 任务 ID 唯一

### 步骤 2：读取任务依赖配置（强制）

**现在读取**：`.claude/task_dependencies.json`

**检查内容**：
- 是否存在依赖此任务的其他任务
- 依赖类型（required 或 optional）
- 依赖状态

**检查点**：
- [ ] 已读取依赖配置
- [ ] 已解析依赖关系

### 步骤 3：创建任务记录（强制）

**写入文件 1**：`.claude/task_queue.json`

**文件格式**：
```json
{
  "version": "1.0",
  "tasks": [
    {
      "task_id": "task-20250314-001",
      "name": "任务名称",
      "status": "pending",
      "priority": "P1",
      "created_at": "2025-03-14T10:00:00Z",
      "updated_at": "2025-03-14T10:00:00Z"
    }
  ]
}
```

**写入文件 2**：`.claude/task_states/task-{id}.json`

**文件格式**：
```json
{
  "task_id": "task-20250314-001",
  "name": "任务名称",
  "status": "pending",
  "status_history": [
    {
      "status": "pending",
      "timestamp": "2025-03-14T10:00:00Z",
      "reason": "Task created"
    }
  ],
  "current_stage": "01-task-init",
  "current_step": "Initializing task",
  "progress": 0,
  "created_at": "2025-03-14T10:00:00Z",
  "updated_at": "2025-03-14T10:00:00Z"
}
```

**检查点**：
- [ ] 已创建任务队列记录
- [ ] 已创建任务状态文件
- [ ] 文件格式正确

### 步骤 4：检查任务依赖（强制）

**检查逻辑**：
1. 读取 task-planner 的规划结果
2. 检查是否有依赖任务
3. 检查依赖任务是否完成
4. 决定任务状态

**状态决策**：
- 无依赖 → 状态改为 `running`
- 有依赖且满足 → 状态改为 `running`
- 有依赖但不满足 → 状态改为 `paused`

**检查点**：
- [ ] 已检查依赖任务
- [ ] 已决定任务状态

### 步骤 5：更新任务状态（强制）

**状态转换**：
```
pending → running  (依赖满足)
pending → paused  (依赖不满足)
```

**更新文件**：`.claude/task_states/task-{id}.json`

**更新内容**：
- status: "running" 或 "paused"
- status_history: 添加状态转换记录
- updated_at: 当前时间

**检查点**：
- [ ] 已更新任务状态
- [ ] 已记录状态转换历史

## 输出

- **task_id**（任务 ID）
- **task_status**（任务状态：pending/running/paused）
- **task_queue**（任务队列）
- **task_state**（任务状态文件）

## 错误处理

| 错误类型 | 处理策略 |
|---------|---------|
| 任务 ID 冲突 | 重新生成任务 ID |
| 任务记录创建失败 | 任务状态改为 failed |
| 依赖检查失败 | 任务状态改为 failed |
| 状态更新失败 | 任务状态改为 failed |

## 状态转换

```
pending → running  (依赖满足)
pending → paused  (依赖不满足)
```

## 授权说明

此阶段不需要特殊授权。

## 超时设置

- 默认超时：30 秒
- 超时后自动终止

## 下一阶段

完成后进入 **Stage 02: Git Preparation**

## 特殊情况

### 情况 1：任务状态为 paused

如果任务状态为 `paused`（依赖不满足）：
- 停止执行后续阶段
- 等待依赖任务完成
- 依赖任务完成后触发本任务继续

### 情况 2：依赖任务失败

如果依赖任务失败：
- 检查依赖类型（required/optional）
- required → 本任务状态改为 failed
- optional → 继续执行（降级模式）
