#!/bin/bash

# VStudio Cloudflare Pages 部署脚本

echo "🚀 VStudio Cloudflare Pages 部署开始..."
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 18+"
    exit 1
fi

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi

# 检查 wrangler
if ! command -v wrangler &> /dev/null; then
    echo "📦 安装 Wrangler CLI..."
    npm install -g wrangler
    
    if [ $? -ne 0 ]; then
        echo "❌ Wrangler 安装失败"
        exit 1
    fi
fi

# 检查登录状态
echo "🔐 检查 Cloudflare 登录状态..."
if ! wrangler whoami &> /dev/null; then
    echo "请先登录 Cloudflare："
    echo "运行: wrangler login"
    echo "然后重新执行此脚本"
    exit 1
fi

echo "✅ Cloudflare 登录正常"

# 安装依赖
echo "📦 安装项目依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

# 构建项目
echo "🔨 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 项目构建失败"
    exit 1
fi

echo "✅ 项目构建成功"

# 检查构建输出
if [ ! -d ".svelte-kit/cloudflare" ]; then
    echo "❌ 构建输出目录不存在"
    exit 1
fi

# 部署到 Cloudflare Pages
echo "🚀 部署到 Cloudflare Pages..."
wrangler pages deploy .svelte-kit/cloudflare --project-name vstudio

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 部署成功！"
    echo ""
    echo "📝 接下来需要设置环境变量："
    echo ""
    echo "1. 必需变量："
    echo "   wrangler pages secret put PUBLIC_SUPABASE_URL --name vstudio"
    echo "   wrangler pages secret put PUBLIC_SUPABASE_ANON_KEY --name vstudio"
    echo ""
    echo "2. 可选 AI 变量："
    echo "   wrangler pages secret put ANTHROPIC_API_KEY --name vstudio"
    echo "   wrangler pages secret put OPENAI_API_KEY --name vstudio"
    echo ""
    echo "🌐 访问你的网站："
    echo "   https://vstudio.pages.dev"
    echo ""
    echo "📚 详细文档："
    echo "   查看 CLOUDFLARE_DEPLOY.md"
    echo ""
else
    echo "❌ 部署失败，请检查错误信息"
    exit 1
fi