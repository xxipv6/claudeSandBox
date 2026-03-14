# Ops-Engineer Agent Memory

## 项目知识引用

本项目使用**共享知识库**，所有 knowledge 文件夹的内容对 OPS-ENGINEER 强制可见：

### 共享知识库位置
- **失败模式库**：`/workspace/knowledge/patterns.md`
- **领域知识库**：`/workspace/knowledge/domains.md`
- **工具认知库**：`/workspace/knowledge/tools.md`
- **错误学习库**：`/workspace/knowledge/corrections.md`

### Ops-Engineer 使用指引

**操作前**：
- 快速浏览 patterns.md 的"资源类"模式
- 参考 tools.md 选择合适的工具

**操作中**：
- 重点关注：依赖冲突、权限问题、资源限制
- 对照 corrections.md 避免重复错误

**操作后**：
- 验证操作结果
- 将新发现的问题模式记录到 corrections.md

---

## 常见操作模式

### 包管理

#### apt (Debian/Ubuntu)
```bash
# 更新包索引
apt update

# 安装工具
apt install -y tool1 tool2 tool3

# 验证安装
tool1 --version

# 清理缓存
apt clean
apt autoclean
```

#### pip (Python)
```bash
# 升级 pip
pip install --upgrade pip

# 安装包
pip install package_name

# 安装特定版本
pip install package_name==1.2.3

# 从 requirements.txt 安装
pip install -r requirements.txt

# 验证安装
python -c "import package_name; print(package_name.__version__)"
```

#### npm (Node)
```bash
# 初始化项目
npm init -y

# 安装包
npm install package_name

# 安装开发依赖
npm install -D package_name

# 全局安装
npm install -g package_name

# 验证安装
npm list package_name
```

#### go get (Go)
```bash
# 设置 GOPATH
export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin

# 安装包
go get package_name

# 验证安装
go version
```

### Docker 操作

```bash
# 拉取镜像
docker pull image:tag

# 运行容器
docker run -d --name container_name image:tag

# 查看容器
docker ps -a

# 停止容器
docker stop container_name

# 删除容器
docker rm container_name

# 查看日志
docker logs container_name

# 进入容器
docker exec -it container_name /bin/bash

# 清理未使用的资源
docker system prune -a
```

### 系统诊断

```bash
# 检查磁盘空间
df -h

# 检查内存使用
free -h

# 检查 CPU 使用
top -bn1 | head -20

# 检查进程
ps aux

# 检查端口占用
netstat -tlnp
# 或
ss -tlnp

# 查找占用端口的进程
lsof -i :port_number

# 杀死进程
kill -9 PID
```

---

## 环境配置模式

### Python 虚拟环境

```bash
# 创建虚拟环境
python3 -m venv /path/to/venv

# 激活虚拟环境
source /path/to/venv/bin/activate

# 验证环境
which python
python --version

# 退出虚拟环境
deactivate
```

### Node 版本管理

```bash
# 安装 nvm（如果未安装）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# 安装特定 Node 版本
nvm install 18.0.0

# 使用特定版本
nvm use 18.0.0

# 设置默认版本
nvm alias default 18.0.0
```

### 内核参数调整

```bash
# 查看当前值
sysctl net.core.somaxconn

# 临时修改
sysctl -w net.core.somaxconn=1024

# 永久修改
echo "net.core.somaxconn=1024" >> /etc/sysctl.conf
sysctl -p
```

### 资源限制调整

```bash
# 查看当前限制
ulimit -a

# 临时修改
ulimit -n 65536

# 永久修改
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf
```

---

## 常见问题处理

### 依赖冲突

```bash
# Python 依赖冲突
pip list
pip check

# 解决方案：使用虚拟环境
python3 -m venv clean_env
source clean_env/bin/activate
pip install -r requirements.txt
```

### 权限问题

```bash
# 检查文件权限
ls -la file_path

# 修改权限
chmod 755 file_path

# 修改所有者
chown user:group file_path

# 使用 sudo
sudo command
```

### 端口占用

```bash
# 查找占用端口的进程
lsof -i :port_number

# 杀死进程
kill -9 PID
```

### 磁盘空间不足

```bash
# 清理 apt 缓存
apt clean
apt autoclean

# 清理旧日志
journalctl --vacuum-time=7d

# 查找大文件
du -sh * | sort -rh | head -10

# 清理 Docker
docker system prune -a
```

---

## 安全工具安装

### 逆向工程工具

```bash
# 安装基础工具
apt install -y binutils gdb patchelf

# 安装 Ghidra（如果可用）
apt install -y ghidra

# 或下载最新版本
wget https://github.com/NationalSecurityAgency/ghidra/releases/download/Ghidra_build/ghidra_VERSION.zip
unzip ghidra_VERSION.zip -d /opt/
```

### 漏洞扫描工具

```bash
# 安装 nmap
apt install -y nmap

# 安装 nikto
apt install -y nikto

# 安装 sqlmap
pip install sqlmap

# 安装 Burp Suite（如果可用）
apt install -y burpsuite
```

### Fuzzing 工具

```bash
# 安装 AFL++
apt install -y afl++

# 安装 libFuzzer
apt install -y libfuzzer-dev

# 或从源码编译
git clone https://github.com/google/AFL.git
cd AFL
make && make install
```

---

## 问题诊断模式

当遇到问题时：

### 诊断步骤

1. **检查系统状态**
   - 磁盘空间：`df -h`
   - 内存使用：`free -h`
   - CPU 使用：`top -bn1 | head -20`
   - 进程状态：`ps aux`

2. **检查服务状态**
   - 服务状态：`systemctl status service_name`
   - 服务日志：`journalctl -u service_name -f`

3. **检查网络连接**
   - 网络连通性：`ping -c 4 target_host`
   - 端口开放：`nc -zv target_host port`
   - DNS 解析：`nslookup domain_name`

4. **检查依赖**
   - Python：`pip list` 和 `pip check`
   - Node：`npm list`
   - Go：`go list -m all`

5. **定位问题**
   - 查看错误日志
   - 检查配置文件
   - 验证环境变量

### 修复模式

1. **修复根本原因**（不是症状）
2. **验证修复**（确保问题解决）
3. **检查类似问题**（举一反三）
4. **记录解决方案**（更新 knowledge）

---

## 持续改进

每次完成任务后，思考：
1. 这个问题的根本原因是什么？
2. 是否应该更新 corrections.md？
3. 是否有更好的诊断/修复方法？
4. 是否发现了新的环境问题模式？
