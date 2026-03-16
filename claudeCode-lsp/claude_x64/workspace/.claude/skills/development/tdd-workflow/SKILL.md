---
name: tdd-workflow
description: 测试驱动开发（TDD）工作流和最佳实践，RED→GREEN→IMPROVE 循环，确保 80%+ 测试覆盖率
---

# 测试驱动开发（TDD）

## 何时启用

- 用户请求实现新功能或修复 bug 时
- dev-coder agent 调用时
- 需要编写或修改代码时
- 强调测试优先的开发场景时

---

## TDD 循环

```
┌─────────┐
│  RED    │  Write a failing test
└────┬────┘
     │
     ↓
┌─────────┐
│  GREEN  │  Make it pass
└────┬────┘
     │
     ↓
┌─────────┐
│ IMPROVE │  Refactor
└────┬────┘
     │
     └──→ back to RED
```

---

## 第一步：RED（编写失败的测试）

### 编写测试的时机

**先写测试，后写代码**：

```javascript
// ❌ 错误：先写代码
function add(a, b) {
   return a + b;
}
test('adds two numbers', () => {
   expect(add(1, 2)).toBe(3);
});

// ✅ 正确：先写测试
test('adds two numbers', () => {
   expect(add(1, 2)).toBe(3);
});
// 此时还没有 add 函数，测试会失败

// 然后编写最简单的实现使测试通过
function add(a, b) {
   return a + b;
}
```

### 测试命名

**描述性命名**：
```javascript
// ✅ 好的命名
test('should return user when valid ID is provided', () => {
   // ...
});

test('should throw error when user not found', () => {
   // ...
});

// ❌ 不好的命名
test('test1', () => {
   // ...
});
```

### 测试结构（AAA 模式）

```javascript
test('calculates total price', () => {
   // Arrange - 准备测试数据
   const cart = new Cart();
   cart.addItem(new Item('Book', 10));
   cart.addItem(new Item('Pen', 5));

   // Act - 执行被测试的操作
   const total = cart.calculateTotal();

   // Assert - 验证结果
   expect(total).toBe(15);
});
```

---

## 第二步：GREEN（使测试通过）

### 最简实现

**编写最简单的代码使测试通过**：

```javascript
// 测试
test('returns zero for empty cart', () => {
   const cart = new Cart();
   expect(cart.calculateTotal()).toBe(0);
});

// ❌ 过度设计
class Cart {
   calculateTotal() {
      // 复杂的实现
      if (this.items.length === 0) {
         return 0;
      }
      // ...
   }
}

// ✅ 最简实现
class Cart {
   calculateTotal() {
      return 0; // 只是为了通过测试
   }
}
```

### 快速通过

**目标是通过测试，不是完美实现**：

```javascript
// 测试
test('adds item to cart', () => {
   const cart = new Cart();
   const item = new Item('Book', 10);
   cart.addItem(item);
   expect(cart.items).toContain(item);
});

// 最简实现
class Cart {
   constructor() {
      this.items = [];
   }

   addItem(item) {
      this.items.push(item); // 简单但有效
   }
}
```

---

## 第三步：IMPROVE（重构）

### 重构原则

**在测试保护下重构**：

```javascript
// 测试保护着重构
test('calculates total with discount', () => {
   const cart = new Cart();
   cart.addItem(new Item('Book', 100));
   cart.applyDiscount(0.1); // 10% 折扣
   expect(cart.calculateTotal()).toBe(90);
});

// 重构前
class Cart {
   applyDiscount(percent) {
      this.total = this.calculateTotal();
      this.total = this.total * (1 - percent);
   }

   calculateTotal() {
      return this.total;
   }
}

// 重构后（更清晰）
class Cart {
   applyDiscount(percent) {
      this.discount = percent;
   }

   calculateTotal() {
      const total = this.items.reduce((sum, item) => sum + item.price, 0);
      return this.discount ? total * (1 - this.discount) : total;
   }
}
```

### 重构技巧

**1. 提取方法**：
```javascript
// 重构前
function processUser(user) {
   if (!user.name || user.name.length < 2) {
      return false;
   }
   if (!user.email || !user.email.includes('@')) {
      return false;
   }
   return true;
}

// 重构后
function processUser(user) {
   return validateName(user.name) && validateEmail(user.email);
}

function validateName(name) {
   return name && name.length >= 2;
}

function validateEmail(email) {
   return email && email.includes('@');
}
```

