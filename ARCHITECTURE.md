# 多 Agent 团队架构流程图（v1.1.0）

## 完整调度流程

```mermaid
flowchart TD
    Start([用户输入]) --> Intent{意图识别}

    %% 意图识别判断
    Intent -->|明确跳过 + 极简任务| CodingMode
    Intent -->|其他所有情况（默认）| AnalysisMode

    %% Coding Mode
    subgraph CodingMode["🟢 Coding Mode（执行模式）"]
        Direction1[轻量分析 30秒]
        Direction1 --> Scan[快速扫描]
        Scan --> Understand[需求理解]
        Understand --> Locate[问题定位]
        Locate --> Select[选择 Coder]
        Select --> ExecLayer
    end

    %% 执行层
    subgraph ExecLayer["⚡ 执行层"]
        DevCoder[dev-coder<br/>前端/后端/全栈/API]
        ScriptCoder[script-coder<br/>PoC/Exploit/Fuzzer]
    end

    %% Analysis Mode
    subgraph AnalysisMode["🔵 Analysis Mode（默认）"]
        Complexity{任务复杂度判断}

        Complexity -->|简单任务<br/>单一问题/明确边界| Simple[3 个 Agent]
        Complexity -->|标准任务<br/>多问题/需设计| Standard[5 个 Agent]
        Complexity -->|深度任务<br/>复杂系统/高风险| Deep[6 个 Agent]

        Simple --> ScheduleSimple
        Standard --> ScheduleStandard
        Deep --> ScheduleDeep
    end

    %% 分析层调度
    subgraph ScheduleSimple["简单任务调度：3 个 Agent"]
        TP1[task-planner<br/>任务拆解]
        Expert[核心专家<br/>2个<br/>根据任务类型]
    end

    subgraph ScheduleStandard["标准任务调度：5 个 Agent"]
        TP2[task-planner<br/>任务拆解]
        PM[product-manager<br/>需求分析]
        BE[backend-engineer<br/>架构分析]
        MultiExpert[专家<br/>2个<br/>根据任务类型]
    end

    subgraph ScheduleDeep["深度任务调度：6 个 Agent"]
        TP3[task-planner<br/>任务拆解]
        PM2[product-manager<br/>需求分析]
        BE2[backend-engineer<br/>架构分析]
        FE[frontend-engineer<br/>输入面分析]
        QE[qa-engineer<br/>边界分析]
        ST[security-tester<br/>安全分析]
    end

    %% 分析层并行执行
    ScheduleSimple --> Parallel1[⚡ 同时启动]
    ScheduleStandard --> Parallel2[⚡ 同时启动]
    ScheduleDeep --> Parallel3[⚡ 同时启动]

    %% 合并结果
    Parallel1 --> Merge{收集 & 合并}
    Parallel2 --> Merge
    Parallel3 --> Merge

    Merge --> ResearchLedger[📋 Research Ledger]
    ResearchLedger --> ActionDecision[下一步建议 1-3选项]

    ActionDecision --> CodingMode2[→ Coding Mode]
    ActionDecision --> End([等待用户])

    CodingMode --> CodeOutput[💻 代码输出]
    CodeOutput --> Loop{迭代循环}

    Loop -->|有问题| Fix[修复问题]
    Loop -->|优化| Optimize[优化建议]
    Loop -->|完成| End

    Fix --> CodeOutput
    DevCoder --> CodeOutput
    ScriptCoder --> CodeOutput

    %% 支持层（按需调用）
    CodingMode -.->|按需| SupportLayer
    AnalysisMode -.->|按需| SupportLayer

    subgraph SupportLayer["🔧 支持层"]
        OpsEngineer[ops-engineer<br/>环境配置/工具安装]
    end

    style CodingMode fill:#e8f5e8
    style AnalysisMode fill:#e3f2fd
    style ExecLayer fill:#fff3e0
    style SupportLayer fill:#fce4ec
    style ResearchLedger fill:#f3e5f5
    style Parallel1 fill:#fff9c4
    style Parallel2 fill:#fff9c4
    style Parallel3 fill:#fff9c4
```

---

## 分级调度详解

