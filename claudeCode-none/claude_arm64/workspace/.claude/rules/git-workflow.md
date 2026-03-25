# Git 工作流 (Git Workflow)

## 提交信息格式 (Commit Message Format)

### 研究项目提交格式

```
<type>: <description>

[optional body]
```

**类型 (Types)**：
- `research` - 研究进展
- `decision` - 决策记录
- `evidence` - 证据收集
- `poc` - PoC 开发
- `fix` - Bug 修复
- `docs` - 文档更新
- `chore` - 工具或配置变更

**示例（研究项目）**：
```
research: identify JWT signature verification bypass

发现登录模块 JWT 验证缺少签名检查，可以伪造 token 绕过认证。

Decision: 2026-03-25-001
Step: 2026-03-25-001-02
Agent: Research Lead

- 定位验证函数
- 确认漏洞存在
- 构造测试 PoC
```

---

## 研究项目提交纪律

### 提交频率

- **每完成一个研究步骤必须 commit**
- **每个关键发现必须 commit**
- **每个 Decision Record 必须 commit**
- **每个 Step Record 必须 commit**

### Commit Message 必须包含

- **Decision ID**：如适用（研究决策相关的提交）
- **Step ID**：如适用（研究步骤相关的提交）
- **Agent**：如适用（Multi-Agent 模式下的提交）
- **简要结论**：清晰描述本提交的核心发现或结果

**示例**：
```
git commit -m "decision: 2026-03-25-001 choose JWT forgery path

Agent Strategy: Multi
Reasoning: Multiple attack surfaces need parallel analysis
Research Lead: Claude Sonnet"
```

```
git commit -m "evidence: reverse-analyst identifies AES-256 in firmware

Decision: 2026-03-25-002
Step: 2026-03-25-002-03
Agent: Reverse Analyst
Finding: Encryption algorithm at 0x401234"
```

```
git commit -m "poc: JWT forgery exploit verified

Decision: 2026-03-25-001
Step: 2026-03-25-001-05
Agent: PoC Engineer
Result: Exploit works with 100% success rate"
```

---

## 分支管理 (Branch Management)

### 研究项目分支

```
main                    - 主分支，稳定的研究成果
research/xxx-topic      - 研究分支，活跃的研究工作
poc/xxx-exploit        - PoC 分支，利用代码开发
```

### 分支命名

- **研究分支**：`research/<topic>-<date>`
- **PoC 分支**：`poc/<exploit>-<date>`
- **修复分支**：`fix/<issue>-<date>`

---

## 研究审计要求 (Research Audit Requirements)

### 可追溯性

每次研究方向变化、关键发现、证据收集都必须 commit，确保：

- [ ] 完整的研究轨迹可回放
- [ ] 每个决策都有历史记录
- [ ] 每个 Evidence 都可追溯到 Decision 和 Step
- [ ] Git 历史可以完整复现研究过程

### 审查清单

提交前检查：

- [ ] Commit message 包含 Decision ID / Step ID（如适用）
- [ ] Commit message 包含 Agent（Multi-Agent 模式）
- [ ] 简要结论清晰准确
- [ ] 没有提交敏感信息（密钥、凭证等）

---

## 常用命令 (Common Commands)

```bash
# 查看状态
git status

# 查看日志
git log --oneline --graph --all

# 查看差异
git diff
git diff --staged

# 添加文件
git add <file>

# 提交
git commit -m "type: description"

# 创建研究分支
git checkout -b research/jwt-audit-0325

# 合并到主分支
git checkout main
git merge research/jwt-audit-0325
```

---

## 安全注意事项

- ❌ 不要提交敏感信息（密钥、密码、token）
- ❌ 不要提交大文件（>10MB）
- ❌ 不要提交样本文件（使用链接或外部存储）
- ✅ 使用 .gitignore 排除不必要的文件
- ✅ 提交前使用 `git diff` 检查变更

---

## 研究项目 .gitignore 建议

```
# 敏感信息
*.key
*.pem
*.token
credentials.json

# 大文件和样本
*.apk
*.ipa
*.zip
*.tar.gz
*.bin
firmware/

# 但保留文档和脚本
!*.md
!poc/*.py
!poc/*.sh
```
