---
description: 基于 IDA MCP 的二进制逆向安全分析 - 8 阶段流程
disable-model-invocation: false
---

# 二进制逆向安全审计（IDA MCP）

## Skill 定位（明确这是 MCP Skill）

### Skill 名称
`Binary_Reverse_Security_Audit_IDA_MCP`

### 核心依赖

- **IDA Pro**（支持 MCP）
- **IDA MCP Server**（暴露反汇编 / 反编译 / 元数据能力）

### Skill 目标

通过 IDA MCP 接口，将二进制逆向分析从"人工交互式"升级为"结构化、可编排、可审计"的安全分析流程。

---

## IDA MCP 在 Skill 中的角色

在这个 Skill 里：

- **IDA**：事实来源（Ground Truth）
- **MCP**：结构化访问与控制通道
- **Skill**：分析逻辑与安全语义建模

**MCP 不是"帮你逆向"，而是让你系统性地问对问题。**

---

## Skill 总体流程（MCP 驱动版）

整个 Skill 分为 8 个阶段，每一阶段都明确 MCP 的使用方式。

### 1️⃣ 样本加载与分析状态确认（MCP 初始化）

#### 目标
确保 IDA 的分析结果是"稳定且可用的"。

#### 通过 MCP 获取

- 文件类型 / 架构
- 加载基址
- 段信息
- 自动分析完成状态

#### 安全意义

- 防止在"未分析完成"的状态下做错误判断
- 为后续函数、CFG、Xref 分析打基础

#### 实施方法

```python
# 通过 IDA MCP 获取样本信息
mcp_call("get_sample_info")

# 返回示例
{
  "file_type": "ELF 64-bit",
  "architecture": "x86-64",
  "base_address": "0x400000",
  "segments": [
    {"name": ".text", "start": "0x400000", "end": "0x4fff00"},
    {"name": ".data", "start": "0x500000", "end": "0x501000"},
    {"name": ".bss", "start": "0x502000", "end": "0x503000"}
  ],
  "auto_analysis_complete": true
}

# 检查清单
# - [ ] 文件类型识别正确
# - [ ] 架构识别正确
# - [ ] 段信息完整
# - [ ] 自动分析已完成
```

---

### 2️⃣ 程序入口与执行模型还原（MCP 查询）

#### 目标
回答：程序从哪里开始？主执行路径是什么？

#### 通过 MCP 获取

- Entry Point
- main / WinMain / _start
- 初始化函数列表
- 线程创建点

#### Skill 行为

- 构建"主执行路径图"
- 标记非主路径（异常 / 隐蔽路径）

#### 实施方法

```python
# 通过 IDA MCP 获取入口点
mcp_call("get_entry_points")

# 返回示例
{
  "entry_points": [
    {"address": "0x401000", "name": "_start", "type": "entry"},
    {"address": "0x401050", "name": "main", "type": "main"},
    {"address": "0x401200", "name": "__libc_start_main", "type": "libc"}
  ],
  "initialization_functions": [
    {"address": "0x400f00", "name": "_init"},
    {"address": "0x400f50", "name": "frame_dummy"}
  ],
  "thread_creation": [
    {"address": "0x402000", "name": "pthread_create", "count": 3}
  ]
}

# 构建执行路径
# _start → __libc_start_main → main
#                                    ↓
#                            thread_create_points
```

**检查清单**：
- [ ] 识别入口点
- [ ] 识别 main 函数
- [ ] 识别初始化函数
- [ ] 识别线程创建点
- [ ] 构建主执行路径图

---

### 3️⃣ 函数空间全量建模（MCP 枚举）

#### 目标
建立完整的函数视图，而不是"看到哪算哪"。

#### 通过 MCP 获取

- 所有函数地址
- 函数大小
- 调用关系（Call Graph）
- 是否被引用

#### 安全意义

- 发现"未被主流程调用"的函数（后门高发区）
- 为并行分析（内存 / 权限 / 后门）提供基础集合

#### 实施方法

