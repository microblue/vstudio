# 🛠️ OpenClaw Agents CLI Tools 统一配置指南

## 📋 概述

这个配置让**所有OpenClaw agents**都能无缝使用已安装的CLI工具和认证，无需重复登录。

## ✅ 已配置的CLI工具

| 工具 | 状态 | 功能 | 认证状态 |
|------|------|------|----------|
| **Supabase CLI** | ✅ 可用 | 数据库管理、Edge Functions | ✅ 本地环境运行 |
| **GitHub CLI** | ✅ 可用 | 仓库管理、PR/Actions | ✅ 已认证 (microblue) |
| **Wrangler CLI** | ✅ 可用 | Cloudflare Pages/Workers | ✅ 已认证 |
| **Google Cloud CLI** | ✅ 可用 | GCP服务管理 | ✅ 已认证 (microblue@gmail.com) |
| **Vercel CLI** | ✅ 可用 | 现代Web部署 | ⚠️ 需要认证 |
| **Docker** | ✅ 可用 | 容器化部署 | ✅ 守护进程运行 |

## 🚀 OpenClaw Agent 使用方法

### 在任何OpenClaw会话开始时运行：

```bash
source ~/openclaw-agent-init.sh
```

这将：
- ✅ 加载所有CLI工具到PATH
- ✅ 设置必要的环境变量
- ✅ 验证工具可用性
- ✅ 初始化Supabase本地环境变量

### 验证所有工具状态：

```bash
./verify-cli-tools.sh
```

## 🔑 一次性认证设置

### 完成剩余工具认证：
```bash
chmod +x complete-auth.sh
./complete-auth.sh
```

### 手动认证单个工具：
```bash
# Vercel (如果需要)
vercel login

# 如果需要重新认证其他工具
wrangler login
gh auth login
gcloud auth login
```

## 📁 配置文件位置

- **PATH配置**: `~/.cli-tools-path`
- **Agent初始化**: `~/openclaw-agent-init.sh`
- **认证助手**: `~/cli-auth-helper.sh`
- **验证脚本**: `./verify-cli-tools.sh`

## 💡 常用命令示例

### VStudio项目部署

```bash
# 初始化环境
source ~/openclaw-agent-init.sh

# Supabase管理
supabase status
supabase functions deploy screenplay-generate

# Cloudflare Pages部署
pnpm build
wrangler pages deploy .svelte-kit/cloudflare --project-name vstudio

# GitHub仓库管理
gh repo view
gh pr create --title "New feature" --body "Description"

# Google Cloud部署
gcloud app deploy
gcloud projects list

# Vercel快速部署
vercel --prod

# Docker容器化
docker build -t vstudio .
docker run -p 3000:3000 vstudio
```

## 🔧 故障排查

### 工具找不到：
```bash
# 重新加载PATH
source ~/openclaw-agent-init.sh

# 或手动修复PATH
source ~/.cli-tools-path
```

### 认证失效：
```bash
# 检查认证状态
gh auth status
wrangler whoami  
vercel whoami
gcloud auth list

# 重新认证
gh auth login
wrangler login
vercel login
```

### Supabase本地环境：
```bash
# 启动本地环境
supabase start

# 检查状态
supabase status

# 重置环境
supabase stop
supabase start
```

## 🎯 OpenClaw Agent最佳实践

### 1. 会话开始模板
```bash
# 每个OpenClaw会话开始时
source ~/openclaw-agent-init.sh

# 验证关键工具（可选）
command -v supabase >/dev/null && echo "✅ Supabase ready"
command -v gh >/dev/null && echo "✅ GitHub ready" 
command -v wrangler >/dev/null && echo "✅ Wrangler ready"
```

### 2. 部署前检查
```bash
# 验证所有工具状态
./verify-cli-tools.sh

# 检查认证状态
gh auth status && echo "GitHub OK"
wrangler whoami && echo "Wrangler OK"
```

### 3. 环境变量
```bash
# 这些已经自动设置
echo $SUPABASE_LOCAL_URL      # http://127.0.0.1:54321
echo $SUPABASE_LOCAL_ANON_KEY # 本地开发密钥
```

## 🔄 更新和维护

### 更新CLI工具：
```bash
# Supabase
supabase upgrade

# Wrangler & Vercel
npm update -g wrangler vercel

# GitHub CLI
sudo apt update && sudo apt upgrade gh

# Google Cloud CLI
gcloud components update
```

### 重新配置：
```bash
# 重新运行设置
./cli-tools-setup.sh

# 重新初始化
source ~/openclaw-agent-init.sh
```

## 📞 支持

如果遇到问题：

1. **工具路径问题**: 运行 `./cli-tools-setup.sh`
2. **认证问题**: 运行 `./complete-auth.sh` 
3. **验证状态**: 运行 `./verify-cli-tools.sh`
4. **环境初始化**: 运行 `source ~/openclaw-agent-init.sh`

---

**✨ 现在所有OpenClaw agents都可以无缝使用这些CLI工具了！** 

每个新的agent会话只需要运行 `source ~/openclaw-agent-init.sh` 就能获得完整的CLI环境。