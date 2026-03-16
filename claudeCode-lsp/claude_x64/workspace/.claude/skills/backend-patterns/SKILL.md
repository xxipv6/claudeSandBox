---
name: backend-patterns
description: 后端开发模式，包括 API 设计、数据库模式、服务架构、缓存策略、消息队列、微服务等。当进行后端开发、API 设计、数据库建模或微服务架构时，应主动（PROACTIVELY）使用此 skill。
disable-model-invocation: false
---

# 后端开发模式 (Backend Development Patterns)

## 何时激活 (When to Activate)

- 设计和实现 REST/GraphQL API 时
- 设计数据库模式和查询时
- 构建微服务架构时
- 实现缓存策略时
- 使用消息队列时
- 处理认证和授权时
- 实现异步任务时

---

## API 设计模式 (API Design Patterns)

### 1. RESTful API 设计

#### 资源命名
```yaml
# ✅ 推荐：使用名词复数
GET    /users          # 获取用户列表
GET    /users/{id}     # 获取特定用户
POST   /users          # 创建用户
PUT    /users/{id}     # 更新用户
PATCH  /users/{id}     # 部分更新
DELETE /users/{id}     # 删除用户

# ❌ 避免：使用动词
GET    /getUsers
POST   /createUser
DELETE /deleteUser/{id}
```

#### 版本控制
```yaml
# URL 版本控制
/v1/users
/v2/users

# Header 版本控制
Accept: application/vnd.api+json; version=1

# 查询参数版本控制
/users?version=1
```

#### 分页、排序、过滤
```python
# ✅ 推荐：统一参数格式
GET /users?page=1&limit=20&sort=-created_at&status=active

# 响应格式
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### 2. GraphQL API 设计

```graphql
# Schema 定义
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
  createdAt: DateTime!
}

type Query {
  user(id: ID!): User
  users(limit: Int, page: Int): [User!]!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
}

# 查询示例
query GetUserWithPosts($userId: ID!) {
  user(id: $userId) {
    id
    name
    posts {
      id
      title
    }
  }
}
```

### 3. 统一响应格式

```python
# ✅ 推荐：统一响应结构
class ApiResponse:
    def __init__(self, success: bool, data=None, error=None):
        self.success = success
        self.data = data
        self.error = error

    def to_dict(self):
        return {
            "success": self.success,
            "data": self.data,
            "error": self.error
        }

# 成功响应
ApiResponse(success=True, data={"user": user_data})

# 错误响应
ApiResponse(
    success=False,
    error={"code": "USER_NOT_FOUND", "message": "User not found"}
)
```

### 4. API 认证模式

#### JWT 认证
```python
import jwt
from datetime import datetime, timedelta

def generate_token(user_id: int) -> str:
    """生成 JWT token。"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=24),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def verify_token(token: str) -> dict:
    """验证 JWT token。"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        raise AuthenticationError("Token expired")
    except jwt.InvalidTokenError:
        raise AuthenticationError("Invalid token")

# API 使用
@app.route('/protected')
@require_auth
def protected_route():
    user_id = g.user['user_id']
    return jsonify({'user_id': user_id})
```

#### API Key 认证
```python
from functools import wraps

def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if not api_key or not validate_api_key(api_key):
            return jsonify({'error': 'Invalid API key'}), 401
        return f(*args, **kwargs)
    return decorated_function

@app.route('/api/data')
@require_api_key
def get_data():
    return jsonify({'data': 'sensitive data'})
```

---

## 数据库模式 (Database Patterns)

### 1. 关系型数据库设计

#### 用户表设计
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_username (username)
);

-- 用户配置表（1:1）
CREATE TABLE user_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    avatar_url VARCHAR(255),
    bio TEXT,
    birth_date DATE
);

-- 用户会话表（1:N）
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_token (token)
);
```

#### 多对多关系
```sql
-- 用户角色多对多
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE user_roles (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);
```

### 2. NoSQL 数据库设计

#### MongoDB 文档设计
```python
# 用户文档
{
    "_id": ObjectId("..."),
    "username": "john_doe",
    "email": "john@example.com",
    "password_hash": "...",
    "profile": {
        "first_name": "John",
        "last_name": "Doe",
        "avatar": "https://...",
        "bio": "Software developer"
    },
    "roles": ["user", "admin"],
    "sessions": [
        {
            "token": "...",
            "expires_at": ISODate("2024-01-01"),
            "created_at": ISODate("2023-12-01")
        }
    ],
    "created_at": ISODate("2023-01-01"),
    "updated_at": ISODate("2023-12-01")
}

# 索引
db.users.create_index("email", unique=True)
db.users.create_index("username", unique=True)
db.users.create_index("sessions.token")
```

---

## 服务架构模式 (Service Architecture Patterns)

### 1. 分层架构 (Layered Architecture)

