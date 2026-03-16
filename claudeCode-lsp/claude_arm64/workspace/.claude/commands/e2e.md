---
description: 生成和运行 E2E 测试，使用 Playwright
---

# E2E 测试

## 何时使用

- 测试完整的用户流程
- 验证前端到后端的集成
- 测试认证和授权流程
- 安全相关的端到端测试

---

## 测试类型

### 1. 流程测试

```bash
/e2e "测试用户注册和登录流程"
```

**测试内容**：
- 注册新用户
- 邮箱验证
- 首次登录
- 完善个人信息

### 2. 安全测试

```bash
/e2e "测试登录安全（SQL 注入、暴力破解）"
```

**测试内容**：
- SQL 注入防护
- 暴力破解防护
- 会话固定防护
- CSRF 防护

### 3. 性能测试

```bash
/e2e "测试页面加载性能"
```

**测试内容**：
- 页面加载时间
- API 响应时间
- 资源加载优化

---

## 执行流程

### 第一步：理解需求

**明确测试目标**：
- 要测试什么功能？
- 涉及哪些页面？
- 需要什么测试数据？
- 有哪些安全考虑？

### 第二步：生成测试

**使用 Playwright 生成测试**：

```javascript
// 测试文件：e2e/tests/login.spec.js
const { test, expect } = require('@playwright/test');

test('用户登录流程', async ({ page }) => {
  // 访问登录页
  await page.goto('/login');

  // 输入用户名和密码
  await page.fill('#username', 'testuser');
  await page.fill('#password', 'password123');

  // 点击登录按钮
  await page.click('button[type="submit"]');

  // 验证：重定向到 dashboard
  await expect(page).toHaveURL('/dashboard');

  // 验证：显示用户名
  await expect(page.locator('.user-name')).toHaveText('testuser');
});
```

### 第三步：运行测试

```bash
# 安装依赖（首次运行）
npm install -D @playwright/test
npx playwright install

# 运行测试
npx playwright test

# 调试模式
npx playwright test --debug

# 慢动作模式（观察执行过程）
npx playwright test --headed --slow-mo=1000
```

### 第四步：查看报告

```bash
# 生成 HTML 报告
npx playwright test --reporter=html

# 打开报告
npx playwright show-report
```

---

## 安全测试场景

### 认证安全

```javascript
test('密码错误次数限制', async ({ page }) => {
  await page.goto('/login');

  // 尝试 5 次错误登录
  for (let i = 0; i < 5; i++) {
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');
  }

  // 第 6 次应该被锁定
  await page.fill('#username', 'testuser');
  await page.fill('#password', 'wrongpassword');
  await page.click('button[type="submit"]');

  await expect(page.locator('.error')).toHaveText('Account locked');
});
```

### 输入验证

```javascript
test('表单防止 XSS', async ({ page }) => {
  await page.goto('/search');

  // 尝试 XSS 攻击
  await page.fill('#search', '<script>alert("XSS")</script>');
  await page.click('button[type="submit"]');

  // 验证：脚本不应该执行
  await expect(page.locator('body')).not.toContainText('XSS');
});
```

### 权限验证

```javascript
test('普通用户无法访问管理员页面', async ({ page }) => {
  // 普通用户登录
  await login(page, 'normaluser', 'password123');

  // 尝试访问管理员页面
  await page.goto('/admin');

  // 验证：被拒绝访问
  await expect(page).toHaveURL('/403');
});
```

---

## 使用示例

### 示例 1：测试购物车流程

```bash
/e2e "测试购物车完整流程"
```

**生成测试**：
```javascript
test('购物车流程', async ({ page }) => {
  // 浏览商品
  await page.goto('/products');
  await page.click('[data-testid="product-1"]');
  await page.click('button:has-text("Add to Cart")');

  // 查看购物车
  await page.click('[data-testid="cart-icon"]');
  await expect(page.locator('.cart-item')).toHaveCount(1);

  // 结账
  await page.click('button:has-text("Checkout")');
  await page.fill('#shipping-name', 'John Doe');
  await page.fill('#shipping-address', '123 Main St');
  await page.click('button:has-text("Place Order")');

  // 验证订单成功
  await expect(page.locator('.success-message')).toBeVisible();
});
```

### 示例 2：测试支付安全

```bash
/e2e "测试支付页面的安全性"
```

**生成测试**：
```javascript
test('支付页面安全', async ({ page }) => {
  await page.goto('/checkout');

  // 验证使用 HTTPS
  const url = page.url();
  expect(url).toStartWith('https://');

  // 验证没有硬编码的敏感信息
  const html = await page.content();
  expect(html).not.toContain('api_key');
  expect(html).not.toContain('secret');

  // 验证 CSRF token 存在
  const csrfToken = await page.locator('input[name="csrf_token"]').inputValue();
  expect(csrfToken).toBeTruthy();
});
```

### 示例 3：测试 API 安全

```bash
/e2e "测试 API 端点的安全性"
```

**生成测试**：
```javascript
test('API 安全测试', async ({ page, request }) => {
  // 测试未授权访问
  const response = await request.get('/api/admin/users', {
    headers: {
      'Authorization': ''
    }
  });

  expect(response.status()).toBe(401);
});
```

---

## 页面对象模式

```javascript
// pages/BasePage.js
class BasePage {
  constructor(page) {
    this.page = page;
  }

  async goto(path) {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  async screenshot(name) {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }
}

// pages/LoginPage.js
class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.locator('button[type="submit"]');
  }

  async login(username, password) {
    await this.goto('/login');
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await this.page.waitForURL('/dashboard');
  }
}

// 测试中使用
test('用户登录', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login('testuser', 'password123');
});
```

---

## 测试数据

```javascript
// test-data/users.json
{
  "validUser": {
    "username": "testuser",
    "password": "password123",
    "email": "test@example.com"
  },
  "adminUser": {
    "username": "admin",
    "password": "admin123",
    "email": "admin@example.com"
  }
}

// 测试中使用
const { validUser } = require('./test-data/users.json');

test('使用测试数据登录', async ({ page }) => {
  await login(page, validUser.username, validUser.password);
});
```

---

## 失败处理

```javascript
test('失败时截图', async ({ page }) => {
  try {
    await page.goto('/risky-page');
    await page.click('#risky-button');
  } catch (error) {
    // 失败时截图
    await page.screenshot({
      path: `screenshots/failure-${Date.now()}.png`,
      fullPage: true
    });

    // 失败时保存视频
    await page.close();
    throw error;
  }
});
```

---

## CI/CD 集成

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

---

## 注意事项

1. **测试环境**：E2E 测试需要运行在完整的应用环境中
2. **测试数据**：使用专门的测试数据，避免污染生产数据
3. **测试隔离**：每个测试应该独立，不依赖其他测试
4. **性能考虑**：E2E 测试较慢，只测试关键路径
5. **维护成本**：E2E 测试维护成本较高，需要精心设计
