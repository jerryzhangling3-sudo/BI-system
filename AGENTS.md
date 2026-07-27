# AGENTS.md — BI System

> 项目规范与开发指引，供 AI Agent 快速理解项目结构和编码约定。

## 1. 项目概览

**BI System** 是一个纯静态的商业智能仪表盘前端项目，遵循 CheerCMS 工程标准。

- **技术栈**：纯 HTML + Tailwind CSS (CDN) + FontAwesome + Inter 字体 + 原生 JavaScript
- **无框架**：不使用 React/Vue/Vite/任何构建工具
- **无后端**：纯静态页面，数据为静态演示数据
- **双语架构**：中英文双语，中文文件名 / 英文 kebab-case 文件名成对

## 2. 目录结构

```
BI-system/
├── index.html              # 首页 / 总览仪表盘（单文件双语，?lang=zh/en）
├── 报表中心.html           # 中文：报表中心
├── reports.html            # 英文：Reports Center
├── 数据源管理.html         # 中文：数据源管理
├── data-sources.html       # 英文：Data Sources
├── 指标管理.html           # 中文：指标管理
├── metrics.html            # 英文：Metrics Management
├── sidebar.js              # 侧边栏菜单与路由 —— 唯一真相源 (SSOT)
├── lang-switch.js          # 中英文页面切换管理
├── styles/
│   └── main.css            # 全局样式（扩展 Tailwind CDN）
├── serve.sh                # 本地静态服务器启动脚本
├── check-bilingual.sh      # 双语一致性检查脚本
├── DESIGN.md               # 设计规范
├── AGENTS.md               # 本文件
└── README.md               # 项目说明
```

## 3. 核心规范（强制执行）

### 3.1 侧边栏唯一真相源 (Sidebar SSOT)

**`sidebar.js` 是菜单与路由的唯一真相源。**

- 所有页面通过 `injectSidebar({activePath, lang})` 注入侧边栏和顶栏
- 菜单配置在 `MENU_CONFIG` 对象中，每项包含：`path`、`zhLabel`、`enLabel`、`icon`、`zhFile`、`enFile`
- **新增页面必须在 `MENU_CONFIG` 注册**，同时创建中英两个 HTML 文件
- `activePath` 是菜单项的唯一标识，对应英文文件名（不含 .html），如 `'reports'`、`'data-sources'`、`'metrics'`

```javascript
// 每个页面必须包含以下代码（保证顺序正确）：
// 1. 引入 sidebar.js 和 lang-switch.js
// 2. 调用 injectSidebar({ activePath: 'xxx', lang: lang })
// 3. 向 #page-content 注入本页内容
```

### 3.2 双语同步规范

**中英文页面必须成对存在。**

| 中文页面 | 英文页面 | activePath |
|---------|---------|------------|
| index.html (zh mode) | index.html (en mode) | `index` |
| 报表中心.html | reports.html | `reports` |
| 数据源管理.html | data-sources.html | `data-sources` |
| 指标管理.html | metrics.html | `metrics` |

**首页特殊规则**：`index.html` 是单文件双语，通过 URL 参数 `?lang=zh` 或 `?lang=en` 切换语言。

**成对规则**：
- 除首页外，每个功能页面必须有中文文件名和英文 kebab-case 文件名两个文件
- 两个文件内容结构一致，仅文案语言不同
- 新增/删除/重命名页面时，必须同时操作两个文件，并更新 `sidebar.js` 的菜单配置和 `lang-switch.js` 的映射表

**校验命令**：
```bash
./check-bilingual.sh   # 检查双语一致性
```

### 3.3 activePath 规范

- `activePath` 始终使用英文 kebab-case，如 `reports`、`data-sources`
- 它是页面在菜单系统中的唯一标识符
- 中文页面和英文页面的 `activePath` 相同（因为它们是同一个页面的双语版本）
- `sidebar.js` 根据 `activePath + lang` 决定哪个菜单项高亮

### 3.4 视觉规范

详见 `DESIGN.md`，核心要点：

- **侧栏**：深色 `#0B1120`
- **主色**：蓝色 `#3B82F6`
- **内容背景**：浅灰 `#F8FAFC`
- **卡片**：`rounded-xl` / `shadow-sm` / `border-slate-200`
- **等宽字体**：金额、时间、ID 编号一律使用等宽字体（`.mono` 类或 `.kpi-value` / `.amount` / `.timestamp` / `.id-text`）

### 3.5 数据规范

- **全部使用静态演示数据**，完全虚构，禁止真实客户信息
- 数据应具有真实感（合理的数值范围、命名风格、业务逻辑）
- 公司名、人名、订单号等均为虚构

## 4. 新增页面步骤

1. 在 `sidebar.js` 的 `MENU_CONFIG` 中添加菜单项（含 zhLabel/enLabel/path/zhFile/enFile/icon）
2. 在 `lang-switch.js` 的 `BILINGUAL_PAGES` 中添加文件名映射
3. 创建中文 HTML 文件（中文名.html）
4. 创建英文 HTML 文件（kebab-case.html）
5. 两个文件都调用 `injectSidebar({ activePath: 'xxx', lang: 'zh'|'en' })`
6. 运行 `./check-bilingual.sh` 验证

## 5. 校验规范

提交前必须运行以下检查：

```bash
# 1. 双语一致性检查
./check-bilingual.sh

# 2. JavaScript 语法检查（需要 node）
node -c sidebar.js
node -c lang-switch.js

# 3. 启动服务并访问验证
./serve.sh 5000
```

## 6. Git 推送规范

- **提交信息**：使用 Conventional Commits 格式
  - `feat: 新增 xxx 功能`
  - `fix: 修复 xxx 问题`
  - `refactor: 重构 xxx`
  - `docs: 更新 xxx 文档`
  - `chore: xxx`
- **双语提交**：涉及页面变更时，中文和英文页面的修改必须在同一个 commit 中提交
- **变更范围**：如涉及多个模块，使用 scope 标注，如 `feat(reports): xxx`
- **禁止**：
  - 禁止只提交中文或只提交英文页面的变更
  - 禁止直接推送到主分支（应使用 PR/MR）
  - 禁止未通过 `check-bilingual.sh` 检查的代码合入

## 7. 编码约定

- **JS 风格**：ES5+ 兼容，不使用 ES modules（因为没有构建工具）
- **变量命名**：camelCase
- **DOM 操作**：原生 API，不使用 jQuery
- **CSS**：优先使用 Tailwind 工具类，复杂样式写在 `styles/main.css`
- **缩进**：2 空格
- **字符编码**：UTF-8
- **文件结尾**：保留换行符

## 8. 快速定位

| 需求 | 位置 |
|-----|------|
| 修改菜单 / 新增页面入口 | `sidebar.js` → `MENU_CONFIG` |
| 修改双语切换逻辑 | `lang-switch.js` → `BILINGUAL_PAGES` |
| 修改全局样式 / 组件样式 | `styles/main.css` |
| 修改设计规范 / 视觉风格 | `DESIGN.md` |
| 首页仪表盘内容 | `index.html` 内的 IIFE 函数 |
| 报表中心页面 | `报表中心.html` / `reports.html` |
| 数据源管理页面 | `数据源管理.html` / `data-sources.html` |
| 指标管理页面 | `指标管理.html` / `metrics.html` |
