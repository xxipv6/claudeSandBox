---
description: 强制执行测试驱动开发工作流。先搭建接口脚手架，首先生成测试，然后编写最少代码以通过测试。确保 80% 以上的覆盖率。
---

# /tdd - 测试驱动开发

此命令调用 **tdd-guide** 智能体（Agent）来强制执行测试驱动开发（Test-Driven Development, TDD）方法论。

## 此命令的作用

1. **搭建接口脚手架（Scaffold Interfaces）** - 首先定义类型/接口
2. **先生成测试（Generate Tests First）** - 编写失败的测试（红色 - RED）
3. **实现最少代码（Implement Minimal Code）** - 编写刚好能通过测试的代码（绿色 - GREEN）
4. **重构（Refactor）** - 在保持测试通过的同时改进代码（重构 - REFACTOR）
5. **验证覆盖率（Verify Coverage）** - 确保 80% 以上的测试覆盖率（Coverage）

## 何时使用

在以下情况下使用 `/tdd`：
- 实现新功能
- 添加新的函数/组件
- 修复 Bug（先编写能复现 Bug 的测试）
- 重构现有代码
- 构建关键业务逻辑

## 工作原理

tdd-guide 智能体会执行以下操作：

1. 为输入/输出**定义接口（Interfaces）**
2. **编写将要失败（FAIL）的测试**（因为代码尚不存在）
3. **运行测试**并验证它们因正确的理由而失败
4. **编写最少量的实现代码**使测试通过
5. **运行测试**并验证它们已通过
6. 在保持测试通过的同时**重构（Refactor）**代码
7. **检查覆盖率（Coverage）**，如果低于 80% 则添加更多测试

## TDD 循环

```
红色 (RED) → 绿色 (GREEN) → 重构 (REFACTOR) → 重复 (REPEAT)

红色 (RED):      编写一个失败的测试
绿色 (GREEN):    编写最少代码以通过测试
重构 (REFACTOR): 改进代码，保持测试通过
重复 (REPEAT):   下一个功能/场景
```

## 使用示例

### 示例 1：用户认证功能

```
用户: /tdd 我需要一个用户认证函数，验证用户名和密码

智能体 (tdd-guide):
# TDD 会话：用户认证

## 步骤 1：定义接口 (SCAFFOLD)

```python
from typing import Tuple
from dataclasses import dataclass

@dataclass
class User:
    username: str
    password_hash: str

def authenticate(user: User, username: str, password: str) -> Tuple[bool, str]:
    """
    验证用户凭证。

    Returns:
        (success, message) - 成功标志和消息
    """
    # TODO: 实现
    raise NotImplementedError("Not implemented")
```

## 步骤 2：编写失败的测试 (RED)

```python
import pytest
from auth import authenticate, User

def test_authenticate_success():
    """测试成功认证。"""
    user = User(username="alice", password_hash="hash123")
    success, message = authenticate(user, "alice", "password123")
    assert success is True
    assert message == "Authentication successful"

def test_authenticate_wrong_username():
    """测试错误的用户名。"""
    user = User(username="alice", password_hash="hash123")
    success, message = authenticate(user, "bob", "password123")
    assert success is False
    assert "username" in message.lower()

def test_authenticate_wrong_password():
    """测试错误的密码。"""
    user = User(username="alice", password_hash="hash123")
    success, message = authenticate(user, "alice", "wrongpass")
    assert success is False
    assert "password" in message.lower()

def test_authenticate_empty_credentials():
    """测试空凭证。"""
    user = User(username="alice", password_hash="hash123")
    success, message = authenticate(user, "", "")
    assert success is False
    assert "empty" in message.lower()
```

## 步骤 3：运行测试 - 验证失败 (FAIL)

```bash
pytest tests/test_auth.py

FAILED  [errors: 1]
E   NotImplementedError: Not implemented

1 test failed
```

✅ 测试如预期般失败。准备开始实现。

## 步骤 4：实现最少代码 (GREEN)

```python
import hashlib

def authenticate(user: User, username: str, password: str) -> Tuple[bool, str]:
    """验证用户凭证。"""
    # 检查空凭证
    if not username or not password:
        return False, "Username and password cannot be empty"

    # 检查用户名
    if user.username != username:
        return False, "Invalid username"

    # 检查密码
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    if user.password_hash != password_hash:
        return False, "Invalid password"

    return True, "Authentication successful"
```

## 步骤 5：运行测试 - 验证通过 (PASS)

```bash
pytest tests/test_auth.py

PASSED  [100%]
4 tests passed

test_authenticate_success PASSED
test_authenticate_wrong_username PASSED
test_authenticate_wrong_password PASSED
test_authenticate_empty_credentials PASSED
```

✅ 所有测试均已通过！

## 步骤 6：重构 (IMPROVE)

```python
import hashlib
from enum import Enum

class AuthError(Enum):
    EMPTY_CREDENTIALS = "Username and password cannot be empty"
    INVALID_USERNAME = "Invalid username"
    INVALID_PASSWORD = "Invalid password"
    SUCCESS = "Authentication successful"

def _hash_password(password: str) -> str:
    """哈希密码。"""
    return hashlib.sha256(password.encode()).hexdigest()

