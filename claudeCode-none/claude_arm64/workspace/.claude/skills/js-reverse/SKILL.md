---
name: js-reverse
description: JavaScript 逆向工程与签名还原。当需要分析 JS 混淆、提取签名算法、还原加密逻辑、动态 Cookie/WASM 逆向、接口自动化时，应主动（PROACTIVELY）使用此 skill。依赖 js-reverse MCP + chrome-devtools MCP。
disable-model-invocation: false
---

# JavaScript 逆向工程与签名还原

## 何时启用

- 用户请求分析 JS 混淆代码、还原签名算法
- 需要提取请求参数签名（sign/m/token）
- 需要还原动态 Cookie 生成逻辑
- 需要分析响应数据加密/解密
- 需要逆向 WASM 加密算法
- 需要处理 TLS 指纹/协议对抗
- 需要实现 Node.js 接口自动化
- 需要处理 WebSocket 通信签名
- 需要字体映射还原

---

## MCP 工具依赖

> **✅ Docker 环境已配置**：claudeSandBox Docker 镜像已包含 Chromium 浏览器（headless 模式）和 MCP 服务器配置。

### 当前环境支持

**Docker 镜像已包含**：
- ✅ **Chromium Browser**（开源版本，支持 ARM64）
- ✅ js-reverse MCP（预配置）
- ✅ chrome-devtools MCP（预配置）

> **为什么使用 Chromium？**
> Google Chrome 官方不提供 Linux ARM64 版本的 .deb 包。Chromium 是 Chrome 的开源版本，功能完全兼容，且在 Ubuntu ARM64 仓库中可用。

### 1. js-reverse MCP
**源码分析与断点调试工具**

**配置**：
```json
{
  "command": "npx",
  "args": [
    "js-reverse-mcp",
    "--hideCanvas",
    "--blockWebrtc",
    "--headless",
    "--executablePath=/usr/bin/chromium-browser"
  ],
  "env": {
    "CHROME_BIN": "/usr/bin/chromium-browser"
  }
}
```

**核心工具**：
- `search_source_code` - 搜索源码（关键词/正则）
- `parse_function` - 解析函数定义
- `add_breakpoint` / `remove_breakpoint` - 断点管理
- `trigger_breakpoint` - 触发断点并获取参数
- `evaluate_expression` - 计算表达式
- `get_call_stack` - 获取调用栈
- `get_source_code` - 获取源码
- 网络请求监控与分析
- Cookie 管理与查看

### 2. chrome-devtools MCP
**浏览器自动化与调试工具**

**配置**：
```json
{
  "command": "npx",
  "args": [
    "-y",
    "chrome-devtools-mcp@latest",
    "--headless"
  ],
  "env": {
    "CHROME_PATH": "/usr/bin/chromium-browser"
  }
}
```

**核心工具**：
- `list_pages` / `new_page` / `select_page` / `close_page` - 页面管理
- `navigate` - 导航到 URL
- `evaluate` - 执行 JS 代码
- `get_html` / `screenshot` - 获取内容
- `click` / `fill` - 页面操作
- `wait_for_network_idle` - 等待网络空闲
- 性能分析与网络监控

### Headless 模式说明

**在 Docker server 环境中**，Chromium 以 headless 模式运行：
- 无 GUI 界面
- 所有操作通过 DevTools Protocol 控制
- 支持 screenshot、evaluate、click 等操作
- 性能更好，资源占用更少

**限制**：
- ❌ 无法看到浏览器窗口
- ❌ 无法手动调试
- ✅ 所有自动化功能正常工作

---

## 浏览器连接策略（最高优先级）

### 连接优先级

```python
# 步骤 1: 列出所有页面
pages = list_pages()

# 步骤 2: 查找目标页面（优先复用现有页面）
target_page = find_page_by_url(pages, target_url)
if target_page:
    select_page(target_page.id)  # 复用现有页面 ✅ 优先
else:
    new_page(target_url)  # 创建新页面 ❌ 兜底
```

**规则**：
1. **始终先用 `list_pages`** 查看当前打开的页面
2. **优先使用 `select_page`** 复用已有页面
3. **仅在无匹配页面时使用 `new_page`** 创建新页面

### 连接检查清单

每次开始逆向前：
- [ ] 列出所有页面（`list_pages`）
- [ ] 查找目标页面（URL 匹配）
- [ ] 复用或创建页面（`select_page` / `new_page`）
- [ ] 验证页面可访问（`evaluate` / `get_html`）

---

## 完整逆向流程（6 阶段）

### Phase 0: 任务理解与浏览器连接

**目标**：明确逆向目标、建立浏览器连接

