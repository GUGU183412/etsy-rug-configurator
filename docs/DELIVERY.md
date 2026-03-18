# Etsy 定制地毯系统交付说明

## 1. 客户编辑器 URL

- 开发环境：`http://localhost:3000`
- 运行命令：`npm run dev:editor`
- 当前视觉主题：红白主色 + 黑色高对比文本（纽约地铁极简风格）

功能点：
- 图案切换、三分区配色（背景/主区/辅区）
- 文字新增、字体/颜色/旋转/位置编辑
- 画布拖拽文字排版
- 2cm 安全边界虚线显示与越界拦截
- 仅生成并复制 Base64 配置代码（不提供任何文件导出）

## 2. 商家离线工具 URL

- 开发环境：`http://localhost:3001`
- 运行命令：`npm run dev:merchant`
- 当前视觉主题：生产控制台风格（Parse -> Validate -> Preview -> Export）

功能点：
- 粘贴 Base64 配置代码并解析
- 还原设计并预览
- 一键导出 25 DPI、最多 12 色的 `.pcx` 生产文件（含边缘实化）

## 3. 商家独立页面构建

- 构建命令：`npm run build:merchant:standalone`
- 产物目录：`packages/merchant-tool/dist-standalone`
- 页面入口：`packages/merchant-tool/dist-standalone/index.html`

## 4. 运营配置入口

- 客户端配置：`packages/editor/public/config.json`
- 商家工具配置：`packages/merchant-tool/public/config.json`

可直接维护：
- `patterns`（图案）
- `colorOptions` / `colorSchemes`（颜色）
- `fonts`（字体）
- `sizes`（尺寸）

## 5. UI 验收截图建议

- 编辑器首页全屏（含线路风格头部、工作区、控制区）
- 安全边界与越界提示状态
- 代码生成成功状态
- 商家工具解析成功状态
- 商家导出报告（颜色数、像素、DPI）
