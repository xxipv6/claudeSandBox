# Stage 02: Git Preparation

## 目标

Git 前置准备，创建任务分支

## 职责

- 检查项目 Git 状态
- 初始化 Git（如果需要）
- 创建任务分支
- 记录起点 commit

## 前置条件

- Stage 01 (task-init) 完成
- 任务状态为 running

## 执行步骤（强制）

### 步骤 1：确定项目目录（强制）

**检查逻辑**：
1. 确认当前工作目录
2. 确认项目目录（可能需要切换）
3. 记录项目目录路径

**检查点**：
- [ ] 已确定项目目录
- [ ] 已记录目录路径

### 步骤 2：检查项目 Git 状态（强制）

**执行命令**：
```bash
cd /workspace && ls -la | grep .git
```

**检查结果**：
- 存在 .git 目录 → Git 已初始化
- 不存在 .git 目录 → Git 未初始化

**检查点**：
- [ ] 已检查 Git 状态
- [ ] 已决定是否需要初始化

### 步骤 3：初始化 Git（如果需要）（强制）

**如果 Git 未初始化**：

**执行命令**：
```bash
cd /workspace && git init
```

**执行命令**（初始 commit）：
```bash
cd /workspace && git add .
cd /workspace && git commit -m "Initial commit"
```

**检查点**：
- [ ] Git 已初始化（如需要）
- [ ] 已创建初始 commit

### 步骤 4：创建任务分支（强制）

**生成分支名称**：`task-{task_id}`

**执行命令**：
```bash
cd /workspace && git checkout -b task-{task_id}
```

**检查点**：
- [ ] 已创建任务分支
- [ ] 已切换到任务分支

### 步骤 5：记录起点 commit（强制）

**执行命令**：
```bash
cd /workspace && git rev-parse HEAD
```

**执行命令**（Git 状态）：
```bash
cd /workspace && git status
```

**记录内容**：
- 起点 commit hash
- 当前分支名称
- 当前 Git 状态

**检查点**：
- [ ] 已记录起点 commit hash
- [ ] 已记录当前分支名称
- [ ] 已记录当前 Git 状态

### 步骤 6：更新任务状态（强制）

**更新文件**：`.claude/task_states/task-{id}.json`

**更新内容**：
```json
{
  "task_id": "task-20250314-001",
  "status": "running",
  "current_stage": "02-git-prepare",
  "current_step": "Git prepared",
  "git": {
    "branch": "task-20250314-001",
    "start_commit": "abc123",
    "current_commit": "abc123",
    "status": "clean"
  }
}
```

**检查点**：
- [ ] 已更新任务状态
- [ ] 已记录 Git 信息

## 输出

- **git_branch**（任务分支名称）
- **git_start_commit**（起点 commit hash）
- **git_current_commit**（当前 commit hash）
- **git_status**（当前 Git 状态）

## 错误处理

| 错误类型 | 处理策略 |
|---------|---------|
| git init 失败 | 任务状态改为 failed |
| 创建分支失败 | 任务状态改为 failed |
| commit 失败 | 任务状态改为 failed |
| git 命令超时 | 任务状态改为 failed |

## 授权说明

此阶段需要 Git 操作授权（已包含在主授权中）。

## 超时设置

- 默认超时：60 秒
- 超时后自动终止

## 下一阶段

完成后进入 **Stage 03: Mode Execution**

## 特殊情况

### 情况 1：Git 已有未提交的更改

**检测到未提交的更改**：

**选项 A**：stash 更改
```bash
git stash
```

**选项 B**：提交更改
```bash
git add .
git commit -m "WIP: Auto commit before task"
```

**推荐**：选项 A（stash）

### 情况 2：任务分支已存在

**如果任务分支已存在**：

**选项 A**：删除旧分支，重新创建
```bash
git branch -D task-{task_id}
git checkout -b task-{task_id}
```

**选项 B**：使用现有分支
```bash
git checkout task-{task_id}
```

**推荐**：选项 A（重新创建）

### 情况 3：项目目录不在 workspace

**如果项目在子目录**：

**执行命令**：
```bash
cd /workspace/my-project && git checkout -b task-{task_id}
```

**更新任务状态**：
```json
{
  "git": {
    "project_dir": "/workspace/my-project",
    "branch": "task-20250314-001"
  }
}
```
