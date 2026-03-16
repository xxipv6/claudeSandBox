---
name: debugging
description: 系统化调试方法论，从症状到根因分析，适用于前端/后端问题调试
---

# 调试方法论

## 何时启用

- 用户报告 bug、错误或异常行为时
- 需要定位问题根因时
- 调试性能问题、内存泄漏等复杂问题时
- 代码行为不符合预期时

---

## 核心理念

调试不是随机尝试，而是**系统化的科学方法**。

---

## 调试循环

```
观察现象 → 形成假设 → 设计实验 → 验证假设 → 定位根因 → 实施修复
    ↑                                                    ↓
    └────────────────── 验证修复 ←────────────────────────┘
```

---

## 第一步：理解问题

### 信息收集

**必须回答的问题**：
- **What**: 什么错误？
- **When**: 什么时候发生的？
- **Where**: 在哪里发生的？
- **How**: 如何复现？

**收集的信息**：
```
1. 错误消息完整文本
2. 堆栈跟踪（stack trace）
3. 复现步骤
4. 预期行为 vs 实际行为
5. 最近的代码变更
6. 环境信息（OS、版本、配置）
```

### 复现问题

**最小化复现**：
```javascript
// ❌ 复杂场景
用户登录 → 浏览商品 → 加入购物车 → 结账 → 支付 → 错误

// ✅ 最小化复现
直接调用支付函数 → 错误
```

**复现脚本**：
```javascript
// 复现脚本
async function reproduce() {
  const user = await createUser();
  const result = await processPayment(user.id, 100);
  console.log(result); // 预期：成功，实际：失败
}
```

---

## 第二步：隔离变量

### 二分法

```javascript
// 注释代码，逐步缩小范围
function complexFunction() {
   // step1();
   // step2();
   step3(); // 如果还有问题，问题在 step3 或之后
   // step4();
}
```

### 控制变量

```javascript
// ❌ 多个变量同时改变
function test(data, config, env) {
   // 无法确定是哪个变量导致问题
}

// ✅ 逐个测试
test(data, defaultConfig, testEnv);
test(data, newConfig, testEnv);    // 只改变 config
test(data, newConfig, prodEnv);    // 只改变 env
```

---

## 第三步：形成假设

### 假设模板

**结构化假设**：
```
假设：[问题] 是由 [原因] 导致的

证据：
1. [观察到的现象]
2. [代码逻辑分析]
3. [时序关系]

预测：如果假设正确，那么 [预期结果]
```

### 假设类型

**1. 状态假设**
```
假设：变量 X 在某个时刻变成了错误的值
验证：添加日志，追踪 X 的值
```

**2. 控制流假设**
```
假设：代码执行了错误的分支
验证：添加日志，追踪执行路径
```

**3. 时序假设**
```
假设：事件 A 发生在事件 B 之前，但应该在之后
验证：添加时间戳日志
```

**4. 环境假设**
```
假设：只在特定环境（浏览器/OS）出现
验证：在不同环境测试
```

---

## 第四步：验证假设

### 设计实验

**好的实验**：
```javascript
// ✅ 单一变量，明确结果
if (hypothesis === 'null pointer') {
   // 添加 null 检查
   if (variable === null) {
      console.log('假设验证：变量为 null');
   }
}

// ✅ 可重复
for (let i = 0; i < 10; i++) {
   test(); // 每次都应该有相同结果
}
```

**不好的实验**：
```javascript
// ❌ 多个变量
if (hypothesis1 || hypothesis2 || hypothesis3) {
   // 无法确定是哪个
}

// ❌ 不可重复
test(); // 有时成功，有时失败
```

### 实验方法

**1. 日志法**
```javascript
console.log('Step 1:', variable1);
console.log('Step 2:', variable2);
console.log('Step 3:', variable3);
```

**2. 断点法**
```javascript
debugger; // 在浏览器/IDE 中暂停
const result = complexOperation();
```

**3. 断言法**
```javascript
console.assert(condition, 'Assertion failed');
```

**4. 对比法**
```javascript
// 对比工作版本 vs 不工作版本
const working = oldVersion(input);
const broken = newVersion(input);
console.log({ working, broken });
```

---

## 第五步：定位根因

### 5 Whys 方法

连续问 5 次为什么，找到根本原因：

```
问题：支付失败

Why 1? 因为支付 API 返回错误
Why 2? 因为 API 收到了无效的参数
Why 3? 因为参数格式错误
Why 4? 因为货币代码没有标准化
Why 5? 因为没有使用 ISO 4217 标准

根本原因：货币代码格式不统一
```

### 鱼骨图分析

```
问题：API 响应慢
        │
    人 ─┼─ 机 ─┼─ 料 ─┼─ 法 ─┼─ 环
         │         │         │
    开发人员   服务器配置   数据库大小
    代码逻辑   网络带宽   查询复杂度
```

