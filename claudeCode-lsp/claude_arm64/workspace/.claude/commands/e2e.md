---
description: 生成和运行前端 E2E 功能测试，使用 Playwright
---

# E2E 功能测试

## 何时使用

- 测试完整的用户流程
- 验证前端到后端的集成
- 测试多页面交互
- 测试复杂表单流程

**注意**：安全测试请使用 `/security-audit` 或 `/vuln-scan`

---

## 测试类型

### 1. 用户流程测试

```bash
/e2e "测试用户注册和登录流程"
```

**测试内容**：
- 注册新用户
- 邮箱验证
- 首次登录
- 完善个人信息

### 2. 购物流程测试

```bash
/e2e "测试购物车完整流程"
```

**测试内容**：
- 浏览商品
- 添加到购物车
- 修改数量
- 结账支付

### 3. 表单流程测试

```bash
/e2e "测试多步骤表单"
```

**测试内容**：
- 表单验证
- 步骤导航
- 数据保存
- 提交成功

---

## 执行流程

### 第一步：理解需求

**明确测试目标**：
- 要测试什么功能流程？
- 涉及哪些页面？
- 需要什么测试数据？
- 关键验证点是什么？

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

## 功能测试场景

### 1. 用户注册流程

```javascript
test('用户注册完整流程', async ({ page }) => {
  // 访问注册页
  await page.goto('/register');

  // 填写注册表单
  await page.fill('#username', 'newuser');
  await page.fill('#email', 'newuser@example.com');
  await page.fill('#password', 'password123');
  await page.fill('#confirm-password', 'password123');

  // 同意条款
  await page.check('#terms');

  // 提交表单
  await page.click('button[type="submit"]');

  // 验证：显示成功消息
  await expect(page.locator('.success-message')).toHaveText('注册成功');

  // 验证：跳转到登录页
  await expect(page).toHaveURL('/login');
});
```

### 2. 购物车流程

```javascript
test('购物车完整流程', async ({ page }) => {
  // 浏览商品
  await page.goto('/products');
  await page.click('[data-testid="product-1"]');

  // 添加到购物车
  await page.click('button:has-text("Add to Cart")');

  // 验证：购物车数量更新
  await expect(page.locator('.cart-count')).toHaveText('1');

  // 继续购物
  await page.goto('/products');
  await page.click('[data-testid="product-2"]');
  await page.click('button:has-text("Add to Cart")');

  // 验证：购物车数量更新
  await expect(page.locator('.cart-count')).toHaveText('2');

  // 查看购物车
  await page.click('[data-testid="cart-icon"]');

  // 验证：购物车有 2 个商品
  await expect(page.locator('.cart-item')).toHaveCount(2);

  // 修改数量
  await page.fill('.cart-item:first-child .quantity', '3');

  // 验证：总价更新
  const totalPrice = await page.locator('.total-price').textContent();
  expect(totalPrice).toContain('更新后的价格');
});
```

### 3. 多步骤表单

```javascript
test('多步骤表单流程', async ({ page }) => {
  await page.goto('/checkout');

  // 第一步：收货地址
  await page.fill('#shipping-name', 'John Doe');
  await page.fill('#shipping-address', '123 Main St');
  await page.fill('#shipping-city', 'New York');
  await page.fill('#shipping-zip', '10001');

  // 点击下一步
  await page.click('button:has-text("Next")');

  // 验证：进入第二步
  await expect(page.locator('.step-2')).toBeVisible();

  // 第二步：支付方式
  await page.click('input[value="credit-card"]');
  await page.fill('#card-number', '4111111111111111');
  await page.fill('#card-expiry', '12/25');
  await page.fill('#card-cvc', '123');

  // 点击下一步
  await page.click('button:has-text("Next")');

  // 验证：进入第三步（确认）
  await expect(page.locator('.step-3')).toBeVisible();

  // 验证：显示所有信息
  await expect(page.locator('.summary-name')).toHaveText('John Doe');
  await expect(page.locator('.summary-address')).toHaveText('123 Main St');

  // 提交订单
  await page.click('button:has-text("Place Order")');

  // 验证：显示成功页面
  await expect(page).toHaveURL('/order-success');
  await expect(page.locator('.order-id')).toBeVisible();
});
```

