# 多 Agent 团队架构流程图

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

        Complexity -->|简单| Simple[2-3 个 Agent]
        Complexity -->|标准| Standard[4-5 个 Agent]
        Complexity -->|深度| Deep[6 个 Agent]

        Simple --> ScheduleSimple
        Standard --> ScheduleStandard
        Deep --> ScheduleDeep
    end

    %% 分析层调度
    subgraph ScheduleSimple["简单任务调度"]
        TP1[task-planner]
        Expert[核心专家<br/>1-2个]
    end

    subgraph ScheduleStandard["标准任务调度"]
        TP2[task-planner]
        MultiExpert[多领域专家<br/>2-4个]
    end

    subgraph ScheduleDeep["深度任务调度"]
        TP3[task-planner]
        PM[product-manager]
        BE[backend-engineer]
        FE[frontend-engineer]
        QE[qa-engineer]
        ST[security-tester]
    end

    %% 分析层并行执行
    ScheduleSimple --> Parallel1[🔄 并行执行]
    ScheduleStandard --> Parallel2[🔄 并行执行]
    ScheduleDeep --> Parallel3[🔄 并行执行]

    %% 合并结果
    Parallel1 --> Merge{收集 & 合并}
    Parallel2 --> Merge
    Parallel3 --> Merge

    Merge --> ResearchLedger[📋 Research Ledger]
    ResearchLedger --> ActionDecision{下一步建议}

    ActionDecision -->|选项 1/2/3| CodingMode2[→ Coding Mode]
    ActionDecision -->|跳过| End([等待用户])

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
```

---

## 分级调度详解

```mermaid
flowchart LR
    Input[任务输入] --> Check{复杂度判断}

    Check -->|单一问题<br/>明确边界| SimpleLevel[🟢 简单任务]
    Check -->|多个问题<br/>需要设计| StandardLevel[🟡 标准任务]
    Check -->|复杂系统<br/>高风险| DeepLevel[🔴 深度任务]

    subgraph SimpleAgents["简单任务：2-3 个 Agent"]
        S1[task-planner<br/>任务拆解]
        S2[核心专家<br/>1-2个<br/>例: security-tester]
    end

    subgraph StandardAgents["标准任务：4-5 个 Agent"]
        ST1[task-planner<br/>任务拆解]
        ST2[多领域专家<br/>2-4个<br/>例: product-manager<br/>+ backend-engineer<br/>+ security-tester]
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

    SimpleAgents --> Output[并行执行 → 合并结果]
    StandardAgents --> Output
    DeepAgents --> Output

    style SimpleLevel fill:#e8f5e8
    style StandardLevel fill:#fff9c4
    style DeepLevel fill:#ffcdd2
```

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
        A1[并行调度分析层 agents]
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

    Orchestrator -->|并行调用| Analysis
    Orchestrator -->|执行调用| Execution
    Orchestrator -.->|按需调用| Support

    Analysis -->|合并结果| Orchestrator

    style Orchestrator fill:#f3e5f5
    style Analysis fill:#e3f2fd
    style Execution fill:#fff3e0
    style Support fill:#fce4ec
```

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
