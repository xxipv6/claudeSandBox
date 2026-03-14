# 标准模式执行步骤

## 触发条件（满足任一即进入）
- 多文件操作（2-10 个文件）
- OR 需要分析/理解代码
- OR 用户说"分析/实现/帮我看看"
- OR 任何不确定的情况（默认安全缓冲区）

## 执行步骤

### 第一步：制定简要计划
根据任务制定 2-3 个执行步骤，例如：
```
我打算这样分析：
1. 先看项目结构
2. 用 backend-engineer 分析后端
3. 用 frontend-engineer 分析前端

可以吗？（请回复"继续"来确认）
```

**检查点**：
- [ ] 已输出计划
- [ ] 已等待用户确认

### 第二步：询问用户确认
**必须等待用户明确确认后才能继续**

**有效的确认方式**：
- 用户说"继续"、"可以"、"好的"、"开始"
- 用户给出明确的肯定答复

**无效的确认**：
- 用户沉默（需要再次询问）
- 用户说"嗯"、"啊"等模糊答复（需要明确确认）

### 第三步：读取知识库（建议，如不读需说明原因）
根据任务类型读取相关的 knowledge 文件：
- 安全分析 → `.claude/knowledge/domains.md`、`.claude/knowledge/patterns.md`
- 系统分析 → `.claude/knowledge/tools.md`
- 问题排查 → `.claude/knowledge/corrections.md`

**检查点**：
- [ ] 已读取 relevant knowledge 文件
- [ ] 或：已说明为什么跳过 knowledge

### 第四步：按需读取 agent 定义
根据需要读取 `.claude/agents/{agent-name}.md`

**检查点**：
- [ ] 已读取 agent 定义
- [ ] 已了解 agent 的角色和职责

### 第五步：启动 1-2 个 agents（顺序执行）
不要并发启动 agents，顺序执行每个 agent

**执行流程**：
```
对于每个 agent：
1. 读取 agent 定义
2. 记录到日志（可选）：echo "[$(date)] [AGENT] {name}: Starting" >> .claude/task_logs/standard.log
3. 启动 agent（使用 Agent tool）
4. 等待 agent 完成
5. 记录结果
6. 然后启动下一个 agent（如果有）
```

**检查点**：
- [ ] 前一个 agent 已完成
- [ ] 已读取当前 agent 定义
- [ ] 已启动当前 agent
- [ ] 等待当前 agent 完成

**失败处理**（记录错误）：
```bash
# Agent 失败时记录到日志
echo "[$(date)] [ERROR] Agent {name} failed" >> .claude/task_logs/standard.log
```
- 如果 agent 执行失败：记录错误，询问用户是否继续或重试
- 如果 agent 超时（120 秒）：记录超时，停止并询问用户

### 第六步：合并结果，输出简洁报告
输出 ≤ 500 行的简洁报告

**报告格式**：
```
## 分析结果

### 发现的问题
[列出发现的问题]

### 建议
[给出建议]

### 其他
[其他相关信息]
```

**可选：记录执行摘要到日志**
```bash
echo "[$(date)] [COMPLETE] Standard mode task finished" >> .claude/task_logs/standard.log
```

**检查点**：
- [ ] 报告已输出
- [ ] 报告 ≤ 500 行
- [ ] （可选）日志已记录完成状态

## 可选操作

### 1. 创建简化状态文件
```bash
mkdir -p .claude/task_states
echo '{"mode": "standard", "status": "completed", "end_time": "'$(date -Iseconds)'"}' > .claude/task_states/standard-{timestamp}.json
```

### 2. 启用日志记录
```bash
mkdir -p .claude/task_logs
# 所有标准模式任务共享一个日志文件
echo "[$(date)] [START] Standard mode task started" >> .claude/task_logs/standard.log
```

### 3. 记录 Agent 执行
```bash
# 每个 agent 开始时
echo "[$(date)] [AGENT] {name}: Starting" >> .claude/task_logs/standard.log

# 每个 agent 完成时
echo "[$(date)] [AGENT] {name}: Completed" >> .claude/task_logs/standard.log
```

### 4. 错误记录
```bash
# 任何错误发生时
echo "[$(date)] [ERROR] {stage}: {error_message}" >> .claude/task_logs/standard.log
```

## 日志文件格式
**标准模式日志**（`.claude/task_logs/standard.log`）：
```
2026-03-15T10:30:00 [START] Standard mode task started
2026-03-15T10:30:05 [AGENT] backend-engineer: Starting
2026-03-15T10:31:00 [AGENT] backend-engineer: Completed
2026-03-15T10:31:05 [AGENT] frontend-engineer: Starting
2026-03-15T10:31:40 [AGENT] frontend-engineer: Completed
2026-03-15T10:31:45 [COMPLETE] Standard mode task finished
```

## 禁止行为
- ❌ 跳过用户确认就执行
- ❌ 并发启动 agents
- ❌ 读取 workflow/ 下的其他文件
- ❌ 输出 500+ 行的过度形式化报告
- ❌ 跳过检查点
- ❌ 不等前一个 agent 完成就启动下一个
- ❌ 不记录错误到日志（如果启用了日志）

## 与完整模式的区别

| 特性 | 标准模式 | 完整模式 |
|------|---------|---------|
| 触发条件 | 常规分析任务 | 架构级任务 + 环境变量 |
| 复杂度 | 轻量级 | 重量级 |
| 日志 | 可选，共享日志文件 | 必需，每个任务独立日志 |
| 状态文件 | 简化格式 | 完整详细格式 |
| 分支管理 | 不创建分支 | 创建 Git 分支 |
| 恢复机制 | 不支持 | 支持中断恢复 |
| 报告 | 简洁报告（≤500行） | 详细执行报告 |

## 适用场景
- 项目分析
- 功能实现
- 代码审查
- 任何不确定的情况（默认模式）