### 4. 搜索和过滤

```javascript
test('搜索和过滤功能', async ({ page }) => {
  await page.goto('/products');

  // 搜索商品
  await page.fill('#search', 'iPhone');
  await page.click('button:has-text("Search")');

  // 验证：搜索结果
  await expect(page.locator('.product-item')).toHaveCountGreaterThan(0);

  // 应用过滤器
  await page.selectOption('#sort', 'price-asc');

  // 验证：排序正确
  const prices = await page.locator('.product-price').allTextContents();
  const sortedPrices = [...prices].sort();
  expect(prices).toEqual(sortedPrices);

  // 应用分类过滤
  await page.click('input[name="category"][value="electronics"]');

  // 验证：过滤结果
  await expect(page.locator('.product-category')).toHaveText('Electronics');
});
```

### 5. 用户设置

```javascript
test('用户设置流程', async ({ page }) => {
  // 登录
  await login(page, 'testuser', 'password123');

  // 进入设置页面
  await page.goto('/settings');

  // 修改个人信息
  await page.click('tab:has-text("Profile")');
  await page.fill('#display-name', 'New Name');
  await page.fill('#bio', 'This is my bio');

  // 保存
  await page.click('button:has-text("Save")');

  // 验证：保存成功
  await expect(page.locator('.toast-success')).toHaveText('保存成功');

  // 修改密码
  await page.click('tab:has-text("Security")');
  await page.fill('#current-password', 'password123');
  await page.fill('#new-password', 'newpassword123');
  await page.fill('#confirm-password', 'newpassword123');

  // 保存
  await page.click('button:has-text("Update Password")');

  // 验证：密码更新成功
  await expect(page.locator('.toast-success')).toHaveText('密码已更新');

  // 退出登录
  await page.click('#logout-button');

  // 使用新密码登录
  await page.goto('/login');
  await page.fill('#username', 'testuser');
  await page.fill('#password', 'newpassword123');
  await page.click('button[type="submit"]');

  // 验证：登录成功
  await expect(page).toHaveURL('/dashboard');
});
```

---

## 使用示例

### 示例 1：测试用户注册

```bash
/e2e "测试用户注册完整流程"
```

**生成测试**：
```javascript
test('用户注册流程', async ({ page }) => {
  await page.goto('/register');
  await page.fill('#username', 'newuser');
  await page.fill('#email', 'newuser@example.com');
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/login');
});
```

### 示例 2：测试订单流程

```bash
/e2e "测试从浏览到下单的完整流程"
```

**生成测试**：
```javascript
test('订单完整流程', async ({ page }) => {
  // 浏览商品
  await page.goto('/products');
  await page.click('[data-testid="product-1"]');

  // 添加到购物车
  await page.click('button:has-text("Add to Cart")');

  // 结账
  await page.click('[data-testid="cart-icon"]');
  await page.click('button:has-text("Checkout")');

  // 填写信息
  await page.fill('#shipping-name', 'John Doe');
  await page.fill('#shipping-address', '123 Main St');

  // 提交订单
  await page.click('button:has-text("Place Order")');

  // 验证成功
  await expect(page.locator('.success-message')).toBeVisible();
});
```

### 示例 3：测试数据更新

```bash
/e2e "测试用户资料更新流程"
```

**生成测试**：
```javascript
test('资料更新流程', async ({ page }) => {
  // 登录
  await login(page, 'testuser', 'password123');

  // 进入设置
  await page.goto('/settings');

  // 修改资料
  await page.fill('#display-name', 'New Name');
  await page.click('button:has-text("Save")');

  // 验证更新
  await expect(page.locator('.toast-success')).toHaveText('保存成功');

  // 验证显示
  await page.goto('/profile');
  await expect(page.locator('.user-name')).toHaveText('New Name');
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
  await expect(page).toHaveURL('/dashboard');
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
  "newUser": {
    "username": "newuser",
    "password": "password123",
    "email": "new@example.com"
  }
}

// 测试中使用
const { validUser, newUser } = require('./test-data/users.json');

test('使用测试数据登录', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login(validUser.username, validUser.password);
  await expect(page).toHaveURL('/dashboard');
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
6. **功能测试**：本命令专注于功能测试，安全测试请使用 `/security-audit`
