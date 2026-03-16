# Claude Code · claudeSandBox 维护指南

## 角色定位

**我是 claudeSandBox 项目的维护者**，负责：
- 项目架构设计和演进
- 代码质量和一致性
- 文档维护和更新
- 问题修复和改进

---

## 项目定位

**claudeSandBox** 是一个专为**安全研究、安全开发和日常开发**设计的 Claude Code 沙箱环境。

**核心特点**：
- 🚀 **命令驱动** - 快捷命令，按需执行
- 🧠 **技能库（Skills）** - 按需加载的知识库
- 🤖 **智能体（Agents）** - 专门任务，按需调用
- 🛡️ **安全优先** - 安全编码规范，强制规则

---

## 核心架构

### 命令驱动系统

```
用户输入 → 命令执行 → 完成任务
```

**核心命令**：
```bash
/security-audit     # 完整安全审计
/vuln-scan          # 快速漏洞扫描
/debug              # 系统化调试
/code-review        # 代码审查
/full "task"        # 完整开发流程
/quick "task"       # 快速修复
```

### 技能库（Skills）

**安全技能**：
- `vuln-patterns` - OWASP Top 10 + CWE 漏洞模式
- `secure-coding` - 安全编码规范

**开发技能**：
- `debugging` - 调试方法论
- `code-review` - 代码审查清单
- `tdd-workflow` - TDD 工作流

**分析技能**：
- `domains` - 10 个核心分析维度

### 智能体（Agents）

- `task-planner` - 任务规划
- `product-manager` - 需求分析
- `backend-engineer` - 后端架构
- `frontend-engineer` - 前端实现
- `security-tester` - 安全分析
- `dev-coder` - 代码实现

### 规则系统（Rules）

- `security.md` - 强制安全规则
- `coding-style.md` - 代码风格
- `testing.md` - 测试规范

---

## 项目结构

```
claudeSandBox/
├── README.md                    # 主项目文档
├── CHANGELOG.md                 # 版本历史
├── ARCHITECTURE.md              # 架构设计
├── claudeCode-none/             # 无 LSP 变体
│   ├── claude_arm64/           # ARM64 架构
│   │   ├── Dockerfile
│   │   ├── ArvinENV/           # 环境工具
│   │   └── workspace/          # 工作目录
│   │       ├── .claude/
│   │       │   ├── CLAUDE.md    # 项目约定
│   │       │   ├── commands/    # 命令定义
│   │       │   ├── skills/      # 技能库
│   │       │   ├── agents/      # 智能体定义
│   │       │   └── rules/       # 强制规则
│   │       └── agent-memory/    # 智能体记忆
│   └── claude_x64/             # x64 架构
└── claudeCode-lsp/             # 有 LSP 变体
    ├── claude_arm64/
    └── claude_x64/
```

---

## 维护原则

### 1. 架构简洁

**优先命令驱动，拒绝复杂流程**：
- ✅ 命令直接执行
- ❌ 复杂的模式选择
- ❌ 多阶段流程
- ❌ 状态文件管理

**删除过时文件**：
- 删除旧架构的残留文件
- 删除重复的文档
- 删除不再使用的工具

### 2. 一致性

**同步所有变体**：
- 4 个目录变体必须保持同步
- 修改一个，同步全部
- 使用 `rsync -av --delete` 确保一致性

**代码风格一致**：
- 统一的命名规范
- 统一的文件结构
- 统一的文档格式

### 3. 质量保证

**提交前检查**：
- [ ] 所有变体已同步
- [ ] 文档已更新
- [ ] 过时文件已删除
- [ ] 代码风格一致
- [ ] 功能正常工作

**测试覆盖**：
- 核心命令需要测试
- 安全规则需要验证
- 文档需要审查

### 4. 文档维护

**README.md**：
- 主项目的唯一 README（在 claudeSandBox 根目录）
- 反映最新架构
- 包含使用示例

**CHANGELOG.md**：
- 记录所有重要变更
- 按版本组织
- 包含变更原因

### 5. 安全优先

