---
name: auto-fix-monitor
description: 开发环境日志监控和自动修复。实时监控前后端日志，检测错误并自动触发修复流程。用于开发时发现问题并自动修复。
disable-model-invocation: false
---

# 自动修复监控技能（Auto-Fix Monitor）

## 何时启用

- 开发环境需要实时日志监控
- 希望自动检测和修复错误
- 需要持久化错误日志用于分析
- 长时间运行开发服务器时

## 监控范围

**仅限开发环境**：
- ✅ 前端：localhost 控制台日志
- ✅ 后端：本地服务器日志
- ✅ 日志文件：`logs/` 目录
- ❌ 生产环境监控（不负责）

## 工作流程

### 阶段 1：启动监控

1. **选择监控类型**：
   - 前端监控（浏览器控制台）
   - 后端监控（服务器日志）
   - 日志文件监控
   - 全部监控

2. **配置持久化**：
   ```bash
   logs/
   ├── auto-fix-frontend.log
   ├── auto-fix-backend.log
   └── auto-fix-errors.log  # 仅错误日志
   ```

3. **启动监控进程**

### 阶段 2：实时监控

监控日志并检测以下错误模式：

**前端错误**：
- `Uncaught Error:` / `Uncaught Exception:`
- `ReferenceError:` / `TypeError:` / `SyntaxError:`
- `Failed to fetch` / `Network Error`
- `404` / `500` / `503` 状态码

**后端错误**：
- `Error:` / `Exception:` / `Fatal:`
- `ECONNREFUSED` / `ETIMEDOUT`
- `Cannot read property` / `undefined is not a function`
- 数据库连接失败
- 端口占用

**依赖错误**：
- `Cannot find module`
- `Module not found`
- `Dependency not found`

### 阶段 3：错误分类

| 错误类型 | 触发的 Agent/Skill | 严重程度 |
|---------|-------------------|---------|
| 运行时错误（空指针、类型错误） | debugging | 🟡 中 |
| 依赖缺失 | dev | 🟢 低 |
| 网络/连接错误 | debugging | 🟡 中 |
| 数据库错误 | dev | 🟡 中 |
| 端口占用 | dev | 🟢 低 |
| 语法错误 | debugging | 🔴 高 |
| 安全相关 | research | 🔴 高 |

### 阶段 4：自动修复

**立即自动修复**（无需确认）：
- 端口占用 → 自动查找可用端口并重启
- 依赖缺失 → 自动安装依赖
- 超时错误 → 增加超时时间并重试
- 简单的空指针 → 添加可选链或空值检查

**触发 Agent 修复**：
1. 调用对应的 agent/skill
2. 提供错误上下文和日志
3. Agent 执行修复
4. 验证修复结果
5. 记录到日志

**修复失败处理**：
- 记录失败原因
- 尝试备用方案
- 通知用户（严重错误）

### 阶段 5：持续监控和修复

**重要**：监控会持续运行，修复错误后**继续监控**，直到人工测试完毕主动停止。

**修复后流程**：
```
检测错误 → 修复错误 → 验证修复 → 继续监控
    ↑                                    ↓
    └──────────── 长期运行 ────────────────┘
```

**持续监控特点**：
- ✅ 修复后不停止，继续监控
- ✅ 同类错误可以重复修复
- ✅ 累计统计所有错误和修复
- ✅ 定期生成监控报告
- ⏱️ 直到用户主动停止（Ctrl+C）

### 阶段 6：持久化和报告

**日志格式**：
```json
{
  "timestamp": "2026-03-17T10:30:45Z",
  "level": "error",
  "source": "frontend|backend",
  "errorType": "TypeError",
  "message": "Cannot read property 'foo' of undefined",
  "stack": "...",
  "file": "src/components/App.tsx:15",
  "fixAttempted": true,
  "fixResult": "success|failed",
  "fixDetails": "Added optional chaining"
}
```

**定期报告**（每 10 分钟）：
```
=== 自动修复监控报告 ===
监控时长：1h 30m
检测到错误：12
自动修复：10
修复失败：2
失败类型：[数据库连接, 安全漏洞]
```