```mermaid
flowchart LR
    Input[任务输入] --> Check{复杂度判断}

    Check -->|单一问题<br/>明确边界| SimpleLevel[🟢 简单任务]
    Check -->|多个问题<br/>需要设计| StandardLevel[🟡 标准任务]
    Check -->|复杂系统<br/>高风险| DeepLevel[🔴 深度任务]

    subgraph SimpleAgents["简单任务：3 个 Agent"]
        S1[task-planner<br/>任务拆解]
        S2[核心专家 ×2<br/>例: security-tester<br/>+ qa-engineer]
    end

    subgraph StandardAgents["标准任务：5 个 Agent"]
        ST1[task-planner<br/>任务拆解]
        ST2[product-manager<br/>需求分析]
        ST3[backend-engineer<br/>架构分析]
        ST4[专家 ×2<br/>例: frontend-engineer<br/>+ security-tester]
    end

    subgraph DeepAgents["深度任务：6 个 Agent"]
        D1[task-planner<br/>任务拆解]
        D2[product-manager<br/>需求分析]
        D3[backend-engineer<br/>架构分析]
        D4[frontend-engineer<br/>输入面分析]
        D5[qa-engineer<br/>边界分析]
        D6[security-tester<br/>安全分析]
    end

    SimpleLevel --> SimpleAgents
    StandardLevel --> StandardAgents
    DeepLevel --> DeepAgents

    SimpleAgents --> Output[同时启动 → 合并结果]
    StandardAgents --> Output
    DeepAgents --> Output

    style SimpleLevel fill:#e8f5e8
    style StandardLevel fill:#fff9c4
    style DeepLevel fill:#ffcdd2
```

**分级判断标准**：

| 等级 | Agent 数量 | 组成 | 适用场景 |
|------|-----------|------|---------|
| **简单任务** | 3 个 | task-planner + 2个核心专家 | 单一问题、边界明确 |
| **标准任务** | 5 个 | task-planner + product-manager + backend-engineer + 2个专家 | 多个问题、需要设计 |
| **深度任务** | 6 个 | 全部分析层 agents | 复杂系统、高风险 |

---

## 意图识别决策树

```mermaid
flowchart TD
    Start([用户输入]) --> Q1{任务复杂度?}

    Q1 -->|多模块<br/>需要设计<br/>有风险| Analysis
    Q1 -->|单一功能<br/>< 50行| Q2{需求明确?}

    Q2 -->|模糊<br/>需要澄清| Analysis
    Q2 -->|完全明确| Q3{用户说"直接写"?}

    Q3 -->|是| Q4{用户说"别分析"?}
    Q3 -->|否| Analysis

    Q4 -->|是| Coding
    Q4 -->|否| Analysis

    subgraph Analysis["🔵 Analysis Mode"]
        A1[同时启动分析层 agents]
        A2[输出 Research Ledger]
        A3[提供行动决策选项]
    end

    subgraph Coding["🟢 Coding Mode"]
        C1[轻量分析 30秒]
        C2[调用执行层 coder]
        C3[输出代码]
    end

    Analysis --> Next([等待用户选择])
    Coding --> Loop([迭代优化])

    style Analysis fill:#e3f2fd
    style Coding fill:#e8f5e8
```

**进入 Coding Mode 的条件**（必须**全部满足）：
1. ✅ 用户明确说："直接写"、"快速实现"、"简单实现"
2. ✅ 任务极其简单：< 50 行代码，单一功能
3. ✅ 用户明确跳过分析："不用分析了"、"别分析"

**典型示例**：
- ✅ "直接写个 hello world" → **Coding Mode**
- ✅ "不用分析了，直接写个简单脚本" → **Coding Mode**
- ❌ "写个用户系统" → **Analysis Mode**（复杂）
- ❌ "做个扫描器" → **Analysis Mode**（需求不明确）
- ❌ "这个代码有问题吗" → **Analysis Mode**（需要分析）

---

## Agent 架构总览

```mermaid
graph TB
    subgraph Orchestrator["🎯 Orchestrator 编排器"]
        Direction[意图识别]
        Schedule[分级调度]
        Merge[合并冲突]
        Decision[行动决策]
    end

    subgraph Analysis["🔵 分析层 - 6 个 Agents"]
        TP[task-planner<br/>📋 任务拆解]
        PM[product-manager<br/>📊 需求分析]
        BE[backend-engineer<br/>🔧 架构分析]
        FE[frontend-engineer<br/>🎨 输入面分析]
        QE[qa-engineer<br/>🧪 边界分析]
        ST[security-tester<br/>🛡️ 安全分析]
    end

    subgraph Execution["⚡ 执行层 - 2 个 Coder Agents"]
        DC[dev-coder<br/>💻 全栈开发]
        SC[script-coder<br/>🔓 安全脚本]
    end

    subgraph Support["🔧 支持层 - 1 个 Agent"]
        OE[ops-engineer<br/>⚙️ 环境配置]
    end

    Orchestrator -->|同时启动| Analysis
    Orchestrator -->|执行调用| Execution
    Orchestrator -.->|按需调用| Support

    Analysis -->|合并结果| Orchestrator

    style Orchestrator fill:#f3e5f5
    style Analysis fill:#e3f2fd
    style Execution fill:#fff3e0
    style Support fill:#fce4ec
```

**Agent 职责详解**：