```python
# Controller 层：处理 HTTP 请求
@app.route('/users/<int:user_id>')
def get_user(user_id):
    user = user_service.get_user(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user.to_dict())

# Service 层：业务逻辑
class UserService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def get_user(self, user_id: int) -> User:
        user = self.user_repository.find_by_id(user_id)
        if not user:
            raise UserNotFoundError(f"User {user_id} not found")
        return user

    def create_user(self, data: dict) -> User:
        self.validate_user_data(data)
        if self.user_repository.exists_by_email(data['email']):
            raise DuplicateEmailError("Email already exists")
        user = User(**data)
        return self.user_repository.save(user)

# Repository 层：数据访问
class UserRepository:
    def find_by_id(self, user_id: int) -> Optional[User]:
        row = db.execute('SELECT * FROM users WHERE id = %s', (user_id,))
        return User.from_row(row) if row else None

    def save(self, user: User) -> User:
        db.execute(
            'INSERT INTO users (username, email) VALUES (%s, %s)',
            (user.username, user.email)
        )
        user.id = db.last_insert_id()
        return user
```

### 2. 依赖注入 (Dependency Injection)

```python
from functools import lru_cache
from typing import Annotated

# FastAPI 示例
@app.post("/users")
def create_user(
    user_data: UserCreate,
    user_service: Annotated[UserService, Depends(get_user_service)]
):
    user = user_service.create_user(user_data)
    return user.to_dict()

# 或使用容器
class ServiceContainer:
    def __init__(self):
        self._services = {}

    def register(self, name: str, factory):
        self._services[name] = factory

    def get(self, name: str):
        return self._services[name]()

container = ServiceContainer()
container.register('user_service', lambda: UserService(db()))
container.register('email_service', lambda: EmailService())
```

### 3. 微服务通信模式

#### 同步通信（HTTP/REST）
```python
# 服务 A 调用服务 B
import httpx

async def get_user_posts(user_id: int):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f'http://posts-service/posts/{user_id}'
        )
        return response.json()
```

#### 异步通信（消息队列）
```python
# 发布事件
import pika

def publish_user_created(user: User):
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()
    channel.queue_declare(queue='user_events')

    message = json.dumps({
        'event': 'user.created',
        'user_id': user.id,
        'email': user.email
    })

    channel.basic_publish(
        exchange='',
        routing_key='user_events',
        body=message
    )
    connection.close()

# 消费事件
def consume_user_events():
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()

    def callback(ch, method, properties, body):
        event = json.loads(body)
        if event['event'] == 'user.created':
            send_welcome_email(event['user_id'])

    channel.basic_consume(queue='user_events', on_message_callback=callback)
    channel.start_consuming()
```

---

## 缓存策略 (Caching Patterns)

### 1. Cache-Aside 模式

```python
import redis
import json

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def get_user(user_id: int) -> Optional[User]:
    # 1. 尝试从缓存获取
    cache_key = f"user:{user_id}"
    cached = redis_client.get(cache_key)
    if cached:
        return User(**json.loads(cached))

    # 2. 缓存未命中，从数据库获取
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        return None

    # 3. 写入缓存
    redis_client.setex(
        cache_key,
        3600,  # 1 小时过期
        json.dumps(user.to_dict())
    )

    return user

def update_user(user_id: int, data: dict):
    # 1. 更新数据库
    user = db.query(User).filter_by(id=user_id).first()
    user.update(data)
    db.commit()

    # 2. 使缓存失效
    cache_key = f"user:{user_id}"
    redis_client.delete(cache_key)
```

### 2. Write-Through 模式

```python
def create_user(data: dict) -> User:
    user = User(**data)

    # 1. 写入数据库
    db.add(user)
    db.commit()

    # 2. 写入缓存
    cache_key = f"user:{user.id}"
    redis_client.setex(
        cache_key,
        3600,
        json.dumps(user.to_dict())
    )

    return user
```

### 3. Write-Behind 模式

```python
from queue import Queue
import threading

write_queue = Queue()

def async_write_worker():
    """后台线程：批量写入数据库"""
    batch = []
    while True:
        item = write_queue.get()
        batch.append(item)

        if len(batch) >= 100:  # 批量写入
            db.bulk_insert(batch)
            batch = []

# 启动后台线程
threading.Thread(target=async_write_worker, daemon=True).start()

def create_user(data: dict) -> User:
    user = User(**data, id=generate_id())

    # 立即写入缓存
    cache_key = f"user:{user.id}"
    redis_client.setex(cache_key, 3600, json.dumps(user.to_dict()))

    # 异步写入数据库
    write_queue.put(user)

    return user
```

---

## 异步任务模式 (Async Task Patterns)

### 1. Celery 任务队列

```python
from celery import Celery

app = Celery('tasks', broker='pyamqp://guest@localhost//')

@app.task
def send_welcome_email(user_id: int):
    user = get_user(user_id)
    email_service.send(
        to=user.email,
        subject='Welcome!',
        body='Welcome to our platform!'
    )

@app.task
def generate_report(report_id: int):
    report = db.query(Report).get(report_id)
    report.status = 'processing'
    db.commit()

    try:
        # 生成报告（可能需要很长时间）
        result = process_report_data(report.data)
        report.result = result
        report.status = 'completed'
    except Exception as e:
        report.status = 'failed'
        report.error = str(e)
    finally:
        db.commit()

# 调用任务
send_welcome_email.delay(user.id)
generate_report.delay(report.id)
```

