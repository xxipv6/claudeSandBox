---
name: iot-audit
description: IoT 安全审计（自动识别版）- 固件/源码/混合，统一风险建模，识别入口、权限、状态、副作用
---

# IoT 安全审计（自动识别版）

## 何时启用

- 用户请求 IoT 设备或固件安全审计时
- 检测到固件文件（.bin、.elf、.fw）或 IoT 源码时
- 需要分析嵌入式系统、IoT 设备安全性时
- 涉及硬件接口、固件漏洞分析时

---

## Skill 定位

### Skill 名称
`IoT_Security_Audit_AutoDetect`

### 设计目标

在**未知交付形态**下（只有固件 / 只有源码 / 固件+源码）：
- 自动识别可用资产
- 选择正确审计路径
- 统一风险建模与输出

---

## 一、自动识别阶段（必须先做）

这是整个 Skill 的入口阶段，决定后续走哪条路。

### 1️⃣ 资产形态识别规则

#### 检测到以下任一项 → 认为"有源代码"

```bash
# 构建系统文件
Makefile
CMakeLists.txt
Kconfig
build.gradle

# 源代码目录
src/
components/
packages/
lib/

# 明显的源文件
*.c
*.cpp
*.h
*.hpp
*.rs
*.go
```

#### 检测到以下任一项 → 认为"有固件"

```bash
# 固件文件
*.bin
*.img
*.trx
*.fw
*.elf
*.hex

# 文件系统
squashfs
cramfs
jffs2
ubifs
yaffs2

# 固件组件
bootloader
kernel
rootfs
```

### 2️⃣ 自动分类结果（只会落在一种）

```python
def detect_asset_type():
    has_source = check_source_indicators()
    has_firmware = check_firmware_indicators()

    if has_firmware and not has_source:
        return "Type A: 仅固件"
    elif has_source and not has_firmware:
        return "Type B: 仅源代码"
    elif has_firmware and has_source:
        return "Type C: 固件 + 源代码（混合）"
    else:
        return "未知类型"
```

#### 实施方法

```bash
# 自动检测脚本
echo "🔍 检测资产形态..."

# 检查源代码
if [ -f "Makefile" ] || [ -f "CMakeLists.txt" ] || [ -d "src" ]; then
    HAS_SOURCE=true
fi

# 检查固件
if [ -f "*.bin" ] || [ -f "*.fw" ] || [ -f "*.elf" ]; then
    HAS_FIRMWARE=true
fi

# 分类
if [ "$HAS_FIRMWARE" = true ] && [ "$HAS_SOURCE" = false ]; then
    ASSET_TYPE="Type A: 仅固件"
elif [ "$HAS_SOURCE" = true ] && [ "$HAS_FIRMWARE" = false ]; then
    ASSET_TYPE="Type B: 仅源代码"
elif [ "$HAS_FIRMWARE" = true ] && [ "$HAS_SOURCE" = true ]; then
    ASSET_TYPE="Type C: 固件 + 源代码（混合）"
fi

echo "✅ 检测结果：$ASSET_TYPE"
```

**后续流程**：严格按类型分支执行，但输出模型统一。

---

## 二、统一审计主线（不随类型变化）

无论哪种形态，审计目标不变，只变"证据来源"。

### 四条主线（强制贯穿）

#### 1️⃣ 入口主线：设备暴露了哪些可触发点

**远程入口**：
- 网络服务（HTTP、MQTT、CoAP、专有协议）
- 云平台接口
- 蜂窝网络（2G/3G/4G/5G/NB-IoT）

**局域网入口**：
- Wi-Fi
- 蓝牙
- Zigbee
- Z-Wave
- USB

**物理入口**：
- UART
- JTAG
- SWD
- 调试接口

#### 2️⃣ 权限主线：设备内部"谁能做什么"

**权限模型**：
- root vs 用户
- 管理员 vs 普通用户
- 区域权限（场景模式）

**权限检查点**：
- 认证（登录、Token）
- 授权（角色、权限）
- 隔离（沙箱、容器）

#### 3️⃣ 状态主线：设备状态是否可被非法推进

