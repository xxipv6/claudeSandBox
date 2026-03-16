---
description: 常见安全漏洞模式库，包含 OWASP Top 10 和 CWE 分类
disable-model-invocation: false
---

# 漏洞模式库

## OWASP Top 10 (2021)

### A01:2021 – 访问控制失效 (Broken Access Control)

**模式**：
```javascript
// ❌ 不安全的直接对象引用
app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  // 没有验证当前用户是否有权限访问 userId
  res.json(getUser(userId));
});

// ✅ 安全实现
app.get('/user/:id', (req, res) => {
  const requestedId = req.params.id;
  const currentUserId = req.session.userId;

  if (requestedId !== currentUserId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json(getUser(requestedId));
});
```

**检测方法**：
- 检查 ID 是否直接从用户输入获取
- 验证是否有权限检查
- 测试 ID 是否可被枚举

### A02:2021 – 加密失效 (Cryptographic Failures)

**模式**：
```javascript
// ❌ 弱加密算法
const hash = md5(password);
const encrypted = des.encrypt(data, key);

// ❌ 硬编码密钥
const apiKey = "sk_live_1234567890";
const dbPassword = "admin123";

// ✅ 安全实现
const hash = await bcrypt.hash(password, 10);
const encrypted = aes.encrypt(data, key, { mode: 'GCM' });
const apiKey = process.env.API_KEY;
```

**检测方法**：
- 搜索 md5, sha1, des 等弱算法
- 搜索硬编码的密钥、密码
- 检查是否使用环境变量

### A03:2021 – 注入 (Injection)

**SQL 注入**：
```javascript
// ❌ 字符串拼接
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ 参数化查询
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);

// ✅ ORM
const user = await User.findByPk(userId);
```

**命令注入**：
```javascript
// ❌ 命令拼接
const output = exec(`cat ${filename}`);

// ✅ 使用参数化
const output = execFile('cat', [filename]);
```

**检测方法**：
- 搜索字符串拼接的 SQL
- 搜索 exec, system 等函数
- 检查输入验证

### A04:2021 – 不安全设计 (Insecure Design)

**模式**：
- 缺少安全头部
- 不安全的默认配置
- 缺少速率限制
- 缺少日志记录

**检测方法**：
- 检查安全头部（CSP, X-Frame-Options 等）
- 检查默认配置
- 检查速率限制
- 检查日志记录

### A05:2021 – 错误配置 (Security Misconfiguration)

**模式**：
```javascript
// ❌ 调试模式开启
app.set('env', 'development');
app.use(errorHandler({ dumpExceptions: true }));

// ❌ 详细错误信息
app.use((err, req, res, next) => {
  res.status(500).send(err.stack); // 泄露内部信息
});

// ❌ 默认密钥
app.use(session({ secret: 'keyboard cat' }));

// ✅ 安全配置
app.set('env', process.env.NODE_ENV);
app.use(helmet()); // 安全头部

app.use((err, req, res, next) => {
  console.error(err); // 记录详细错误
  res.status(500).send('Internal Server Error'); // 不泄露信息
});

app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: { secure: true, httpOnly: true }
}));
```

**检测方法**：
- 检查调试模式
- 检查错误处理
- 检查默认密钥
- 检查安全配置

### A06:2021 – 过时组件 (Vulnerable and Outdated Components)

**模式**：
```json
// package.json
{
  "dependencies": {
    "lodash": "4.17.15",  // 有已知漏洞
    "express": "4.16.0"    // 过时版本
  }
}
```

**检测方法**：
- 运行 `npm audit`
- 运行 `yarn audit`
- 检查依赖版本
- 检查 CVE 数据库

### A07:2021 – 身份识别和身份验证失败 (Identification and Authentication Failures)

**模式**：
```javascript
// ❌ 弱密码策略
if (password.length < 6) {
  return error('Password too short');
}

// ❌ 明文存储密码
const user = { password: plainPassword };

// ❌ 会话固定
app.use(session({}));

// ✅ 安全实现
if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
  return error('Password does not meet requirements');
}

const hashedPassword = await bcrypt.hash(plainPassword, 10);

app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: { secure: true, httpOnly: true, sameSite: 'strict' },
  rolling: true,  // 定期更新会话
  resave: false,
  saveUninitialized: false
}));
```

