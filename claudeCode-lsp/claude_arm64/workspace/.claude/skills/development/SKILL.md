---
description: 日常开发工作流。功能开发完成后自动生成 API 文档、TypeScript 类型、Mock 数据，实现前后端协作。当进行功能开发、接口开发、前后端协作时，应主动（PROACTIVELY）使用此 skill。
---

# Development Workflow（日常开发工作流）

## 适用场景

- 功能开发（新增接口 / 新增模块）
- Bug 修复
- 代码重构
- 前后端协作
- API 文档生成

---

## 核心流程

### 功能开发流程

```
需求分析 → 设计接口 → 编写代码 → 编写测试 → 生成 API 文档 → 更新 CHANGELOG
```

### Bug 修复流程

```
复现 Bug → 定位原因 → 修复代码 → 验证修复 → 更新文档（如需要）
```

### 重构流程

```
分析现状 → 制定方案 → 逐步重构 → 运行测试 → 确认无回归
```

---

## 功能开发完成后检查清单

每完成一个功能开发，**必须**按以下顺序执行：

### 1. 代码自检
- [ ] 代码符合项目编码规范（参见 `rules/` 下对应语言的 coding-style）
- [ ] 无硬编码密钥 / 敏感信息
- [ ] 错误处理完善
- [ ] 边界条件处理
- [ ] 无安全隐患（SQL 注入 / XSS / 越权等）

### 2. 测试
- [ ] 单元测试（核心逻辑）
- [ ] 集成测试（接口调用）
- [ ] 边界测试（异常输入）

### 3. API 文档生成（如涉及接口变更）

**如果是新增或修改了 API 接口，必须生成 API 文档。**

API 文档格式：

```markdown
# API: [接口名称]

## 基本信息
- **Method**: [GET / POST / PUT / DELETE / PATCH]
- **Path**: `/api/v1/[resource]`
- **Auth**: [需要认证 / 不需要认证]
- **Permission**: [角色 / 权限要求]

## 请求参数

### Headers
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Authorization | string | 是 | Bearer token |
| Content-Type | string | 是 | application/json |

### Path Parameters
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 资源 ID |

### Query Parameters
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | integer | 否 | 页码，默认 1 |
| size | integer | 否 | 每页数量，默认 20 |

### Request Body
\`\`\`json
{
  "name": "string",       // 名称，必填，最大 100 字符
  "email": "string",      // 邮箱，必填，合法邮箱格式
  "role": "string"        // 角色，可选，默认 "user"
}
\`\`\`

## 响应

### 成功响应 (200 / 201)
\`\`\`json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "name": "example",
    "email": "example@test.com",
    "role": "user",
    "created_at": "2026-04-01T12:00:00Z",
    "updated_at": "2026-04-01T12:00:00Z"
  }
}
\`\`\`

### 错误响应
| 状态码 | code | 说明 |
|--------|------|------|
| 400 | 40001 | 参数验证失败 |
| 401 | 40101 | 未认证 |
| 403 | 40301 | 无权限 |
| 404 | 40401 | 资源不存在 |
| 500 | 50001 | 服务器内部错误 |

### 错误响应示例
\`\`\`json
{
  "code": 40001,
  "message": "参数验证失败",
  "errors": [
    {
      "field": "email",
      "message": "邮箱格式不正确"
    }
  ]
}
\`\`\`

## 示例

### cURL
\`\`\`bash
curl -X POST http://localhost:8080/api/v1/users \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "test", "email": "test@example.com"}'
\`\`\`

### JavaScript / TypeScript
\`\`\`typescript
const response = await fetch('/api/v1/users', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'test',
    email: 'test@example.com'
  })
});
const data = await response.json();
\`\`\`

## 备注
- [特殊说明 / 注意事项 / 已知限制]
```

### 4. TypeScript 类型生成（如前后端分离项目）

**为前端开发提供完整的 TypeScript 类型定义。**

