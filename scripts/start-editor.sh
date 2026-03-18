#!/bin/bash

# 启动编辑器开发服务器

echo "🚀 启动地毯定制编辑器..."
echo "📍 访问地址: http://localhost:3000"
echo ""

cd "$(dirname "$0")/../packages/editor"
npm run dev
