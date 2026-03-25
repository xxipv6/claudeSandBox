# 更新日志

## 2026-03-25 (最新)

### 重大重构

#### v3.3.0 - 单/多 Agent 策略框架

**明确单 Agent 为默认模式，多 Agent 为战术扩展。**

这是一次架构澄清，明确"当前契约已经是单 Agent 的上限形态"，多 Agent 不是升级，而是在特定条件下的战术扩展。

**核心架构变化**：

1. **Single vs Multi-Agent Strategy（新增）**
   - **默认模式：单 Research Lead AI**
     - 适用条件：研究目标清晰、攻击面单一、能实时 review、失败成本可控、以深度为主
     - 核心：当前契约已把"多 Agent 的职责"内化成强纪律
   - **扩展模式：多 Agent（仅在需要对抗不确定性时）**
     - 用途：对抗认知视角冲突、研究路径分叉、角色冲突
     - 架构：Research Lead（唯一决策权）+ Specialist Agents（无决策权，只提供 Evidence）
   - **何时千万别用多 Agent**：
     - 还在探索问题本身
     - 研究节奏需要高度连贯
     - 在"思考"而不是"验证"
     - 希望完整掌控研究轨迹

2. **Decision Record 更新**
   - **新增字段**：Agent Strategy（Single / Multi）
   - **新增触发条件**：启用多 Agent 模式
   - **新增章节**：Multi-Agent Setup（如适用）

3. **Step Record 更新**
   - **新增字段**：Agent（Research Lead / Specialist）
   - **新增步骤类型**：多 Agent 模式下的证据整合
   - **新增规则**：Specialist Agent 的输出作为 Evidence，只有 Research Lead 能生成 Conclusion

4. **研究项目结构更新**
   - **新增**：`agents/` 目录（多 Agent 模式下的证据）
     - `agents/reverse/` - Reverse Analyst 输出
     - `agents/scout/` - Attack Surface Scout 输出
     - `agents/poc/` - PoC Engineer 输出
     - `agents/skeptic/` - Skeptic / Auditor 输出

5. **行为约束更新**
   - **新增**：多 Agent 模式下的额外约束
     - Specialist Agents 不能写 Decision Record
     - Specialist Agents 不能做最终结论
     - 只有 Research Lead 能整合证据并决策

6. **Decision Guide: Single vs Multi-Agent（新增）**
   - **评估清单**：研究目标清晰度、不确定性来源、失败成本、人类 Review 能力
   - **快速决策树**：帮助快速判断是否使用多 Agent
   - **默认原则**：当你不确定时，使用 Single Agent

7. **Contract Essence 更新**
   - **核心洞察**：
     > **单 Agent = 研究负责人**
     > **多 Agent = 不确定性放大器**
     >
     > **你现在这套 Contract，已经是"单 Agent 的上限形态"。**
     > **多 Agent 不是升级，而是在特定条件下的战术扩展。**

8. **Invariants 更新**
   - **新增**：默认单 Agent，多 Agent 仅用于对抗不确定性

**从 v3.2 到 v3.3 的核心变化**：

| 维度 | v3.2 | v3.3 |
|------|------|------|
| **默认模式** | 未明确 | **明确：单 Agent** |
| **多 Agent 定位** | 未提及 | **战术扩展，不是升级** |
| **不确定性处理** | 未定义 | **明确：多 Agent 用于对抗不确定性** |
| **Decision Record** | 无 Agent Strategy | **新增 Agent Strategy 字段** |
| **Step Record** | 无 Agent 字段 | **新增 Agent 字段** |
| **项目结构** | 无 agents/ | **新增 agents/ 目录** |
| **决策指南** | 无 | **新增评估清单和决策树** |

**核心洞察**：

> **当前契约（单 Research Lead AI）已经是"单 Agent 的上限形态"。**
>
> **它通过 Decision Record + Step Record 把"多 Agent 的职责"内化成强纪律。**
>
> **多 Agent 不是默认升级，而是在特定条件下的战术扩展。**
>
> **多 Agent 的价值：不是为了并行写代码，而是为了对抗不确定性。**

