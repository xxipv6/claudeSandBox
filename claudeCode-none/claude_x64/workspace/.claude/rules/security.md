# 安全编码规范 (Security Coding Standards)

## 核心原则

**永远不要信任用户输入**。所有输入都必须被验证、清理和适当转义。

---

## 通用安全规范

### 1. 输入验证 (Input Validation)

#### ✅ 正确做法
```python
# 白名单验证
def validate_username(username: str) -> bool:
    """只允许字母数字和下划线，4-20字符。"""
    pattern = r'^[a-zA-Z0-9_]{4,20}$'
    return re.match(pattern, username) is not None

# 类型验证
def validate_age(age: Any) -> bool:
    """年龄必须是整数且在合理范围内。"""
    if not isinstance(age, int):
        return False
    return 0 <= age <= 150
```

#### ❌ 错误做法
```python
# 黑名单验证（容易被绕过）
def validate_username(username: str) -> bool:
    """移除危险字符 - 不安全！"""
    dangerous = [';', '-', "'", '"']
    for char in dangerous:
        username = username.replace(char, '')
    return True
```

### 2. 输出编码 (Output Encoding)

#### HTML 输出（防止 XSS）
```typescript
// ❌ 危险
<div>{userInput}</div>

// ✅ 安全 - React 自动转义
<div>{userInput}</div>

// ✅ 安全 - 手动转义
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

#### URL 输出（防止 URL 注入）
```python
from urllib.parse import urlencode

# ✅ 安全
safe_url = f"/api/search?{urlencode({'q': query})}"
```

#### SQL 输出（防止 SQL 注入）
```python
# ❌ 危险 - SQL 注入
query = f"SELECT * FROM users WHERE name = '{user_input}'"

# ✅ 安全 - 参数化查询
query = "SELECT * FROM users WHERE name = %s"
cursor.execute(query, (user_input,))
```

### 3. 认证与授权 (Authentication & Authorization)

#### 密码存储
```python
import bcrypt
import secrets

def hash_password(password: str) -> str:
    """使用 bcrypt 哈希密码。"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt)

def verify_password(password: str, hashed: str) -> bool:
    """验证密码。"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed)
```

#### 会话管理
```python
# ✅ 安全 - 使用 httpOnly cookie
response.set_cookie(
    'session_id',
    session_token,
    httponly=True,      # 防止 XSS
    secure=True,        # 仅 HTTPS
    samesite='strict'   # 防止 CSRF
)

# ❌ 危险 - localStorage 可被 XSS 访问
localStorage.setItem('token', token)
```

#### 权限检查
```python
from functools import wraps

def require_permission(permission: str):
    """装饰器：检查用户权限。"""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            user = get_current_user()
            if not user or not user.has_permission(permission):
                raise ForbiddenException("Permission denied")
            return f(*args, **kwargs)
        return wrapper
    return decorator

@require_permission('user.delete')
def delete_user(user_id: int):
    pass
```

### 4. 加密与敏感数据 (Cryptography & Sensitive Data)

#### 加密配置
```python
from cryptography.fernet import Fernet

# ✅ 安全 - 使用环境变量
key = os.environ.get('ENCRYPTION_KEY')
if not key:
    raise ValueError("ENCRYPTION_KEY not set")
cipher = Fernet(key)

# ❌ 危险 - 硬编码密钥
API_KEY = "sk_live_1234567890abcdef"
```

#### 敏感数据处理
```python
# ✅ 安全 - 记录时移除敏感信息
logger.info({"user_id": user.id, "action": "login"})

# ❌ 危险 - 记录敏感信息
logger.info({"user": user, "password": password})
```

### 5. 错误处理 (Error Handling)

#### ✅ 正确做法
```python
# 不向用户暴露系统信息
try:
    result = process_payment(user, amount)
except PaymentError as e:
    logger.error(f"Payment failed: {e}")  # 详细日志
    raise UserFacingError("Payment failed")  # 用户友好消息
```

#### ❌ 错误做法
```python
# 暴露系统信息
try:
    result = process_payment(user, amount)
except Exception as e:
    return {"error": str(e), "stack": traceback.format_exc()}
```

### 6. 文件上传 (File Upload)

```python
import magic
import os
from pathlib import Path

