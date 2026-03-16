---
name: context-management
description: 上下文管理技能。自动检测上下文使用率，在接近限制时自动提炼核心上下文到 memory，防止重要信息丢失。应主动（PROACTIVELY）使用。
disable-model-invocation: false
---

# Context Management Skill（上下文管理技能）

## 何时激活

**必须使用的场景**（应主动（PROACTIVELY）使用）：
- 当检测到上下文使用率超过 80% 时
- 当对话变得很长且包含重要决策时
- 当完成重要功能或阶段时
- 当准备切换任务时

**自动触发条件**：
```python
# 伪代码：自动检测逻辑
if context_token_usage > 80%:
    activate_context_management()
```

---

## 🎯 核心职责

1. **检测触发** - 监控上下文使用率
2. **提炼上下文** - 提取核心信息
3. **写入 Memory** - 保存到持久化文件
4. **通知用户** - 告知压缩结果
5. **继续工作** - 确保无缝衔接

---

## 📋 执行流程

### 第 1 步：检测触发

**检测指标**：
- 上下文使用率 > 80%
- 对话轮次 > 20 轮
- 文件读取次数 > 10 次
- 用户明确要求保存状态

**判断逻辑**：
```
当前上下文状态如何？
    ↓
使用率 > 80%?
    ├─ 是 → 立即触发预压缩
    └─ 否 → 继续监控
```

### 第 2 步：提炼核心上下文

#### 2.1 当前任务状态

**从对话中提取**：
- 正在进行的任务（最近的用户请求）
- Todo List 状态（如果存在）
- 任务进度（完成的百分比）
- 阻塞问题（等待用户反馈）

**写入**：`agent-memory/current-task-state.md`

```markdown
# 当前任务状态

*更新时间：2025-03-16 14:30*

## 进行中
- [ ] 实现用户认证功能 (状态: 50%)
  - 已完成：登录表单 UI
  - 进行中：API 集成
  - 待办：JWT 验证

## 待办
- [ ] 添加密码重置功能
- [ ] 编写单元测试

## 阻塞
- 无
```

#### 2.2 关键决策记录

**从对话中提取**：
- 架构决策（为什么选择 X 而不是 Y）
- 设计选择（组件结构、数据流）
- 用户反馈（用户说"不要..."或"要..."）
- 技术选型（为什么用这个库）

**写入**：`agent-memory/key-decisions.md`

```markdown
# 关键决策记录

## [2025-03-16] 使用 PostgreSQL 而非 MongoDB
- **决策**：使用 PostgreSQL 作为主数据库
- **原因**：需要复杂查询和事务支持
- **影响**：数据模型设计需遵循关系型范式
- **用户反馈**：用户确认可以使用 PostgreSQL

## [2025-03-16] 前端采用 React 而非 Vue
- **决策**：使用 React + TypeScript
- **原因**：团队更熟悉 React 生态
- **影响**：组件库采用 Material-UI
- **用户反馈**：用户批准此方案
```

#### 2.3 代码变更摘要

**从 Git 历史提取**：
```bash
git log -10 --oneline
git status
git diff --stat
```

**写入**：`agent-memory/code-changes-summary.md`

```markdown
# 代码变更摘要

*更新时间：2025-03-16 14:30*

## 最近提交
- `44ed5d7` refactor: move brainstorming skill to thinking directory
- `261a098` refactor: move vuln-patterns to security directory

## 未提交变更
- 修改: `CLAUDE.md` (添加 hook 引用)
- 新增: `skills/thinking/context-management/`

## 影响范围
- skills/ 目录结构调整
- hooks/ 目录新增
```

#### 2.4 项目结构快照

**生成目录树**：
```bash
# 选择性生成，只包含关键目录
find . -type d -maxdepth 3 | grep -E "(src|tests|docs|scripts)" | head -20
```

**写入**：`agent-memory/project-structure.md`

```markdown
# 项目结构快照

*更新时间：2025-03-16 14:30*

## 目录结构
```
claudeSandBox/
├── claudeCode-none/
│   ├── claude_arm64/
│   └── claude_x64/
├── claudeCode-lsp/
│   ├── claude_arm64/
│   └── claude_x64/
└── workspace/
    └── .claude/
        ├── agents/
        ├── commands/
        ├── skills/
        ├── hooks/          ← 新增
        └── rules/