**何时使用多 Agent**：
- ✅ 认知视角冲突（协议逆向：状态机 vs 加密层）
- ✅ 研究路径分叉（多条合理路径，验证成本高）
- ✅ 角色冲突（既要逆向，又要 PoC，又要防御视角）

**何时千万别用多 Agent**：
- ❌ 还在探索问题本身
- ❌ 研究节奏需要高度连贯
- ❌ 在"思考"而不是"验证"
- ❌ 希望完整掌控研究轨迹

**不变量**：
- ✅ AI 拥有研究决策权
- ✅ 决策必须显式记录
- ✅ 每一步必须记录
- ✅ 人类拥有最终否决权
- ✅ 不存在"隐式研究行为"
- ✅ **默认单 Agent，多 Agent 仅用于对抗不确定性**（新增）

---

## 2026-03-25

### 重大重构

#### v3.2.0 - 研究负责人模式（Research Lead AI）

**从"决策型 AI"升级为"研究负责人 AI"，强调逐步研究记录与可回放轨迹。**

这是一次理念升级，从"拥有决策权"升级为"负全责的研究负责人"，核心是**逐步记录、可回放、不跳步骤**。

**核心架构变化**：

1. **角色定义升级**
   - **新增**：AI 是"研究负责人"，不是执行工具、不是被动分析器、不是等待指令的助手
   - **明确**：AI 对研究路径、技术路线、攻击面选择、验证方式负全责
   - **目标**：主导研究并产出可审计的研究结论

2. **执行环境权限（新增）**
   - **明确**：Docker 隔离容器 + root 权限
   - **授权**：可自由执行（无需确认）
     - 安装 / 卸载任意系统包与工具链
     - 修改系统配置与环境变量
     - 创建、删除、修改任意文件
     - 执行网络、调试、逆向工具（tcpdump / nmap / gdb / frida 等）
     - 编译、运行、调试任意代码
     - 执行高权限系统级操作

3. **Step-Level Research Logging（核心新增）**
   - **适用范围**：逆向工程、安全审计、攻击面探索、漏洞验证与 PoC 构建
   - **核心纪律**：每完成一个研究步骤，必须立即记录，然后才能继续
   - **研究步骤定义**：
     - 完成一次分析动作（函数定位、控制流还原）
     - 完成一次工具执行（trace / dump / fuzz）
     - 完成一次假设验证或证伪
     - 得出一个结论（存在 / 不存在）
     - 放弃一条研究路径
   - **Step Record 强制字段**：
     - Step ID, Decision ID, Action Taken
     - Input / Evidence, Observation, Conclusion
     - Next Step / Stop Reason
   - **三个禁止**：
     - 🚫 禁止事后补写
     - 🚫 禁止合并多个步骤
     - 🚫 禁止只记录"成功路径"

4. **研究项目结构重构**
   - **新增**：`notes/steps/` - 逐步研究记录（核心）
   - **保留**：`docs/decisions/` - 决策记录
   - **保留**：`docs/designs/` - 推演与假设
   - **删除**：`docs/plans/` - 执行计划（不再需要）

5. **行为约束（新增）**
   - ❌ 不等待指令
   - ❌ 不假设限制
   - ❌ 不跳步骤
   - ❌ 不隐藏失败
   - ❌ 不压缩研究轨迹
   - ✅ 记录优先于速度

6. **Git 纪律强化**
   - **要求**：每完成一个研究阶段或关键步骤必须 commit
   - **格式**：Commit message 必须包含 Decision ID、Step ID、简要结论

7. **契约不变量更新**
   - v3.1：AI 拥有研究决策权，决策必须显式记录，人类拥有最终否决权
   - v3.2：AI 拥有研究决策权，决策必须显式记录，**每一步必须记录**，人类拥有最终否决权

8. **Contract Essence（新增）**
   > **逆向与审计不是连续操作，**
   > **而是一条可以被完整回放的研究轨迹。**

**从 v3.1 到 v3.2 的核心变化**：

