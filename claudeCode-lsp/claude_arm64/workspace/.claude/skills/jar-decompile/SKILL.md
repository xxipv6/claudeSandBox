---
name: jar-decompile
description: Java/JAR 反编译工具使用说明。当需要使用内置 decompiler 处理 JAR、class、classes.jar 时，应主动（PROACTIVELY）使用此 skill。
disable-model-invocation: false
---

# Java/JAR 反编译工具使用说明

## 何时启用

- 用户要反编译 `.jar`
- 用户要处理 `classes.jar`
- 用户要把 `.class` / Java 归档还原成可读源码
- 用户要知道这个内置反编译工具怎么运行

---

## Skill 内置文件

此 skill 自带文件放在：

```bash
scripts/
```

其中主要文件：

```bash
scripts/java-decompiler.jar
scripts/dst/
```

---

## 标准命令

```bash
java -cp scripts/java-decompiler.jar \
  org.jetbrains.java.decompiler.main.decompiler.ConsoleDecompiler \
  -dgs=true <target.jar> <output_dir>
```

示例：

```bash
java -cp scripts/java-decompiler.jar \
  org.jetbrains.java.decompiler.main.decompiler.ConsoleDecompiler \
  -dgs=true classes.jar ./dst
```

---

## 参数说明

- `scripts/java-decompiler.jar`：内置反编译工具
- `org.jetbrains.java.decompiler.main.decompiler.ConsoleDecompiler`：反编译入口类
- `-dgs=true`：生成反编译结果
- `<target.jar>`：你要处理的 jar 文件
- `<output_dir>`：输出目录

---

## 推荐使用步骤

### 1. 准备目标文件

把目标 JAR 放到当前工作目录，或者使用相对路径。

### 2. 创建输出目录

```bash
mkdir -p dst
```

### 3. 执行反编译

```bash
java -cp scripts/java-decompiler.jar \
  org.jetbrains.java.decompiler.main.decompiler.ConsoleDecompiler \
  -dgs=true target.jar dst
```

### 4. 查看结果

反编译结束后，到输出目录查看生成文件。

```bash
tree dst
```

如有需要，再进入输出目录继续解压或查看内容。

---

## 常见用法示例

### 反编译 classes.jar

```bash
mkdir -p dst
java -cp scripts/java-decompiler.jar \
  org.jetbrains.java.decompiler.main.decompiler.ConsoleDecompiler \
  -dgs=true classes.jar dst
```

### 反编译指定路径的 jar

```bash
mkdir -p out
java -cp scripts/java-decompiler.jar \
  org.jetbrains.java.decompiler.main.decompiler.ConsoleDecompiler \
  -dgs=true ./input/app.jar out
```

---

## 输出说明

- 反编译结果会写入你指定的输出目录
- 默认建议使用 `dst/`、`out/`、`decompiled/` 这类目录名
- 如果目标很大，先确认输出目录空间足够

---

## 使用原则

- 只改目标文件和输出目录，不改主命令结构
- 先创建输出目录再执行
- 优先使用 skill 内置的 `scripts/java-decompiler.jar`
- 如果结果不在当前目录，先检查输出目录路径是否写对
