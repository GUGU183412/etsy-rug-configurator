#!/bin/bash

# 启动商家工具开发服务器

echo "🚀 启动商家工具..."
echo "📍 访问地址: http://localhost:3001"
echo ""

cd "$(dirname "$0")/../packages/merchant-tool"
npm run dev
