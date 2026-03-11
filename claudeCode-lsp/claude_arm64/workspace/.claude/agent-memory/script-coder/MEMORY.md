# Script-Coder Agent Memory

## 项目知识引用

本项目使用**共享知识库**，所有 knowledge 文件夹的内容对 SCRIPT-CODER 强制可见：

### 共享知识库位置
- **失败模式库**：`/workspace/knowledge/patterns.md`
- **领域知识库**：`/workspace/knowledge/domains.md`
- **工具认知库**：`/workspace/knowledge/tools.md`
- **错误学习库**：`/workspace/knowledge/corrections.md`

### Script-Coder 使用指引

**编写脚本前**：
- 快速浏览 corrections.md，避免重复犯错
- 参考 tools.md 选择合适的工具

**编写脚本时**：
- 重点关注：资源清理、异常处理、输入验证
- 对照 domains.md 的"输入"、"资源"、"时间"维度

**代码审查时**：
- 对照 corrections.md 的错误记录
- 检查是否有资源泄露

---

## 代码质量规范

### 输入验证
```python
# 必须验证所有外部输入
def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('--target', required=True, help='Target URL')
    parser.add_argument('--timeout', type=int, default=10, help='Timeout')
    return parser.parse_args()

def main():
    args = parse_args()
    if not is_valid_url(args.target):
        raise ValueError(f"Invalid URL: {args.target}")
```

### 资源清理
```python
# 使用 context manager 确保资源清理
def process_file(filepath):
    with open(filepath, 'r') as f:
        data = f.read()
    # 自动清理

# 或使用 try-finally
def process_resource():
    resource = acquire_resource()
    try:
        # 使用资源
        pass
    finally:
        release_resource(resource)
```

### 异常处理
```python
# 完整的异常处理
def exploit(target):
    try:
        # exploit 逻辑
        pass
    except ConnectionError as e:
        logger.error(f"Connection failed: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise
    finally:
        cleanup()
```

---

## 安全编码规范

### 超时设置
```python
# 所有网络操作都要设置超时
import socket

socket.setdefaulttimeout(10)

# 或
response = requests.get(url, timeout=10)
```

### 并发安全
```python
# 使用锁保护共享状态
import threading

lock = threading.Lock()
results = []

def safe_append(result):
    with lock:
        results.append(result)
```

```go
// Go 并发安全模式
var mu sync.Mutex
var results []Result

func safeAppend(r Result) {
    mu.Lock()
    defer mu.Unlock()
    results = append(results, r)
}
```

### 不执行用户输入
```python
# ❌ 危险：执行用户输入
os.system(user_input)

# ✅ 安全：使用 subprocess
subprocess.run(['command', 'arg1', 'arg2'], check=True)
```

---

## PoC 模板

### 标准 PoC 结构
```python
#!/usr/bin/env python3
"""
CVE-XXXX-XXXX PoC
Author: Security Researcher
"""

import argparse
import logging
import requests

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def parse_args():
    """解析命令行参数"""
    parser = argparse.ArgumentParser(description="CVE-XXXX-XXXX PoC")
    parser.add_argument('--target', required=True, help='Target URL')
    parser.add_argument('--port', type=int, default=80, help='Target port')
    parser.add_argument('--timeout', type=int, default=10, help='Request timeout')
    return parser.parse_args()

def check_vulnerability(target):
    """检查漏洞是否存在"""
    logger.info(f"Checking {target}...")
    try:
        # 检查逻辑
        return True
    except Exception as e:
        logger.error(f"Check failed: {e}")
        return False

def exploit(target):
    """执行漏洞利用"""
    logger.info(f"Exploiting {target}...")
    try:
        # exploit 逻辑
        logger.info("Exploit successful!")
        return True
    except Exception as e:
        logger.error(f"Exploit failed: {e}")
        return False

def main():
    args = parse_args()
    target = f"{args.target}:{args.port}"

    if check_vulnerability(target):
        exploit(target)
    else:
        logger.error("Target is not vulnerable")

if __name__ == "__main__":
    main()
```

---

## Fuzzer Harness 模板

### AFL++ Harness
```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>

// AFL++ harness template
int LLVMFuzzerTestOneInput(const uint8_t *data, size_t size) {
    // 1. 输入验证
    if (size < 4) return 0;

    // 2. 提取数据
    uint32_t value = *(uint32_t*)data;

    // 3. 调用目标函数
    target_function(value, data + 4, size - 4);

    return 0;
}
```

### libFuzzer Harness
```cpp
#include <cstdint>
#include <fuzzer/FuzzedDataProvider.h>

extern "C" int LLVMFuzzerTestOneInput(const uint8_t *data, size_t size) {
    FuzzedDataProvider provider(data, size);

    // 提取模糊输入
    std::string str1 = provider.ConsumeRandomLengthString();
    std::string str2 = provider.ConsumeRandomLengthString();
    int number = provider.ConsumeIntegral<int>();

    // 调用目标函数
    target_function(str1, str2, number);

    return 0;
}
```

---

## 上下文感知修复

当用户指出问题时：

### ✅ 必须这样做
1. 读取完整文件
2. 分析上下文
3. 检查其他函数是否有类似问题
4. 修复所有相关问题
5. 输出完整修复后的文件

### ❌ 不要这样做
- 只修复用户指出的点
- 不检查类似问题
- 只输出补丁

---

## 常见陷阱

### 陷阱 1：资源泄露
- ❌ 错误：打开文件/网络连接不关闭
- ✅ 正确：使用 context manager 或 try-finally

### 陷阱 2：没有超时
- ❌ 错误：网络操作不设置超时
- ✅ 正确：所有网络操作都设置超时

### 陷阱 3：并发不安全
- ❌ 错误：多个线程/协程修改共享状态
- ✅ 正确：使用锁或线程安全的数据结构

### 陷阱 4：执行用户输入
- ❌ 错误：直接执行用户输入
- ✅ 正确：使用 subprocess 或沙箱

---

## 工具选择

### HTTP 请求
- Python: requests (默认), httpx
- Go: net/http (默认)

### 并发
- Python: asyncio, threading, multiprocessing
- Go: goroutine

### Fuzzing
- AFL++ (二进制)
- libFuzzer (二进制)
- boofuzz (协议)

### 调试
- Python: pdb, ipdb
- Go: delve

---

## 持续改进

每次完成任务后，思考：
1. 这个脚本是否有资源泄露？
2. 是否应该更新 corrections.md？
3. 是否有更高效的实现方式？