| 维度 | v3.1 | v3.2 |
|------|------|------|
| **角色定位** | 决策型 AI | 研究负责人 AI |
| **核心要求** | 决策记录 | 逐步记录 |
| **记录粒度** | 决策级别 | 步骤级别 |
| **项目结构** | docs/decisions/ | notes/steps/（新增） |
| **行为约束** | 无明确约束 | 6 条明确约束 |
| **Git 纪律** | 每阶段 commit | 每步骤 commit |
| **研究轨迹** | 决策链 | 完整可回放 |

**新增模板**：
- Decision Record Template
- Step Record Template

**不变量**：
- ✅ AI 拥有研究决策权
- ✅ 决策必须显式记录
- ✅ **每一步必须记录**（新增）
- ✅ 人类拥有最终否决权
- ✅ **不存在"隐式研究行为"**（强化）

---

## 2026-03-25

### 重大重构

#### v3.1.0 - 决策权授权模型

**从"执行型 AI"升级为"决策型 AI"**。

这是一次重大理念升级，从"AI 只能执行被批准的研究路径"升级为"AI 拥有研究决策权，人类保留否决权"。

**核心架构变化**：

1. **研究决策权模型（Authority Model）**
   - **新增**：决策权分层（战略层 / 战术层 / 技术层 / 执行层 / 否决权）
   - **授权**：AI 拥有战术层（研究路径 / 攻击面 / 方法）决策权
   - **授权**：AI 拥有技术层（工具 / 技术细节 / PoC）决策权
   - **保留**：人类保留战略层（是否研究 / 研究目标）和否决权

2. **Research Decision Mode（研究决策模式）**
   - **新增**：Decision Record（决策记录）强制输出
   - **包含**：Research Objective, Candidate Attack Surfaces, Assumptions, Chosen Path, Rejected Paths, Risk Assessment, Evidence Plan
   - **关键**：这是"决策日志"，不是请求批准

3. **Human Oversight Gate（人类监督门）**
   - **新增**：人类否决权（❌ 否决 / 🔁 重新决策 / 🔍 补充证据 / ⏸ 暂停）
   - **简化**：无明确否决 = AI 可继续执行
   - **删除**：逐步批准要求

4. **研究项目结构重构**
   - **新增**：`docs/decisions/` - 决策记录（核心）
   - **保留**：`docs/designs/` - 设计推演
   - **降级**：`docs/plans/` - 执行计划（可选）

5. **审计与可追溯**
   - **新增**：decision id 与 PoC/exploit 关联
   - **新增**：Git commit 引用 decision
   - **要求**：每次研究方向变化必须新增 decision record

6. **契约不变量更新**
   - v3：AI 只能执行被批准的研究路径，永远不拥有研究决策权
   - v4：AI 拥有研究决策权，决策必须显式记录，人类拥有最终否决权

**从 v3 到 v4 的核心变化**：

| 维度 | v3 | v4 |
|------|----|----|
| **决策权** | AI 无决策权 | AI 拥有战术/技术层决策权 |
| **决策记录** | 无 | 强制 Decision Record |
| **人类角色** | 逐步批准 | 监督 + 否决 |
| **执行方式** | 先批准后执行 | 先记录后执行，可否决 |
| **核心理念** | 执行型 AI | 决策型 AI |

**不变量**：
- ✅ AI 拥有研究决策权（新增）
- ✅ 决策必须显式记录
- ✅ 人类拥有最终否决权
- ✅ 不存在"隐式自由发挥"

---

## 2026-03-25

### 重大重构

#### v3.0.0 - 研究导向架构

**完全剥离开发内容，专注安全研究主线**。

这是一次架构级的重构，将项目从"通用开发 + 安全研究"重构为"纯安全研究"专用环境。

**核心架构变化**：

1. **统一研究协作契约（CLAUDE.md v3）**
   - **重构**：完全重写 CLAUDE.md，专注安全研究流程
   - **新增**：研究任务判定系统（高/中低/简单三级）
   - **新增**：研究设计探索门（Research Design Gate）
   - **新增**：四条研究执行路径（Path A/B/C/D）
   - **新增**：Research Planner 契约（强制输出字段）
   - **新增**：研究项目结构（xxx-research/）
   - **删除**：所有开发相关流程和规则

