#!/bin/bash

# VStudio 快速部署脚本

echo "🚀 VStudio 部署开始..."

# 检查依赖
echo "📦 检查依赖..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi

# 安装依赖
echo "📥 安装依赖..."
npm install

# 构建项目
echo "🔨 构建项目..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
    echo ""
    echo "🌐 现在可以部署到以下平台："
    echo ""
    echo "Vercel:"
    echo "  npm install -g vercel"
    echo "  vercel --prod"
    echo ""
    echo "Cloudflare Pages:"
    echo "  npm install -g wrangler"
    echo "  wrangler login"
    echo "  wrangler pages deploy .svelte-kit/output/static --project-name vstudio"
    echo ""
    echo "Netlify:"
    echo "  npm install -g netlify-cli"
    echo "  netlify deploy --prod --dir .svelte-kit/output/static"
    echo ""
    echo "💡 记得在部署平台设置环境变量："
    echo "  PUBLIC_SUPABASE_URL=你的Supabase项目URL"
    echo "  PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥"
    echo ""
else
    echo "❌ 构建失败，请检查错误信息"
    exit 1
fi