```

## 关键文件
- 配置: `workspace/.claude/CLAUDE.md`
- 主文档: `README.md`
- Hooks: `.claude/hooks/`
```

### 第 3 步：写入 Memory

**确保目录存在**：
```bash
mkdir -p agent-memory
```

**写入顺序**：
1. current-task-state.md
2. key-decisions.md
3. code-changes-summary.md
4. project-structure.md

### 第 4 步：通知用户

**标准输出格式**：
```markdown
⚡️ 上下文预压缩完成

检测到上下文使用率已超过 80%，已自动提炼核心上下文：

✅ **当前任务状态** → agent-memory/current-task-state.md
   - 正在进行的任务: X
   - 待办事项: Y
   - 阻塞问题: Z

✅ **关键决策记录** → agent-memory/key-decisions.md
   - 保存了 N 个重要决策

✅ **代码变更摘要** → agent-memory/code-changes-summary.md
   - 最近提交: X
   - 未提交变更: Y

✅ **项目结构快照** → agent-memory/project-structure.md
   - 关键目录已更新

💡 核心上下文已安全保存，可以继续工作。
```

### 第 5 步：继续工作

**确保无缝衔接**：
- 不要中断当前任务
- 不要要求用户重新提供信息
- Memory 文件可在后续需要时读取

---

## 🔄 自动检测逻辑

### 检测点

在以下时机自动检测上下文使用率：

1. **每次响应前**
   - 检查是否超过 80% 阈值
   - 如果超过，先执行预压缩

2. **重要操作后**
   - 完成功能开发
   - 提交代码后
   - 用户说"保存"、"记住"时

3. **切换任务时**
   - 用户请求新任务时
   - 检测到话题变化时

### 检测方法

```python
# 伪代码
def check_context_usage():
    usage = calculate_token_usage()
    if usage > 0.8:  # 80%
        execute_pre_compression()
```

---

## 📝 Memory 文件管理

### 更新策略

- **增量更新**：只添加新的内容，不删除旧内容
- **时间戳**：每个部分标注更新时间
- **避免重复**：检查是否已存在相同内容

### 清理策略

- **定期清理**：超过 7 天的临时状态可以归档
- **保留重要**：关键决策永久保留
- **合并重复**：相同类型的决策合并

---

## ✅ 验证清单

预压缩完成后验证：

- [ ] Memory 目录存在
- [ ] 4 个核心文件已更新
- [ ] 文件内容正确（非空、格式正确）
- [ ] 时间戳已标注
- [ ] 用户已收到通知

---

## 🚫 禁止行为

- ❌ **不要删除重要信息** - 宁可保留冗余，不要丢失关键内容
- ❌ **不要中断任务** - 预压缩应该是透明的
- ❌ **不要过度压缩** - 保留足够的细节以便后续恢复
- ❌ **不要忽略用户反馈** - 如果用户说"这个不重要"，不要记录

---

## 💡 最佳实践

### 什么时候记录

**应该记录**：
- ✅ 架构决策
- ✅ 用户明确的偏好（"我更喜欢..."）
- ✅ 重要的技术选型
- ✅ 任务状态和进度
- ✅ 阻塞问题和解决方案

**不应该记录**：
- ❌ 临时调试输出
- ❌ 失败的尝试（除非有学习价值）
- ❌ 用户明确说"删除"的内容
- ❌ 重复的尝试

### 记录粒度

**太细**（避免）：
```markdown
- 用户说：把变量名从 x 改为 y
- 用户说：其实还是用 x 吧
```

**适中**（推荐）：
```markdown
- 变量命名约定：使用描述性名称，避免单字母
- 用户反馈：明确要求使用 x 而非 y
```

**太粗**（避免）：
```markdown
- 做了一些修改
```

---

## 🎯 目标

**确保在上下文压缩后，依然能够**：
1. 继续当前任务而不丢失状态
2. 回顾重要决策而不重复讨论
3. 理解代码变更原因而不重新分析
4. 定位关键文件而不重新搜索

---

**记住**：上下文管理的目标是保留重要信息，而不是简单地减少 token 数量。质量比数量更重要。