**关键状态**：
- 配置状态
- 运行模式（正常 / 维护 / Debug）
- 安全状态（锁 / 解锁 / 报警）
- 升级状态

**状态迁移**：
- 正常流程
- 异常流程
- 绕过路径

#### 4️⃣ 持久化主线：攻击是否能长期存在

**持久化位置**：
- Flash / EEPROM
- 配置文件
- 数据库
- 云端

**持久化内容**：
- 恶意配置
- 后门账号
- 恶意固件

---

## 三、Type A：仅固件审计路径

### 核心方法

1. **固件解包**
2. **启动链还原**
3. **二进制逆向**
4. **配置与脚本分析**

### 关键步骤

#### 1️⃣ rootfs 枚举

```bash
# 枚举根文件系统
find /bin /sbin /etc /www -type f

# 关注点
/bin/*      # 可执行文件
/sbin/*     # 系统可执行文件
/etc/*      # 配置文件
/www/*      # Web 界面
```

**检查清单**：
- [ ] 列出所有可执行文件
- [ ] 识别网络服务（httpd、telnetd、sshd）
- [ ] 识别配置文件（shadow、passwd、config）
- [ ] 识别脚本（rcS、init.d、crontabs）

#### 2️⃣ 启动脚本分析

```bash
# 分析启动脚本
cat /etc/init.d/rcS
cat /etc/inittab
cat /etc/crontabs/root

# 关注点
- 默认启动的服务
- 默认运行的命令
- 定时任务
```

**高危关注**：
- 默认 root 密码
- Telnet / UART 无认证
- 自动启动的 Debug 服务

#### 3️⃣ 网络服务识别

```bash
# 识别网络服务
netstat -tuln
ps | grep -E "(httpd|telnetd|sshd|ftpd)"

# 关注点
- 开放的端口
- 运行的服务
- 服务版本
```

**高危关注**：
- 局域网接口无认证
- 默认凭证
- 已知漏洞版本

#### 4️⃣ 设备端二进制逆向

**逆向目标**：
- 管理服务（httpd、mgd）
- 升级程序（upgrade、fw_upgrade）
- 认证服务（authd）

**逆向重点**：
- 硬编码凭证
- 加密密钥
- 协议逻辑
- 后门代码

**实施方法**：

```python
# 使用 Ghidra / IDA 逆向
# 1. 识别字符串
search_strings("password", "token", "key", "secret")

# 2. 识别网络协议
locate_functions("recv", "send", "bind", "listen")

# 3. 识别文件操作
locate_functions("fopen", "open", "read", "write")

# 4. 识别权限检查
locate_functions("getuid", "geteuid", "getgid")
```

### 高危关注

#### 默认 root / Telnet / UART

```bash
# 检查默认凭证
cat /etc/shadow
cat /etc/passwd

# 检查 Telnet
grep -r "telnet" /etc/inittab

# 检查 UART
grep -r "ttyS0" /etc/inittab
```

#### 局域网接口无认证

```bash
# 检查 HTTP 服务
curl http://192.168.1.1/
curl http://192.168.1.1/api/status

# 检查 UDP 服务
nc -u 192.168.1.1 8888
```

#### 升级验签绕过

```bash
# 分析升级逻辑
strings upgrade | grep -i "sign"
strings upgrade | grep -i "verify"

# 检查升级脚本
cat /etc/upgrade_script.sh
```

#### 隐藏命令 / 后门

```bash
# 搜索可疑字符串
strings -t d httpd | grep -E "(debug|test|backdoor|hidden)"

# 搜索未文档化的接口
strings -t d httpd | grep "/api"
```

---

## 四、Type B：仅源代码审计路径

### 核心方法

1. **构建系统分析**
2. **入口函数枚举**
3. **权限与状态机代码审计**
4. **升级链源码审计**

### 关键步骤

#### 1️⃣ 启动链源码

```bash
# 查找启动代码
find . -name "main.c"
find . -name "init.c"
find . -name "boot.c"

# 守护进程
grep -r "daemon" src/
grep -r "fork" src/
```

