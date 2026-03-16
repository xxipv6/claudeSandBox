# claudeSandBox

> 🛡️ 专为**安全研究、安全开发和日常开发**设计的 Claude Code 沙箱环境

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude-Code-4.6-purple.svg)](https://claude.com/claude-code)
[![Version](https://img.shields.io/badge/version-2.1.0-green.svg)](CHANGELOG.md)

## 📖 简介

claudeSandBox 是一个基于 Docker 的隔离开发环境，预配置了 Claude Code CLI 和专为安全场景优化的工具集。

**核心特点**：
- 🚀 **命令驱动** - 快捷命令，按需执行
- 🧠 **技能库** - 安全研究知识，按需加载
- 🤖 **智能体** - 专门任务，按需调用
- 🛡️ **安全优先** - 安全编码规范，强制规则

**专注场景**：
- 🔍 安全研究 - 漏洞分析、PoC 开发、渗透测试
- 🔒 安全开发 - 安全编码、威胁建模、代码审查
- 💻 日常开发 - 调试、测试、重构

---

## ✨ 核心特性

### 🎯 命令驱动

不再需要选择模式，直接使用命令：

```bash
# 安全研究
/security-audit     # 完整安全审计
/vuln-scan          # 快速漏洞扫描
/exploit-gen        # 生成 PoC

# 安全开发
/secure-review      # 安全代码审查
/threat-model       # 威胁建模

# 日常开发
/full "task"        # 完整开发流程
/quick "task"       # 快速修复
/debug              # 系统化调试
/code-review        # 代码审查
/test               # 运行测试
```

### 🧠 技能库（Skills）

**安全技能**：
- `vuln-analysis` - 漏洞分析方法论（CWE、OWASP）
- `secure-coding` - 安全编码规范
- `vuln-patterns` - 常见漏洞模式库

**开发技能**：
- `debugging` - 调试方法论
- `code-review` - 代码审查清单
- `tdd-workflow` - TDD 工作流

**分析技能**：
- `domains` - 10 个核心分析维度
- `tools` - 工具使用指南
- `patterns` - 模式识别

### 🤖 智能体（Agents）

**规划类**：
- `task-planner` - 任务规划与分解

**分析类**（可并发）：
- `product-manager` - 需求分析
- `backend-engineer` - 后端架构
- `frontend-engineer` - 前端实现
- `security-tester` - 安全分析

**执行类**：
- `dev-coder` - 代码实现

**安全专用**：
- `vuln-analyst` - 漏洞分析专家
- `secure-coder` - 安全编码专家

### 🛡️ 强制规则

**安全规则**（`.claude/rules/security.md`）：
- ❌ 禁止硬编码密钥
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
完整的安全审计，包括漏洞扫描、代码审查、威胁建模。

```bash
# 审计整个项目
/security-audit

# 审计特定模块
/security-audit src/auth/
```

**输出**：
- 漏洞清单（高/中/低风险）
- 修复建议
- 优先级排序

#### /vuln-scan
快速扫描已知漏洞。

```bash
# 扫描整个项目
/vuln-scan

# 只扫描依赖
/vuln-scan --deps-only

# 快速扫描
/vuln-scan --quick
```

**扫描内容**：
- 硬编码密钥
- SQL 注入
- XSS 漏洞
- 依赖漏洞
- 配置问题

#### /exploit-gen
为漏洞生成 PoC。

```bash
# 为发现的漏洞生成 PoC
/exploit-gen "SQL injection in login"
```

### 安全开发命令

#### /secure-review
安全代码审查。

```bash
# 审查当前变更
/secure-review

# 审查特定文件
/secure-review src/auth/login.js
```

**审查内容**：
- 输入验证
- 输出编码
- 认证/授权
- 加密使用
- 依赖安全

#### /threat-model
威胁建模。

```bash
# 对新功能进行威胁建模
/threat-model "用户支付功能"
```

**使用**：
- STRIDE 方法论
- 攻击面分析
- 风险评估

### 日常开发命令

#### /full "task"
完整开发流程，从规划到实现到验证。

```bash
/full "实现用户认证系统"
```

**流程**：
1. 规划（task-planner）
2. 分析（agents 并发）
3. 实现（dev-coder）
4. 验证（测试 + 审查）
5. 交付（文档 + 提交）

#### /quick "task"
快速修复，跳过规划。

```bash
/quick "修复登录页面的验证错误"
```

**流程**：
1. 理解问题
2. 直接修复
3. 快速验证
4. 提交代码

#### /debug
系统化调试。

```bash
/debug "用户登录失败，返回 500 错误"
```

**方法论**：
- 理解问题 → 隔离变量 → 形成假设 → 验证假设 → 定位根因 → 实施修复

#### /code-review
代码审查。

```bash
# 审查所有变更
/code-review

# 审查特定文件
/code-review src/auth/login.js
```

**审查维度**：
- 功能性、安全性、性能
- 可读性、可维护性
- 测试覆盖

#### /test
运行测试。

```bash
# 运行所有测试
/test

# 运行特定测试
/test --grep "auth"
```

---

## 🛠️ 工具集

### ArvinENV 工具

容器内预装的命令行工具：

```bash
mode          # 查看当前模式
mode full     # 切换到完整模式
mode standard # 切换到标准模式

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
    "CLAUDE_FULL_MODE": "1",           # 开启完整模式
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
        │   ├── vuln-scan.md
        │   ├── debug.md
        │   ├── code-review.md
        │   ├── full.md
        │   └── quick.md
        ├── skills/           # 技能库
        │   ├── security/     # 安全技能
        │   │   ├── vuln-analysis/
        │   │   ├── secure-coding/
        │   │   └── vuln-patterns/
        │   ├── development/  # 开发技能
        │   │   ├── debugging/
        │   │   ├── code-review/
        │   │   └── tdd-workflow/
        │   └── analysis/     # 分析技能
        │       ├── domains/
        │       ├── tools/
        │       └── patterns/
        ├── agents/           # 智能体定义
        │   ├── task-planner.md
        │   ├── product-manager.md
        │   ├── backend-engineer.md
        │   ├── frontend-engineer.md
        │   ├── security-tester.md
        │   └── dev-coder.md
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
- 扫描漏洞模式
- 分析代码安全
- 生成审计报告
```

### 2. 漏洞分析

```
你：/vuln-scan src/auth/
Claude：[扫描认证模块]
- 发现 2 个高危漏洞
- 发现 3 个中危问题
- 提供修复建议
```

### 3. 快速修复

```
你：/quick "修复 SQL 注入漏洞"
Claude：[快速修复]
- 定位漏洞
- 实施修复
- 验证修复
```

### 4. 复杂功能

```
你：/full "实现用户认证系统"
Claude：[完整开发流程]
- 规划任务
- 分析设计
- 实现代码
- 验证测试
- 交付文档
```

---

## 🆚 新旧架构对比

### v2.1.0（当前）- 命令驱动

```bash
# 直接使用命令
/security-audit
/vuln-scan
/full "task"
/quick "task"
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
