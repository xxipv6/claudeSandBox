---
name: vuln-patterns
description: OWASP Top 10 和常见 CWE 漏洞模式、识别方法、利用场景和修复方案。
disable-model-invocation: false
---

# 漏洞模式 (Vulnerability Patterns)

## 何时激活 (When to Activate)

- 进行安全代码审计时
- 编写安全测试用例时
- 进行渗透测试时
- 设计安全架构时
- 修复安全漏洞时

---

## OWASP Top 10 (2021)

### A01: 访问控制失效 (Broken Access Control)

#### 漏洞描述

用户可以访问或操作超出其权限范围的资源或功能。

#### 常见模式

##### 1. IDOR（不安全的直接对象引用）
```python
# ❌ 漏洞代码
@app.route('/api/users/<int:user_id>')
def get_user(user_id):
    user = db.query(User).get(user_id)
    return jsonify(user.to_dict())

# 攻击：修改 URL 中的 user_id，可以访问其他用户信息
# GET /api/users/1  → 获取用户 1 的信息
# GET /api/users/2  → 获取用户 2 的信息（未授权）

# ✅ 修复：添加权限检查
@app.route('/api/users/<int:user_id>')
@require_auth
def get_user(user_id):
    current_user = g.user
    if current_user.id != user_id and not current_user.is_admin:
        return jsonify({'error': 'Forbidden'}), 403

    user = db.query(User).get(user_id)
    return jsonify(user.to_dict())
```

##### 2. 水平权限绕过
```python
# ❌ 漏洞代码
@app.route('/api/orders/<int:order_id>')
def get_order(order_id):
    order = db.query(Order).get(order_id)
    return jsonify(order.to_dict())

# 攻击：已登录用户可以访问其他用户的订单

# ✅ 修复：验证资源所有权
@app.route('/api/orders/<int:order_id>')
@require_auth
def get_order(order_id):
    current_user = g.user
    order = db.query(Order).get(order_id)

    if not order or order.user_id != current_user.id:
        return jsonify({'error': 'Not found'}), 404

    return jsonify(order.to_dict())
```

##### 3. 垂直权限提升
```python
# ❌ 漏洞代码：仅依赖前端限制
# 前端：隐藏管理员按钮
# 后端：没有验证管理员权限

@app.route('/api/admin/users')
def admin_list_users():
    users = db.query(User).all()
    return jsonify([u.to_dict() for u in users])

# 攻击：直接访问 /api/admin/users 获取所有用户

# ✅ 修复：后端权限验证
@app.route('/api/admin/users')
@require_auth
@admin_required
def admin_list_users():
    users = db.query(User).all()
    return jsonify([u.to_dict() for u in users])

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not g.user.is_admin:
            return jsonify({'error': 'Forbidden'}), 403
        return f(*args, **kwargs)
    return decorated_function
```

#### 检测方法

1. **手动测试**：修改 URL 参数、Cookie、Header
2. **自动化扫描**：Burp Suite, OWASP ZAP
3. **代码审计**：查找缺少权限检查的端点

---

### A02: 加密失败 (Cryptographic Failures)

#### 漏洞描述

敏感数据未加密或使用弱加密算法，导致数据泄露。

#### 常见模式

##### 1. 明文存储密码
```python
# ❌ 漏洞代码
def create_user(username, password):
    user = User(username=username, password=password)
    db.save(user)

# 数据库泄露 → 所有密码明文暴露

# ✅ 修复：使用 bcrypt
import bcrypt

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

def verify_password(password, hashed):
    return bcrypt.checkpw(password.encode('utf-8'), hashed)

def create_user(username, password):
    hashed = hash_password(password)
    user = User(username=username, password_hash=hashed)
    db.save(user)
```

