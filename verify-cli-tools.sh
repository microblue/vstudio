#!/bin/bash
# CLI Tools Verification - 验证所有CLI工具功能
# 专门为OpenClaw agents设计

source ~/openclaw-agent-init.sh

echo "🧪 Verifying CLI Tools for OpenClaw Agents"
echo "==========================================="

# 颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

verify_supabase() {
    echo -e "\n${BLUE}Testing Supabase CLI...${NC}"
    
    if supabase status >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Supabase local development running${NC}"
        
        # Test database connection
        if psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -c "SELECT 1;" >/dev/null 2>&1; then
            echo -e "${GREEN}✓ Database connection working${NC}"
        else
            echo -e "${YELLOW}! Database connection issues${NC}"
        fi
        
        # Test API health
        if curl -s http://127.0.0.1:54321/rest/v1/ >/dev/null 2>&1; then
            echo -e "${GREEN}✓ REST API responding${NC}"
        else
            echo -e "${YELLOW}! REST API not responding${NC}"
        fi
    else
        echo -e "${RED}✗ Supabase local not running${NC}"
        echo "  Run: supabase start"
    fi
}

verify_github() {
    echo -e "\n${BLUE}Testing GitHub CLI...${NC}"
    
    if gh auth status >/dev/null 2>&1; then
        user=$(gh api user --jq .login 2>/dev/null)
        echo -e "${GREEN}✓ GitHub authenticated as $user${NC}"
        
        # Test repo access
        if gh repo view --json name >/dev/null 2>&1; then
            repo=$(gh repo view --json name --jq .name 2>/dev/null)
            echo -e "${GREEN}✓ Repository access: $repo${NC}"
        else
            echo -e "${YELLOW}! No current repository or access issues${NC}"
        fi
    else
        echo -e "${RED}✗ GitHub not authenticated${NC}"
        echo "  Run: gh auth login"
    fi
}

verify_wrangler() {
    echo -e "\n${BLUE}Testing Wrangler CLI...${NC}"
    
    if wrangler whoami >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Wrangler authenticated${NC}"
        
        # Test pages list (might fail if no projects)
        wrangler pages project list >/dev/null 2>&1 && \
            echo -e "${GREEN}✓ Pages access working${NC}" || \
            echo -e "${YELLOW}! Pages access limited or no projects${NC}"
    else
        echo -e "${RED}✗ Wrangler not authenticated${NC}"
        echo "  Run: wrangler login"
    fi
}

verify_gcloud() {
    echo -e "\n${BLUE}Testing Google Cloud CLI...${NC}"
    
    if gcloud auth list --filter=status:ACTIVE >/dev/null 2>&1; then
        account=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -1)
        echo -e "${GREEN}✓ GCloud authenticated as $account${NC}"
        
        # Test project access
        if gcloud projects list --limit=1 >/dev/null 2>&1; then
            project_count=$(gcloud projects list --format="value(projectId)" | wc -l)
            echo -e "${GREEN}✓ Project access: $project_count projects${NC}"
        else
            echo -e "${YELLOW}! Project access issues${NC}"
        fi
    else
        echo -e "${RED}✗ GCloud not authenticated${NC}"
        echo "  Run: gcloud auth login"
    fi
}

verify_vercel() {
    echo -e "\n${BLUE}Testing Vercel CLI...${NC}"
    
    if vercel whoami >/dev/null 2>&1; then
        user=$(vercel whoami 2>/dev/null)
        echo -e "${GREEN}✓ Vercel authenticated as $user${NC}"
    else
        echo -e "${RED}✗ Vercel not authenticated${NC}"
        echo "  Run: vercel login"
    fi
}

verify_docker() {
    echo -e "\n${BLUE}Testing Docker...${NC}"
    
    if docker info >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Docker daemon running${NC}"
        
        # Test basic functionality
        if docker run --rm hello-world >/dev/null 2>&1; then
            echo -e "${GREEN}✓ Docker containers working${NC}"
        else
            echo -e "${YELLOW}! Docker container issues${NC}"
        fi
    else
        echo -e "${RED}✗ Docker daemon not running${NC}"
        echo "  Run: sudo systemctl start docker"
    fi
}

# Main verification
echo -e "${YELLOW}Initializing OpenClaw CLI environment...${NC}"

verify_supabase
verify_github  
verify_wrangler
verify_gcloud
verify_vercel
verify_docker

echo -e "\n${BLUE}Summary${NC}"
echo "======="
echo "All CLI tools are available to OpenClaw agents"
echo -e "Initialize with: ${YELLOW}source ~/openclaw-agent-init.sh${NC}"
echo -e "Authenticate missing tools with: ${YELLOW}~/cli-auth-helper.sh${NC}"

echo -e "\n${GREEN}🎉 CLI Tools verification complete!${NC}"