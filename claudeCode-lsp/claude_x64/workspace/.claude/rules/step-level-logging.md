# Step-Level Research Logging

## 适用范围

以下研究活动必须进行 Step-Level Logging：

- ✅ 逆向工程（二进制、协议、状态机）
- ✅ 安全审计（代码审计、渗透测试）
- ✅ 攻击面探索
- ✅ 漏洞验证（PoC 编写、测试）

---

## 核心纪律

**每完成一步，必须立即记录**

> **不允许批量记录**
> **不允许事后补记**
> **记录比速度更重要**

---

## Step Record 模板

```markdown
# Step Record: [YYYY-MM-DD-XXX]

## 基本信息
- **Step ID**: [YYYY-MM-DD-XXX-YY]
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
- ✅ 通过 / ❌ 失败 / ⚠️ 部分验证
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

格式：`YYYY-MM-DD-XXX-YY`

- `YYYY-MM-DD-XXX`：关联的 Decision ID
- `YY`：该 Decision 下的步骤序号（01, 02, 03...）

**示例**：
- `2026-03-25-001-01`：Decision 001 的第 1 步
- `2026-03-25-001-02`：Decision 001 的第 2 步

如果没有关联的 Decision ID，使用：
- `2026-03-25-OP-01`：操作性步骤（Operational）
- `2026-03-25-XX-01`：独立步骤

---

## 保存位置

```
xxx-research/notes/steps/YYYY-MM-DD-step-description.md
```

**示例**：
```
iot-firmware-research/notes/steps/2026-03-25-firmware-unpacking.md
```

---

## 记录时机

### ✅ 必须立即记录

- 完成一个研究步骤
- 发现关键漏洞或行为
- 完成假设验证
- 调用 Specialist Agent 并收到结果

### ❌ 不需要记录

- 查看文件内容
- 搜索字符串
- 简单的命令操作（ls, cat, grep）
- 失败的尝试（除非提供了有用信息）

---

## 示例

### 示例 1：逆向工程步骤

```markdown
# Step Record: 2026-03-25-001-01

## 基本信息
- **Step ID**: 2026-03-25-001-01
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
- ✅ 通过
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
# Step Record: 2026-03-25-002-03

## 基本信息
- **Step ID**: 2026-03-25-002-03
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
- ✅ 通过
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

## 记录质量标准

### 好的 Step Record

- ✅ 目标明确
- ✅ 操作详细（命令、参数、结果）
- ✅ 发现具体（类型、描述、证据）
- ✅ 假设清晰（假设、验证、结果）
- ✅ 下一步明确

### 差的 Step Record

- ❌ 目标模糊
- ❌ 操作描述不清（"分析了固件"）
- ❌ 发现笼统（"发现了一些问题"）
- ❌ 缺少证据（代码位置、截图、日志）
- ❌ 没有下一步

---

## 审查清单

提交 Step Record 前检查：

- [ ] Step ID 格式正确
- [ ] Decision ID 已关联（如适用）
- [ ] 时间戳准确
- [ ] 执行者已标注
- [ ] 操作详细（命令/参数/结果）
- [ ] 发现具体（类型/描述/证据）
- [ ] 假设验证完整
- [ ] 下一步明确
- [ ] 保存到正确位置（`xxx-research/notes/steps/`）

---

## 自动化工具建议

### 使用 research-recorder Agent

```
每完成一步 → 调用 research-recorder → 自动生成 Step Record
```

**优点**：
- 确保格式统一
- 不会遗漏
- 质量保证

**缺点**：
- 需要等待 Agent 生成
- 可能需要修正

### 手动记录

```
每完成一步 → 手动编辑 Markdown 文件
```

**优点**：
- 快速直接
- 灵活性高

**缺点**：
- 容易遗漏
- 格式可能不统一

---

## 记忆要点

**核心纪律**：每完成一步，必须立即记录

**记住**：
- 记录比速度更重要
- 完整的轨迹比精简的报告更有价值
- 未来的你会感谢现在的你详细记录