2. **删除智能体系统**
   - **删除**：8 个智能体定义文件（.md）
     - system-architect.md
     - planner.md
     - dev.md
     - reviewer.md
     - ops.md
     - doc-updater.md
     - tdd-guide.md
     - research.md
   - **删除**：8 个智能体记忆目录（agent-memory/）
   - **删除**：rules/agents.md（智能体编排规则）
   - **原因**：简化架构，专注研究流程

3. **技能库精简**
   - **保留**：安全研究核心技能
     - brainstorming - 高复杂度研究设计探索
     - security/web-whitebox-audit - Web 白盒审计
     - security/iot-audit - IoT 安全审计
     - security/vuln-patterns - 漏洞模式
     - security/poc-exploit - PoC 开发
     - debugging - 调试方法论
     - code-review - 代码审查（安全视角）
   - **删除**：开发相关技能
     - frontend-patterns
     - backend-patterns
     - auto-fix-monitor

4. **命令系统精简**
   - **删除**：开发相关命令
     - /tdd（测试驱动开发）
   - **保留**：研究相关命令
     - /debug（调试）
     - /test（测试验证）
     - /deploy（部署验证环境）

5. **项目结构重构**
   - **旧结构**（xxx-project/）：
     - docs/plans/ - 执行计划
     - docs/specs/ - 设计规格
     - src/ - 源代码
     - tests/ - 测试
   - **新结构**（xxx-research/）：
     - docs/plans/ - 研究计划
     - docs/designs/ - 研究设计
     - artifacts/ - 样本/dump/pcap/core
     - poc/ - PoC/exploit/scripts
     - notes/ - 逆向笔记/分析记录
     - data/ - 日志/流量/中间数据

6. **文档更新**
   - **重写**：README.md - 专注安全研究场景
   - **重写**：CLAUDE.md - 统一研究协作契约 v3
   - **待更新**：MAINTENANCE.md - 反映新架构

**专注场景**：
- ✅ 安全研究 - 漏洞分析、安全审计、威胁建模
- ✅ 逆向工程 - 二进制分析、协议逆向、恶意软件分析
- ✅ PoC 开发 - 漏洞验证、利用开发、攻击链构建
- ✅ 取证分析 - 日志分析、流量分析、证据提取
- ❌ ~~安全开发~~ - 已删除
- ❌ ~~日常开发~~ - 已删除

**研究流程**：
1. 任务判定（高/中低/简单）
2. 研究设计探索（高复杂度任务，可选）
3. 研究规划（Research Planner）
4. 执行研究
5. 证据记录与 Git 审计

**契约不变量**：
> AI 只能执行被批准的研究路径，永远不拥有研究决策权。

---

## 2026-03-17

### 优化和修复

#### planner.md 优化
- **精简结构**：从 520 行减少到 336 行（-35%）
- **新增并发字段**：在输出格式中添加 `🔗 并发任务` 字段，使用 T1|T2 标注可并发任务
- **新增技能使用**：添加 `🛠️ 技能使用` 部分，列出每个步骤需要的 skill
- **添加实际案例**：完整的用户认证系统规划示例
- **优化引用关系**：所有规则改为引用 CLAUDE.md 作为单一真相源
- **添加非穷尽声明**：技能清单明确说明"非穷尽"，可使用其他已注册的 skill

#### auto-fix-monitor skill 创建和优化
- **创建**：开发环境日志监控和自动修复 skill
- **纯 prompt 设计**：利用现有日志系统，不需要自定义脚本
- **后台监控**：使用 `tail -f` 持续监控日志，实时推送
- **自动修复触发**：检测到错误立即调用对应 agent（debugging/dev/research）
- **持续运行**：修复后不停止，直到人工停止
- **主动触发**：添加"应主动（PROACTIVELY）使用"声明

#### 持久化记忆系统
- **新增**：`agent-memory/` 目录结构，为每个 agent 提供持久化记忆空间
- **新增**：每个 agent 的 MEMORY.md 文件，包含记忆管理指南
- **新增**：在每个 agent 定义文件（.md）中添加 `Persistent Agent Memory` 部分
- **支持**：跨会话学习、模式记录、问题追踪

