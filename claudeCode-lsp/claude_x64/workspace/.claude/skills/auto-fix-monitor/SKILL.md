---
name: auto-fix-monitor
description: 开发环境日志监控和自动修复。监控现有日志输出（浏览器控制台、终端日志、Docker logs），检测错误并自动触发修复。持续运行直到人工停止。
disable-model-invocation: false
---

# 自动修复监控技能（Auto-Fix Monitor）

## 何时启用

**主动触发**（应主动（PROACTIVELY）使用）：
- 用户说"启动监控"、"开启日志监控"、"监控报错"
- 用户说"测试这个功能"、"看看有没有 bug"
- 开发过程中需要持续监控错误

**手动触发**：
- 用户明确说使用 `auto-fix-monitor` skill

## 工作原理

**不创建新的监控系统**，而是**利用现有日志**：

```
前端日志源：
├── 浏览器控制台（Chrome DevTools）
├── 终端输出（npm run dev / vite dev）
└── Docker logs（docker logs -f）

后端日志源：
├── 终端输出（node server.js / python app.py）
├── Docker logs
└── 应用日志文件（logs/app.log）
```

## 工作流程

### 阶段 1：启动监控

**询问用户**：
```markdown
**选择监控类型**：
1. 前端监控（浏览器控制台 + 终端）
2. 后端监控（服务器日志）
3. 全部监控

**请用户**：
- 启动开发服务器（如果未启动）
- 打开浏览器（如果监控前端）
- 准备好后告知我
```

**用户确认后**：
```markdown
## 🚀 自动修复监控已启动

**监控范围**：[前端 / 后端 / 全部]
**监控方式**：持续分析日志输出
**停止方式**：说"停止监控"或"Ctrl+C"

监控中... 请进行测试操作
```

### 阶段 2：持续监控

**监控方式**（定期询问）：
```markdown
**检查日志**：
- 请粘贴最近的控制台/终端输出
- 或者说"无错误"（如果一切正常）

每次检查后，我会：
1. 分析是否有新错误
2. 如有错误 → 立即修复
3. 修复后继续监控
```

**或者使用工具自动读取**（如果可能）：
- 使用 `Bash` 工具执行 `tail -f logs/app.log`
- 使用 `Bash` 工具执行 `docker logs -f container_name`
- 实时分析日志输出

### 阶段 3：错误检测

**检测的错误模式**：

**前端错误**（Vue/React）：
```
TypeError: Cannot read property 'foo' of undefined
ReferenceError: variable is not defined
SyntaxError: Unexpected token
Failed to fetch
Network Error
404 Not Found
500 Internal Server Error
Warning: Each child should have a unique key
Warning: React has detected a change in the order of Hooks
```

**后端错误**（Node.js/Python/Go）：
```
Error: Connection refused
Error: Cannot find module 'xxx'
TypeError: Cannot read property
EADDRINUSE: address already in use
Database connection failed
Query failed: xxx
UnhandledPromiseRejection: xxx
```

### 阶段 4：错误分类和触发

| 错误类型 | 触发的 Agent/Skill | 示例 |
|---------|-------------------|------|
| 运行时错误（空指针、类型错误） | **debugging** | `Cannot read property 'foo'` |
| 依赖缺失 | **dev** | `Cannot find module 'lodash'` |
| 网络/连接错误 | **debugging** | `ECONNREFUSED` |
| 数据库错误 | **dev** | `Connection timed out` |
| 端口占用 | **dev** | `EADDRINUSE` |
| 语法错误 | **debugging** | `Unexpected token` |
| 安全相关 | **research** | `SQL injection detected` |
| API 错误（404/500） | **debugging** | `API returned 500` |

### 阶段 5：自动修复

**修复流程**：
```
检测到错误
    ↓
错误分类
    ↓
触发对应的 agent/skill
    ↓
Agent 执行修复
    ↓
验证修复（检查日志）
    ↓
继续监控（不停止）
```

**修复示例**：

**示例 1：前端空指针错误**
```
检测到：TypeError: Cannot read property 'name' of undefined
位置：src/components/UserList.tsx:25

触发：debugging skill

修复过程：
1. 分析错误原因
2. 添加可选链：user?.name
3. 验证修复
4. 继续监控
```

**示例 2：依赖缺失**
```
检测到：Error: Cannot find module '@mui/material'

触发：dev agent

修复过程：
1. 执行：npm install @mui/material
2. 验证安装
3. 继续监控
```

**示例 3：端口占用**
```
检测到：Error: listen EADDRINUSE: address already in use :::3000

触发：dev agent

修复过程：
1. 查找占用进程
2. 杀死进程或修改端口
3. 重启服务
4. 继续监控
```

