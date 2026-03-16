# Git 工作流 (Git Workflow)

## 提交信息格式 (Commit Message Format)

```
<type>: <description>

[optional body]
```

**类型 (Types)**:
- `feat` - 新功能
- `fix` - Bug 修复
- `refactor` - 重构
- `docs` - 文档更新
- `test` - 测试相关
- `chore` - 构建或工具变更
- `perf` - 性能优化
- `ci` - CI/CD 配置

**示例**:
```
feat: add user authentication

Implement login and registration with JWT tokens.
Add password validation and email verification.

- Add /auth/login endpoint
- Add /auth/register endpoint
- Implement JWT token generation
- Add password strength validator
```

---

## 拉取请求工作流 (Pull Request Workflow)

创建 PR 时：
1. 分析完整的提交历史（不仅是最近一次提交）
2. 使用 `git diff [base-branch]...HEAD` 查看所有变更
3. 起草详尽的 PR 摘要
4. 包含带有 TODO 的测试计划
5. 如果是新分支，使用 `-u` 参数推送

---

## 功能实现工作流 (Feature Implementation Workflow)

### 1. 规划先行 (Plan First)
- 使用 **planner** agent 创建实现计划
- 识别依赖关系与风险
- 拆分为多个阶段

### 2. 测试驱动开发 (TDD Approach)
- 使用 **tdd-workflow** skill
- 先编写测试 (RED)
- 实现功能以通过测试 (GREEN)
- 重构 (IMPROVE)
- 验证 80% 以上的覆盖率

### 3. 代码评审 (Code Review)
- 使用 **reviewer** agent
- 解决严重 (CRITICAL) 和高 (HIGH) 等级的问题
- 尽可能修复中 (MEDIUM) 等级的问题

### 4. 提交与推送 (Commit & Push)
- 详细的提交信息
- 遵循约定式提交 (Conventional Commits) 格式

---

## 分支管理 (Branch Management)

### 分支命名
- `main` - 主分支，生产环境
- `develop` - 开发分支
- `feature/<name>` - 功能分支
- `bugfix/<name>` - Bug 修复分支
- `hotfix/<name>` - 紧急修复分支

### 分支操作
```bash
# 创建功能分支
git checkout -b feature/user-auth

# 完成后合并到 develop
git checkout develop
git merge feature/user-auth

# 删除功能分支
git branch -d feature/user-auth
```

---

## 提交最佳实践 (Commit Best Practices)

### 每次提交应该是：
- **原子性** - 一次只做一件事
- **可回滚** - 如果有问题可以单独回滚
- **自包含** - 不依赖于其他未提交的变更

### 避免：
- ❌ 混合多个功能的提交
- ❌ 包含调试代码的提交
- ❌ 过大而杂的提交
- ❌ 格式化与功能混合的提交

### 建议：
- ✅ 频繁提交，小步快跑
- ✅ 每次提交都通过 CI
- ✅ 提交信息清晰描述变更

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

# 暂存文件
git add <file>
git add -p <file>  # 交互式暂存

# 取消暂存
git reset HEAD <file>

# 撤销最后一次提交（保留更改）
git reset --soft HEAD~

# 撤销最后一次提交（丢弃更改）
git reset --hard HEAD~

# 查看分支
git branch -a

# 切换分支
git checkout <branch>

# 创建并切换分支
git checkout -b <branch>
```

---

## 安全注意事项

- ❌ 不要提交敏感信息（密钥、密码、token）
- ❌ 不要提交大文件（>10MB）
- ❌ 不要提交编译产物（node_modules/, build/, dist/）
- ✅ 使用 .gitignore 排除不必要的文件
- ✅ 提交前使用 `git diff` 检查变更

---

## Git 配置建议

```bash
# 设置用户名和邮箱
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 设置默认分支名
git config --global init.defaultBranch main

# 设置拉取策略
git config --global pull.rebase false

# 设置编辑器
git config --global core.editor vim

# 设置别名
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
```
