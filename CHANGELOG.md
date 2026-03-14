# 更新日志

## 2026-03-15

### 重大更新

#### v2.0.0 - 配置驱动的流程编排系统

全新重构为配置驱动的多 Agent Orchestrator 系统，实现工程化的流程编排和状态管理。

**核心架构变化**：

1. **配置驱动的流程编排**
   - 采用 YAML 配置文件定义流程
   - 6 个执行阶段，每个阶段独立配置
   - 显式引用机制，禁止自动发现
   - 状态驱动的执行模式

2. **Agent 架构调整**
   - **移除**：`qa-engineer`（分析层从 5 个减少到 4 个）
   - **新增前置规划**：`task-planner` 独立于 Analysis Mode
   - **分析层 Agents（4 个）**：
     - `product-manager`：需求与业务目标分析
     - `backend-engineer`：系统结构与状态机分析
     - `frontend-engineer`：输入面与攻击面分析
     - `security-tester`：攻击路径与漏洞分析

3. **6 个执行阶段**
   - **Stage 00 - Planning**：启动 task-planner，规划任务
   - **Stage 01 - Task Init**：创建任务记录，检查依赖
   - **Stage 02 - Git Prepare**：Git 前置准备，创建任务分支
   - **Stage 03 - Mode Execution**：执行模式（Analysis/Coding）
   - **Stage 04 - Quality Gate**：质量验证
   - **Stage 05 - Completion**：完成与状态管理

4. **任务生命周期管理**
   - 完整的状态机：pending → running → completed/failed/cancelled/paused
   - 状态持久化：`.claude/task_states/task-{id}.json`
   - 状态转换历史：完整记录每次状态变化
   - 状态转换规则：明确的转换条件和触发机制

5. **Git 分支管理**
   - 每个任务独立分支：`task-{id}`
   - 按阶段提交：`Stage {id}: {name}`
   - 失败回滚：`git reset --hard`
   - 完成合并：合并到主分支后删除任务分支

6. **任务依赖管理**
   - 任务依赖图：DAG 结构
   - 依赖等待：依赖不满足时暂停任务
   - 依赖触发：依赖任务完成时自动触发
   - 依赖失败：required 失败导致本任务失败

7. **子任务管理**
   - 子任务拆解：task-planner 拆解主任务
   - 子任务依赖：DAG 结构，拓扑序执行
   - 子任务状态：独立跟踪每个子任务状态
   - 子任务输出：每个子任务独立 commit

8. **质量门禁**
   - 静态分析：语法检查、代码风格
   - 安全扫描：漏洞扫描、依赖检查
   - 自动测试：运行测试、验证功能
   - 修复循环：最多 3 次修复尝试

9. **状态持久化**
   - 任务队列：`.claude/task_queue.json`
   - 任务状态：`.claude/task_states/task-{id}.json`
   - 任务规划：`.claude/task_plans/task-{id}.json`
   - 子任务队列：`.claude/subtask_queues/task-{id}.json`
   - 任务依赖：`.claude/task_dependencies.json`
   - 执行日志：`.claude/execution_logs/{id}.log`

10. **协议声明**
    - 系统性质声明：人为定义的协议系统
    - 强制协议：唯一真理源、显式引用、状态驱动、严格顺序
    - 禁止行为：自动发现、假设内容、跳过阶段、脑补状态
    - 检查点机制：每个阶段都有检查点

**文件结构变化**：

```
workspace/
├── CLAUDE.md                    # 主配置（简化为流程引擎）
├── .claude/
│   ├── PROTOCOL.md              # 协议声明（新增）
│   ├── workflow/                # 流程编排配置（新增）
│   │   ├── config.yaml         # 主流程配置
│   │   ├── stages/             # 各阶段详细配置
│   │   │   ├── 00-planning.md
│   │   │   ├── 01-task-init.md
│   │   │   ├── 02-git-prepare.md
│   │   │   ├── 03-mode-execution.md
│   │   │   ├── 04-quality-gate.md
│   │   │   ├── 05-completion.md
│   │   │   └── templates/      # 模板文件（新增）
│   │       ├── research-ledger.md
│   │       ├── task-state.json
│   │       └── subtask-state.json
│   ├── agents/                 # Agent 定义（保持不变）
│   ├── task_queue.json         # 任务队列（新增）
│   ├── task_states/            # 任务状态存储（新增）
│   ├── task_plans/             # 任务规划存储（新增）
│   ├── subtask_queues/         # 子任务队列存储（新增）
│   ├── task_dependencies.json  # 任务依赖关系（新增）
│   └── execution_logs/         # 执行日志（新增）
└── knowledge/                  # 外置知识系统（保持不变）
```

**核心原则**：

