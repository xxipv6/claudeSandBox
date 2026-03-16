# claudeSandBox 快速开始指南

> 5 分钟上手 claudeSandBox v2.2.0

---

## 🎯 claudeSandBox 是什么？

**claudeSandBox** 是一个**智能体驱动**的 Claude Code 沙箱环境，专为**安全研究**、**安全开发**和**日常开发**设计。

**核心特点**：
- 🤖 **9 个专业智能体**：自动分工协作
- 🧠 **按需加载技能库**：避免上下文过载
- ⚡ **命令驱动**：快捷命令，按需执行
- 🛡️ **安全优先**：强制 TDD、安全编码规范

---

## 🚀 快速开始

### 1. 选择变体

```bash
cd claudeSandBox/

# 4 个变体选一个：
cd claudeCode-none/claude_arm64/  # 推荐：无 LSP，ARM64
# 或
cd claudeCode-none/claude_x64/     # 无 LSP，x64
# 或
cd claudeCode-lsp/claude_arm64/    # 有 LSP，ARM64
# 或
cd claudeCode-lsp/claude_x64/      # 有 LSP，x64
```

**区别**：
- **none / lsp**：是否安装语言服务器（LSP）
- **arm64 / x64**：CPU 架构

### 2. 构建容器

```bash
cd claude_arm64/  # 或 claude_x64/
docker build -t claude-sandbox .
```

### 3. 启动容器

```bash
docker run -it --rm claude-sandbox
```

### 4. 开始使用！

在容器中直接与 Claude 对话即可。

---

## 💡 常用场景

### 场景 1：开发新功能

**流程**：
```
你："帮我开发用户登录功能"
    ↓
Claude：[自动调用 brainstorming skill]
    → 呈现设计方案
    ↓
你："批准"
    ↓
Claude：[自动调用 planner agent]
    → 生成执行计划
    ↓
Claude：[自动调用 tdd-guide agent]
    → 编写测试
    ↓
Claude：[自动调用 dev agent]
    → 实现功能
    ↓
Claude：[自动调用 reviewer agent]
    → 代码审查
    ↓
Claude：[自动调用 doc-updater agent]
    → 更新文档
```

**关键词触发**：包含"开发"、"编写"、"创建"、"实现"自动触发

---

### 场景 2：编写 PoC

**流程**：
```
你："复现 CVE-2024-XXXX"
    ↓
Claude：[自动调用 poc-exploit skill]
    → 漏洞分析
    → PoC 编写
    → 验证复现
```

**注意**：PoC 编写是简单任务，不需要 brainstorming

**关键词触发**：包含"复现"、"PoC"、"poc"、"漏洞验证"自动触发

---

### 场景 3：修复 Bug

**流程**：
```
你："修复登录失败的问题"
    ↓
Claude：[自动调用 debugging skill]
    → 定位根因
    ↓
Claude：[自动调用 planner agent]
    → 制定修复计划
    ↓
Claude：[自动调用 tdd-guide agent]
    → 编写失败测试
    ↓
Claude：[自动调用 dev agent]
    → 实施修复
    ↓
Claude：[自动调用 reviewer agent]
    → 确认修复
```

---

### 场景 4：部署

**流程**：
```
你："部署到生产环境"
    ↓
Claude：[自动调用 ops agent]
    → 部署配置
    → 执行部署
    → 验证部署
```

**注意**：代码和文档已在开发阶段完成，部署时直接执行

**关键词触发**：包含"启动服务"、"部署"自动触发

---

## 📁 项目结构