def safe_upload(file, upload_dir: str) -> str:
    """安全的文件上传。"""
    # 1. 验证文件类型（不依赖扩展名）
    mime = magic.from_buffer(file.read(1024), mime=True)
    file.seek(0)

    allowed_mimes = {'image/jpeg', 'image/png', 'application/pdf'}
    if mime not in allowed_mimes:
        raise ValueError("Invalid file type")

    # 2. 生成安全的文件名
    ext = os.path.splitext(file.filename)[1]
    safe_name = secrets.token_hex(16) + ext

    # 3. 保存到 web 根目录外
    path = Path(upload_dir) / safe_name
    path.write_bytes(file.read())

    return str(path)
```

### 7. API 安全 (API Security)

#### CORS 配置
```python
# ❌ 危险 - 允许所有源
CORS_ORIGINS = "*"

# ✅ 安全 - 明确指定允许的源
CORS_ORIGINS = [
    "https://example.com",
    "https://www.example.com"
]
```

#### 速率限制
```python
from functools import lru_cache
import time

@lru_cache(maxsize=1000)
def check_rate_limit(user_id: int) -> bool:
    """简单速率限制：每分钟最多 100 请求。"""
    now = int(time.time() / 60)  # 当前分钟
    key = f"{user_id}:{now}"

    count = redis.incr(key)
    if count == 1:
        redis.expire(key, 60)  # 1 分钟后过期

    return count <= 100
```

---

## 语言特定规范

### Python

```python
# 禁止使用 eval/exec
# ❌ 危险
eval(user_input)

# ✅ 安全：使用 ast.literal_eval（仅限字面量）
import ast
ast.literal_eval(user_input)

# 或使用 json
import json
json.loads(user_input)

# SQL 注入防护
# ❌ 危险
cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")

# ✅ 安全：参数化查询
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))

# 命令注入防护
# ❌ 危险
os.system(f"convert {filename} {output}")

# ✅ 安全：使用 subprocess
subprocess.run(['convert', filename, output], check=True)
```

### JavaScript/TypeScript

```typescript
// XSS 防护
// ❌ 危险
element.innerHTML = userInput

// ✅ 安全
element.textContent = userInput

// ✅ 必须使用 HTML 时
import DOMPurify from 'dompurify'
element.innerHTML = DOMPurify.sanitize(userInput)

// Prototype 污染防护
// ❌ 危险
const merged = Object.assign({}, target, userControlledObject)

// ✅ 安全：使用结构化克隆
const merged = structuredClone(target)
Object.keys(userControlledObject).forEach(key => {
    if (key === '__proto__' || key === 'constructor') return
    merged[key] = userControlledObject[key]
})

// 正则表达式 DoS 防护
// ❌ 危险：指数级复杂度
const pattern = /^(a+)+$/

// ✅ 安全：避免嵌套量词
const pattern = /^a+$/
```

### Go

```go
// SQL 注入防护
// ❌ 危险
query := fmt.Sprintf("SELECT * FROM users WHERE id = %s", userID)

// ✅ 安全：使用参数化查询
query := "SELECT * FROM users WHERE id = $1"
rows, err := db.Query(query, userID)

// 命令注入防护
// ❌ 危险
cmd := exec.Command("sh", "-c", userCommand)

// ✅ 安全：使用参数
cmd := exec.Command("ls", "-la", directory)

// 路径遍历防护
import "path/filepath"

func safeJoin(base, userPath string) (string, error) {
    path := filepath.Join(base, userPath)
    if !strings.HasPrefix(path, filepath.Clean(base)) {
        return "", errors.New("invalid path")
    }
    return path, nil
}
```

### Java

```java
// SQL 注入防护
// ❌ 危险
String query = "SELECT * FROM users WHERE id = " + userId;
Statement stmt = connection.createStatement();

// ✅ 安全：使用 PreparedStatement
String query = "SELECT * FROM users WHERE id = ?";
PreparedStatement pstmt = connection.prepareStatement(query);
pstmt.setInt(1, userId);

// 命令注入防护
// ❌ 危险
Runtime.getRuntime().exec("ls " + userDirectory);

