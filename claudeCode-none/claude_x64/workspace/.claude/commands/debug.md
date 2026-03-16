---
description: 系统化调试问题，从症状到根因分析
---

# 调试

## 自动识别：前端 vs 后端

在开始调试前，自动识别任务类型：

**前端任务特征**：
- 涉及浏览器、页面、UI
- 涉及 HTML、CSS、JavaScript
- 涉及用户界面、交互
- 提到"页面"、"按钮"、"表单"、"样式"

**后端任务特征**：
- 涉及 API、数据库、服务器
- 涉及业务逻辑、数据处理
- 提到"接口"、"查询"、"服务"、"后端"

**如果识别为前端任务**：
```
✅ 自动切换到前端调试模式
✅ 使用 Playwright 进行调试
✅ 加载 E2E 测试技能
```

**如果识别为后端任务**：
```
✅ 使用常规调试方法
✅ 加载 debugging 技能
✅ 使用日志、断点等工具
```

---

## 前端调试（自动识别）

### 触发条件

当检测到以下情况时，自动使用前端调试：

```javascript
// 用户输入示例
"页面登录按钮点击没反应"
"样式在浏览器上显示不正确"
"表单提交后页面没有刷新"
"React 组件状态不对"
"前端路由跳转有问题"
```

### 前端调试流程

#### 第一步：启动 Playwright

```bash
# 自动启动 Playwright 调试
npx playwright code http://localhost:3000

# 或使用 Playwright Inspector
npx playwright test --debug
```

#### 第二步：检查页面状态

```javascript
// 使用 Playwright 检查页面
await page.goto('http://localhost:3000/login');

// 检查元素是否存在
const button = page.locator('#login-button');
await expect(button).toBeVisible();

// 检查元素属性
const isEnabled = await button.isEnabled();
console.log('Button enabled:', isEnabled);

// 检查控制台错误
page.on('console', msg => {
  if (msg.type() === 'error') {
    console.error('Browser console error:', msg.text());
  }
});
```

#### 第三步：调试前端逻辑

```javascript
// 截图查看页面状态
await page.screenshot({ path: 'debug-screenshot.png' });

// 慢动作观察执行过程
await page.slowMo(1000);

// 等待特定状态
await page.waitForSelector('.success-message');

// 执行 JavaScript
const result = await page.evaluate(() => {
  return window.userState;
});
```

#### 第四步：网络请求调试

```javascript
// 监听网络请求
page.on('request', request => {
  console.log('Request:', request.url());
});

page.on('response', response => {
  console.log('Response:', response.url(), response.status());
});

// 等待特定请求
await page.waitForResponse('**/api/login');
```

---

## 后端调试（常规方法）

### 核心原则

1. **理解问题** - 复现问题，理解症状
2. **隔离变量** - 控制变量，缩小范围
3. **形成假设** - 基于证据提出假设
4. **验证假设** - 设计实验验证
5. **定位根因** - 找到根本原因
6. **实施修复** - 修复并验证

## 调试流程

### 第一步：理解问题

**收集信息**：
- 错误消息是什么？
- 什么时候发生的？
- 复现步骤是什么？
- 预期行为 vs 实际行为

**复现问题**：
```bash
# 获取完整错误信息
1. 查看日志
2. 运行测试用例
3. 尝试复现
```

### 第二步：加载调试技能

```
读取：.claude/skills/development/debugging/
```

### 第三步：系统化分析

**分析维度**：

1. **数据流** - 数据从哪里来，到哪里去
2. **控制流** - 执行路径是什么
3. **状态** - 关键变量的值
4. **时序** - 事件发生的顺序
5. **环境** - 运行环境配置

**调试技术**：

```bash
# 日志调试
console.log() / print() / logging

# 断点调试
debugger / breakpoint

# 二分法
注释代码缩小范围

# 对比法
对比工作版本 vs 不工作版本
```

### 第四步：形成假设

**假设模板**：
- "问题可能是 X，因为..."
- "如果是 Y 导致的，那么应该..."
- "假设 Z，验证方法是..."

### 第五步：验证假设

**设计实验**：
- 最小化复现
- 控制变量
- 单一变更

### 第六步：定位根因

**根因分析工具**：
- 5 Whys - 连续问 5 次为什么
- 鱼骨图 - 因果分析
- 时间线 - 事件序列

### 第七步：实施修复

**修复策略**：
1. 最小化修复
2. 添加测试用例
3. 验证修复
4. 检查副作用

## 使用示例

```bash
# 调试错误
/debug "用户登录失败，返回 500 错误"

# 调试性能问题
/debug "API 响应很慢，需要 10 秒"

# 调试内存泄漏
/debug "应用运行一段时间后崩溃"
```

## 常见问题模式

### 错误：500 Internal Server Error

**调试步骤**：
1. 查看服务器日志
2. 检查堆栈跟踪
3. 定位错误行
4. 分析变量值
5. 检查边界条件

### 错误：undefined is not a function

**调试步骤**：
1. 检查变量类型
2. 追踪变量来源
3. 验证 API 变更
4. 检查加载顺序

### 错误：连接超时

**调试步骤**：
1. 检查网络连接
2. 验证服务状态
3. 检查防火墙
4. 测试端口连通性
5. 查看超时配置

## 输出格式

```
## 调试报告

### 问题描述
[用户描述的问题]

### 复现步骤
1. ...
2. ...
3. ...

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

## 调试技巧

### 快速定位

```bash
# 二分法注释代码
# 如果注释后问题消失，逐步放开定位

# 添加防御性检查
if (condition) {
  console.log('checkpoint 1', variable);
}

# 使用版本控制
git bisect start
git bisect bad HEAD
git bisect good <working-commit>
```

### 性能分析

```bash
# CPU 性能
- Profiler 工具
- Performance API

# 内存分析
- Memory profiler
- Heap snapshot

# 网络分析
- Network tab
- Timing API
```

## 注意事项

- 保持冷静，系统化分析
- 不要盲目修改代码
- 一次只改一个变量
- 保留复现步骤
- 记录调试过程
- 修复后添加测试