```
workspace/.claude/
├── agents/          # 智能体定义
│   ├── dev.md              # 日常开发
│   ├── planner.md          # 任务规划
│   ├── tdd-guide.md        # TDD 专家
│   ├── research.md         # 安全研究
│   ├── reviewer.md         # 代码审查
│   ├── ops.md              # 运维自动化
│   └── ...
├── commands/        # 快捷命令
│   ├── learn.md            # 学习技能
│   └── tdd.md              # TDD 工作流
├── skills/          # 技能库
│   ├── thinking/           # 思维技能
│   │   ├── brainstorming/  # 设计探索
│   │   └── context-management/  # 上下文管理
│   ├── development/        # 开发技能
│   │   ├── debugging/      # 调试
│   │   └── code-review/    # 代码审查
│   └── security/           # 安全技能
│       ├── poc-exploit/    # PoC 编写
│       └── vuln-patterns/  # 漏洞模式
├── rules/           # 强制规则
│   ├── agents.md           # 智能体编排
│   └── security.md         # 安全编码规范
└── CLAUDE.md        # 项目契约
```

---

## 🤖 可用智能体

| 智能体 | 用途 | 自动触发关键词 |
|--------|------|----------------|
| **dev** | 日常开发 | "开发"、"编写"、"创建"、"实现" |
| **planner** | 任务规划 | "规划"、"设计"、"架构" |
| **tdd-guide** | TDD 专家 | "测试"、"TDD" |
| **research** | 安全研究 | "漏洞"、"安全"、"审计" |
| **reviewer** | 代码审查 | "审查"、"检查质量" |
| **ops** | 运维自动化 | "启动服务"、"部署" |
| **system-architect** | 系统架构 | 复杂架构设计 |
| **doc-updater** | 文档维护 | 开发完成后自动调用 |
| **tdd-guide** | 测试驱动 | 所有代码开发必须参与 |

---

## 🧠 可用技能

### 思维技能
- **brainstorming**：设计探索（所有创造性工作必须先使用）

### 开发技能
- **debugging**：调试问题
- **code-review**：代码审查
- **frontend-patterns**：前端开发模式
- **backend-patterns**：后端开发模式

### 安全技能
- **poc-exploit**：PoC 编写（简单任务，直接使用）
- **vuln-patterns**：漏洞模式识别

---

## ⚡ 快捷命令

在容器中输入：

```
/learn              # 学习技能
/tdd                # TDD 工作流
/learn-eval         # 评估学习效果
```

---

## 🔧 维护工具

### 同步所有变体

修改源文件后，运行：

```bash
./sync-variants.sh
```

或直接提交（pre-commit hook 自动同步）：

```bash
git add .
git commit -m "feat: ..."
# 自动同步 4 个变体
```

### 检查流程一致性

```bash
./check-workflow-consistency.sh
```

检查项目流程定义是否一致。

---

## 📚 核心流程

### 完整开发流程

```
brainstorming → planner → tdd-guide → dev → reviewer → doc-updater
```

### 快速修复流程

```
debugging → planner → tdd-guide → dev → reviewer
```

### 安全研究流程

```
poc-exploit → research + reviewer (并行)
```

### 部署流程

```
ops (直接部署)
```

---

## ⚠️ 重要规则

### 1. dev agent 永远不能作为第一个环节
- 新功能必须：brainstorming → planner → dev
- 任何情况都必须：planner → dev

### 2. 所有代码开发必须遵循 TDD
- tdd-guide 是独立 agent
- 必须参与所有代码开发（新功能、Bug 修复、重构）

### 3. PoC 编写是简单任务
- 不需要 brainstorming → planner
- 直接使用 poc-exploit skill

### 4. 文档在代码审查通过后更新
- 流程：dev → reviewer → doc-updater
- 文档不需要代码审查

---

## 🎓 学习资源

- **README.md**：完整项目文档
- **ARCHITECTURE.md**：架构设计文档
- **CHANGELOG.md**：版本历史
- **agents/README.md**：智能体文档
- **skills/README.md**：技能库文档

---

## 🚀 下一步

1. **构建容器**：`docker build -t claude-sandbox .`
2. **启动容器**：`docker run -it --rm claude-sandbox`
3. **开始对话**：直接与 Claude 交流

**提示**：直接说出你的需求，Claude 会自动调用合适的智能体和技能。

---

**有问题？** 查看 [README.md](README.md) 获取完整文档。
