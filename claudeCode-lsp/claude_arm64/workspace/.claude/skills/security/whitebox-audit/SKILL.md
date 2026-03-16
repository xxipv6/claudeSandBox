---
description: Web 应用白盒安全审计 - 完整 8 阶段流程
disable-model-invocation: false
---

# Web 白盒安全审计

## Skill 定位与适用范围

### Skill 名称
`Web_Whitebox_Security_Audit`

### 适用对象

- Web 应用（单体 / 微服务）
- REST API / BFF / 管理后台
- 框架不限（Spring / Django / Express / Gin 等）

### 审计目标

在白盒条件下，系统性识别 Web 应用中：
- 漏洞
- 越权
- 逻辑缺陷
- 状态联动风险

---

## 审计核心原则（Skill 设计约束）

1. **不只找"漏洞点"，而是还原真实执行模型**
2. **不只看"有没有校验"，而是看校验是否完整、是否可组合**
3. **不只看"单接口"，而是看跨接口、跨状态联动**
4. **越权作为独立主线贯穿全流程**

---

## 完整审计流程（标准 8 阶段）

### 1️⃣ 系统执行模型与信任边界建模

#### 目标
明确请求如何进入系统、在哪些地方被信任或放行。

#### 审计要点

**外部入口**：
- HTTP API
- RPC
- MQ / 定时任务

**信任边界**：
- 用户 → Web
- Web → 内部服务
- 服务 → 第三方

#### 输出
- 请求入口 → 业务代码的执行路径图
- 外部可控 vs 内部可信边界标注

#### 实施方法

```javascript
// 示例：识别入口点
app.post('/api/users', async (req, res) => {
  // 用户输入从这里进入
  const { username, role } = req.body;

  // 信任边界：username 和 role 是否被验证？
  const user = await createUser({ username, role });

  res.json(user);
});

// 风险：role 参数直接从用户输入获取，没有验证
```

**检查清单**：
- [ ] 列出所有外部入口（HTTP 端点、RPC 方法、消息队列）
- [ ] 标注每个入口的信任边界
- [ ] 识别哪些输入直接被信任使用
- [ ] 绘制执行路径图

---

### 2️⃣ 依赖与框架层白盒分析（SCA + 能力审计）

#### 目标
识别"危险能力"是否被引入并暴露给用户路径。

#### 重点关注

**反序列化**：
- JSON / XML / 自定义

**表达式解析**：
- SpEL / OGNL / 模板

**动态执行**：
- 脚本 / 反射 / 插件

**网络能力**：
- HTTP Client / SSRF

#### 审计问题

**不只是问**：
- 有没有 CVE？

**而是问**：
- 这些能力是否在用户可控路径上？

#### 实施方法

```javascript
// 示例：危险能力暴露
import express from 'express';
import { eval } from 'node:eval';

app.get('/execute', (req, res) => {
  const code = req.query.code;
  // 危险：用户可控的代码执行
  const result = eval(code);
  res.json({ result });
});

// 检查依赖中的危险能力
// package.json 中是否有：
// - eval-in-library
// - yaml (parse 可执行代码)
// - lodash < 4.17.21 (原型污染)
```

**检查清单**：
- [ ] 检查 package.json / pom.xml / requirements.txt
- [ ] 识别危险依赖版本
- [ ] 搜索危险函数：eval, exec, spawn, deserialize
- [ ] 检查这些函数是否在用户可控路径上
- [ ] 标记所有 SSRF 可能点（HTTP 请求）

---

### 3️⃣ 请求执行链还原（Filter / Interceptor / AOP）

#### 目标
还原一次请求从入口到业务副作用的完整执行链。

#### 审计要点

**Filter / Middleware 顺序**：
- 认证是否在授权之前？
- 日志是否在安全检查之后？

**Interceptor / Hook 是否全覆盖**：
- 是否有路由绕过了安全拦截器？

**AOP / 注解是否存在遗漏**：
- 注解是否只作用于接口，不作用于实现？

**安全逻辑执行顺序是否正确**：
- 验证 → 业务逻辑 是否正确？

#### 重点风险

- 某些路由绕过安全链
- 特殊 Method / Header 绕过
- 注解只作用于接口、不作用于实现