1. **唯一真理源**：CLAUDE.md 是唯一入口
2. **显式引用**：所有文件必须显式读取
3. **状态驱动**：状态只能来自文件
4. **严格顺序**：按照配置执行

**适用场景扩展**：

- ✅ 各类安全研究
- ✅ 复杂系统开发与分析
- ✅ 需要多视角评估的设计评审
- ✅ 漏洞分析与 PoC 开发
- ✅ 安全工具开发
- ✅ 任务拆解与资源规划
- ✅ 环境配置与依赖管理
- ✅ 工程化流程编排
- ✅ 任务依赖管理
- ✅ 质量门禁

**适用版本**：

- `claudeCode-none/claude_arm64` ✅
- `claudeCode-none/claude_x64` ✅
- `claudeCode-lsp/claude_arm64` ✅
- `claudeCode-lsp/claude_x64` ✅

---

## 2026-03-12

### 优化改进

#### Agent 架构优化
通用化所有 agent 描述，移除特定场景引用，使系统适用于所有类型的安全研究和复杂项目。

**架构调整**：

1. **分析层 Agents（6 个 → 新增 task-planner）**
   - `task-planner`：任务拆解、优先级排序、依赖识别、资源规划（新增）
   - `product-manager`：需求与业务目标分析
   - `backend-engineer`：系统结构与状态机分析
   - `frontend-engineer`：输入面与攻击面分析
   - `qa-engineer`：失败路径与边界场景分析
   - `security-tester`：攻击路径与漏洞分析

2. **执行层 Coder Agents（2 个 → 合并优化）**
   - `dev-coder`：所有代码开发（前端、后端、全栈、API、组件、数据库）
     - 合并原有的 `backend-coder`、`frontend-coder`、`fullstack-coder`
   - `script-coder`：安全脚本（PoC、Exploit、Fuzzer、扫描工具）

3. **支持层 Agent（1 个 → 新增 ops-engineer）**
   - `ops-engineer`：环境配置、工具安装、系统调试、依赖管理（新增）

**编排能力强化**：

- ✅ **分级调度**：根据任务复杂度动态分配 2-6 个 agent
  - 简单任务：2-3 个（task-planner + 核心专家）
  - 标准任务：4-5 个（task-planner + 多领域专家）
  - 深度任务：6 个（全部分析层 agent）
- ✅ **判断维度明确化**：问题数量、设计需求、风险等级、领域覆盖、影响范围
- ✅ **行动决策机制**：分析完成后提供 1-3 个可执行的下一步选项
- ✅ **轻量分析增强**：Coding Mode 下 30 秒快速上下文理解
  - 快速扫描 → 需求理解 → 问题定位 → 选择 coder → 调用执行
- ✅ **证据有效性标准**：Research Ledger 验证机制
  - 有效证据：代码引用、日志输出、测试结果、文档引用、可重现观察
  - 无效证据：主观判断、无根据推测、缺少来源的陈述

**适用场景扩展**：

- ✅ 各类安全研究（不限于特定场景）
- ✅ 复杂系统开发与分析
- ✅ 需要多视角评估的设计评审
- ✅ 漏洞分析与 PoC 开发
- ✅ 安全工具开发
- ✅ 任务拆解与资源规划
- ✅ 环境配置与依赖管理

---

## 2026-03-11

### 重大更新

#### 安全研究多 Agent 团队架构
全新重构 Claude Code 配置体系，采用双模式调度架构，专为安全研究和复杂项目设计。

**核心架构**：

1. **双模式调度系统**
   - **Analysis Mode（默认）**：意图识别驱动，默认进入分析模式
   - **Coding Mode（执行模式）**：明确条件触发，每次编写代码都调用执行层 agent

2. **分析层 Agents（5 个）**
   - `product-manager`：需求与业务目标分析
   - `backend-engineer`：系统结构与状态机分析
   - `frontend-engineer`：输入面与攻击面分析
   - `qa-engineer`：失败路径与边界场景分析
   - `security-tester`：攻击路径与漏洞分析

3. **执行层 Coder Agents（4 个）**
   - `backend-coder`：后端代码（API、模型、服务、迁移）
   - `frontend-coder`：前端代码（页面、组件、状态管理）
   - `fullstack-coder`：全栈代码（从 0 到 1 搭建小系统）
   - `script-coder`：安全脚本（PoC、Exploit、Fuzzer、扫描工具）

4. **Orchestrator（编排器）**
   - 意图识别优先于关键词匹配
   - 任务复杂度判断（多模块、设计决策、风险评估）
   - 自动模式切换（Analysis ↔ Coding）

**关键特性**：

- ✅ **意图识别**：从关键词触发升级为智能意图识别
- ✅ **默认分析**：复杂任务默认进入 Analysis Mode
- ✅ **持续调用**：Coding Mode 每次编写/修改代码都调用相应 agent
- ✅ **上下文感知修复**：修复代码时检查整个文件，发现并修复所有类似问题
- ✅ **结构化输出**：Research Ledger 格式（Goal、System Model、Verified Facts 等）

