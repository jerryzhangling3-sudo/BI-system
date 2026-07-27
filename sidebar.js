/**
 * sidebar.js — BI System 侧边栏菜单与路由唯一真相源 (Single Source of Truth)
 *
 * 所有页面通过调用 injectSidebar({activePath, lang}) 注入侧边栏。
 * - activePath: 当前激活的菜单项路径（英文页面对应的 kebab-case 路径）
 * - lang: 当前语言 'zh' 或 'en'
 *
 * 菜单配置中 zhLabel / enLabel 成对出现，确保双语同步。
 * 新增页面时，必须在此处注册菜单项，并创建中英两个 HTML 文件。
 */

(function (global) {
  'use strict';

  // ===== 菜单配置（唯一真相源）=====
  // path 对应英文页面文件名（不含 .html），zhLabel/enLabel 为显示名称
  const MENU_CONFIG = {
    sections: [
      {
        id: 'main',
        zhLabel: '主要功能',
        enLabel: 'Main',
        items: [
          {
            path: 'index',
            zhLabel: '总览仪表盘',
            enLabel: 'Overview Dashboard',
            icon: 'fa-chart-line',
            zhFile: 'index.html',
            enFile: 'index.html' // 首页中英文同一入口，内部切换
          },
          {
            path: 'reports',
            zhLabel: '报表中心',
            enLabel: 'Reports Center',
            icon: 'fa-file-alt',
            zhFile: '报表中心.html',
            enFile: 'reports.html'
          }
        ]
      },
      {
        id: 'management',
        zhLabel: '数据管理',
        enLabel: 'Data Management',
        items: [
          {
            path: 'data-sources',
            zhLabel: '数据源管理',
            enLabel: 'Data Sources',
            icon: 'fa-database',
            zhFile: '数据源管理.html',
            enFile: 'data-sources.html'
          },
          {
            path: 'metrics',
            zhLabel: '指标管理',
            enLabel: 'Metrics Management',
            icon: 'fa-ruler-combined',
            zhFile: '指标管理.html',
            enFile: 'metrics.html'
          }
        ]
      }
    ],
    footerItems: [
      {
        path: 'settings',
        zhLabel: '系统设置',
        enLabel: 'Settings',
        icon: 'fa-cog',
        zhFile: '#',
        enFile: '#'
      }
    ]
  };

  // ===== 国际化文案 =====
  const I18N = {
    zh: {
      brand: 'BI System',
      brandSub: '商业智能平台',
      searchPlaceholder: '搜索...',
      settings: '设置',
      notifications: '通知'
    },
    en: {
      brand: 'BI System',
      brandSub: 'Business Intelligence',
      searchPlaceholder: 'Search...',
      settings: 'Settings',
      notifications: 'Notifications'
    }
  };

  /**
   * 注入侧边栏到页面
   * @param {Object} options
   * @param {string} options.activePath - 当前激活菜单的 path（英文 kebab-case）
   * @param {string} options.lang - 当前语言 'zh' | 'en'
   * @param {string} [options.targetId] - 注入目标元素 ID，默认 'sidebar-root'
   * @param {boolean} [options.showTopbar] - 是否同时注入顶栏，默认 true
   */
  function injectSidebar(options) {
    var activePath = options.activePath || 'index';
    var lang = options.lang || 'zh';
    var targetId = options.targetId || 'sidebar-root';
    var showTopbar = options.showTopbar !== false;
    var t = I18N[lang] || I18N.zh;

    var target = document.getElementById(targetId);
    if (!target) {
      console.warn('[sidebar] target element #' + targetId + ' not found');
      return;
    }

    // 构建侧边栏 HTML
    var html = '';
    html += '<div class="app-shell">';
    html += '  <aside class="sidebar" id="app-sidebar">';

    // Logo
    html += '    <div class="sidebar-logo">';
    html += '      <div class="sidebar-logo-icon">';
    html += '        <i class="fas fa-chart-bar"></i>';
    html += '      </div>';
    html += '      <div>';
    html += '        <div class="sidebar-logo-text">' + t.brand + '</div>';
    html += '      </div>';
    html += '    </div>';

    // 菜单区块
    html += '    <nav class="sidebar-menu">';
    MENU_CONFIG.sections.forEach(function (section) {
      var sectionLabel = lang === 'zh' ? section.zhLabel : section.enLabel;
      html += '      <div class="sidebar-section-label">' + sectionLabel + '</div>';
      section.items.forEach(function (item) {
        var itemLabel = lang === 'zh' ? item.zhLabel : item.enLabel;
        var isActive = item.path === activePath ? ' active' : '';
        var href = buildHref(item, lang);
        html += '      <a href="' + href + '" class="sidebar-item' + isActive + '" data-path="' + item.path + '">';
        html += '        <i class="fas ' + item.icon + '"></i>';
        html += '        <span>' + itemLabel + '</span>';
        html += '      </a>';
      });
    });
    html += '    </nav>';

    // 底部菜单项
    html += '    <div class="sidebar-footer">';
    MENU_CONFIG.footerItems.forEach(function (item) {
      var itemLabel = lang === 'zh' ? item.zhLabel : item.enLabel;
      var isActive = item.path === activePath ? ' active' : '';
      html += '      <a href="#" class="sidebar-item' + isActive + '" data-path="' + item.path + '">';
      html += '        <i class="fas ' + item.icon + '"></i>';
      html += '        <span>' + itemLabel + '</span>';
      html += '      </a>';
    });
    html += '    </div>';
    html += '  </aside>';

    // 主内容区包裹（顶栏 + 内容槽位）
    html += '  <div class="main-content">';
    if (showTopbar) {
      html += buildTopbar(activePath, lang, t);
    }
    html += '    <div class="content" id="page-content">';
    html += '      <!-- PAGE CONTENT SLOT - filled by page-specific HTML -->';
    html += '    </div>';
    html += '  </div>';
    html += '</div>';

    target.innerHTML = html;
  }

  /**
   * 构建顶栏 HTML
   */
  function buildTopbar(activePath, lang, t) {
    // 找到当前页面标题
    var pageTitle = '';
    MENU_CONFIG.sections.forEach(function (section) {
      section.items.forEach(function (item) {
        if (item.path === activePath) {
          pageTitle = lang === 'zh' ? item.zhLabel : item.enLabel;
        }
      });
    });

    // 语言切换链接
    var langSwitch = buildLangSwitch(activePath, lang);

    var html = '';
    html += '  <div class="topbar">';
    html += '    <div class="topbar-left">';
    html += '      <h1 class="page-title">' + pageTitle + '</h1>';
    html += '    </div>';
    html += '    <div class="topbar-right">';
    html +=       langSwitch;
    html += '      <button class="icon-btn" title="' + t.notifications + '">';
    html += '        <i class="far fa-bell"></i>';
    html += '      </button>';
    html += '      <button class="icon-btn" title="' + t.settings + '">';
    html += '        <i class="fas fa-cog"></i>';
    html += '      </button>';
    html += '      <div class="avatar">A</div>';
    html += '    </div>';
    html += '  </div>';
    return html;
  }

  /**
   * 构建语言切换器 HTML
   */
  function buildLangSwitch(activePath, currentLang) {
    // 找到对应菜单项
    var targetItem = null;
    MENU_CONFIG.sections.forEach(function (section) {
      section.items.forEach(function (item) {
        if (item.path === activePath) targetItem = item;
      });
    });

    var zhHref = targetItem ? targetItem.zhFile : '#';
    var enHref = targetItem ? targetItem.enFile : '#';

    // 首页特殊处理：index.html 内通过 lang 参数切换
    if (activePath === 'index') {
      zhHref = 'index.html?lang=zh';
      enHref = 'index.html?lang=en';
    }

    var html = '';
    html += '<div class="lang-switch">';
    html += '  <a href="' + zhHref + '" class="' + (currentLang === 'zh' ? 'active' : '') + '">中文</a>';
    html += '  <a href="' + enHref + '" class="' + (currentLang === 'en' ? 'active' : '') + '">EN</a>';
    html += '</div>';
    return html;
  }

  /**
   * 根据语言构建菜单链接
   */
  function buildHref(item, lang) {
    if (item.zhFile === '#' || item.enFile === '#') return '#';
    return lang === 'zh' ? item.zhFile : item.enFile;
  }

  /**
   * 从 URL 获取当前语言（优先 query 参数，其次从文件名判断）
   */
  function detectLang() {
    // 1. URL query 参数 ?lang=zh/en
    var params = new URLSearchParams(window.location.search);
    var langParam = params.get('lang');
    if (langParam === 'zh' || langParam === 'en') return langParam;

    // 2. 从文件名判断
    var filename = window.location.pathname.split('/').pop() || 'index.html';
    var isZhFile = /[\u4e00-\u9fa5]/.test(filename); // 含中文字符
    if (isZhFile) return 'zh';

    // 3. 默认英文文件名（除首页外）
    if (filename !== 'index.html' && filename !== '') return 'en';

    // 4. 首页默认中文
    return 'zh';
  }

  /**
   * 获取当前页面对应的 activePath（从文件名反查）
   */
  function detectActivePath() {
    var filename = window.location.pathname.split('/').pop() || 'index.html';
    if (filename === 'index.html' || filename === '') return 'index';

    // 遍历菜单配置查找匹配
    var found = null;
    MENU_CONFIG.sections.forEach(function (section) {
      section.items.forEach(function (item) {
        if (item.zhFile === filename || item.enFile === filename) {
          found = item.path;
        }
      });
    });
    return found || 'index';
  }

  // 暴露到全局
  global.injectSidebar = injectSidebar;
  global.getMenuConfig = function () { return MENU_CONFIG; };
  global.detectLang = detectLang;
  global.detectActivePath = detectActivePath;
  global.biI18n = I18N;

})(window);