// ✅ 安全：使用 ProcessBuilder
ProcessBuilder pb = new ProcessBuilder("ls", "-la", userDirectory);
pb.start();

// 反序列化防护
// ❌ 危险：反序列化不可信数据
ObjectInputStream ois = new ObjectInputStream(inputStream);
Object obj = ois.readObject();

// ✅ 安全：使用白名单
class ValidatingObjectInputStream extends ObjectInputStream {
    protected Class<?> resolveClass(ObjectStreamClass desc) {
        String[] allowed = {"com.example.SafeClass"};
        if (!Arrays.asList(allowed).contains(desc.getName())) {
            throw new InvalidClassException("Unauthorized deserialization");
        }
        return super.resolveClass(desc);
    }
}
```

---

## OWASP Top 10 防护清单

### A01:2021 – 访问控制失效 (Broken Access Control)
- [ ] 所有端点都进行权限检查
- [ ] 使用强制访问控制（默认拒绝）
- [ ] 禁止直接对象引用（ID 不可预测）
- [ ] API 仅暴露必需的数据

### A02:2021 – 加密失败 (Cryptographic Failures)
- [ ] 所有敏感数据传输使用 HTTPS
- [ ] 密码使用 bcrypt/Argon2 哈希
- [ ] 不使用已知弱加密算法（MD5, SHA1）
- [ ] 密钥不硬编码，使用环境变量

### A03:2021 – 注入 (Injection)
- [ ] 所有数据库查询参数化
- [ ] 使用 ORM 框架（防 SQL 注入）
- [ ] 验证和清理用户输入
- [ ] 使用白名单非黑名单

### A04:2021 – 不安全设计 (Insecure Design)
- [ ] 安全需求明确定义
- [ ] 威胁建模作为设计阶段一部分
- [ ] 记录和监控安全事件
- [ ] 最小权限原则

### A05:2021 – 错误的安全配置 (Security Misconfiguration)
- [ ] 禁用调试模式（生产环境）
- [ ] 移除默认凭证
- [ ] 关闭不必要的端口和服务
- [ ] 定期更新依赖

### A06:2021 – 易受攻击和过时的组件 (Vulnerable and Outdated Components)
- [ ] 依赖项版本定期更新
- [ ] 使用依赖扫描工具（Snyk, OWASP Dependency-Check）
- [ ] 及时修补已知漏洞
- [ ] 移除未使用的依赖

### A07:2021 – 身份识别和身份验证失败 (Identification and Authentication Failures)
- [ ] 实施多因素认证（MFA）
- [ ] 密码复杂度要求
- [ ] 会话超时和失效机制
- [ ] 防止暴力破解（速率限制）

### A08:2021 – 软件和数据完整性失败 (Software and Data Integrity Failures)
- [ ] 使用签名验证更新和依赖
- [ ] CI/CD 流水线保护
- [ ] 验证数据完整性
- [ ] 不可变基础设施

### A09:2021 – 安全日志和监控失败 (Security Logging and Monitoring Failures)
- [ ] 记录所有认证尝试
- [ ] 记录授权失败
- [ ] 集中式日志管理
- [ ] 异常检测和告警

### A10:2021 – 服务器端请求伪造 (SSRF)
- [ ] 验证和清理 URL 输入
- [ ] 使用 URL 白名单
- [ ] 限制网络访问（网络隔离）
- [ ] 禁止不必要的 URL schema

---

## 安全审查清单

### 代码审查时检查

- [ ] 所有用户输入都经过验证
- [ ] 所有输出都经过编码
- [ ] 数据库查询使用参数化
- [ ] 敏感数据不记录到日志
- [ ] 错误消息不暴露系统信息
- [ ] 认证和授权正确实现
- [ ] 加密算法符合当前标准
- [ ] 文件上传安全处理
- [ ] 第三方库定期更新

### 部署前检查

- [ ] 调试模式已禁用
- [ ] 环境变量正确配置
- [ ] HTTPS 已启用
- [ ] CORS 配置正确
- [ ] 速率限制已启用
- [ ] 日志记录已配置
- [ ] 备份策略已实施
- [ ] 灾难恢复计划已测试

---

**记住**：安全是一个持续的过程，不是一次性的配置。定期审查、测试和更新是关键。
