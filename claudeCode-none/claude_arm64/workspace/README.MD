# Claude Code Multi-Agent System

安全研究多 Agent 团队系统，基于意图识别的双模式调度架构（分析层 + 执行层）。

## 🏗️ 架构概览

### 双模式调度

- **Analysis Mode（默认）**：并发启动 2-6 个分析层 subagents 进行深度分析
- **Coding Mode（执行）**：启动执行层 coder agents 进行代码开发

### Agent 团队

**分析层 (6 个)**：
- `task-planner` - 任务拆解与优先级排序
- `product-manager` - 需求与业务目标分析
- `backend-engineer` - 系统结构与状态机分析
- `frontend-engineer` - 输入面与攻击面分析
- `qa-engineer` - 失败路径与边界场景分析
- `security-tester` - 攻击路径与漏洞分析

**执行层 (2 个)**：
- `dev-coder` - 所有代码开发
- `script-coder` - 安全脚本（PoC、Exploit、Fuzzer）

**支持层 (1 个)**：
- `ops-engineer` - 环境配置与系统调试

## 🚀 快速开始

### 1. API 配置

📂 **配置文件路径**：`/root/.claude/`

修改 API Token、Base URL 和 Model 配置。

### 2. 环境变量

```bash
export CLAUDE_CONFIG_DIR=/root/.claude
export ARVINENV_PATH=/root/ArvinENV
```

### 3. 快捷命令

| 命令 | 说明 |
|------|------|
| `key -k <token>` | 修改 API Token |
| `key -u <url>` | 修改 Base URL |
| `key -m <model>` | 修改 Model |
| `rms` | 清理配置和缓存 |
| `config` | 查看所有配置信息 |

## 📚 文档

- [CHANGELOG.md](./CHANGELOG.md) - 版本更新记录
- [CLAUDE.md](./CLAUDE.md) - 系统完整配置文档
- [knowledge/](./knowledge/) - 外置知识与记忆系统

## 🔧 插件安装

进入 Claude Code 命令行输入 `/plugin`，添加官方插件市场：
```
anthropics/claude-plugins-official
```

## ⚙️ 权限配置

**沙箱环境**建议开启 Bypass 模式：
- `Claude Code: Allow Dangerously Skip Permissions` - 启用
- `Claude Code: Initial Permission Mode` - 设置为 `acceptEdits`

## 📄 许可证

本项目用于安全研究和教育目的。

