# Stage 01: Task Init（任务初始化）

## 目标

创建任务记录，检查依赖，初始化任务状态。

## 触发条件

- Stage 00: Planning 已完成
- 模式选择已确定
- 用户已确认执行

## 执行步骤

### 第一步：生成任务 ID

生成唯一的任务 ID：

```bash
task_id="task-$(date +%Y%m%d-%H%M%S)"
echo $task_id
```

**检查点**：
- [ ] 任务 ID 已生成
- [ ] 任务 ID 唯一
- [ ] 任务 ID 格式正确

### 第二步：创建状态文件目录

```bash
mkdir -p .claude/task_states
mkdir -p .claude/task_logs
```

**检查点**：
- [ ] task_states 目录已创建
- [ ] task_logs 目录已创建

### 第三步：创建初始状态文件

**标准模式**（简化格式）：

```bash
cat > .claude/task_states/task-{id}.json << EOF
{
  "task_id": "task-{id}",
  "status": "pending",
  "mode": "standard",
  "created_at": "$(date -Iseconds)",
  "current_stage": "init"
}
EOF
```

**完整模式**（完整格式）：

```bash
cat > .claude/task_states/task-{id}.json << EOF
{
  "task_id": "task-{id}",
  "status": "running",
  "current_stage": "init",
  "start_time": "$(date -Iseconds)",
  "stages": {
    "planning": {"status": "completed", "start": "...", "end": "..."},
    "init": {"status": "in_progress", "start": "$(date -Iseconds)"},
    "git_prepare": {"status": "pending"},
    "knowledge": {"status": "pending"},
    "execution": {"status": "pending"},
    "quality_gate": {"status": "pending"},
    "completion": {"status": "pending"}
  },
  "agents": [],
  "errors": [],
  "logs": ".claude/task_logs/task-{id}.log"
}
EOF
```

**检查点**：
- [ ] 状态文件已创建
- [ ] 状态文件格式正确
- [ ] JSON 格式有效

### 第四步：创建日志文件

```bash
touch .claude/task_logs/task-{id}.log
echo "[$(date -Iseconds)] [STAGE] Task Init: Started" >> .claude/task_logs/task-{id}.log
```

**检查点**：
- [ ] 日志文件已创建
- [ ] 初始日志已记录

### 第五步：检查任务依赖

读取 `.claude/task_dependencies.json`，检查当前任务的依赖：

```bash
if [ -f .claude/task_dependencies.json ]; then
  dependencies=$(jq -r ".dependencies[\"$task_id\"] // []" .claude/task_dependencies.json)
  echo "Dependencies: $dependencies"
fi
```

**依赖检查**：
- 如果有未完成的依赖任务，等待依赖完成
- 如果所有依赖已完成，继续执行
- 如果没有依赖，继续执行

**检查点**：
- [ ] 依赖关系已检查
- [ ] 依赖任务已完成（或无依赖）
- [ ] 可以继续执行

### 第六步：更新任务队列

将任务添加到队列：

```bash
jq ".queue += [\"$task_id\"] | .pending += [\"$task_id\"]" .claude/task_queue.json > .claude/task_queue.json.tmp
mv .claude/task_queue.json.tmp .claude/task_queue.json
```

**检查点**：
- [ ] 任务已添加到队列
- [ ] 队列文件已更新
- [ ] JSON 格式有效

## 完成标志

当以下条件满足时，本阶段完成：

- [ ] 任务 ID 已生成
- [ ] 状态文件已创建
- [ ] 日志文件已创建
- [ ] 依赖关系已检查
- [ ] 任务已添加到队列
- [ ] 状态已更新为 "running"（完整模式）

## 失败处理

- **目录创建失败**：检查权限，询问用户
- **JSON 格式错误**：检查格式，重新创建
- **依赖未满足**：等待依赖完成或取消任务

## 超时处理

- **超时时间**：30 秒
- **超时后操作**：记录超时，询问用户是否继续

---

**下一步**：Stage 02: Git Prepare（Git 准备）
