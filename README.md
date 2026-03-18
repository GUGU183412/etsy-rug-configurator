# Etsy 定制地毯在线配置系统

一个为 Etsy 店铺设计的地毯定制配置系统，让客户可以在线设计地毯，商家可以导出生产文件。

## 项目结构

```
etsy-rug-configurator/
├── packages/
│   ├── editor/           # 客户编辑器（部署到 GitHub Pages）
│   ├── merchant-tool/    # 商家工具（独立 HTML）
│   └── shared/           # 共享代码库
├── config/               # 配置文件
│   ├── patterns.json     # 图案资源配置
│   ├── colors.json       # 配色方案
│   └── sizes.json        # 尺寸规格
└── .github/workflows/    # GitHub Actions 部署配置
```

## 功能特性

### 客户编辑器
- 图案选择与缩放
- 多区域配色方案
- 自定义文字（字体、颜色、大小、旋转、位置）
- 2cm 安全边界提示
- 生成 Base64 配置代码

### 商家工具
- 粘贴配置代码
- 实时预览还原设计
- 导出 25 DPI、<=12 色 PCX 生产文件

## 技术栈

- **前端**: React 18 + TypeScript
- **构建工具**: Vite
- **状态管理**: Zustand
- **Canvas 渲染**: HTML5 Canvas API
- **部署**: GitHub Pages

## 开发

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
# 启动编辑器
npm run dev:editor

# 启动商家工具
npm run dev:merchant
```

### 构建

```bash
# 构建所有包
npm run build

# 仅构建编辑器
npm run build:editor

# 构建商家工具独立 HTML
npm run build:merchant -- --mode standalone
```

## 生产规格

- **材质**: MS456
- **收缩率**: 宽 +4%，长 +4%
- **织机 DPI**: 25
- **导出 DPI**: 25（工厂生产模式）
- **颜色上限**: 12 色
- **安全边界**: 2cm

### 尺寸计算示例

以 49x56cm 地毯为例：
```
25 DPI:  510 x 582 像素
```

## 配置代码格式

配置代码是 Base64 编码的 JSON 字符串，包含：
- 尺寸规格
- 图案选择和位置
- 配色方案
- 文字元素列表

## 部署

编辑器会自动部署到 GitHub Pages，访问地址：
```
https://<username>.github.io/<repository>/
```

## 使用流程

### 客户端
1. 访问编辑器 URL
2. 选择图案、配色、添加文字
3. 点击"生成配置代码"
4. 复制代码到 Etsy 订单备注

### 商家端
1. 打开商家工具
2. 粘贴配置代码
3. 点击"解析配置"
4. 点击"导出 PCX 文件"
5. 将 PCX 文件用于生产

## 许可证

MIT
