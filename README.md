# claudeSandBox

> 🛡️ 专为**安全研究、逆向工程、漏洞分析**设计的 Claude Code 沙箱环境

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude-Code-4.6-purple.svg)](https://claude.com/claude-code)
[![Version](https://img.shields.io/badge/version-3.3.0-green.svg)](CHANGELOG.md)

## 📖 简介

claudeSandBox 是一个基于 Docker 的隔离研究环境，预配置了 Claude Code CLI 和专为安全研究优化的工具集。

**核心特点**：
- 🧠 **研究导向契约** - 强制研究流程，确保可审计、可复现
- 🔍 **技能库（Skills）** - 安全研究专用知识库
- 🛡️ **规则系统（Rules）** - 安全编码规范与研究约束

**专注场景**：
- 🔍 安全研究 - 漏洞分析、安全审计、威胁建模
- 🔧 逆向工程 - 二进制分析、协议逆向、恶意软件分析
- 💣 PoC 开发 - 漏洞验证、利用开发、攻击链构建
- 📊 取证分析 - 日志分析、流量分析、证据提取

---

## 📜 授权声明（Authorization）

### 使用授权

**本项目遵循 MIT License**，详见 [LICENSE](LICENSE) 文件。

**授权对象**：
- ✅ 安全研究人员
- ✅ 渗透测试人员（需获得明确授权）
- ✅ 代码审计人员
- ✅ 漏洞研究者
- ✅ 安全开发人员

**授权范围**：
- ✅ 使用本环境进行授权的安全研究
- ✅ 修改和适配配置以适应特定需求
- ✅ 在研究和开发中使用本项目的 tools、agents、skills

**禁止行为**：
- ❌ 将本环境用于恶意目的
- ❌ 将本环境用于未授权的系统访问
- ❌ 将本环境用于违反法律的活动

### 使用条件

**法律合规**：
- 使用者必须遵守所在国家/地区的法律法规
- 所有研究活动必须获得明确授权
- 不得用于非法入侵或攻击

**道德准则**：
- 负责任披露发现的漏洞
- 不得利用漏洞造成损害
- 尊重用户隐私和数据

**风险自负**：
- 使用者对自己的行为负责
- 本项目不提供任何担保
- 作者不对使用本项目造成的任何后果负责

---

## ✨ 核心特性

### 🧠 研究负责人 AI（Research Lead AI）

**AI 是研究负责人，不是执行工具**：

**角色定位**：
- ❌ 不是执行工具
- ❌ 不是被动分析器
- ❌ 不是等待指令的助手
- ✅ **研究负责人** - 对研究路径、技术路线、攻击面选择、验证方式负全责

**单/多 Agent 策略**：
- ✅ **默认：单 Research Lead AI**
  - 当前契约已把"多 Agent 的职责"内化成强纪律
  - Decision Record + Step Record = 完整可回放轨迹
  - 适用：研究目标清晰、攻击面单一、失败成本可控
- 🔥 **扩展：多 Agent（对抗不确定性）**
  - 用途：认知视角冲突、研究路径分叉、角色冲突
  - 架构：Research Lead（决策权）+ Specialist Agents（无决策权，只提供 Evidence）
  - **Specialist Agents**：
    - `reverse-analyst` - 逆向分析专家（二进制 / 协议 / 状态机）
    - `attack-surface-scout` - 攻击面侦察专家（输入面 / 权限边界）
    - `poc-engineer` - PoC 开发专家（验证 / exploit）
    - `skeptic` - 怀疑论者审计专家（反证 / 挑战假设）
  - **多 Agent 不是升级，而是战术扩展**

**研究决策权**：
| 层级 | 决策内容 | 权限 |
|------|---------|------|
| 战略层 | 是否研究 / 研究目标 | 人类 |
| 战术层 | 研究路径 / 攻击面 / 方法 | **AI** |
| 技术层 | 工具 / 技术细节 / PoC | **AI** |
| 执行层 | 命令 / 操作 | **AI** |
| 否决权 | 停止 / 改向 | 人类 |

**逐步研究记录（核心纪律）**：
- ⚠️ **每完成一个研究步骤，必须立即记录**
- 📝 **Step Record 包含**：Agent, Action Taken, Input, Observation, Conclusion, Next Step
- 🚫 **三个禁止**：禁止事后补写、禁止合并步骤、禁止只记录成功路径
- ✅ **完整轨迹**：可回放、可审计、可复现

**执行环境权限**：
- ✅ Docker 隔离容器 + root 权限
- ✅ 自由安装/卸载系统包
- ✅ 自由修改系统配置
- ✅ 自由执行调试/逆向工具（tcpdump / nmap / gdb / frida 等）
- ✅ 无需确认，直接执行

**决策权分层**：
| 层级 | 决策内容 | 权限 |
|------|---------|------|
| 战略层 | 是否研究 / 研究目标 | 人类 |
| 战术层 | 研究路径 / 攻击面 / 方法 | **AI** |
| 技术层 | 工具 / 技术细节 / PoC | **AI** |
| 执行层 | 命令 / 操作 | **AI** |
| 否决权 | 停止 / 改向 | 人类 |

**三阶段研究流程**：

1. **研究任务判定**
   - 高复杂度：系统审计、深度逆向、攻击链构建
   - 中低复杂度：单点漏洞、已知漏洞复现
   - 简单操作：文件查看、日志检查

2. **研究决策模式（高复杂度任务）**
   - AI 显式输出 Decision Record（决策记录）
   - 包含：攻击面、假设、选择路径、拒绝理由、风险评估
   - 不是请求批准，是决策日志

3. **研究执行与监督**
   - AI 直接执行研究
   - 人类可随时否决或要求重新决策
   - 所有决策可审计、可追溯

### 🧠 技能库（Skills）

**研究专用技能**：

**设计技能**：
- `brainstorming` - 高复杂度研究的设计探索

**安全技能**：
- `security/web-whitebox-audit` - Web 白盒安全审计（8 阶段流程）
- `security/iot-audit` - IoT 安全审计（自动识别固件/源码/混合）
- `security/vuln-patterns` - OWASP Top 10 漏洞模式
- `security/poc-exploit` - PoC 开发和漏洞利用

**研究技能**：
- `debugging` - 调试方法论与问题定位
- `code-review` - 代码审查清单（安全视角）

### 🛡️ 规则系统（Rules）

**研究契约**：
- `CLAUDE.md` - 统一研究协作契约（v3）

**安全规则**（`security.md`）：
- ❌ 禁止硬编码密钥
- ❌ 禁止 SQL 注入
- ❌ 禁止 XSS 漏洞
- ❌ 禁止弱加密
- ✅ 必须输入验证
- ✅ 必须输出编码
- ✅ 遵循认证/授权规范
- ✅ 正确使用加密

**工作流规则**：
- `git-workflow.md` - Git 工作流（提交格式、审计跟踪）

**编码规范**（语言特定）：
- `python/coding-style.md` - Python 编码规范（安全要求）
- `javascript/coding-style.md` - JavaScript/TypeScript 编码规范
- `go/coding-style.md` - Go 编码规范（并发安全）
- `java/coding-style.md` - Java 编码规范（安全最佳实践）

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

# 开始对话
你：帮我审计这个登录模块的安全问题
Claude：[识别为高复杂度研究任务]
      → 询问是否需要设计探索
      → 生成研究计划
      → 执行完整安全审计
```

---

## 📋 研究项目结构

**每个研究任务使用独立项目目录**：

```
xxx-research/
├── docs/
│   ├── decisions/      ← 决策记录（核心）
│   └── designs/        ← 推演与假设
├── notes/
│   └── steps/          ← 逐步研究记录（核心）
├── artifacts/          ← 样本 / dump / pcap / core
├── poc/                ← PoC / exploit / scripts
├── data/               ← 日志 / 流量 / 中间数据
├── agents/             ← 多 Agent 模式下的证据（可选）
│   ├── reverse/        ← Reverse Analyst 输出
│   ├── scout/          ← Attack Surface Scout 输出
│   ├── poc/            ← PoC Engineer 输出
│   └── skeptic/        ← Skeptic / Auditor 输出
├── README.md
└── .git/
```

**核心目录说明**：

- **docs/decisions/**：每次研究方向变化生成 Decision Record（包含 Agent Strategy）
- **notes/steps/**：每完成一个研究步骤生成 Step Record（标注 Agent）
- **docs/designs/**：攻击面推演、假设验证
- **artifacts/**：样本文件、内存 dump、网络抓包
- **poc/**：PoC 代码、exploit 脚本
- **data/**：中间数据、日志文件
- **agents/**：多 Agent 模式下 Specialist Agents 的证据输出（可选）

**Decision Record 示例（单 Agent）**：
```markdown
# Decision Record: 2026-03-25-001

## Decision ID
2026-03-25-001

## Research Objective
审计登录模块的认证绕过漏洞

## Agent Strategy
**Single**

**理由**：
- 研究目标清晰（JWT 认证绕过）
- 攻击面单一（登录模块）
- 失败成本低（可重复测试）

## Candidate Paths
1. JWT token 伪造
2. Session 固定
3. 密码重置流程

## Chosen Path
**选择**：JWT token 伪造

## Evidence Plan
- PoC：伪造 JWT token
- 验证：访问 /api/user/profile
```

**Decision Record 示例（多 Agent）**：
```markdown
# Decision Record: 2026-03-25-002

## Decision ID
2026-03-25-002

## Research Objective
逆向分析未知协议的加密机制

## Agent Strategy
**Multi**

**理由**：
- 认知视角冲突：状态机理解 vs 加密层假设
- 不确定性高：需要多个视角并行探索

## Multi-Agent Setup
- **Reverse Analyst**：协议状态机还原、控制流分析
- **Attack Surface Scout**：输入面识别、边界测试
- **Skeptic**：反证假设、否定初步结论

## Evidence Plan
- Reverse Analyst：状态机图、转换表
- Attack Surface Scout：有效输入向量
- Skeptic：异常模式识别
```

**核心目录说明**：

- **docs/decisions/**：每次研究方向变化生成 Decision Record
- **notes/steps/**：每完成一个研究步骤生成 Step Record（逐步记录）
- **docs/designs/**：攻击面推演、假设验证
- **artifacts/**：样本文件、内存 dump、网络抓包
- **poc/**：PoC 代码、exploit 脚本
- **data/**：中间数据、日志文件

**Decision Record 示例**：
```markdown
# Decision Record: 2026-03-25-001

## Decision ID
2026-03-25-001

## Research Objective
审计登录模块的认证绕过漏洞

## Candidate Paths
1. JWT token 伪造
2. Session 固定
3. 密码重置流程

## Chosen Path
**选择**：JWT token 伪造
**理由**：
- 代码审查发现签名验证缺失
- 攻击影响最大（完全绕过认证）

## Rejected Paths
- Session 固定：需要先获取有效 session
- 密码重置：流程复杂，时间成本高

## Risk Assessment
- 风险：可能触发 WAF
- 缓解：使用低速率测试

## Evidence Plan
- PoC：伪造 JWT token
- 验证：访问 /api/user/profile
```

**Step Record 示例**：
```markdown
# Step Record: 2026-03-25-001-01

## Step ID
2026-03-25-001-01

## Decision ID
2026-03-25-001

## Action Taken
定位 JWT 验证函数

## Input / Evidence
- 目标文件：/app/auth/jwt.py
- 关键词：verify, decode, validate

## Observation
发现 verify_token() 函数：
- 使用 jwt.decode() 解析 token
- 缺少 signature 验证
- 直接信任 payload 内容

## Conclusion
存在 JWT token 伪造漏洞

## Next Step
构造恶意 JWT token 并验证
```

**决策记录示例**：
```markdown
# Decision Record: 2026-03-25-001

## Research Objective
审计登录模块的认证绕过漏洞

## Candidate Attack Surfaces
1. JWT token 伪造
2. Session 固定
3. 密码重置流程

## Chosen Path
**选择**：JWT token 伪造
**理由**：
- 代码审查发现签名验证缺失
- 攻击影响最大（完全绕过认证）

## Rejected Paths
- Session 固定：需要先获取有效 session
- 密码重置：流程复杂，时间成本高

## Risk Assessment
- 风险：可能触发 WAF
- 缓解：使用低速率测试

## Evidence Plan
- PoC：伪造 JWT token
- 验证：访问 /api/user/profile
```

---

## 🛠️ 工具集

### 命令行工具

容器内预装的命令行工具：

```bash
nc -nv <IP> <PORT>     # Netcat 端口扫描
curl -X POST <URL>     # HTTP 请求
sqlite3 <db>           # SQLite 数据库
tcpdump                # 网络抓包
strace                 # 系统调用跟踪
ltrace                 # 库调用跟踪
gdb                    # 调试器
objdump                # 二进制分析
strings                # 字符串提取
```

### 配置文件位置

```bash
~/.claude/              # 用户级配置
  ├── CLAUDE.md         # 用户约定
  ├── settings.json     # 用户设置
  └── memory/           # 自动记忆

.claude/                # 项目级配置
  ├── CLAUDE.md         # 统一研究协作契约
  ├── commands/         # 命令定义
  ├── skills/           # 技能库
  └── rules/            # 强制规则
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
├── README.md                 # 主项目文档
├── CHANGELOG.md              # 版本历史
├── MAINTENANCE.md            # 维护手册
└── LICENSE                   # MIT 许可证

# 每个变体内部结构
workspace/                    # 工作目录
└── .claude/
    ├── CLAUDE.md             # 统一研究协作契约 v4（决策权授权模型）
    ├── commands/             # 命令定义
    ├── skills/               # 研究技能库
    │   ├── brainstorming/
    │   ├── debugging/
    │   ├── code-review/
    │   └── security/
    │       ├── web-whitebox-audit/
    │       ├── iot-audit/
    │       ├── vuln-patterns/
    │       └── poc-exploit/
    └── rules/                # 强制规则
        ├── security.md
        ├── git-workflow.md
        ├── python/coding-style.md
        ├── javascript/coding-style.md
        ├── go/coding-style.md
        └── java/coding-style.md
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

### 1. 安全审计（单 Agent - 默认模式）

```
你：帮我审计这个登录模块的安全问题

Claude：[评估：研究目标清晰、攻击面单一]
      → 输出 Decision Record（Agent Strategy: Single）
      → 开始研究

[Step 1] 代码审查
→ Action：定位认证相关代码
→ Observation：发现 JWT 验证缺失签名
→ Conclusion：存在伪造风险
→ 记录：notes/steps/2026-03-25-001-01.md
→ Commit：git commit -m "Decision:2026-03-25-001 Step:001 Agent:Lead JWT签名缺失"

[Step 2] 假设验证
→ Action：构造恶意 JWT token
→ Input：{"admin": true}
→ Observation：绕过认证成功
→ Conclusion：漏洞确认
→ 记录：notes/steps/2026-03-25-001-02.md
→ Commit：git commit -m "Decision:2026-03-25-001 Step:002 Agent:Lead 漏洞验证成功"
```

### 2. 协议逆向（多 Agent - 对抗认知冲突）

```
你：帮我逆向这个未知协议

Claude：[评估：协议逆向，状态机 vs 加密层存在认知冲突]
      → 输出 Decision Record（Agent Strategy: Multi）
      → 启动多 Agent 模式

[Step 1] 并行分析
→ Reverse Analyst：状态机还原
  → Observation：识别 3 个状态（INIT / AUTH / DATA）
  → 记录：agents/reverse/state_machine.md

→ Attack Surface Scout：输入面识别
  → Observation：发现 5 个有效 opcode
  → 记录：agents/scout/input_vectors.md

→ Skeptic：反证假设
  → Observation：opcode 0x03 不符合状态机假设
  → 记录：agents/skeptic/anomaly_001.md

[Step 2] 证据整合（Research Lead）
→ Action：整合三个 Agent 的证据
→ Observation：opcode 0x03 是加密层心跳，非状态转换
→ Conclusion：协议结构 = 状态机 + 加密层（独立）
→ 记录：notes/steps/2026-03-25-002-01.md
→ Commit：git commit -m "Decision:2026-03-25-002 Step:001 Agent:Lead 协议结构确认"
```

### 3. 人类否决示例

```
Claude：[输出 Decision Record]
      → Chosen Path: 暴力破解管理员密码
      → Risk Assessment: 低风险，有速率限制

你：❌ 否决，不要暴力破解

Claude：[接收否决，重新决策]
      → 输出新的 Decision Record
      → Chosen Path: 使用默认密码字典
      → Risk Assessment: 可能触发告警，降低速率
      → 继续执行...
```

### 4. 单/多 Agent 决策示例

```
场景 1：单点漏洞复现
你：帮我复现 CVE-2024-xxxx
Claude：[评估：目标清晰、路径明确]
      → Decision Record: Agent Strategy = Single
      → 直接执行复现

场景 2：复杂系统审计
你：帮我审计这个分布式系统
Claude：[评估：多组件、攻击面分散]
      → Decision Record: Agent Strategy = Multi
      → 启动 Reverse Analyst + Attack Surface Scout + Skeptic
```

### 1. 安全审计

```
你：帮我审计这个登录模块的安全问题
Claude：[识别为高复杂度研究任务]
      → 进入 Research Decision Mode
      → 输出 Decision Record
        • Candidate Attack Surfaces: JWT/Session/密码重置
        • Chosen Path: JWT token 伪造
        • Risk Assessment: 可能触发 WAF
      → 直接执行审计
      → 发现签名验证缺失
      → 生成 PoC 验证
      → 记录决策链和证据
```

### 2. 漏洞复现

```
你：帮我复现 CVE-2024-xxxx
Claude：[识别为中低复杂度研究任务]
      → AI 直接决策
      → 选择复现路径：本地环境 + 最小 PoC
      → 下载样本、搭建环境
      → 验证漏洞
      → 编写 PoC
      → 关联 Decision Record
```

### 3. 逆向工程

```
你：帮我分析这个二进制的加密算法
Claude：[识别为高复杂度研究任务]
      → 输出 Decision Record
        • Candidate Paths: 静态分析 / 动态调试 / 符号执行
        • Chosen Path: 静态分析（Ghidra）+ 动态调试（Frida）
        • Rejected: 符号执行（该二进制有反调试）
      → 执行逆向
      → 记录逆向笔记
      → 生成算法文档
```

### 4. PoC 开发

```
你：帮我编写 CVE-2024-xxxx 的 PoC
Claude：[识别为中低复杂度研究任务]
      → AI 直接决策技术方案
      → 选择 Python + requests 库
      → 分析漏洞原理
      → 编写 PoC 代码
      → 本地验证
      → 关联 Decision Record
```

### 5. 人类否决示例

```
Claude：[输出 Decision Record]
      → Chosen Path: 暴力破解管理员密码
      → Risk Assessment: 低风险，有速率限制

你：❌ 否决，不要暴力破解

Claude：[接收否决]
      → Rejected Paths 重新评估
      → 新决策：使用默认密码字典
      → 输出新的 Decision Record
```

---

## 🔬 研究流程示例

### 高复杂度研究：完整安全审计

```markdown
**第一步：任务判定**
Claude：检测到这是一个高复杂度安全研究任务：完整 Web 应用安全审计

**第二步：研究设计询问**
Claude：是否需要进行研究设计探索（brainstorming）？
用户：需要

**第三步：设计探索**
Claude：[执行 brainstorming]
→ 研究路径：白盒审计 + 黑盒验证
→ 攻击面：认证、授权、注入、业务逻辑
→ 风险评估：高危漏洞可能性
→ 输出研究设计文档

**第四步：设计批准**
Claude：研究设计文档已生成，请批准后继续
用户：批准

**第五步：研究规划**
Claude：[Research Planner]
→ Objective：完整安全审计
→ Scope：包含/排除范围
→ Steps：详细审计步骤
→ Evidence Plan：证据收集方式

**第六步：执行研究**
→ 创建项目目录
→ 执行审计步骤
→ 记录所有发现
→ Git 审计跟踪
→ 生成审计报告
```

---

## 📖 文档

### 完整文档
- [CHANGELOG.md](CHANGELOG.md) - 版本历史
- [MAINTENANCE.md](MAINTENANCE.md) - 维护手册
- [CLAUDE.md](claudeCode-none/claude_arm64/workspace/CLAUDE.md) - 统一研究协作契约

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