##### 2. 弱加密算法
```python
# ❌ 漏洞代码
import hashlib

def encrypt_sensitive_data(data):
    return hashlib.md5(data.encode()).hexdigest()

# MD5 已被破解，易受彩虹表攻击

# ✅ 修复：使用强加密算法
from cryptography.fernet import Fernet

def encrypt_data(data):
    key = load_encryption_key()
    cipher = Fernet(key)
    return cipher.encrypt(data.encode())

def decrypt_data(encrypted_data):
    key = load_encryption_key()
    cipher = Fernet(key)
    return cipher.decrypt(encrypted_data).decode()
```

##### 3. HTTPS 缺失
```javascript
// ❌ 漏洞代码
// 服务器仅监听 HTTP
app.listen(80, () => {
    console.log('HTTP server running on port 80')
})

// 中间人攻击可以窃听所有通信

// ✅ 修复：强制 HTTPS
const https = require('https')
const fs = require('fs')

const options = {
    key: fs.readFileSync('private-key.pem'),
    cert: fs.readFileSync('certificate.pem')
}

https.createServer(options, app).listen(443, () => {
    console.log('HTTPS server running on port 443')
})

// HTTP 重定向到 HTTPS
const http = require('http')
http.createServer((req, res) => {
    res.writeHead(301, {'Location': `https://${req.headers.host}${req.url}`})
    res.end()
}).listen(80)
```

#### 检测方法

1. **流量分析**：Wireshark 抓包查看明文数据
2. **代码审计**：查找 MD5, SHA1, DES 等弱算法
3. **数据库检查**：密码字段是否为哈希值

---

### A03: 注入 (Injection)

#### 漏洞描述

不受信任的数据作为命令或查询的一部分发送给解释器。

#### 常见模式

##### 1. SQL 注入
```python
# ❌ 漏洞代码
def get_user(username):
    query = f"SELECT * FROM users WHERE username = '{username}'"
    return db.execute(query)

# 攻击：username = "admin' OR '1'='1"
# 查询变为：SELECT * FROM users WHERE username = 'admin' OR '1'='1'
# 绕过认证

# ✅ 修复：参数化查询
def get_user(username):
    query = "SELECT * FROM users WHERE username = %s"
    return db.execute(query, (username,))

# 或使用 ORM
def get_user(username):
    return User.query.filter_by(username=username).first()
```

##### 2. NoSQL 注入
```javascript
// ❌ 漏洞代码
app.get('/users', (req, res) => {
    const { username } = req.query
    User.find({ username }, (err, users) => {
        res.json(users)
    })
})

// 攻击：?username[$ne]=null
// 查询变为：{ username: { $ne: null } }
// 返回所有用户

// ✅ 修复：输入验证和类型强制
app.get('/users', (req, res) => {
    let { username } = req.query

    // 类型验证
    if (typeof username !== 'string') {
        return res.status(400).json({ error: 'Invalid username' })
    }

    // 白名单验证
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({ error: 'Invalid characters' })
    }

    User.find({ username }, (err, users) => {
        res.json(users)
    })
})
```

##### 3. 命令注入
```python
# ❌ 漏洞代码
def convert_image(filename):
    os.system(f"convert {filename} output.png")

# 攻击：filename = "input.png; rm -rf /"
# 命令变为：convert input.png; rm -rf / output.png
# 删除所有文件

# ✅ 修复：使用 subprocess
import subprocess

def convert_image(filename):
    # 白名单验证扩展名
    allowed_extensions = {'.png', '.jpg', '.gif'}
    if not any(filename.endswith(ext) for ext in allowed_extensions):
        raise ValueError("Invalid file type")

    # 使用 subprocess（参数化）
    subprocess.run(['convert', filename, 'output.png'], check=True)
```

##### 4. 模板注入
```python
# ❌ 漏洞代码
from jinja2 import Template

def render_template(template_string, context):
    template = Template(template_string)
    return template.render(**context)

# 攻击：template_string = "{{ config.items() }}"
# 泄露配置信息

# ✅ 修复：禁用危险功能
from jinja2 import Template, StrictUndefined

