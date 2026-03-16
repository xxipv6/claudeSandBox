---
description: 运行功能测试，自动识别前端/后端并使用相应的测试工具
---

# 功能测试

## 测试目标

**功能测试**关注应用是否按预期工作：
- ✅ 逻辑是否正确
- ✅ 参数是否对齐
- ✅ 点击是否响应
- ✅ 接口是否返回正确数据
- ✅ 数据库操作是否正确

**注意**：安全测试请使用 `/security-audit` 或 `/vuln-scan`

---

## 自动识别：前端 vs 后端

在开始测试前，自动识别任务类型：

**前端任务特征**：
- 涉及浏览器、页面、UI 组件
- 提到"页面"、"按钮"、"表单"、"组件"、"样式"
- 提到"用户界面"、"交互"
- 测试：逻辑、参数、点击、导航

**后端任务特征**：
- 涉及 API、数据库、服务器逻辑
- 提到"接口"、"查询"、"服务"、"后端"
- 测试：业务逻辑、数据处理、API 返回

---

## 前端功能测试（自动识别）

### 触发条件

当检测到以下情况时，自动使用前端测试：

```javascript
// 用户输入示例
"测试登录页面"
"测试按钮点击是否正常"
"测试表单提交"
"测试页面跳转逻辑"
"测试 React 组件交互"
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

## 后端功能测试（常规方法）

### 触发条件

```bash
# 用户输入示例
"测试 API 接口"
"测试数据库查询"
"测试业务逻辑"
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

## 前端功能测试类型

### 1. 页面交互测试

```javascript
test('按钮点击正常', async ({ page }) => {
  await page.goto('/login');

  // 点击按钮
  await page.click('#login-button');

  // 验证：按钮有响应
  await expect(page.locator('.loading')).toBeVisible();
});

test('表单提交正常', async ({ page }) => {
  await page.goto('/register');

  // 填写表单
  await page.fill('#username', 'testuser');
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'password123');

  // 提交表单
  await page.click('button[type="submit"]');

  // 验证：跳转到成功页面
  await expect(page).toHaveURL('/success');
});
```

### 2. 逻辑测试

```javascript
test('表单验证逻辑', async ({ page }) => {
  await page.goto('/register');

  // 测试：邮箱格式验证
  await page.fill('#email', 'invalid-email');
  await page.click('#submit-button');

  // 验证：显示错误提示
  await expect(page.locator('.error')).toHaveText('Invalid email format');
});

test('页面跳转逻辑', async ({ page }) => {
  await page.goto('/home');

  // 点击导航链接
  await page.click('a[href="/about"]');

  // 验证：跳转到正确页面
  await expect(page).toHaveURL('/about');
  await expect(page.locator('h1')).toHaveText('About Us');
});
```

### 3. 参数对齐测试

```javascript
test('API 请求参数正确', async ({ page }) => {
  await page.goto('/login');

  // 监听 API 请求
  let requestData;
  page.on('request', request => {
    if (request.url().includes('/api/login')) {
      requestData = request.postData();
    }
  });

  // 提交表单
  await page.fill('#username', 'testuser');
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');

  // 验证：参数正确传递
  expect(requestData).toContain('username=testuser');
  expect(requestData).toContain('password=password123');
});

test('查询参数正确传递', async ({ page }) => {
  // 访问带参数的 URL
  await page.goto('/search?q=test&page=1');

  // 验证：参数正确显示
  await expect(page.locator('#search-query')).toHaveValue('test');
  await expect(page.locator('.current-page')).toHaveText('1');
});
```

### 4. 状态管理测试

```javascript
test('组件状态更新', async ({ page }) => {
  await page.goto('/counter');

  // 初始状态
  await expect(page.locator('#count')).toHaveText('0');

  // 点击增加
  await page.click('#increment');

  // 验证：状态更新
  await expect(page.locator('#count')).toHaveText('1');
});

test('购物车状态', async ({ page }) => {
  await page.goto('/products');

  // 添加商品
  await page.click('[data-testid="add-to-cart-1"]');

  // 验证：购物车数量更新
  await expect(page.locator('.cart-count')).toHaveText('1');

  // 查看购物车
  await page.click('.cart-icon');

  // 验证：商品在购物车中
  await expect(page.locator('.cart-item')).toHaveCount(1);
});
```

---

## 后端功能测试类型

### 1. 单元测试

```javascript
test('应该返回用户对象', () => {
  const user = getUserById(1);
  expect(user).toBeDefined();
  expect(user.name).toBe('Alice');
  expect(user.email).toBe('alice@example.com');
});

test('应该计算订单总价', () => {
  const order = {
    items: [
      { price: 100, quantity: 2 },
      { price: 50, quantity: 1 }
    ]
  };

  const total = calculateOrderTotal(order);
  expect(total).toBe(250);
});
```

### 2. 集成测试

```javascript
test('应该创建订单并返回', async () => {
  const order = await createOrder({
    userId: 1,
    items: [{ productId: 1, quantity: 2 }]
  });

  expect(order.id).toBeDefined();
  expect(order.status).toBe('pending');
  expect(order.items).toHaveLength(1);
});

test('应该更新库存', async () => {
  // 创建订单
  await createOrder({ productId: 1, quantity: 5 });

  // 检查库存
  const product = await getProductById(1);
  expect(product.stock).toBe(originalStock - 5);
});
```

### 3. API 测试

```javascript
test('POST /api/login 应该返回 token', async () => {
  const response = await request(app)
    .post('/api/login')
    .send({ username: 'test', password: 'password' });

  expect(response.status).toBe(200);
  expect(response.body.token).toBeDefined();
  expect(response.body.user.username).toBe('test');
});

test('GET /api/users/:id 应该返回用户数据', async () => {
  const response = await request(app)
    .get('/api/users/1')
    .set('Authorization', `Bearer ${token}`);

  expect(response.status).toBe(200);
  expect(response.body.id).toBe(1);
  expect(response.body.name).toBeDefined();
});

test('API 应该正确处理分页参数', async () => {
  const response = await request(app)
    .get('/api/products')
    .query({ page: 1, limit: 10 });

  expect(response.status).toBe(200);
  expect(response.body.data).toHaveLength(10);
  expect(response.body.page).toBe(1);
  expect(response.body.total).toBeDefined();
});
```

### 4. 数据库测试

```javascript
test('应该正确插入数据', async () => {
  const user = await db.users.create({
    username: 'testuser',
    email: 'test@example.com'
  });

  expect(user.id).toBeDefined();
  expect(user.username).toBe('testuser');
});

test('应该正确查询数据', async () => {
  const users = await db.users.findAll({
    where: { status: 'active' }
  });

  expect(users.length).toBeGreaterThan(0);
  expect(users[0].status).toBe('active');
});

test('应该正确更新数据', async () => {
  await db.users.update(1, { status: 'inactive' });

  const user = await db.users.findById(1);
  expect(user.status).toBe('inactive');
});
```

---

## 使用示例

### 示例 1：测试前端登录功能

```bash
/test "测试登录按钮点击是否正常"
```

**自动执行**：
```
✅ 识别为前端任务
✅ 启动 Playwright
✅ 加载 E2E 测试技能
✅ 运行测试
```

**生成测试**：
```javascript
test('登录按钮点击正常', async ({ page }) => {
  await page.goto('/login');
  await page.fill('#username', 'testuser');
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

### 示例 2：测试后端 API

```bash
/test "测试用户登录 API 返回数据是否正确"
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
  '点击', '跳转', '导航', '交互',
  'browser', 'frontend', 'React', 'Vue', 'Angular',
  'DOM', 'HTML', 'CSS', 'JavaScript'
];

// 后端关键词
const backendKeywords = [
  'API', '接口', '数据库', '服务', '后端', 'backend',
  '查询', '存储', '业务逻辑',
  '单元测试', '集成测试'
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

1. **功能测试 vs 安全测试**：本命令专注于功能测试，安全测试请使用 `/security-audit`
2. **自动识别**：系统会自动判断是前端还是后端任务
3. **Playwright 安装**：首次运行前端测试时会自动安装
4. **测试隔离**：每个测试应该独立，不依赖其他测试
5. **环境要求**：前端测试需要运行中的应用环境
6. **性能考虑**：E2E 测试较慢，只测试关键路径

---

## 功能测试检查清单

### 前端功能测试
- [ ] 页面加载正常
- [ ] 按钮点击有响应
- [ ] 表单提交成功
- [ ] 参数正确传递
- [ ] 页面跳转正确
- [ ] 组件状态更新
- [ ] 样式显示正确

### 后端功能测试
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] API 返回正确数据
- [ ] 数据库操作正确
- [ ] 业务逻辑正确
- [ ] 测试覆盖率达标
- [ ] 无明显性能问题