#### 文档完善
- **新增**：MAINTENANCE.md - 完整的维护手册
  - 提示词关联关系图
  - 维护流程和检查清单
  - 常见陷阱和解决方案
  - 快速参考和常用命令
- **更新**：CLAUDE.md - 保持为单一真相源
- **优化**：agents.md - 解耦重复定义，改为引用 CLAUDE.md

#### Dockerfile 修复
- **修复**：删除不存在的 `ArvinENV/mode` 文件引用
- **影响**：所有 4 个 Dockerfile 已更新

---

## 2026-03-16

### 重大更新

#### v2.2.0 - 智能体驱动架构

从命令驱动（v2.1.0）重构为智能体驱动架构，实现智能体主动触发、职责边界清晰化、模型选择优化。

**核心架构变化**：

1. **智能体驱动系统**
   - **新增**：8 个专业智能体（system-architect, planner, research, dev, reviewer, ops, doc-updater, tdd-guide）
   - **新增**：主动触发机制 - "应主动（PROACTIVELY）使用"
   - **优化**：职责边界清晰化
     - research：负责安全问题（SQL 注入、XSS、权限绕过等）
     - reviewer：负责逻辑正确性、架构边界、命名风格、可维护性（不含安全）
   - **新增**：模型选择策略
     - haiku：文档任务（doc-updater）- 成本优化
     - sonnet：大部分智能体 - 平衡性能与成本

2. **技能库扩展**
   - **新增**：`auto-fix-monitor` skill - 开发环境日志监控和自动修复
   - **新增**：`brainstorming` skill - 高复杂度任务的设计探索
   - **新增**：`frontend-patterns` skill - React/Next.js 前端开发模式
   - **新增**：`backend-patterns` skill - 后端开发模式（API 设计、数据库、缓存等）
   - **新增**：`code-review` skill - 代码审查方法论
   - **新增**：`debugging` skill - 系统化调试方法论
   - **保留**：`security/web-whitebox-audit`（8 阶段）、`security/iot-audit`（自动识别）
   - **保留**：`security/vuln-patterns` - OWASP Top 10 漏洞模式
   - **保留**：`security/poc-exploit` - PoC 开发和漏洞利用

3. **命令系统优化**
   - **新增**：`/debug` - 系统化调试
   - **新增**：`/deploy` - 部署和运维
   - **新增**：`/learn` - 从会话中提取模式并保存为技能
   - **新增**：`/learn-eval` - 评估已学习的模式质量
   - **新增**：`/tdd` - 测试驱动开发工作流（RED → GREEN → REFACTOR）
   - **新增**：`/test` - 测试命令

4. **规则系统完善**
   - **新增**：`rules/agents.md` - 智能体编排规则、职责边界、协作模式
   - **新增**：`rules/security.md` - 安全编码规范（输入验证、输出编码、认证授权、加密等）
   - **新增**：`rules/git-workflow.md` - Git 工作流（提交格式、PR 流程、分支管理）
   - **新增**：语言特定编码规范
     - `rules/python/coding-style.md` - PEP 8、类型注解、安全要求
     - `rules/javascript/coding-style.md` - TypeScript、React、安全要求
     - `rules/go/coding-style.md` - 命名、错误处理、并发安全
     - `rules/java/coding-style.md` - Spring、异常处理、依赖注入

5. **持久化记忆系统**
   - **新增**：`agent-memory/` 目录结构，为每个 agent 提供持久化记忆空间
   - **新增**：每个 agent 的 MEMORY.md 文件，包含记忆管理指南
   - **新增**：在每个 agent 定义文件（.md）中添加 `Persistent Agent Memory` 部分

6. **智能体协作模式**
   - **规划 → TDD → 审查流程**：planner → tdd-guide → dev → reviewer → doc-updater
   - **研究分离流程**：research（安全审计）+ reviewer（质量审查）→ 并行
   - **架构驱动流程**：system-architect → planner → tdd-guide → dev → reviewer

7. **维护文档**
   - **新增**：MAINTENANCE.md - 完整的维护手册
     - 提示词关联关系图
     - 维护流程和检查清单
     - 常见陷阱和解决方案
     - 快速参考和常用命令

**文件结构变化**：