#### 输出

- 标准执行链
- 绕过 / 异常执行路径清单

#### 实施方法

```javascript
// 示例：执行链分析
// 1. 认证 Filter
app.use((req, res, next) => {
  if (req.path.startsWith('/public/')) {
    return next(); // 绕过认证
  }
  // 认证逻辑
  next();
});

// 2. 授权拦截器
app.use((req, res, next) => {
  if (req.user.isAdmin) {
    return next();
  }
  res.status(403).json({ error: 'Forbidden' });
});

// 3. 业务控制器
app.get('/admin/users', (req, res) => {
  // 风险：如果认证 Filter 被绕过，这里直接执行
  res.json(users);
});

// 检查：
// - /public/ 开头的路由是否真的不需要认证？
// - 是否有其他路径可以到达 /admin/users？
```

**检查清单**：
- [ ] 列出所有 Filter / Middleware
- [ ] 确认执行顺序
- [ ] 识别可能绕过安全链的路由
- [ ] 检查特殊 Method（OPTIONS、HEAD）
- [ ] 检查特殊 Header（X-Forwarded-For）
- [ ] 验证 AOP / 注解是否完整

---

### 4️⃣ 路由全量枚举与能力分类

#### 目标
明确系统对外暴露的全部能力。

#### 对每个路由标注

- 是否对外可访问
- 是否需要认证
- 是否有副作用（写操作）
- 权限敏感度（低 / 中 / 高）

#### 特别关注

- 管理接口
- Debug / Test 路由
- 同一路由不同 HTTP Method

#### 实施方法

```javascript
// 示例：路由枚举
const routes = [
  // 公开路由
  { path: '/public/home', auth: false, sensitive: 'low' },
  { path: '/api/login', auth: false, sensitive: 'medium' },

  // 认证路由
  { path: '/api/users/me', auth: true, sensitive: 'low' },

  // 管理路由
  { path: '/admin/users', auth: true, role: 'admin', sensitive: 'high' },

  // 危险：未预期的路由
  { path: '/debug/stacktrace', auth: false, sensitive: 'high' }, // 泄露信息
  { path: '/api/users/:id/delete', auth: true, sensitive: 'high' }, // 可能越权
];

// 检查：
// - 是否有未预期的路由暴露？
// - 管理接口是否真的需要？
// - 同一路由的不同 Method 是否都有正确的权限？
```

**检查清单**：
- [ ] 枚举所有路由（HTTP 端点、RPC 方法）
- [ ] 标注每个路由的认证要求
- [ ] 标注每个路由的权限要求
- [ ] 标注每个路由的敏感度
- [ ] 识别管理接口
- [ ] 识别 Debug / Test 路由
- [ ] 检查同一路由的不同 Method

---

### 5️⃣ 控制器与业务流程级白盒审计

#### 目标
识别输入 → 校验 → 状态 → 副作用的完整链路。

#### 对每个路由强制回答

- **输入来自哪里？**
- **校验在哪里？是否完整？**
- **状态在哪里改变？**
- **副作用是什么？**

#### 重点风险

- 校验不一致
- 校验依赖外部状态
- Service 层缺失校验

#### 实施方法

```javascript
// 示例：业务流程审计
app.put('/api/users/:id', async (req, res) => {
  // 1. 输入来源
  const userId = req.params.id;
  const { username, role, isAdmin } = req.body;

  // 2. 校验
  // 风险：只校验了 username，没有校验 role 和 isAdmin
  if (!username || username.length < 3) {
    return res.status(400).json({ error: 'Invalid username' });
  }

  // 3. 状态改变
  // 风险：直接从用户输入获取 role 和 isAdmin
  const user = await User.update(userId, {
    username,
    role,        // 未校验
    isAdmin      // 未校验
  });

  // 4. 副作用
  // 用户权限被提升，没有二次确认
  res.json(user);
});

// 问题：
// - 校验不完整（role、isAdmin 未校验）
// - 状态改变没有额外验证
// - 副作用危险（权限提升）
```

