---
description: 安全编码规范和最佳实践
disable-model-invocation: false
---

# 安全编码规范

## 核心原则

1. **永远不要信任用户输入**
2. **使用最小权限原则**
3. **防御深度**
4. **默认安全**
5. **公开设计原则**

---

## 输入验证

### 白名单 vs 黑名单

```javascript
// ❌ 黑名单（不推荐）
if (input.includes('<script>')) {
  // 拒绝
}

// ✅ 白名单（推荐）
if (/^[a-zA-Z0-9]+$/.test(input)) {
  // 接受
}
```

### 验证时机

1. **输入时** - 接收数据时验证
2. **使用时** - 使用数据前再次验证
3. **输出时** - 输出数据时编码

### 验证类型

```javascript
// 类型验证
if (typeof input !== 'string') {
  throw new Error('Invalid type');
}

// 长度验证
if (input.length > 1000) {
  throw new Error('Input too long');
}

// 格式验证
if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)) {
  throw new Error('Invalid email format');
}

// 范围验证
if (age < 0 || age > 150) {
  throw new Error('Invalid age');
}
```

---

## 输出编码

### HTML 编码

```javascript
// ❌ 不安全
div.innerHTML = userInput;

// ✅ 安全
div.textContent = userInput;

// 或使用库
import DOMPurify from 'dompurify';
div.innerHTML = DOMPurify.sanitize(userInput);
```

### URL 编码

```javascript
// ❌ 不安全
const url = `https://example.com/search?q=${userInput}`;

// ✅ 安全
const url = `https://example.com/search?q=${encodeURIComponent(userInput)}`;
```

### SQL 编码

```javascript
// ❌ 不安全
const query = `SELECT * FROM users WHERE name = '${userInput}'`;

// ✅ 安全（参数化查询）
const query = 'SELECT * FROM users WHERE name = ?';
db.query(query, [userInput]);
```

### JSON 编码

```javascript
// ✅ 安全（自动转义）
const json = JSON.stringify(data);
```

---

## 认证与授权

### 密码存储

```javascript
// ❌ 不安全
const password = 'plain text';

// ❌ 不安全（弱哈希）
const hash = md5(password);
const hash = sha1(password);

// ✅ 安全（强哈希）
const hash = await bcrypt.hash(password, 10);
const hash = await argon2.hash(password);

// 验证
const isValid = await bcrypt.compare(password, hash);
```

### 会话管理

```javascript
// ✅ 安全的会话配置
app.use(session({
  secret: process.env.SESSION_SECRET,  // 强密钥
  name: 'sessionId',                    // 不要用默认的 connect.sid
  cookie: {
    secure: true,       // 仅 HTTPS
    httpOnly: true,     // 禁止 JavaScript 访问
    sameSite: 'strict', // 防止 CSRF
    maxAge: 3600000     // 1 小时过期
  },
  rolling: true,        // 定期刷新
  resave: false,
  saveUninitialized: false
}));
```

### JWT 最佳实践

```javascript
// ✅ 安全的 JWT 配置
const token = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,  // 强密钥
  {
    expiresIn: '1h',        // 短期过期
    issuer: 'myapp',
    audience: 'myapp-api'
  }
);

// 验证
const decoded = jwt.verify(token, process.env.JWT_SECRET, {
  issuer: 'myapp',
  audience: 'myapp-api'
});
```

### 授权检查

```javascript
// ✅ 每个端点都要检查
app.get('/admin/users', (req, res) => {
  // 检查认证
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 检查权限
  const user = await getUser(req.session.userId);
  if (!user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // 执行操作
  res.json(await getAllUsers());
});

// 使用中间件
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

app.get('/admin/users', requireAuth, requireAdmin, (req, res) => {
  res.json(await getAllUsers());
});
```

---

## 加密

### 使用现代算法

```javascript
// ❌ 不安全（弱算法）
const encrypted = des.encrypt(data, key);
const hash = md5(data);

// ✅ 安全（强算法）
const encrypted = aes.encrypt(data, key, { mode: 'GCM' });
const hash = await bcrypt.hash(data, 10);
```

### 密钥管理

```javascript
// ❌ 不安全（硬编码）
const apiKey = 'sk_live_1234567890';
const dbPassword = 'admin123';

// ✅ 安全（环境变量）
const apiKey = process.env.API_KEY;
const dbPassword = process.env.DB_PASSWORD;

// 使用密钥管理服务
const apiKey = await secretsManager.getSecret('api-key');
```

### 随机数生成

```javascript
// ❌ 不安全
const random = Math.random();  // 可预测

// ✅ 安全（加密学安全）
const crypto = require('crypto');
const random = crypto.randomBytes(32).toString('hex');

// 生成 ID
const uuid = crypto.randomUUID();
```

---

## 错误处理

### 不泄露敏感信息

```javascript
// ❌ 不安全（泄露内部信息）
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: err.message,
    stack: err.stack,  // 泄露内部实现
    sql: err.sql       // 泄露 SQL 查询
  });
});

