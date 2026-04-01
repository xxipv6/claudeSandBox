# Step-Level Research Logging

## 适用范围

以下研究活动必须进行 Step-Level Logging：

- 逆向工程（二进制、协议、状态机）
- 安全审计（代码审计、渗透测试）
- 攻击面探索
- 漏洞验证（PoC 编写、测试）

---

## 核心纪律

**每完成一步，必须立即记录**

> **不允许批量记录**
> **不允许事后补记**
> **记录比速度更重要**

---

## Step Record 模板

```markdown
# Step Record: step-N

## 当前状态（Context Recovery）

**研究目标**：[总体研究目标]
**当前阶段**：[当前处于哪个阶段]
**已完成**：
- [已完成的步骤 1]
- [已完成的步骤 2]
**进行中**：[正在进行的任务]
**下一步**：[下一步要做什么]
**关键发现**：
- [关键发现 1]
- [关键发现 2]
**PoC 文件**：[PoC 文件路径（如适用）]

---

## 基本信息
- **Step ID**: step-N
- **Decision ID**: [YYYY-MM-DD-XXX]（如适用）
- **时间**: [YYYY-MM-DD HH:MM:SS]
- **执行者**: [Research Lead / Specialist Agent Name]

## 研究目标
[本步骤要达成的目标]

## 执行内容

### 操作 1
[具体操作描述]
- 命令：[命令或工具]
- 输入：[参数或数据]
- 输出：[结果摘要]

### 操作 2
[具体操作描述]
...

## 关键发现

### 发现 1
- **类型**: [漏洞 / 行为 / 模式 / 异常 / 算法]
- **描述**: [详细描述]
- **证据**: [代码位置 / 截图 / 日志]
- **影响**: [如适用，描述影响]

### 发现 2
...

## 假设与验证

### 假设
[本步骤提出的假设]

### 验证方法
[如何验证]

### 验证结果
- 通过 / 失败 / 部分验证
- [详细结果]

## 遇到的问题

### 问题 1
- **描述**: [问题描述]
- **解决方案**: [如何解决]

## 下一步计划
- [下一步要做什么]

## 附件
- [证据文件路径]
- [截图路径]
- [日志路径]
```

---

## Step ID 命名规则

格式：`step-N`

- `N`：项目内的步骤序号（1, 2, 3...）

**示例**：
- `step-1`：第 1 步
- `step-2`：第 2 步
- `step-3`：第 3 步

**原则**：
- 简单、清晰、易排序
- 日期不重要，项目内递增即可
- 压缩后合并为 summary 文件时重新编号

---

## 保存位置

```
xxx-research/notes/steps/step-N.md
```

**示例**：
```
iot-firmware-research/notes/steps/step-1.md
iot-firmware-research/notes/steps/step-2.md
iot-firmware-research/notes/steps/step-3.md
...
```

**压缩后**：
```
iot-firmware-research/notes/steps/summary-1.md
```

---

## 文件压缩规则

**触发条件**：当 `notes/steps/` 目录下的 md 文件达到 5-10 个时

**压缩方式**：合并为 1 个 summary 文件

**压缩流程**：
```
step-1.md, step-2.md, ..., step-10.md
    ↓ 压缩
summary-1.md（包含"当前状态"区块）
```

**保留内容**：
- 当前状态（Context Recovery）
- 核心发现（漏洞/行为/模式）
- 关键证据（代码位置/截图/日志）
- 关键决策点
- PoC 文件路径

**删除内容**：
- 冗余的操作描述
- 重复的失败尝试
- 详细的中间过程

---

## 记录时机

### 必须立即记录

- 完成一个研究步骤
- 发现关键漏洞或行为
- 完成假设验证
- 调用 Specialist Agent 并收到结果

### 不需要记录

- 查看文件内容
- 搜索字符串
- 简单的命令操作（ls, cat, grep）
- 失败的尝试（除非提供了有用信息）

---

## 示例

### 示例 1：逆向工程步骤

