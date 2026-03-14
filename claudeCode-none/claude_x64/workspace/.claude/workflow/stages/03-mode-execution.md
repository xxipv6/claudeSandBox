# Stage 03: Mode Execution（模式执行）

## 目标

执行选定的模式（标准模式或完整模式），启动相应的 agents 进行分析或编码。

## 触发条件

- Stage 02: Git Prepare 已完成
- 任务状态为 "running"

## 执行步骤

### 第一步：确认执行模式

从状态文件读取模式：

```bash
mode=$(jq -r ".mode" .claude/task_states/task-{id}.json)
echo "Execution mode: $mode"
```

**检查点**：
- [ ] 执行模式已确认
- [ ] 模式符合触发条件

### 第二步：读取模式定义文件

**标准模式**：读取 `workflow/standard-mode.md`
**完整模式**：读取 `workflow/full-mode.md`

**检查点**：
- [ ] 模式定义文件已读取
- [ ] 理解执行流程

### 第三步：读取知识库（完整模式必须，标准模式建议）

读取以下知识库文件：

```bash
knowledge_files=(
  ".claude/knowledge/domains.md"
  ".claude/knowledge/patterns.md"
  ".claude/knowledge/tools.md"
  ".claude/knowledge/corrections.md"
)

for file in "${knowledge_files[@]}"; do
  if [ -f "$file" ]; then
    echo "Reading: $file"
    # 读取文件内容
  fi
done
```

**检查点**：
- [ ] 知识库文件已读取（完整模式）
- [ ] 或：已说明为什么跳过（标准模式）
- [ ] 知识库内容已理解

### 第四步：启动 Agents

根据 task-planner 的资源规划，启动相应的 agents。

**Agent 启动流程**：

对于每个 agent：
1. 读取 agent 定义文件
2. 记录到日志
3. 启动 agent（使用 Agent tool）
4. 等待 agent 完成
5. 记录结果
6. 更新状态文件

**可用的 agents**：
- **分析类**：product-manager、backend-engineer、frontend-engineer
- **执行类**：dev-coder
- **质量类**：security-tester

**检查点**：
- [ ] 前一个 agent 已完成
- [ ] 已读取当前 agent 定义
- [ ] 已启动当前 agent
- [ ] 等待当前 agent 完成
- [ ] 已记录 agent 结果
- [ ] 已更新状态文件

### 第五步：合并 Agent 输出

将所有 agents 的输出合并为统一的结果：

```markdown
## 分析结果

### 1. [agent-name] 分析
[agent 输出]

### 2. [agent-name] 分析
[agent 输出]

### 综合建议
[综合所有 agent 的建议]
```

**检查点**：
- [ ] 所有 agent 输出已收集
- [ ] 结果已合并
- [ ] 输出格式正确

### 第六步：更新状态文件

将 agent 执行结果记录到状态文件：

```bash
jq ".stages.execution.status = \"completed\" |
    .stages.execution.end = \"$(date -Iseconds)\" |
    .agents += $agent_results" .claude/task_states/task-{id}.json > .claude/task_states/task-{id}.json.tmp
mv .claude/task_states/task-{id}.json.tmp .claude/task_states/task-{id}.json
```

**检查点**：
- [ ] 状态文件已更新
- [ ] execution 阶段标记为完成
- [ ] agent 结果已记录

## 模式差异

| 特性 | 标准模式 | 完整模式 |
|------|----------|----------|
| 知识库读取 | 建议 | 必须 |
| Agent 数量 | 1-4 个 | 2-4 个 |
| 状态文件 | 简化格式 | 完整格式 |
| 日志记录 | 可选 | 必须 |
| 输出格式 | 简洁报告（≤500行） | 详细执行报告 |

## Agent 执行规则

### 顺序执行
- 禁止并发启动 agents
- 每个 agent 完成后才能启动下一个
- 按照 task-planner 确定的顺序执行

### 失败处理
- **Agent 执行失败**：记录错误，询问用户是否继续或重试
- **Agent 超时（120秒）**：记录超时，询问用户是否继续
- **重试次数**：每个 agent 最多重试 1 次

### Agent 结果记录

每个 agent 完成后，记录以下信息到状态文件：

```json
{
  "name": "agent-name",
  "type": "analysis|execution|quality",
  "status": "completed|failed",
  "start_time": "...",
  "end_time": "...",
  "duration_seconds": 90,
  "result": "success|failure",
  "output_summary": "...",
  "errors": []
}
```

## 完成标志

当以下条件满足时，本阶段完成：

### 完整模式
- [ ] 知识库已读取
- [ ] 所有 agents 已执行完成
- [ ] agent 结果已记录
- [ ] 状态文件已更新
- [ ] 日志已记录

### 标准模式
- [ ] agents 已执行完成（或跳过）
- [ ] 结果已输出
- [ ] （可选）状态文件已更新

## 失败处理

### Agent 执行失败

**标准模式**：
- 记录错误
- 询问用户是否继续
- 可以跳过失败的 agent

**完整模式**：
- 记录错误到状态文件和日志
- 询问用户是否重试
- 最多重试 1 次
- 如果仍然失败，询问用户是否继续

### 所有 Agents 失败

- 记录失败状态到状态文件
- 将任务状态更新为 "failed"
- 询问用户是否重新开始

## 超时处理

- **单个 Agent 超时**：120 秒
- **整体超时**：根据 task-planner 的预估
- **超时后操作**：记录超时，询问用户是否继续

---

**下一步**：Stage 04: Quality Gate（质量门禁）
