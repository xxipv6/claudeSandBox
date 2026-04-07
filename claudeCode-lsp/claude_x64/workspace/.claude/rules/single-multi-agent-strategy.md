# Single vs Multi-Agent Strategy

## 核心规则

默认单 Agent。

满足任一条件时，升级为 Multi-Agent：
- 研究路径出现明显分叉
- 需要不同角色同时提供证据（逆向 + 审计 + PoC）
- 多个攻击面或模块可独立并行分析
- 单 Agent 会明显拖慢定位或验证
- 失败成本高，需要并行降低不确定性

如果只是目标清晰、攻击面单一、路径明确，保持 Single Agent。

---

## Single Agent

适用场景：
- 单一目标
- 单一攻击面或模块
- 验证路径明确
- 不需要并行收集证据

工作方式：
- 主 Agent 独立完成分析与结论
- 只在关键节点记录

---

## Multi-Agent

适用场景：
- 多条合理路径需要同时探索
- 需要多个专业视角交叉验证
- 多个模块之间无依赖，可并行分析
- 需要同时做分析与验证

工作方式：
- 主 Agent 负责拆分、调度、整合
- Specialist Agents 负责搜索、分析、验证和证据
- 默认后台并行执行

---

## Agent Selection

安全研究常用组合：
- 固件完整审计：`reverse-analyst` + `code-audit` + `skeptic`
- 协议逆向：`reverse-analyst` + `poc-engineer`
- Web 白盒审计：`code-audit` + `skeptic` + `poc-engineer`
- 漏洞复现：`poc-engineer`
- 未知样本分析：`reverse-analyst` + `skeptic`

安全开发常用组合：
- 大型工具开发：`secdev-engineer` x 2+
- 引擎 + 插件并行：`secdev-engineer` x 2
- 重构 + 测试并行：`secdev-engineer` x 2
- 单模块开发或 bug 修复：`secdev-engineer`

---

## Parallel Safety Checks

并行前确认：
1. 前置条件已完成
2. 任务之间无依赖
3. 不会写同一资源
4. 不会产生数据竞争

不满足以上条件时，改回串行。