**执行步骤**：
1. 理解用户需求（签名类型、目标网站）
2. 检查 MCP 服务状态
3. 建立浏览器连接（遵循连接策略）
4. 验证连接可用性

**输出**：
- 目标网站 URL
- 逆向类型（sign/Cookie/WASM/其他）
- 浏览器连接状态

---

### Phase 1: 侦察阶段（Reconnaissance）

**目标**：收集目标网站信息、识别加密场景

**执行步骤**：

#### 1.1 抓包分析

```bash
# 使用 Chrome DevTools 或 Charles/Burp Suite
# 查看请求/响应特征
```

**关键信息**：
- 请求 URL 模式
- 请求参数（sign/m/token/等）
- 请求头（自定义字段）
- Cookie 字段（动态生成）
- 响应数据格式（加密/明文）

#### 1.2 源码搜索

使用 `js-reverse MCP` 搜索关键词：

```python
# 搜索加密关键词
search_source_code("encrypt", "sign", "token", "signature")

# 搜索可疑模式
search_source_code("btoa", "atob", "CryptoJS", "AES")

# 查找函数定义
parse_function("function encrypt")
```

#### 1.3 框架识别

识别技术栈：
- React / Vue / Angular
- Webpack / Rollup / Vite
- 加密库（CryptoJS / forge / JSEncrypt）

**输出**：
- 加密场景分类（8 类之一）
- 目标文件清单
- 关键函数列表

---

### Phase 2: 源码分析阶段（Source Code Analysis）

**目标**：定位加密函数、理解算法逻辑

**执行步骤**：

#### 2.1 定位加密函数

**方法 1: 字符串搜索**
```python
# 搜索 "sign" 关键词
search_source_code("sign")

# 搜索 CryptoJS 调用
search_source_code("CryptoJS.AES")
```

**方法 2: 断点调试**
```python
# 在关键位置下断点
add_breakpoint("chunk-vendors.js", 12345)

# 触发请求
trigger_breakpoint()

# 查看参数
evaluate_expression("arguments")
```

#### 2.2 分析函数逻辑

**关键分析点**：
- 输入参数（哪些数据参与加密）
- 加密算法（对称/非对称/哈希）
- 密钥来源（固定/动态/计算）
- 输出格式（Base64/Hex/其他）

**工具**：
- `get_call_stack()` - 查看调用栈
- `evaluate_expression()` - 计算表达式
- `parse_function()` - 解析函数定义

**输出**：
- 加密函数代码
- 算法类型
- 密钥获取方式
- 参数构建逻辑

---

### Phase 3: 动态验证阶段（Dynamic Verification）

**目标**：验证算法理解、获取运行时数据

**执行步骤**：

#### 3.1 Hook 加密函数

使用 `chrome-devtools MCP` 注入 Hook 代码：

```javascript
// Hook fetch API
const originalFetch = window.fetch;
window.fetch = function(...args) {
    console.log("Fetch:", args[0], args[1]);
    return originalFetch.apply(this, args);
};

// Hook XMLHttpRequest
const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url) {
    console.log("XHR:", method, url);
    return originalOpen.apply(this, arguments);
};

// Hook 加密函数
const originalEncrypt = window.encrypt;
window.encrypt = function(...args) {
    console.log("Encrypt Input:", args);
    const result = originalEncrypt.apply(this, args);
    console.log("Encrypt Output:", result);
    return result;
};
```

#### 3.2 触发加密流程

使用 `chrome-devtools MCP` 操作页面：

```python
# 填写表单
fill("#username", "test")
fill("#password", "123456")

# 点击按钮
click("#login-button")

# 等待请求完成
wait_for_network_idle()
```

#### 3.3 捕获运行时数据

```javascript
// 查看全局变量
console.log(window.app.sign);

// 查看函数调用
console.trace("encrypt called");
```

**输出**：
- 加密输入/输出样本
- 密钥/IV 等敏感数据
- 完整调用链路

---

### Phase 4: Node.js 算法还原阶段（Algorithm Restoration）

**目标**：将 JS 算法还原为 Node.js 可执行代码

**执行步骤**：

#### 4.1 算法分类还原

**场景 1: 请求参数签名（sign/m/token）**
- 提取签名生成函数
- 还原参数排序/拼接逻辑
- 还原密钥获取方式
- 实现 Node.js 签名函数

**场景 2: 动态 Cookie 生成**
- 定位 Cookie 生成代码
- 还原加密/编码逻辑
- 实现 Cookie 更新机制

**场景 3: 响应数据加密**
- 识别加密算法（AES/DES/RSA）
- 提取密钥/IV
- 实现解密函数

