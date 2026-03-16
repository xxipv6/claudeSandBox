# Rules 目录

## 用途

存放**按路径加载**的规则，用于语言/目录/文件类型特定的约束。

## 何时使用 Rules

- 需要针对特定路径的规则
- 语言特定的编码规范
- 目录特定的约定
- 不应该放在根 CLAUDE.md 的细节

## 结构

```
rules/
├── frontend/          # 前端相关规则
│   └── react.md       # React 特定规则
├── backend/           # 后端相关规则
│   └── api.md         # API 设计规则
└── scripts/           # 脚本相关规则
    └── python.md      # Python 脚本规则
```

## 示例规则文件

### `frontend/react.md`
```markdown
# React 组件规则

- 使用函数组件 + Hooks
- 组件文件使用 `.tsx` 扩展名
- 导出默认使用 `export default`
- Props 必须定义 TypeScript 接口
```

### `backend/api.md`
```markdown
# API 设计规则

- RESTful 路由命名
- 统一响应格式：{ success, data, error }
- 错误码使用 HTTP 状态码
- 所有端点需要认证
```

## 加载机制

Claude Code 会根据当前工作路径自动加载对应的规则文件。

**注意**：不要把频繁使用的规则放在这里，应该放在根 CLAUDE.md。