**检查清单**：
- [ ] 识别入口函数
- [ ] 识别守护进程
- [ ] 识别服务启动顺序

#### 2️⃣ 入口函数枚举

```c
// 示例：网络服务入口
void *http_server_thread(void *arg) {
    int server_fd = socket(AF_INET, SOCK_STREAM, 0);
    bind(server_fd, ...);
    listen(server_fd, ...);

    while (1) {
        int client_fd = accept(server_fd, ...);

        // ⚠️ 检查：是否有认证？
        handle_request(client_fd);
    }
}
```

**检查清单**：
- [ ] 列出所有网络入口函数
- [ ] 列出所有串口入口函数
- [ ] 列出所有 USB 入口函数
- [ ] 标注每个入口的认证要求

#### 3️⃣ 认证与权限校验点

```c
// 示例：权限检查
int handle_api_request(int client_fd, api_request_t *req) {
    // ⚠️ 检查：认证是否可绕过？
    #ifdef DEBUG_MODE
    // Debug 模式跳过认证
    if (!is_debug_mode()) {
        if (!authenticate(req->token)) {
            return -1;
        }
    }
    #endif

    // ⚠️ 检查：返回值是否被使用？
    check_permission(req->user_id, req->resource);

    // 执行操作
    return execute_operation(req);
}
```

**高危关注**：
- Debug 宏控制安全逻辑
- token 校验结果未使用
- 条件编译导致 release 行为不同

#### 4️⃣ 状态字段与状态迁移逻辑

```c
// 示例：状态机
typedef enum {
    STATE_LOCKED = 0,
    STATE_UNLOCKED = 1,
    STATE_ADMIN = 2
} device_state_t;

int unlock_device(int user_id, char *code) {
    device_state_t current_state = get_device_state();

    // ⚠️ 检查：状态迁移是否安全？
    if (verify_code(code)) {
        set_device_state(STATE_UNLOCKED);
        return 0;
    }

    return -1;
}

int enter_admin_mode(int user_id) {
    // ⚠️ 检查：是否只依赖状态？
    if (get_device_state() == STATE_UNLOCKED) {
        set_device_state(STATE_ADMIN);
        return 0;
    }

    return -1;
}
```

**高危关注**：
- 状态与权限解耦
- 状态迁移可绕过
- 状态可被低权限接口修改

#### 5️⃣ 升级链源码审计

```c
// 示例：升级逻辑
int upgrade_firmware(const char *fw_path, const char *signature) {
    // ⚠️ 检查：验签是否正确？
    if (!verify_signature(fw_path, signature)) {
        return -1;
    }

    // ⚠️ 检查：参数是否安全？
    char cmd[256];
    sprintf(cmd, "flash_write %s", fw_path);  // ⚠️ 命令注入
    system(cmd);

    return 0;
}
```

**高危关注**：
- 验签逻辑不严格
- 命令拼接（system/popen）
- 固件路径可被控制

---

## 五、Type C：固件 + 源代码（最强路径）

### 核心方法

**源码为主，固件为证据**
- 源码 → 固件映射验证

### 关键步骤

#### 1️⃣ 源码中定位

```bash
# 搜索关键功能
grep -r "http" src/
grep -r "upgrade" src/
grep -r "auth" src/
grep -r "admin" src/
```

#### 2️⃣ 固件中验证

```bash
# 提取固件中的二进制
binwalk -e firmware.bin

# 检查是否真的编译进 release
strings rootfs/usr/bin/httpd | grep -E "(admin|debug|backdoor)"

# 验证行为
# 在固件中启动服务，观察行为
```

#### 3️⃣ 对比：源码 vs 二进制

**对比点**：
- 功能是否真的编译进固件
- Debug 宏在 release 中的状态
- 是否存在额外隐藏逻辑

**高危关注**：
- 源码已修复但固件未更新
- 条件编译导致 release 行为不同
- 固件中存在源码未体现的后门

---

## 六、统一的"入口 → 权限 → 状态 → 副作用"模型

无论 Type A/B/C，每个发现都必须映射到这个模型。

