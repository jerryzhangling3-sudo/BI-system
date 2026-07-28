/**
 * lang-switch.js — BI System 中英文双语页面切换管理
 *
 * 规则：
 * - 中文页面文件名：中文名.html（如 实时经营概览.html）
 * - 英文页面文件名：kebab-case.html（如 dashboard.html）
 * - 每对页面必须同时存在，新增/删除时必须同步
 *
 * 用法：
 *   在页面中调用 initLangSwitch()，自动：
 *   1. 检测当前语言
 *   2. 绑定语言切换链接
 */

(function (global) {
  'use strict';

  // 双语页面映射表（中文文件名 -> 英文文件名）
  // 新增双语页面时必须在此注册，并确保两个文件同时存在
  const BILINGUAL_PAGES = {
    // 首页（实时经营概览）
    'index.html': 'dashboard.html',
    // 财务数据
    '财务数据.html': 'financial-data.html',
    // 报表中心
    '报表中心.html': 'reports.html',
    // 数据源管理
    '数据源管理.html': 'data-sources.html',
    // 指标管理
    '指标管理.html': 'metrics.html'
  };

  /**
   * 初始化语言切换
   */
  function initLangSwitch() {
    var lang = getCurrentLang();

    // 设置 HTML lang 属性
    document.documentElement.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');

    // 绑定语言切换按钮事件
    bindLangEvents();
  }

  /**
   * 获取当前语言
   */
  function getCurrentLang() {
    if (typeof detectLang === 'function') return detectLang();

    // fallback：从 URL 判断
    var filename = window.location.pathname.split('/').pop() || 'index.html';
    if (/[\u4e00-\u9fa5]/.test(filename)) return 'zh';
    if (filename !== 'index.html' && filename !== '') return 'en';
    return 'zh';
  }

  /**
   * 切换到指定语言
   * @param {string} lang - 'zh' | 'en'
   */
  function switchLang(lang) {
    var currentFile = window.location.pathname.split('/').pop() || 'index.html';
    var targetFile = getPairedFile(currentFile, lang);

    // 跳转到对应语言的文件
    window.location.href = targetFile;
  }

  /**
   * 获取配对的另一种语言文件名
   * @param {string} currentFile - 当前文件名
   * @param {string} targetLang - 目标语言
   * @returns {string} 目标文件名
   */
  function getPairedFile(currentFile, targetLang) {
    // 正向查找：中文 -> 英文
    if (BILINGUAL_PAGES[currentFile]) {
      if (targetLang === 'en') return BILINGUAL_PAGES[currentFile];
      return currentFile; // 已经是中文
    }
    // 反向查找：英文 -> 中文
    for (var zhFile in BILINGUAL_PAGES) {
      if (Object.prototype.hasOwnProperty.call(BILINGUAL_PAGES, zhFile)) {
        if (BILINGUAL_PAGES[zhFile] === currentFile) {
          if (targetLang === 'zh') return zhFile;
          return currentFile; // 已经是英文
        }
      }
    }
    return currentFile; // 未找到匹配，保持原样
  }

  /**
   * 绑定语言切换事件
   */
  function bindLangEvents() {
    var links = document.querySelectorAll('[data-lang-switch]');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function (e) {
        var targetLang = this.getAttribute('data-lang-switch');
        if (targetLang === 'zh' || targetLang === 'en') {
          e.preventDefault();
          switchLang(targetLang);
        }
      });
    }
  }

  /**
   * 获取双语页面映射表（用于校验脚本）
   */
  function getBilingualMap() {
    return BILINGUAL_PAGES;
  }

  // 暴露到全局
  global.initLangSwitch = initLangSwitch;
  global.switchLang = switchLang;
  global.getCurrentLang = getCurrentLang;
  global.getPairedFile = getPairedFile;
  global.getBilingualMap = getBilingualMap;

  // DOM 就绪后自动初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLangSwitch);
  } else {
    initLangSwitch();
  }

})(window);