```markdown
# Step Record: step-1

## 当前状态（Context Recovery）

**研究目标**：审计 IoT 固件网络服务安全性
**当前阶段**：固件解包和文件系统识别
**已完成**：
- binwalk 分析固件结构
- 提取文件系统
**进行中**：识别文件系统类型
**下一步**：挂载文件系统，分析启动脚本
**关键发现**：
- SquashFS 压缩文件系统
- UBI 存储格式
**PoC 文件**：N/A

---

## 基本信息
- **Step ID**: step-1
- **Decision ID**: 2026-03-25-001
- **时间**: 2026-03-25 14:35:00
- **执行者**: Research Lead

## 研究目标
解包固件并识别文件系统结构

## 执行内容

### 操作 1：binwalk 分析
```bash
binwalk -e firmware.bin
```

- **输入**：firmware.bin（原始固件）
- **输出**：提取到 _firmware.bin.extracted/

### 操作 2：识别文件系统
```bash
ls -la _firmware.bin.extracted/
```

- **输出**：
  - squashfs-root/（SquashFS 文件系统）
  - 0x400000（内核）
  - 0x800000（bootloader）

## 关键发现

### 发现 1：SquashFS 文件系统
- **类型**: 文件系统
- **描述**：使用 SquashFS 压缩文件系统
- **证据**: binwalk 输出显示 squashfs-root
- **影响**: 可以直接挂载查看文件

### 发现 2：UBI 格式
- **类型**: 存储格式
- **描述**：固件使用 UBI（Unsorted Block Images）格式
- **证据**: binwalk 识别到 UBI 容器
- **影响**: 需要使用 ubiextract 工具

## 假设与验证

### 假设
固件包含完整 Linux 根文件系统

### 验证方法
挂载 squashfs-root 查看目录结构

### 验证结果
- 通过
- **详细**: 包含 /bin, /etc, /lib, /usr 等标准目录

## 下一步计划
- 分析 /etc/init.d/ 启动脚本
- 查找网络服务二进制文件
- 调用 reverse-analyst 分析二进制

## 附件
- _firmware.bin.extracted/ 目录结构
```

---

### 示例 2：漏洞验证步骤

```markdown
# Step Record: step-5

## 当前状态（Context Recovery）

**研究目标**：审计 IoT 固件网络服务安全性
**当前阶段**：漏洞验证
**已完成**：
- 固件解包和文件系统识别
- 网络服务代码审计
- JWT 签名绕过发现
**进行中**：编写 PoC 验证漏洞
**下一步**：测试权限提升
**关键发现**：
- JWT 签名验证缺失（0x401234）
- 可伪造 token 绕过认证
**PoC 文件**：poc/jwt-forgery.py

---

## 基本信息
- **Step ID**: step-5
- **Decision ID**: 2026-03-25-002
- **时间**: 2026-03-25 16:50:00
- **执行者**: poc-engineer

## 研究目标
验证固件更新签名验证绕过漏洞

## 执行内容

### 操作 1：分析签名验证代码
使用 Ghidra 打开 `updater` 二进制文件

- **发现**：签名验证函数 `verify_signature()`
- **代码位置**: 0x401234

### 操作 2：编写测试 PoC
```python
import socket
import struct

# 构造恶意固件包
malicious_firmware = build_firmware(payload="evil_shell.bin")
# 伪造签名（全零）
malicious_firmware.signature = b"\x00" * 256

# 发送到固件更新端口
sock = socket.create_connection(("192.168.1.1", 8080))
sock.send(malicious_firmware.pack())
```

### 操作 3：执行 PoC
```bash
python3 exploit.py
```

## 关键发现

### 发现 1：签名验证漏洞
- **类型**: 漏洞
- **描述**: 签名验证只检查签名是否存在，不验证签名内容
- **证据**: 0x401234 处的代码：`if (signature == NULL) return ERROR;`
- **影响**: 可以伪造固件更新包，植入恶意代码

### 发现 2：漏洞利用成功
- **类型**: 验证结果
- **描述**: PoC 成功在目标设备上执行 shell 命令
- **证据**: 设备返回 shell 提示符
- **影响**: 远程代码执行（RCE）

## 假设与验证

### 假设
签名验证存在逻辑漏洞（只检查非空）

### 验证方法
发送全零签名的固件包

### 验证结果
- 通过
- **详细**: 设备接受了伪造的固件并执行了恶意代码

## 遇到的问题

### 问题 1：固件包格式未知
- **解决方案**: 抓取合法固件更新流量，分析格式

## 下一步计划
- 编写完整 exploit
- 生成漏洞报告
- 提供修复建议

## 附件
- exploit.py
- wireshark_capture.pcap
```