**场景 4: JS 混淆/OB 混淆**
- AST 反混淆
- 控制流平整还原
- 字符串解密

**场景 5: WASM 加密**
- 下载 .wasm 文件
- 反汇编（WABT）
- 定位加密函数
- 还原算法逻辑

**场景 6: TLS 指纹/协议对抗**
- 分析 JA3 指纹
- 修改 TLS 指纹
- 实现指纹伪装

**场景 7: WebSocket 通信**
- 分析握手签名
- 还原消息加密
- 实现心跳机制

**场景 8: 字体映射还原**
- 下载字体文件
- 解析映射关系
- 实现字体反爬绕过

#### 4.2 Node.js 实现模板

**模板 1: node-request（标准请求）**
```javascript
const axios = require('axios');
const { generateSign } = require('./sign');

async function request(url, data) {
    const sign = generateSign(data);
    const response = await axios.post(url, {
        ...data,
        sign
    });
    return response.data;
}
```

**模板 2: vm-sandbox（隔离环境）**
```javascript
const vm = require('vm');
const fs = require('fs');

// 加载混淆代码
const code = fs.readFileSync('obfuscated.js', 'utf-8');

// 创建沙箱
const sandbox = {
    console,
    require,
    module: { exports: {} }
};

// 执行代码
vm.runInNewContext(code, sandbox);

// 调用加密函数
const encrypted = sandbox.module.exports.encrypt(data);
```

**模板 3: wasm-loader（WASM 加载）**
```javascript
const fs = require('fs');

// 加载 WASM
const wasmBuffer = fs.readFileSync('encrypt.wasm');
WebAssembly.instantiate(wasmBuffer).then(({ instance }) => {
    // 调用 WASM 函数
    const result = instance.exports.encrypt(input);
    console.log(result);
});
```

**模板 4: browser-auto（浏览器自动化）**
```javascript
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // 注入 Hook
    await page.evaluateOnNewDocument(() => {
        window.signResults = [];
        const originalSign = window.sign;
        window.sign = function(...args) {
            const result = originalSign.apply(this, args);
            window.signResults.push({ input: args, output: result });
            return result;
        };
    });

    // 执行业务流程
    await page.goto('https://example.com');
    await page.click('#login');

    // 提取签名
    const signs = await page.evaluate(() => window.signResults);
    console.log(signs);

    await browser.close();
})();
```

**输出**：
- Node.js 算法代码
- 依赖清单（package.json）
- 测试用例

---

### Phase 5: 验证与交付阶段（Verification & Delivery）

**目标**：验证算法正确性、交付可用代码

**执行步骤**：

#### 5.1 功能验证

```bash
# 安装依赖
npm install

# 运行测试
npm test

# 对比签名结果
node test.js
```

**验证点**：
- [ ] 签名结果与浏览器一致
- [ ] 请求成功返回数据
- [ ] Cookie 自动更新正常
- [ ] 解密结果正确

#### 5.2 性能优化

- 去除无用代码
- 优化循环逻辑
- 缓存计算结果
- 并发请求优化

#### 5.3 交付代码

**交付内容**：
- 核心算法代码
- 使用示例
- 依赖说明（package.json）
- 测试用例

**输出**：
- 可用的 Node.js 接口自动化代码
- 完整的技术文档
- 使用说明

---

## 8 种常见签名分析场景

### 场景 1: 请求参数签名（sign/m/token）

**特征**：
- 请求参数中包含 sign/m/token 字段
- 每次请求签名值不同
- 签名基于请求参数动态生成

**分析步骤**：
1. 搜索 "sign" 关键词
2. 定位签名生成函数
3. 分析参数排序/拼接规则
4. 提取密钥/盐值
5. 还原签名算法

**常见算法**：
- MD5(params + salt)
- HMAC-SHA256(params, key)
- RSA 签名

---

### 场景 2: 动态 Cookie 生成

**特征**：
- Cookie 字段值动态变化
- Cookie 由 JS 生成（非服务器 Set-Cookie）
- Cookie 与时间戳/指纹相关

**分析步骤**：
1. 监控 Cookie 变化
2. 搜索 Cookie 设置代码
3. 分析生成逻辑（时间戳/指纹）
4. 还原生成算法
5. 实现自动更新

---

### 场景 3: 响应数据加密

**特征**：
- 响应数据为密文（乱码）
- Content-Type 异常
- 前端有解密逻辑

**分析步骤**：
1. 查看响应数据格式
2. 搜索解密函数（decrypt）
3. 识别加密算法（AES/DES/RSA）
4. 提取密钥/IV
5. 还原解密算法

---

### 场景 4: JS 混淆/OB 混淆