**Knowledge 共享知识库**：

1. **patterns.md** - 系统性失败模式（13KB）
   - 状态类失败：死锁、活锁、状态不一致
   - 边界类失败：溢出、越界、空值、未定义
   - 信任类失败：认证、授权、会话、加密
   - 时间类失败：竞态、超时、时钟漂移
   - 资源类失败：泄漏、耗尽、限流
   - 组合类失败：分布式、级联、 Byzantine

2. **domains.md** - 统一安全问题空间（8KB）
   - 入侵链阶段：Kill Chain → ATT&CK
   - 漏洞分类：CWE → CVE
   - 控制基线：安全框架映射

3. **tools.md** - 工具视角认知（11KB）
   - 工具选用决策树
   - 能力边界识别
   - 组合工作流

4. **corrections.md** - 错误学习库（11KB）
   - 15 个预填充错误模式
   - 避免重复错误

**双层记忆架构**：

- **Knowledge 文件夹**：项目级共享知识，所有 agent 共享
- **Agent Memory**：每个 agent 独立记忆目录（`.claude/agent-memory/{agent}/MEMORY.md`）

**适用场景**：

- ✅ 各类安全项目（不限于攻防演练）
- ✅ 复杂系统开发与分析
- ✅ 需要多视角评估的设计评审
- ✅ 漏洞分析与 PoC 开发
- ✅ 安全工具开发

**适用版本**：

- `claudeCode-none/claude_arm64` ✅
- `claudeCode-none/claude_x64` ✅
- `claudeCode-lsp/claude_arm64` ✅
- `claudeCode-lsp/claude_x64` ✅

---

## 2026-03-09

### 新增功能

#### 子代理支持（Sub-Agent）
Claude Code 现已支持多种专用子代理，可针对不同任务类型自动选择最优的代理来处理复杂工作。

**可用代理类型**：

1. **general-purpose（通用代理）**
   - 用途：研究复杂问题、搜索代码、执行多步骤任务
   - 适用场景：不确定具体文件位置、需要多轮搜索的开放式任务
   - 工具：访问所有工具

2. **Explore（探索代理）**
   - 用途：快速探索代码库结构
   - 适用场景：按模式查找文件（如 `src/components/**/*.tsx`）、搜索关键词、理解代码库架构
   - 搜索级别：quick（快速）、medium（中等）、very thorough（深度）
   - 工具：除 Agent、ExitPlanMode、Edit、Write、NotebookEdit 外的所有工具

3. **Plan（规划代理）**
   - 用途：软件架构设计，制定实现计划
   - 适用场景：需要设计实现策略、识别关键文件、考虑架构权衡
   - 工具：除 Agent、ExitPlanMode、Edit、Write、NotebookEdit 外的所有工具
   - 输出：逐步计划、关键文件列表、架构考量

4. **claude-code-guide（使用指南代理）**
   - 用途：解答 Claude Code 相关问题
   - 适用场景：
     - Claude Code CLI 工具功能、钩子、斜杠命令、MCP 服务器、设置、IDE 集成、快捷键
     - Claude Agent SDK 构建自定义代理
     - Claude API 使用、Anthropic SDK、工具调用
   - 工具：Glob、Grep、Read、WebFetch、WebSearch
   - 注意：可恢复已有对话，避免重复创建

5. **statusline-setup（状态栏配置代理）**
   - 用途：配置 Claude Code 状态栏设置
   - 工具：Read、Edit

**使用方式**：
- Claude 会根据任务类型自动选择合适的子代理
- 支持并行运行多个独立代理以提高效率
- 支持后台运行代理（`run_in_background`）
- 支持代理恢复（`resume`）继续之前的对话
- 支持隔离工作树（`isolation: "worktree"`）进行安全操作

**最佳实践**：
- 简单直接的任务直接使用主会话处理
- 需要多轮搜索的探索性任务使用 Explore 代理
- 需要实现设计的任务使用 Plan 代理
- Claude Code 使用问题使用 claude-code-guide 代理
- 可以并行启动多个独立任务代理以提高效率

---

## 2026-02-18

### 优化改进

#### Git 配置简化
移除了 Git URL 重写配置，使用默认行为。

- **移除配置**: `url."xxx".insteadOf` URL 重写规则
- **保留配置**: HTTP/HTTPS 代理设置
- **行为说明**: Git 根据使用的 URL 自动选择协议（SSH 或 HTTPS）

#### 开发工具增强
新增常用开发和网络诊断工具。

- **tree** - 以树状结构显示目录内容
- **net-tools** - 提供 `ifconfig`、`netstat` 等网络工具
- **iputils-ping** - 提供 `ping` 命令用于网络连通性测试