---

## 第六步：实施修复

### 最小化修复

```javascript
// ❌ 大范围修改
function fix() {
   rewriteEverything(); // 风险高
}

// ✅ 最小化修复
function fix() {
   if (specificCondition) {
      return correctedValue; // 只修复问题点
   }
}
```

### 防御性编程

```javascript
// ✅ 添加边界检查
if (variable === null || variable === undefined) {
   throw new Error('Variable cannot be null');
}

// ✅ 添加类型检查
if (typeof variable !== 'string') {
   throw new TypeError('Expected string');
}

// ✅ 添加范围检查
if (index < 0 || index >= array.length) {
   throw new RangeError('Index out of bounds');
}
```

### 添加测试

```javascript
// ✅ 为修复添加测试
test('reproduces the bug', () => {
   // 复现问题的测试
   expect(() => reproduceBug()).toThrow();
});

test('fixes the bug', () => {
   // 验证修复的测试
   expect(fixedVersion()).not.toThrow();
});
```

---

## 常见调试模式

### 模式 1：二分法调试

```javascript
function debugBinarySearch(arr, target) {
   let left = 0;
   let right = arr.length - 1;

   // 添加日志追踪
   console.log('Start:', { left, right, target });

   while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      console.log('Mid:', mid, 'Value:', arr[mid]);

      if (arr[mid] === target) {
         return mid;
      }

      if (arr[mid] < target) {
         left = mid + 1;
      } else {
         right = mid - 1;
      }

      console.log('Updated:', { left, right });
   }

   return -1;
}
```

### 模式 2：状态追踪

```javascript
class StateTracker {
   constructor() {
      this.states = [];
   }

   transition(from, to, event) {
      const transition = { from, to, event, time: Date.now() };
      this.states.push(transition);
      console.log('State transition:', transition);

      // 检查非法转换
      if (!this.isValidTransition(from, to)) {
         console.error('Invalid state transition!', transition);
      }
   }

   isValidTransition(from, to) {
      // 定义合法的状态转换
      const validTransitions = {
         'logged_in': ['making_payment', 'viewing_profile'],
         'making_payment': ['payment_success', 'payment_failed'],
         // ...
      };

      return validTransitions[from]?.includes(to);
   }
}
```

### 模式 3：性能分析

```javascript
// 性能测量
function measurePerformance() {
   const start = performance.now();

   // 执行操作
   doSomething();

   const end = performance.now();
   const duration = end - start;

   console.log(`Operation took ${duration}ms`);

   if (duration > 1000) {
      console.warn('Performance issue detected!');
   }
}
```

### 模式 4：内存泄漏检测

```javascript
// 内存泄漏检测
function detectMemoryLeaks() {
   const initial = performance.memory.usedJSHeapSize;

   // 执行操作
   doOperation();

   const final = performance.memory.usedJSHeapSize;
   const leaked = final - initial;

   if (leaked > 1024 * 1024) { // 1MB
      console.warn('Possible memory leak!');
   }
}
```

---

## 调试工具

### Node.js

```bash
# 启用调试
node --inspect app.js

# Chrome DevTools
chrome://inspect

# 日志调试
DEBUG=* node app.js
```

### 浏览器

```javascript
// Console
console.log();
console.error();
console.table();
console.trace();

// Debugger
debugger;

// Performance
performance.now();
performance.mark();
```

### Git Bisect

```bash
# 二分查找引入问题的提交
git bisect start
git bisect bad HEAD     # 当前版本有问题
git bisect good <commit> # 之前版本正常
git bisect run          # 自动二分
```

---

## 防止调试

### 代码审查

- 复杂逻辑需要注释
- 边界条件需要检查
- 错误处理需要完善

### 类型检查

```javascript
// TypeScript
function processUser(user: User): Result {
   // 编译时检查
}
```

### 单元测试

```javascript
test('handles edge cases', () => {
   expect(handleNull(null)).toBe(defaultValue);
   expect(handleEmpty([])).toBe(defaultValue);
   expect(handleNegative(-1)).toThrow();
});
```

### 日志策略

```javascript
// 分级日志
console.debug('详细调试信息'); // 开发环境
console.info('一般信息');
console.warn('警告信息');
console.error('错误信息'); // 生产环境
```

---

## 调试检查清单

开始调试前，确认：

- [ ] 能够复现问题
- [ ] 有完整的错误信息
- [ ] 理解预期行为
- [ ] 知道最近的变更
- [ ] 有测试用例
- [ ] 有版本控制（可以回退）

调试过程中：

- [ ] 一次只改一个变量
- [ ] 记录每个尝试
- [ ] 验证假设
- [ ] 保留复现脚本

调试完成后：

- [ ] 添加测试用例
- [ ] 更新文档
- [ ] 代码审查
- [ ] 提交修复
