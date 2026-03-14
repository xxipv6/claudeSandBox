# Dev-Coder Agent Memory

## 项目知识引用

本项目使用**共享知识库**，所有 knowledge 文件夹的内容对 DEV-CODER 强制可见：

### 共享知识库位置
- **失败模式库**：`/workspace/knowledge/patterns.md`
- **领域知识库**：`/workspace/knowledge/domains.md`
- **工具认知库**：`/workspace/knowledge/tools.md`
- **错误学习库**：`/workspace/knowledge/corrections.md`

### Dev-Coder 使用指引

**编写代码前**：
- 快速浏览 corrections.md，避免重复犯错
- 参考 tools.md 选择合适的工具和框架

**编写代码时**：
- 重点关注：资源清理、异常处理、输入验证
- 对照 domains.md 的"输入"、"资源"、"时间"维度

**代码审查时**：
- 对照 corrections.md 的错误记录
- 检查是否有资源泄露
- 检查是否有安全问题

---

## 代码质量规范

### 前端代码

#### 命名规范
- 组件：PascalCase (`UserProfile`, `DataTable`)
- 函数/变量：camelCase (`getUserData`, `isLoading`)
- 常量：UPPER_SNAKE_CASE (`MAX_RETRY`, `API_BASE_URL`)
- 布尔值：is/has/can 前缀 (`isLoading`, `hasError`, `canEdit`)
- 事件处理：handle 前缀 (`handleSubmit`, `handleClick`)

#### 三态处理
所有异步操作必须处理三种状态：
- 加载态 (loading)
- 错误态 (error)
- 数据态 (data)
- 空态 (empty)

```jsx
const [state, setState] = useState({
  data: null,
  loading: false,
  error: null
});

if (state.loading) return <Spinner />;
if (state.error) return <Error message={state.error} />;
if (!state.data) return <EmptyState />;
return <DataDisplay data={state.data} />;
```

#### 状态管理
- 使用 Zustand 进行全局状态管理
- 使用 Context API 进行组件级状态管理
- 避免过度使用全局状态

### 后端代码

#### 命名规范
- 变量/函数：snake_case (`user_name`, `get_user()`)
- 类：PascalCase (`UserService`, `DataManager`)
- 常量：UPPER_SNAKE_CASE (`MAX_RETRY`, `API_KEY`)
- 私有成员：_前缀 (`_internal_method()`)

#### 错误处理
```python
try:
    result = risky_operation()
except SpecificException as e:
    logger.error(f"Operation failed: {e}")
    raise BusinessError(f"Failed to process: {e}") from e
finally:
    cleanup_resources()
```

#### 日志规范
- DEBUG: 详细调试信息（开发环境）
- INFO: 关键操作信息（用户登录、数据变更）
- WARNING: 可恢复的异常情况
- ERROR: 错误但不影响服务继续
- CRITICAL: 严重错误，需要立即处理

---

## 安全编码规范（强制）

### 输入验证

```python
# 后端必须验证所有输入
def create_user(username: str, email: str) -> User:
    if not username or len(username) < 3:
        raise ValueError("Invalid username")
    if not is_valid_email(email):
        raise ValueError("Invalid email")
```

```jsx
// 前端也必须验证
const handleSubmit = (e) => {
  e.preventDefault();
  if (username.length < 3) {
    alert('用户名至少3个字符');
    return;
  }
  submitForm(username);
};
```

### SQL 注入防护

```python
# ✅ 正确：使用参数化查询
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))

# ❌ 禁止：字符串拼接
cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")
```

### XSS 防护

```jsx
// ✅ 正确：React 自动转义
<div>{userInput}</div>

// ❌ 禁止：直接渲染 HTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ 如果需要渲染 HTML，先净化
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

### 敏感信息保护

```python
# 敏感数据禁止记录到日志
logger.info(f"User logged in: {user.id}")  # ✅ 正确
logger.info(f"User logged in: {user.token}")  # ❌ 禁止

# 密码禁止明文存储
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())  # ✅ 正确
stored_password = password  # ❌ 禁止
```

```jsx
// ❌ 禁止：在前端存储敏感信息
localStorage.setItem('password', password);
localStorage.setItem('api_key', apiKey);

// ✅ 正确：使用 HttpOnly Cookie 或 Session
```

---

## 资源管理规范

### 资源清理

```python
# 使用 context manager 确保资源清理
def process_file(filepath):
    with open(filepath, 'r') as f:
        data = f.read()
    # 自动清理

