# claudeSandBox 维护手册

> **写给下一任 AI 维护者**：本文档说明项目架构、提示词关联关系和维护流程。

---

## 📊 项目现状（2026-03-17）

### 版本信息
- **当前版本**：v2.2.0
- **架构类型**：命令驱动 + Skills 按需加载 + Agents 自动触发
- **适用场景**：安全研究、安全开发、日常开发

### 核心组件
```
claudeSandBox/
├── README.md              # 项目主文档（根目录唯一 README）
├── CHANGELOG.md           # 版本历史
├── QUICKSTART.md          # 快速开始
├── MAINTENANCE.md         # 本文档（维护手册）
├── ARCHITECTURE.md        # 架构设计（如需要）
│
└── [4 个变体目录]
    ├── claudeCode-none/claude_arm64/   ← 主变体（修改源）
    ├── claudeCode-none/claude_x64/
    ├── claudeCode-lsp/claude_arm64/
    └── claudeCode-lsp/claude_x64/
        └── workspace/
            └── .claude/
                ├── CLAUDE.md          # 🌟 主契约（单一真相源）
                ├── agents/            # 智能体定义
                ├── skills/            # 技能库
                ├── commands/          # 命令定义
                └── rules/             # 按路径加载的规则
```

### 变体同步策略
- **主变体**：`claudeCode-none/claude_arm64/`
- **同步工具**：`./sync-variants.sh` 或 pre-commit hook
- **同步范围**：`workspace/.claude/` 目录（agents、skills、commands、rules 等）
- **同步原则**：修改主变体 → 运行同步 → 提交

---

## 🔗 提示词关联关系图

### 核心依赖链

```
CLAUDE.md (主契约 - 单一真相源)
    ↓
    ├── agents.md (智能体编排)
    │   ├── system-architect.md
    │   ├── planner.md ────────┐
    │   ├── research.md        │
    │   ├── dev.md              │
    │   ├── reviewer.md         │
    │   ├── ops.md              │
    │   └── doc-updater.md      │
    │                            │
    ├── brainstorming/SKILL.md ──┤
    │                            │
    └── [其他 agents]            │
                                 │
                          交叉引用：
                          ├─ 复杂度判断 (CLAUDE.md)
                          ├─ 技能清单 (skills/README.md)
                          └─ 输出格式 (CLAUDE.md 项目目录结构)
```

### 关键关联关系

#### 1. **CLAUDE.md → agents.md**
- **关系**：CLAUDE.md 定义核心流程，agents.md 实现智能体编排
- **数据流向**：CLAUDE.md → agents.md → 各个 agent 定义
- **一致性要求**：
  - 复杂度判断标准在 CLAUDE.md 定义
  - agents.md 引用 CLAUDE.md，不重复定义
  - 各 agent 引用 CLAUDE.md 作为前置条件

**示例**：
```markdown
# agents.md
> **复杂度判断标准**：参见 `CLAUDE.md` 中的 `第一步：判断任务类型`

# planner.md
> **复杂度判断标准**：参见 `CLAUDE.md` 中的 `第一步：判断任务类型`
```

#### 2. **CLAUDE.md → brainstorming/SKILL.md**
- **关系**：CLAUDE.md 定义何时使用 brainstorming
- **数据流向**：CLAUDE.md → brainstorming/SKILL.md
- **一致性要求**：
  - CLAUDE.md 定义高复杂度任务必须使用 brainstorming
  - brainstorming/SKILL.md 引用 CLAUDE.md 的项目目录结构
  - 不重复定义项目结构

**示例**：
```markdown
# CLAUDE.md
**高复杂度任务**：主动询问是否需要 brainstorming

# brainstorming/SKILL.md
**项目目录结构**：参见 `CLAUDE.md` 中的 `项目目录结构` 定义
```

#### 3. **agents.md → 各个 agent**
- **关系**：agents.md 定义智能体编排规则
- **数据流向**：agents.md → planner.md, dev.md, research.md 等
- **一致性要求**：
  - agents.md 列出所有可用 agents
  - 各 agent 引用 agents.md 中的职责边界
  - 不在单个 agent 中重复定义全局规则

