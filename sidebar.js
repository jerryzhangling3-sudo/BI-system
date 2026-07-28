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
        id: 'base-data',
        zhLabel: '基础数据',
        enLabel: 'Base Data',
        path: 'base-data',
        icon: 'fa-layer-group',
        zhFile: 'index.html',
        enFile: 'dashboard.html',
        items: [
          {
            path: 'customer-data',
            zhLabel: '用户数据',
            enLabel: 'User Data',
            icon: 'fa-users',
            zhFile: '用户数据.html',
            enFile: 'customer-data.html'
          },
          {
            path: 'funding-data',
            zhLabel: '出入金数据',
            enLabel: 'Deposit & Withdrawal',
            icon: 'fa-money-bill-transfer',
            zhFile: '出入金数据.html',
            enFile: 'funding-data.html'
          },
          {
            path: 'trading-data',
            zhLabel: '交易数据',
            enLabel: 'Trading Data',
            icon: 'fa-chart-candlestick',
            zhFile: '交易数据.html',
            enFile: 'trading-data.html'
          },
          {
            path: 'financial-data',
            zhLabel: '财务数据',
            enLabel: 'Financial Data',
            icon: 'fa-coins',
            zhFile: '财务数据.html',
            enFile: 'financial-data.html'
          }
        ]
      },
      {
        id: 'management',
        zhLabel: '数据管理',
        enLabel: 'Data Management',
        items: [
          {
            path: 'reports',
            zhLabel: '报表中心',
            enLabel: 'Reports Center',
            icon: 'fa-file-alt',
            zhFile: '报表中心.html',
            enFile: 'reports.html'
          },
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
      brandSub: '经营数据中心',
      searchPlaceholder: '搜索...',
      settings: '设置',
      notifications: '通知'
    },
    en: {
      brand: 'BI System',
      brandSub: 'Business Data Center',
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
    html += '        <div class="sidebar-logo-sub">' + t.brandSub + '</div>';
    html += '      </div>';
    html += '    </div>';

    // 菜单区块
    html += '    <nav class="sidebar-menu">';
    MENU_CONFIG.sections.forEach(function (section) {
      var sectionLabel = lang === 'zh' ? section.zhLabel : section.enLabel;
      if (section.path) {
        var sectionHref = lang === 'zh' ? section.zhFile : section.enFile;
        var sectionActive = section.path === activePath ? ' active' : '';
        html += '      <a href="' + sectionHref + '" class="sidebar-primary' + sectionActive + '"><i class="fas ' + section.icon + '"></i><span>' + sectionLabel + '</span><i class="fas fa-chevron-down sidebar-primary-arrow"></i></a>';
        html += '      <div class="sidebar-submenu">';
      } else {
        html += '      <div class="sidebar-section-label">' + sectionLabel + '</div>';
      }
      section.items.forEach(function (item) {
        var itemLabel = lang === 'zh' ? item.zhLabel : item.enLabel;
        var isActive = item.path === activePath ? ' active' : '';
        var href = buildHref(item, lang);
        html += '      <a href="' + href + '" class="sidebar-item' + isActive + (section.path ? ' sidebar-subitem' : '') + '" data-path="' + item.path + '">';
        html += '        <i class="fas ' + item.icon + '"></i>';
        html += '        <span>' + itemLabel + '</span>';
        html += '      </a>';
      });
      if (section.path) html += '      </div>';
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
      if (section.path === activePath) {
        pageTitle = lang === 'zh' ? section.zhLabel : section.enLabel;
      }
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
      if (section.path === activePath) {
        targetItem = section;
      }
      section.items.forEach(function (item) {
        if (item.path === activePath) targetItem = item;
      });
    });

    var zhHref = targetItem ? targetItem.zhFile : '#';
    var enHref = targetItem ? targetItem.enFile : '#';

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
   * 从 URL 获取当前语言（从文件名判断）
   */
  function detectLang() {
    var filename = window.location.pathname.split('/').pop() || 'index.html';
    // 中文文件名（含中文字符）
    if (/[\u4e00-\u9fa5]/.test(filename)) return 'zh';
    // 英文文件名（除首页 index.html 外）
    if (filename !== 'index.html' && filename !== '') return 'en';
    // 首页默认中文
    return 'zh';
  }

  /**
   * 获取当前页面对应的 activePath（从文件名反查）
   */
  function detectActivePath() {
    var filename = window.location.pathname.split('/').pop() || 'index.html';
    if (filename === 'index.html' || filename === '') return 'index';
    if (filename === 'dashboard.html') return 'index';

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