```
workspace/.claude/
├── CLAUDE.md                    # 主配置（统一协作契约）
├── commands/                    # 命令定义（6 个）
│   ├── debug.md                # 系统化调试
│   ├── deploy.md               # 部署和运维
│   ├── learn.md                # 提取模式保存为技能
│   ├── learn-eval.md           # 评估学习模式质量
│   ├── tdd.md                  # 测试驱动开发
│   └── test.md                 # 测试命令
├── skills/                      # 技能库（10 个）
│   ├── auto-fix-monitor/       # 日志监控和自动修复
│   ├── brainstorming/          # 设计探索
│   ├── backend-patterns/       # 后端开发模式
│   ├── code-review/            # 代码审查
│   ├── debugging/              # 调试方法论
│   ├── frontend-patterns/      # 前端开发模式
│   └── security/
│       ├── web-whitebox-audit/ # Web 白盒审计（8 阶段）
│       ├── iot-audit/          # IoT 审计（自动识别）
│       ├── vuln-patterns/      # OWASP Top 10 漏洞模式
│       └── poc-exploit/        # PoC 开发和漏洞利用
├── agents/                      # 智能体定义（8 个）
│   ├── system-architect.md     # 系统架构设计
│   ├── planner.md              # 任务规划
│   ├── research.md             # 安全研究
│   ├── dev.md                  # 日常开发
│   ├── reviewer.md             # 代码质量审查
│   ├── ops.md                  # 运维自动化
│   ├── doc-updater.md          # 文档维护
│   └── tdd-guide.md            # 测试驱动开发
├── agent-memory/               # Agent 持久记忆（对应 8 个智能体）
│   ├── dev/
│   ├── doc-updater/
│   ├── ops/
│   ├── planner/
│   ├── research/
│   ├── reviewer/
│   ├── system-architect/
│   └── tdd-guide/
└── rules/                      # 强制规则
    ├── agents.md               # 智能体编排规则
    ├── security.md             # 安全编码规范
    ├── git-workflow.md         # Git 工作流
    ├── python/
    │   └── coding-style.md
    ├── javascript/
    │   └── coding-style.md
    ├── go/
    │   └── coding-style.md
    └── java/
        └── coding-style.md
```

**核心原则**：

1. **智能体优先**：专业智能体负责特定领域，主动触发
2. **职责清晰**：每个智能体有明确的职责边界，避免重叠
3. **渐进式披露**：技能和规则按需加载，节省上下文
4. **模型优化**：根据任务复杂度选择合适的模型

**适用场景**：

- ✅ 安全研究（漏洞分析、PoC 开发、渗透测试）
- ✅ 安全开发（安全编码、威胁建模、代码审查）
- ✅ 日常开发（调试、测试、重构）

**适用版本**：

- `claudeCode-none/claude_arm64` ✅
- `claudeCode-none/claude_x64` ✅
- `claudeCode-lsp/claude_arm64` ✅
- `claudeCode-lsp/claude_x64` ✅

---

#### v2.1.0 - 命令驱动架构

从模式驱动（v2.0.0）重构为命令驱动架构，简化使用流程，专注安全场景。

**核心架构变化**：

1. **命令驱动系统**
   - **移除**：双模式系统（标准模式/完整模式）
   - **移除**：6 阶段流程系统
   - **移除**：状态管理系统（task_states、task_logs、task_plans、subtask_queues、task_reports）
   - **移除**：Git 分支管理
   - **移除**：质量门禁
   - **新增**：5 个核心命令
   - **新增**：技能库（按需加载）
   - **新增**：强制规划要求

2. **核心命令**
   - `/security-audit` - 安全审计（Web 白盒 + IoT）
   - `/code-review` - 代码审查（前后端）
   - `/debug` - 调试问题
   - `/test` - 功能测试
   - `/e2e` - 全部测试（前端 + 后端，并发）

3. **技能库**
   - `security/whitebox-audit` - Web 白盒安全审计（8 阶段流程）
   - `security/iot-audit` - IoT 安全审计（自动识别固件/源码/混合）
   - `development/debugging` - 调试方法论
   - `development/code-review` - 代码审查清单
   - `development/tdd-workflow` - TDD 工作流
   - `testing/e2e-testing` - E2E 测试
   - `analysis/domains` - 10 个分析维度