```python
# 通过 IDA MCP 获取所有函数
mcp_call("get_all_functions")

# 返回示例
{
  "total_functions": 245,
  "functions": [
    {
      "address": "0x401050",
      "name": "main",
      "size": 512,
      "called_by_main": true,
      "is_referenced": true,
      "xrefs_count": 15
    },
    {
      "address": "0x405000",
      "name": "hidden_backdoor",
      "size": 128,
      "called_by_main": false,
      "is_referenced": false,  # ⚠️ 可疑：未被主流程调用
      "xrefs_count": 0
    },
    {
      "address": "0x406000",
      "name": "license_check",
      "size": 256,
      "called_by_main": true,
      "is_referenced": true,
      "xrefs_count": 1
    }
  ]
}

# 分析重点
# - 未被引用的函数（后门候选）
# - 只在特定条件调用的函数
# - 名称可疑的函数（backdoor, debug, test 等）
```

**检查清单**：
- [ ] 获取所有函数列表
- [ ] 识别未被引用的函数
- [ ] 识别可疑命名的函数
- [ ] 构建调用关系图
- [ ] 标记后门候选函数

---

### 4️⃣ 输入面与攻击面识别（MCP + 语义规则）

#### 目标
找出所有外部可控输入。

#### 通过 MCP 结合分析

- API 调用（read / recv / fopen / argv）
- 字符串交叉引用
- 网络 / 文件 / IPC 相关函数

#### Skill 输出

- 输入源 → 函数映射表
- 可控性等级标注（强 / 中 / 弱）

#### 实施方法

```python
# 通过 IDA MCP 搜索输入相关函数
mcp_call("search_input_functions")

# 返回示例
{
  "input_sources": [
    {
      "type": "network",
      "functions": [
        {"address": "0x403000", "name": "recv", "controllability": "high"},
        {"address": "0x403050", "name": "fread", "controllability": "medium"}
      ]
    },
    {
      "type": "file",
      "functions": [
        {"address": "0x403100", "name": "fopen", "controllability": "high"},
        {"address": "0x403150", "name": "open", "controllability": "high"}
      ]
    },
    {
      "type": "argv",
      "functions": [
        {"address": "0x403200", "name": "argv", "controllability": "high"}
      ]
    },
    {
      "type": "env",
      "functions": [
        {"address": "0x403250", "name": "getenv", "controllability": "medium"}
      ]
    }
  ]
}

# 分析：从输入源到危险函数的数据流
# recv → process_input → dangerous_function
```

**检查清单**：
- [ ] 识别网络输入点
- [ ] 识别文件输入点
- [ ] 识别命令行参数
- [ ] 识别环境变量
- [ ] 识别 IPC 输入
- [ ] 标注可控性等级

---

### 5️⃣ 关键函数语义还原（MCP 反编译驱动）

#### 目标
从"汇编函数"提升到"安全语义单元"。

#### 通过 MCP 获取

- 反编译结果
- 局部变量
- 条件分支
- 常量 / magic 值

#### 重点识别

- 校验逻辑
- 加解密
- 权限判断
- License / Token 检查

#### 实施方法

```python
# 通过 IDA MCP 获取函数反编译结果
mcp_call("decompile_function", {"address": "0x406000"})

# 返回示例（伪代码）
{
  "address": "0x406000",
  "name": "license_check",
  "pseudo_code": """
int __usercall license_check(<int> key@<eax>)
{
  int result;
  char input_key[32];

  strcpy(input_key, "SECRET_KEY_12345");  // 硬编码密钥 ⚠️

  if ( strcmp(key, input_key) == 0 )
    result = 1;  // License valid
  else
    result = 0;  // License invalid

  return result;
}
""",
  "local_variables": [
    {"name": "input_key", "type": "char[32]", "value": "\"SECRET_KEY_12345\""},
    {"name": "result", "type": "int"}
  ],
  "magic_values": [
    {"value": "SECRET_KEY_12345", "type": "string", "risk": "hardcoded_key"}
  ],
  "control_flow": [
    {"type": "if", "condition": "strcmp(key, input_key) == 0"}
  ]
}

# 安全问题
# 1. 硬编码密钥（可以提取）
# 2. 简单字符串比较（容易绕过）
# 3. 没有时间戳验证
```