def render_template(template_string, context):
    template = Template(
        template_string,
        undefined=StrictUndefined,
        autoescape=False  # 启用自动转义
    )
    return template.render(**context)
```

#### 检测方法

1. **模糊测试**：发送特殊字符（', ", `, ;, $, {{, }}）
2. **自动化扫描**：SQLMap, NoSQLMap
3. **代码审计**：查找字符串拼接的查询

---

### A04: 不安全设计 (Insecure Design)

#### 漏洞描述

系统设计和架构中的缺陷，导致安全漏洞。

#### 常见模式

##### 1. 缺少速率限制
```python
# ❌ 漏洞代码
@app.route('/api/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']
    # 无速率限制，允许暴力破解

# ✅ 修复：添加速率限制
from flask_limiter import Limiter

limiter = Limiter(app, key_func=lambda: request.remote_addr)

@app.route('/api/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    username = request.form['username']
    password = request.form['password']
    # 验证逻辑
```

##### 2. 不安全的默认设置
```python
# ❌ 漏洞代码
# 默认密码
DEFAULT_PASSWORD = "admin123"

# 默认开启调试模式
app.run(debug=True)

# ✅ 修复：强制修改默认值
import os

def get_default_password():
    password = os.environ.get('DEFAULT_PASSWORD')
    if not password:
        raise ValueError("DEFAULT_PASSWORD must be set")
    if password == "admin123":
        raise ValueError("Change default password")
    return password

if __name__ == '__main__':
    debug = os.environ.get('DEBUG', 'false').lower() == 'true'
    app.run(debug=debug)
```

##### 3. 缺少安全头
```python
# ❌ 漏洞代码：没有安全响应头
@app.route('/')
def index():
    return render_template('index.html')

# ✅ 修复：添加安全头
@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Content-Security-Policy'] = "default-src 'self'"
    return response
```

#### 检测方法

1. **配置审查**：检查默认配置
2. **威胁建模**：分析系统设计中的威胁
3. **架构审查**：检查安全控制是否缺失

---

### A05: 安全配置错误 (Security Misconfiguration)

#### 漏洞描述

不安全的默认配置、不完整的配置、开放云存储等。

#### 常见模式

##### 1. 调试信息泄露
```python
# ❌ 漏洞代码
app.run(debug=True)

# 错误页面包含完整堆栈跟踪
# 泄露路径、环境变量、敏感信息

# ✅ 修复：生产环境禁用调试
DEBUG = os.environ.get('DEBUG', 'false').lower() == 'true'

if __name__ == '__main__':
    app.run(debug=DEBUG)

# 自定义错误页面
@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('500.html'), 500
```

##### 2. CORS 配置错误
```python
# ❌ 漏洞代码
from flask_cors import CORS

CORS(app)  # 允许所有源

# ✅ 修复：明确指定允许的源
CORS(app, origins={
    'https://example.com',
    'https://www.example.com'
})

# 或
CORS(app, resources={
    r'/api/*': {
        'origins': ['https://example.com']
    }
})
```

##### 3. 云存储公开
```yaml
# ❌ 漏洞配置（AWS S3）
# BucketPolicy:
#   Effect: Allow
#   Principal: "*"
#   Action: "s3:*"
#   Resource: "arn:aws:s3:::my-bucket/*"

# 任何人都可以访问和下载

# ✅ 修复：限制访问
BucketPolicy:
  Effect: Allow
  Principal:
    AWS: "arn:aws:iam::ACCOUNT_ID:user/user-name"
  Action: "s3:GetObject"
  Resource: "arn:aws:s3:::my-bucket/*"
```

#### 检测方法

1. **配置扫描**：AWS Config, Azure Security Center
2. **手动检查**：查看安全头、CORS 配置
3. **工具扫描**：NginxConfigScanner, Misconfiguration Scanner

---

