---
name: binary-reverse
description: 触发于需要分析二进制文件、原生库、可执行程序、固件中的 native 组件、程序逻辑、协议实现或二进制漏洞。不要用于 JAR/class 反编译、普通源码审计或单纯 PoC 编写。
disable-model-invocation: false
---

# 二进制逆向工程

## Trigger

### TRIGGER WHEN
- 用户请求分析 ELF / PE / Mach-O / so / dll / 可执行文件 / 原生库
- 需要理解编译后程序逻辑、协议实现、算法细节或恶意样本行为
- 需要识别缓冲区溢出、UAF、格式化字符串、逻辑缺陷等二进制漏洞
- 需要提取密钥、硬编码秘密、加密实现或状态机逻辑
- 需要对固件中的 native 组件做逆向或调试

### DO NOT TRIGGER WHEN
- 目标是 `.jar`、`.class`、`classes.jar` 这类 Java 归档反编译
- 任务本质上是普通源码审计或 Web 白盒审计
- 只需要复现漏洞，不需要逆向定位或理解二进制逻辑
- IoT 场景里重点是设备/固件整体审计而不是单个 native 二进制

### USE WITH
- Java 归档反编译优先交给 `jar-decompile`
- 设备/固件整体审计优先交给 `iot-audit`
- 需要复现利用时配合 `poc-exploit`

### EXAMPLE PROMPTS
- “逆向这个 ELF，看登录校验在哪里”
- “分析这个 .so 的加密逻辑和硬编码 key”
- “帮我看看这个 PE 有没有明显的 UAF 风险”
- “提取这个二进制里的私有协议状态机”

---

## 逆向核心原则

- **静态 + 动态结合**：静态分析理解结构，动态分析验证行为
- **自底向上 + 自顶向下**：从函数调用理解流程，从字符串理解功能
- **工具链优先**：熟练使用 IDA / Ghidra / Binary Ninja / GDB / Frida
- **记录优先**：每一步分析都要记录，确保可回溯

---

## 完整逆向流程

### 1️⃣ 信息收集

**文件识别**：
```bash
# 文件类型
file binary

# 架构信息
file binary | grep -E "(32-bit|64-bit|ARM|x86|MIPS)"

# 加壳检测
file binary | grep -i "compressed\|upx\|packed"

# 字符串提取
strings binary | grep -i "password\|key\|http\|api"

# 依赖库
ldd binary  # Linux
otool -L binary  # macOS
```

**基本信息确认**：
- 架构（x86/x64/ARM/MIPS）
- 编译器（GCC/MSVC/Clang）
- 是否加壳（UPX/ASPack/自定义）
- 符号信息（是否 strip）
- 保护机制（NX/ASLR/PIE/Stack Canary）

### 2️⃣ 静态分析

**反汇编工具选择**：
- **IDA Pro** - 最强大，支持所有架构
- **Ghidra** - 免费，反编译质量高
- **Binary Ninja** - 现代，API 友好
- **Radare2 / Cutter** - 开源，轻量级

**分析步骤**：
```
1. 加载文件 → 确认加载地址、基址
2. 识别函数 → main、关键库函数、自定义函数
3. 交叉引用 → 查看函数调用关系
4. 字符串引用 → 从字符串定位功能点
5. 控制流图 → 理解程序逻辑分支
6. 数据流分析 → 追踪变量、参数、返回值
```

**关键函数识别**：
- `main` / `WinMain` / `_start` - 入口点
- `malloc` / `free` / `memcpy` - 内存操作
- `strcpy` / `sprintf` / `gets` - 危险函数
- `socket` / `connect` / `send` - 网络操作
- `fopen` / `fread` / `fwrite` - 文件操作
- `CreateProcess` / `system` - 执行命令

**常见漏洞模式**：
- **栈溢出**：`strcpy` / `gets` / `sprintf` 不检查长度
- **堆溢出**：`malloc` 后拷贝超长数据
- **格式化字符串**：`printf(user_input)` 用户可控
- **整数溢出**：长度计算导致溢出
- **UAF**：释放后未置空，继续使用
- **Double Free**：同一指针释放两次
- **逻辑漏洞**：权限检查不完整、竞态条件

