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
**现在读取** .claude/knowledge 目录下的文件：
- `.claude/knowledge/domains.md` - 10 个核心分析维度
- `.claude/knowledge/patterns.md` - 系统性失败模式
- `.claude/knowledge/tools.md` - Agent 工具视角
- `.claude/knowledge/corrections.md` - 错误学习库

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

### 第六步：创建状态文件和日志
```bash
mkdir -p .claude/task_states
mkdir -p .claude/task_logs
```

**状态文件格式**（`.claude/task_states/task-{id}.json`）：
```json
{
  "task_id": "task-20260315-001",
  "status": "running",
  "current_stage": "knowledge",
  "start_time": "2026-03-15T10:30:00Z",
  "stages": {
    "planning": {"status": "completed", "start": "10:30:00", "end": "10:30:15"},
    "init": {"status": "completed", "start": "10:30:15", "end": "10:30:20"},
    "git_prepare": {"status": "completed", "start": "10:30:20", "end": "10:30:25"},
    "knowledge": {"status": "in_progress", "start": "10:30:25"},
    "execution": {"status": "pending"},
    "quality_gate": {"status": "pending"},
    "completion": {"status": "pending"}
  },
  "agents": [],
  "errors": [],
  "logs": ".claude/task_logs/task-20260315-001.log"
}
```

**日志文件**（`.claude/task_logs/task-{id}.log`）：
```bash
# 每个阶段开始时记录
echo "[$(date -Iseconds)] [STAGE] {stage_name}: Started" >> .claude/task_logs/task-{id}.log

# 每个 agent 开始/完成时记录
echo "[$(date -Iseconds)] [AGENT] {agent_name}: Started" >> .claude/task_logs/task-{id}.log
echo "[$(date -Iseconds)] [AGENT] {agent_name}: Completed" >> .claude/task_logs/task-{id}.log

# 错误时记录
echo "[$(date -Iseconds)] [ERROR] {stage_name}: {error_message}" >> .claude/task_logs/task-{id}.log
```

**检查点**：
- [ ] task_states 目录已创建
- [ ] task_logs 目录已创建
- [ ] 状态文件已创建（完整格式）
- [ ] 日志文件已创建
- [ ] 已记录开始时间

### 第七步：顺序启动 2-4 个 agents
不要并发启动 agents，顺序执行每个 agent：

**执行流程**：
```
对于每个 agent：
1. 读取 agent 定义（.claude/agents/{agent-name}.md）
2. 记录到日志：echo "[$(date)] [AGENT] {name}: Starting" >> .claude/task_logs/task-{id}.log
3. 启动 agent（使用 Agent tool）
4. 等待 agent 完成（最多 120 秒）
5. 记录结果到状态文件和日志
6. 更新状态文件
7. 然后启动下一个 agent（如果有）
```

**可用的 agents**：
- 分析类（选 1-2 个）：product-manager、backend-engineer、frontend-engineer
- 执行类（选 1 个）：dev-coder
- 质量类（可选）：security-tester

**Agent 执行结果记录**（添加到状态文件的 `agents` 数组）：
```json
{
  "name": "backend-engineer",
  "type": "analysis",
  "status": "completed",
  "start_time": "10:31:00",
  "end_time": "10:32:30",
  "duration_seconds": 90,
  "result": "success",
  "output_summary": "...",
  "errors": []
}
```

**检查点**：
- [ ] 已读取 agent 定义
- [ ] 前一个 agent 已完成
- [ ] 已启动当前 agent
- [ ] 已记录到日志
- [ ] 等待当前 agent 完成
- [ ] 已记录 agent 结果到状态文件
- [ ] 已更新状态文件

