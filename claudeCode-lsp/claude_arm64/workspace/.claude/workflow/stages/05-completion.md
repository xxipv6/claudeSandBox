# Stage 05: Completion（完成）

## 目标

完成与状态管理，生成执行报告，更新任务状态。

## 触发条件

- Stage 04: Quality Gate 已完成
- 质量检查已通过（或达到最大尝试次数）

## 执行步骤

### 第一步：更新任务状态

将任务状态更新为 "completed"：

```bash
jq ".status = \"completed\" |
    .end_time = \"$(date -Iseconds)\" |
    .current_stage = \"completion\" |
    .stages.completion.status = \"completed\" |
    .stages.completion.start = \"$(date -Iseconds)\" |
    .stages.completion.end = \"$(date -Iseconds)\"" .claude/task_states/task-{id}.json > .claude/task_states/task-{id}.json.tmp
mv .claude/task_states/task-{id}.json.tmp .claude/task_states/task-{id}.json
```

**检查点**：
- [ ] 状态文件已更新为 "completed"
- [ ] 结束时间已记录
- [ ] completion 阶段已标记为完成

### 第二步：计算任务耗时

```bash
start_time=$(jq -r ".start_time" .claude/task_states/task-{id}.json)
end_time=$(jq -r ".end_time" .claude/task_states/task-{id}.json)
duration=$(( $(date -d "$end_time" +%s) - $(date -d "$start_time" +%s) ))
echo "Duration: $duration seconds"

jq ".duration_seconds = $duration" .claude/task_states/task-{id}.json > .claude/task_states/task-{id}.json.tmp
mv .claude/task_states/task-{id}.json.tmp .claude/task_states/task-{id}.json
```

**检查点**：
- [ ] 任务耗时已计算
- [ ] 耗时已记录到状态文件

### 第三步：生成执行报告（完整模式）

**完整模式**：生成详细的执行报告

读取状态文件，生成报告：

```bash
# 创建报告目录
mkdir -p .claude/task_reports

# 生成报告
cat > .claude/task_reports/task-{id}-report.md << EOF
# 执行报告：task-{id}

## 基本信息
- 任务 ID: task-{id}
- 开始时间: $(jq -r '.start_time' .claude/task_states/task-{id}.json)
- 结束时间: $(jq -r '.end_time' .claude/task_states/task-{id}.json)
- 总耗时: $(jq -r '.duration_seconds' .claude/task_states/task-{id}.json) 秒
- 状态: ✅ 完成

## 执行阶段
...

## Agent 执行情况
...

## Quality Gate 结果
...

## 错误和异常
...

## 总结
...
EOF
```

**检查点**：
- [ ] 执行报告已生成
- [ ] 报告格式正确
- [ ] 报告内容完整

### 第四步：合并 Git 分支（完整模式）

**完整模式**：合并任务分支到主分支

```bash
git checkout main
git merge task-{id}
```

**检查点**：
- [ ] 已切换到 main 分支
- [ ] 分支已合并
- [ ] 无冲突（或冲突已解决）

### 第五步：更新任务队列

将任务从队列中移除：

```bash
jq ".queue = [.queue[] | select(. != \"$task_id\")]" .claude/task_queue.json > .claude/task_queue.json.tmp
jq ".completed += [\"$task_id\"]" .claude/task_queue.json.tmp > .claude/task_queue.json
rm .claude/task_queue.json.tmp
```

**检查点**：
- [ ] 任务已从队列移除
- [ ] 任务已添加到完成列表
- [ ] 队列文件已更新

### 第六步：记录完成日志

```bash
echo "[$(date -Iseconds)] [STAGE] Completion: Task completed successfully" >> .claude/task_logs/task-{id}.log
echo "[$(date -Iseconds)] [COMPLETE] Total duration: $duration seconds" >> .claude/task_logs/task-{id}.log
```

**检查点**：
- [ ] 完成日志已记录
- [ ] 日志格式正确

### 第七步：清理（可选）

可选的清理操作：

```bash
# 删除任务分支（可选）
# git branch -D task-{id}

# 或保留分支用于调试
```

**检查点**：
- [ ] 清理决策已记录
- [ ] （可选）分支已删除

## 模式差异

| 特性 | 标准模式 | 完整模式 |
|------|----------|----------|
| 状态更新 | 简化格式 | 完整格式 |
| 执行报告 | 可选 | 必须 |
| Git 合并 | 可选 | 必须 |
| 队列更新 | 建议 | 必须 |
| 日志记录 | 可选 | 必须 |

## 完成状态

### 成功完成

**条件**：
- 所有阶段已成功完成
- Quality Gate 已通过
- 状态文件已更新为 "completed"
- （完整模式）执行报告已生成

### 失败完成

**条件**：
- 某个阶段失败
- Quality Gate 未通过且达到最大尝试次数
- 用户取消任务

**操作**：
- 更新状态为 "failed"
- 记录失败原因
- 生成失败报告（完整模式）

### 取消完成

**条件**：
- 用户主动取消任务

**操作**：
- 更新状态为 "cancelled"
- 记录取消原因
- 清理临时文件

## 执行报告模板

### 基本信息部分

```markdown
## 基本信息
- 任务 ID: task-{id}
- 开始时间: {start_time}
- 结束时间: {end_time}
- 总耗时: {duration} 秒
- 状态: {status}
```

### 执行阶段部分

```markdown
## 执行阶段
| 阶段 | 状态 | 开始时间 | 结束时间 | 耗时 |
|------|------|----------|----------|------|
| Planning | {status} | {start} | {end} | {duration} |
| Init | {status} | {start} | {end} | {duration} |
| Git Prepare | {status} | {start} | {end} | {duration} |
| Knowledge | {status} | {start} | {end} | {duration} |
| Execution | {status} | {start} | {end} | {duration} |
| Quality Gate | {status} | {start} | {end} | {duration} |
| Completion | {status} | {start} | {end} | {duration} |
```

### Agent 执行情况部分

```markdown
## Agent 执行情况
### 1. {agent-name}
- 状态: {status}
- 耗时: {duration}
- 结果: {result}
```

### Quality Gate 结果部分

```markdown
## Quality Gate 结果
- 静态分析: {status}
- 安全扫描: {status}
- 自动测试: {status} ({passed}/{total})
```

### 错误和异常部分

```markdown
## 错误和异常
{if errors}
{for each error}
- [{timestamp}] {stage}: {error}
{/for}
{else}
无
{/if}
```

### 总结部分

```markdown
## 总结
{summary}
```

## 完成标志

当以下条件满足时，本阶段完成：

### 完整模式
- [ ] 任务状态已更新为 "completed"
- [ ] 结束时间已记录
- [ ] 任务耗时已计算
- [ ] 执行报告已生成
- [ ] Git 分支已合并
- [ ] 任务队列已更新
- [ ] 完成日志已记录

### 标准模式
- [ ] 任务状态已更新（可选）
- [ ] 任务已完成
- [ ] （可选）日志已记录

## 失败处理

### Git 合并失败

- 记录失败到日志
- 询问用户是否手动处理
- 保留任务分支用于调试

### 状态文件更新失败

- 记录错误到日志
- 尝试重新更新
- 如果仍然失败，记录失败状态

---

**任务完成** 🎉