### A06: 易受攻击和过时的组件 (Vulnerable and Outdated Components)

#### 漏洞描述

使用已知漏洞的库、框架或组件。

#### 常见模式

##### 1. 使用过时的依赖
```json
// package.json（❌ 漏洞）
{
  "dependencies": {
    "express": "4.0.0",  // 2014 年发布，有已知漏洞
    "lodash": "3.0.0"    // 原型污染漏洞
  }
}

// ✅ 修复：更新到最新版本
{
  "dependencies": {
    "express": "^4.18.0",
    "lodash": "^4.17.21"
  }
}
```

##### 2. 不移除默认凭证
```python
# ❌ 漏洞代码
# Dockerfile
FROM postgres:latest
ENV POSTGRES_PASSWORD=admin123  # 默认密码

# ✅ 修复：强制环境变量
FROM postgres:latest
ENV POSTGRES_PASSWORD=${POSTGRES_PASSWORD}

# 运行时必须设置
# docker run -e POSTGRES_PASSWORD=$(openssl rand -base64 32) postgres
```

#### 检测方法

1. **依赖扫描**：npm audit, Snyk, OWASP Dependency-Check
2. **版本检查**：定期检查更新
3. **漏洞数据库**：CVE, NVD

---

### A07: 身份识别和身份验证失败 (Identification and Authentication Failures)

#### 漏洞描述

认证机制缺陷，允许攻击者绕过认证。

#### 常见模式

##### 1. 弱密码策略
```python
# ❌ 漏洞代码
def create_user(username, password):
    if len(password) < 1:  # 几乎没有要求
        raise ValueError("Password too short")
    user = User(username=username, password=password)

# ✅ 修复：强密码策略
import re

def validate_password(password):
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters")
    if not re.search(r'[A-Z]', password):
        raise ValueError("Password must contain uppercase letter")
    if not re.search(r'[a-z]', password):
        raise ValueError("Password must contain lowercase letter")
    if not re.search(r'\d', password):
        raise ValueError("Password must contain digit")
    if not re.search(r'[!@#$%^&*]', password):
        raise ValueError("Password must contain special character")
    return True

def create_user(username, password):
    validate_password(password)
    hashed = hash_password(password)
    user = User(username=username, password_hash=hashed)
```

##### 2. 会话固定
```python
# ❌ 漏洞代码
@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']

    if authenticate(username, password):
        # 使用现有会话 ID
        session['logged_in'] = True
        return redirect('/dashboard')

# 攻击：攻击者先获取会话 ID，诱导受害者使用该 ID 登录

# ✅ 修复：登录后重新生成会话
@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']

    if authenticate(username, password):
        # 重新生成会话
        session.regenerate()
        session['user_id'] = get_user_id(username)
        session['logged_in'] = True
        return redirect('/dashboard')
```

#### 检测方法

1. **暴力破解测试**：Hydra, Medusa
2. **会话分析**：检查会话管理
3. **密码策略审查**：检查密码复杂度要求

---

### A08: 软件和数据完整性失败 (Software and Data Integrity Failures)

#### 漏洞描述

未验证软件更新、CI/CD 管道、数据完整性。

#### 常见模式

##### 1. 不安全的反序列化
```python
# ❌ 漏洞代码
import pickle

def load_user_data(data):
    return pickle.loads(data)

# 攻击：pickle 可以执行任意代码
# payload = "__import__('os').system('rm -rf /')"
# pickle.loads(payload)

# ✅ 修复：使用安全的序列化格式
import json

def load_user_data(data):
    return json.loads(data)  # JSON 是安全的

# 或使用 yaml.safe_load
import yaml

def load_config(data):
    return yaml.safe_load(data)  # safe_load 禁止对象执行
```

