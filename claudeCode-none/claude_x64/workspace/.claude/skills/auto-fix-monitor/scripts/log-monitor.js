#!/usr/bin/env node

/**
 * 自动修复监控 - 日志监控脚本
 *
 * 用途：开发环境实时日志监控，检测错误并触发自动修复
 *
 * 使用方法：
 *   node log-monitor.js --type [frontend|backend|all]
 *
 * 示例：
 *   node log-monitor.js --type all
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// 配置
const CONFIG = {
  logDir: path.join(process.cwd(), 'logs'),
  errorLogFile: 'auto-fix-errors.log',
  frontendLogFile: 'auto-fix-frontend.log',
  backendLogFile: 'auto-fix-backend.log',
  reportInterval: 10 * 60 * 1000, // 10 分钟
};

// 错误模式
const ERROR_PATTERNS = {
  frontend: [
    /Uncaught\s+Error:/i,
    /Uncaught\s+Exception:/i,
    /ReferenceError:/i,
    /TypeError:/i,
    /SyntaxError:/i,
    /Failed\s+to\s+fetch/i,
    /Network\s+Error/i,
    /404|500|503/,
  ],
  backend: [
    /Error:/i,
    /Exception:/i,
    /Fatal:/i,
    /ECONNREFUSED/i,
    /ETIMEDOUT/i,
    /Cannot\s+read\s+property/i,
    /undefined\s+is\s+not\s+a\s+function/i,
    /EADDRINUSE/i,
    /Cannot\s+find\s+module/i,
  ],
};

// 日志级别
const LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
};

/**
 * 日志监控器类
 */
class LogMonitor {
  constructor(options = {}) {
    this.type = options.type || 'all';
    this.logDir = options.logDir || CONFIG.logDir;
    this.errorCount = 0;
    this.fixCount = 0;
    this.fixFailCount = 0;
    this.startTime = Date.now();
    this.isRunning = false;

    this.ensureLogDir();
  }

  /**
   * 确保日志目录存在
   */
  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * 写入日志
   */
  writeLog(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      source: this.type,
      message,
      ...data,
    };

    const logFile = path.join(this.logDir, CONFIG.errorLogFile);
    const logLine = JSON.stringify(logEntry) + '\n';

