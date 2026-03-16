# Agents 目录

## 用途

存放**自定义 Subagents**，用于隔离大量输出或并行研究。

## 核心价值

**隔离**，而非并行。

- 扫代码库 → 交给 Subagent（只拿摘要）
- 跑测试 → 交给 Subagent（不被中间过程污染）
- 做审查 → 交给 Subagent（独立上下文）

## 配置要点

```yaml
---
name: agent-name
description: Use for [specific task]. When [condition], use this agent.
model: sonnet  # 或 opus/haiku
tools: [Read, Grep, Glob]  # 限定工具
maxTurns: 20  # 防止跑飞
memory: project  # 或 none
---
```

## 最佳实践

1. **限定工具** - 不要和主线程一样宽的权限
2. **选择模型** - 探索用 Haiku/Sonnet，审查用 Opus
3. **固定输出格式** - 便于主线程使用
4. **设置 maxTurns** - 防止无限循环

## 内置 Subagents

- `Explore` - 只读扫库（Haiku，省成本）
- `Plan` - 规划调研
- `General-purpose` - 通用任务

## 何时创建自定义 Agent

- 需要大量探索代码库
- 需要并行研究多个方向
- 需要隔离执行环境
- 需要专门的工具集