**检查清单**：
- [ ] 对每个路由追踪输入来源
- [ ] 确认校验位置和完整性
- [ ] 确认状态改变的位置
- [ ] 确认副作用的危险性
- [ ] 检查 Service 层是否有额外校验
- [ ] 检查校验是否依赖外部状态

---

### 6️⃣ 越权专项审计（主线）

这是**最重要的审计环节**，越权是最高发的 Web 漏洞。

#### 6.1 权限模型梳理

**明确**：
- 角色模型（RBAC / ABAC / 混合）
- 权限粒度（接口 / 资源 / 状态）

```javascript
// 示例：权限模型
const roles = {
  USER: ['read:own', 'update:own'],
  ADMIN: ['read:all', 'update:all', 'delete:all']
};

// 资源级权限
// - 用户只能访问自己的资源
// - 管理员可以访问所有资源
```

#### 6.2 权限控制点枚举

系统性查找：
- Filter / Interceptor
- AOP / 注解
- Controller 内判断
- Service 层校验
- DAO 层隐式权限（userId 过滤）

```javascript
// 示例：权限控制点
// 1. Filter 层
app.use((req, res, next) => {
  if (req.session.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
});

// 2. Controller 层
app.get('/api/users/:id', async (req, res) => {
  // 风险：Filter 只检查了角色，没有检查资源所有权
  const user = await User.findById(req.params.id);
  res.json(user);
});

// 3. Service 层
async function getUser(id) {
  // 风险：没有 userId 过滤
  return await User.findById(id);
}

// 4. DAO 层
const query = 'SELECT * FROM users WHERE id = ?';
// 风险：没有 WHERE userId = ? 条件
```

#### 6.3 路由级越权

**检查**：
- 是否缺认证
- 是否缺角色校验
- 是否默认放行

```javascript
// 示例：路由级越权
app.get('/api/admin/users', async (req, res) => {
  // 风险：没有检查用户是否为管理员
  const users = await User.findAll();
  res.json(users);
});

// 修复：
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});
```

#### 6.4 资源级越权（高发）

**重点参数**：
- `id` / `uid` / `resourceId`

**必须校验**：
- 资源是否存在
- 是否属于当前用户
- 当前用户是否有操作权限

```javascript
// 示例：资源级越权（水平越权）
app.get('/api/users/:id', async (req, res) => {
  const requestedId = req.params.id;
  const currentUserId = req.session.userId;

  // 风险：没有校验 requestedId 是否属于 currentUserId
  const user = await User.findById(requestedId);

  // 攻击：用户可以访问其他用户的信息
  // GET /api/users/2 （当前用户是 1）
  res.json(user);
});

// 修复：
app.get('/api/users/:id', async (req, res) => {
  const requestedId = req.params.id;
  const currentUserId = req.session.userId;

  // 校验资源所有权
  if (requestedId !== currentUserId && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const user = await User.findById(requestedId);
  res.json(user);
});
```

#### 6.5 状态 + 权限联动越权

**检查**：
- 权限是否依赖状态
- 状态是否可被低权限接口修改
- 状态与权限是否解耦

```javascript
// 示例：状态联动越权
// 用户状态：pending → active → suspended

// 1. 低权限接口：修改状态
app.put('/api/users/:id/status', async (req, res) => {
  // 风险：只检查了用户身份，没有检查状态修改的合法性
  const { status } = req.body;
  await User.update(req.params.id, { status });
  res.json({ success: true });
});

// 2. 高权限接口：删除用户（只检查状态）
app.delete('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);

  // 风险：只检查状态，不检查操作权限
  if (user.status === 'suspended') {
    // 攻击：先通过接口 1 将状态改为 suspended
    // 然后通过接口 2 删除用户
    return await User.delete(req.params.id);
  }

  res.json({ error: 'Cannot delete active user' });
});

// 修复：
app.delete('/api/users/:id', async (req, res) => {
  // 检查操作权限，而不只是状态
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  await User.delete(req.params.id);
  res.json({ success: true });
});
```

#### 6.6 跨接口越权组合

**典型模式**：
- A 创建资源（低权限）
- B 修改状态（校验不严）
- C 执行高权限操作（只看状态）

