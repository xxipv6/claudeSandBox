---
description: 系统化调试问题（前端/后端自动识别）
---

# 调试

## 功能说明

系统化调试问题，自动识别前端/后端任务并使用相应的工具和方法。

---

## 执行流程

### 第一步：识别任务类型

**前端任务特征**：
- 涉及浏览器、页面、UI
- 涉及 HTML、CSS、JavaScript
- 提到"页面"、"按钮"、"表单"、"样式"

**后端任务特征**：
- 涉及 API、数据库、服务器
- 涉及业务逻辑、数据处理
- 提到"接口"、"查询"、"服务"

---

### 第二步：加载相应的技能

**前端调试**：
```markdown
加载 skill：testing/e2e-testing（Playwright）

使用 Playwright 工具：
- npx playwright code http://localhost:3000
- npx playwright test --debug
- page.screenshot()
- page.evaluate()
```

**后端调试**：
```markdown
加载 skill：development/debugging

使用系统化调试方法：
1. 理解问题 - 复现问题，理解症状
2. 隔离变量 - 控制变量，缩小范围
3. 形成假设 - 基于证据提出假设
4. 验证假设 - 设计实验验证
5. 定位根因 - 找到根本原因
6. 实施修复 - 修复并验证
```

---

### 第三步：执行调试

**前端调试流程**：
```bash
# 1. 启动 Playwright
npx playwright code http://localhost:3000

# 2. 检查页面状态
await page.goto('http://localhost:3000/login');
const button = page.locator('#login-button');
await expect(button).toBeVisible();

# 3. 调试前端逻辑
await page.screenshot({ path: 'debug-screenshot.png' });
const result = await page.evaluate(() => window.userState);

# 4. 监听网络请求
page.on('response', response => {
  console.log('Response:', response.url(), response.status());
});
```

**后端调试流程**：
```bash
# 1. 理解问题
收集错误消息、复现步骤、预期 vs 实际

# 2. 隔离变量
使用日志、断点、二分法

# 3. 形成假设
"问题可能是 X，因为..."

# 4. 验证假设
设计实验验证

# 5. 定位根因
5 Whys、鱼骨图、时间线

# 6. 实施修复
最小化修复、添加测试
```

---

### 第四步：生成调试报告

```markdown
## 调试报告

### 问题描述
[用户描述的问题]

### 复现步骤
1. [步骤 1]
2. [步骤 2]
3. [步骤 3]

### 调试过程
1. 信息收集：[收集到的信息]
2. 假设 1：[假设] → [验证结果]
3. 假设 2：[假设] → [验证结果]
4. 根因定位：[根本原因]

### 修复方案
1. 代码变更：[具体修改]
2. 添加测试：[测试用例]
3. 验证结果：[修复后的结果]

### 防止复发
- [改进建议]
- [文档更新]
```

---

## 使用方式

```bash
# 前端调试（自动识别）
/debug "登录按钮点击没反应"
/debug "页面样式显示不正确"

# 后端调试（自动识别）
/debug "API 返回 500 错误"
/debug "数据库查询很慢"
```

---

## Skills 映射

| 任务类型 | Skill | 工具/方法 |
|----------|-------|-----------|
| 前端调试 | `testing/e2e-testing` | Playwright |
| 后端调试 | `development/debugging` | 系统化方法 |

---

## 注意事项

1. **自动识别**：命令自动识别前端/后端任务
2. **技能加载**：根据任务类型加载相应的 skill
3. **高度自治**：自动安装缺失的依赖（如 Playwright）
