# Fullstack-Coder Agent Memory

## 项目知识引用

本项目使用**共享知识库**，所有 knowledge 文件夹的内容对 FULLSTACK-CODER 强制可见：

### 共享知识库位置
- **失败模式库**：`/workspace/knowledge/patterns.md`
- **领域知识库**：`/workspace/knowledge/domains.md`
- **工具认知库**：`/workspace/knowledge/tools.md`
- **错误学习库**：`/workspace/knowledge/corrections.md`

### Fullstack-Coder 使用指引

**编写代码前**：
- 快速浏览 corrections.md，避免重复犯错
- 参考 patterns.md 的所有模式（全栈更易出现组合问题）

**编写代码时**：
- 重点关注：前后端边界、状态同步、组合操作
- 对照 domains.md 的所有维度

**代码审查时**：
- 对照 corrections.md 的错误记录
- 检查前后端是否对齐

---

## 默认技术栈

### 后端
- **框架**: FastAPI (Python)
- **ORM**: SQLAlchemy
- **Migration**: Alembic
- **认证**: JWT

### 前端
- **框架**: React + TypeScript
- **状态管理**: Zustand
- **表单**: React Hook Form + Zod
- **样式**: Tailwind CSS

### 数据库
- **主库**: PostgreSQL
- **缓存**: Redis (可选)

---

## 全栈最佳实践

### 前后端边界
```typescript
// 前端：定义接口类型
interface User {
  id: string;
  name: string;
  email: string;
}

// 后端：使用相同的类型定义
# Pydantic 模型
class User(BaseModel):
    id: str
    name: str
    email: str
```

### 错误处理统一
```typescript
// 前端
try {
  const data = await api.call();
} catch (error) {
  if (error instanceof ValidationError) {
    // 处理验证错误
  } else if (error instanceof AuthError) {
    // 处理认证错误
  }
}
```

```python
# 后端
@app.exception_handler(ValidationError)
async def validation_error_handler(request, exc):
    return JSONResponse(
        status_code=400,
        content={"error": "validation_error", "details": exc.errors()}
    )
```

### 状态同步
```typescript
// 前端：使用乐观更新
const updateUser = async (id: string, data: Partial<User>) => {
  // 1. 立即更新本地状态
  setUsers(users.map(u => u.id === id ? { ...u, ...data } : u));

  // 2. 调用 API
  try {
    await api.updateUser(id, data);
  } catch (error) {
    // 3. 失败时回滚
    setUsers(originalUsers);
    throw error;
  }
};
```

---

## 上下文感知修复

当用户指出问题时：

### ✅ 必须这样做
1. 读取完整文件（前端 + 后端）
2. 分析上下文
3. 检查前后端是否有类似问题
4. 修复所有相关问题
5. 输出完整修复后的文件

### ❌ 不要这样做
- 只修复用户指出的点
- 只修复前端或后端，不对齐
- 不检查类似问题

---

## 全栈特定陷阱

### 陷阱 1：前后端边界不对齐
- ❌ 错误：前端和后端的字段不一致
- ✅ 正确：使用 OpenAPI/TypeScript 生成类型

### 陷阱 2：状态不同步
- ❌ 错误：前端状态和后端状态不一致
- ✅ 正确：使用乐观更新 + 错误回滚

### 陷阱 3：边界检查不一致
- ❌ 错误：前端检查了但后端没检查
- ✅ 正确：后端必须独立检查所有边界

### 陷阱 4：组合操作漏洞
- ❌ 错误：批量操作没有额外检查
- ✅ 正确：批量操作要有额外的配额检查

---

## 项目结构模板

```
project/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── services/
│   │   └── main.py
│   ├── migrations/
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── stores/
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
└── docker-compose.yml
```

---

## 持续改进

每次完成任务后，思考：
1. 前后端是否对齐？
2. 是否有组合操作的漏洞？
3. 是否应该更新 corrections.md？