**检测方法**：
- 检查密码策略
- 检查密码存储
- 检查会话配置
- 检查多因素认证

### A08:2021 – 软件和数据完整性失败 (Software and Data Integrity Failures)

**模式**：
```javascript
// ❌ 不安全的反序列化
const data = JSON.parse(userInput);
eval(userInput);

// ❌ 不安全的 CDN
<script src="http://untrusted-cdn.com/jquery.js"></script>

// ❌ 不安全的 CI/CD
// 使用未验证的第三方依赖
```

**检测方法**：
- 检查反序列化
- 检查 CDN 来源
- 检查依赖签名
- 检查 CI/CD 配置

### A09:2021 – 安全日志和监控失败 (Security Logging and Monitoring Failures)

**模式**：
```javascript
// ❌ 没有日志
app.post('/login', (req, res) => {
  // 直接登录，没有记录
  res.json({ token });
});

// ❌ 日志泄露敏感信息
console.log(`User login: ${username}, password: ${password}`);

// ✅ 安全实现
app.post('/login', (req, res) => {
  const { username } = req.body;

  // 记录登录尝试
  logger.info('Login attempt', { username, ip: req.ip, userAgent: req.get('User-Agent') });

  // 速率限制
  if (rateLimiter.isBlocked(req.ip)) {
    logger.warn('Rate limit exceeded', { ip: req.ip });
    return res.status(429).json({ error: 'Too many requests' });
  }

  // ... 验证逻辑
});
```

**检测方法**：
- 检查是否有日志
- 检查日志内容
- 检查敏感信息是否被记录
- 检查异常检测

### A10:2021 – 服务器端请求伪造 (Server-Side Request Forgery)

**模式**：
```javascript
// ❌ SSRF 漏洞
app.get('/fetch', (req, res) => {
  const url = req.query.url;
  // 用户可以指定任意 URL
  return fetch(url).then(data => res.json(data));
});

// ✅ 安全实现
app.get('/fetch', (req, res) => {
  const url = req.query.url;

  // 白名单验证
  const allowedDomains = ['api.example.com', 'cdn.example.com'];
  const urlObj = new URL(url);

  if (!allowedDomains.includes(urlObj.hostname)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  // 禁止访问内网
  if (isPrivateIP(urlObj.hostname)) {
    return res.status(400).json({ error: 'Private IP not allowed' });
  }

  return fetch(url).then(data => res.json(data));
});
```

**检测方法**：
- 检查 URL 参数
- 检查网络请求
- 检查内网访问
- 检查白名单

---

## 常见 CWE 漏洞

### CWE-79: XSS (Cross-Site Scripting)

**反射型 XSS**：
```javascript
// ❌ 不安全的输出
app.get('/search', (req, res) => {
  const query = req.query.q;
  res.send(`Search results for: ${query}`);  // XSS
});

// ✅ 安全实现
app.get('/search', (req, res) => {
  const query = req.query.q;
  const escaped = escapeHtml(query);
  res.send(`Search results for: ${escaped}`);
});

// 或使用模板引擎的自动转义
res.render('search', { query });
```

**存储型 XSS**：
```javascript
// ❌ 不安全的存储和输出
app.post('/comment', (req, res) => {
  const comment = req.body.comment;
  db.saveComment(comment);  // 存储未过滤的评论
});

app.get('/comments', (req, res) => {
  const comments = db.getComments();
  res.json(comments);  // 直接输出，XSS
});

// ✅ 安全实现
const DOMPurify = require('dompurify');

app.post('/comment', (req, res) => {
  const comment = req.body.comment;
  const clean = DOMPurify.sanitize(comment);
  db.saveComment(clean);
});
```

### CWE-89: SQL Injection

参见 A03 注入部分。

### CWE-120: Buffer Overflow

**模式**：
```c
// ❌ 缓冲区溢出
char buffer[128];
strcpy(buffer, userInput);  // 没有 bounds checking

// ✅ 安全实现
char buffer[128];
strncpy(buffer, userInput, sizeof(buffer) - 1);
buffer[sizeof(buffer) - 1] = '\0';

// 或使用安全函数
strlcpy(buffer, userInput, sizeof(buffer));
```

**检测方法**：
- 搜索不安全的字符串函数
- 检查数组边界
- 使用静态分析工具

### CWE-125: Out-of-bounds Read

