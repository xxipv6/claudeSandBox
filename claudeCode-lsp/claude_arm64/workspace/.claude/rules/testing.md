---
paths:
  - "**/*.test.{js,ts,py,go}"
---

# 测试规范

## 测试要求

### 覆盖率
- 单元测试覆盖率 > 80%
- 关键路径覆盖率 100%

### 测试类型
1. **单元测试** - 测试单个函数/类
2. **集成测试** - 测试模块间交互
3. **端到端测试** - 测试完整流程

## 测试编写

### 测试命名
- 描述清楚测试什么和期望结果
- 格式：`should [do something] when [condition]`

```javascript
test('should return user when valid ID is provided', () => {
  // ...
});

test('should throw error when user not found', () => {
  // ...
});
```

### 测试结构
使用 AAA 模式（Arrange-Act-Assert）：

```javascript
test('should calculate total price', () => {
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

### 测试隔离
- 每个测试独立运行
- 不依赖测试执行顺序
- 测试后清理状态

## 必须测试的场景

### 正常路径
- 预期输入的预期输出
- 边界值
- 典型用例

### 错误路径
- 无效输入
- 空值/Null
- 超出范围
- 网络错误
- 数据库错误

### 边界情况
- 空数组/空字符串
- 最小/最大值
- 零和负数
- 并发情况

## 测试数据

### 使用固定数据
- 不要使用随机数据
- 使用明确的测试数据
- 容易理解和维护

### Mock 外部依赖
- Mock 网络请求
- Mock 数据库
- Mock 文件系统

## 运行测试

### 本地开发
```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- --grep "should return user"

# 监视模式
npm test -- --watch
```

### 提交前
- 运行完整测试套件
- 确保所有测试通过
- 检查覆盖率

## 持续集成

- 每次 PR 运行测试
- 测试失败阻止合并
- 覆盖率报告可见