### 2. 后台任务（Python asyncio）

```python
import asyncio

async def process_orders():
    """后台处理订单"""
    while True:
        # 获取待处理订单
        orders = await get_pending_orders()

        for order in orders:
            await process_order(order)

        # 等待 5 秒
        await asyncio.sleep(5)

# 启动后台任务
async def main():
    # 启动订单处理
    task = asyncio.create_task(process_orders())

    # 启动 API 服务器
    await start_api_server()

    await task

asyncio.run(main())
```

---

## 安全模式 (Security Patterns)

### 1. Rate Limiting（速率限制）

```python
from functools import wraps
import time

class RateLimiter:
    def __init__(self, max_requests: int, window: int):
        self.max_requests = max_requests
        self.window = window
        self.requests = {}

    def is_allowed(self, identifier: str) -> bool:
        now = time.time()
        window_start = now - self.window

        # 清理过期记录
        self.requests[identifier] = [
            timestamp for timestamp in self.requests.get(identifier, [])
            if timestamp > window_start
        ]

        # 检查是否超过限制
        if len(self.requests[identifier]) >= self.max_requests:
            return False

        # 记录请求
        self.requests.setdefault(identifier, []).append(now)
        return True

rate_limiter = RateLimiter(max_requests=100, window=60)

def require_rate_limit(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        identifier = request.remote_addr
        if not rate_limiter.is_allowed(identifier):
            return jsonify({'error': 'Rate limit exceeded'}), 429
        return f(*args, **kwargs)
    return decorated_function

@app.route('/api/data')
@require_rate_limit
def get_data():
    return jsonify({'data': '...'})
```

### 2. API Key 管理

```python
import secrets
import hashlib

def generate_api_key() -> str:
    """生成安全的 API key。"""
    return secrets.token_urlsafe(32)

def hash_api_key(api_key: str) -> str:
    """哈希 API key 存储。"""
    return hashlib.sha256(api_key.encode()).hexdigest()

# 创建 API key
plain_key = generate_api_key()
hashed_key = hash_api_key(plain_key)

# 存储哈希值到数据库
db.execute(
    'INSERT INTO api_keys (key_hash, user_id) VALUES (%s, %s)',
    (hashed_key, user.id)
)

# 验证 API key
def verify_api_key(api_key: str) -> bool:
    key_hash = hash_api_key(api_key)
    return db.query(
        'SELECT * FROM api_keys WHERE key_hash = %s',
        (key_hash,)
    ).fetchone() is not None
```

---

## 监控和日志 (Monitoring & Logging)

### 1. 结构化日志

```python
import structlog

logger = structlog.get_logger()

def process_payment(user_id: int, amount: float):
    logger.info(
        "payment_started",
        user_id=user_id,
        amount=amount
    )

    try:
        result = payment_gateway.charge(amount)
        logger.info(
            "payment_completed",
            user_id=user_id,
            amount=amount,
            transaction_id=result.transaction_id
        )
    except PaymentError as e:
        logger.error(
            "payment_failed",
            user_id=user_id,
            amount=amount,
            error=str(e)
        )
        raise
```

### 2. 性能监控

```python
import time
from functools import wraps

def monitor_performance(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        duration = time.time() - start

        logger.info(
            "function_performance",
            function=func.__name__,
            duration=duration,
            args=str(args)[:100]  # 限制长度
        )

        # 记录到监控系统
        metrics.histogram('function.duration', duration, tags={'function': func.__name__})

        return result
    return wrapper

@monitor_performance
def expensive_operation(data):
    # 处理数据
    return result
```

---

## 最佳实践总结 (Best Practices Summary)

### ✅ DO（应该做）

1. **API 设计**
   - 使用标准 HTTP 方法和状态码
   - 提供清晰的错误消息
   - 版本控制你的 API
   - 文档化所有端点

2. **数据库**
   - 使用事务保证一致性
   - 创建适当的索引
   - 避免N+1查询
   - 使用连接池

3. **安全性**
   - 验证所有输入
   - 使用参数化查询
   - 实施速率限制
   - 记录安全事件

4. **性能**
   - 使用缓存
   - 异步处理长时间任务
   - 监控性能指标
   - 优化慢查询

### ❌ DON'T（不应该做）

1. 不要在 API 中暴露内部实现细节
2. 不要在客户端存储敏感数据
3. 不要忽略错误和异常
4. 不要硬编码配置和凭证
5. 不要返回不必要的敏感信息
6. 不要在循环中执行数据库查询

---

**记住**：良好的后端设计是可扩展、可维护、安全的。根据项目需求选择合适的模式和技术栈。
