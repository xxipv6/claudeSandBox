# Python 编码规范

## 命名规范

- 变量/函数：`snake_case`
- 类：`PascalCase`
- 常量：`UPPER_SNAKE_CASE`
- 私有成员：`_leading_underscore`

## 代码风格

- 遵循 PEP 8
- 最大行宽：88 字符（Black 默认）
- 使用 4 空格缩进
- 导入顺序：标准库 → 第三方 → 本地

## 类型注解

- 函数必须有类型注解
- 复杂类型使用 Type Hints
- 避免使用 `Any`，明确具体类型

## 错误处理

- 使用明确的异常类型
- 不使用裸 `except`：必须指定异常类型
- 资源清理使用 `with` 语句
- 日志记录异常上下文

## 安全要求

- 禁止使用 `eval()`
- SQL 查询必须使用参数化
- 用户输入必须验证和转义
- 敏感数据使用加密存储
- 避免硬编码密钥和凭证

## 文档要求

- 所有公共函数必须有 docstring
- 复杂逻辑必须添加注释
- docstring 遵循 Google 风格

## 示例

```python
from typing import List
import logging

logger = logging.getLogger(__name__)

class UserService:
    """用户服务类。"""

    def get_active_users(self, min_age: int) -> List[dict]:
        """
        获取活跃用户列表。

        Args:
            min_age: 最小年龄

        Returns:
            用户列表

        Raises:
            ValueError: 参数无效
        """
        try:
            # 实现逻辑
            pass
        except Exception as e:
            logger.error(f"获取用户失败: {e}")
            raise
```

## 工具配置

- 使用 Black 格式化
- 使用 Flake8 检查（E501 忽略行宽）
- 使用 mypy 类型检查
- 使用 isort 排序导入
