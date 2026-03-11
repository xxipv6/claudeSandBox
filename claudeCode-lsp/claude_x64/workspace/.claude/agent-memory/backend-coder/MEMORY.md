# Backend-Coder Agent Memory

## 项目知识引用

本项目使用**共享知识库**，所有 knowledge 文件夹的内容对 BACKEND-CODER 强制可见：

### 共享知识库位置
- **失败模式库**：`/workspace/knowledge/patterns.md`
- **领域知识库**：`/workspace/knowledge/domains.md`
- **工具认知库**：`/workspace/knowledge/tools.md`
- **错误学习库**：`/workspace/knowledge/corrections.md`

### Backend-Coder 使用指引

**编写代码前**：
- 快速浏览 corrections.md，避免重复犯错
- 参考 patterns.md 的"状态类"、"边界类"模式

**编写代码时**：
- 重点关注：状态机、边界检查、资源管理
- 对照 domains.md 的"状态"、"边界"、"资源"维度

**代码审查时**：
- 对照 corrections.md 的错误记录
- 检查是否触发了 patterns.md 中的失败模式

---

## 代码质量规范

### 命名约定
- 变量：snake_case
- 常量：UPPER_SNAKE_CASE
- 函数：snake_case
- 类：PascalCase

### 错误处理模式
```python
# 完整的异常处理
def some_function():
    try:
        # 业务逻辑
        pass
    except SpecificException as e:
        logger.error(f"Specific error: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise
    finally:
        # 清理资源
        pass
```

### 资源管理
- 使用 context manager 管理资源
- 在 finally 中释放资源
- 避免资源泄露

---

## 安全编码规范

### 输入验证
```python
# 必须验证所有外部输入
def handle_input(user_input):
    if not is_valid(user_input):
        raise ValueError(f"Invalid input: {user_input}")
    # 继续处理
```

### SQL 注入防护
```python
# 使用参数化查询
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
```

### 敏感数据保护
- 不在日志中记录敏感数据
- 不在错误消息中暴露系统细节
- 使用环境变量或密钥管理服务

---

## 上下文感知修复

当用户指出问题时：

### ✅ 必须这样做
1. 读取完整文件
2. 分析上下文
3. 检查是否有类似问题
4. 修复所有相关问题
5. 输出完整修复后的文件

### ❌ 不要这样做
- 只修复用户指出的点
- 不检查类似问题
- 只输出补丁

---

## 常见陷阱

### 陷阱 1：边界检查不一致
- ❌ 错误：前端检查了，后端就不检查
- ✅ 正确：后端必须独立检查所有边界

### 陷阱 2：状态机绕过
- ❌ 错误：假设用户会按流程操作
- ✅ 正确：后端强制验证所有状态转换

### 陷阱 3：资源泄露
- ❌ 错误：依赖自动清理
- ✅ 正确：使用 context manager，finally 中清理

---

## 技术栈选择

### Web 框架
- Python: FastAPI (默认), Flask
- Node.js: Express (默认), Koa
- Go: Gin (默认), Echo

### 数据库
- ORM: SQLAlchemy, Prisma, GORM
- Migration: Alembic, Prisma Migrate, golang-migrate

### 认证授权
- JWT: PyJWT, jsonwebtoken
- OAuth: Authlib, passport

---

## 持续改进

每次完成任务后，思考：
1. 这个代码是否有常见的失败模式？
2. 是否应该更新 corrections.md？
3. 是否有更好的实现方式？