**示例**：
```markdown
# agents.md
| 智能体 | 用途 |
|-------|------|
| planner | 任务规划 |
| dev | 日常开发 |

# dev.md
**与 Planner 的协作**：参见 `agents.md` 中的智能体协作模式
```

#### 4. **planner.md → skills/**
- **关系**：planner 列出可用技能清单
- **数据流向**：skills/ → planner.md
- **一致性要求**：
  - skills/ 目录是单一真相源
  - planner.md 引用 skills，不定义新技能
  - 添加新 skill 时更新 planner.md 的清单

**示例**：
```markdown
# planner.md
## 可用技能参考
- `frontend-patterns` - React/Next.js 前端开发

# skills/frontend-patterns/SKILL.md
实际技能定义
```

#### 5. **CLAUDE.md → 所有文件**
- **关系**：CLAUDE.md 是主契约，所有文件都必须遵守
- **数据流向**：CLAUDE.md → 所有 .md 文件
- **一致性要求**：
  - 项目目录结构在 CLAUDE.md 定义
  - 所有文件引用 CLAUDE.md，不重复定义
  - 修改 CLAUDE.md 可能影响所有文件

---

## 🗂️ 关键文件说明

### 主契约层（必须遵守）

| 文件 | 作用 | 影响范围 | 修改风险 |
|------|------|---------|---------|
| **CLAUDE.md** | 主契约、单一真相源 | 所有文件 | 🔴 高 |
| **agents.md** | 智能体编排规则 | 所有 agents | 🟡 中 |
| **git-workflow.md** | Git 工作流 | 开发流程 | 🟢 低 |

### 智能体层（自动触发）

| 文件 | 作用 | 依赖 | 被依赖 |
|------|------|------|--------|
| **planner.md** | 任务规划 | CLAUDE.md, agents.md, skills/ | dev.md, research.md |
| **dev.md** | 日常开发 | CLAUDE.md, agents.md | planner.md |
| **research.md** | 安全研究 | agents.md | planner.md |
| **system-architect.md** | 系统架构 | agents.md | planner.md |

### 技能层（按需加载）

