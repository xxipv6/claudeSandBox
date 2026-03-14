# Stage 02: Git Prepare（Git 准备）

## 目标

Git 前置准备，创建任务分支（仅完整模式）。

## 触发条件

- Stage 01: Task Init 已完成
- 任务状态为 "running"

## 执行步骤

### 第一步：检查 Git 仓库

```bash
if [ ! -d .git ]; then
  echo "Not a Git repository"
  exit 1
fi
```

**检查点**：
- [ ] 确认在 Git 仓库中
- [ ] Git 可用

### 第二步：检查当前分支

```bash
current_branch=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: $current_branch"
```

**检查点**：
- [ ] 当前分支已识别
- [ ] 工作目录干净（或已保存状态）

### 第三步：创建任务分支（仅完整模式）

**完整模式**：创建任务分支

```bash
git checkout -b task-{id}
```

**标准模式**：可选，询问用户是否创建分支

**检查点**：
- [ ] 任务分支已创建（完整模式）
- [ ] 已切换到新分支
- [ ] 分支名称正确

### 第四步：记录分支信息

将分支信息记录到状态文件：

```bash
jq ".branch = \"task-{id}\"" .claude/task_states/task-{id}.json > .claude/task_states/task-{id}.json.tmp
mv .claude/task_states/task-{id}.json.tmp .claude/task_states/task-{id}.json
```

**检查点**：
- [ ] 分支信息已记录
- [ ] 状态文件已更新

### 第五步：记录日志

```bash
echo "[$(date -Iseconds)] [STAGE] Git Prepare: Created branch task-{id}" >> .claude/task_logs/task-{id}.log
```

**检查点**：
- [ ] 日志已记录
- [ ] 日志格式正确

## 模式差异

| 特性 | 标准模式 | 完整模式 |
|------|----------|----------|
| 创建分支 | 可选 | 必须 |
| 分支命名 | 无规范 | task-{id} |
| 失败处理 | 继续执行 | 停止并询问 |

## 失败处理

### Git 操作失败

**分支创建失败**：
- 检查 Git 状态
- 询问用户是否继续（不创建分支）
- 记录错误到日志

**切换分支失败**：
- 检查是否有未提交的更改
- 询问用户是否暂存更改
- 记录错误到日志

**标准模式失败处理**：
- 可以选择不创建分支，继续执行
- 记录决策到日志

**完整模式失败处理**：
- 必须创建分支才能继续
- 记录错误到状态文件
- 询问用户是否手动处理

## 回滚机制

如果后续步骤需要回滚：

```bash
# 删除任务分支
git checkout main
git branch -D task-{id}

# 或保留分支用于调试
# 保留分支，但记录失败状态
```

## 完成标志

当以下条件满足时，本阶段完成：

### 完整模式
- [ ] Git 仓库已确认
- [ ] 任务分支已创建
- [ ] 已切换到任务分支
- [ ] 分支信息已记录
- [ ] 日志已记录

### 标准模式
- [ ] Git 仓库已确认（或跳过）
- [ ] 分支创建决策已记录
- [ ] 日志已记录

## 超时处理

- **超时时间**：60 秒
- **超时后操作**：记录超时，询问用户是否继续（标准模式可以跳过）

---

**下一步**：Stage 03: Knowledge（读取知识库）
