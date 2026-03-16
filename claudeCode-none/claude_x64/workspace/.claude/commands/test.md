---
description: 功能测试（前端/后端自动识别）
---

# 功能测试

## 功能说明

运行功能测试，自动识别前端/后端并使用相应的测试工具。

---

## 执行流程

### 第一步：识别测试类型

**前端测试特征**：
- 涉及浏览器、页面、UI 组件
- 提到"页面"、"按钮"、"表单"、"组件"
- 测试：交互、导航、样式

**后端测试特征**：
- 涉及 API、数据库、服务
- 提到"接口"、"查询"、"业务逻辑"
- 测试：API 返回、数据处理、数据库操作

---

### 第二步：加载相应的技能

**前端测试**：
```markdown
加载 skill：testing/e2e-testing（Playwright）

工具：
- npx playwright test
- npx playwright test --debug
- npx playwright codegen
```

**后端测试**：
```bash
# 运行后端测试框架
npm test

# 或使用特定框架
pytest          # Python
go test         # Go
jest            # JavaScript
```

---

### 第三步：高度自治（自动准备环境）

```bash
# 前端测试自动准备
if [ ! -f "playwright.config.js" ]; then
  echo "创建 Playwright 配置..."
  # 自动创建配置
fi

if ! npm list @playwright/test &> /dev/null; then
  echo "安装 Playwright..."
  npm install -D @playwright/test
  npx playwright install
fi

# 自动启动服务
if ! pgrep -f "npm run dev" > /dev/null; then
  npm run dev &
  sleep 5
fi
```

---

### 第四步：运行测试并生成报告

```markdown
## 测试报告

### 测试概览
- 测试类型：[前端 / 后端]
- 测试范围：[描述]
- 测试时间：[时间戳]

### 测试结果
- 运行数量：X
- 通过数量：Y
- 失败数量：Z

### 失败详情
[如果有的话，列出失败的测试]

### 建议
[改进建议]
```

---

## 使用方式

```bash
# 前端测试
/test "测试登录按钮"
/test "测试表单提交"

# 后端测试
/test "测试登录 API"
/test "测试数据库查询"
```

---

## Skills 映射

| 测试类型 | Skill | 工具 |
|----------|-------|------|
| 前端测试 | `testing/e2e-testing` | Playwright |
| 后端测试 | （框架自带） | npm test, pytest, go test |

---

## 注意事项

1. **自动识别**：命令自动识别前端/后端测试
2. **高度自治**：自动安装依赖、创建配置、启动服务
3. **无需确认**：环境准备不需要用户确认
