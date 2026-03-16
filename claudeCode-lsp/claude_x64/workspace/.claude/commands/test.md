---
description: 运行测试，自动识别前端/后端并使用相应的测试工具
---

# 测试

## 自动识别：前端 vs 后端

在开始测试前，自动识别任务类型：

**前端任务特征**：
- 涉及浏览器、页面、UI 组件
- 提到"页面"、"按钮"、"表单"、"组件"、"样式"
- 提到"用户界面"、"交互"

**后端任务特征**：
- 涉及 API、数据库、服务器逻辑
- 提到"接口"、"查询"、"服务"、"后端"

---

## 前端测试（自动识别）

### 触发条件

当检测到以下情况时，自动使用前端测试：

```javascript
// 用户输入示例
"测试登录页面"
"运行前端测试"
"测试用户注册流程"
"测试购物车功能"
"测试 React 组件"
```

### 前端测试流程

#### 第一步：自动启动 Playwright

```bash
# 自动检查 Playwright 是否安装
if ! command -v npx &> /dev/null; then
  echo "Playwright 未安装，正在安装..."
  npm install -D @playwright/test
  npx playwright install
fi

# 自动启动测试服务器（如果需要）
if ! pgrep -x "npm run dev" > /dev/null; then
  echo "启动开发服务器..."
  npm run dev &
  sleep 5
fi
```

#### 第二步：加载 E2E 测试技能

```
读取：.claude/skills/testing/e2e-testing/
```

#### 第三步：生成或运行测试

```bash
# 自动检测测试文件
if [ -f "e2e/tests/*.spec.js" ]; then
  echo "发现现有 E2E 测试，正在运行..."
  npx playwright test
else
  echo "未发现测试文件，正在生成测试..."
  # 根据用户需求生成测试
fi
```

#### 第四步：使用 Playwright 调试

```bash
# 调试模式运行
npx playwright test --debug

# 慢动作模式（观察执行）
npx playwright test --headed --slow-mo=1000

# 生成 HTML 报告
npx playwright test --reporter=html
npx playwright show-report
```

---

## 后端测试（常规方法）

### 触发条件

```bash
# 用户输入示例
"测试 API 接口"
"运行单元测试"
"测试数据库查询"
"测试后端服务"
```

### 后端测试流程

#### 第一步：运行测试

```bash
# 自动检测测试框架
if [ -f "package.json" ]; then
  # 检测测试命令
  if grep -q '"test"' package.json; then
    echo "运行测试..."
    npm test
  elif grep -q '"jest"' package.json; then
    echo "运行 Jest 测试..."
    npx jest
  elif grep -q '"mocha"' package.json; then
    echo "运行 Mocha 测试..."
    npx mocha
  fi
fi
```

#### 第二步：查看测试覆盖率

```bash
# 运行测试覆盖率
if grep -q '"coverage"' package.json; then
  npm run test:coverage
else
  npx jest --coverage
fi
```

---

## 测试类型

### 前端测试（使用 Playwright）

**1. 功能测试**
```javascript
test('用户可以登录', async ({ page }) => {
  await page.goto('/login');
  await page.fill('#username', 'testuser');
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

**2. 安全测试**
```javascript
test('防止 SQL 注入', async ({ page }) => {
  await page.goto('/login');
  await page.fill('#username', "admin' OR '1'='1");
  await page.fill('#password', 'anything');
  await page.click('button[type="submit"]');
  await expect(page).not.toHaveURL('/dashboard');
});
```

**3. 性能测试**
```javascript
test('页面加载性能', async ({ page }) => {
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');

  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0];
    return navigation.loadEventEnd - navigation.fetchStart;
  });

  expect(metrics).toBeLessThan(3000);
});
```

### 后端测试（常规）

**1. 单元测试**
```javascript
test('应该返回用户对象', () => {
  const user = getUserById(1);
  expect(user).toBeDefined();
  expect(user.name).toBe('Alice');
});
```

**2. 集成测试**
```javascript
test('应该创建订单并返回', async () => {
  const order = await createOrder({
    userId: 1,
    items: [{ productId: 1, quantity: 2 }]
  });

  expect(order.id).toBeDefined();
  expect(order.status).toBe('pending');
});
```

**3. API 测试**
```javascript
test('POST /api/login 应该认证成功', async () => {
  const response = await request(app)
    .post('/api/login')
    .send({ username: 'test', password: 'password' });

  expect(response.status).toBe(200);
  expect(response.body.token).toBeDefined();
});
```

---

## 使用示例

### 示例 1：测试前端登录

```bash
/test "测试用户登录页面"
```

**自动执行**：
```
✅ 识别为前端任务
✅ 启动 Playwright
✅ 加载 E2E 测试技能
✅ 运行测试
```

### 示例 2：测试 API

```bash
/test "测试用户登录 API"
```

**自动执行**：
```
✅ 识别为后端任务
✅ 运行 npm test
✅ 显示测试结果
```

### 示例 3：测试完整流程

```bash
/test "测试从登录到支付的完整流程"
```

**自动执行**：
```
✅ 包含前端和后端
✅ 先运行后端测试
✅ 再运行前端 E2E 测试
```

---

## 智能检测逻辑

### 检测规则

```javascript
// 前端关键词
const frontendKeywords = [
  '页面', '按钮', '表单', '组件', '样式', 'UI', '界面',
  'browser', 'frontend', 'React', 'Vue', 'Angular',
  'DOM', 'HTML', 'CSS', 'JavaScript'
];

// 后端关键词
const backendKeywords = [
  'API', '接口', '数据库', '服务', '后端', 'backend',
  '查询', '存储', '业务逻辑', '单元测试'
];

// 自动判断
function detectTaskType(userInput) {
  const frontendScore = frontendKeywords.filter(k =>
    userInput.toLowerCase().includes(k.toLowerCase())
  ).length;

  const backendScore = backendKeywords.filter(k =>
    userInput.toLowerCase().includes(k.toLowerCase())
  ).length;

  if (frontendScore > backendScore) {
    return 'frontend';
  } else if (backendScore > frontendScore) {
    return 'backend';
  } else {
    return 'both';
  }
}
```

---

## 测试报告

### 前端测试报告

```bash
# 生成 HTML 报告
npx playwright test --reporter=html

# 生成 JSON 报告
npx playwright test --reporter=json > results.json

# 打开报告
npx playwright show-report
```

### 后端测试报告

```bash
# Jest 报告
npm test -- --coverage

# Mocha 报告
npm test -- --reporter json > results.json
```

---

## 调试测试

### 前端调试

```bash
# Playwright 调试模式
npx playwright test --debug

# 慢动作模式
npx playwright test --headed --slow-mo=1000

# 运行特定测试
npx playwright test tests/login.spec.js:15
```

### 后端调试

```bash
# Jest 调试
node --inspect-brk node_modules/.bin/jest --runInBand

# Mocha 调试
node --inspect-brk node_modules/.bin/mocha

# 查看日志
DEBUG=* npm test
```

---

## 注意事项

1. **自动识别**：系统会自动判断是前端还是后端任务
2. **Playwright 安装**：首次运行前端测试时会自动安装
3. **测试隔离**：每个测试应该独立，不依赖其他测试
4. **环境要求**：前端测试需要运行中的应用环境
5. **性能考虑**：E2E 测试较慢，只测试关键路径

---

## 测试检查清单

### 前端测试
- [ ] 页面加载正常
- [ ] 元素交互正常
- [ ] 表单提交正常
- [ ] 路由跳转正常
- [ ] 样式显示正确

### 后端测试
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] API 测试通过
- [ ] 测试覆盖率达标
- [ ] 无明显性能问题