    fs.appendFileSync(logFile, logLine, 'utf8');
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  }

  /**
   * 检测错误
   */
  detectError(line) {
    const patterns = [...ERROR_PATTERNS.frontend, ...ERROR_PATTERNS.backend];

    for (const pattern of patterns) {
      if (pattern.test(line)) {
        return this.classifyError(line, pattern);
      }
    }

    return null;
  }

  /**
   * 分类错误
   */
  classifyError(line, pattern) {
    const errorType = this.getErrorType(pattern);
    const severity = this.getSeverity(errorType);
    const fixAgent = this.getFixAgent(errorType);

    return {
      type: errorType,
      severity,
      fixAgent,
      message: line,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 获取错误类型
   */
  getErrorType(pattern) {
    if (/(TypeError|ReferenceError|SyntaxError)/.test(pattern.source)) {
      return 'RuntimeError';
    }
    if (/EADDRINUSE/.test(pattern.source)) {
      return 'PortInUse';
    }
    if (/Cannot find module/.test(pattern.source)) {
      return 'MissingDependency';
    }
    if (/ETIMEDOUT|ECONNREFUSED/.test(pattern.source)) {
      return 'ConnectionError';
    }
    if (/404|500|503/.test(pattern.source)) {
      return 'HTTPError';
    }
    return 'Unknown';
  }

  /**
   * 获取严重程度
   */
  getSeverity(errorType) {
    const severityMap = {
      RuntimeError: 'medium',
      PortInUse: 'low',
      MissingDependency: 'low',
      ConnectionError: 'medium',
      HTTPError: 'medium',
      SecurityError: 'high',
      Unknown: 'medium',
    };

    return severityMap[errorType] || 'medium';
  }

  /**
   * 获取修复 Agent
   */
  getFixAgent(errorType) {
    const agentMap = {
      RuntimeError: 'debugging',
      PortInUse: 'dev',
      MissingDependency: 'dev',
      ConnectionError: 'debugging',
      HTTPError: 'dev',
      SecurityError: 'research',
      Unknown: 'debugging',
    };

    return agentMap[errorType] || 'debugging';
  }

  /**
   * 触发修复
   */
  async triggerFix(error) {
    this.writeLog(LogLevel.INFO, `触发修复：${error.fixAgent} skill`, error);

    try {
      // 这里应该调用对应的 agent/skill
      // 例如：使用 debugging skill 修复运行时错误
      const fixResult = await this.callFixAgent(error);

      if (fixResult.success) {
        this.fixCount++;
        this.writeLog(LogLevel.INFO, `修复成功：${error.type}`, fixResult);
      } else {
        this.fixFailCount++;
        this.writeLog(LogLevel.ERROR, `修复失败：${error.type}`, fixResult);
      }
    } catch (err) {
      this.fixFailCount++;
      this.writeLog(LogLevel.ERROR, `修复异常：${err.message}`, { error: err.message });
    }
  }

  /**
   * 调用修复 Agent
   * (模拟实现，实际需要集成到 Claude Code)
   */
  async callFixAgent(error) {
    // 这里是模拟实现
    // 实际应该通过某种方式触发 Claude Code 的 agent

    this.writeLog(LogLevel.WARN, `[模拟] 调用 ${error.fixAgent} agent 修复错误`, error);

    // 模拟修复结果
    return {
      success: Math.random() > 0.3, // 70% 成功率
      action: 'Auto-fix attempted',
      details: `Fixed ${error.type} automatically`,
    };
  }

  /**
   * 生成监控报告
   */
  generateReport() {
    const duration = Date.now() - this.startTime;
    const durationMinutes = Math.floor(duration / 60000);

    const report = {
      duration: `${durationMinutes}m`,
      errorCount: this.errorCount,
      fixCount: this.fixCount,
      fixFailCount: this.fixFailCount,
      successRate: this.errorCount > 0 ? Math.round((this.fixCount / this.errorCount) * 100) : 0,
    };

    this.writeLog(LogLevel.INFO, '=== 监控报告 ===', report);

    return report;
  }

  /**
   * 启动监控
   */
  async start() {
    if (this.isRunning) {
      this.writeLog(LogLevel.WARN, '监控已在运行');
      return;
    }

    this.isRunning = true;
    this.writeLog(LogLevel.INFO, '🚀 自动修复监控已启动', {
      type: this.type,
      logDir: this.logDir,
    });

    // 启动定期报告
    this.reportTimer = setInterval(() => {
      this.generateReport();
    }, CONFIG.reportInterval);

    // 模拟监控（实际应该读取日志文件）
    this.simulateMonitoring();
  }

  /**
   * 模拟监控（仅用于演示）
   */
  simulateMonitoring() {
    // 实际实现应该：
    // 1. 使用 tail -f 监控日志文件
    // 2. 或使用 fs.watch 监控文件变化
    // 3. 解析新日志行
    // 4. 检测错误并触发修复

    this.writeLog(LogLevel.INFO, '监控运行中... (按 Ctrl+C 停止)');

    // 这里只是演示，实际需要实现真正的日志文件监控
    setTimeout(() => {
      // 模拟检测到错误
      const mockError = {
        type: 'RuntimeError',
        severity: 'medium',
        fixAgent: 'debugging',
        message: 'TypeError: Cannot read property \'foo\' of undefined',
        timestamp: new Date().toISOString(),
      };

      this.errorCount++;
      this.triggerFix(mockError);
    }, 5000);
  }

  /**
   * 停止监控
   */
  stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.reportTimer) {
      clearInterval(this.reportTimer);
    }

    const finalReport = this.generateReport();
    this.writeLog(LogLevel.INFO, '🛑 监控已停止', finalReport);

    console.log('\n=== 监控总结 ===');
    console.log(`监控时长：${finalReport.duration}`);
    console.log(`检测错误：${finalReport.errorCount}`);
    console.log(`自动修复：${finalReport.fixCount}`);
    console.log(`修复失败：${finalReport.fixFailCount}`);
    console.log(`\n日志位置：${path.join(this.logDir, CONFIG.errorLogFile)}`);
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const type = args.includes('--type') ? args[args.indexOf('--type') + 1] : 'all';

  const monitor = new LogMonitor({ type });

  // 启动监控
  await monitor.start();

  // 处理退出信号
  process.on('SIGINT', () => {
    monitor.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    monitor.stop();
    process.exit(0);
  });
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = LogMonitor;
