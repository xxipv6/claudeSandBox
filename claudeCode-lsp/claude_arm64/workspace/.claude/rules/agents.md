# 智能体编排 (Agent Orchestration)

## 可用智能体 (Available Agents)

位于 `.claude/agents/`：

| 智能体 (Agent) | 用途 | 适用场景 | 模型 |
|-------|---------|-------------|------|
| system-architect | 系统架构设计 | 新系统设计、模块边界规划、架构风险评估 | sonnet |
| planner | 任务规划 | 复杂功能实现、重构规划、需求拆解 | sonnet |
| tdd-guide | 测试驱动开发 | 新功能、Bug 修复、代码重构 | sonnet |
| research | 安全研究 | PoC 开发、漏洞复现、协议分析、代码安全审计 | sonnet |
| dev | 日常开发 | Web/API/工具开发、工程规范遵守 | sonnet |
| reviewer | 代码审查 | 逻辑正确性、架构边界、代码质量检查 | sonnet |
| ops | 运维自动化 | 部署脚本、监控配置、故障排查 | sonnet |
| doc-updater | 文档维护 | 代码映射图生成、README 更新、文档同步 | haiku |

## 立即调用智能体 (Immediate Agent Usage)

以下情况无需用户提示即可直接调用：

### 必须调用 (MUST)

**优先级最高：规划优先**
1. **复杂任务** - 必须先调用 **planner** 智能体进行规划
   - 新功能开发
   - 代码重构
   - 系统迁移
   - 复杂问题排查

2. **简单任务（例外）** - 可以直接执行，无需规划
   - 文件操作：解压、复制、移动、删除
   - 查询操作：查看文件、搜索代码、查看日志
   - 简单命令：ls, cat, grep, find
   - 信息查看：git status, git log, ps aux

**判断标准**：
- 如果任务涉及**编写/修改代码** → 需要规划
- 如果任务涉及**系统设计/架构** → 需要规划
- 如果只是**文件操作/信息查看** → 直接执行

**特定场景自动调用**：
1. **系统设计** - 使用 **system-architect** 智能体
2. **复杂功能实现** - 使用 **planner** 智能体制定计划
3. **新功能/Bug 修复/重构** - 使用 **tdd-guide** 智能体（测试先行）
4. **安全研究/PoC** - 使用 **research** 智能体
5. **代码安全审计** - 使用 **research** 智能体
6. **代码编写/开发任务** - 使用 **dev** 智能体（自动触发，无需用户提示）
7. **代码质量审查** - 使用 **reviewer** 智能体（不含安全问题）
8. **运维任务** - 使用 **ops** 智能体

### 关键词自动触发（Keyword Auto-Trigger）

当用户输入包含以下关键词时，**立即自动调用**对应智能体：

| 关键词 | 自动调用智能体 |
|--------|---------------|
| "开发"、"编写"、"创建"、"实现" | **dev** |
| "启动服务"、"部署" | **ops** |
| "审查"、"检查质量" | **reviewer** |
| "漏洞"、"安全"、"审计"、"PoC" | **research** |
| "测试"、"TDD" | **tdd-guide** |
| "规划"、"设计"、"架构" | **planner** 或 **system-architect** |

**示例**：
```
用户：帮我开发登录功能
Claude：[自动识别关键词"开发"]
      → 自动调用 dev 智能体
      → 开始开发

用户：启动前后端服务
Claude：[自动识别关键词"启动"]
      → 自动调用 ops 智能体
      → 启动服务

用户：审计这段代码
Claude：[自动识别关键词"审计"]
      → 自动调用 research 智能体
      → 开始审计
```

### 自动触发 (Auto-Trigger)
智能体描述中包含 **"应主动（PROACTIVELY）使用"** 时，Claude 应在识别到相关场景时自动调用该智能体，无需等待用户明确指示。

### Skills 自动触发

**开发 Skills**（应主动（PROACTIVELY）使用）：
- `brainstorming` - **所有创造性工作必须先使用**
  - 创建功能、构建组件、添加行为、修改行为时必须先调用
  - 在调用任何 agent 之前，先使用 brainstorming 探索设计
- `frontend-patterns` - React/Next.js 前端开发
- `backend-patterns` - 后端开发模式
- `tdd-workflow` - 测试驱动开发
- `debugging` - 调试问题
- `code-review` - 代码审查

**关键词自动触发（Keyword Auto-Trigger）**：

## 并行任务执行 (Parallel Task Execution)

对于相互独立的操作，**务必**使用并行任务执行：

