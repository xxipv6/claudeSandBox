/**
 * 前端自动修复监控
 *
 * 用途：在开发环境中监控浏览器控制台错误，自动触发修复
 *
 * 使用方法：
 *   1. 在应用入口引入此脚本
 *   2. 监控全局错误和未处理的 Promise 拒绝
 *   3. 错误信息上报到监控端点
 *
 * 示例：
 *   import { initFrontendMonitor } from './frontend-monitor.js';
 *   initFrontendMonitor({ reportUrl: '/api/log-error' });
 */

(function(window) {
  'use strict';

  /**
   * 前端监控器类
   */
  class FrontendMonitor {
    constructor(options = {}) {
      this.options = {
        reportUrl: options.reportUrl || '/api/log-error',
        enabled: options.enabled !== false, // 默认启用
        debounceTime: options.debounceTime || 1000,
        maxErrors: options.maxErrors || 100,
        ...options,
      };

      this.errorBuffer = [];
      this.errorCount = 0;
      this.isInitialized = false;
    }

    /**
     * 初始化监控
     */
    init() {
      if (this.isInitialized) {
        console.warn('[AutoFix Monitor] 已经初始化');
        return;
      }

      // 仅在开发环境启用
      if (this.options.enabled && this.isDevEnvironment()) {
        this.setupGlobalErrorHandlers();
        this.setupUnhandledRejectionHandler();
        this.setupNetworkErrorInterceptor();
        this.isInitialized = true;
        console.log('[AutoFix Monitor] ✅ 前端监控已启动');
      } else {
        console.log('[AutoFix Monitor] ⚠️ 非开发环境，监控未启用');
      }
    }

    /**
     * 检查是否为开发环境
     */
    isDevEnvironment() {
      return (
        process.env.NODE_ENV === 'development' ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
      );
    }

    /**
     * 设置全局错误处理器
     */
    setupGlobalErrorHandlers() {
      window.addEventListener('error', (event) => {
        this.handleError({
          type: 'Error',
          message: event.message,
          filename: event.filename,
          line: event.lineno,
          column: event.colno,
          stack: event.error ? event.error.stack : '',
          timestamp: new Date().toISOString(),
        });
      });
    }

    /**
     * 设置未处理的 Promise 拒绝处理器
     */
    setupUnhandledRejectionHandler() {
      window.addEventListener('unhandledrejection', (event) => {
        this.handleError({
          type: 'UnhandledRejection',
          message: event.reason ? event.reason.message : 'Unknown promise rejection',
          stack: event.reason ? event.reason.stack : '',
          timestamp: new Date().toISOString(),
        });
      });
    }

    /**
     * 设置网络错误拦截器
     */
    setupNetworkErrorInterceptor() {
      // 拦截 fetch 请求
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        try {
          const response = await originalFetch(...args);

          if (!response.ok) {
            this.handleError({
              type: 'NetworkError',
              message: `HTTP ${response.status}: ${response.statusText}`,
              url: args[0],
              timestamp: new Date().toISOString(),
            });
          }

          return response;
        } catch (error) {
          this.handleError({
            type: 'NetworkError',
            message: error.message,
            url: args[0],
            timestamp: new Date().toISOString(),
          });
          throw error;
        }
      };

      // 拦截 XMLHttpRequest
      const originalOpen = XMLHttpRequest.prototype.open;
      const originalSend = XMLHttpRequest.prototype.send;

      XMLHttpRequest.prototype.open = function(...args) {
        this._url = args[1];
        return originalOpen.apply(this, args);
      };

      XMLHttpRequest.prototype.send = function(...args) {
        this.addEventListener('error', () => {
          window.frontendMonitor.handleError({
            type: 'NetworkError',
            message: 'XMLHttpRequest failed',
            url: this._url,
            timestamp: new Date().toISOString(),
          });
        });

        return originalSend.apply(this, args);
      };
    }

    /**
     * 处理错误
     */
    handleError(error) {
      this.errorCount++;

      // 防抖：避免短时间内重复上报相同错误
      if (this.isDuplicateError(error)) {
        return;
      }

      // 分类错误
      const classifiedError = this.classifyError(error);

      // 添加到缓冲区
      this.errorBuffer.push(classifiedError);

      // 上报错误
      this.reportError(classifiedError);

      // 控制台输出
      console.error('[AutoFix Monitor] 检测到错误：', classifiedError);

      // 触发自动修复
      this.triggerAutoFix(classifiedError);
    }

    /**
     * 分类错误
     */
    classifyError(error) {
      const errorInfo = {
        ...error,
        severity: this.getSeverity(error),
        category: this.getCategory(error),
        fixable: this.isFixable(error),
      };

      return errorInfo;
    }

    /**
     * 获取错误严重程度
     */
    getSeverity(error) {
      if (/TypeError|ReferenceError|SyntaxError/.test(error.message)) {
        return 'high';
      }
      if (/NetworkError|404|500/.test(error.message)) {
        return 'medium';
      }
      return 'low';
    }

    /**
     * 获取错误分类
     */
    getCategory(error) {
      if (/TypeError|ReferenceError/.test(error.message)) {
        return 'RuntimeError';
      }
      if (/SyntaxError/.test(error.message)) {
        return 'SyntaxError';
      }
      if (/NetworkError|fetch|XMLHttpRequest/.test(error.message)) {
        return 'NetworkError';
      }
      if (/UnhandledRejection/.test(error.type)) {
        return 'PromiseError';
      }
      return 'Unknown';
    }

    /**
     * 判断是否可自动修复
     */
    isFixable(error) {
      const fixablePatterns = [
        /Cannot read property/,
        /undefined is not a function/,
        /null is not an object/,
        /Failed to fetch/,
      ];

      return fixablePatterns.some(pattern => pattern.test(error.message));
    }

    /**
     * 检查是否为重复错误
     */
    isDuplicateError(error) {
      return this.errorBuffer.some(
        bufferedError =>
          bufferedError.message === error.message &&
          bufferedError.filename === error.filename &&
          Date.now() - new Date(bufferedError.timestamp).getTime() < this.options.debounceTime
      );
    }

    /**
     * 上报错误
     */
    async reportError(error) {
      try {
        await fetch(this.options.reportUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            source: 'frontend',
            ...error,
          }),
        });
      } catch (err) {
        console.error('[AutoFix Monitor] 上报失败：', err);
      }
    }

    /**
     * 触发自动修复
     */
    triggerAutoFix(error) {
      if (!error.fixable) {
        return;
      }

      console.log('[AutoFix Monitor] 🔄 触发自动修复：', error.category);

      // 这里可以通过 API 调用触发后端的自动修复流程
      // 例如：POST /api/auto-fix/trigger

      fetch('/api/auto-fix/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: error,
          action: 'auto-fix',
        }),
      }).catch(err => {
        console.error('[AutoFix Monitor] 触发修复失败：', err);
      });
    }

    /**
     * 获取错误统计
     */
    getStats() {
      return {
        totalErrors: this.errorCount,
        bufferedErrors: this.errorBuffer.length,
        errorsByCategory: this.getErrorCountByCategory(),
      };
    }

    /**
     * 按分类统计错误
     */
    getErrorCountByCategory() {
      const counts = {};
      this.errorBuffer.forEach(error => {
        counts[error.category] = (counts[error.category] || 0) + 1;
      });
      return counts;
    }

    /**
     * 清空错误缓冲区
     */
    clearBuffer() {
      this.errorBuffer = [];
      console.log('[AutoFix Monitor] 错误缓冲区已清空');
    }
  }

  // 创建全局实例
  window.frontendMonitor = new FrontendMonitor();

  // 自动初始化（延迟执行，确保在所有脚本加载后）
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.frontendMonitor.init();
    });
  } else {
    // DOM 已经加载完成
    setTimeout(() => {
      window.frontendMonitor.init();
    }, 0);
  }

  // 导出到全局
  window.FrontendMonitor = FrontendMonitor;

})(typeof window !== 'undefined' ? window : global);

/**
 * 使用示例：
 *
 * // 方式 1：直接使用全局实例
 * window.frontendMonitor.getStats();
 *
 * // 方式 2：创建自定义实例
 * const customMonitor = new FrontendMonitor({
 *   reportUrl: '/api/custom-log',
 *   debounceTime: 2000,
 * });
 * customMonitor.init();
 */