```javascript
// 示例：跨接口越权组合

// 步骤 1：创建订单（低权限接口）
app.post('/api/orders', async (req, res) => {
  // 用户可以创建订单
  const order = await Order.create({
    userId: req.session.userId,
    status: 'pending',
    items: req.body.items
  });
  res.json(order);
});

// 步骤 2：修改订单状态（校验不严）
app.put('/api/orders/:id/status', async (req, res) => {
  // 风险：没有检查是否为订单所有者
  const { status } = req.body;
  await Order.update(req.params.id, { status });
  res.json({ success: true });
});

// 步骤 3：确认订单（只检查状态）
app.post('/api/orders/:id/confirm', async (req, res) => {
  const order = await Order.findById(req.params.id);

  // 风险：只检查状态，不检查所有权
  if (order.status === 'pending') {
    // 攻击：
    // 1. 用户 A 创建订单 A
    // 2. 用户 B 通过接口 2 将订单 A 状态改为 pending
    // 3. 用户 B 通过接口 3 确认订单 A（支付）
    await Order.confirm(req.params.id);
    return res.json({ success: true });
  }

  res.json({ error: 'Order not pending' });
});

// 修复：每个接口都要检查所有权
app.put('/api/orders/:id/status', async (req, res) => {
  const order = await Order.findById(req.params.id);

  // 检查所有权
  if (order.userId !== req.session.userId && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  await Order.update(req.params.id, { req.body });
  res.json({ success: true });
});
```

#### 越权审计检查清单

- [ ] 明确权限模型（RBAC / ABAC）
- [ ] 枚举所有权限控制点
- [ ] 检查路由级权限（认证 + 角色）
- [ ] 检查资源级权限（id / uid 参数）
- [ ] 检查状态联动权限
- [ ] 检查跨接口组合权限
- [ ] 验证 DAO 层是否有 userId 过滤

---

### 7️⃣ 状态机与跨路由联动分析

#### 目标
识别业务状态被滥用的可能性。

#### 审计要点

**列出所有关键状态字段**：
- 用户状态（active / suspended / deleted）
- 订单状态（pending / paid / shipped / delivered）
- 资源状态（draft / published / archived）

**标注**：
- 创建接口
- 修改接口
- 依赖接口

**打乱设计者预期调用顺序**

#### 实施方法

```javascript
// 示例：订单状态机
const orderStates = {
  CREATED: 'created',
  PAID: 'paid',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// 正常流程：
// CREATED → PAID → SHIPPED → DELIVERED

// 问题接口：
// 1. 直接设置状态（绕过支付）
app.put('/api/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  // 风险：可以直接设置任何状态
  await Order.update(req.params.id, { status });
  res.json({ success: true });
});

// 攻击：
// 1. 创建订单（CREATED）
// 2. 直接修改状态为 SHIPPED（绕过支付）
// 3. 获得商品

// 修复：
app.put('/api/orders/:id/status', async (req, res) => {
  const order = await Order.findById(req.params.id);

  // 检查状态转换是否合法
  const validTransitions = {
    [orderStates.CREATED]: [orderStates.PAID, orderStates.CANCELLED],
    [orderStates.PAID]: [orderStates.SHIPPED, orderStates.CANCELLED],
    [orderStates.SHIPPED]: [orderStates.DELIVERED],
    [orderStates.DELIVERED]: [],
    [orderStates.CANCELLED]: []
  };

  const allowedStates = validTransitions[order.status];
  if (!allowedStates.includes(req.body.status)) {
    return res.status(400).json({ error: 'Invalid state transition' });
  }

  await Order.update(req.params.id, { status: req.body.status });
  res.json({ success: true });
});
```

**检查清单**：
- [ ] 列出所有关键状态字段
- [ ] 绘制状态机图
- [ ] 识别所有状态修改接口
- [ ] 检查状态转换是否受限
- [ ] 测试异常状态转换
- [ ] 检查状态是否影响权限

---

### 8️⃣ 攻击路径建模与验证

#### 目标
将前面发现的问题串联成可利用的攻击路径。

#### 假设

我是最低权限用户

#### 构造

- 合法请求序列
- 合法参数
- 非预期结果

#### 确认

- 是否真实可利用
- 是否影响业务安全

#### 实施方法

