#!/bin/bash

# VStudio Cloudflare Pages 部署脚本 - API Token 方式

echo "🚀 VStudio Cloudflare Pages 部署 (API Token 方式)"
echo ""

# 检查是否设置了 API Token
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ 请先设置 Cloudflare API Token："
    echo ""
    echo "1. 访问: https://dash.cloudflare.com/profile/api-tokens"
    echo "2. 点击 'Create Token' → 'Custom token'"
    echo "3. 设置权限:"
    echo "   - Account: Cloudflare Pages:Edit"
    echo "   - Zone: Zone:Read"
    echo "   - Zone: Page Rules:Edit"
    echo "4. 复制生成的 token"
    echo "5. 运行: export CLOUDFLARE_API_TOKEN=你的_token"
    echo "6. 重新运行此脚本"
    echo ""
    exit 1
fi

echo "✅ API Token 已设置"

# 检查构建文件
if [ ! -d ".svelte-kit/cloudflare" ]; then
    echo "📦 构建项目..."
    npm run build
    
    if [ $? -ne 0 ]; then
        echo "❌ 构建失败"
        exit 1
    fi
fi

echo "✅ 构建文件存在"

# 部署到 Cloudflare Pages
echo "🚀 开始部署..."
npx wrangler pages deploy .svelte-kit/cloudflare --project-name vstudio

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 部署成功！"
    echo ""
    echo "🌐 访问地址:"
    echo "   https://vstudio.pages.dev"
    echo ""
    echo "🔧 下一步: 设置环境变量"
    echo "   1. 访问 Cloudflare Pages 项目设置"
    echo "   2. 添加环境变量:"
    echo "      PUBLIC_SUPABASE_URL=你的Supabase项目URL"
    echo "      PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥"
    echo ""
else
    echo "❌ 部署失败"
    echo ""
    echo "💡 建议尝试 GitHub 集成部署："
    echo "   1. 访问 https://pages.cloudflare.com/"
    echo "   2. 选择 'Connect to Git'"
    echo "   3. 选择 GitHub 仓库 'microblue/vstudio'"
    exit 1
fi