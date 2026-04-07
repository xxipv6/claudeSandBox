# Decision Record Format

## 何时记录

以下情况生成 Decision Record：
- 开始新的研究方向
- 研究路径发生变化
- 发现新的攻击面
- 从 Single-Agent 升级到 Multi-Agent
- 会改变研究路径、资源分配、Agent Strategy 或关键验证顺序的关键假设需要验证

---

## 最小模板

```markdown
# Decision Record: YYYY-MM-DD-XXX

- 目标：
- 背景：
- Agent Strategy：Single / Multi
- 最终路径：
- 选择理由：
- 风险：
- 下一步：
```

---

## 规则

- Decision ID 格式：`YYYY-MM-DD-XXX`
- 内容重点是“为什么这样选”和“下一步做什么”
- Decision Record 属于持久决策依据，不参与 destructive compaction
- 不要求每次都写成长文
- 能简短表达清楚，就不要展开成大报告
