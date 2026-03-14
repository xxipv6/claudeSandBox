# Claude Code · 智能任务执行系统

AI 编程助手，根据任务复杂度自动调整工作方式。

## 🏗️ 系统架构

### 三种执行模式

**快速模式**：
- 0 个 agents
- 直接执行
- 无状态文件
- 适用：单文件修改、明确 bug 修复

**标准模式**（默认）：
- 1-2 个 agents（顺序执行）
- 简要计划 + 用户确认
- 可选状态文件
- 适用：项目分析、功能实现

**完整模式**：
- 2-4 个 agents（顺序执行）
- 详细计划 + Git 分支
- 完整状态文件
- 触发：环境变量 `CLAUDE_FULL_MODE=1` + 用户明确要求

### Agent 团队

**分析类**：
- `product-manager` - 需求与架构评估
- `backend-engineer` - 后端代码分析
- `frontend-engineer` - 前端代码分析

**执行类**：
- `dev-coder` - 代码实现

**质量类**：
- `security-tester` - 安全检查

## 🚀 核心特性

### 1. 意图驱动
不是配置驱动，Claude 理解用户意图后自动选择合适的工作方式。

### 2. 保守判断
任何不确定的情况 → 自动降级到标准模式（安全缓冲区）。

### 3. 强制入口
执行任何操作前必须先输出 MODE DECISION，禁止"先做再说"。

### 4. 默认拒绝
完整模式需要明确授权（环境变量），否则拒绝执行。

### 5. 顺序执行
Agents 顺序执行，不并发（Claude 的并发是叙事级的）。

## 📚 文档

- [CLAUDE.md](./CLAUDE.md) - 系统核心配置（96 行）
- [.claude/workflow/quick-mode.md](./.claude/workflow/quick-mode.md) - 快速模式执行
- [.claude/workflow/standard-mode.md](./.claude/workflow/standard-mode.md) - 标准模式执行
- [.claude/workflow/full-mode.md](./.claude/workflow/full-mode.md) - 完整模式执行
- [.claude/workflow/ARCHITECTURE.md](./.claude/workflow/ARCHITECTURE.md) - 系统架构说明
- [.claude/workflow/TESTING.md](./.claude/workflow/TESTING.md) - 测试指南
- [CHANGELOG.md](./CHANGELOG.md) - 版本更新记录

## 🔧 配置

### 文件结构
```
/workspace/
├── CLAUDE.md                    # 核心配置（96 行）
└── .claude/
    ├── agents/                  # 5 个 agent 定义
    ├── workflow/                # 执行模式文件
    └── task_states/             # 按需创建
```

### 环境变量

```bash
# 启用完整模式（可选）
export CLAUDE_FULL_MODE=1
```

## ⚙️ 权限配置

**沙箱环境**建议开启 Bypass 模式：
- `Claude Code: Allow Dangerously Skip Permissions` - 启用
- `Claude Code: Initial Permission Mode` - 设置为 `acceptEdits`

## 📄 许可证

本项目用于安全研究和教育目的。
