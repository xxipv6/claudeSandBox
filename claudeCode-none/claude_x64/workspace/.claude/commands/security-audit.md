---
description: 执行 Web 应用白盒安全审计（8 阶段流程）
---

# 安全审计

## 审计目标

系统性识别 Web 应用中的：
- 漏洞（SQL 注入、XSS、CSRF 等）
- 越权（水平、垂直、状态联动）
- 逻辑缺陷（状态机绕过）
- 跨接口联动风险

---

## 使用方式

```bash
# 审计整个项目
/security-audit

# 审计特定模块
/security-audit src/auth/

# 审计 API
/security-audit api/
```

---

## 审计流程（8 阶段）

### 第一步：加载白盒审计技能

```
读取：.claude/skills/security/whitebox-audit/
```

### 第二步：系统执行模型与信任边界建模

**目标**：明确请求如何进入系统、在哪些地方被信任或放行

**审计要点**：
- 外部入口：HTTP API、RPC、MQ
- 信任边界：用户 → Web → 内部服务
- 输出：执行路径图

### 第三步：依赖与框架层白盒分析

**目标**：识别危险能力是否被引入并暴露

**重点关注**：
- 反序列化（JSON、XML）
- 表达式解析（SpEL、OGNL）
- 动态执行（脚本、反射）
- 网络能力（SSRF）

### 第四步：请求执行链还原

**目标**：还原请求从入口到副作用的完整链路

**审计要点**：
- Filter / Middleware 顺序
- Interceptor / Hook 覆盖
- AOP / 注解完整性
- 安全逻辑执行顺序

### 第五步：路由全量枚举与能力分类

**目标**：明确系统对外暴露的全部能力

**审计要点**：
- 枚举所有路由
- 标注权限要求
- 识别管理接口
- 识别 Debug 路由

### 第六步：控制器与业务流程级白盒审计

**目标**：识别输入 → 校验 → 状态 → 副作用的完整链路

**审计要点**：
- 输入来源
- 校验位置和完整性
- 状态改变
- 副作用

### 第七步：越权专项审计（主线）

**这是最重要的审计环节**

**审计内容**：
- 权限模型梳理
- 权限控制点枚举
- 路由级越权
- 资源级越权（高发）
- 状态 + 权限联动
- 跨接口越权组合

### 第八步：状态机与跨路由联动分析

**目标**：识别业务状态被滥用的可能性

**审计要点**：
- 列出关键状态字段
- 标注创建/修改/依赖接口
- 检查状态转换是否受限

### 第九步：攻击路径建模与验证

**目标**：将发现的问题串联成可利用的攻击路径

**验证步骤**：
- 假设：我是最低权限用户
- 构造：合法请求序列、参数
- 确认：是否真实可利用、业务影响

---

## 输出格式

### 审计报告结构

```markdown
## Web 白盒安全审计报告

### 审计范围
- 目标：src/auth/
- 框架：Express.js
- 审计时间：2024-xx-xx

### 执行摘要
- 发现漏洞：X 个高危，Y 个中危，Z 个低危
- 主要风险：越权、逻辑缺陷

### 详细发现

#### 1. [高危] 水平越权 - GET /api/users/:id

**位置**：
- 文件：src/controllers/UserController.js
- 函数：getUser
- 行号：45-50

**触发路径**：
```
1. 用户 A 登录
2. 请求：GET /api/users/2（用户 B 的 ID）
3. 控制器：UserController.getUser()
4. Service：UserService.findById(2)
5. DAO：SELECT * FROM users WHERE id = 2
6. 响应：返回用户 B 的数据
```

**代码片段**：
```javascript
app.get('/api/users/:id', async (req, res) => {
  const userId = req.params.id;
  // 风险：没有检查 userId 是否属于当前用户
  const user = await User.findById(userId);
  res.json(user);
});
```

**业务影响**：
- 任意用户可以查看其他用户信息
- 敏感数据泄露（邮箱、手机号）

**修复建议**：
```javascript
app.get('/api/users/:id', async (req, res) => {
  const requestedId = req.params.id;
  const currentUserId = req.session.userId;

  // 添加所有权检查
  if (requestedId !== currentUserId && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const user = await User.findById(requestedId);
  res.json(user);
});
```

---

### 修复优先级

#### 立即修复（高危）
1. 水平越权 - GET /api/users/:id
2. 垂直越权 - DELETE /api/users/:id
3. SQL 注入 - POST /api/search

#### 计划修复（中危）
1. 状态机绕过 - PUT /api/orders/:id/status
2. 信息泄露 - GET /api/debug/info

#### 最佳实践（低危）
1. 缺少日志记录
2. 缺少速率限制

---

## 审计原则

1. **不只找"漏洞点"，而是还原真实执行模型**
2. **不只看"有没有校验"，而是看校验是否完整、是否可组合**
3. **不只看"单接口"，而是看跨接口、跨状态联动**
4. **越权作为独立主线贯穿全流程**

---

## 注意事项

- 完整审计需要较长时间（取决于项目规模）
- 建议在测试环境执行
- 审计过程中需要代码访问权限
- 遵循负责任的披露原则

---

## 二进制审计

**二进制文件审计请直接使用**：
```
.claude/skills/security/binary-reverse/
```

该 Skill 基于 IDA MCP 进行二进制逆向安全分析，包含完整的 8 阶段流程。

---

## 与其他命令的区别

- `/security-audit` - Web 白盒安全审计
- `/code-review` - 代码审查（6 维度，包含安全性）
- `/debug` - 调试问题（从症状到根因）

**使用建议**：
- 安全研究 → `/security-audit` 或 `binary-reverse` Skill
- 日常开发 → `/code-review`
- 问题排查 → `/debug`
