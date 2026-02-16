# 🚀 Cloudflare Pages 部署指南

## 方法一：Wrangler CLI 部署 (推荐)

### 1. 安装 Wrangler CLI
```bash
npm install -g wrangler
```

### 2. 登录 Cloudflare
```bash
wrangler login
```
这会在浏览器中打开 Cloudflare 登录页面，授权后回到终端。

### 3. 部署项目
```bash
cd vstudio
npm run build
wrangler pages deploy .svelte-kit/cloudflare --project-name vstudio
```

### 4. 设置环境变量
```bash
# 设置生产环境变量
wrangler pages secret put PUBLIC_SUPABASE_URL
wrangler pages secret put PUBLIC_SUPABASE_ANON_KEY

# 可选：AI API Keys
wrangler pages secret put ANTHROPIC_API_KEY
wrangler pages secret put OPENAI_API_KEY
```

## 方法二：GitHub 自动部署

### 1. 推送代码到 GitHub
确保代码已推送到 GitHub 仓库：
```bash
git push origin master
```

### 2. 在 Cloudflare Pages 中连接 GitHub
1. 访问 [Cloudflare Pages](https://pages.cloudflare.com/)
2. 点击 "Create a project"
3. 选择 "Connect to Git"
4. 选择 GitHub 仓库 `microblue/vstudio`

### 3. 配置构建设置
```
Framework preset: SvelteKit
Build command: npm run build
Build output directory: .svelte-kit/cloudflare
Root directory: (leave empty)
```

### 4. 设置环境变量
在 Cloudflare Pages 项目设置中添加：
```
PUBLIC_SUPABASE_URL = https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 方法三：本地构建 + 拖拽部署

### 1. 构建项目
```bash
npm run build
```

### 2. 压缩构建文件
```bash
cd .svelte-kit/cloudflare
zip -r vstudio-build.zip *
```

### 3. 手动上传
1. 访问 [Cloudflare Pages](https://pages.cloudflare.com/)
2. 点击 "Upload assets"
3. 拖拽 `vstudio-build.zip` 文件
4. 设置项目名称为 `vstudio`

## 🔧 环境变量配置

### 必需环境变量
```env
PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 可选 AI 功能环境变量
```env
ANTHROPIC_API_KEY=sk-ant-your-key
OPENAI_API_KEY=sk-your-key
DEEPSEEK_API_KEY=sk-your-key
REPLICATE_API_TOKEN=r8_your-token
FAL_API_KEY=your-fal-key
FISH_AUDIO_API_KEY=your-fish-key
```

## 🌐 Supabase 云项目设置

### 1. 创建 Supabase 项目
1. 访问 [supabase.com](https://supabase.com)
2. 点击 "New project"
3. 选择组织和区域
4. 设置数据库密码

### 2. 获取 API 密钥
在项目设置 → API 中获取：
- Project URL
- anon public key
- service_role key (仅后端使用)

### 3. 数据库迁移
```bash
# 本地连接到云项目
supabase link --project-ref your-project-ref

# 推送数据库结构
supabase db push

# 部署 Edge Functions (可选)
supabase functions deploy --no-verify-jwt
```

## 🚀 部署完成验证

部署成功后，你的 VStudio 将在以下地址可用：
- **预览地址**: `https://vstudio-xxx.pages.dev`
- **自定义域名**: 可在 Cloudflare Pages 设置中配置

### 功能测试清单
- [ ] 首页加载正常
- [ ] 登录功能工作正常 (test@vstudio.ai / password123)
- [ ] Dashboard 显示正常
- [ ] 可以创建新项目
- [ ] AI 剧本创作功能可用 (需配置 AI API Keys)

## 🔧 常见问题

### Q: 构建失败怎么办？
A: 检查 Node.js 版本 (>=18) 和构建命令是否正确

### Q: 页面显示 404？
A: 确认构建输出目录为 `.svelte-kit/cloudflare`

### Q: 环境变量不生效？
A: 确认变量名称正确，并且在 Cloudflare Pages 设置中配置

### Q: AI 功能不工作？
A: 检查是否配置了对应的 API Keys，并且 API Keys 有效

## 📊 性能优化

Cloudflare Pages 自动提供：
- ✅ 全球 CDN 分发
- ✅ HTTP/3 和 Brotli 压缩
- ✅ 自动缓存优化
- ✅ DDoS 保护
- ✅ 免费 SSL 证书

---

**🎉 部署完成！VStudio 现在可以通过 Cloudflare Pages 在全球范围内快速访问！**