**失败处理**（记录到日志和状态文件）：
```bash
# Agent 失败时
echo "[$(date)] [ERROR] Agent {name} failed: {error_reason}" >> .claude/task_logs/task-{id}.log

# 更新状态文件
# 添加到 errors 数组：
{
  "stage": "agent_execution",
  "agent": "{agent_name}",
  "error": "{error_message}",
  "timestamp": "...",
  "retries": 1
}
```
- 如果 agent 执行失败：记录错误，询问用户是否继续或重试（单次重试）
- 如果 agent 超时（120 秒）：记录超时到日志和状态文件，询问用户是否继续

### 第八步：执行 Quality Gate
- 静态分析（语法检查、代码风格）
- 安全扫描（漏洞扫描、依赖检查）
- 自动测试（运行测试、验证功能）
- 失败则触发修复循环（最多 3 次）

**Quality Gate 结果记录**（添加到状态文件）：
```json
{
  "stage": "quality_gate",
  "static_analysis": {"status": "passed", "issues": 0},
  "security_scan": {"status": "passed", "vulnerabilities": 0},
  "tests": {"status": "passed", "total": 10, "passed": 10, "failed": 0},
  "fix_attempts": 0
}
```

**检查点**：
- [ ] 静态分析已完成
- [ ] 安全扫描已完成
- [ ] 自动测试已完成
- [ ] 或：失败处理已完成
- [ ] 已记录 Quality Gate 结果到状态文件
- [ ] 已记录到日志

**失败处理**（记录详细错误信息）：
```bash
# Quality Gate 失败时
echo "[$(date)] [ERROR] Quality Gate failed at {check_name}" >> .claude/task_logs/task-{id}.log
echo "[$(date)] [ERROR] Details: {error_details}" >> .claude/task_logs/task-{id}.log

# 更新状态文件，添加到 errors 数组
{
  "stage": "quality_gate",
  "check": "{check_name}",
  "error": "{error_message}",
  "timestamp": "...",
  "attempt": 1,
  "max_attempts": 3
}
```
- 如果任何检查失败：记录错误，尝试修复（最多 3 次）
- 如果 3 次后仍失败：记录失败，询问用户是否继续

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

### 第十步：生成执行报告并完成
```bash
# 更新状态文件为 completed
echo '{"status": "completed", "end_time": "<timestamp>"}' > .claude/task_states/task-{id}.json
```

**最终状态文件格式**：
```json
{
  "task_id": "task-20260315-001",
  "status": "completed",
  "start_time": "2026-03-15T10:30:00Z",
  "end_time": "2026-03-15T11:00:00Z",
  "duration_seconds": 1800,
  "stages": {
    "planning": {"status": "completed", "start": "...", "end": "..."},
    "init": {"status": "completed", "start": "...", "end": "..."},
    "git_prepare": {"status": "completed", "start": "...", "end": "..."},
    "knowledge": {"status": "completed", "start": "...", "end": "..."},
    "execution": {"status": "completed", "start": "...", "end": "..."},
    "quality_gate": {"status": "completed", "start": "...", "end": "..."},
    "completion": {"status": "completed", "start": "...", "end": "..."}
  },
  "agents": [
    {"name": "backend-engineer", "status": "completed", ...},
    {"name": "frontend-engineer", "status": "completed", ...},
    {"name": "dev-coder", "status": "completed", ...}
  ],
  "quality_gate": {
    "static_analysis": {"status": "passed"},
    "security_scan": {"status": "passed"},
    "tests": {"status": "passed"}
  },
  "errors": [],
  "summary": {
    "total_agents": 3,
    "successful_agents": 3,
    "failed_agents": 0,
    "total_stages": 7,
    "successful_stages": 7,
    "failed_stages": 0
  }
}
```

