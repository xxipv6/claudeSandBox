---
name: e2e-testing
description: E2E 测试方法论，使用 Playwright 进行端到端测试
disable-model-invocation: false
---

# E2E 测试（End-to-End Testing）

## 何时启用

- 用户请求 E2E 测试或端到端测试时
- 执行 /e2e 命令时
- 需要验证完整用户流程时
- 需要进行安全相关的端到端验证时
- 测试认证、授权、CSRF 等安全场景时

---

## 核心理念

E2E 测试验证整个应用流程从前端到后端的完整性，特别关注**安全相关的用户旅程**。

---

## Playwright 基础

### 安装

```bash
# 安装 Playwright
npm install -D @playwright/test

# 安装浏览器
npx playwright install
```

### 配置

```javascript
// playwright.config.js
module.exports = {
  testDir: './e2e/tests',
  timeout: 10000,
  retries: 2,
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
};
```

---

## E2E 测试策略

### 1. 安全关键路径

**认证流程**：
```javascript
test('用户登录流程', async ({ page }) => {
  // 访问登录页
  await page.goto('/login');

  // 输入凭据
  await page.fill('#username', 'testuser');
  await page.fill('#password', 'password123');

  // 提交表单
  await page.click('button[type="submit"]');

  // 验证：应该重定向到 dashboard
  await expect(page).toHaveURL('/dashboard');

  // 验证：应该显示用户名
  await expect(page.locator('.user-name')).toHaveText('testuser');
});
```

**会话管理**：
```javascript
test('会话超时后需要重新认证', async ({ page }) => {
  // 登录
  await login(page, 'testuser', 'password123');

  // 等待会话过期
  await page.waitForTimeout(3600000); // 1小时

  // 尝试访问受保护页面
  await page.goto('/dashboard');

  // 验证：应该重定向到登录页
  await expect(page).toHaveURL('/login');
});
```

### 2. 输入验证测试

**SQL 注入防护**：
```javascript
test('登录表单防止 SQL 注入', async ({ page }) => {
  await page.goto('/login');

  // 尝试 SQL 注入
  await page.fill('#username, "admin' OR '1'='1");
  await page.fill('#password', 'anything');

  await page.click('button[type="submit"]');

  // 验证：不应该登录成功
  await expect(page).not.toHaveURL('/dashboard');

  // 验证：应该显示错误消息
  await expect(page.locator('.error')).toHaveText('Invalid credentials');
});
```

**XSS 防护**：
```javascript
test('搜索功能防止 XSS', async ({ page }) => {
  await page.goto('/search');

  // 尝试 XSS 攻击
  const xssPayload = '<script>alert("XSS")</script>';
  await page.fill('#search', xssPayload);

  await page.click('button[type="submit"]');

  // 验证：脚本不应该执行
  await expect(page.locator('body')).not.toContainText('XSS');

  // 验证：输入应该被转义
  await expect(page.locator('.results')).toContainText(`&lt;script&gt;`);
});
```

### 3. 权限测试

**垂直权限提升**：
```javascript
test('普通用户无法访问管理员页面', async ({ page }) => {
  // 作为普通用户登录
  await login(page, 'normaluser', 'password123');

  // 尝试访问管理员页面
  await page.goto('/admin');

  // 验证：应该被拒绝访问
  await expect(page).toHaveURL('/403');
  await expect(page.locator('h1')).toHaveText('Forbidden');
});
```

**水平权限绕过**：
```javascript
test('用户只能访问自己的数据', async ({ page }) => {
  // 用户 A 登录
  await login(page, 'userA', 'password123');

  // 尝试访问用户 B 的资源
  await page.goto('/api/users/userB/profile');

  // 验证：应该被拒绝
  await expect(page).toHaveStatus(403);
});
```

### 4. CSRF 防护测试

```javascript
test('表单提交需要 CSRF token', async ({ page }) => {
  await page.goto('/transfer');

  // 获取表单
  const form = page.locator('#transfer-form');

  // 验证：表单包含 CSRF token
  const csrfToken = await form.locator('input[name="csrf_token"]').getAttribute('value');
  expect(csrfToken).toBeTruthy();

  // 尝试没有 token 提交
  await page.route('**/api/transfer', route => route.fulfill({
    status: 403,
    body: JSON.stringify({ error: 'CSRF token missing' })
  }));

  await form.locator('input[name="amount"]').fill('100');
  await page.locator('input[name="to"]').fill('victim');
  await form.locator('input[name="csrf_token"]').evaluate(e => e.value = '');

  await form.submit();

  // 验证：请求被拒绝
  await expect(page.locator('.error')).toHaveText('CSRF token missing');
});
```

---

## E2E 测试最佳实践

### 1. 页面对象模式

```javascript
// pages/LoginPage.js
class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.locator('button[type="submit"]');
  }

  async login(username, password) {
    await this.page.goto('/login');
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await this.page.waitForURL('/dashboard');
  }
}

// 测试中使用
test('用户可以登录', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login('testuser', 'password123');
  await expect(page).toHaveURL('/dashboard');
});
```