### 阶段 6：持续运行

**关键特点**：
```
检测错误 → 修复 → 验证 → 继续监控
    ↑                          ↓
    └──────── 长期运行 ──────────┘
```

**不会自动停止**：
- ✅ 修复后继续监控
- ✅ 等待下一个错误
- ✅ 直到人工停止

### 阶段 7：停止监控

**停止条件**：
- 用户说"停止监控"、"完成"、"OK"
- 用户按 Ctrl+C

**停止时总结**：
```markdown
## 🛑 监控已停止

**监控总结**：
- 监控时长：XX 分钟
- 检测错误：XX 个
- 自动修复：XX 个
- 修复失败：XX 个
- 修复成功率：XX%

**修复列表**：
1. TypeError (UserList.tsx:25) - ✅ 已修复
2. MissingDependency (@mui/material) - ✅ 已修复
3. NetworkError (API timeout) - ⚠️ 部分修复
```

## 输出格式

### 启动时
```markdown
## 🚀 自动修复监控已启动

**监控类型**：前端 + 后端
**监控方式**：我会定期检查日志，发现错误立即修复

**请启动开发服务器**（如果未启动），然后说"开始"或直接进行测试

---

监控中... 说"停止"或"完成"来停止监控
```

### 检测到错误时
```markdown
## ⚠️ 检测到错误

**错误**：TypeError: Cannot read property 'name' of undefined
**位置**：src/components/UserList.tsx:25
**时间**：10:35:42

**触发修复**：debugging skill

---
[调用 debugging skill 执行修复]

---

✅ 修复完成：添加了可选链操作符 (user?.name)

**继续监控中...**
```

### 定期检查（无错误时）
```markdown
**检查日志**：
- 请粘贴最近的控制台/终端输出
- 或说"无错误"、"一切正常"

[等待用户输入...]
```

### 用户说"无错误"时
```markdown
✅ 确认无错误

**继续监控中...**
（30 秒后再次检查，或说"停止"结束）
```

## Critical Rules

1. **仅限开发环境**：不用于生产环境
2. **完全自动修复**：检测到错误立即触发对应 agent，无需询问
3. **持续运行**：修复后不停止，继续监控直到人工停止
4. **定期检查**：如果没有自动读取日志的方式，定期询问用户
5. **验证修复**：修复后必须验证是否成功

## 错误分类速查表

```
前端错误（Vue/React）：
├── TypeError/ReferenceError → debugging
├── SyntaxError → debugging
├── Network Error → debugging
├── Warning (Keys, Hooks) → dev（低优先级）
└── 404/500 → debugging

后端错误（Node.js/Python/Go）：
├── Cannot find module → dev
├── EADDRINUSE → dev
├── Database Error → dev
├── Connection Error → debugging
└── Unhandled Exception → debugging

安全错误：
├── SQL Injection → research
├── XSS Detected → research
└── Auth Error → dev + research
```

## 与现有 Agent/Skill 的协作

### 调用 debugging skill
```markdown
错误：[错误信息]
上下文：[堆栈信息、文件位置]
请求：分析并修复此错误
```

### 调用 dev agent
```markdown
错误：[错误信息]
类型：依赖缺失 / 端口占用 / 配置错误
请求：修复此问题
```

### 调用 research agent
```markdown
错误：[安全相关的错误]
严重程度：[high/medium/low]
请求：安全审计并修复
```

## 常见错误和修复策略

| 错误 | 检测 | 修复策略 |
|------|------|---------|
| 空指针 | `Cannot read property` | 添加可选链 `?.` 或空值检查 |
| 依赖缺失 | `Cannot find module` | `npm install <package>` |
| 端口占用 | `EADDRINUSE` | 杀死进程或修改端口 |
| 超时 | `ETIMEDOUT` | 增加超时时间，添加重试 |
| CORS | `CORS policy` | 更新 CORS 配置 |
| 404 | `404 Not Found` | 检查路由配置 |
| 500 | `500 Internal Server Error` | 检查后端逻辑 |
| React Key | `Each child should have a unique key` | 添加 key prop |
| Hooks 顺序 | `React has detected a change in Hooks` | 检查 Hooks 使用规则 |

## 停止条件

**唯一停止条件**：
- ✅ 用户主动停止（说"停止"、"完成"、"OK"等）

**不会自动停止**：
- ❌ 修复后继续监控
- ❌ 即使长时间运行也继续监控
- ❌ 直到人工确认测试完毕

---

**记住**：这是一个持续监控的过程，目标是在开发过程中自动发现和修复错误，让用户专注于测试功能，而不是手动查找和修复错误。
