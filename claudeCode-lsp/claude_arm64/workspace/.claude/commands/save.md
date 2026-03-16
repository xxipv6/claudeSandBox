---
description: 自动保存当前工作（git add + commit + 同步变体）
---

# /save - 自动保存命令

## 功能

一键完成：
1. Git add（添加所有变更）
2. Git commit（自动生成提交信息）
3. 触发 pre-commit hook（自动同步所有变体）

## 执行流程

1. **检查 Git 状态**
   - 检查是否有变更
   - 显示修改的文件

2. **生成提交信息**
   - 自动分析变更类型
   - 生成规范的提交信息

3. **执行提交**
   - git add 所有变更
   - git commit 自动提交
   - 触发自动同步

## 使用场景

- ✅ 修改代码后快速保存
- ✅ 测试某个想法后保存
- ✅ 完成小功能后保存
- ✅ 频繁迭代开发

## 预期输出

```markdown
💾 自动保存当前工作...

[1] 检查变更
✅ 发现 3 个文件变更
  - M agents/dev.md
  - M skills/thinking/brainstorming/SKILL.md
  - M rules/agents.md

[2] 生成提交信息
📝 提交类型：feat (新功能)
📝 提交信息：update dev agent workflow

[3] 执行提交
✅ git add
✅ git commit -m "feat: update dev agent workflow"

[4] 自动同步
🔄 检测到 .claude 目录变更，自动同步到其他变体...
✅ 同步完成

💾 保存完成！所有变体已同步。
```

## 执行

开始自动保存...