**2. 提取类**：
```javascript
// 重构前
class User {
   constructor(name, email) {
      this.name = name;
      this.email = email;
      this.createdAt = new Date();
   }

   isValid() {
      return this.name && this.email.includes('@');
   }

   getDisplayName() {
      return this.name.split('@')[0];
   }
}

// 重构后
class User {
   constructor(name, email, validator = new EmailValidator()) {
      this.name = name;
      this.email = email;
      this.createdAt = new Date();
      this.validator = validator;
   }

   isValid() {
      return this.name && this.validator.isValid(this.email);
   }

   getDisplayName() {
      return new DisplayNameFormatter(this.name).format();
   }
}
```

**3. 引入参数**：
```javascript
// 重构前
function calculatePrice(items) {
   const taxRate = 0.08; // 硬编码
   const subtotal = items.reduce((sum, item) => sum + item.price, 0);
   return subtotal * (1 + taxRate);
}

// 重构后
function calculatePrice(items, taxRate = 0.08) {
   const subtotal = items.reduce((sum, item) => sum + item.price, 0);
   return subtotal * (1 + taxRate);
}
```

---

## 测试覆盖

### 测试类型

**1. 单元测试**：
```javascript
test('Item calculates price with tax', () => {
   const item = new Item('Book', 100, 0.08);
   expect(item.getPriceWithTax()).toBe(108);
});
```

**2. 集成测试**：
```javascript
test('Cart calculates total with multiple items', () => {
   const cart = new Cart();
   cart.addItem(new Item('Book', 100));
   cart.addItem(new Item('Pen', 50));
   expect(cart.calculateTotal()).toBe(150);
});
```

**3. 端到端测试**：
```javascript
test('User can add items to cart and checkout', async () => {
   const page = await browser.newPage();
   await page.goto('/shop');
   await page.click('#item-1');
   await page.click('#checkout');
   expect(await page.textContent('#total')).toBe('100');
});
```

### 测试边界

```javascript
describe('Array operations', () => {
   test('handles empty array', () => {
      expect(getFirst([])).toBeUndefined();
   });

   test('handles single element', () => {
      expect(getFirst([1])).toBe(1);
   });

   test('handles negative index', () => {
      expect(() => getAt([1, 2, 3], -1)).toThrow();
   });

   test('handles out of bounds', () => {
      expect(() => getAt([1, 2, 3], 10)).toThrow();
   });
});
```

### 测试错误情况

```javascript
test('throws on invalid input', () => {
   expect(() => divide(1, 0)).toThrow('Cannot divide by zero');
   expect(() => parseJson('invalid')).toThrow('Invalid JSON');
   expect(() => createUser(null)).toThrow('Name cannot be null');
});
```

---

## TDD 最佳实践

### 1. 小步快跑

```javascript
// ✅ 一次只写一个测试
test('adds two numbers', () => {
   expect(add(1, 2)).toBe(3);
});

// ✅ 实现最简单的代码
function add(a, b) {
   return a + b;
}

// ✅ 写下一个测试
test('handles negative numbers', () => {
   expect(add(-1, 2)).toBe(1);
});

// ✅ 重构或扩展
function add(a, b) {
   return a + b; // 已经正确处理
}
```

### 2. 测试行为，不是实现

```javascript
// ❌ 测试实现细节
test('uses Array.filter', () => {
   const spy = jest.spyOn(Array.prototype, 'filter');
   filterEven([1, 2, 3, 4]);
   expect(spy).toHaveBeenCalled();
});

// ✅ 测试行为
test('returns only even numbers', () => {
   expect(filterEven([1, 2, 3, 4])).toEqual([2, 4]);
});
```

### 3. 一个测试一个概念

```javascript
// ❌ 测试多个概念
test('user validation', () => {
   expect(validateName('Alice')).toBe(true);
   expect(validateEmail('alice@example.com')).toBe(true);
   expect(validateAge(25)).toBe(true);
});

// ✅ 每个测试一个概念
test('validates name correctly', () => {
   expect(validateName('Alice')).toBe(true);
});

test('validates email correctly', () => {
   expect(validateEmail('alice@example.com')).toBe(true);
});

test('validates age correctly', () => {
   expect(validateAge(25)).toBe(true);
});
```

