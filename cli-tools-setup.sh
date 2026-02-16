#!/bin/bash
# CLI Tools Setup - 统一配置所有CLI工具
# 让所有OpenClaw agents都能无缝使用CLI工具

echo "🔧 CLI Tools Setup for OpenClaw Agents"
echo "======================================="

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查和添加PATH
setup_path() {
    echo -e "${BLUE}Setting up PATH environment...${NC}"
    
    # 创建统一的PATH配置
    CLI_PATH_CONFIG="$HOME/.cli-tools-path"
    
    cat > "$CLI_PATH_CONFIG" << 'EOF'
# CLI Tools PATH Configuration for OpenClaw
export PATH="/usr/local/bin:$PATH"  # Supabase
export PATH="/usr/bin:$PATH"        # GitHub CLI, Docker
export PATH="$HOME/.nvm/versions/node/v22.18.0/bin:$PATH"  # Node tools (wrangler, vercel)
export PATH="$HOME/vstudio/google-cloud-sdk/bin:$PATH"     # Google Cloud CLI

# Aliases for convenience
alias gcloud="$HOME/vstudio/google-cloud-sdk/bin/gcloud"
alias gsutil="$HOME/vstudio/google-cloud-sdk/bin/gsutil"
alias bq="$HOME/vstudio/google-cloud-sdk/bin/bq"
EOF

    # 添加到 bashrc
    if ! grep -q "cli-tools-path" "$HOME/.bashrc"; then
        echo "source $HOME/.cli-tools-path" >> "$HOME/.bashrc"
        echo -e "${GREEN}✓ Added CLI tools PATH to .bashrc${NC}"
    else
        echo -e "${YELLOW}! CLI tools PATH already in .bashrc${NC}"
    fi
    
    # 立即生效
    source "$CLI_PATH_CONFIG"
}

# 检查工具安装状态
check_tools() {
    echo -e "\n${BLUE}Checking CLI tools installation...${NC}"
    
    declare -A tools=(
        ["supabase"]="/usr/local/bin/supabase"
        ["gh"]="/usr/bin/gh" 
        ["wrangler"]="$HOME/.nvm/versions/node/v22.18.0/bin/wrangler"
        ["vercel"]="$HOME/.nvm/versions/node/v22.18.0/bin/vercel"
        ["gcloud"]="$HOME/vstudio/google-cloud-sdk/bin/gcloud"
        ["docker"]="/usr/bin/docker"
    )
    
    for tool in "${!tools[@]}"; do
        if [ -x "${tools[$tool]}" ]; then
            version=$(${tools[$tool]} --version 2>&1 | head -1 || echo "unknown")
            echo -e "${GREEN}✓ $tool${NC}: ${tools[$tool]} ($version)"
        else
            echo -e "${RED}✗ $tool${NC}: Not found at ${tools[$tool]}"
        fi
    done
}

# 检查认证状态
check_auth() {
    echo -e "\n${BLUE}Checking authentication status...${NC}"
    
    # GitHub
    if gh auth status >/dev/null 2>&1; then
        account=$(gh api user --jq .login 2>/dev/null || echo "unknown")
        echo -e "${GREEN}✓ GitHub CLI${NC}: Authenticated as $account"
    else
        echo -e "${RED}✗ GitHub CLI${NC}: Not authenticated"
    fi
    
    # Google Cloud
    if gcloud auth list --filter=status:ACTIVE --format="value(account)" >/dev/null 2>&1; then
        account=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null | head -1)
        echo -e "${GREEN}✓ Google Cloud CLI${NC}: Authenticated as $account"
    else
        echo -e "${RED}✗ Google Cloud CLI${NC}: Not authenticated"
    fi
    
    # Supabase (check if local is running)
    if supabase status >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Supabase CLI${NC}: Local development environment active"
    else
        echo -e "${YELLOW}! Supabase CLI${NC}: Local environment not running"
    fi
    
    # Wrangler
    if wrangler whoami >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Wrangler CLI${NC}: Authenticated"
    else
        echo -e "${RED}✗ Wrangler CLI${NC}: Not authenticated - run 'wrangler login'"
    fi
    
    # Vercel
    if vercel whoami >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Vercel CLI${NC}: Authenticated"
    else
        echo -e "${RED}✗ Vercel CLI${NC}: Not authenticated - run 'vercel login'"
    fi
}

