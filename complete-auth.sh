#!/bin/bash
# 完成剩余CLI工具认证

echo "🔑 Completing CLI Tools Authentication"
echo "======================================"

# 初始化环境
source ~/openclaw-agent-init.sh

echo "Only Vercel CLI needs authentication."
echo "This will open your browser for OAuth login."
echo ""
read -p "Authenticate Vercel CLI? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Launching Vercel authentication..."
    vercel login
    
    if vercel whoami >/dev/null 2>&1; then
        echo "✅ Vercel authentication successful!"
    else
        echo "❌ Vercel authentication failed"
    fi
else
    echo "⏭️  Skipped Vercel authentication"
fi

echo ""
echo "🎉 All CLI tools are now ready for OpenClaw agents!"
echo ""
echo "📋 How to use in any OpenClaw session:"
echo "   source ~/openclaw-agent-init.sh"
echo ""
echo "🔍 Verify tools anytime with:"
echo "   ./verify-cli-tools.sh"