# ARM64 平台 - Claude Code 开发环境
FROM ubuntu:22.04

# ============================================
# 基础配置
# ============================================
ENV DEBIAN_FRONTEND=noninteractive \
    TZ=Asia/Shanghai

# ============================================
# 系统依赖安装
# ============================================
# 配置清华源 (ARM64 使用 ubuntu-ports)
RUN sed -i 's@//.*archive.ubuntu.com@//mirrors.tuna.tsinghua.edu.cn@g' /etc/apt/sources.list && \
    sed -i 's@//.*ports.ubuntu.com@//mirrors.tuna.tsinghua.edu.cn/ubuntu-ports@g' /etc/apt/sources.list && \
    sed -i 's@//.*security.ubuntu.com@//mirrors.tuna.tsinghua.edu.cn@g' /etc/apt/sources.list

# 安装基础工具和 VS Code 依赖
RUN apt-get update && apt-get install -y \
    curl wget git vim ca-certificates gnupg lsb-release \
    build-essential unzip ninja-build libreadline-dev \
    python3 python3-pip python3-venv \
    clangd openjdk-17-jre-headless dotnet-sdk-8.0 \
    libx11-xcb1 libxcomposite1 libxdamage1 libxfixes3 \
    libxrandr2 libgbm1 libasound2 \
    tmux \
    jq \
    tree \
    net-tools \
    iputils-ping \
    locales \
    fonts-wqy-microhei \
    fonts-wqy-zenhei \
    fonts-noto-cjk \
    && rm -rf /var/lib/apt/lists/* 

# 生成中文 locale
RUN sed -i 's/# zh_CN.UTF-8 UTF-8/zh_CN.UTF-8 UTF-8/' /etc/locale.gen && \
    locale-gen

# pip 国内源 (系统级)
RUN mkdir -p /etc/xdg/pip && \
    echo "[global]" > /etc/xdg/pip/pip.conf && \
    echo "index-url = https://pypi.tuna.tsinghua.edu.cn/simple" >> /etc/xdg/pip/pip.conf

# ============================================
# 编程语言安装
# ============================================

# Go - 使用多个镜像源尝试
ARG GO_VERSION=1.25.4
RUN wget -4 https://mirrors.aliyun.com/golang/go${GO_VERSION}.linux-arm64.tar.gz && \
    tar -C /usr/local -xzf go${GO_VERSION}.linux-arm64.tar.gz && \
    rm go${GO_VERSION}.linux-arm64.tar.gz

# Node.js
ARG NODE_VERSION=24.1.0
RUN wget https://mirrors.aliyun.com/nodejs-release/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-arm64.tar.gz && \
    tar -xzf node-v${NODE_VERSION}-linux-arm64.tar.gz -C /usr/local --strip-components=1 && \
    rm node-v${NODE_VERSION}-linux-arm64.tar.gz

# ============================================
# 工作目录和环境变量
# ============================================
WORKDIR /workspace

ENV LANG=zh_CN.UTF-8 \
    LC_ALL=zh_CN.UTF-8 \
    PATH=/root/ENV/ArvinENV:/usr/local/go/bin:/usr/local/bin:/root/.local/bin:$PATH \
    GOPATH=/root/ENV/go \
    GOPROXY=https://goproxy.cn,direct \
    GOSUMDB=off \
    GO111MODULE=on \
    CLAUDE_CONFIG_DIR=/root/.claude \
    ARVINENV_PATH=/root/ENV/ArvinENV \
    ENABLE_LSP_TOOLS=1 \
    IS_SANDBOX=1

# 创建 GOPATH 目录和 ArvinENV 目录
RUN mkdir -p /root/ENV/go && \
    mkdir -p /root/ENV/ArvinENV

# 复制 ArvinENV 工具脚本
COPY ArvinENV/key /root/ENV/ArvinENV/key
COPY ArvinENV/rms /root/ENV/ArvinENV/rms
COPY ArvinENV/config /root/ENV/ArvinENV/config
RUN chmod +x /root/ENV/ArvinENV/key && \
    chmod +x /root/ENV/ArvinENV/rms && \
    chmod +x /root/ENV/ArvinENV/config

# tmux 配置 - 启用鼠标滚动和复制
RUN printf 'set -g mouse on\nsetw -g mode-keys emacs\n' > /root/.tmux.conf
# ============================================
# Node.js 和 Go 配置
# ============================================
RUN npm config set registry https://registry.npmmirror.com
RUN npm config set prefix /usr/local
# ============================================
# Git 配置
# ============================================
ARG PROXY_HOST=host.docker.internal
ARG PROXY_PORT=1087
RUN git config --global http.proxy http://${PROXY_HOST}:${PROXY_PORT} && \
    git config --global https.proxy http://${PROXY_HOST}:${PROXY_PORT}

# ============================================
# 安装 Claude Code CLI
# ============================================
# 下载安装脚本并执行（使用国内镜像地址）
RUN curl -fSL https://claude.mcprotocol.cn/install.sh -o /tmp/install.sh
RUN HTTP_PROXY=http://${PROXY_HOST}:${PROXY_PORT} \
    HTTPS_PROXY=http://${PROXY_HOST}:${PROXY_PORT} \
    http_proxy=http://${PROXY_HOST}:${PROXY_PORT} \
    https_proxy=http://${PROXY_HOST}:${PROXY_PORT} \
    bash /tmp/install.sh && \
    rm /tmp/install.sh

# ============================================
# 复制配置文件
# ============================================
COPY ./.claude /root/.claude

CMD ["/bin/bash"]
