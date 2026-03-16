# claudeSandBox

> 🛡️ 专为**安全研究、安全开发和日常开发**设计的 Claude Code 沙箱环境

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude-Code-4.6-purple.svg)](https://claude.com/claude-code)
[![Version](https://img.shields.io/badge/version-2.1.0-green.svg)](CHANGELOG.md)

## 📖 简介

claudeSandBox 是一个基于 Docker 的隔离开发环境，预配置了 Claude Code CLI 和专为安全场景优化的工具集。

**核心特点**：
- 🚀 **命令驱动** - 快捷命令，按需执行
- 🧠 **技能库（Skills）** - 按需加载的知识库
- 🤖 **智能体（Agents）** - 专门任务，按需调用
- 🛡️ **规则系统（Rules）** - 强制约束

**专注场景**：
- 🔍 安全研究 - 漏洞分析、安全审计、渗透测试
- 🔒 安全开发 - 安全编码、代码审查
- 💻 日常开发 - 调试、测试、重构

---

## ✨ 核心特性

### 🎯 命令驱动

不再需要选择模式，直接使用命令：

```bash
# 安全研究
/security-audit     # 安全审计（Web 白盒 + IoT）

# 日常开发
/code-review        # 代码审查（前后端）
/debug              # 调试问题
/test               # 功能测试
/e2e                # 全部测试（前端 + 后端，并发）
```

**特点**：
- ✅ 简洁直观 - 直接使用命令
- ✅ 按需调用 - 根据任务选择
- ✅ 无模式选择 - 无需选择标准/完整模式
- ✅ 专注安全 - 所有命令针对安全场景优化

### 🧠 技能库（Skills）

按需加载的知识库：

**安全技能**：
- `whitebox-audit` - Web 白盒安全审计（8 阶段流程）
- `iot-audit` - IoT 安全审计（自动识别固件/源码/混合）

**开发技能**：
- `debugging` - 调试方法论
- `code-review` - 代码审查清单
- `tdd-workflow` - TDD 工作流

**测试技能**：
- `e2e-testing` - E2E 测试（Playwright）

**分析技能**：
- `domains` - 10 个核心分析维度

### 🤖 智能体（Agents）

**规划类**：
- `task-planner` - 任务规划与分解

**分析类**（可并发）：
- `product-manager` - 需求分析
- `backend-engineer` - 后端架构分析（使用 `code-review` skill）
- `frontend-engineer` - 前端实现分析（使用 `code-review` skill）
- `security-tester` - 安全分析（使用 `whitebox-audit` + `iot-audit` skills）

**执行类**：
- `dev-coder` - 代码实现（使用 `tdd-workflow` skill）

### 🛡️ 强制规则

**安全规则**（`.claude/rules/security.md`）：
- ❌ 禁止硬编码密钥
- ❌ 禁止 SQL 注入
- ❌ 禁止 XSS 漏洞
- ❌ 禁止弱加密
- ✅ 必须输入验证
- ✅ 必须输出编码
- ✅ 遵循认证/授权规范
- ✅ 正确使用加密

**其他规则**：
- `coding-style.md` - 代码风格
- `testing.md` - 测试要求

---

## 🚀 快速开始

### 第一步：构建并启动容器

```bash
# 克隆仓库
git clone https://github.com/xxipv6/claudeSandBox.git
cd claudeSandBox

# 选择变体（4 个选项）
cd claudeCode-none/claude_arm64  # 推荐：无 LSP，ARM64

# 构建镜像
docker build -t claude-sandbox:latest .

# 启动容器
docker run -it --rm \
  -v $(pwd)/workspace:/workspace \
  claude-sandbox:latest
```

### 第二步：开始使用

```bash
# 容器内启动 Claude Code
claude

# 尝试一个命令
你：/security-audit
Claude：[开始完整安全审计流程]
```

---

## 📋 命令参考

### 安全研究命令

#### /security-audit
完整的安全审计，支持 Web 应用和 IoT 设备。

**Web 白盒审计**（`whitebox-audit` skill）：
- 8 阶段流程：执行模型 → 依赖分析 → 执行链 → 路由枚举 → 业务流程 → 越权审计 → 状态机 → 攻击路径
- 重点：越权作为主线、跨接口联动、状态机建模

**IoT 审计**（`iot-audit` skill）：
- 自动识别资产形态（仅固件/仅源码/混合）
- 统一模型：入口 → 权限 → 状态 → 副作用

```bash
# Web 应用审计
/security-audit
/security-audit src/auth/

# IoT 设备审计
/security-audit firmware.bin
/security-audit src/
```

**输出**：
- 漏洞清单（高/中/低风险）
- 攻击路径
- 修复建议

### 日常开发命令

#### /code-review
前后端代码审查（6 维度）。

```bash
# 审查所有变更
/code-review

# 审查特定文件
/code-review src/auth/login.js
```

**审查维度**：
- 功能性、性能、可读性、可维护性、测试、安全性（基础安全）

#### /debug
系统化调试，自动识别前端/后端。

```bash
# 前端调试（自动使用 Playwright）
/debug "登录按钮点击没反应"

# 后端调试
/debug "API 返回 500 错误"
```

**方法论**：
- 理解问题 → 隔离变量 → 形成假设 → 验证假设 → 定位根因 → 实施修复

#### /test
功能测试，自动识别前端/后端。

```bash
# 前端测试（自动使用 Playwright）
/test "测试登录按钮"

# 后端测试（运行 npm test）
/test "测试 API 返回"
```

#### /e2e
并发运行所有测试（前端 + 后端）。

```bash
# 运行所有测试
/e2e

# 只运行包含 login 的测试
/e2e "login"
```

**执行内容**：
- 后端测试（npm test）
- 前端 E2E 测试（Playwright）

---

## 🛠️ 工具集

### 命令行工具

容器内预装的命令行工具：

```bash
nc -nv <IP> <PORT>     # Netcat 端口扫描
curl -X POST <URL>     # HTTP 请求
sqlite3 <db>           # SQLite 数据库
```

### 配置文件位置

```bash
~/.claude/              # 用户级配置
  ├── CLAUDE.md         # 用户约定
  ├── settings.json     # 用户设置
  └── memory/           # 自动记忆

.claude/                # 项目级配置
  ├── CLAUDE.md         # 项目约定
  ├── commands/         # 命令定义
  ├── skills/           # 技能库
  ├── agents/           # 智能体定义
  ├── rules/            # 强制规则
  └── settings.json     # 项目设置
```

### 环境变量配置

```bash
# 在 ~/.claude/settings.json 或 .claude/settings.json 中配置

{
  "env": {
    "CLAUDE_API_KEY": "sk-ant-...",    # API Key
    "HTTP_PROXY": "http://127.0.0.1:7890"
  }
}
```

### 代理配置

```bash
# 方式 1：环境变量
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890

# 方式 2：settings.json
{
  "env": {
    "HTTP_PROXY": "http://127.0.0.1:7890",
    "HTTPS_PROXY": "http://127.0.0.1:7890"
  }
}

# 方式 3：启动容器时
docker run -it --rm \
  -e HTTP_PROXY=http://127.0.0.1:7890 \
  -e HTTPS_PROXY=http://127.0.0.1:7890 \
  claude-sandbox:latest
```

### 预装工具集

**开发工具**：
- git, vim, nano, jq
- curl, wget, netcat-openbsd
- sqlite3, postgresql-client

**编程语言环境**：
- Node.js (nvm)
- Python (pip)
- Go

**使用示例**：
```bash
# 端口扫描
nc -nv 192.168.1.1 80

# HTTP 请求
curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice"}'

# SQLite 数据库
sqlite3 /path/to/database.db "SELECT * FROM users;"
```

---

## 📁 项目结构

```
claudeSandBox/
├── claudeCode-none/          # 无 LSP 变体（推荐）
│   ├── claude_arm64/         # ARM64 架构
│   └── claude_x64/           # x64 架构
├── claudeCode-lsp/           # 有 LSP 变体
│   ├── claude_arm64/
│   └── claude_x64/
│
└── workspace/                # 工作目录
    └── .claude/
        ├── CLAUDE.md         # 项目约定
        ├── commands/         # 命令定义
        │   ├── security-audit.md
        │   ├── code-review.md
        │   ├── debug.md
        │   ├── test.md
        │   └── e2e.md
        ├── skills/           # 技能库
        │   ├── security/     # 安全技能
        │   │   ├── whitebox-audit/
        │   │   └── iot-audit/
        │   ├── development/  # 开发技能
        │   │   ├── debugging/
        │   │   ├── code-review/
        │   │   └── tdd-workflow/
        │   ├── testing/      # 测试技能
        │   │   └── e2e-testing/
        │   └── analysis/     # 分析技能
        │       └── domains/
        ├── agents/           # 智能体定义
        │   ├── task-planner.md
        │   ├── product-manager.md
        │   ├── backend-engineer.md
        │   ├── frontend-engineer.md
        │   ├── security-tester.md
        │   └── dev-coder.md
        ├── agent-memory/     # Agent 持久记忆
        │   ├── task-planner/
        │   ├── product-manager/
        │   ├── backend-engineer/
        │   ├── frontend-engineer/
        │   ├── security-tester/
        │   └── dev-coder/
        └── rules/            # 强制规则
            ├── security.md
            ├── coding-style.md
            └── testing.md
```

---

## 🔄 版本对比

| 变体 | LSP | 架构 | 推荐场景 |
|------|-----|------|---------|
| **claudeCode-none/claude_arm64** | ❌ | ARM64 | ✅ 推荐（性能好，稳定） |
| **claudeCode-none/claude_x64** | ❌ | x64 | ✅ Intel/AMD 处理器 |
| **claudeCode-lsp/claude_arm64** | ✅ | ARM64 | 需要代码补全 |
| **claudeCode-lsp/claude_x64** | ✅ | x64 | x64 + 代码补全 |

**选择建议**：
- 推荐使用 `claudeCode-none` 版本，性能更好且更稳定
- ARM64 版本在 Apple Silicon 和 ARM 服务器上性能最佳
- 如果需要代码补全功能，使用 `claudeCode-lsp` 版本

---

## 📚 使用场景

### 1. 安全研究

```
你：/security-audit
Claude：[执行完整安全审计]
- 执行模型还原
- 越权专项审计
- 状态机分析
- 生成审计报告
```

### 2. 代码审查

```
你：/code-review
Claude：[执行代码审查]
- 前端代码审查（frontend-engineer）
- 后端代码审查（backend-engineer）
- 并发执行
- 生成审查报告
```

### 3. 调试问题

```
你：/debug "API 返回 500 错误"
Claude：[系统化调试]
- 理解问题
- 隔离变量
- 形成假设
- 验证假设
- 定位根因
- 实施修复
```

### 4. 测试功能

```
你：/e2e
Claude：[并发运行所有测试]
- 后端测试（npm test）
- 前端 E2E 测试（Playwright）
- 并发执行
- 生成测试报告
```

---

## 🆚 新旧架构对比

### v2.1.0（当前）- 命令驱动

```bash
# 直接使用命令
/security-audit
/code-review
/debug
/test
/e2e
```

**特点**：
- ✅ 简洁直观
- ✅ 按需调用
- ✅ 无模式选择
- ✅ 专注安全场景

### v2.0.0 - 模式驱动

```bash
# 先选择模式
标准模式 → 3-4 步流程
完整模式 → 6 步流程 + 质量门禁
```

**特点**：
- ⚠️ 需要选择模式
- ⚠️ 流程较重
- ⚠️ 6 个阶段

---

## 🛠️ 开发指南

### 添加自定义命令

在 `.claude/commands/` 创建新的 `.md` 文件：

```markdown
---
description: 命令描述
---

# 命令名称

## 执行流程
1. 第一步
2. 第二步
3. 第三步

## 使用示例
```bash
/command-name "参数"
```
```

### 添加自定义技能

在 `.claude/skills/` 创建新的技能目录：

```
.claude/skills/my-skill/
└── SKILL.md
```

### 添加自定义规则

在 `.claude/rules/` 创建新的规则文件：

```markdown
---
paths:
  - "**/*.{js,ts}"
---

# 规则名称

## 禁止项
## 必须项
## 检查清单
```

---

## 📖 文档

- [CHANGELOG.md](CHANGELOG.md) - 版本历史
- [ARCHITECTURE.md](ARCHITECTURE.md) - 架构设计
- [CLAUDE.md](workspace/.claude/CLAUDE.md) - 项目约定

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License

---

## 🙏 致谢

本项目参考了以下优秀项目：
- [everything-claude-code](https://github.com/affaan-m/everything-claude-code)
- [Claude Code 官方文档](https://code.claude.com/docs)