```javascript
// 示例：攻击路径建模

// 攻击目标：删除任意用户

// 路径 1：直接越权
// 1. GET /api/users/1 （查看用户）
//    → 失败：需要认证

// 2. POST /api/login （登录）
//    → 成功：获得 token

// 3. DELETE /api/users/2 （删除其他用户）
//    → 成功：没有检查资源所有权
//    → 漏洞：水平越权

// 路径 2：状态联动
// 1. POST /api/orders （创建订单）
//    → 成功：订单状态为 created

// 2. PUT /api/orders/1/status （修改状态）
//    Body: { "status": "shipped" }
//    → 成功：可以直接设置状态

// 3. POST /api/orders/1/confirm （确认收货）
//    → 成功：不需要支付
//    → 漏洞：逻辑缺陷

// 验证攻击：
// - 使用最小权限用户
// - 执行攻击路径
// - 确认可以利用
// - 评估业务影响
```

**攻击路径模板**：

```markdown
## 攻击路径：[漏洞名称]

### 前置条件
- 用户角色：普通用户
- 已认证：是
- 其他条件：

### 攻击步骤

#### 步骤 1：[操作名称]
```bash
# 请求
METHOD /path
Headers: ...
Body: ...

# 响应
Status: 200
Body: ...
```

#### 步骤 2：[操作名称]
...

#### 步骤 3：[操作名称]
...

### 预期结果
- 正常情况：...

### 实际结果
- 攻击成功：...

### 业务影响
- 影响：...
- 严重程度：高/中/低
```

**检查清单**：
- [ ] 选择最小权限用户
- [ ] 构造完整攻击路径
- [ ] 验证每一步的可行性
- [ ] 确认业务影响
- [ ] 评估修复优先级

---

## 漏洞输出标准（Skill 输出格式）

每个问题至少包含：

### 1. 基本信息
- **漏洞类型**：如水平越权 / 垂直越权 / 逻辑缺陷 / SQL 注入
- **风险等级**：高 / 中 / 低
- **影响范围**：受影响的接口、用户、数据

### 2. 触发路径
- **接口序列**：A → B → C
- **执行链说明**：详细的代码执行路径
- **状态变化说明**：状态如何改变

### 3. 漏洞详情
```markdown
## [漏洞类型]

### 位置
文件：src/auth/login.js
函数：login
行号：45-50

### 代码片段
```javascript
const userId = req.params.id;
const user = await User.findById(userId);
// 风险：没有检查所有权
```

### 执行链
1. 用户请求：GET /api/users/2
2. 路由匹配：app.get('/api/users/:id')
3. 控制器：UsersController.getUser()
4. Service：UserService.findById()
5. DAO：SELECT * FROM users WHERE id = 2
6. 响应：返回用户数据

### 状态变化
- 请求前：用户无权限访问
- 请求后：获取到其他用户数据

### 业务影响
- 水平越权：用户可以查看其他用户信息
- 数据泄露：敏感信息泄露
```

### 4. 修复建议（原则级）

**短期修复**：
```javascript
// 添加所有权检查
if (userId !== req.session.userId && !req.user.isAdmin) {
  return res.status(403).json({ error: 'Forbidden' });
}
```

**长期改进**：
- 实施统一的权限框架
- 添加审计日志
- 实施最小权限原则

---

## 常见白盒"假安全"模式（重点识别）

### 1. 只在 Controller 校验

**问题**：Service 可被复用绕过

```javascript
// Controller 层有校验
app.get('/api/users/:id', async (req, res) => {
  const userId = req.params.id;
  const currentUserId = req.session.userId;

  if (userId !== currentUserId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const user = await UserService.getUser(userId);
  res.json(user);
});

// Service 层没有校验（可被其他地方复用）
async function getUser(id) {
  return await User.findById(id);
}

// 攻击：如果有其他入口直接调用 UserService
```

**修复**：Service 层也必须校验

### 2. 只校验角色，不校验资源

**问题**：垂直权限检查了，水平权限没检查

