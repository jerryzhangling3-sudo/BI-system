# BI System

> 一个纯静态的商业智能（BI）仪表盘前端项目，支持中英文双语。

## 特性

- 纯 HTML + Tailwind CSS (CDN) + FontAwesome + 原生 JavaScript
- 无需构建工具，开箱即用
- 中英文双语切换（成对页面）
- 企业级深色侧栏 + 浅色内容区设计
- 总览仪表盘含 KPI、折线图、环形图、漏斗图、排行榜、异常列表
- 报表中心、数据源管理、指标管理三大功能模块

## 快速开始

### 1. 启动本地服务

```bash
# 方式一：使用启动脚本（推荐）
./serve.sh

# 方式二：直接使用 Python
python3 -m http.server 5000

# 方式三：使用 Node.js
npx serve -l 5000 .
```

启动后访问：http://localhost:5000

### 2. 切换语言

- 首页：通过顶栏的「中文 / EN」按钮切换，URL 参数为 `?lang=zh` 或 `?lang=en`
- 其他页面：通过顶栏的语言切换按钮跳转到对应语言的页面

## 项目结构

```
BI-system/
├── index.html              # 总览仪表盘（首页，单文件双语）
├── 报表中心.html           # 报表中心（中文）
├── reports.html            # 报表中心（英文）
├── 数据源管理.html         # 数据源管理（中文）
├── data-sources.html       # 数据源管理（英文）
├── 指标管理.html           # 指标管理（中文）
├── metrics.html            # 指标管理（英文）
├── sidebar.js              # 侧边栏菜单与路由（唯一真相源）
├── lang-switch.js          # 双语切换管理
├── styles/
│   └── main.css            # 全局样式
├── serve.sh                # 启动脚本
├── check-bilingual.sh      # 双语一致性检查
├── DESIGN.md               # 设计规范
├── AGENTS.md               # 开发规范
└── README.md               # 本文件
```

## 页面说明

### 总览仪表盘 (index.html)
- 日期筛选器
- 4 个核心 KPI：总收入、活跃用户、转化率、订单量
- 收入趋势折线图（30天）
- 渠道占比环形图
- 地区排行榜
- 转化漏斗图
- 最近异常列表
- 最近订单列表

### 报表中心 (reports.html / 报表中心.html)
- 报表分类标签页
- 报表卡片网格展示
- 搜索与新建功能
- 报表状态标识（已发布/草稿/已归档）

### 数据源管理 (data-sources.html / 数据源管理.html)
- 数据源概览统计
- 多类型数据源列表（MySQL/PostgreSQL/ClickHouse/MongoDB/Kafka/S3/API 等）
- 连接状态监控
- 测试/编辑/删除操作

### 指标管理 (metrics.html / 指标管理.html)
- 指标统计概览
- 分类筛选
- 指标列表（含定义、公式、负责人、状态、趋势）
- 分页功能

## 开发说明

### 新增页面

1. 在 `sidebar.js` 的 `MENU_CONFIG` 中添加菜单项
2. 在 `lang-switch.js` 的 `BILINGUAL_PAGES` 中添加映射
3. 创建中文 HTML 文件
4. 创建英文 HTML 文件
5. 运行 `./check-bilingual.sh` 验证

### 双语规范

- 中文文件名使用中文名，如 `报表中心.html`
- 英文文件名使用 kebab-case，如 `reports.html`
- 两个文件结构一致，仅文案不同
- 首页 `index.html` 为单文件双语实现

### 设计规范

详见 [DESIGN.md](./DESIGN.md)

### 开发规范

详见 [AGENTS.md](./AGENTS.md)

## 技术栈

- **HTML5** - 语义化标签
- **Tailwind CSS CDN** - 原子化 CSS 工具类
- **FontAwesome 6.4** - 图标库
- **Inter 字体** - Google Fonts
- **原生 JavaScript (ES5+)** - 无框架依赖
- **Python http.server** - 本地静态服务

## 数据说明

本项目中所有数据均为静态演示数据，完全虚构，不包含任何真实客户信息。
数据仅用于展示界面效果和交互逻辑。

## License

MIT