**特征**：
- 代码不可读（变量名混淆）
- 字符串加密（数组/旋转）
- 控制流平整（switch/case）
- 垃圾代码注入

**分析步骤**：
1. 美化代码（js-beautify）
2. AST 反混淆（Babel）
3. 字符串解密（Hook）
4. 控制流还原
5. 动态调试验证

---

### 场景 5: WASM 加密

**特征**：
- .wasm 文件加载
- WebAssembly 实例化
- 加密函数在 WASM 中

**分析步骤**：
1. 下载 .wasm 文件
2. 反汇编（wasm-dis）
3. 定位加密函数
4. 分析算法逻辑
5. 还原为 JS/C/C++

**工具**：
- WABT（WebAssembly Binary Toolkit）
- wasm2wat（反汇编）
- wat2wasm（汇编）

---

### 场景 6: TLS 指纹/协议对抗

**特征**：
- 请求被拦截（403/401）
- TLS 指纹检测
- HTTP/2 指纹检测

**分析步骤**：
1. 抓包分析 TLS 握手
2. 计算 JA3/JA4 指纹
3. 修改浏览器指纹
4. 实现指纹伪装

**工具**：
- OpenSSL（指纹分析）
- curl_cffi（指纹伪装）
- undetected-chromedriver

---

### 场景 7: WebSocket 通信

**特征**：
- WebSocket 连接
- 消息加密/签名
- 心跳机制

**分析步骤**：
1. 抓包 WebSocket 帧
2. 分析握手签名
3. 分析消息格式
4. 还原加密逻辑
5. 实现心跳机制

---

### 场景 8: 字体映射还原

**特征**：
- 自定义字体文件（.woff/.ttf）
- 字符映射加密
- 数据显示为乱码

**分析步骤**：
1. 下载字体文件
2. 解析字体映射（glyph/unicode）
3. 建立映射表
4. 实现字体反爬绕过

**工具**：
- FontForge
- TTX（XML 转储）
- Python fontTools

---

## 反调试保护策略

### 常见反调试手段

**1. 无限 debugger**
```javascript
setInterval(() => {
    debugger;
}, 100);
```

**绕过**：
```javascript
// 禁用断点
Function.prototype.constructor = function() {
    return function() {};
};
```

**2. setInterval 检测**
```javascript
const start = Date.now();
debugger;
const end = Date.now();
if (end - start > 100) {
    // 反调试
}
```

**绕过**：
```javascript
// Hook Date
const originalDate = Date;
Date = function() {
    return new originalDate(now);
};
```

**3. console.log 检测**
```javascript
const devtools = /./;
devtools.toString = function() {
    // 检测开发者工具
};
```

**绕过**：
```javascript
// 禁用 console
console.log = function() {};
```

**4. Function.toString 检测**
```javascript
function xxx() {
    // 检测函数被 Hook
}
```

**绕过**：
```javascript
// Hook toString
const originalToString = Function.prototype.toString;
Function.prototype.toString = function() {
    return originalToString.apply(this);
};
```

---

## 输出格式

分析完成后应输出：

```markdown
# JavaScript Reverse Analysis: [filename]

## 基本信息
- **文件名**: [filename]
- **混淆类型**: [OB混淆 / 压缩混淆 / 自定义]
- **框架**: [React / Vue / Angular / 原生]
- **签名场景**: [sign / Cookie / 响应加密 / WASM]

## 功能分析
[代码主要功能]

## MCP 工具使用
- js-reverse MCP: [搜索、断点、调用栈]
- chrome-devtools MCP: [页面操作、Hook 注入]

## 签名算法
### 签名生成
- **算法**: [MD5 / HMAC-SHA256 / RSA]
- **参数**: [参数列表]
- **密钥**: [密钥来源]
- **实现**: [Node.js 代码]

### Node.js 实现
```javascript
// 签名函数
function generateSign(data) {
    // 实现代码
}
```

## 关键函数
### encrypt()
[功能描述]

### sign()
[功能描述]

## 混淆模式
[识别的混淆模式、反混淆方法]

## 测试验证
- [ ] 签名结果一致
- [ ] 请求成功
- [ ] Cookie 更新正常
- [ ] 解密正确

## 交付代码
- algorithms/ - 核心算法代码
- templates/ - 4 种模板实现
- tests/ - 测试用例
- package.json - 依赖清单

## 结论
[总结分析结果、安全建议]
```

---

**记住**：JavaScript 逆向需要耐心，动态调试比静态分析更高效，理解业务逻辑比理解代码更重要。MCP 工具是你的好帮手，善用 js-reverse MCP 和 chrome-devtools MCP 可以大幅提升效率。