### 3️⃣ 动态分析

**调试工具选择**：
- **GDB** - Linux 标准调试器
- **x64dbg / OllyDbg** - Windows 调试
- **LLDB** - macOS / iOS 调试
- **Frida** - 动态插桩，最强大

**调试技巧**：
```bash
# 下断点
b main
b *0x401234

# 运行
run

# 查看寄存器
info registers
print $eax

# 查看内存
x/10gx $rsp
x/s 0x402000

# 单步执行
si  # 指令级
n   # 源码级

# 继续执行
c
```

**Frida Hook 示例**：
```javascript
// Hook 函数
Interceptor.attach(Module.findExportByName(null, "malloc"), {
    onEnter: function(args) {
        console.log("malloc size:", args[0]);
    },
    onLeave: function(retval) {
        console.log("malloc return:", retval);
    }
});

// Hook 地址
Interceptor.attach(ptr(0x401234), {
    onEnter: function(args) {
        console.log("Called!");
        console.log("arg0:", args[0]);
    }
});
```

### 4️⃣ 漏洞分析

**漏洞验证流程**：
```
1. 静态定位漏洞点（危险函数调用）
2. 理解触发条件（输入、长度、状态）
3. 计算偏移量（缓冲区大小、返回地址偏移）
4. 构造 PoC（触发漏洞）
5. 动态调试验证（断点、内存查看）
6. 编写 Exploit（控制执行流）
```

**常见 Exploit 技巧**：
- **Ret2libc** - 返回到库函数（system）
- **ROP** - Return Oriented Programming
- **堆喷射** - Heap Spray
- **栈迁移** - Stack Pivot
- **GOT Overwrite** - 覆盖全局偏移表
- **Partial Overwrite** - 部分覆盖利用

### 5️⃣ 加密算法识别

**特征识别**：
```c
// AES
SBox[] + 256 字节查表
10 轮迭代（AES-128）
14 轮迭代（AES-256）

// DES
8 个 S-Box
16 轮 Feistel 结构

// RSA
模幂运算：pow(m, e, n)
大整数运算

// MD5
4 个轮次
64 次操作
魔数：0x67452301, 0xEFCDAB89

// SHA256
8 个初始哈希值
64 轮迭代
```

**密钥提取**：
- 内存 dump 搜索密钥
- 动态调试追踪密钥生成
- 侧信道攻击（timing、power）

### 6️⃣ 协议逆向

**网络协议**：
```bash
# 抓包
tcpdump -i eth0 -w capture.pcap

# 分析
wireshark capture.pcap

# 识别协议字段
- 魔数（Magic Number）
- 版本号
- 长度字段
- 校验和（CRC / MD5）
- 加密字段
```

**文件格式**：
```bash
# 十六进制查看
xxd file.bin | head

# 查找结构
- 文件头（Magic）
- 文件尾
- 重复模式
- 可读字符串
```

### 7️⃣ 固件逆向

**固件解包**：
```bash
# 识别文件系统
binwalk firmware.bin

# 提取文件系统
binwalk -e firmware.bin

# 常见文件系统
- SquashFS
- CramFS
- JFFS2
- YAFFS2
- UBIFS
```

**固件分析流程**：
```
1. binwalk 识别文件系统和嵌入文件
2. 提取文件系统
3. 分析启动脚本（/etc/init.d/*）
4. 分析二进制程序（架构多为 ARM/MIPS）
5. 分析配置文件（密码、密钥）
6. 模拟运行（QEMU 用户态）
7. 漏洞分析
```

**QEMU 模拟**：
```bash
# ARM 架构
qemu-arm -L /usr/arm-linux-gnueabihf ./binary

# MIPS 架构
qemu-mips -L /usr/mips-linux-gnu ./binary

# chroot 环境
qemu-arm -L ./rootfs ./binary
```

### 8️⃣ Android 逆向

