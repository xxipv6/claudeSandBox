# Pre-Context Compression Hook（上下文预压缩钩子）

## 触发条件

当上下文接近 token 限制（80% 阈值）时自动触发。

## 功能

在系统自动压缩消息之前，先提炼核心上下文，确保重要信息不会丢失。

---

## 🎯 核心上下文提取

### 1. 当前任务状态

**提取内容**：
- 正在进行的任务
- 待办事项（Todo List）
- 任务进度
- 阻塞问题

**存储位置**：`agent-memory/current-task-state.md`

**格式**：
```markdown
# 当前任务状态

## 进行中
- [ ] 任务描述 (状态: 50%)

## 待办
- [ ] 任务 1
- [ ] 任务 2

## 阻塞
- 问题描述
```

### 2. 关键决策记录

**提取内容**：
- 重要的架构决策
- 设计选择
- 用户反馈
- 技术选型

**存储位置**：`agent-memory/key-decisions.md`

**格式**：
```markdown
# 关键决策记录

## [日期] 决策标题
- **决策**：[选择方案]
- **原因**：[理由]
- **影响**：[影响范围]
- **用户反馈**：[反馈内容]
```

### 3. 代码变更摘要

**提取内容**：
- 最近的提交记录
- 修改的文件列表
- 变更原因
- 变更影响

**存储位置**：`agent-memory/code-changes-summary.md`

**格式**：
```markdown
# 代码变更摘要

## 最近提交
- commit xxx: [提交信息]

## 文件变更
- 修改: `path/to/file.ts` (原因)
- 新增: `path/to/new.ts` (功能)

## 影响范围
- [影响描述]
```

### 4. 项目结构快照

**提取内容**：
- 当前目录结构
- 关键文件位置
- 配置文件路径

**存储位置**：`agent-memory/project-structure.md`

**格式**：
```markdown
# 项目结构快照

## 目录结构
```
project/
├── src/
├── tests/
└── docs/
```

## 关键文件
- 配置: `path/to/config`
- 入口: `path/to/main`
- 文档: `path/to/readme`
```

---

## 📋 执行流程

### 阶段 1：检测触发

```python
# 伪代码
if context_usage > 80%:
    trigger_pre_compression()
```

### 阶段 2：提炼上下文

1. **读取当前对话**
   - 提取用户请求
   - 提取关键操作
   - 提取决策点

2. **读取项目状态**
   - 运行 `git log` 获取最近提交
   - 运行 `git status` 获取未提交变更
   - 读取 Todo List（如果存在）

3. **生成摘要**
   - 压缩冗余信息
   - 保留关键细节
   - 结构化输出

### 阶段 3：写入 Memory

```bash
# 更新 memory 文件
agent-memory/current-task-state.md
agent-memory/key-decisions.md
agent-memory/code-changes-summary.md
agent-memory/project-structure.md
```

### 阶段 4：通知用户

```markdown
⚡️ 上下文预压缩完成

已提取核心上下文到 agent-memory/:
- ✅ 当前任务状态
- ✅ 关键决策记录
- ✅ 代码变更摘要
- ✅ 项目结构快照

原上下文已精简，可以继续工作。
```

---

## 🔄 与系统压缩的协作

```
上下文使用 80%
    ↓
Pre-Compression Hook
    → 提炼核心上下文
    → 写入 Memory
    ↓
系统自动压缩
    → 压缩旧消息
    → 保留摘要
    ↓
继续对话
    → 核心信息已在 Memory
    → 不会丢失重要上下文
```

---

## 🛠️ 实现方式

### 方式 1：Claude Code Settings Hook

在 `settings.json` 中配置：

```json
{
  "hooks": {
    "preContextCompression": ".claude/hooks/pre-context-compression.md"
  }
}
```

### 方式 2：手动触发命令

创建命令 `/compress`：

```markdown
---
description: 手动触发上下文预压缩
---

执行上下文预压缩流程。
```

### 方式 3：Skill 自动检测

创建 `context-management` skill：

```yaml
---
name: context-management
description: 上下文管理技能，自动检测并优化上下文使用
disable-model-invocation: false
---
```

---

## 📝 Memory 文件结构

```
agent-memory/
├── current-task-state.md      # 当前任务状态
├── key-decisions.md            # 关键决策记录
├── code-changes-summary.md     # 代码变更摘要
├── project-structure.md        # 项目结构快照
└── CONTEXT.md                  # 自动加载的主记忆文件
```

**注意**：`CONTEXT.md` 会自动加载到新会话中，其他文件需要时手动读取。

---

## ✅ 验证清单

压缩后验证：
- [ ] 当前任务已记录
- [ ] 关键决策已保存
- [ ] 代码变更已摘要
- [ ] 项目结构已更新
- [ ] Memory 文件已同步

---

## 🚀 优化方向

1. **智能优先级**
   - 自动识别重要信息
   - 丢弃临时/无效内容

2. **增量更新**
   - 只更新变化的部分
   - 避免重复写入

3. **自动清理**
   - 定期清理过时 memory
   - 合并重复内容

4. **跨会话持久化**
   - 重要决策持久化到项目文档
   - 任务状态可恢复

---

## 🎯 使用建议

**开发中**：
- 每 1-2 小时自动预压缩一次
- 重要功能完成后手动触发

**调试时**：
- 保留完整的错误堆栈
- 记录调试进展

**重构时**：
- 记录重构决策
- 保留变更前后的对比
