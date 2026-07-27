# DESIGN.md — BI System

## 气质与意象
- 企业级数据驾驶舱，深夜服务器机房中一块冷光屏幕，信息密度高但呼吸感充足
- 意象：金融终端 + 设计师后台的中间地带——专业、克制、不花哨，但绝不呆板
- 关键词：冷静、可靠、洞察力、决策辅助

## 视觉策略
- 图形语言：简洁图标 + 几何图表，用阴影和边框区分层级，不用渐变装饰
- 图像方向：不使用人物照片；图表和数据可视化是视觉主体
- 布局：左侧固定侧栏导航 + 右侧流动内容区，经典企业后台布局

## 配色方案
| Token | 值 | 意象来源 |
|-------|----|----------|
| sidebar-bg | `#0B1120` | 深夜服务器机房的深蓝黑 |
| sidebar-text | `#94A3B8` | 低饱和 slate，长时阅读不刺眼 |
| sidebar-active-bg | `#1E293B` | 选中项微微提亮，层次清晰 |
| sidebar-active-text | `#FFFFFF` | 选中项白色高亮 |
| primary | `#3B82F6` | 精准的蓝色——信任、数据、科技感 |
| content-bg | `#F8FAFC` | 浅灰蓝白，像打印纸的质感 |
| card-bg | `#FFFFFF` | 纯白卡片，信息层次清晰 |
| card-border | `#E2E8F0` | slate-200，轻描边 |
| text-primary | `#0F172A` | 主文字接近纯黑 |
| text-secondary | `#64748B` | 次级说明文字 |
| success | `#10B981` | 增长、正向指标 |
| danger | `#EF4444` | 异常、下降 |
| warning | `#F59E0B` | 警告状态 |

## 字体排版
- 字体族：Inter (Google Fonts) + 系统等宽字体
- 标题：Inter SemiBold，数字感强
- 正文：Inter Regular，行高 1.5
- **等宽字体场景**：金额、时间戳、ID 编号一律使用 `ui-monospace, SFMono-Regular, Menlo, monospace`
- 字号节奏：12px (辅助) / 14px (正文) / 16px (小标题) / 24px (KPI 数字) / 32px (页面标题)

## 组件规范
- **卡片**：`rounded-xl shadow-sm border border-slate-200 bg-white`
- **按钮主色**：`bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium`
- **按钮次态**：`bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg px-4 py-2 text-sm`
- **KPI 卡片**：卡片内顶部图标圆形背景 + 底部趋势小标签（绿色向上 / 红色向下）
- **表格**：无边框表头，分隔线用浅灰，hover 行浅高亮
- **标签/徽章**：`rounded-full px-2 py-0.5 text-xs font-medium`

## 动效与交互
- 过渡统一用 `transition-all duration-200 ease-in-out`
- 悬停：轻微上移 + 阴影加深（卡片）；背景色变化（按钮、菜单项）
- 图表加载：渐显（opacity 0→1），不用花哨动画
- 侧边栏折叠：宽度过渡平滑

## 设计禁忌
- 禁止使用渐变背景、玻璃拟态、3D 效果
- 禁止超过 3 种颜色在同一视图中作为强调色
- 禁止使用卡通风格图标或插画
- 禁止卡片使用大圆角（>16px）或厚阴影
- 数字 KPI 禁止使用非等宽字体