**APK 反编译**：
```bash
# 解包 APK
unzip app.apk

# 转换 dex 到 jar
d2j-dex2jar classes.dex

# 反编译 jar
jd-gui classes-dex2jar.jar

# 或者直接使用 apktool
apktool d app.apk

# 查看 smali 代码
cat app/smali/com/example/MainActivity.smali
```

**Native 分析（SO 文件）：
- 使用 IDA / Ghidra 分析 .so 文件
- 架构多为 ARM / ARM64
- Hook JNI 函数（Frida）

**Frida Android Hook**：
```javascript
// Hook Java 函数
Java.perform(function() {
    var MainActivity = Java.use("com.example.MainActivity");
    MainActivity.checkPassword.implementation = function(pass) {
        console.log("Password:", pass);
        return this.checkPassword(pass);
    };
});

// Hook Native 函数
Interceptor.attach(Module.findExportByName("libnative.so", "encrypt"), {
    onEnter: function(args) {
        console.log("encrypt:", args[0]);
    }
});
```

### 9️⃣ iOS 逆向

**IPA 解包**：
```bash
# 解压 IPA
unzip app.ipa

# 砸壳（Clutch / frida-ios-dump）
Clutch -i  # 列出应用
Clutch -b com.example.app  # 砸壳

# class-dump 反编译
class-dump Payload/App.app/App
```

**头文件分析**：
- 使用 class-dump 生成头文件
- 理解类结构、方法签名

**Hook 与调试**：
- **Frida** - 动态插桩
- **Cycript** - 运行时交互
- **LLDB** - 调试器

**Frida iOS Hook**：
```javascript
// Hook Objective-C 方法
if (ObjC.available) {
    var className = "AppDelegate";
    var methodName = "- application:didFinishLaunchingWithOptions:";
    var method = ObjC.classes[className][methodName];

    Interceptor.attach(method.implementation, {
        onEnter: function(args) {
            console.log("AppDelegate called");
        },
        onLeave: function(retval) {
            console.log("Return:", retval);
        }
    });
}
```

---

## 工具清单

### 必备工具
- **IDA Pro** - 静态分析（付费）
- **Ghidra** - 静态分析（免费）
- **GDB** - 调试
- **Frida** - 动态插桩

### 辅助工具
- **binwalk** - 固件分析
- **strings** - 字符串提取
- **xxd / hexdump** - 十六进制查看
- **wireshark** - 网络分析
- **apktool** - APK 反编译
- **jadx** - DEX 转 Java

---

## 常见问题

**Q: 程序加了壳怎么办？**
A: 先脱壳（UPX 用 `upx -d`，自定义壳需要手动分析）

**Q: 符号被 strip 了怎么办？**
A: 从字符串、库函数调用推断功能，使用 Flirt 签名识别库函数

**Q: 混淆代码如何分析？**
A: 动态调试为主，Frida hook 关键函数，理解输入输出

**Q: ARM 汇编不熟悉？**
A: 参考 ARM 指令集手册，先用反编译器看伪代码

---

## 输出格式

分析完成后应输出：

```markdown
# Binary Reverse Analysis: [filename]

## 基本信息
- **文件名**: [filename]
- **架构**: [x86_64 / ARM / MIPS]
- **编译器**: [GCC 4.8 / MSVC / Clang]
- **是否加壳**: [Yes / No]
- **符号信息**: [Stripped / Not stripped]

## 功能分析
[程序主要功能]

## 关键函数
### main (0x401000)
[功能描述]

### func_check (0x401234)
[功能描述]

## 漏洞发现
### 漏洞 1: 栈溢出
- **位置**: 0x401234
- **类型**: 栈溢出
- **触发**: strcpy 不检查长度
- **PoC**: [触发代码]

## 加密算法
[识别的加密算法、密钥]

## 协议分析
[逆向的协议格式]

## 结论
[总结分析结果]
```

---

**记住**：逆向工程需要耐心和经验，工具只是辅助，关键在于理解程序逻辑和识别安全漏洞。