##### 2. 未验证的下载
```python
# ❌ 漏洞代码
import requests

def download_and_install(url):
    response = requests.get(url)
    code = response.content
    exec(code)  # 执行任意代码

# 攻击：中间人攻击，替换下载内容

# ✅ 修复：验证签名
import hashlib
import requests

def download_and_verify(url, expected_hash):
    response = requests.get(url)
    content = response.content

    # 验证哈希
    actual_hash = hashlib.sha256(content).hexdigest()
    if actual_hash != expected_hash:
        raise ValueError("Hash mismatch!")

    # 验证签名
    if not verify_signature(content, signature):
        raise ValueError("Invalid signature!")

    return content
```

#### 检测方法

1. **反序列化测试**：使用各种 payload 测试
2. **签名验证**：检查是否有完整性检查
3. **供应链审计**：检查依赖和下载源

---

### A09: 安全日志和监控失败 (Security Logging and Monitoring Failures)

#### 漏洞描述

缺少日志记录、监控和告警，无法检测攻击。

#### 常见模式

##### 1. 缺少安全日志
```python
# ❌ 漏洞代码
@app.route('/api/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']

    if authenticate(username, password):
        return jsonify({'token': generate_token()})
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

# 无法检测暴力破解攻击

# ✅ 修复：添加日志
import logging

logger = logging.getLogger(__name__)

@app.route('/api/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']
    ip = request.remote_addr

    if authenticate(username, password):
        logger.info(f"Successful login", extra={
            'username': username,
            'ip': ip,
            'event': 'login_success'
        })
        return jsonify({'token': generate_token()})
    else:
        logger.warning(f"Failed login attempt", extra={
            'username': username,
            'ip': ip,
            'event': 'login_failure'
        })
        return jsonify({'error': 'Invalid credentials'}), 401
```

##### 2. 敏感信息日志
```python
# ❌ 漏洞代码
logger.info(f"User logged in: {user}")
# 日志：User logged in: {'id': 1, 'username': 'admin', 'password': 'hashed123', 'credit_card': '4111...'}

# ✅ 修复：过滤敏感信息
logger.info(f"User logged in", extra={
    'user_id': user.id,
    'username': user.username
    # 不记录 password, credit_card 等
})
```

#### 检测方法

1. **日志审查**：检查是否有足够的日志
2. **监控测试**：模拟攻击，检查告警
3. **日志分析**：ELK Stack, Splunk

---

### A10: 服务器端请求伪造 (SSRF)

#### 漏洞描述

应用程序获取远程资源时未验证用户提供的 URL。

#### 常见模式

##### 1. 无限制的 URL 获取
```python
# ❌ 漏洞代码
import requests

def fetch_url(url):
    response = requests.get(url)
    return response.text

# 攻击：
# fetch_url('file:///etc/passwd')  → 读取本地文件
# fetch_url('http://localhost:6379')  → 访问内部服务
# fetch_url('http://169.254.169.254/latest/meta-data/')  → AWS 元数据

# ✅ 修复：URL 白名单
from urllib.parse import urlparse

ALLOWED_HOSTS = {'api.example.com', 'cdn.example.com'}

def fetch_url(url):
    parsed = urlparse(url)

    # 检查协议
    if parsed.scheme not in {'http', 'https'}:
        raise ValueError("Only HTTP/HTTPS allowed")

    # 检查主机
    if parsed.netloc not in ALLOWED_HOSTS:
        raise ValueError("Host not allowed")

    # 禁止访问内部地址
    import socket
    try:
        ip = socket.gethostbyname(parsed.netloc)
    except socket.gaierror:
        raise ValueError("Invalid host")

    # 检查是否为私有 IP
    import ipaddress
    addr = ipaddress.ip_address(ip)
    if addr.is_private or addr.is_loopback:
        raise ValueError("Private IP not allowed")

    return requests.get(url).text
```

#### 检测方法

1. **模糊测试**：尝试内部 URL、file:// 协议
2. **DNS 重绑定**：绕过 IP 检查
3. **时间延迟**：检测是否访问了内部服务

---