# 创建认证助手脚本
create_auth_helper() {
    echo -e "\n${BLUE}Creating authentication helper...${NC}"
    
    cat > "$HOME/cli-auth-helper.sh" << 'EOF'
#!/bin/bash
# CLI Authentication Helper

echo "🔑 CLI Authentication Helper"
echo "============================"

# Wrangler (Cloudflare)
if ! wrangler whoami >/dev/null 2>&1; then
    echo "🌐 Authenticating Wrangler (Cloudflare)..."
    echo "This will open your browser for OAuth authentication."
    read -p "Press Enter to continue or Ctrl+C to skip..."
    wrangler login
fi

# Vercel
if ! vercel whoami >/dev/null 2>&1; then
    echo "▲ Authenticating Vercel..."
    echo "This will open your browser for OAuth authentication."
    read -p "Press Enter to continue or Ctrl+C to skip..."
    vercel login
fi

echo "✅ Authentication setup complete!"
echo "Run './cli-tools-setup.sh' to verify all tools are working."
EOF

    chmod +x "$HOME/cli-auth-helper.sh"
    echo -e "${GREEN}✓ Created authentication helper at $HOME/cli-auth-helper.sh${NC}"
}

# 创建OpenClaw agent初始化脚本
create_agent_init() {
    echo -e "\n${BLUE}Creating OpenClaw agent initialization script...${NC}"
    
    cat > "$HOME/openclaw-agent-init.sh" << 'EOF'
#!/bin/bash
# OpenClaw Agent CLI Tools Initialization
# Source this at the beginning of any OpenClaw session

# Load CLI tools PATH
if [ -f "$HOME/.cli-tools-path" ]; then
    source "$HOME/.cli-tools-path"
fi

# Verify critical tools are available
verify_cli_tools() {
    local missing_tools=()
    
    command -v supabase >/dev/null 2>&1 || missing_tools+=("supabase")
    command -v gh >/dev/null 2>&1 || missing_tools+=("gh")
    command -v wrangler >/dev/null 2>&1 || missing_tools+=("wrangler")
    command -v vercel >/dev/null 2>&1 || missing_tools+=("vercel")
    command -v gcloud >/dev/null 2>&1 || missing_tools+=("gcloud")
    command -v docker >/dev/null 2>&1 || missing_tools+=("docker")
    
    if [ ${#missing_tools[@]} -eq 0 ]; then
        echo "✅ All CLI tools are available"
        return 0
    else
        echo "❌ Missing CLI tools: ${missing_tools[*]}"
        echo "Run ~/cli-tools-setup.sh to fix PATH issues"
        return 1
    fi
}

# Set common environment variables
export SUPABASE_LOCAL_URL="http://127.0.0.1:54321"
export SUPABASE_LOCAL_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"

# Initialize tools
verify_cli_tools

echo "🤖 OpenClaw Agent CLI environment initialized"
EOF

    chmod +x "$HOME/openclaw-agent-init.sh"
    echo -e "${GREEN}✓ Created agent initialization script at $HOME/openclaw-agent-init.sh${NC}"
}

# 主执行函数
main() {
    setup_path
    check_tools
    check_auth
    create_auth_helper
    create_agent_init
    
    echo -e "\n${YELLOW}📋 Next Steps:${NC}"
    echo "1. Run authentication for missing tools: ${BLUE}~/cli-auth-helper.sh${NC}"
    echo "2. All OpenClaw agents can use: ${BLUE}source ~/openclaw-agent-init.sh${NC}"
    echo "3. Verify everything works: ${BLUE}./cli-tools-setup.sh${NC}"
    
    echo -e "\n${GREEN}🎉 CLI Tools setup complete!${NC}"
}

# 如果直接运行脚本
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi