# Orchestrator Agent Memory

## 项目知识引用

本项目使用**共享知识库**，所有 knowledge 文件夹的内容对 ORCHESTRATOR 强制可见：

### 共享知识库位置
- **失败模式库**：`/workspace/knowledge/patterns.md`
- **领域知识库**：`/workspace/knowledge/domains.md`
- **工具认知库**：`/workspace/knowledge/tools.md`
- **错误学习库**：`/workspace/knowledge/corrections.md`

### Orchestrator 使用指引

**任务开始前**：
- 检查用户输入，判断应该进入 Coding Mode 还是 Analysis Mode
- 如果是 Analysis Mode，快速回顾 patterns.md 和 domains.md

**调度 subagents 前**：
- 提醒 subagents 参考 knowledge 文件夹的内容
- 特别提醒：corrections.md 中的错误模式不要重复

**合并结果时**：
- 对照 patterns.md，检查是否遗漏了常见失败模式
- 对照 domains.md，确保覆盖了所有相关维度
- 如果发现新的错误模式，记录到 corrections.md

**Coding Mode 下**：
- 调用 coder agents 时，传递 knowledge 上下文
- 确保 coder agents 也参考 corrections.md 避免重复错误

---

## 双模式决策经验

### Coding Mode 触发词增强
根据项目经验，以下额外词汇也触发 Coding Mode：
- "demo"、"示例"、"快速实现"
- "用Python"、"用Go"、"用Node"
- "写个SQL"、"写个接口"、"写个API"

### Analysis Mode 触发词增强
根据项目经验，以下额外词汇也触发 Analysis Mode：
- "合理吗"、"怎么样"、"行不行"
- "风险"、"威胁"、"攻击面"
- "流程"、"状态机"、"状态转换"

---

## 调度策略经验

### Subagent 超时处理
- 单个 subagent 超时不要立即放弃，先记录再继续
- 多个 subagent 超时时，考虑降低并发度重试
- 全部超时时，orchestrator 直接基于 knowledge 分析

### 并行调度优化
- 5 个分析层 subagents 可以并行启动
- 但要控制总并发度，避免资源耗尽
- 建议分批：先启动 3 个，再启动 2 个

---

## 项目特定经验

### 本项目特点
- 这是一个安全研究项目，不是常规 web 开发
- 更关注攻击面、漏洞、状态机绕过
- 代码质量次于漏洞发现能力

### 优先级规则
1. 安全发现 > 代码完整性
2. Analysis Mode > Coding Mode（当同时触发）
3. 多视角分析 > 单视角深入

---

## 常见陷阱

### 陷阱 1：模式混淆
- ❌ 错误：看到"分析"就进入 Analysis Mode
- ✅ 正确：检查是否是"写分析工具"（Coding Mode）

### 陷阱 2：过度调度
- ❌ 错误：Coding Mode 下也调度分析层 subagent
- ✅ 正确：Coding Mode 只调度执行层 coder agents

### 陷阱 3：忽略 knowledge
- ❌ 错误：每次都从头分析
- ✅ 正确：优先参考 knowledge 文件夹的已有知识

---

## 持续改进

每次完成任务后，思考：
1. 这个任务是否暴露了新的失败模式？
2. 是否应该更新 corrections.md？
3. 是否应该更新 patterns.md？

如果有新发现，立即更新 knowledge 文件夹。