# 或使用 try-finally
def process_resource():
    resource = acquire_resource()
    try:
        # 使用资源
        pass
    finally:
        release_resource(resource)
```

### 超时设置

```python
# 所有网络操作都要设置超时
import socket

socket.setdefaulttimeout(10)

# 或
response = requests.get(url, timeout=10)
```

### 并发安全

```python
# 使用锁保护共享状态
import threading

lock = threading.Lock()
results = []

def safe_append(result):
    with lock:
        results.append(result)
```

```go
// Go 并发安全模式
var mu sync.Mutex
var results []Result

func safeAppend(r Result) {
    mu.Lock()
    defer mu.Unlock()
    results = append(results, r)
}
```

---

## 常见框架最佳实践

### React Hooks

```jsx
import { useState, useEffect, useCallback, useMemo } from 'react';

function OptimizedComponent({ items, userId }) {
  // 1. 使用 useMemo 缓存计算结果
  const sortedItems = useMemo(() => {
    return items.sort((a, b) => a.id - b.id);
  }, [items]);

  // 2. 使用 useCallback 缓存函数
  const handleClick = useCallback((id) => {
    console.log(`Clicked ${id}`);
  }, []);

  // 3. useEffect 清理副作用
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('Tick');
    }, 1000);

    return () => clearInterval(timer); // 清理
  }, []);

  return <div>{/* 渲染 */}</div>;
}
```

### Zustand 状态管理

```jsx
import { create } from 'zustand';

// 定义 Store
const useUserStore = create((set) => ({
  user: null,
  loading: false,
  error: null,

  fetchUser: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/users/${id}`);
      const user = await response.json();
      set({ user, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  clearUser: () => set({ user: null, error: null }),
}));
```

### FastAPI

```python
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, validator

app = FastAPI()

class UserCreate(BaseModel):
    username: str
    email: str

    @validator('username')
    def validate_username(cls, v):
        if len(v) < 3:
            raise ValueError("Username too short")
        return v

@app.post("/users")
async def create_user(user: UserCreate):
    # 业务逻辑
    pass
```

### Go (Gin)

```go
func CreateUser(c *gin.Context) {
    var req UserCreateRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    // 业务逻辑
    // ...

    c.JSON(201, gin.H{"id": user.ID})
}
```

---

## 代码修复模式（重要）

当用户指出一个问题时：

### ✅ 必须这样做

1. **读取完整文件** - 不要只看问题行
2. **分析上下文** - 理解问题周围的代码逻辑
3. **举一反三** - 检查是否有类似问题
4. **完整修复** - 修复所有相关问题，不只是指出的点
5. **验证修复** - 确保修复后没有引入新问题

### 示例

用户说："第 15 行的变量名不对"

**❌ 错误做法**：只改第 15 行

**✅ 正确做法**：
1. 读取完整文件
2. 分析第 15 行的上下文
3. 检查文件中是否有类似的命名问题
4. 修复所有相关问题
5. 输出完整的修复后文件

---

## 常见陷阱

### ❌ 不要这样做

1. **直接修改 State**
   ```jsx
   state.items.push(newItem);  // ❌
   setState({ items: [...state.items, newItem] });  // ✅
   ```

2. **忽略错误处理**
   ```python
   result = risky_operation()  # 没有异常处理
   ```

3. **硬编码配置**
   ```python
   API_KEY = "sk-123456"  # 应该用环境变量
   ```

4. **SQL 注入风险**
   ```python
   query = f"SELECT * FROM users WHERE id = {user_id}"
   ```

5. **日志泄露敏感信息**
   ```python
   logger.info(f"User password: {password}")
   ```

### ✅ 应该这样做

1. **使用不可变更新**
   ```jsx
   setState(prev => ({ ...prev, items: [...prev.items, newItem] }));
   ```

2. **完整错误处理**
   ```python
   try:
       result = risky_operation()
   except SpecificError as e:
       logger.error(f"Operation failed: {e}")
       raise
   ```

3. **使用环境变量**
   ```python
   import os
   API_KEY = os.getenv("API_KEY")
   ```

4. **参数化查询**
   ```python
   cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
   ```

5. **日志不记录敏感信息**
   ```python
   logger.info(f"User {user_id} logged in")
   ```

---

## 持续改进

每次完成任务后，思考：
1. 这个代码是否有资源泄露？
2. 是否应该更新 corrections.md？
3. 是否有更高效的实现方式？
4. 是否发现了新的代码模式？