### 2. 测试数据管理

```javascript
// test-data/users.json
{
  "valid": {
    "username": "testuser",
    "password": "password123",
    "email": "test@example.com"
  },
  "invalid": {
    "username": "invalid",
    "password": "wrong"
  }
}

// 测试中使用
const { valid, invalid } = require('./test-data/users.json');

test('使用有效数据登录', async ({ page }) => {
  await login(page, valid.username, valid.password);
  await expect(page).toHaveURL('/dashboard');
});
```

### 3. 环境配置

```javascript
// 测试不同环境
const environments = {
  development: 'http://localhost:3000',
  staging: 'https://staging.example.com',
  production: 'https://example.com'
};

const env = process.env.TEST_ENV || 'development';
const baseURL = environments[env];
```

### 4. 失败截图

```javascript
test('失败时自动截图', async ({ page }) => {
  try {
    // 执行测试
    await page.goto('/critical-page');
    await page.click('#critical-button');
  } catch (error) {
    // 失败时截图
    await page.screenshot({ path: `screenshots/failure-${Date.now()}.png` });
    throw error;
  }
});
```

---

## 安全测试场景

### 1. 认证安全

```javascript
test.describe('认证安全', () => {
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

  test('登录后 CSRF token 更新', async ({ page }) => {
    await page.goto('/login');

    const tokenBefore = await page.evaluate(() => document.cookie.match(/csrf_token=([^;]+)/)?.[1]);

    await login(page, 'testuser', 'password123');

    const tokenAfter = await page.evaluate(() => document.cookie.match(/csrf_token=([^;]+)/)?.[1]);

    expect(tokenAfter).toBeTruthy();
    expect(tokenAfter).not.toBe(tokenBefore);
  });
});
```

### 2. 授权安全

```javascript
test.describe('授权安全', () => {
  test('直接访问受保护资源被重定向', async ({ page }) => {
    // 未登录状态
    await page.goto('/dashboard');

    // 应该重定向到登录页
    await expect(page).toHaveURL('/login');
  });

  test('API 端点验证权限', async ({ page, request }) => {
    // 普通用户登录
    await login(page, 'normaluser', 'password123');

    // 尝试访问管理员 API
    const response = await request.get('/api/admin/users');

    // 应该返回 403
    expect(response.status()).toBe(403);
  });
});
```

### 3. 数据安全

```javascript
test.describe('数据安全', () => {
  test('敏感数据不出现在 HTML 中', async ({ page }) => {
    await page.goto('/profile');

    const html = await page.content();

    // 检查是否包含敏感信息
    expect(html).not.toContain('password');
    expect(html).not.toContain('api_key');
    expect(html).not.toContain('secret');
  });

  test('错误页面不泄露敏感信息', async ({ page }) => {
    // 触发错误
    await page.goto('/non-existent-page');

    const html = await page.content();

    // 检查错误页面
    expect(html).not.toContain('stack trace');
    expect(html).not.toContain('database');
    expect(html).not.toContain('internal error');
  });
});
```

---

## 性能测试

```javascript
test('页面加载性能', async ({ page }) => {
  // 开始性能追踪
  await page.goto('/dashboard');

  // 等待网络空闲
  await page.waitForLoadState('networkidle');

  // 获取性能指标
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0];
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      loadComplete: navigation.loadEventEnd - navigation.fetchStart,
    };
  });

  // 验证性能
  expect(metrics.domContentLoaded).toBeLessThan(2000);
  expect(metrics.loadComplete).toBeLessThan(5000);
});
```

---

## CI/CD 集成

```bash
# 在 CI 中运行 E2E 测试
npx playwright test --reporter=json --reporter=output=json.json

# 生成测试报告
npx playwright show-report
```

---

## 调试技巧

```javascript
// 调试模式
npx playwright test --debug

// 慢动作模式
npx playwright test --headed --slow-mo=1000

# 运行特定测试
npx playwright test tests/login.spec.js

# 在特定浏览器运行
npx playwright test --project=chrome
```

---

## 测试检查清单

### 认证测试
- [ ] 正常登录流程
- [ ] 错误密码处理
- [ ] 账户锁定机制
- [ ] 会话过期处理
- [ ] 登出功能
- [ ] 密码重置流程

### 授权测试
- [ ] 普通用户无法访问管理员页面
- [ ] 用户只能访问自己的数据
- [ ] API 权限验证
- [ ] 水平权限测试
- [ ] 垂直权限测试

### 输入验证测试
- [ ] SQL 注入防护
- [ ] XSS 防护
- [ ] CSRF 防护
- [ ] 文件上传验证
- [ ] 输入长度限制

### 数据安全测试
- [ ] 敏感数据不泄露
- [ ] 错误页面安全
- [ ] HTTPS 强制使用
- [ ] 安全头部配置
