---
name: js-reverse
description: 触发于需要分析 JavaScript 混淆、签名算法、动态 Cookie、浏览器侧加密逻辑、WASM-in-JS 或将前端算法还原为可复用代码的任务。不要用于 native 二进制、JAR/class、普通源码审计或通用 PoC 复现。
disable-model-invocation: false
---

# JavaScript 逆向工程与签名还原

## Trigger

### TRIGGER WHEN
- 用户请求分析 JS 混淆代码、还原签名算法或定位前端加密逻辑
- 需要提取请求参数签名（sign / m / token）
- 需要还原动态 Cookie 生成逻辑
- 需要分析响应数据加密 / 解密流程
- 需要逆向浏览器上下文中的 WASM、WebSocket 签名或前端加密调用链
- 需要把浏览器侧算法还原为 Node.js 可复用代码

### DO NOT TRIGGER WHEN
- 目标是 ELF / PE / Mach-O / so / dll / APK / IPA 等 native 或移动端 reverse
- 目标是 `.jar`、`.class`、`classes.jar` 反编译
- 任务本质上是普通源码审计、漏洞分类、修复建议总结
- 任务本质上是 PoC 验证、漏洞利用复现，而不是算法还原
- 任务已经扩展成 broader protocol / mobile / binary reverse 调查

### USE WITH
- broader reverse / mobile / protocol / native 场景交给 `reverse-analyst`
- 纯 JS 签名、Cookie、前端 crypto、WASM-in-JS 场景优先使用本 skill
- 漏洞验证与复现交给 `poc-exploit`
- 如果任务从 JS 逆向扩展成安全工具开发，交给 `secdev`
- 本 skill 不覆盖 `workspace/CLAUDE.md` 的顶层路由规则

### EXAMPLE PROMPTS
- “分析这个站的 sign 和动态 cookie”
- “把这个前端加密逻辑还原成 Node.js”
- “看看这个 webpack 包里的签名算法在哪里”
- “逆向这个页面里的 wasm 加密流程”

---

## 推荐工具链

不依赖 MCP，优先使用本地通用工具链：

- 浏览器开发者工具（Network / Sources / Console）
- 抓包工具（Charles / Burp Suite / mitmproxy）
- Node.js 运行时（`node` / `vm`）
- 格式化与 AST 工具（Prettier / Babel / esbuild）
- 自动化工具（Puppeteer / Playwright）
- 文本搜索工具（grep / ripgrep）

---

## 完整逆向流程（6 阶段）

### Phase 0: 任务理解与样本确认

**目标**：明确逆向目标、确认输入样本

**执行步骤**：
1. 明确目标网站 / 目标接口 / 目标页面
2. 确认关注点（sign / Cookie / 响应加密 / WASM / WebSocket）
3. 收集相关 JS 文件、SourceMap、抓包数据、页面快照
4. 确认是浏览器端逻辑、Node.js 逻辑还是混合逻辑

**输出**：
- 目标 URL / 文件路径
- 逆向类型
- 可用样本清单

---

### Phase 1: 侦察阶段（Reconnaissance）

**目标**：收集目标网站信息、识别加密场景

#### 1.1 抓包分析

重点观察：
- 请求 URL 模式
- 请求参数（sign/m/token/等）
- 请求头与动态字段
- Cookie 的生成与变化
- 响应是否加密

#### 1.2 源码搜索

```bash
grep -Rni "sign\|token\|encrypt\|decrypt\|CryptoJS\|WebAssembly\|fetch\|XMLHttpRequest" ./src
```

#### 1.3 框架识别

识别技术栈：
- React / Vue / Angular
- Webpack / Rollup / Vite
- CryptoJS / forge / JSEncrypt / wasm-bindgen

**输出**：
- 加密场景分类
- 关键文件清单
- 关键函数或模块入口

---

### Phase 2: 源码分析阶段（Source Code Analysis）

**目标**：定位关键函数、理解算法逻辑

#### 2.1 格式化与拆分代码

```bash
npx prettier --write app.js
```

必要时：
- 使用 source map 还原源码
- 用 Babel parser 分析 AST
- 按模块拆分 bundle

#### 2.2 定位关键函数

