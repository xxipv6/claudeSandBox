---
paths:
  - "**/*.{js,ts,jsx,tsx,py,go,java,cpp,c,rs}"
---

# 安全规则（强制性）

## 禁止项

### 1. 禁止硬编码密钥

**违反**：
```javascript
const apiKey = "sk_live_1234567890";
const dbPassword = "admin123";
const secret = "keyboard cat";
```

**要求**：
```javascript
const apiKey = process.env.API_KEY;
const dbPassword = process.env.DB_PASSWORD;
const secret = process.env.SECRET;
```

---

### 2. 禁止 SQL 注入

**违反**：
```javascript
const query = `SELECT * FROM users WHERE id = ${userId}`;
db.query(query);
```

**要求**：
```javascript
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);

// 或使用 ORM
const user = await User.findByPk(userId);
```

---

### 3. 禁止 XSS 漏洞

**违反**：
```javascript
div.innerHTML = userInput;
res.send(`Result: ${userInput}`);
```

**要求**：
```javascript
div.textContent = userInput;
res.send(`Result: ${escapeHtml(userInput)}`);

// 或使用自动转义的模板引擎
res.render('page', { userInput });
```

---

### 4. 禁止弱加密

**违反**：
```javascript
const hash = md5(password);
const encrypted = des.encrypt(data, key);
```

**要求**：
```javascript
const hash = await bcrypt.hash(password, 10);
const encrypted = aes.encrypt(data, key, { mode: 'GCM' });
```

---

### 5. 禁止不安全的随机数

**违反**：
```javascript
const token = Math.random().toString(36);
const nonce = Math.floor(Math.random() * 1000000);
```

**要求**：
```javascript
const crypto = require('crypto');
const token = crypto.randomBytes(32).toString('hex');
const nonce = crypto.randomBytes(4).readUInt32BE(0);
```

---

### 6. 禁止明文存储密码

**违反**：
```javascript
const user = {
  username: 'alice',
  password: 'secret123'  // 明文密码
};
```

**要求**：
```javascript
const hashedPassword = await bcrypt.hash('secret123', 10);
const user = {
  username: 'alice',
  password: hashedPassword  // 哈希密码
};
```

---

### 7. 禁止信息泄露

**违反**：
```javascript
app.use((err, req, res, next) => {
  res.json({
    error: err.message,
    stack: err.stack,
    sql: err.sql
  });
});
```

**要求**：
```javascript
app.use((err, req, res, next) => {
  console.error(err);  // 记录详细错误
  res.status(500).json({ error: 'Internal Server Error' });  // 不泄露信息
});
```

---

### 8. 禁止不安全的会话配置

**违反**：
```javascript
app.use(session({
  secret: 'keyboard cat',
  cookie: { secure: false }
}));
```

**要求**：
```javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: {
    secure: true,       // HTTPS only
    httpOnly: true,     // 禁止 JS 访问
    sameSite: 'strict'  // 防止 CSRF
  }
}));
```

---

### 9. 禁止命令注入

**违反**：
```javascript
const output = exec(`cat ${filename}`);
const result = exec(`ls ${userInput}`);
```

**要求**：
```javascript
const output = execFile('cat', [filename]);
// 或验证输入
if (!/^[a-zA-Z0-9._-]+$/.test(userInput)) {
  throw new Error('Invalid input');
}
```

---

### 10. 禁止路径遍历

**违反**：
```javascript
const filepath = path.join('/var/www', filename);
res.sendFile(filepath);
```

**要求**：
```javascript
const root = '/var/www';
const filepath = path.join(root, filename);
const normalized = path.normalize(filepath);
if (!normalized.startsWith(root)) {
  return res.status(403).json({ error: 'Access denied' });
}
res.sendFile(normalized);
```

---

## 必须项

### 1. 必须输入验证

所有用户输入必须验证：
- 类型
- 长度
- 格式
- 范围

使用白名单而非黑名单。

### 2. 必须输出编码

所有输出必须正确编码：
- HTML 输出 → HTML 编码
- URL 输出 → URL 编码
- SQL 输出 → 参数化查询
- JSON 输出 → JSON 编码

### 3. 必须认证授权

所有端点必须：
- 检查认证
- 检查授权
- 验证权限

### 4. 必须错误处理

所有错误必须：
- 记录详细日志
- 不泄露敏感信息
- 返回通用错误消息

### 5. 必须使用安全头部

必须设置：
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security`
- `Content-Security-Policy`

### 6. 必须速率限制

必须对以下操作限制：
- 登录
- API 调用
- 敏感操作

### 7. 必须日志记录

必须记录：
- 认证事件
- 授权失败
- 安全事件
- 错误信息

但不要记录敏感信息（密码、令牌等）。

---

## 检查清单

在提交代码前，确认：

- [ ] 没有硬编码密钥
- [ ] 所有输入都被验证
- [ ] 所有输出都被编码
- [ ] 没有SQL 注入风险
- [ ] 没有XSS 漏洞
- [ ] 密码被哈希存储
- [ ] 使用强加密算法
- [ ] 会话配置安全
- [ ] 错误处理不泄露信息
- [ ] 设置了安全头部
- [ ] 有速率限制
- [ ] 有日志记录

---

## 违反后果

违反这些规则可能导致：
- 安全漏洞
- 数据泄露
- 系统被入侵
- 法律责任
- 声誉损失

**遵守这些规则是强制性的。**
