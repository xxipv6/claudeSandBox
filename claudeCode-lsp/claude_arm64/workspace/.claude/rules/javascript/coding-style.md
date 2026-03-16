# JavaScript/TypeScript 编码规范

## 命名规范

- 变量/函数：`camelCase`
- 类/组件/接口：`PascalCase`
- 常量：`UPPER_SNAKE_CASE`
- 私有成员：`_leadingUnderscore`
- 文件名：`kebab-case` 或 `camelCase`

## 代码风格

- 使用 2 空格缩进
- 最大行宽：80 字符（Prettier 默认）
- 使用分号
- 字符串优先使用单引号
- 对象和数组末尾保留逗号

## TypeScript 要求

- 避免使用 `any`，明确具体类型
- 接口优先使用 `interface`，类型用 `type`
- 函数参数和返回值必须有类型
- 使用枚举代替常量对象
- 泛型优先

## React/前端规范

- 组件使用函数式组件 + Hooks
- 状态管理：优先使用内置 hooks
- 组件文件使用 `.tsx` 扩展名
- Props 必须定义接口
- 避免嵌套三元表达式

## 安全要求

- 禁止使用 `eval()`
- 禁止 `innerHTML` 直接插入用户数据
- 使用 DOMPurify 或类似库清理 HTML
- API 请求必须验证响应
- 敏感数据不存储在前端

## 异步处理

- 优先使用 `async/await`
- 错误必须处理（try/catch）
- 避免回调地狱
- 并发使用 `Promise.all()`

## 示例

```typescript
interface User {
  id: string;
  name: string;
  age: number;
}

const DEFAULT_AGE = 18;

class UserService {
  private _baseUrl: string;

  constructor(baseUrl: string) {
    this._baseUrl = baseUrl;
  }

  async getActiveUsers(minAge: number): Promise<User[]> {
    try {
      const response = await fetch(`${this._baseUrl}/users`);
      const users: User[] = await response.json();
      return users.filter(u => u.age >= minAge);
    } catch (error) {
      console.error('获取用户失败:', error);
      throw error;
    }
  }
}
```

## 工具配置

- 使用 Prettier 格式化
- 使用 ESLint 检查
- TypeScript 严格模式