**生成执行报告**（`.claude/task_reports/task-{id}-report.md`）：
```markdown
# 执行报告：task-20260315-001

## 基本信息
- 任务 ID: task-20260315-001
- 开始时间: 2026-03-15 10:30:00
- 结束时间: 2026-03-15 11:00:00
- 总耗时: 30 分钟
- 状态: ✅ 完成

## 执行阶段
| 阶段 | 状态 | 开始时间 | 结束时间 | 耗时 |
|------|------|----------|----------|------|
| Planning | ✅ | 10:30:00 | 10:30:15 | 15s |
| Init | ✅ | 10:30:15 | 10:30:20 | 5s |
| Git Prepare | ✅ | 10:30:20 | 10:30:25 | 5s |
| Knowledge | ✅ | 10:30:25 | 10:30:40 | 15s |
| Execution | ✅ | 10:30:40 | 10:58:00 | 27m20s |
| Quality Gate | ✅ | 10:58:00 | 10:59:30 | 1m30s |
| Completion | ✅ | 10:59:30 | 11:00:00 | 30s |

## Agent 执行情况
### 1. backend-engineer
- 状态: ✅ 完成
- 耗时: 45s
- 结果: 成功完成

### 2. frontend-engineer
- 状态: ✅ 完成
- 耗时: 38s
- 结果: 成功完成

### 3. dev-coder
- 状态: ✅ 完成
- 耗时: 26m
- 结果: 成功完成所有代码修改

## Quality Gate 结果
- 静态分析: ✅ 通过
- 安全扫描: ✅ 通过
- 自动测试: ✅ 通过 (10/10)

## 错误和异常
无

## 总结
任务成功完成，所有阶段均通过验收。
```

**检查点**：
- [ ] 状态已更新为 completed
- [ ] 结束时间已记录
- [ ] 执行报告已生成
- [ ] 日志已记录完成状态

## 禁止行为
- ❌ 在环境变量未设置时执行
- ❌ 并发启动 agents（必须顺序执行）
- ❌ 跳过任何阶段
- ❌ 跳过用户确认
- ❌ 跳过检查点
- ❌ 不等前一个 agent 完成就启动下一个
- ❌ 不读取 knowledge 就启动 agents
- ❌ 不更新状态文件
- ❌ 不记录日志
- ❌ 不记录错误信息

## 中断恢复机制

如果执行过程中中断（例如：系统崩溃、用户中断等），可以从状态文件恢复：

**恢复步骤**：
```bash
# 1. 读取状态文件，检查当前阶段
cat .claude/task_states/task-{id}.json

# 2. 根据状态文件的 current_stage 决定恢复点
# - 如果 current_stage = "knowledge"，从知识库读取阶段继续
# - 如果 current_stage = "execution"，从失败的 agent 继续或跳过
# - 如果 current_stage = "quality_gate"，从质量验证继续

# 3. 恢复时记录日志
echo "[$(date)] [RECOVER] Resuming from stage: {current_stage}" >> .claude/task_logs/task-{id}.log
```

**恢复策略**：
- **Planning/Init/Git Prepare 阶段中断**：重新执行该阶段
- **Knowledge 阶段中断**：继续读取未完成的 knowledge 文件
- **Execution 阶段中断**：根据 agents 数组，跳过已完成的，从失败的 agent 继续
- **Quality Gate 阶段中断**：根据失败记录决定重试或跳过

## 回滚机制

如果某个阶段失败需要回滚：

**Git 分支回滚**：
```bash
# 如果执行失败，删除任务分支
git checkout main
git branch -D task-{id}

# 或保留分支用于调试
# 保留分支，但记录失败状态到状态文件
```

**状态文件回滚**：
```bash
# 将状态文件更新为 failed
echo '{"status": "failed", "error": "...", "end_time": "..."}' > .claude/task_states/task-{id}.json
```

## 文件组织

完整模式会创建以下文件和目录：
```
.claude/
├── task_states/
│   └── task-{id}.json          # 任务状态文件
├── task_logs/
│   └── task-{id}.log           # 执行日志
└── task_reports/
    └── task-{id}-report.md     # 执行报告
```

## 适用场景
- 架构级安全研究
- 需要完整流程的大型项目
- 需要明确授权的复杂任务
- 需要详细执行记录和审计跟踪的任务