---

### 示例 3：压缩后的 summary 文件

```markdown
# Summary: step-1 to step-10

## 当前状态（Context Recovery）

**研究目标**：审计 IoT 固件网络服务安全性
**当前阶段**：漏洞利用完成
**已完成**：
- 固件解包和文件系统识别
- 网络服务代码审计
- JWT 签名绕过发现和验证
- 权限提升漏洞利用
**进行中**：编写完整 exploit
**下一步**：生成漏洞报告，提供修复建议
**关键发现**：
- **JWT 签名验证绕过**（0x401234）
  - 漏洞：签名验证只检查非空，不验证内容
  - 影响：可伪造 token 绕过认证
  - PoC：poc/jwt-forgery.py
- **权限提升漏洞**（0x402456）
  - 漏洞：未授权的权限修改接口
  - 影响：普通用户可提升为管理员
  - PoC：poc/privilege-escalation.py
**PoC 文件**：
- poc/jwt-forgery.py
- poc/privilege-escalation.py
- poc/rce-exploit.py

---

## 核心发现总结

### 漏洞 1：JWT 签名验证绕过
- **类型**: 认证绕过
- **位置**: 0x401234
- **描述**: 签名验证只检查非空，不验证内容
- **利用**: 伪造 JWT token 绕过认证
- **PoC**: poc/jwt-forgery.py
- **状态**: 已验证

### 漏洞 2：权限提升
- **类型**: 越权
- **位置**: 0x402456
- **描述**: 未授权的权限修改接口
- **利用**: 普通用户提升为管理员
- **PoC**: poc/privilege-escalation.py
- **状态**: 已验证

### 漏洞 3：远程代码执行
- **类型**: RCE
- **位置**: 固件更新机制
- **描述**: 签名验证绕过 + 恶意固件 = RCE
- **利用**: 完整攻击链
- **PoC**: poc/rce-exploit.py
- **状态**: 已验证

---

## 关键证据

### 代码位置
- JWT 验证：0x401234
- 权限修改：0x402456
- 固件更新：0x403678

### 截图
- screenshots/jwt-bypass.png
- screenshots/privilege-escalation.png
- screenshots/rce-shell.png

### 日志
- logs/exploit-execution.log

---

## 关键决策点

1. **Decision 001**：选择网络攻击面
2. **Decision 002**：转向固件更新机制
3. **Decision 003**：启用 Multi-Agent 并行分析

---

## 下一步

- [ ] 生成完整漏洞报告
- [ ] 提供修复建议
- [ ] 准备漏洞演示
```

---

## 记录质量标准

### 好的 Step Record

- 目标明确
- 操作详细（命令、参数、结果）
- 发现具体（类型、描述、证据）
- 假设清晰（假设、验证、结果）
- 下一步明确
- **包含"当前状态"区块**

### 差的 Step Record

- 目标模糊
- 操作描述不清（"分析了固件"）
- 发现笼统（"发现了一些问题"）
- 缺少证据（代码位置、截图、日志）
- 没有下一步
- **缺少"当前状态"区块**

---

## 审查清单

提交 Step Record 前检查：

- [ ] Step ID 格式正确（step-N）
- [ ] **包含"当前状态"区块**
- [ ] Decision ID 已关联（如适用）
- [ ] 时间戳准确
- [ ] 执行者已标注
- [ ] 操作详细（命令/参数/结果）
- [ ] 发现具体（类型/描述/证据）
- [ ] 假设验证完整
- [ ] 下一步明确
- [ ] 保存到正确位置（`xxx-research/notes/steps/`）

---

## 记忆要点

**核心纪律**：每完成一步，必须立即记录

**记住**：
- 记录比速度更重要
- 完整的轨迹比精简的报告更有价值
- 未来的你会感谢现在的你详细记录
- **"当前状态"区块是上下文恢复的关键**
