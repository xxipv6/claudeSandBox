# Java 编码规范

## 命名规范

- 类：`PascalCase`
- 方法：`camelCase`
- 变量：`camelCase`
- 常量：`UPPER_SNAKE_CASE`
- 包名：全小写，点分隔

## 代码风格

- 使用 4 空格缩进
- 最大行宽：120 字符
- 左大括号不换行
- 语句块之间空行
- import 顺序：标准库 → 第三方 → 本地

## 类型安全

- 避免使用原始类型（使用 `Integer` 而非 `int`）
- 避免使用 `@SuppressWarnings` 除非必要
- 泛型优先，避免rawtypes
- 使用 `Optional` 替代 null 返回

## 异常处理

- 优先使用具体异常类型
- 不允许捕获 `Throwable`
- 不允许吞掉异常（空的 catch 块）
- 资源清理使用 try-with-resources
- 日志记录异常堆栈

## 安全要求

- 禁止使用 `Runtime.exec()`
- SQL 查询必须使用 `PreparedStatement`
- 输入验证和转义
- 敏感数据使用加密存储
- 避免硬编码密钥和凭证

## 依赖注入

- 优先使用构造函数注入
- 避免循环依赖
- 使用 `@Autowired` 谨慎（字段注入）
- 接口优先于实现类

## 日志规范

- 使用 SLF4J + Logback
- 使用占位符 `{}` 而非字符串拼接
- 异常日志必须包含堆栈
- 使用合适的日志级别

## 示例

```java
package com.example.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private static final int DEFAULT_AGE = 18;

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getActiveUsers(int minAge) {
        try {
            List<User> users = userRepository.findAll();
            return users.stream()
                    .filter(u -> u.getAge() >= minAge)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("获取用户失败", e);
            throw new ServiceException("获取用户失败", e);
        }
    }
}
```

## Spring 特定规范

- Controller 只处理 HTTP 层逻辑
- Service 处理业务逻辑
- Repository 只负责数据访问
- 使用 `@Transactional` 管理事务
- 配置使用 `@ConfigurationProperties`

## 工具配置

- Checkstyle - 代码风格检查
- Spotless - 格式化
- PMD - 静态分析
- FindBugs - Bug 检测
- SonarQube - 代码质量

## 测试规范

- 使用 JUnit 5 + Mockito
- 测试类命名：`{ClassName}Test`
- 测试方法命名：`should{ExpectedBehavior}_when{StateUnderTest}`