| 目录 | 作用 | 触发条件 |
|------|------|---------|
| **brainstorming/** | 设计探索 | 高复杂度任务 + 用户批准 |
| **security/*** | 安全技能 | 安全研究相关任务 |
| **frontend-patterns/** | 前端开发 | React/Next.js 开发 |
| **backend-patterns/** | 后端开发 | API/服务开发 |
| **debugging/** | 调试 | 问题排查 |
| **code-review/** | 代码审查 | 质量检查 |

### 规则层（按路径加载）

| 文件 | 作用 | 触发条件 |
|------|------|---------|
| **security.md** | 安全编码规范 | 所有涉及安全的代码 |
| **python/coding-style.md** | Python 规范 | .py 文件 |
| **javascript/coding-style.md** | JS/TS 规范 | .js/.ts 文件 |
| **go/coding-style.md** | Go 规范 | .go 文件 |
| **java/coding-style.md** | Java 规范 | .java 文件 |

---

## 🔄 维护流程

### 修改任何提示词文件时的标准流程

```
1. 阅读本文档（MAINTENANCE.md）
   ↓
2. 识别修改范围
   - 主契约修改 → 检查所有依赖文件
   - agent 修改 → 检查关联的 skills 和 agents
   - skill 修改 → 检查引用它的 agents
   ↓
3. 在主变体中修改
   路径：claudeCode-none/claude_arm64/
   修改位置：workspace/.claude/ 目录下
   ↓
4. 检查一致性
   - 确认没有重复定义
   - 确认引用关系正确
   - 确认格式统一
   ↓
5. 同步到其他 3 个变体
   ./sync-variants.sh
   ↓
6. 提交变更
   git add -A && git commit -m "..."
   ↓
7. 更新相关文档
   - README.md（如有架构变更）
   - CHANGELOG.md（记录变更）
```

### 关键检查清单

修改任何文件前，必须确认：

- [ ] 已识别所有依赖此文件的文件
- [ ] 已检查是否有重复定义
- [ ] 已确认引用路径正确
- [ ] 已确认格式与其他文件一致
- [ ] 已更新 CHANGELOG.md（如有必要）
- [ ] 已同步到所有 4 个变体

---

## 🚨 常见维护任务

### 任务 1：添加新的 skill

**步骤**：
1. 在主变体的 `workspace/.claude/skills/` 下创建新 skill 目录
2. 创建 `SKILL.md`，遵循标准格式
3. 如果是常用 skill，在 `workspace/.claude/rules/agents.md` 的 "Skills 自动触发" 中添加
4. 在 `workspace/.claude/agents/planner.md` 的 "可用技能参考" 中添加
5. 同步到所有变体
6. 更新 CHANGELOG.md

**关联文件**：
- `workspace/.claude/skills/[new-skill]/SKILL.md`（新建）
- `workspace/.claude/rules/agents.md`（可能需要更新）
- `workspace/.claude/agents/planner.md`（需要更新）

### 任务 2：修改 CLAUDE.md

**风险**：🔴 高（影响所有文件）

**步骤**：
1. 识别所有引用 CLAUDE.md 的文件
2. 在主变体中修改 `workspace/.claude/CLAUDE.md`
3. 检查所有依赖文件是否需要更新
4. 同步到所有变体
5. 提交前仔细检查一致性
6. 更新 CHANGELOG.md 和 README.md

**关联文件**：
- 所有 `workspace/.claude/agents/*.md`
- `workspace/.claude/skills/brainstorming/SKILL.md`
- 所有引用 CLAUDE.md 的文件

### 任务 3：添加新的 agent

**步骤**：
1. 在 `workspace/.claude/agents/` 下创建新的 agent 定义文件
2. 在 `workspace/.claude/rules/agents.md` 的可用智能体表中添加
3. 确定与现有 agents 的协作关系
4. 在 `workspace/.claude/rules/agents.md` 的协作模式中添加（如需要）
5. 同步到所有变体
6. 更新 CHANGELOG.md

**关联文件**：
- `workspace/.claude/agents/[new-agent].md`（新建）
- `workspace/.claude/rules/agents.md`（必须更新）
- 可能需要更新其他 agents

### 任务 4：修改智能体协作关系

**步骤**：
1. 在 `workspace/.claude/rules/agents.md` 中修改协作模式
2. 更新涉及的 agents 的 "When to Invoke" 部分
3. 检查是否有循环依赖
4. 同步到所有变体
5. 更新 CHANGELOG.md

**关联文件**：
- `workspace/.claude/rules/agents.md`（必须更新）
- 涉及的所有 agents

---

## ⚠️ 常见陷阱和解决方案

### 陷阱 1：重复定义

**问题**：同一个规则在多个文件中定义，导致不一致。

**示例**：
```markdown
# CLAUDE.md
高复杂度任务：多模块开发、系统重构...

# planner.md
高复杂度任务：多模块开发、系统重构...  ❌ 重复
```

**解决**：
```markdown
# planner.md
> **复杂度判断标准**：参见 `CLAUDE.md` 中的 `第一步：判断任务类型`
```

### 陷阱 2：循环引用

**问题**：A 文件引用 B 文件，B 文件又引用 A 文件。

**示例**：
```markdown
# planner.md
参见 dev.md 中的前置条件

# dev.md
参见 planner.md 中的规划要求
```

**解决**：两个文件都引用 CLAUDE.md 或 agents.md 作为中间层。

### 陷阱 3：忘记同步

**问题**：只修改了主变体，忘记同步到其他 3 个变体。

**解决**：
- 使用 pre-commit hook 自动同步
- 或运行 `./sync-variants.sh`

### 陷阱 4：路径引用错误

**问题**：使用了相对路径，导致在某些变体中找不到文件。

**示例**：
```markdown
参见 ../../../CLAUDE.md  ❌ 相对路径
```

**解决**：
```markdown
参见 `CLAUDE.md`  ✅ 使用文件名，系统会自动查找
```

### 陷阱 5：修改主契约但不检查依赖

**问题**：修改了 CLAUDE.md，但没有检查哪些文件依赖它。

**解决**：
```bash
# 查找所有引用 CLAUDE.md 的文件
grep -r "CLAUDE.md" claudeCode-none/claude_arm64/workspace/.claude/
```

---

## 📋 维护检查清单

### 每次修改后必做
- [ ] 已识别所有受影响的文件
- [ ] 已在主变体中修改
- [ ] 已检查无重复定义
- [ ] 已检查引用路径正确
- [ ] 已同步到所有 4 个变体
- [ ] 已更新 CHANGELOG.md
- [ ] 已提交变更

### 每周检查
- [ ] 检查 4 个变体是否一致
- [ ] 检查是否有孤立文件（无引用）
- [ ] 检查文档是否最新

### 每月检查
- [ ] 检查是否有过时的 skills 或 agents
- [ ] 检查架构是否需要演进
- [ ] 清理无用文件

---

## 🎯 设计原则

### 单一真相源（SSOT）
- **核心规则**：在 CLAUDE.md 定义一次
- **智能体规则**：在 agents.md 定义一次
- **技能定义**：在 skills/ 目录定义
- **编码规范**：在 rules/ 目录定义

### 引用而非重复
- ❌ 不要在多个文件中复制相同内容
- ✅ 使用引用指向定义源
- ✅ 引用格式：`参见 [文件名] 中的 [章节名]`

### 解耦和模块化
- 每个 agent 独立定义
- 每个 skill 独立定义
- 通过 agents.md 进行编排

### 向后兼容
- 修改主契约时考虑影响范围
- 不破坏现有工作流
- 重大变更记录在 CHANGELOG.md

---

## 🔍 快速参考

### 关键文件位置

```
主变体目录：
claudeCode-none/claude_arm64/

主契约：
claudeCode-none/claude_arm64/workspace/.claude/CLAUDE.md

智能体编排：
claudeCode-none/claude_arm64/workspace/.claude/rules/agents.md

任务规划：
claudeCode-none/claude_arm64/workspace/.claude/agents/planner.md

设计探索：
claudeCode-none/claude_arm64/workspace/.claude/skills/brainstorming/SKILL.md
```

### 常用命令

```bash
# 同步所有变体
./sync-variants.sh

# 查找引用某个文件的所有位置
grep -r "CLAUDE.md" claudeCode-none/claude_arm64/workspace/.claude/

# 检查变体一致性
diff claudeCode-none/claude_arm64/workspace/.claude/CLAUDE.md \
     claudeCode-none/claude_x64/workspace/.claude/CLAUDE.md

# 查看最近的变更
git log --oneline -10
```

---

## 📚 相关文档

- **README.md**：项目主文档
- **QUICKSTART.md**：快速开始
- **CHANGELOG.md**：版本历史
- **ARCHITECTURE.md**：架构设计（如需要）

---

## 🤝 给下一任维护者

如果你正在阅读这份文档，说明你是 claudeSandBox 的新维护者。以下是一些建议：

1. **先理解，再修改**：花时间阅读关键文件，理解架构和设计原则
2. **小步快跑**：每次修改一个文件，提交，测试
3. **保持一致**：遵循现有格式和风格
4. **记录变更**：及时更新 CHANGELOG.md
5. **提问质疑**：如果发现不合理的地方，不要害怕提出问题

**记住**：
- CLAUDE.md 是主契约，修改它要谨慎
- agents.md 是智能体编排，它连接各个组件
- skills/ 是按需加载的知识库
- rules/ 是按路径加载的约束

祝你好运！🚀

---

**文档版本**：v1.0
**最后更新**：2026-03-17
**维护者**：Claude Sonnet 4.6
