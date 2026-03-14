# 完整模式示例

## 触发条件（必须同时满足）
- 架构级任务
- 用户明确说"完整分析"或"完整编排"
- 环境变量 `CLAUDE_FULL_MODE=1` 已设置

## 示例：安全研究项目
```
环境：CLAUDE_FULL_MODE=1
用户：完整分析这个协议栈的安全性

Claude：
1. 制定详细计划：
   - Stage 00: Planning（启动 task-planner）
   - Stage 01: Task Init（创建状态文件）
   - Stage 02: Git Prepare（创建分支）
   - Stage 03: Mode Execution（Analysis Mode）
     * 启动 product-manager
     * 启动 backend-engineer
     * 启动 frontend-engineer
     * 启动 security-tester
     * 合并结果，输出 Research Ledger
   - Stage 04: Quality Gate（质量验证）
   - Stage 05: Completion（合并分支）

2. 询问用户：是否按这个计划执行？

3. 用户确认后：
   - 按阶段执行
   - 创建完整状态文件
   - 每个 agent 顺序执行
   - Git commits 记录每个步骤
```

## 启动 2-4 个 agents（顺序执行）
## 完整状态文件（task_states + plans）
## 需要详细计划确认
## 创建 Git 分支
## 执行 Quality Gate