**模式**：
```c
// ❌ 越界读取
int arr[10];
int value = arr[index];  // index 未验证

// ✅ 安全实现
if (index >= 0 && index < 10) {
  int value = arr[index];
} else {
  // 错误处理
}
```

### CWE-22: Improper Limitation of a Pathname to a Restricted Directory ('Path Traversal')

**模式**：
```javascript
// ❌ 路径遍历
app.get('/file', (req, res) => {
  const filename = req.query.name;
  const filepath = path.join('/var/www', filename);
  res.sendFile(filepath);  // 可以访问任意文件
});

// ✅ 安全实现
const path = require('path');

app.get('/file', (req, res) => {
  const filename = req.query.name;
  const root = '/var/www';
  const filepath = path.join(root, filename);

  // 验证路径在 root 目录下
  const normalized = path.normalize(filepath);
  if (!normalized.startsWith(root)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.sendFile(normalized);
});
```

### CWE-287: Improper Authentication

**模式**：
```javascript
// ❌ 弱认证
if (username === 'admin' && password === 'admin123') {
  // 容易被暴力破解
}

// ✅ 安全实现
const bcrypt = require('bcrypt');

async function login(username, password) {
  const user = await db.findUser(username);
  if (!user) {
    return { error: 'Invalid credentials' };
  }

  const isValid = await bcrypt.compare(password, user.hashedPassword);
  if (!isValid) {
    // 记录失败尝试
    await rateLimiter.recordFailedAttempt(username);
    return { error: 'Invalid credentials' };
  }

  // 生成安全的令牌
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });

  return { token };
}
```

### CWE-352: CSRF (Cross-Site Request Forgery)

**模式**：
```javascript
// ❌ 没有 CSRF 保护
app.post('/transfer', (req, res) => {
  const { to, amount } = req.body;
  // 直接执行转账，没有 CSRF 保护
  transferMoney(req.session.userId, to, amount);
});

// ✅ 安全实现
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

app.get('/form', csrfProtection, (req, res) => {
  res.render('form', { csrfToken: req.csrfToken() });
});

app.post('/transfer', csrfProtection, (req, res) => {
  const { to, amount } = req.body;
  // CSRF token 已验证
  transferMoney(req.session.userId, to, amount);
});
```

### CWE-434: Unrestricted Upload of File with Dangerous Type

**模式**：
```javascript
// ❌ 不安全的文件上传
app.post('/upload', (req, res) => {
  const file = req.files.file;
  const filename = file.name;
  // 直接保存，没有验证文件类型
  file.mv(`/uploads/${filename}`);
});

// ✅ 安全实现
const mimeType = require('mime-types');

app.post('/upload', (req, res) => {
  const file = req.files.file;

  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowedTypes.includes(file.mimetype)) {
    return res.status(400).json({ error: 'Invalid file type' });
  }

  // 生成安全的文件名
  const ext = path.extname(file.name);
  const filename = crypto.randomBytes(16).toString('hex') + ext;

  // 保存到安全的目录
  const filepath = path.join('/uploads', filename);
  file.mv(filepath);

  // 设置正确的权限
  fs.chmodSync(filepath, 0o644);

  res.json({ filename });
});
```

---

## 检测方法总结

### 静态分析

1. **代码审查**
   - 人工审查关键代码
   - 使用检查清单
   - 关注安全敏感操作

2. **自动化工具**
   - ESLint / Pylint / golangci-lint
   - SonarQube
   - CodeQL
   - Semgrep

### 动态测试

1. **模糊测试**
   - 输入随机数据
   - 观察异常行为
   - 发现边界情况

2. **渗透测试**
   - 模拟攻击
   - 利用已知漏洞
   - 验证安全性

### 依赖扫描

1. **自动化工具**
   - npm audit
   - yarn audit
   - Snyk
   - Dependabot

2. **手动检查**
   - 定期审查依赖
   - 关注安全公告
   - 及时更新

---

## 优先级

### 高优先级（立即修复）

- SQL 注入
- XSS
- CSRF
- 认证绕过
- 权限提升
- 敏感信息泄露

### 中优先级（计划修复）

- 配置问题
- 日志问题
- 弱加密
- 会话管理
- 错误处理

### 低优先级（最佳实践）

- 代码质量
- 性能优化
- 可维护性