```markdown
# 推荐：并行执行
同时启动多个智能体：
1. 智能体 1：对 auth.ts 进行安全审计（research）
2. 智能体 2：对业务逻辑进行代码审查（reviewer）
3. 智能体 3：对数据库进行架构设计（system-architect）

# 避忌：在不必要时采用串行执行
先启动智能体 1，等待完成后再启动智能体 2
```

## 智能体协作模式 (Agent Collaboration Patterns)

### 🎨 完整开发流程（新功能开发）

```
用户请求
    ↓
brainstorming skill（设计探索）
    → 理解需求
    → 探索方案
    → 呈现设计
    → 撰写设计文档
    → 用户批准
    ↓
planner agent（任务规划）
    → 拆解任务
    → 识别依赖
    → 生成执行计划
    → 指定"执行智能体：dev"
    ↓
tdd-guide agent（TDD）
    → RED：编写测试
    → GREEN：编写代码
    → REFACTOR：重构代码
    ↓
dev agent（实现）
    → 按计划实现
    → 运行测试
    → 提交代码
    ↓
reviewer agent（审查）
    → 代码质量审查
    → 修复问题
```

### 🔄 快速修复流程（Bug 修复）

```
用户报告 Bug
    ↓
debugging skill（调试）
    → 理解问题
    → 定位根因
    ↓
planner agent（规划修复方案）
    → 制定修复计划
    → 指定"执行智能体：dev"
    ↓
dev agent（修复）
    → 实施修复
    → 验证修复
    ↓
reviewer agent（审查）
    → 确认修复正确
```

### 🔒 安全研究流程

```
用户请求安全审计
    ↓
research agent（安全研究）
    → 代码安全审计
    → 漏洞分析
    → PoC 开发
    ↓
[并行]
reviewer agent（质量审查）
    → 逻辑正确性
    → 架构边界
    → 代码质量
```

### 🚀 部署流程

```
用户请求部署
    ↓
ops agent（运维）
    → 部署配置
    → 执行部署
    → 验证部署
    ↓
doc-updater agent（文档更新）
    → 更新文档
    → 更新 API 文档
```

---

## 智能体协作模式 (Agent Collaboration Patterns)

### 1. 规划 → TDD → 审查流程
```
planner → tdd-guide → dev → reviewer → doc-updater
```

适用于：新功能开发、重大重构

**关键**：tdd-guide 确保测试先行，80%+ 覆盖率

### 2. 研究分离流程
```
research (安全审计) + reviewer (质量审查) → 并行
```

适用于：代码提交前审查

**注意**：research 负责安全问题，reviewer 负责逻辑/架构/质量问题，职责清晰分离。

### 3. 架构驱动流程
```
system-architect → planner → dev → reviewer
```

适用于：新系统设计、复杂模块

### 4. 运维集成流程
```
dev → ops → doc-updater
```

适用于：部署、监控、配置管理

## 智能体选择决策树 (Agent Selection Decision Tree)

```
需要做什么？
├── 系统设计/架构决策
│   └── system-architect
├── 复杂功能规划
│   └── planner
├── 新功能/Bug 修复/重构
│   └── tdd-guide（测试先行，80%+ 覆盖率）
├── 安全研究/PoC/代码审计
│   └── research
├── 日常开发（遵守工程规范）
│   └── dev
├── 代码质量审查（不含安全）
│   └── reviewer
├── 运维/部署/监控
│   └── ops
└── 文档更新/代码映射图
    └── doc-updater
```

## 智能体职责边界 (Agent Responsibility Boundaries)

### research vs reviewer
- **research**: 安全问题（SQL 注入、XSS、权限绕过等）
- **reviewer**: 逻辑正确性、架构边界、命名风格、可维护性

### system-architect vs planner
- **system-architect**: 系统级架构设计、模块边界、技术选型
- **planner**: 具体功能实现计划、任务拆解、依赖分析

### dev vs reviewer
- **dev**: 编写符合工程规范的代码
- **reviewer**: 审查代码质量（不负责编写代码）

## 模型选择原则 (Model Selection Principles)

- **haiku**: 文档任务（doc-updater）- 成本优化
- **sonnet**: 大部分智能体 - 平衡性能与成本
- **opus**: 极其复杂的安全研究（必要时）- 最高性能

## 多维度分析 (Multi-Perspective Analysis)

针对复杂问题，可使用分角色子智能体：
- 事实审查员 (Factual Reviewer) - 验证事实准确性
- 资深工程师 (Senior Engineer) - 评估工程实践
- 安全专家 (Security Expert) - research 智能体
- 架构师 (Architect) - system-architect 智能体
- 一致性审查员 (Consistency Reviewer) - reviewer 智能体