// ✅ 安全
app.use((err, req, res, next) => {
  // 详细错误只记录到日志
  console.error(err);

  // 用户只看到通用消息
  res.status(500).json({
    error: 'Internal Server Error'
  });
});
```

### 日志安全

```javascript
// ❌ 不安全（记录敏感信息）
console.log('User login:', {
  username,
  password,  // 泄露密码
  creditCard // 泄露信用卡号
});

// ✅ 安全
console.log('User login:', {
  username,
  ip: req.ip,
  userAgent: req.get('User-Agent')
});
```

---

## 安全配置

### 安全头部

```javascript
// ✅ 使用 Helmet
const helmet = require('helmet');
app.use(helmet());

// 手动设置
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});
```

### CORS 配置

```javascript
// ✅ 严格的 CORS
const cors = require('cors');

app.use(cors({
  origin: 'https://trusted-domain.com',  // 白名单
  credentials: true,
  methods: ['GET', 'POST'],              // 限制方法
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 速率限制

```javascript
// ✅ 防止暴力破解
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 分钟
  max: 5,                     // 最多 5 次
  message: 'Too many login attempts'
});

app.post('/login', loginLimiter, (req, res) => {
  // 登录逻辑
});
```

---

## 依赖安全

### 定期更新

```bash
# 检查过期依赖
npm outdated

# 更新依赖
npm update

# 审计漏洞
npm audit
npm audit fix
```

### 锁定版本

```json
// package.json
{
  "dependencies": {
    "express": "^4.18.0",  // 允许小版本更新
    "bcrypt": "~5.1.0",   // 只允许补丁更新
    "lodash": "4.17.21"   // 锁定确切版本
  }
}
```

---

## 代码审查清单

### 输入验证

- [ ] 所有用户输入都被验证
- [ ] 使用白名单而非黑名单
- [ ] 验证类型、长度、格式、范围
- [ ] 输出时正确编码

### 认证授权

- [ ] 密码使用强哈希（bcrypt、argon2）
- [ ] 会话配置安全（httpOnly、secure、sameSite）
- [ ] JWT 使用强密钥和短期过期
- [ ] 每个端点都检查权限

### 加密

- [ ] 使用现代加密算法
- [ ] 密钥不在代码中硬编码
- [ ] 使用环境变量或密钥管理
- [ ] 随机数使用加密安全生成器

### 错误处理

- [ ] 错误不泄露敏感信息
- [ ] 详细错误只记录到日志
- [ ] 用户只看到通用错误消息

### 配置

- [ ] 设置安全头部
- [ ] CORS 配置严格
- [ ] 速率限制防止暴力破解
- [ ] 调试模式在生产环境关闭

### 依赖

- [ ] 定期更新依赖
- [ ] 运行安全审计
- [ ] 锁定关键依赖版本

---

## 工具推荐

### 静态分析

- **ESLint** - JavaScript/TypeScript
- **Pylint** - Python
- **golangci-lint** - Go
- **SonarQube** - 多语言

### 依赖扫描

- **npm audit** - Node.js
- **yarn audit** - Yarn
- **Safety** - Python
- **Snyk** - 多语言

### 安全测试

- **OWASP ZAP** - Web 应用扫描
- **Burp Suite** - 渗透测试
- **sqlmap** - SQL 注入测试

---

## 参考资源

- **OWASP Top 10** - https://owasp.org/www-project-top-ten/
- **CWE** - https://cwe.mitre.org/
- **Secure Coding** - https://wiki.sei.cmu.edu/confluence/display/seccode