### 模型定义

```
入口点
  ↓
认证 / 权限校验
  ↓
状态判断
  ↓
危险副作用（执行 / 升级 / 持久化）
```

### 任何一层缺失，都是漏洞候选

#### 示例 1：缺少认证

```
入口点：HTTP API /api/reboot
  ↓
认证 / 权限校验：❌ 缺失
  ↓
状态判断：N/A
  ↓
危险副作用：system("reboot")  ⚠️ 漏洞
```

#### 示例 2：状态绕过

```
入口点：UART 命令
  ↓
认证 / 权限校验：✅ 需要密码
  ↓
状态判断：⚠️ 可被其他接口修改
  ↓
危险副作用：unlock_admin()  ⚠️ 漏洞
```

#### 示例 3：权限检查未使用

```
入口点：Web 界面
  ↓
认证 / 权限校验：✅ check_admin()
  ↓
状态判断：⚠️ 返回值未使用
  ↓
危险副作用：execute_admin_command()  ⚠️ 漏洞
```

---

## 七、自动化攻击路径建模（统一）

### 攻击者能力模型（固定三类）

#### 1️⃣ 远程未认证攻击者

**能力**：
- 可以访问设备网络接口
- 可以发送网络请求
- 无法物理接触设备

**攻击路径**：
```
远程网络接口
  → 入口点（HTTP / MQTT）
  → 认证绕过 / 默认凭证
  → 危险操作
```

#### 2️⃣ 局域网攻击者

**能力**：
- 可以连接设备局域网
- 可以进行中间人攻击
- 无法物理接触设备

**攻击路径**：
```
局域网接口
  → 入口点（Wi-Fi / 蓝牙 / Zigbee）
  → 协议漏洞 / 重放
  → 危险操作
```

#### 3️⃣ 物理接触攻击者

**能力**：
- 可以物理接触设备
- 可以访问调试接口
- 可以修改固件

**攻击路径**：
```
物理接口
  → 入口点（UART / USB / JTAG）
  → 默认 root / 调试命令
  → 危险操作
```

### 构造方式

```python
# 构造攻击路径
def construct_attack_path(asset_type, attacker_type):
    # 选择入口点
    entry_points = get_entry_points(attacker_type)

    for entry in entry_points:
        # 检查认证
        if not has_authentication(entry):
            # 发现漏洞：无认证入口
            report_vulnerability("无认证访问", entry)
            continue

        # 尝试绕过认证
        bypass = try_authentication_bypass(entry)
        if bypass:
            # 发现漏洞：认证绕过
            report_vulnerability("认证绕过", entry, bypass)

        # 检查权限
        if not check_permission(entry):
            # 发现漏洞：权限绕过
            report_vulnerability("权限绕过", entry)

        # 检查状态
        state_issues = check_state_manipulation(entry)
        if state_issues:
            # 发现漏洞：状态绕过
            report_vulnerability("状态绕过", entry, state_issues)

        # 评估危险副作用
        dangerous_ops = get_dangerous_operations(entry)
        if dangerous_ops:
            # 发现漏洞：危险操作
            report_vulnerability("危险操作", entry, dangerous_ops)
```

---

## 八、统一漏洞输出格式

### 报告模板

```markdown
## IoT 设备安全审计报告

### 设备信息
- 设备型号：[型号]
- 固件版本：[版本]
- 资产类型：[仅固件 / 仅源码 / 混合]

### 执行摘要
- 发现漏洞：X 个高危，Y 个中危，Z 个低危
- 主要风险：[越权 / 后门 / 升级链 / 默认凭证]

### 详细发现

#### 1. [高危] 无认证远程访问 - HTTP API

**入口点**：
- 类型：远程网络
- 接口：HTTP POST /api/reboot
- 认证要求：❌ 无

**执行路径**：
```
远程攻击者
  → POST http://device-ip/api/reboot
  → 直接执行 reboot 命令
  → 设备重启