#### ArvinENV 工具脚本优化
重构 ArvinENV 工具脚本，使用 COPY 方式部署，提高可维护性。

**架构改进**：
- 脚本文件从 Dockerfile 同目录的 `ArvinENV/` 复制到容器
- 替代原有复杂的 echo 命令创建方式
- 更易于维护和修改脚本内容

**命令更新**：

1. **key** - 配置管理（功能增强）
   ```bash
   key -k <token>              # 修改 ANTHROPIC_AUTH_TOKEN
   key -u <url>                # 修改 ANTHROPIC_BASE_URL
   key -k <token> -u <url>     # 同时修改两者
   ```
   - 参数可选，至少提供一个
   - 支持同时修改 token 和 base URL

2. **config** - 配置查看（新增）
   ```bash
   config  # 查看所有配置信息
   ```
   - 显示当前 Token（脱敏处理）
   - 显示 Base URL、Model 等配置
   - 显示 Git 代理配置
   - 显示环境变量和 CLI 版本
   - 提供快捷命令提示

3. **rms** - 清理配置（保持不变）
   ```bash
   rms  # 清理 Claude 配置和缓存
   ```

### 影响的文件

所有 4 个 Dockerfile 文件均已更新:

- `claudeCode-lsp/claude_x64/Dockerfile`
- `claudeCode-lsp/claude_arm64/Dockerfile`
- `claudeCode-none/claude_x64/Dockerfile`
- `claudeCode-none/claude_arm64/Dockerfile`

新增文件（每个 Dockerfile 同目录）：

- `ArvinENV/key` - 配置管理脚本
- `ArvinENV/rms` - 清理脚本
- `ArvinENV/config` - 配置查看脚本

---

## 2026-01-23

### 新增功能

#### HTTP 代理支持（Claude Code CLI 安装）
在所有 Dockerfile 中为 Claude Code CLI 安装添加 HTTP 代理支持，解决网络访问问题。

- **代理协议**: HTTP
- **默认配置**: `PROXY_HOST=host.docker.internal`, `PROXY_PORT=1087`
- **实现方式**: 使用环境变量 `HTTP_PROXY`、`HTTPS_PROXY`
- **下载源**: 使用国内镜像 `https://claude.mcprotocol.cn/install.sh` 下载安装脚本

#### 配置说明
安装脚本执行时自动通过代理访问网络资源：
- 从国内镜像下载脚本（无需代理）
- 脚本执行时通过代理访问 Google Storage 等被墙资源

如需修改代理地址，在构建时传入 ARG 参数：
```bash
docker build --build-arg PROXY_HOST=your-ip --build-arg PROXY_PORT=1087 -t image:tag .
```

### 影响的文件

所有 4 个 Dockerfile 文件均已更新:

- `claudeCode-lsp/claude_x64/Dockerfile`
- `claudeCode-lsp/claude_arm64/Dockerfile`
- `claudeCode-none/claude_x64/Dockerfile`
- `claudeCode-none/claude_arm64/Dockerfile`

---

## 2026-01-17

### 新增功能

#### ArvinENV 工具目录
在所有 Dockerfile 中新增 `/root/ENV/ArvinENV` 工具目录，并将其添加到 PATH 环境变量中，可在容器内任何目录直接调用。

- **环境变量**: `ARVINENV_PATH=/root/ENV/ArvinENV`
- **PATH 配置**: `/root/ENV/ArvinENV:/usr/local/go/bin:/usr/local/bin:$PATH`

#### 新增命令

1. **rms** - 清理 Claude 配置目录
   - 保留 `settings.json` 和 `.claude.json`
   - 保留 `plugins` 文件夹及其内容
   - 删除其他所有文件和目录
   - 使用方法: `rms`

2. **key** - 修改 API Token
   - 快速更新 `/root/.claude/settings.json` 中的 `ANTHROPIC_AUTH_TOKEN` 值
   - 使用方法: `key <new_token>`
   - 示例: `key "your-token-here"`

### 中文支持修复

- 添加 `tmux` 终端复用器
- 添加中文 locale 支持 (`zh_CN.UTF-8`)
- 添加中文字体:
  - `fonts-wqy-microhei`
  - `fonts-wqy-zenhei`
  - `fonts-noto-cjk`
- 配置环境变量:
  - `LANG=zh_CN.UTF-8`
  - `LC_ALL=zh_CN.UTF-8`

### 影响的文件

所有 4 个 Dockerfile 文件均已更新:

- `claudeCode-lsp/claude_x64/Dockerfile`
- `claudeCode-lsp/claude_arm64/Dockerfile`
- `claudeCode-none/claude_x64/Dockerfile`
- `claudeCode-none/claude_arm64/Dockerfile`