## 输出格式

### 启动监控时

```markdown
## 🚀 自动修复监控已启动

**监控范围**：
- ✅ 前端控制台
- ✅ 后端日志
- ✅ 日志文件：logs/auto-fix-*.log

**监控规则**：
- 运行时错误 → debugging skill
- 依赖问题 → dev agent
- 数据库错误 → dev agent
- 安全问题 → research agent

**日志持久化**：logs/auto-fix-errors.log
**报告频率**：每 10 分钟

监控中... 按 Ctrl+C 停止
```

### 检测到错误时

```markdown
## ⚠️ 检测到错误

**类型**：TypeError
**位置**：src/App.tsx:15
**信息**：Cannot read property 'foo' of undefined
**时间**：2026-03-17 10:30:45

**触发修复**：debugging skill

[修复过程...]
✅ 修复成功：添加了可选链操作符

**日志已记录**：logs/auto-fix-errors.log
```

### 监控报告

```markdown
## 📊 监控报告（最近 10 分钟）

**检测到错误**：3
**自动修复**：2
**修复失败**：1

**详细统计**：
- TypeError: 2（已修复）
- Database Error: 1（修复失败）

**修复成功率**：66%
```

## 停止监控

**停止条件**：
- ✅ 用户主动停止（Ctrl+C）
- ✅ 人工测试完毕，手动停止
- ⚠️ 检测到生产环境（自动停止并警告）

**不会自动停止的情况**：
- ❌ 修复错误后不停止
- ❌ 达到错误数量上限不停止
- ❌ 监控时间过长不停止

**停止时的总结**：
```markdown
## 🛑 监控已停止

**总结**：
- 监控时长：2h 15m
- 检测错误：25
- 自动修复：22
- 修复失败：3
- 同一错误重复：5

**修复成功率**：88%

**日志位置**：logs/auto-fix-errors.log
```

## Critical Rules

1. **仅限开发环境**：不用于生产环境
2. **完全自动修复**：不需要用户确认（除非严重错误）
3. **必须持久化**：所有错误和修复记录到日志
4. **修复验证**：修复后必须验证是否成功
5. **失败处理**：修复失败时记录原因并尝试备用方案

## 与其他组件的协作

### 调用 debugging skill
```markdown
错误：运行时错误
上下文：{error, stack, file, line}
请求：分析错误原因并修复
```

### 调用 dev agent
```markdown
错误：依赖缺失
上下文：{missingPackage, importPath}
请求：安装缺失的依赖
```

### 调用 research agent
```markdown
错误：安全漏洞
上下文：{vulnerability, severity}
请求：安全审计并修复
```

## 配置选项

**日志级别**：
- `error`：仅错误（默认）
- `warn`：警告和错误
- `info`：所有日志

**报告频率**：
- 默认：每 10 分钟
- 可配置：5/15/30 分钟

**自动修复策略**：
- `auto`：完全自动（默认）
- `confirm`：需要确认
- `off`：仅监控不修复

## 常见错误和修复策略

| 错误 | 检测模式 | 修复策略 |
|------|---------|---------|
| 端口占用 | `EADDRINUSE` | 查找可用端口，更新配置 |
| 依赖缺失 | `Cannot find module` | `npm install <package>` |
| 空指针 | `Cannot read property` | 添加可选链 `?.` 或空值检查 |
| 超时 | `ETIMEDOUT` | 增加超时时间，添加重试 |
| CORS | `CORS policy` | 更新 CORS 配置 |
| 404 | `404 Not Found` | 检查路由配置 |
| 500 | `500 Internal Server Error` | 检查后端逻辑 |

## 停止条件

**唯一停止条件**：
- ✅ 用户主动停止（Ctrl+C 或命令）

**不会自动停止**：
- ❌ 修复错误后继续监控
- ❌ 即使长时间运行也继续监控
- ❌ 直到人工确认测试完毕才停止

**安全退出**：
- ⚠️ 检测到生产环境时自动停止并警告（防止误用）

---

**记住**：这是开发环境的辅助工具，目标是快速发现和修复错误，提升开发效率。
