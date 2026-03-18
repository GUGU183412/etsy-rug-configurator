# 快速开始指南

## 启动开发服务器

### 方式 1：使用启动脚本（推荐）

双击运行 `scripts/start.bat`，然后选择要启动的服务：

```
=====================================
  地毯定制系统 - 启动菜单
=====================================

  [1] 客户编辑器 (http://localhost:3000)
  [2] 商家工具   (http://localhost:3001)
  [3] 同时启动两个服务
  [0] 退出

请选择要启动的服务 (0-3):
```

### 方式 2：使用 npm 命令

```bash
# 启动编辑器
npm run dev:editor

# 启动商家工具
npm run dev:merchant
```

### 方式 3：直接运行脚本

**Windows:**
```bash
# 启动编辑器
scripts\start-editor.bat

# 启动商家工具
scripts\start-merchant.bat
```

**Linux/Mac:**
```bash
# 赋予执行权限
chmod +x scripts/*.sh

# 启动编辑器
./scripts/start-editor.sh

# 启动商家工具
./scripts/start-merchant.sh
```

## 访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| 客户编辑器 | http://localhost:3000 | 客户设计地毯的界面 |
| 商家工具 | http://localhost:3001 | 商家解析配置并导出 PCX |

## 项目结构

```
etsy-rug-configurator/
├── scripts/
│   ├── start.bat           # Windows 启动菜单
│   ├── start-editor.bat    # 启动编辑器
│   └── start-merchant.bat  # 启动商家工具
├── packages/
│   ├── editor/             # 客户编辑器
│   ├── merchant-tool/      # 商家工具
│   └── shared/             # 共享代码
└── config/                 # 配置文件
```

## 常用命令

```bash
# 安装依赖
npm install

# 类型检查
npm run typecheck

# 构建所有包
npm run build

# 构建商家工具独立 HTML
npm run build:merchant:standalone

# 清理 node_modules
npm run clean
```

## 开发提示

1. **首次运行**：确保已安装 Node.js 18+ 和 npm 9+
2. **端口冲突**：如果 3000 或 3001 端口被占用，可以修改对应包的 `vite.config.ts`
3. **热更新**：代码修改后会自动刷新浏览器
4. **调试**：使用浏览器开发者工具进行调试
5. **UI 基线**：当前主题为红白主色 + 黑色文本的纽约地铁极简风格，避免引入多余渐变和高圆角卡片风

## 下一步

1. 按需编辑 `packages/editor/public/config.json`
2. 同步编辑 `packages/merchant-tool/public/config.json`
3. 通过编辑器生成 Base64 配置码并在商家工具解析验证
4. 执行 `npm run build:merchant:standalone` 生成离线商家页面
5. 为交付准备截图（建议）：
   - 编辑器：工作区、控制区、安全边界提示、生成代码区域
   - 商家工具：Parse/Validate/Preview/Export 四段流程
   - 导出报告：颜色数、像素尺寸、DPI
