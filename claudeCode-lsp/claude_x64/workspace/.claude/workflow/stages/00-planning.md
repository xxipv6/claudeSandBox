# Stage 00: Task Planning

## 目标

启动 task-planner，规划任务

## 职责

- 分析用户意图
- 拆解任务为子任务
- 识别依赖关系
- 决定模式选择（Analysis/Coding）
- 规划需要启动的 agents

## 前置条件

- 无

## 执行步骤（强制）

### 步骤 1：读取 task-planner 定义（强制）

**现在读取**：`.claude/agents/task-planner.md`

**按照其中定义的角色和职责执行**

**检查点**：
- [ ] 已读取 task-planner.md
- [ ] 已理解 task-planner 的职责

### 步骤 2：启动 task-planner（强制）

**输入**：
- 用户输入（原始请求）
- 当前环境信息

**输出**：
- 任务拆解（子任务列表）
- 子任务依赖关系（DAG）
- 模式选择建议
- 需要启动的 agents

**检查点**：
- [ ] 已启动 task-planner
- [ ] 已获得规划结果

### 步骤 3：解析规划结果（强制）

**解析内容**：
1. **子任务列表**
   - 子任务 ID
   - 子任务名称
   - 子任务描述
   - 子任务依赖

2. **依赖关系**
   - 主任务依赖
   - 子任务依赖

3. **模式选择**
   - analysis 或 coding
   - 选择理由

4. **Agent 列表**
   - 需要启动的 agents
   - Agent 类型（分析/执行/支持）

**检查点**：
- [ ] 已解析子任务列表
- [ ] 已解析依赖关系
- [ ] 已解析模式选择
- [ ] 已解析 agent 列表

### 步骤 4：保存规划结果（强制）

**写入文件**：`.claude/task_plans/task-{id}.json`

**文件格式**：
```json
{
  "task_id": "task-20250314-001",
  "user_input": "用户输入",
  "mode": "coding",
  "subtasks": [
    {
      "subtask_id": "subtask-001",
      "name": "子任务名称",
      "description": "子任务描述",
      "dependencies": [],
      "agent": "dev-coder"
    }
  ],
  "task_dependencies": [],
  "required_agents": ["dev-coder"]
}
```

**检查点**：
- [ ] 已保存规划结果
- [ ] 文件格式正确

## 输出

- **task_planner.output**（任务规划）
- **task_planner.subtasks**（子任务列表）
- **task_planner.dependencies**（依赖关系）
- **task_planner.mode**（模式选择）
- **task_planner.agents**（agent 列表）

## 错误处理

| 错误类型 | 处理策略 |
|---------|---------|
| task-planner 启动失败 | 任务状态改为 failed，记录错误日志 |
| task-planner 超时 | 任务状态改为 failed，记录超时日志 |
| 规划结果格式错误 | 任务状态改为 failed，记录格式错误 |
| 保存文件失败 | 任务状态改为 failed，记录文件错误 |

## 授权说明

此阶段不需要特殊授权，属于正常规划活动。

## 超时设置

- 默认超时：120 秒
- 超时后自动终止

## 下一阶段

完成后进入 **Stage 01: Task Initialization**
