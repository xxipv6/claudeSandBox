# 完整模式执行步骤

## 触发条件（必须同时满足）
- 架构级任务
- AND 用户明确说"完整分析/完整编排"
- AND 环境变量 `CLAUDE_FULL_MODE=1` 已设置

## 拒绝条件（默认拒绝）
如果用户请求"完整分析"但环境变量未设置：
```
当前未启用完整模式，将以标准模式执行。
如需完整模式，请设置环境变量 CLAUDE_FULL_MODE=1。
```

## 执行步骤

### 第一步：读取完整流程定义
**现在读取** 本文件（full-mode.md）的其他部分或相关文档

### 第二步：制定详细计划
制定包含以下阶段的详细计划：
- Stage 00: Planning（启动 task-planner）
- Stage 01: Task Init（创建状态文件）
- Stage 02: Git Prepare（创建分支）
- Stage 03: Mode Execution（执行模式）
- Stage 04: Quality Gate（质量验证）
- Stage 05: Completion（完成）

### 第三步：询问用户确认
**必须等待用户确认后才能继续**

### 第四步：读取知识库（必须）
**现在读取** knowledge 目录下的文件：
- `knowledge/domains.md` - 10 个核心分析维度
- `knowledge/patterns.md` - 系统性失败模式
- `knowledge/tools.md` - Agent 工具视角
- `knowledge/corrections.md` - 错误学习库

### 第五步：创建任务分支
```bash
git checkout -b task-{id}
```

### 第六步：创建状态文件
```bash
mkdir -p .claude/task_states
echo '{"task_id": "task-001", "status": "running"}' > .claude/task_states/task-{id}.json
```

### 第七步：顺序启动 2-4 个 agents
不要并发启动 agents，顺序执行每个 agent：
- 分析类（选 1-2 个）：product-manager、backend-engineer、frontend-engineer
- 执行类（选 1 个）：dev-coder
- 质量类（可选）：security-tester

### 第八步：执行 Quality Gate
- 静态分析
- 安全扫描
- 自动测试
- 失败则触发修复循环（最多 3 次）

### 第九步：合并分支
```bash
git checkout main
git merge task-{id}
```

### 第十步：更新状态并完成
```bash
echo '{"status": "completed"}' > .claude/task_states/task-{id}.json
```

## 禁止行为
- ❌ 在环境变量未设置时执行
- ❌ 并发启动 agents
- ❌ 跳过任何阶段
- ❌ 跳过用户确认

## 适用场景
- 架构级安全研究
- 需要完整流程的大型项目
- 需要明确授权的复杂任务
