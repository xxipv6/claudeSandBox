# Skills 目录

## 用途

存放**按需加载**的工作流和领域知识。

## 设计原则

1. **description 要说明"何时该用我"**，不是"我是干什么的"
2. **高频技能**（>1次/会话）→ 保持 auto-invoke
3. **低频技能**（<1次/会话）→ 手动触发
4. **极低频技能**（<1次/月）→ 移除，改为文档

## 结构

```
skills/
└── skill-name/
    ├── SKILL.md           # 技能描述（必需）
    ├── examples.md        # 示例（可选）
    └── scripts/           # 辅助脚本（可选）
```

## SKILL.md 格式

```markdown
---
name: skill-name
description: Use when [specific condition]. Short and clear.
---

# Skill Name

## 何时启用

- 条件1
- 条件2

## 工作流

1. 步骤1
2. 步骤2
3. 步骤3

## 输出格式

...
```

## 示例技能

- `tdd-workflow` - 测试驱动开发工作流
- `debugging` - 调试方法论
- `code-review` - 代码审查清单
