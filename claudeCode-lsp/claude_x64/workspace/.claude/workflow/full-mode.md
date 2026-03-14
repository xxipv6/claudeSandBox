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

**检查点**：
- [ ] 已检查环境变量
- [ ] 环境变量已设置（或已拒绝）

## 执行步骤

### 第一步：读取完整流程定义
**现在读取** 本文件（full-mode.md）的其他部分或相关文档

**检查点**：
- [ ] 已读取本文件
- [ ] 已理解执行流程

### 第二步：制定详细计划
制定包含以下阶段的详细计划：
- Stage 00: Planning（任务规划）
- Stage 01: Task Init（创建状态文件）
- Stage 02: Git Prepare（创建分支）
- Stage 03: Knowledge（读取知识库）
- Stage 04: Mode Execution（执行模式）
- Stage 05: Quality Gate（质量验证）
- Stage 06: Completion（完成）

**检查点**：
- [ ] 已输出详细计划
- [ ] 已包含所有阶段

### 第三步：询问用户确认
**必须等待用户确认后才能继续**

**确认格式**：
```
是否按此计划执行？（请回复"继续"来确认）
```

**检查点**：
- [ ] 已询问用户确认
- [ ] 用户已明确确认

### 第四步：读取知识库（必须）
**现在读取** knowledge 目录下的文件：
- `knowledge/domains.md` - 10 个核心分析维度
- `knowledge/patterns.md` - 系统性失败模式
- `knowledge/tools.md` - Agent 工具视角
- `knowledge/corrections.md` - 错误学习库

**检查点**：
- [ ] 已读取 domains.md
- [ ] 已读取 patterns.md
- [ ] 已读取 tools.md
- [ ] 已读取 corrections.md

**跳过的后果**：
- 如果跳过任何 knowledge 文件，必须在报告中说明原因

### 第五步：创建任务分支
```bash
git checkout -b task-{id}
```

**检查点**：
- [ ] Git 分支已创建
- [ ] 已切换到新分支

**失败处理**：
- 如果 Git 操作失败：询问用户是否继续（不创建分支）

### 第六步：创建状态文件
```bash
mkdir -p .claude/task_states
echo '{"task_id": "task-001", "status": "running", "current_stage": "knowledge"}' > .claude/task_states/task-{id}.json
```

**检查点**：
- [ ] task_states 目录已创建
- [ ] 状态文件已创建
- [ ] 状态已写入

### 第七步：顺序启动 2-4 个 agents
不要并发启动 agents，顺序执行每个 agent：

**执行流程**：
```
对于每个 agent：
1. 读取 agent 定义（.claude/agents/{agent-name}.md）
2. 启动 agent（使用 Agent tool）
3. 等待 agent 完成（最多 120 秒）
4. 记录结果
5. 更新状态文件
6. 然后启动下一个 agent（如果有）
```

**可用的 agents**：
- 分析类（选 1-2 个）：product-manager、backend-engineer、frontend-engineer
- 执行类（选 1 个）：dev-coder
- 质量类（可选）：security-tester

**检查点**：
- [ ] 已读取 agent 定义
- [ ] 前一个 agent 已完成
- [ ] 已启动当前 agent
- [ ] 等待当前 agent 完成
- [ ] 已更新状态文件

**失败处理**：
- 如果 agent 执行失败：询问用户是否继续或重试（单次重试）
- 如果 agent 超时（120 秒）：记录超时，询问用户是否继续

### 第八步：执行 Quality Gate
- 静态分析（语法检查、代码风格）
- 安全扫描（漏洞扫描、依赖检查）
- 自动测试（运行测试、验证功能）
- 失败则触发修复循环（最多 3 次）

**检查点**：
- [ ] 静态分析已完成
- [ ] 安全扫描已完成
- [ ] 自动测试已完成
- [ ] 或：失败处理已完成

**失败处理**：
- 如果任何检查失败：尝试修复（最多 3 次）
- 如果 3 次后仍失败：询问用户是否继续

### 第九步：合并分支
```bash
git checkout main
git merge task-{id}
```

**检查点**：
- [ ] 已切换到 main 分支
- [ ] 分支已合并
- [ ] 无冲突（或冲突已解决）

**失败处理**：
- 如果合并失败：询问用户是否手动处理

### 第十步：更新状态并完成
```bash
echo '{"status": "completed", "end_time": "<timestamp>"}' > .claude/task_states/task-{id}.json
```

**检查点**：
- [ ] 状态已更新为 completed
- [ ] 完成时间已记录

## 禁止行为
- ❌ 在环境变量未设置时执行
- ❌ 并发启动 agents（必须顺序执行）
- ❌ 跳过任何阶段
- ❌ 跳过用户确认
- ❌ 跳过检查点
- ❌ 不等前一个 agent 完成就启动下一个
- ❌ 不读取 knowledge 就启动 agents
- ❌ 不更新状态文件

## 适用场景
- 架构级安全研究
- 需要完整流程的大型项目
- 需要明确授权的复杂任务