**分析层（6 个）**：
- `task-planner`：任务拆解、优先级排序、依赖识别、资源规划
- `product-manager`：需求与业务目标分析
- `backend-engineer`：系统结构与状态机分析
- `frontend-engineer`：输入面与攻击面分析
- `qa-engineer`：失败路径与边界场景分析
- `security-tester`：攻击路径与漏洞分析

**执行层（2 个）**：
- `dev-coder`：所有代码开发（前端、后端、全栈、API、组件、数据库）
- `script-coder`：安全脚本（PoC、Exploit、Fuzzer、扫描工具）

**支持层（1 个）**：
- `ops-engineer`：环境配置、工具安装、系统调试、依赖管理

---

## Research Ledger 输出结构

```mermaid
graph TD
    subgraph Ledger["📋 Research Ledger"]
        Goal[Goal<br/>研究目标]
        SM[System Model<br/>系统模型<br/>≥2 个 subagent]
        VF[Verified Facts<br/>已验证事实<br/>带证据]
        AH[Active Hypotheses<br/>活跃假设<br/>不同视角]
        RH[Rejected Hypotheses<br/>已否定假设<br/>含失败路径]
        KD[Key Decisions<br/>关键决策]
        Art[Artifacts<br/>产物<br/>流程图/状态机]
        OQ[Open Questions<br/>未解决问题]
        NA[Next Actions<br/>下一步行动 ≤3项]
    end

    VF --> Evidence{证据有效性}
    Evidence -->|✅ 有效| Valid[代码引用/日志<br/>测试结果/文档]
    Evidence -->|❌ 无效| Invalid[主观判断/推测<br/>缺少来源]

    style Ledger fill:#f3e5f5
    style Evidence fill:#fff9c4
```

**字段说明**：

| 字段 | 说明 | 来源 |
|------|------|------|
| **Goal** | 研究目标 | 用户输入 |
| **System Model** | 系统模型 | 来自 ≥2 个 subagent |
| **Verified Facts** | 已验证的事实 | 仅接受带证据输出 |
| **Active Hypotheses** | 活跃假设 | 来自不同视角 subagent |
| **Rejected Hypotheses** | 已否定的假设 | 必须包含失败路径 |
| **Key Decisions** | 关键决策 | 合并后的决策 |
| **Artifacts** | 产物 | 流程图、状态机等 |
| **Open Questions** | 未解决问题 | 待澄清的问题 |
| **Next Actions** | 下一步行动 | ≤3 项 |

**证据有效性标准**：

| 类型 | 示例 | 有效性 |
|------|------|--------|
| **✅ 有效证据** | 代码引用（文件:行号）、日志输出、测试结果、文档引用 | 可接受为 Verified Facts |
| **❌ 无效证据** | 主观判断（"我认为"）、无根据推测、缺少来源的陈述 | 放入 Active Hypotheses |

---

## 轻量分析流程（Coding Mode）

```mermaid
flowchart LR
    Start([用户需求]) --> Step1[📖 快速扫描<br/>10秒]
    Step1 --> Step2[🎯 需求理解<br/>5秒]
    Step2 --> Step3[🔍 问题定位<br/>10秒]
    Step3 --> Step4[⚙️ 选择 Coder<br/>5秒]
    Step4 --> Step5[🚀 调用执行]

    Step4 -->|前端/后端/全栈| DevCoder[dev-coder]
    Step4 -->|安全脚本| ScriptCoder[script-coder]

    DevCoder --> Output([代码输出])
    ScriptCoder --> Output

    Output --> Validate{验证}
    Validate -->|通过| End([完成])
    Validate -->|问题| Fix[修复 → 输出完整文件]
    Fix --> Output

    style Step1 fill:#e8f5e8
    style Step2 fill:#e8f5e8
    style Step3 fill:#e8f5e8
    style Step4 fill:#fff9c4
    style Step5 fill:#fff9c4
```

**轻量分析步骤**（30 秒内完成）：

1. **快速扫描**（10 秒）：读取用户提到的文件/代码，快速浏览上下文
2. **需求理解**（5 秒）：明确用户要做什么（修复 bug、添加功能、写新代码）
3. **问题定位**（10 秒）：找到问题行/位置，或确定新代码应该插入的位置
4. **选择 Coder**（5 秒）：根据任务类型选择 dev-coder 或 script-coder
5. **启动执行**：立即启动相应 coder，附带上下文信息

**轻量分析场景**：
- 用户指出 bug：→ 读取文件 → 定位 bug → 启动 coder 修复
- 用户要新功能：→ 理解现有代码 → 启动 coder 添加
- 用户要 PoC：→ 理解目标 → 启动 script-coder

---

## 数据流向

