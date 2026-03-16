---
description: 代码审查清单和最佳实践
disable-model-invocation: false
---

# 代码审查

## 审查目标

1. **发现缺陷** - 找出潜在的 bug
2. **保证质量** - 确保代码符合标准
3. **知识共享** - 团队成员互相学习
4. **维护性** - 确保代码易于维护

---

## 审查流程

### 第一步：理解变更

**审查前检查**：
```
1. 变更目的是什么？
2. 影响哪些模块？
3. 是否有相关 Issue 或 PR？
4. 测试覆盖是否充分？
```

### 第二步：审查代码

**阅读顺序**：
```
1. 先看测试（了解预期行为）
2. 再看实现（理解如何实现）
3. 最后看文档（检查是否一致）
```

### 第三步：提供反馈

**反馈原则**：
- 具体明确（指出具体行和问题）
- 解释原因（为什么这样更好）
- 提供建议（如何改进）
- 保持尊重（对事不对人）

---

## 审查维度

### 1. 功能性

**检查项**：
```javascript
// ✅ 代码实现了预期功能
// ✅ 边界情况处理正确
// ✅ 错误处理完善
// ✅ 逻辑清晰易懂
```

**常见问题**：
- [ ] 空指针异常
- [ ] 数组越界
- [ ] 类型错误
- [ ] 逻辑错误
- [ ] 缺少错误处理

**示例**：
```javascript
// ❌ 缺少边界检查
function getFirst(arr) {
   return arr[0]; // 可能为 undefined
}

// ✅ 正确处理
function getFirst(arr) {
   if (!arr || arr.length === 0) {
      return undefined;
   }
   return arr[0];
}
```

### 2. 安全性

**检查项**：
```javascript
// ✅ 输入验证
// ✅ 输出编码
// ✅ 认证/授权
// ✅ 敏感数据保护
// ✅ 依赖安全
```

**常见问题**：
- [ ] SQL 注入
- [ ] XSS 漏洞
- [ ] CSRF 保护
- [ ] 硬编码密钥
- [ ] 不安全的随机数

**示例**：
```javascript
// ❌ SQL 注入风险
const query = `SELECT * FROM users WHERE id = ${userId}`;
db.query(query);

// ✅ 参数化查询
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);
```

### 3. 性能

**检查项**：
```javascript
// ✅ 算法复杂度合理
// ✅ 无明显性能瓶颈
// ✅ 资源使用合理
// ✅ 缓存策略得当
```

**常见问题**：
- [ ] N+1 查询
- [ ] 不必要的循环
- [ ] 内存泄漏
- [ ] 阻塞操作
- [ ] 重复计算

**示例**：
```javascript
// ❌ N+1 查询
for (const user of users) {
   const orders = db.query('SELECT * FROM orders WHERE user_id = ?', [user.id]);
   // 每个用户一次查询
}

// ✅ 批量查询
const userIds = users.map(u => u.id);
const orders = db.query('SELECT * FROM orders WHERE user_id IN (?)', [userIds]);
// 一次查询获取所有订单
```

### 4. 可读性

**检查项**：
```javascript
// ✅ 命名清晰
// ✅ 代码组织良好
// ✅ 注释适当
// ✅ 遵循项目规范
```

**常见问题**：
- [ ] 命名不清晰
- [ ] 函数过长
- [ ] 嵌套过深
- [ ] 缺少注释
- [ ] 魔法数字

**示例**：
```javascript
// ❌ 命名不清晰
function calc(d, t) {
   return d * t * 0.08;
}

// ✅ 命名清晰
function calculateTax(amount, days) {
   const TAX_RATE = 0.08;
   return amount * days * TAX_RATE;
}
```

### 5. 可维护性

**检查项**：
```javascript
// ✅ 模块化设计
// ✅ 耦合度低
// ✅ 易于测试
// ✅ 易于扩展
```

**常见问题**：
- [ ] 代码重复
- [ ] 耦合度高
- [ ] 难以测试
- [ ] 缺少抽象
- [ ] 硬编码配置

**示例**：
```javascript
// ❌ 代码重复
function validateUser(user) {
   if (!user.name || user.name.length < 2) return false;
   if (!user.email || !user.email.includes('@')) return false;
   return true;
}

function validateAdmin(admin) {
   if (!admin.name || admin.name.length < 2) return false;
   if (!admin.email || !admin.email.includes('@')) return false;
   return true;
}

// ✅ 提取公共逻辑
function validatePerson(person) {
   if (!person.name || person.name.length < 2) return false;
   if (!person.email || !person.email.includes('@')) return false;
   return true;
}

function validateUser(user) {
   return validatePerson(user);
}

function validateAdmin(admin) {
   return validatePerson(admin) && admin.role === 'admin';
}
```

### 6. 测试

**检查项**：
```javascript
// ✅ 有测试覆盖
// ✅ 测试用例充分
// ✅ 边界测试
// ✅ 错误测试
```