def authenticate(user: User, username: str, password: str) -> Tuple[bool, str]:
    """验证用户凭证。"""
    # 验证输入
    if not username or not password:
        return False, AuthError.EMPTY_CREDENTIALS.value

    # 验证用户名
    if user.username != username:
        return False, AuthError.INVALID_USERNAME.value

    # 验证密码
    if user.password_hash != _hash_password(password):
        return False, AuthError.INVALID_PASSWORD.value

    return True, AuthError.SUCCESS.value
```

## 步骤 7：验证测试依然通过

```bash
pytest tests/test_auth.py

4 tests passed ✅
```

## 步骤 8：检查覆盖率 (Coverage)

```bash
pytest --cov=auth --cov-report=term-missing

Name           Stmts   Miss  Cover   Missing
--------------------------------------------
auth.py           12      0   100%

Coverage: 100% ✅ (目标: 80%)
```

✅ TDD 会话完成！
```

### 示例 2：Go HTTP 处理器

```go
// 步骤 1: 定义接口
package api

type Response struct {
    Success bool   `json:"success"`
    Message string `json:"message"`
}

func HandleHealthCheck(w http.ResponseWriter, r *http.Request) {
    // TODO: 实现
    panic("not implemented")
}

// 步骤 2: 编写测试
func TestHandleHealthCheck(t *testing.T) {
    tests := []struct {
        name           string
        method         string
        expectedStatus int
    }{
        {"GET request", "GET", 200},
        {"POST request", "POST", 405}, // Method Not Allowed
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            req := httptest.NewRequest(tt.method, "/health", nil)
            w := httptest.NewRecorder()

            HandleHealthCheck(w, req)

            assert.Equal(t, tt.expectedStatus, w.Code)
        })
    }
}

// 步骤 4: 实现最少代码
func HandleHealthCheck(w http.ResponseWriter, r *http.Request) {
    if r.Method != "GET" {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(Response{
        Success: true,
        Message: "OK",
    })
}
```

## TDD 最佳实践

### ✅ 建议 (DO)
- 在进行任何实现之前，**首先**编写测试
- 在实现之前，运行测试并验证它们**失败 (FAIL)**
- 编写最少量的代码以通过测试
- 仅在测试变绿（通过）后才进行重构
- 添加边缘情况（Edge cases）和错误场景
- 目标是 80% 以上的覆盖率（关键代码为 100%）
- 使用描述性的测试名称
- 一个测试只验证一个行为

### ❌ 禁止 (DON'T)
- 在测试之前编写实现代码
- 跳过每次更改后的测试运行
- 一次编写过多代码
- 忽略失败的测试
- 测试实现细节（应测试行为）
- 过度模拟（Mock）- 优先考虑集成测试
- 编写脆弱的测试（容易因无关更改而失败）

## 应包含的测试类型

### 单元测试 (Unit Tests)（函数级）
- 正常路径场景
- 边缘情况（空值、null、最大值）
- 错误条件
- 边界值

### 集成测试 (Integration Tests)（组件级）
- API 终端节点
- 数据库操作
- 外部服务调用
- 带有 Hook 的 React 组件

### 端到端测试 (E2E Tests)
- 关键用户流程
- 多步骤过程
- 全栈集成

## 覆盖率要求

- 所有代码**最低 80%**
- 以下内容**要求 100%**：
  - 安全关键代码（认证、授权）
  - 财务计算
  - 核心业务逻辑
  - 数据验证和清理

## 测试命名规范

### Python (pytest)
```python
def test_should_return_error_when_input_is_empty():
    pass

def test_authenticate_success_with_valid_credentials():
    pass
```

### JavaScript/TypeScript (Jest/Vitest)
```typescript
it('should return error when input is empty', () => {})
it('should authenticate successfully with valid credentials', () => {})
```

### Go
```go
func TestShouldReturnErrorWhenInputIsEmpty(t *testing.T) {}
func TestAuthenticateSuccessWithValidCredentials(t *testing.T) {}
```

### Java (JUnit)
```java
@Test
void shouldReturnErrorWhenInputIsEmpty() {}

@Test
void shouldAuthenticateSuccessfullyWithValidCredentials() {}
```

## 重要提示

**强制要求**：必须在实现之前编写测试。TDD 循环是：

1. **红色 (RED)** - 编写失败的测试
2. **绿色 (GREEN)** - 实现以通过测试
3. **重构 (REFACTOR)** - 改进代码

切勿跳过红色阶段。切勿在测试之前编写代码。

## 与其他 Agent 的集成

- 首先使用 **planner** agent 了解要构建的内容
- 使用 **tdd-guide** agent 进行带测试的实现
- 使用 **dev** agent 确保代码符合工程规范
- 使用 **reviewer** agent 审查实现（不含安全问题）
- 使用 **research** agent 进行安全审计

## 典型工作流

```
用户请求
  ↓
planner (制定实现计划)
  ↓
tdd-guide (TDD 实现)
  ↓
dev (确保工程规范)
  ↓
reviewer (质量审查)
  ↓
research (安全审计)
  ↓
doc-updater (更新文档)
```

## 相关智能体 (Agents)

此命令调用位于 `.claude/agents/tdd-guide.md` 的 `tdd-guide` 智能体。