```typescript
// types/api/[module].ts

// ========== Request Types ==========

export interface CreateUserRequest {
  name: string;        // 名称，必填，最大 100 字符
  email: string;       // 邮箱，必填，合法邮箱格式
  role?: string;       // 角色，可选，默认 "user"
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: string;
}

export interface ListUsersQuery {
  page?: number;       // 页码，默认 1
  size?: number;       // 每页数量，默认 20
}

// ========== Response Types ==========

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;  // ISO 8601
  updated_at: string;  // ISO 8601
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface ApiError {
  code: number;
  message: string;
  errors?: {
    field: string;
    message: string;
  }[];
}

// ========== API Functions ==========

export const userApi = {
  list: (query?: ListUsersQuery) =>
    fetch(`/api/v1/users?${new URLSearchParams(query as any)}`)
      .then(res => res.json() as Promise<ApiResponse<User[]>>),

  get: (id: number) =>
    fetch(`/api/v1/users/${id}`)
      .then(res => res.json() as Promise<ApiResponse<User>>),

  create: (data: CreateUserRequest) =>
    fetch('/api/v1/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json() as Promise<ApiResponse<User>>),

  update: (id: number, data: UpdateUserRequest) =>
    fetch(`/api/v1/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json() as Promise<ApiResponse<User>>),

  delete: (id: number) =>
    fetch(`/api/v1/users/${id}`, { method: 'DELETE' })
      .then(res => res.json() as Promise<ApiResponse<null>>)
};
```

### 5. Mock 数据生成

**为前端开发提供 Mock 数据，让前端无需等待后端部署。**

```json
{
  "GET /api/v1/users": {
    "code": 0,
    "message": "success",
    "data": [
      {
        "id": 1,
        "name": "张三",
        "email": "zhangsan@example.com",
        "role": "admin",
        "created_at": "2026-04-01T10:00:00Z",
        "updated_at": "2026-04-01T10:00:00Z"
      },
      {
        "id": 2,
        "name": "李四",
        "email": "lisi@example.com",
        "role": "user",
        "created_at": "2026-04-01T11:00:00Z",
        "updated_at": "2026-04-01T11:00:00Z"
      }
    ]
  },
  "POST /api/v1/users": {
    "code": 0,
    "message": "success",
    "data": {
      "id": 3,
      "name": "新用户",
      "email": "new@example.com",
      "role": "user",
      "created_at": "2026-04-01T12:00:00Z",
      "updated_at": "2026-04-01T12:00:00Z"
    }
  },
  "GET /api/v1/users/1": {
    "code": 0,
    "message": "success",
    "data": {
      "id": 1,
      "name": "张三",
      "email": "zhangsan@example.com",
      "role": "admin",
      "created_at": "2026-04-01T10:00:00Z",
      "updated_at": "2026-04-01T10:00:00Z"
    }
  }
}
```

### 6. CHANGELOG 更新

```markdown
## [YYYY-MM-DD]

### Added
- 新增 `/api/v1/users` 用户管理接口（CRUD）
- 新增用户角色权限控制

### Fixed
- 修复用户邮箱验证逻辑错误

### Changed
- 用户列表接口新增分页参数
```

---

## 文件输出结构

```
project/
├── src/                          ← 源代码
├── tests/                        ← 测试代码
├── docs/
│   └── api/                      ← API 文档
│       ├── users.md              ← 用户模块 API 文档
│       └── auth.md               ← 认证模块 API 文档
├── types/
│   └── api/                      ← TypeScript 类型
│       ├── users.ts
│       └── auth.ts
├── mock/
│   ├── users.json                ← Mock 数据
│   └── auth.json
├── CHANGELOG.md                  ← 变更日志
└── README.md
```

---

## 何时触发

### 必须触发（自动识别）

- **新增 API 接口**：完成后自动生成 API 文档 + TypeScript 类型 + Mock 数据
- **修改 API 接口**：完成后自动更新对应文档
- **删除 API 接口**：完成后自动更新文档并标注废弃

### 建议触发

- **新增功能模块**：完成后生成模块文档
- **重构代码**：完成后检查文档是否需要更新

### 不触发

- 纯前端修改
- 样式调整
- 配置文件修改
- 文档本身的修改

---

## 执行纪律

1. **代码完成 → 文档紧跟**：不要等用户提醒，代码完成后主动生成文档
2. **文档即合约**：API 文档是前后端的合约，必须准确
3. **类型安全**：TypeScript 类型必须与 API 文档保持一致
4. **Mock 可用**：Mock 数据必须能直接使用，前端零配置启动
5. **增量更新**：只更新变更的部分，不重写整个文档
