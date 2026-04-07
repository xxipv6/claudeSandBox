# Git Workflow

## Commit Rules

工具开发使用 Conventional Commits：
- `feat:`
- `fix:`
- `refactor:`
- `docs:`
- `chore:`

安全研究可使用：
- `research:`
- `decision:`
- `evidence:`
- `poc:`

---

## When to Commit

不要把所有微小步骤都拆成 commit。

以下情况单独 commit：
- 关键步骤
- 关键发现
- 关键决策
- 已验证的 PoC
- 独立的修复或功能改动

---

## Commit Message Guidance

如适用，可在 commit message 中包含：
- Decision ID
- Step ID
- Agent
- 简要结论

目标是可追溯，不是为了制造提交噪音。

---

## Branch Naming

常用分支：
- `research/<topic>-<date>`
- `poc/<topic>-<date>`
- `fix/<issue>-<date>`

---

## Safety Rules

- 不要提交密钥、密码、token、凭证
- 不要提交大样本文件或固件原始包
- 提交前先看 `git diff`
- 使用 `.gitignore` 排除无关文件
