---
name: auto-fix-monitor
description: 开发环境日志监控和自动修复技能。当用户启动开发服务器、进行功能测试或需要持续监控错误时，应主动（PROACTIVELY）使用此 skill。监控现有日志输出（浏览器控制台、终端日志、Docker logs），检测错误并自动触发修复，持续运行直到人工停止。
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

### 阶段 2：持续监控和修复

**重要**：必须主动使用 Bash 工具持续读取日志，而不是等待用户输入！

**监控循环**（每 5 秒一次）：
```bash
# 1. 使用 Bash 工具读取最新日志
tail -n 50 logs/app.log                    # 后端日志
tail -n 50 npm-debug.log                    # 前端日志
docker logs --tail 50 container_name       # Docker 日志

# 2. 分析日志中的错误
# 3. 如果发现错误 → 立即修复
# 4. 修复后等待 5 秒
# 5. 重复步骤 1
```

**监控循环的输出格式**：
```markdown
### 🔍 检查日志... (第 N 次，共检测到 X 个错误)

**读取日志**：
- logs/app.log: [显示最后几行]
- npm-debug.log: [显示最后几行]

**分析结果**：
- ✅ 无新错误 → 等待 5 秒后继续监控
- ⚠️ 发现错误 → 立即修复

[如果有错误，显示错误详情并触发修复]

---
等待 5 秒后继续监控... (或说"停止"结束)
```

**关键**：
- ✅ 主动使用 Bash 工具读取日志
- ✅ 每 5 秒检查一次
- ✅ 发现错误立即修复
- ✅ 修复后继续监控
- ❌ 不要等待用户输入
- ❌ 不要只说"监控中"而不实际检查

**如果无法自动读取日志**（例如用户没有提供日志文件路径）：
```markdown
### 📋 需要日志访问

我无法自动读取日志。请提供以下信息：

1. **后端日志文件路径**：例如 `logs/app.log`
2. **前端日志文件路径**：例如 `npm-debug.log`
3. **或 Docker 容器名称**：例如 `my-app-backend`

或者，每次检查时请粘贴最新的日志输出。
```

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
**检查频率**：每 5 秒
**监控方式**：主动读取日志文件

**立即开始第一次日志检查**...

---
[使用 Bash 工具执行]
tail -n 50 logs/app.log
tail -n 50 npm-debug.log
```

### 每次检查日志时（真实执行流程）
```markdown
### 🔍 检查日志... (第 N 次，监控已运行 X 分钟)

**步骤 1**：使用 Bash 工具读取最新日志
```bash
# 后端日志
tail -n 50 logs/app.log
# 前端日志
tail -n 50 npm-debug.log
```

**步骤 2**：分析日志内容
- 搜索错误模式（TypeError, ReferenceError, Error, etc.）
- 检查是否有新的错误
- 统计错误数量

**步骤 3**：根据分析结果执行

如果**发现新错误**：
```markdown
## ⚠️ 发现新错误！

**错误 1**：TypeError: Cannot read property 'foo'
**位置**：src/components/UserList.tsx:25
**触发修复**：debugging skill

[调用 debugging skill 修复错误]

✅ 修复完成

---

继续监控...
```

如果**无新错误**：
```markdown
✅ 日志检查完成，无新错误

**统计**：
- 本次检查：无新错误
- 累计修复：X 个错误
- 监控时长：X 分钟

---
5 秒后进行下一次检查...
[使用 Bash 等待或实际等待 5 秒]
```

**重要**：每次检查都必须：
1. ✅ 真正使用 Bash 工具执行 `tail` 命令
2. ✅ 读取实际的日志内容
3. ✅ 分析日志中的错误
4. ✅ 如果发现错误，立即调用对应的 agent/skill 修复
5. ✅ 修复后继续下一次检查
6. ❌ 不要跳过检查
7. ❌ 不要只说"监控中"而不实际检查

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
（5 秒后再次检查，或说"停止"结束）
```

## Critical Rules

1. **必须主动读取日志**：每 5 秒使用 Bash 工具执行 `tail -n 50` 读取日志
2. **必须分析日志内容**：搜索错误模式，统计错误数量
3. **发现错误必须修复**：立即触发对应的 agent/skill，不等待用户确认
4. **修复后继续监控**：不要停止，立即进行下一次检查
5. **仅限开发环境**：不用于生产环境
6. **输出检查结果**：每次检查后都要输出检查结果（有/无错误）

**监控循环（强制执行）**：
```
第 1 次：
  ├─ 使用 Bash: tail -n 50 logs/*.log
  ├─ 分析日志内容
  ├─ 发现错误？ → 是 → 修复 → 继续
  └─ 发现错误？ → 否 → 等待 5 秒 → 第 2 次

第 2 次：
  ├─ 使用 Bash: tail -n 50 logs/*.log
  ├─ 分析日志内容
  ├─ 发现错误？ → 是 → 修复 → 继续
  └─ 发现错误？ → 否 → 等待 5 秒 → 第 3 次

...持续循环直到用户说"停止"
```

**禁止行为**：
- ❌ 不要只说"监控中"而不实际读取日志
- ❌ 不要等待用户输入日志
- ❌ 不要跳过检查
- ❌ 不要修复后停止监控

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