**常见问题**：
- [ ] 缺少测试
- [ ] 测试覆盖不足
- [ ] 只测试正常路径
- [ ] 测试脆弱

**示例**：
```javascript
// ❌ 只测试正常路径
test('adds two numbers', () => {
   expect(add(1, 2)).toBe(3);
});

// ✅ 测试边界情况
test('adds two numbers', () => {
   expect(add(1, 2)).toBe(3);
   expect(add(-1, 1)).toBe(0);      // 边界
   expect(add(0, 0)).toBe(0);        // 边界
   expect(add(Infinity, 1)).toBe(Infinity); // 特殊值
});

// ✅ 测试错误情况
test('throws on invalid input', () => {
   expect(() => add('a', 'b')).toThrow();
   expect(() => add(null, 1)).toThrow();
});
```

---

## 审查清单

### 快速检查（5 分钟）

- [ ] 代码能运行吗？
- [ ] 测试通过吗？
- [ ] 有明显的问题吗？
- [ ] 命名清晰吗？
- [ ] 有安全风险吗？

### 详细审查（30 分钟）

**功能**：
- [ ] 实现符合需求
- [ ] 边界情况处理
- [ ] 错误处理完善

**安全**：
- [ ] 输入验证
- [ ] 输出编码
- [ ] 认证/授权
- [ ] 无敏感信息泄露

**性能**：
- [ ] 无明显性能问题
- [ ] 资源使用合理
- [ ] 无内存泄漏

**代码质量**：
- [ ] 命名清晰
- [ ] 逻辑简洁
- [ ] 适度注释
- [ ] 遵循规范

**测试**：
- [ ] 覆盖充分
- [ ] 包含边界测试
- [ ] 包含错误测试

**文档**：
- [ ] API 文档更新
- [ ] README 更新
- [ ] 注释充分

---

## 反馈模板

### 问题报告

```markdown
### 问题：[简短描述]

**位置**：`file:line`
**严重性**：[必须修复 / 建议改进 / 可选]

**问题描述**：
[具体说明问题]

**影响**：
[这个问题的影响]

**建议**：
[如何改进]

**示例**：
```diff
- old code
+ new code
```

**参考**：
[相关文档或规范]
```

### 正面反馈

```markdown
### 做得好 👍

**位置**：`file:line`

**说明**：
[具体说明哪里做得好]

**原因**：
[为什么这是好的做法]
```

---

## 审查技巧

### 1. 关注重要问题

优先级：
1. 🔴 **必须修复** - 安全漏洞、功能缺陷
2. 🟡 **应该改进** - 性能问题、代码质量
3. 🟢 **可以优化** - 风格、最佳实践

### 2. 解释"为什么"

```javascript
// ❌ 不好
"这样写不对。"

// ✅ 好
"这样写可能导致 SQL 注入。建议使用参数化查询，因为..."
```

### 3. 提供示例

```javascript
// ❌ 只指出问题
"函数太长了。"

// ✅ 提供建议
"函数太长了，建议拆分为更小的函数。例如：
```javascript
function processOrder(order) {
   validateOrder(order);
   calculateTotal(order);
   saveOrder(order);
}
```
"
```

### 4. 保持尊重

- 对事不对人
- 建设性批评
- 认可好的代码
- 讨论而非命令

---

## 常见问题模式

### 模式 1：边界检查

```javascript
// ❌ 缺少边界检查
function getItem(arr, index) {
   return arr[index];
}

// ✅ 正确处理
function getItem(arr, index) {
   if (index < 0 || index >= arr.length) {
      throw new Error('Index out of bounds');
   }
   return arr[index];
}
```

### 模式 2：错误处理

```javascript
// ❌ 吞掉错误
try {
   doSomething();
} catch (e) {
   // 什么都不做
}

// ✅ 正确处理
try {
   doSomething();
} catch (e) {
   console.error('Operation failed:', e);
   // 适当的错误处理
   throw e; // 或者恢复
}
```

### 模式 3：资源清理

```javascript
// ❌ 没有清理
function processFile(path) {
   const file = openFile(path);
   // 处理文件
   // 忘记关闭文件
}

// ✅ 正确清理
function processFile(path) {
   const file = openFile(path);
   try {
      // 处理文件
   } finally {
      file.close();
   }
}
```

### 模式 4：异步处理

```javascript
// ❌ 忘记 await
async function fetchData() {
   const result = fetch(url); // 忘记 await
   return result.data; // undefined
}

// ✅ 正确处理
async function fetchData() {
   const result = await fetch(url);
   return result.data;
}
```

---

## 审查工具

### 自动化工具

```bash
# ESLint
npm run lint

# 类型检查
npm run type-check

# 测试
npm test

# 覆盖率
npm run test:coverage

# 复杂度检查
npm run complexity
```

### 代码指标

- 圈复杂度（Cyclomatic Complexity）< 10
- 代码行数（Lines of Code）< 50/函数
- 参数个数（Parameters）< 5
- 嵌套深度（Nesting Depth）< 4
