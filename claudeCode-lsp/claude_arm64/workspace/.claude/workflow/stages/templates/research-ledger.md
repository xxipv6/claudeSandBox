# Research Ledger 模板

## 使用说明

这是 Analysis Mode 的输出模板。

## 输出格式

```markdown
## 分析结果

### Goal
[研究目标]

### System Model
[来自 ≥2 个 subagent 的系统模型]

### Verified Facts
[已验证的事实，带证据]

### Active Hypotheses
[活跃假设，来自不同视角]

### Rejected Hypotheses
[已否定的假设，含失败路径]

### Key Decisions
[关键决策]

### Artifacts
[产物：流程图、状态机、攻击路径图等]

### Open Questions
[未解决问题]

### Next Actions
[下一步行动，≤3 项]
```

## 字段说明

### Goal
- **说明**：研究目标
- **来源**：用户输入

### System Model
- **说明**：系统模型
- **来源**：来自 ≥2 个 subagent
- **要求**：必须综合多个视角

### Verified Facts
- **说明**：已验证的事实
- **来源**：仅接受带证据的输出
- **要求**：必须包含证据

### Active Hypotheses
- **说明**：活跃假设
- **来源**：来自不同视角 subagent
- **要求**：必须来自不同视角，同一观点不重复

### Rejected Hypotheses
- **说明**：已否定的假设
- **来源**：失败的分析路径
- **要求**：必须包含失败路径和否定原因

### Key Decisions
- **说明**：关键决策
- **来源**：合并后的决策
- **要求**：综合多视角

### Artifacts
- **说明**：分析产物
- **来源**：分析过程中生成
- **示例**：流程图、状态机、攻击路径图等

### Open Questions
- **说明**：未解决问题
- **来源**：分析过程中发现
- **要求**：具体、可操作

### Next Actions
- **说明**：下一步行动
- **来源**：基于分析结果
- **要求**：≤3 项，每项必须可执行

## 填写规则（强制）

### System Model
- 必须综合 ≥2 个 subagent 的输出
- 不能只依赖单个 subagent

### Active Hypotheses
- 必须来自不同视角
- 同一观点不重复
- 标注来源 subagent

### Rejected Hypotheses
- 必须包含失败路径
- 必须包含否定原因
- 标注来源 subagent

### Verified Facts
- 仅接受带证据的输出
- 无证据则放入假设
- 标注证据来源

### Next Actions
- 最多 3 项
- 每项必须可执行
- 具体明确

## 示例

```markdown
## 分析结果

### Goal
分析登录接口的越权风险

### System Model
登录接口 → token验证 → 权限判断 → 返回用户信息

### Verified Facts
- 接口使用 JWT token 进行身份验证（证据：backend-engineer）
- 前端在 localStorage 存储 token（证据：frontend-engineer）
- token 过期时间为 24 小时（证据：backend-engineer）

### Active Hypotheses
- 可能存在 token 伪造风险（security-tester）
- 可能存在会话劫持风险（security-tester）

### Rejected Hypotheses
- 不存在未授权访问：需要有效 token 才能访问

### Key Decisions
- 主要风险：token 泄露导致会话劫持
- 次要风险：token 伪造（如果签名算法弱）

### Artifacts
- 攻击路径图：[mermaid 图]
- 状态机图：[mermaid 图]

### Open Questions
- token 签名算法是什么？
- 是否有 token 刷新机制？

### Next Actions
1. 确认 token 签名算法
2. 测试 token 伪造可能性
3. 编写 token 泄露防护建议
```