### 4. 使用描述性的断言

```javascript
// ❌ 不清晰
expect(result).toBeTruthy();
expect(items.length).toBe(3);

// ✅ 清晰
expect(result).toBe(true);
expect(items).toHaveLength(3);
expect(items).toEqual([1, 2, 3]);
```

### 5. 避免测试依赖

```javascript
// ❌ 测试有依赖
test('test 1', () => {
   global.counter = 1;
   expect(global.counter).toBe(1);
});

test('test 2', () => {
   // 依赖 test 1 执行
   expect(global.counter).toBe(1);
});

// ✅ 测试独立
test('test 1', () => {
   const counter = new Counter();
   counter.increment();
   expect(counter.value).toBe(1);
});

test('test 2', () => {
   const counter = new Counter(); // 新实例
   expect(counter.value).toBe(0); // 不受影响
});
```

---

## TDD 工作流示例

### 示例：实现用户认证

#### 第 1 轮：基本认证

```javascript
// RED: 写失败的测试
test('authenticates user with correct credentials', () => {
   const auth = new AuthService();
   const result = auth.login('alice', 'password123');
   expect(result.success).toBe(true);
});

// GREEN: 最简实现
class AuthService {
   login(username, password) {
      return { success: true }; // 硬编码
   }
}

// IMPROVE: 实现逻辑
class AuthService {
   login(username, password) {
      const user = this.findUser(username);
      if (!user) return { success: false };
      if (user.password !== password) return { success: false };
      return { success: true };
   }

   findUser(username) {
      // 查找用户
   }
}
```

#### 第 2 轮：错误处理

```javascript
// RED: 添加错误测试
test('throws on empty username', () => {
   const auth = new AuthService();
   expect(() => auth.login('', 'password')).toThrow('Username cannot be empty');
});

// GREEN: 添加验证
class AuthService {
   login(username, password) {
      if (!username) throw new Error('Username cannot be empty');
      // ...
   }
}
```

#### 第 3 轮：密码哈希

```javascript
// RED: 测试密码哈希
test('authenticates with hashed password', () => {
   const auth = new AuthService();
   const user = auth.register('alice', 'password123');
   const result = auth.login('alice', 'password123');
   expect(result.success).toBe(true);
});

// GREEN: 实现哈希
class AuthService {
   register(username, password) {
      const hashedPassword = bcrypt.hash(password, 10);
      return { username, password: hashedPassword };
   }

   login(username, password) {
      const user = this.findUser(username);
      const isValid = bcrypt.compare(password, user.password);
      return { success: isValid };
   }
}
```

---

## 测试覆盖率目标

### 覆盖率指标

```bash
# 行覆盖率
Lines Covered: 85%

# 分支覆盖率
Branches Covered: 80%

# 函数覆盖率
Functions Covered: 90%

# 语句覆盖率
Statements Covered: 85%
```

### 目标

- **单元测试**: 80%+ 覆盖率
- **关键路径**: 100% 覆盖率
- **边界情况**: 全部覆盖
- **错误处理**: 全部覆盖

---

## TDD 工具

### Jest

```bash
# 初始化
npm install --save-dev jest

# 运行测试
npx jest

# 监视模式
npx jest --watch

# 覆盖率
npx jest --coverage
```

### 示例配置

```javascript
// jest.config.js
module.exports = {
   testEnvironment: 'node',
   collectCoverageFrom: [
      'src/**/*.js',
      '!src/**/*.test.js',
      '!src/**/*.spec.js'
   ],
   coverageThreshold: {
      global: {
         lines: 80,
         branches: 80,
         functions: 80,
         statements: 80
      }
   }
};
```

---

## TDD 检查清单

开始编码前：
- [ ] 写好了失败的测试
- [ ] 理解了要实现的功能

编写代码时：
- [ ] 写最简单的实现
- [ ] 快速通过测试
- [ ] 不担心完美

重构时：
- [ ] 测试全部通过
- [ ] 代码更清晰
- [ ] 没有改变行为

提交代码前：
- [ ] 所有测试通过
- [ ] 达到覆盖率目标
- [ ] 代码审查通过