重点查找：
- 签名生成函数
- Cookie 计算逻辑
- 响应解密逻辑
- wasm 加载与调用入口
- fetch / xhr 封装层

#### 2.3 理解数据流

关注：
- 输入参数来源
- 拼接顺序
- 加密算法与编码格式
- 密钥 / IV / salt 来源
- 输出字段进入请求的方式

**输出**：
- 关键函数代码位置
- 参数构造规则
- 算法类型与关键依赖

---

### Phase 3: 动态验证阶段（Dynamic Verification）

**目标**：验证算法理解、获取运行时数据

#### 3.1 浏览器控制台 Hook

```javascript
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  console.log('fetch input:', args);
  const result = await originalFetch.apply(this, args);
  return result;
};
```

```javascript
const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url) {
  console.log('xhr:', method, url);
  return originalOpen.apply(this, arguments);
};
```

#### 3.2 关键函数打点

```javascript
const originalSign = window.sign;
window.sign = function(...args) {
  console.log('sign input:', args);
  const result = originalSign.apply(this, args);
  console.log('sign output:', result);
  return result;
};
```

#### 3.3 自动化复现

可使用 Puppeteer / Playwright：
- 自动打开页面
- 填表 / 点击 / 触发请求
- 注入 hook
- 提取运行时结果

**输出**：
- 加密输入输出样本
- 动态参数来源
- 运行时调用链

---

### Phase 4: Node.js 算法还原阶段（Algorithm Restoration）

**目标**：将前端逻辑还原为可复用代码

#### 常见场景

1. 请求参数签名（sign/m/token）
2. 动态 Cookie 生成
3. 响应数据解密
4. JS 混淆还原
5. WASM 加密逻辑
6. TLS 指纹 / 协议对抗
7. WebSocket 通信
8. 字体映射还原

#### Node.js 模板

```javascript
const vm = require('vm');
const fs = require('fs');

const code = fs.readFileSync('bundle.js', 'utf8');
const sandbox = { console, module: { exports: {} }, exports: {} };
vm.runInNewContext(code, sandbox);
```

```javascript
const axios = require('axios');

function generateSign(data) {
  // 还原后的签名逻辑
}
```

**输出**：
- 可运行的 Node.js 算法代码
- 依赖说明
- 最小可复现样例

---

### Phase 5: 验证与交付阶段（Verification & Delivery）

**目标**：验证算法正确性、交付可用代码

验证点：
- [ ] 签名结果与浏览器一致
- [ ] 请求成功返回数据
- [ ] Cookie 更新正常
- [ ] 解密结果正确

交付内容：
- 核心算法代码
- 使用示例
- 依赖说明
- 测试用例

---

## 常见分析场景

### 场景 1: 请求参数签名
- 查找 `sign` / `token` / `m`
- 分析排序、拼接、哈希或加密方式
- 还原 Node.js 版本

### 场景 2: 动态 Cookie
- 观察 Cookie 变化
- 查找写入点
- 还原更新逻辑

### 场景 3: 响应数据加密
- 识别密文格式
- 定位解密函数
- 提取密钥 / IV

### 场景 4: 混淆代码
- 格式化
- AST 还原
- 字符串解密
- 控制流梳理

### 场景 5: WASM
- 找到 wasm 文件与加载点
- 跟踪导入导出函数
- 还原关键算法

---

## 输出格式

```markdown
# JavaScript Reverse Analysis: <target>

## 基本信息
- 目标: <url / file>
- 框架: <React / Vue / Angular / 原生>
- 场景: <sign / Cookie / 响应加密 / WASM>

## 关键文件
- <file 1>
- <file 2>

## 关键发现
### 发现 1
- 类型: <签名/加密/反混淆/WASM>
- 位置: <file:line 或函数>
- 描述: <问题描述>
- 影响: <风险或用途>

## Node.js 还原
```javascript
function generateSign(data) {
  // 实现代码
}
```

## 验证结果
- [ ] 与浏览器结果一致
- [ ] 请求可成功复现

## 下一步
- <继续验证方向>
```

---

## 使用原则

- 动态调试优先于纯静态猜测
- 先锁定输入输出，再还原中间算法
- 先复现最小链路，再做工程化封装
- 输出必须包含证据位置、关键函数和验证方式