**检查清单**：
- [ ] 获取关键函数伪代码
- [ ] 识别硬编码密钥
- [ ] 识别 magic 值
- [ ] 分析条件分支
- [ ] 识别校验逻辑
- [ ] 识别加解密算法

---

### 6️⃣ 数据流与控制流安全分析（MCP 辅助）

#### 目标
判断：用户输入能不能影响危险行为？

#### 通过 MCP

- 跟踪变量定义与使用
- 分析条件跳转
- 识别函数指针 / 间接跳转

#### 漏洞类型

- 内存破坏
- 条件绕过
- 逻辑注入

#### 实施方法

```python
# 通过 IDA MCP 跟踪数据流
mcp_call("track_dataflow", {
  "source": "0x403000",  # recv
  "target": "0x404000",  # dangerous_function
  "max_depth": 10
})

# 返回示例
{
  "dataflow_path": [
    {"address": "0x403000", "function": "recv", "variable": "buffer"},
    {"address": "0x403100", "function": "process_input", "variable": "processed_data"},
    {"address": "0x403200", "function": "parse_command", "variable": "command"},
    {"address": "0x404000", "function": "system", "variable": "cmd_string"}  # ⚠️ 危险
  ],
  "vulnerability_type": "command_injection",
  "taint_source": "network_input",
  "sink": "system_call",
  "sanitization": null  # ⚠️ 没有净化
}

# 分析：从 recv 到 system 的数据流
# recv → buffer → processed_data → command → system
# 风险：命令注入（没有输入验证）
```

**检查清单**：
- [ ] 跟踪输入源到危险函数的数据流
- [ ] 检查是否有输入净化
- [ ] 识别缓冲区边界检查
- [ ] 分析条件跳转逻辑
- [ ] 识别函数指针调用

---

### 7️⃣ 权限与逻辑安全审计（逆向版越权）

#### 目标
识别程序内部的"权限模型"。

#### 通过 MCP 分析

- UID / GID / Token 判断函数
- 校验结果是否被使用
- 校验是否覆盖所有路径

#### 典型问题

- 校验函数存在但返回值未检查
- Debug / Test 分支绕过权限
- 状态与权限解耦

#### 实施方法

```python
# 通过 IDA MCP 搜索权限检查函数
mcp_call("search_permission_checks")

# 返回示例
{
  "permission_functions": [
    {
      "address": "0x407000",
      "name": "check_admin",
      "pseudo_code": """
bool check_admin(int user_id)
{
  if ( user_id == 0 )  // root
    return true;
  else
    return false;
}
""",
      "used_in": [
        {"address": "0x408000", "function": "delete_user", "checked": true},
        {"address": "0x408100", "function": "modify_config", "checked": false}  # ⚠️
      ]
    }
  ],
  "bypass_opportunities": [
    {
      "function": "modify_config",
      "issue": "check_admin 返回值未检查",
      "impact": "任何用户都可以修改配置"
    }
  ]
}

# 问题：modify_config 调用了 check_admin 但没有使用返回值
# void modify_config(int user_id, char* config) {
#     check_admin(user_id);  // 返回值被忽略
#     apply_config(config);  // 直接执行
# }
```

**检查清单**：
- [ ] 识别权限检查函数
- [ ] 验证返回值是否被使用
- [ ] 检查是否有绕过路径
- [ ] 识别硬编码的 UID/GID
- [ ] 分析状态与权限的关系

---

### 8️⃣ 隐蔽行为与后门路径建模（MCP 全局视角）

#### 目标
发现非预期、非文档化行为。

#### 通过 MCP

- 枚举未被主流程调用的函数
- 搜索特殊字符串 / magic
- 分析时间 / 环境触发逻辑

#### Skill 输出

- 后门候选路径
- 触发条件说明

#### 实施方法

