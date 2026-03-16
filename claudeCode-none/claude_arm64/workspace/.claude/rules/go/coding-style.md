# Go 编码规范

## 命名规范

- 包名：小写单词，不含下划线
- 接口名：`PascalCase`，通常 `-er` 后缀
- 实现：`PascalCase`，通常接口名去掉 `er` 或加 `Impl`
- 变量/函数：`camelCase` 或 `PascalCase`（导出）
- 常量：`PascalCase` 或 `camelCase`（导出）
- 缩写词全大写或首字母大写：`HTTP` / `Http` / `http`

## 代码风格

- 使用 `gofmt` 格式化（必须）
- 使用 `goimports` 排序导入
- 最大行宽：无硬性限制，建议 100 字符
- 使用 Tab 缩进

## 错误处理

- 错误必须显式处理
- 不允许忽略错误（使用 `_`）
- 使用 `errors.Wrap()` 添加上下文
- 避免嵌套 if 检查错误

## 并发安全

- 共享变量必须保护
- 通道优先用于通信
- 使用 `sync` 包或 `context` 控制
- 避免 data race

## 安全要求

- 禁止使用 `exec` 命令
- SQL 查询必须使用参数化
- 输入验证和转义
- 敏感配置不硬编码
- 使用 `crypto/rand` 非math/rand

## 性能要求

- 避免过早优化
- 使用 `pprof` 分析性能
- 避免内存泄漏
- 合理使用 goroutine
- 连接池管理

## 示例

```go
package userService

import (
    "errors"
    "fmt"
)

var (
    ErrInvalidInput = errors.New("invalid input")
    ErrUserNotFound = errors.New("user not found")
)

type UserService struct {
    repo UserRepository
}

type UserRepository interface {
    GetByID(id string) (*User, error)
}

func (s *UserService) GetActiveUsers(minAge int) ([]*User, error) {
    users, err := s.repo.GetAll()
    if err != nil {
        return nil, fmt.Errorf("get users: %w", err)
    }

    var result []*User
    for _, u := range users {
        if u.Age >= minAge {
            result = append(result, u)
        }
    }

    return result, nil
}
```

## 工具配置

- `gofmt` - 格式化
- `goimports` - 导入排序
- `golint` - 静态检查
- `go vet` - 静态分析
- `staticcheck` - 高级静态检查