```javascript
app.delete('/api/users/:id', async (req, res) => {
  // 只检查了角色，没有检查资源所有权
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // 管理员可以删除任意用户（包括其他管理员）
  await User.delete(req.params.id);
  res.json({ success: true });
});

// 修复：管理员不能删除其他管理员
if (req.user.role !== 'ADMIN') {
  return res.status(403).json({ error: 'Forbidden' });
}

const targetUser = await User.findById(req.params.id);
if (targetUser.role === 'ADMIN' && targetUser.id !== req.user.id) {
  return res.status(403).json({ error: 'Cannot delete other admin' });
}
```

### 3. 异常路径无权限校验

**问题**：try-catch 绕过了权限检查

```javascript
app.get('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // 权限检查
    if (userId !== req.session.userId) {
      throw new Error('Forbidden');
    }

    const user = await User.findById(userId);
    res.json(user);
  } catch (error) {
    // 异常处理：绕过权限检查
    if (error.message === 'User not found') {
      // 风险：泄露信息
      return res.status(404).json({ error: 'User not found' });
    }

    // 其他异常直接返回成功
    res.json({ error: 'Something went wrong' });
  }
});
```

### 4. 批量接口只校验第一个元素

**问题**：批量操作只检查第一个

```javascript
app.post('/api/users/batch-delete', async (req, res) => {
  const { userIds } = req.body;

  // 只校验第一个
  const firstUser = await User.findById(userIds[0]);
  if (firstUser.userId !== req.session.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // 后续都没有校验
  for (const userId of userIds) {
    await User.delete(userId);
  }

  res.json({ success: true });
});

// 修复：每个元素都要校验
for (const userId of userIds) {
  const user = await User.findById(userId);
  if (user.userId !== req.session.userId && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  await User.delete(userId);
}
```

### 5. 使用 `!=` 而不是 `!==`

**问题**：类型转换绕过

```javascript
// 错误：使用 !=
if (userId != req.session.userId) {
  return res.status(403).json({ error: 'Forbidden' });
}

// 攻击：
// userId = "1"
// req.session.userId = 1
// "1" != 1 → false (类型转换)

// 修复：使用 ===
if (userId !== req.session.userId) {
  return res.status(403).json({ error: 'Forbidden' });
}
```

---

## Skill 总结

本 Skill 用于 **Web 应用白盒安全审计**，通过：

1. **执行模型还原** - 理解系统如何处理请求
2. **权限主线分析** - 系统性检查越权漏洞
3. **状态机建模** - 识别状态滥用风险
4. **攻击路径验证** - 确认漏洞可利用性

**识别**：
- 漏洞（注入、XSS 等）
- 越权（水平、垂直、状态联动）
- 逻辑缺陷（状态机绕过）
- 跨接口联动风险

**输出**：
- 完整的审计报告
- 每个漏洞的攻击路径
- 修复建议（原则级）

---

## 审计检查清单（总结）

### 第 1 阶段：执行模型
- [ ] 列出所有外部入口
- [ ] 标注信任边界
- [ ] 绘制执行路径图

### 第 2 阶段：依赖分析
- [ ] 检查危险依赖
- [ ] 识别危险函数
- [ ] 确认是否在用户路径上

### 第 3 阶段：执行链
- [ ] 列出所有 Filter / Middleware
- [ ] 确认执行顺序
- [ ] 识别绕过点

### 第 4 阶段：路由枚举
- [ ] 枚举所有路由
- [ ] 标注权限要求
- [ ] 识别危险路由

### 第 5 阶段：业务流程
- [ ] 追踪输入来源
- [ ] 确认校验完整性
- [ ] 识别状态改变

### 第 6 阶段：越权审计（重点）
- [ ] 权限模型梳理
- [ ] 控制点枚举
- [ ] 路由级越权检查
- [ ] 资源级越权检查
- [ ] 状态联动检查
- [ ] 跨接口组合检查

### 第 7 阶段：状态机
- [ ] 列出关键状态
- [ ] 绘制状态转换图
- [ ] 检查转换限制

### 第 8 阶段：攻击验证
- [ ] 构造攻击路径
- [ ] 验证可行性
- [ ] 评估影响

---

**审计原则**：

> 不只找"漏洞点"，而是还原真实执行模型
> 不只看"有没有校验"，而是看校验是否完整
> 不只看"单接口"，而是看跨接口联动
> 越权作为独立主线贯穿全流程