```mermaid
flowchart LR
    User[用户输入] --> Orchestrator[Orchestrator]

    Orchestrator -->|Analysis Mode| AnalysisAgents[分析层 Agents]
    Orchestrator -->|Coding Mode| ExecutionAgents[执行层 Agents]
    Orchestrator -.->|环境问题| SupportAgent[支持层 Agent]

    AnalysisAgents -->|并行输出| Merge[合并冲突解析]
    Merge --> Ledger[Research Ledger]
    Ledger --> Action[行动决策选项]

    ExecutionAgents --> Code[代码输出]
    Code --> Iterate[迭代优化]

    Action -->|选择执行| ExecutionAgents
    Action -.->|等待| User

    Iterate -->|优化建议| User
    Iterate -->|完成| End([结束])

    SupportAgent --> Orchestrator

    style Orchestrator fill:#f3e5f5
    style AnalysisAgents fill:#e3f2fd
    style ExecutionAgents fill:#fff3e0
    style SupportAgent fill:#fce4ec
```

---

## 行动决策（Analysis Mode 完成后）

Analysis Mode 完成后，必须给出明确的下一步建议（1-3 个可执行选项）：

### 行动决策模板

```markdown
## 分析完成 - 下一步建议

根据分析结果，我建议以下下一步行动：

**选项 1**：[具体行动]
- 描述：[详细说明]
- 需要的 Agent：[agent 名称]
- 预计时间：[估算]

**选项 2**：[具体行动]
- 描述：[详细说明]
- 需要的 Agent：[agent 名称]
- 预计时间：[估算]

**选项 3**：[具体行动]
- 描述：[详细说明]
- 需要的 Agent：[agent 名称]
- 预计时间：[估算]

**跳过**：暂不执行，等待进一步指示

**请选择**：[1] [2] [3] [跳过] [自定义]
```

### 典型行动决策场景

**场景 1：发现漏洞**
```
选项 1：编写 SQL 注入 PoC（script-coder，15分钟）
选项 2：编写修复建议文档（dev-coder，10分钟）
选项 3：深入分析漏洞影响范围（security-tester，10分钟）
```

**场景 2：架构评审完成**
```
选项 1：实现状态恢复机制（dev-coder，30分钟）
选项 2：完善权限判断逻辑（dev-coder，20分钟）
选项 3：编写架构文档（dev-coder，15分钟）
```

**场景 3：任务拆解完成**
```
选项 1：开始执行子任务 T1（同时启动相关 agent）
选项 2：调整任务优先级（重新启动 task-planner）
选项 3：等待用户确认（暂不执行）
```

**场景 4：分析完成但无明确行动**
```
选项 1：输出分析报告（Markdown 格式）
选项 2：继续深入分析 [某个方面]
选项 3：等待用户指示
```

---

## 迭代循环（Coding Mode 完成后）

Coding Mode 完成代码输出后，进入迭代循环：

### 1. 代码验证

**自动检查项**：
- ✅ 语法正确性
- ✅ 逻辑完整性
- ✅ 错误处理覆盖
- ✅ 边界条件处理

**验证方式**：
- 静态分析：检查代码逻辑
- 动态验证：如果可以，建议运行验证
- 边界测试：测试输入边界情况

### 2. 问题识别

如果发现问题，进入修复循环：
- **语法错误**：直接修复
- **逻辑错误**：分析并修复
- **边界问题**：补充处理

### 3. 优化建议

代码可用后，给出优化建议（如果有）：
- **性能优化**：性能瓶颈、优化方向
- **安全优化**：安全风险、加固建议
- **代码质量**：可读性、可维护性
- **最佳实践**：更好的实现方式

### 4. 迭代完成标志

当满足以下条件时，迭代循环完成：
- 代码可直接运行
- 没有明显的错误或问题
- 已给出必要的优化建议（如有）

**迭代循环模板**：

```markdown
## 代码输出完成

### 验证结果
✅ 语法检查通过
✅ 逻辑验证通过
⚠️ 发现 [问题类型]

### 优化建议
[如果有明显的优化机会]

### 下一步
1. 确认代码可用
2. 如果有问题，请指出具体问题，我会修复
```

---

## 版本历史

### v1.1.0 (2026-03-12)

**更新内容**：
- ✅ 移除 "Agent tool" 机制描述
- ✅ 将 "并行调度" 改为 "同时启动"（更清晰的命令式语言）
- ✅ 将 "调用" 统一改为 "启动"
- ✅ 强调并发/并行执行，而非机制细节
- ✅ 明确分级调度：简单（3个）/ 标准（5个）/ 深度（6个）
- ✅ 添加行动决策框架
- ✅ 添加迭代循环流程

**核心变化**：
- 从 "并行调度"（parallel dispatch）→ "同时启动"（concurrent start）
- 强调**同时启动**所有需要的 subagents，而非串行或依赖特定工具机制

### v1.0.0 (2026-03-11)

**初始版本**：
- 多 Agent 编排系统
- 双模式架构（Analysis Mode / Coding Mode）
- 6 个分析层 agents
- 2 个执行层 coder agents
- 1 个支持层 agent