4. **Agents ↔ Skills 对齐**
   - `security-tester` → `whitebox-audit` + `iot-audit` skills
   - `backend-engineer` → `code-review` skill（后端）
   - `frontend-engineer` → `code-review` skill（前端）
   - `dev-coder` → `tdd-workflow` skill
   - `task-planner` → 无独立 skill
   - `product-manager` → 无独立 skill

5. **强制规划要求**
   - 所有任务都必须先规划
   - 规划完成后必须等待用户确认
   - 规划未确认不得执行任何操作

6. **删除的功能**
   - ❌ `secure-coding` skill（合并到 `rules/security.md`）
   - ❌ `vuln-patterns` skill（被 `whitebox-audit` 覆盖）
   - ❌ `binary-reverse` skill（用户不需要）
   - ❌ `/secure-review` 命令（功能重复）
   - ❌ `/vuln-scan` 命令（功能重复）
   - ❌ `/full` 和 `/quick` 命令（与命令驱动架构冲突）

**文件结构变化**：

```
workspace/
├── CLAUDE.md                    # 主配置（简化，< 200 行）
├── .claude/
│   ├── commands/                # 命令定义（新增）
│   │   ├── security-audit.md
│   │   ├── code-review.md
│   │   ├── debug.md
│   │   ├── test.md
│   │   └── e2e.md
│   ├── skills/                  # 技能库（新增）
│   │   ├── security/
│   │   │   ├── whitebox-audit/
│   │   │   └── iot-audit/
│   │   ├── development/
│   │   │   ├── debugging/
│   │   │   ├── code-review/
│   │   │   └── tdd-workflow/
│   │   ├── testing/
│   │   │   └── e2e-testing/
│   │   └── analysis/
│   │       └── domains/
│   ├── agents/                 # Agent 定义（保持不变）
│   ├── agent-memory/           # Agent 持久记忆（保持不变）
│   └── rules/                  # 强制规则（保持不变）
```

**核心原则**：

1. **规划优先**：所有任务都必须先规划，再执行
2. **简洁直观**：直接使用命令，无需模式选择
3. **按需加载**：Skills 按需加载，节省上下文
4. **专注安全**：所有命令针对安全场景优化

**适用场景**：

- ✅ 安全研究（漏洞分析、PoC 开发、渗透测试）
- ✅ 安全开发（安全编码、威胁建模、代码审查）
- ✅ 日常开发（调试、测试、重构）

**适用版本**：

- `claudeCode-none/claude_arm64` ✅
- `claudeCode-none/claude_x64` ✅
- `claudeCode-lsp/claude_arm64` ✅
- `claudeCode-lsp/claude_x64` ✅

---

### 优化改进

#### 移除快速模式（Quick Mode）

简化模式架构，移除快速模式（Quick Mode），保留标准模式和完整模式。

**核心变化**：

1. **模式架构调整**
   - **移除**：快速模式（Quick Mode）
   - **保留**：标准模式（默认）、完整模式
   - **简化**：模式判断逻辑，减少模式切换开销

2. **CLAUDE.md 更新**
   - 删除快速模式判断逻辑
   - 删除快速模式执行步骤
   - 简化模式选择流程
   - 标准模式成为默认模式

3. **文件清理**
   - 删除 `workflow/quick-mode.md` 文件
   - 更新知识库使用规则
   - 简化模式执行流程

4. **模式触发条件**
   - **标准模式（默认）**：多文件操作、需要分析/理解代码、任何不确定的情况
   - **完整模式**：架构级任务 + 用户明确说"完整分析" + 环境变量 `CLAUDE_FULL_MODE=1`

**影响范围**：

- ✅ 所有 4 个版本（none/lsp × arm64/x64）
- ✅ CLAUDE.md 主配置文件
- ✅ workflow/ 目录配置文件
- ✅ 模式判断和执行逻辑

**向后兼容性**：

- 原先快速模式的任务将自动升级到标准模式
- 标准模式能够处理快速模式的所有场景
- 不影响现有功能和流程

---

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