## 常见 CWE 漏洞

### CWE-79: XSS（跨站脚本）

```html
<!-- ❌ 漏洞代码 -->
<div>{{ user_input }}</div>

<!-- 攻击：user_input = "<script>alert('XSS')</script>" -->

<!-- ✅ 修复：转义输出 -->
<div>{{ user_input | escape }}</div>

<!-- 或使用 DOMPurify -->
<script>
const clean = DOMPurify.sanitize(user_input);
element.innerHTML = clean;
</script>
```

### CWE-89: SQL 注入

```python
# ✅ 参见 A03 注入章节
```

### CWE-352: CSRF（跨站请求伪造）

```python
# ❌ 漏洞代码
@app.route('/api/transfer', methods=['POST'])
def transfer():
    to = request.form['to']
    amount = request.form['amount']
    # 没有 CSRF token，可以跨站伪造请求

# ✅ 修复：添加 CSRF token
from flask_wtf.csrf import CSRFProtect

csrf = CSRFProtect(app)

@app.route('/api/transfer', methods=['POST'])
@csrf.exempt  # 不！不要使用这个
def transfer():
    token = request.form.get('csrf_token')
    if not validate_csrf(token):
        return jsonify({'error': 'Invalid CSRF token'}), 403

    to = request.form['to']
    amount = request.form['amount']
    # 转账逻辑
```

### CWE-22: 路径遍历

```python
# ❌ 漏洞代码
def read_file(filename):
    path = f'/var/www/files/{filename}'
    return open(path).read()

# 攻击：filename = "../../etc/passwd"
# 读取 /etc/passwd

# ✅ 修复：路径验证
import os

def read_file(filename):
    base_dir = '/var/www/files'
    path = os.path.join(base_dir, filename)

    # 规范化路径
    path = os.path.realpath(path)

    # 检查是否在 base_dir 内
    if not path.startswith(base_dir):
        raise ValueError("Invalid path")

    return open(path).read()
```

### CWE-287: 认证不当

```python
# ❌ 漏洞代码：时序攻击
def authenticate(username, password):
    user = get_user(username)
    if not user:
        return False
    # 明文比较，存在时序差异
    return user.password == password

# ✅ 修复：使用恒定时间比较
import hmac

def authenticate(username, password):
    user = get_user(username)
    if not user:
        # 使用恒定时间比较（即使失败也）
        hmac.compare_digest(password, 'dummy')
        return False
    return hmac.compare_digest(password, user.password)
```

---

## 漏洞检测工具

### 自动化扫描

| 工具 | 类型 | 用途 |
|------|------|------|
| **Burp Suite** | DAST | Web 应用安全测试 |
| **OWASP ZAP** | DAST | 免费 Web 扫描器 |
| **SQLMap** | 注入 | SQL 注入检测 |
| **SonarQube** | SAST | 代码质量+安全 |
| **Snyk** | SCA | 依赖漏洞扫描 |
| **Trivy** | SCA | 容器+依赖扫描 |

### 代码审计

```bash
# Python 安全检查
pip install bandit
bandit -r ./src

# JavaScript 安全检查
npm install -g npm-audit
npm audit

# Go 安全检查
go install github.com/securego/gosec/v2/cmd/gosec@latest
gosec ./...

# 依赖扫描
pip install safety
safety check
```

---

## 修复优先级

| 优先级 | 漏洞类型 | 修复时间 |
|--------|----------|----------|
| 🔴 **Critical** | RCE, SQL 注入, 认证绕过 | 立即修复 |
| 🟠 **High** | XSS, CSRF, SSRF | 7 天内 |
| 🟡 **Medium** | 配置错误, 信息泄露 | 30 天内 |
| 🔵 **Low** | 最佳实践, 可选改进 | 下个版本 |

---

**记住**：漏洞模式是不断演进的。定期更新知识、使用最新工具、进行安全审计是保持系统安全的关键。
