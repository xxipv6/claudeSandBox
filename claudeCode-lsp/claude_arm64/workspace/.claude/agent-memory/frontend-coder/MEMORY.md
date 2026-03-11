# Frontend-Coder Agent Memory

## 项目知识引用

本项目使用**共享知识库**，所有 knowledge 文件夹的内容对 FRONTEND-CODER 强制可见：

### 共享知识库位置
- **失败模式库**：`/workspace/knowledge/patterns.md`
- **领域知识库**：`/workspace/knowledge/domains.md`
- **工具认知库**：`/workspace/knowledge/tools.md`
- **错误学习库**：`/workspace/knowledge/corrections.md`

### Frontend-Coder 使用指引

**编写代码前**：
- 快速浏览 corrections.md，避免重复犯错
- 参考 patterns.md 的"输入面"、"信任类"模式

**编写代码时**：
- 重点关注：输入验证、XSS 防护、CSRF 防护
- 对照 domains.md 的"信任"、"输入"维度

**代码审查时**：
- 对照 corrections.md 的错误记录
- 检查是否暴露了不必要的攻击面

---

## 代码质量规范

### 组件结构
```jsx
// 标准组件结构
function Component({ prop1, prop2 }) {
  // 1. 状态定义
  const [state, setState] = useState(null);

  // 2. 副作用
  useEffect(() => {
    // 副作用逻辑
    return () => {
      // 清理函数
    };
  }, [dependencies]);

  // 3. 事件处理
  const handleClick = () => {
    // 处理逻辑
  };

  // 4. 渲染
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### 三态处理
```jsx
// 必须处理 loading, error, empty 三种状态
function DataComponent({ data, loading, error }) {
  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;
  if (!data || data.length === 0) return <Empty />;

  return <div>{/* 正常渲染 */}</div>;
}
```

---

## 安全编码规范

### XSS 防护
```jsx
// ❌ 错误：直接渲染用户输入
<div>{userInput}</div>

// ✅ 正确：React 自动转义
<div>{userInput}</div>

// ❌ 错误：dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ 正确：使用 DOMPurify 清理
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

### CSRF 防护
```javascript
// 所有写操作都要带 CSRF token
fetch('/api/update', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': getCsrfToken()
  },
  body: JSON.stringify(data)
});
```

### 输入验证
```jsx
// 前端验证仅用于用户体验，不能替代后端验证
function validateInput(input) {
  if (!input || input.length > 100) {
    return false;
  }
  return true;
}
```

---

## React Hooks 最佳实践

### 状态管理
```jsx
// 相关状态合并为一个对象
const [user, setUser] = useState({ name: '', age: 0 });

// 而不是
const [name, setName] = useState('');
const [age, setAge] = useState(0);
```

### 依赖管理
```jsx
// useEffect 的依赖必须完整
useEffect(() => {
  fetchUser(userId);
}, [userId]); // ✅ 明确依赖

// 而不是
useEffect(() => {
  fetchUser(userId);
}, []); // ❌ 缺少依赖
```

### 自定义 Hook
```jsx
// 复杂逻辑抽取为自定义 Hook
function useUserData(userId) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchUser(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);

  return { user, loading, error };
}
```

---

## 上下文感知修复

当用户指出问题时：

### ✅ 必须这样做
1. 读取完整文件
2. 分析上下文
3. 检查其他组件是否有类似问题
4. 修复所有相关问题
5. 输出完整修复后的文件

### ❌ 不要这样做
- 只修复用户指出的点
- 不检查类似问题
- 只输出补丁

---

## 常见陷阱

### 陷阱 1：前端边界检查
- ❌ 错误：前端检查了，假设后端也检查
- ✅ 正确：前端检查仅用于 UX，不能替代后端检查

### 陷阱 2：直接渲染用户输入
- ❌ 错误：使用 dangerouslySetInnerHTML 不清理
- ✅ 正确：使用 DOMPurify 清理用户输入

### 陷阱 3：缺少三态处理
- ❌ 错误：只处理正常状态
- ✅ 正确：处理 loading, error, empty 三种状态

---

## 技术栈选择

### 框架
- React (默认), Vue, Svelte

### 状态管理
- 轻量级：useState, useReducer
- 中型：Zustand, Jotai
- 重量级：Redux Toolkit

### 样式方案
- CSS Modules (默认)
- Tailwind CSS
- Styled Components

### 表单处理
- React Hook Form
- Zod (schema validation)

---

## 持续改进

每次完成任务后，思考：
1. 这个组件是否有常见的安全问题？
2. 是否应该更新 corrections.md？
3. 是否有更好的组件拆分方式？