```python
# 通过 IDA MCP 搜索可疑函数
mcp_call("search_hidden_behavior")

# 返回示例
{
  "hidden_functions": [
    {
      "address": "0x405000",
      "name": "hidden_shell",
      "characteristics": {
        "not_called_by_main": true,
        "network_listen": true,
        "magic_string": "BACKDOOR_ACTIVATION",
        "time_trigger": "check_timestamp"
      },
      "pseudo_code": """
void hidden_shell()
{
  if ( get_timestamp() > 1700000000 ) {  // 时间触发
    if ( strcmp(getenv("BACKDOOR_KEY"), "SECRET123") == 0 ) {
      create_shell("/bin/sh", 4444);  // 连接到 4444 端口
    }
  }
}
""",
      "trigger_conditions": [
        "时间戳 > 1700000000",
        "环境变量 BACKDOOR_KEY = SECRET123"
      ],
      "impact": "远程代码执行后门"
    }
  ],
  "suspicious_strings": [
    {"address": "0x405010", "value": "BACKDOOR_ACTIVATION"},
    {"address": "0x405020", "value": "SECRET123"},
    {"address": "0x405030", "value": "/bin/sh"},
    {"address": "0x405040", "value": "4444"}  # 端口号
  ]
}

# 后门分析
# 1. 未被主流程调用
# 2. 包含网络监听
# 3. 包含特殊字符串
# 4. 有时间触发逻辑
# 5. 有环境密钥验证
```

**检查清单**：
- [ ] 枚举未被引用的函数
- [ ] 搜索可疑字符串
- [ ] 识别网络相关函数
- [ ] 分析时间/环境触发
- [ ] 识别硬编码密钥
- [ ] 构建后门触发路径

---

## Skill 的核心优势（为什么一定要 MCP）

### 没有 MCP 的逆向是：
人在 IDA 里"看"

### 有 MCP 的逆向是：
Agent 在 IDA 里"问"

### MCP 让你可以：

- ✅ 并行分析不同安全维度
- ✅ 记录每一步分析假设
- ✅ 复现整个逆向审计过程
- ✅ 把逆向变成"工程流程"，而不是"个人手艺"

---

## 标准漏洞输出（MCP 友好）

每个问题至少包含：

### 1. 基本信息
- **漏洞类型**：内存破坏 / 条件绕过 / 逻辑缺陷 / 后门
- **风险等级**：高 / 中 / 低
- **影响范围**：受影响的函数、模块

### 2. 位置信息
- **函数名 + 地址**
- **反编译伪代码**
- **相关字符串 / magic 值**

### 3. 触发路径
- **输入源**：网络 / 文件 / argv / env
- **数据流**：从输入到漏洞点的路径
- **触发条件**：需要满足的条件

### 4. 安全影响
- **漏洞描述**
- **利用方式**
- **业务影响**

### 5. 修复建议
- **设计级建议**

---

## 审计报告模板

```markdown
## 二进制逆向安全审计报告

### 样本信息
- 文件名：sample_elf
- 文件类型：ELF 64-bit
- 架构：x86-64
- 基址：0x400000
- MD5：abc123...

### 执行摘要
- 函数总数：245
- 发现漏洞：X 个高危，Y 个中危，Z 个低危
- 主要风险：后门、硬编码密钥、命令注入

### 详细发现

#### 1. [高危] 隐藏后门 - hidden_shell @ 0x405000

**位置**：
- 函数：hidden_shell
- 地址：0x405000
- 未被主流程调用

**伪代码**：
```c
void hidden_shell()
{
  if ( get_timestamp() > 1700000000 ) {
    if ( strcmp(getenv("BACKDOOR_KEY"), "SECRET123") == 0 ) {
      create_shell("/bin/sh", 4444);
    }
  }
}
```

**触发条件**：
1. 时间戳 > 1700000000
2. 环境变量 BACKDOOR_KEY = SECRET123

**影响**：
- 远程代码执行
- 绕过所有正常权限检查
- 隐蔽性强（未被主流程调用）

**修复建议**：
- 完全删除该函数
- 检查是否有其他后门
- 重新编译并签名

---

#### 2. [中危] 硬编码密钥 - license_check @ 0x406000

**位置**：
- 函数：license_check
- 地址：0x406000
- 密钥：SECRET_KEY_12345

**伪代码**：
```c
int license_check(char* key)
{
  char input_key[32];
  strcpy(input_key, "SECRET_KEY_12345");

  if ( strcmp(key, input_key) == 0 )
    return 1;
  else
    return 0;
}
```

**影响**：
- 密钥可以被提取
- License 保护可以被绕过
- 可能生成伪造的 License

**修复建议**：
- 使用密钥派生函数（PBKDF2、Argon2）
- 将密钥存储在安全位置（TPM、HSM）
- 添加时间戳验证

---

#### 3. [高危] 命令注入 - process_command @ 0x404000

**位置**：
- 函数：process_command
- 地址：0x404000

**数据流**：
```
recv (0x403000)
  → buffer
  → process_input (0x403100)
  → command
  → system (0x404000) ⚠️