**安全编码规范**：
- 遵循 `rules/security.md`
- 输入验证
- 输出编码
- 禁止硬编码密钥

**安全审查**：
- 新功能需要安全审查
- 依赖需要定期检查
- 漏洞需要及时修复

---

## 工作流程

### 日常维护

```bash
# 1. 修改代码（在主变体）
cd claudeCode-none/claude_arm64/workspace/.claude/

# 2. 同步到其他变体
rsync -av --delete commands/ ../../claudeCode-none/claude_x64/workspace/.claude/commands/
rsync -av --delete commands/ ../../claudeCode-lsp/claude_arm64/workspace/.claude/commands/
rsync -av --delete commands/ ../../claudeCode-lsp/claude_x64/workspace/.claude/commands/

# 3. 更新文档
cd ../../..
vim README.md
vim CHANGELOG.md

# 4. 提交变更
git add -A
git commit -m "feat: ..."
git push
```

### 添加新命令

```bash
# 1. 在 commands/ 创建新命令
vim commands/new-command.md

# 2. 定义命令格式
---
description: 命令描述
---

# 命令名称

## 执行流程
...

# 3. 同步到所有变体
# 4. 更新 README.md
# 5. 提交
```

### 添加新技能

```bash
# 1. 创建 skill 目录
mkdir -p skills/category/new-skill

# 2. 创建 SKILL.md
---
description: 技能描述
disable-model-invocation: false/false
---

# 技能内容
...

# 3. 同步到所有变体
# 4. 提交
```

### 清理过时文件

```bash
# 1. 查找过时文件
find . -name "*.md" | grep -E "(old|deprecated|legacy)"

# 2. 确认删除
rm file

# 3. 同步到所有变体
# 4. 提交
```

---

## 常见任务

### 同步所有变体

```bash
SRC="claudeCode-none/claude_arm64/workspace/.claude"
DST1="claudeCode-none/claude_x64/workspace/.claude"
DST2="claudeCode-lsp/claude_arm64/workspace/.claude"
DST3="claudeCode-lsp/claude_x64/workspace/.claude"

rsync -av --delete "$SRC/" "$DST1/"
rsync -av --delete "$SRC/" "$DST2/"
rsync -av --delete "$SRC/" "$DST3/"
```

### 检查一致性

```bash
# 检查文件数量
find claudeCode-*/claude_*/workspace/.claude/ -name "*.md" | wc -l

# 检查文件差异
diff claudeCode-none/claude_arm64/workspace/.claude/CLAUDE.md \
     claudeCode-none/claude_x64/workspace/.claude/CLAUDE.md
```

### 版本发布

```bash
# 1. 更新版本号
vim CHANGELOG.md

# 2. 更新 README.md 中的版本号
vim README.md

# 3. 提交
git commit -m "chore: release v2.1.0"
git tag v2.1.0
git push --tags
```

---

## 全局禁止

1. ❌ **破坏架构一致性** - 不同变体有不同的实现
2. ❌ **引入复杂流程** - 违背命令驱动原则
3. ❌ **忽略安全问题** - 违反安全规则
4. ❌ **过时文件残留** - 不删除旧架构的文件
5. ❌ **文档过时** - 代码已更新但文档未同步

---

## 全局要求

1. ✅ **架构优先** - 保持架构简洁、一致
2. ✅ **同步更新** - 修改一个，同步全部
3. ✅ **文档同步** - 代码和文档同时更新
4. ✅ **安全第一** - 遵循安全编码规范
5. ✅ **质量保证** - 提交前充分测试

---

## 项目版本

**当前版本**: v2.1.0

**架构特点**：
- 命令驱动（非模式驱动）
- Skills 按需加载
- 专注安全场景
- 简洁易用

---

## 维护记录

**最近的重大变更**：
- v2.1.0: 从模式驱动重构为命令驱动
- 删除了 6 阶段流程系统
- 删除了状态管理文件
- 添加了命令系统、技能库、规则系统
- 专注安全研究 + 安全开发 + 日常开发

**维护者**：Claude Sonnet 4.6
**最后更新**：2025-03-16
