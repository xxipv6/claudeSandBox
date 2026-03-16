---
description: 并发运行所有测试（前端 + 后端）
---

# E2E 测试（全部）

## 功能说明

并发运行所有测试：
- ✅ 后端测试（单元、集成、API）
- ✅ 前端 E2E 测试（Playwright）
- ✅ 生成完整测试报告

---

## 执行流程

### 第一步：检查环境

```bash
# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
  echo "错误：必须在项目根目录运行"
  exit 1
fi

# 检查 Playwright 是否安装
if ! npm list @playwright/test > /dev/null 2>&1; then
  echo "Playwright 未安装，正在安装..."
  npm install -D @playwright/test
  npx playwright install
fi

# 检查开发服务器是否运行
if ! pgrep -f "npm run dev" > /dev/null; then
  echo "启动开发服务器..."
  npm run dev &
  sleep 5
fi
```

### 第二步：并发运行测试

```bash
# 并发运行后端和前端测试
echo "🚀 开始并发运行所有测试..."

# 后端测试
npm test > backend-results.txt 2>&1 &
BACKEND_PID=$!

# 前端 E2E 测试
npx playwright test > frontend-results.txt 2>&1 &
FRONTEND_PID=$!

# 等待两个测试完成
echo "⏳ 等待测试完成..."
wait $BACKEND_PID
BACKEND_EXIT_CODE=$?

wait $FRONTEND_PID
FRONTEND_EXIT_CODE=$?
```

### 第三步：收集结果

```bash
# 显示后端测试结果
echo ""
echo "📦 后端测试结果："
cat backend-results.txt

# 显示前端测试结果
echo ""
echo "🎨 前端 E2E 测试结果："
cat frontend-results.txt

# 生成总结
echo ""
echo "═══════════════════════════════════════"
echo "📊 测试总结"
echo "═══════════════════════════════════════"

if [ $BACKEND_EXIT_CODE -eq 0 ]; then
  echo "✅ 后端测试：通过"
else
  echo "❌ 后端测试：失败"
fi

if [ $FRONTEND_EXIT_CODE -eq 0 ]; then
  echo "✅ 前端 E2E 测试：通过"
else
  echo "❌ 前端 E2E 测试：失败"
fi

echo "═══════════════════════════════════════"

# 清理临时文件
rm -f backend-results.txt frontend-results.txt

# 返回退出码
if [ $BACKEND_EXIT_CODE -ne 0 ] || [ $FRONTEND_EXIT_CODE -ne 0 ]; then
  exit 1
fi

exit 0
```

---

## 使用方式

### 方式 1：直接运行

```bash
你：/e2e

# Claude 会：
# 1. 并发运行所有测试
# 2. 等待所有测试完成
# 3. 显示完整报告
```

### 方式 2：带过滤

```bash
你：/e2e "只运行测试套件中包含 'login' 的测试"

# Claude 会：
# 1. 后端：npm test -- --grep "login"
# 2. 前端：npx playwright test -g "login"
# 3. 并发执行
```

---

## 输出示例

```bash
你：/e2e

🚀 开始并发运行所有测试...
⏳ 等待测试完成...

📦 后端测试结果：
PASS  src/auth/login.test.js
PASS  src/api/users.test.js
✓ 20 tests passed (2.3s)

🎨 前端 E2E 测试结果:
PASS  e2e/tests/login.spec.js
PASS  e2e/tests/checkout.spec.js
✓ 15 tests passed (8.5s)

═══════════════════════════════════════
📊 测试总结
═══════════════════════════════════════
✅ 后端测试：通过
✅ 前端 E2E 测试：通过
═══════════════════════════════════════

✅ 所有测试通过！
```

---

## Playwright 配置

确保 `playwright.config.js` 配置正确：

```javascript
module.exports = {
  testDir: './e2e/tests',
  timeout: 10000,
  retries: 2,
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
};
```

---

## 常见问题

### Q: 如何只运行前端测试？

```bash
你：/test "测试登录页面"
```

### Q: 如何只运行后端测试？

```bash
你：/test "测试登录 API"
```

### Q: 测试失败怎么办？

```bash
你：/debug "前端测试失败"

# Claude 会：
# 1. 启动 Playwright 调试模式
# 2. 帮助你定位问题
```

---

## CI/CD 集成

```yaml
# .github/workflows/test.yml
name: All Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Start dev server
        run: npm run dev &
        # 等待服务器启动
        - sleep 10

      - name: Run all tests
        run: |
          # 并发运行后端和前端测试
          npm test &
          BACKEND_PID=$!
          npx playwright test &
          FRONTEND_PID=$!
          wait $BACKEND_PID $FRONTEND_PID

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: |
            playwright-report/
            coverage/
```

---

## 注意事项

1. **并发执行**：前端和后端测试同时运行，节省时间
2. **环境要求**：需要运行中的应用环境
3. **测试隔离**：前端测试不应依赖后端测试的结果
4. **失败处理**：任一测试失败，整体返回失败
5. **性能考虑**：并发运行可能增加资源消耗

---

## 测试覆盖

### 后端测试（自动检测）

- Jest 测试
- Mocha 测试
- Jasmine 测试
- 单元测试
- 集成测试
- API 测试

### 前端 E2E 测试

- 页面交互测试
- 表单提交测试
- 用户流程测试
- 导航测试
- 状态管理测试