```

**伪代码**：
```c
void process_command(char* input)
{
  char cmd[256];
  sprintf(cmd, "ls %s", input);  // ⚠️ 直接拼接
  system(cmd);  // ⚠️ 命令注入
}
```

**影响**：
- 任意命令执行
- 通过网络输入触发
- 没有输入验证

**修复建议**：
- 使用白名单验证输入
- 使用 execve 而不是 system
- 转义特殊字符

---

### 附录

#### MCP 调用记录
- get_sample_info
- get_entry_points
- get_all_functions
- search_input_functions
- decompile_function (×15)
- track_dataflow (×8)
- search_permission_checks
- search_hidden_behavior

#### 审计方法论
- MCP 驱动的结构化分析
- 并行分析多个安全维度
- 可复现的审计流程
```

---

## Skill 总结

本 Skill **基于 IDA MCP 接口**，对二进制文件进行结构化逆向安全分析。

通过 **MCP 驱动的**：
- 函数枚举
- 执行模型还原
- 数据流与权限分析

系统性识别：
- 内存安全漏洞
- 逻辑缺陷
- 隐蔽后门行为

支持：
- 自动化、并行化与可复现的逆向审计流程

---

## 审计检查清单（总结）

### 第 1 阶段：样本加载
- [ ] 确认文件类型 / 架构
- [ ] 确认自动分析完成
- [ ] 获取段信息
- [ ] 获取基址信息

### 第 2 阶段：执行模型
- [ ] 识别入口点
- [ ] 识别 main 函数
- [ ] 构建主执行路径
- [ ] 识别线程创建点

### 第 3 阶段：函数空间
- [ ] 获取所有函数列表
- [ ] 识别未被引用的函数
- [ ] 构建调用关系图
- [ ] 标记可疑函数

### 第 4 阶段：攻击面
- [ ] 识别网络输入
- [ ] 识别文件输入
- [ ] 识别 argv/env
- [ ] 标注可控性等级

### 第 5 阶段：语义还原
- [ ] 获取关键函数伪代码
- [ ] 识别硬编码密钥
- [ ] 识别 magic 值
- [ ] 分析校验逻辑

### 第 6 阶段：数据流
- [ ] 跟踪输入到危险函数
- [ ] 检查输入净化
- [ ] 识别缓冲区边界检查
- [ ] 分析条件跳转

### 第 7 阶段：权限审计
- [ ] 识别权限检查函数
- [ ] 验证返回值使用
- [ ] 检查绕过路径
- [ ] 分析状态权限关系

### 第 8 阶段：后门检测
- [ ] 枚举未引用函数
- [ ] 搜索可疑字符串
- [ ] 识别网络行为
- [ ] 分析触发条件

---

## MCP 集成要求

### IDA MCP Server 功能需求

```yaml
required_functions:
  - get_sample_info
  - get_entry_points
  - get_all_functions
  - decompile_function
  - track_dataflow
  - search_input_functions
  - search_permission_checks
  - search_hidden_behavior
  - get_function_xrefs
  - get_strings

optional_functions:
  - get_cfg
  - get_call_graph
  - hexrays_decompile
```

---

**审计原则**：

> 通过 MCP 将逆向从"个人手艺"升级为"工程流程"
> 结构化提问 > 人工浏览
> 可复现的分析过程 > 依赖专家经验
> 并行分析多维度 > 串行分析单维度
