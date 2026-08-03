# BI System

## 最终交付版本

- [`BI-System-Standalone.html`](BI-System-Standalone.html)：当前最终版单文件 BI 系统原型，直接用浏览器打开即可使用。
- [`Cheer_Trade_BI系统需求文档_V1.3.9.docx`](Cheer_Trade_BI系统需求文档_V1.3.9.docx)：与最终原型对应的需求文档。
- 原有多页面版本继续保留，便于后续对照和工程化拆分。

## v3 information architecture

- Primary navigation: **Base Data / 基础数据**
- Secondary navigation: **User Data / 用户数据**, **Deposit & Withdrawal / 出入金数据**, **Trading Data / 交易数据**, **Financial Data / 财务数据**
- The Base Data landing page provides four clickable overview cards and its own time-range control.
- Every secondary data view has an independent time-range control and dimension filters.
- Data is regenerated on page load or explicit refresh; all values are fictional demo data.

> 双语纯静态商业智能仪表盘系统，遵循 CheerCMS 工程标准。v2 版本为"经营数据中心"，包含实时经营概览与财务数据(EOD)两大模块。

## 技术栈

- **纯静态**：HTML + 原生 JavaScript，无框架、无构建工具
- **样式**：Tailwind CSS (CDN) + FontAwesome 图标 + Inter 字体
- **数据**：全部使用虚构静态演示数据，无后端、无 API
- **图表**：纯 SVG 自定义实现，零依赖

## 快速开始

### 启动本地服务

```bash
# 方式一：使用自带脚本
./serve.sh

# 方式二：直接用 Python
python3 -m http.server 5000

# 方式三：使用任何静态服务器
npx serve .
```

然后访问 http://localhost:5000/

### 双语切换

- 中文首页：`index.html`
- 英文首页：`dashboard.html`
- 侧边栏右上角有中英文切换按钮

## 页面结构

| 中文页面 | 英文页面 | 路径 (activePath) | 说明 |
|---------|---------|-------------------|------|
| index.html | dashboard.html | `index` | 实时经营概览（客户/出入金/交易 三大板块） |
| 财务数据.html | financial-data.html | `financial-data` | 财务数据 EOD 日终快照 |
| 报表中心.html | reports.html | `reports` | 报表列表与管理 |
| 数据源管理.html | data-sources.html | `data-sources` | 数据源连接管理 |
| 指标管理.html | metrics.html | `metrics` | 业务指标定义 |

## 核心文件

| 文件 | 作用 |
|------|------|
| `sidebar.js` | 侧边栏+顶栏注入，菜单配置唯一真相源 |
| `lang-switch.js` | 中英文页面切换管理 |
| `bi-data.js` | 模拟数据生成器（带种子，会话内数据一致） |
| `bi-charts.js` | 纯 SVG 图表库（折线/条形/环形/漏斗/双轴） |
| `styles/main.css` | 全局样式扩展 |

## 数据说明

### 实时数据口径 (Real-time Snapshot)
- 每次页面加载或点击"刷新快照"时生成新数据
- 同一次会话中，筛选维度变化时数据保持联动一致
- 包含客户数据、出入金数据、交易数据三大板块

### 财务数据口径 (EOD Snapshot)
- EOD = End of Day，每日 23:59:59 服务器时间快照
- 包含 Balance、Equity、Funding Balance 等财务指标
- 币种：USD / AED / USDT

### 业务约束
- 客户漏斗：注册 ≥ KYC ≥ 开户 ≥ 首次入金 ≥ 交易
- 净入金 = 入金金额 - 出金金额
- Funding 总额 = 可用 + 冻结
- Equity 与 Balance 接近（差异约 1~3%）

> **所有数据均为虚构演示数据，不包含任何真实客户信息。**

## 开发规范

详见 [AGENTS.md](AGENTS.md)

### 新增页面

1. 在 `sidebar.js` 的 `MENU_CONFIG` 中注册菜单项
2. 在 `lang-switch.js` 的 `BILINGUAL_PAGES` 中添加映射
3. 创建中文和英文两个 HTML 文件
4. 运行 `./check-bilingual.sh` 验证

### 提交前检查

```bash
# 双语一致性检查
./check-bilingual.sh

# JS 语法检查
node -c sidebar.js
node -c lang-switch.js
node -c bi-data.js
node -c bi-charts.js
```

## 设计规范

详见 [DESIGN.md](DESIGN.md)

核心视觉：
- 侧栏：深色 `#0B1120`
- 主色：蓝色 `#3B82F6`
- 内容背景：浅灰 `#F8FAFC`
- 卡片：`rounded-xl shadow-sm border border-slate-200`
- 金额/时间/ID 使用等宽字体

## 响应式

- 桌面端：1440px 及以上（最优体验）
- 窄屏：1024px（侧栏收起 + 内容自适应）
- 移动端：1024px 以下内容区可横向滚动

## License

MIT