```

**漏洞类型**：越权
**影响**：拒绝服务
**修复建议**：添加认证中间件

---

#### 2. [中危] 默认 Telnet 凭证

**入口点**：
- 类型：局域网 / 物理
- 接口：Telnet (port 23)
- 凭证：root:default123

**执行路径**：
```
局域网攻击者
  → telnet 192.168.1.1
  → 用户名：root
  → 密码：default123（默认）
  → 获得 root shell
```

**漏洞类型**：默认凭证
**影响**：完全控制设备
**修复建议**：强制首次登录修改密码

---

#### 3. [高危] 升级验签绕过

**入口点**：
- 类型：远程网络
- 接口：升级 API
- 认证要求：✅ 需要 token

**执行路径**：
```
远程攻击者
  → POST /api/upgrade
  → 验签检查：可绕过（时间戳攻击）
  → 安装恶意固件
  → 完全控制设备
```

**漏洞类型**：升级链
**影响**：固件替换、后门植入
**修复建议**：修复验签逻辑，使用 HSM

---

### 攻击路径汇总

#### 远程未认证攻击
- [ ] 无认证远程访问
- [ ] 默认凭证暴露
- [ ] 升级验签绕过

#### 局域网攻击
- [ ] 弱认证协议
- [ ] 中间人攻击
- [ ] 固件提取

#### 物理接触
- [ ] UART 默认 root
- [ ] JTAG 调试接口
- [ ] 固件提取

### 修复优先级

#### 立即修复（高危）
1. 无认证远程访问
2. 升级验签绕过
3. 隐藏后门

#### 计划修复（中危）
1. 默认凭证
2. 弱加密算法
3. 信息泄露

#### 最佳实践（低危）
1. 日志记录
2. 安全配置
```

---

## 九、高危关注总结

### 远程攻击

**无认证访问**：
- HTTP API 无认证
- MQTT 无 ACL
- 默认开放端口

**默认凭证**：
- root:admin
- admin:12345678
- 空密码

**升级链**：
- 验签绕过
- 固件回滚
- 恶意固件

### 局域网攻击

**协议漏洞**：
- 弱加密
- 无完整性校验
- 重放攻击

**中间人**：
- ARP 欺骗
- DNS 欺骗
- SSL/TLS 绕过

### 物理接触

**调试接口**：
- UART 默认 root
- JTAG 未禁用
- SWD 调试接口

**固件提取**：
- Flash 读取
- JTAG 读取
- UART 读取

---

## 十、Skill 总结

本 Skill 用于 **IoT 设备安全审计**：

- ✅ **自动识别**资产形态（仅固件 / 仅源码 / 混合）
- ✅ **统一模型**：入口、权限、状态、持久化
- ✅ **系统化识别**：远程攻击、局域网攻击、物理攻击
- ✅ **可复现审计**：结构化流程、统一输出

**适用场景**：
- 路由器 / 交换机
- 摄像头 / 智能家居
- 工业控制设备
- 车载设备

---

## 审计检查清单（总结）

### 自动识别阶段
- [ ] 检测源代码文件
- [ ] 检测固件文件
- [ ] 确定资产类型

### 统一审计主线
- [ ] 入口主线：识别所有触发点
- [ ] 权限主线：分析权限模型
- [ ] 状态主线：分析状态机
- [ ] 持久化主线：分析存储

### Type A：仅固件
- [ ] 固件解包
- [ ] rootfs 枚举
- [ ] 启动脚本分析
- [ ] 网络服务识别
- [ ] 二进制逆向

### Type B：仅源代码
- [ ] 构建系统分析
- [ ] 入口函数枚举
- [ ] 权限校验点
- [ ] 状态机分析
- [ ] 升级链审计

### Type C：混合
- [ ] 源码定位关键功能
- [ ] 固件验证编译结果
- [ ] 对比源码 vs 二进制
- [ ] 识别隐藏逻辑

### 攻击路径建模
- [ ] 远程未认证攻击
- [ ] 局域网攻击
- [ ] 物理接触攻击

---

## 审计原则

> 自动识别 > 手动分类
> 源码为主，固件为证据（混合模式）
> 统一模型 > 类型特定
> 可复现流程 > 依赖专家经验
