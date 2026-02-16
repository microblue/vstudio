# VStudio 部署指南

## 🚀 部署方式

### 方式一：Cloudflare Pages (推荐)

1. **准备 Cloudflare 账户**
   ```bash
   npm install -g wrangler
   wrangler login
   ```

2. **部署到 Cloudflare Pages**
   ```bash
   npm run build
   npx wrangler pages deploy .svelte-kit/cloudflare --project-name vstudio
   ```

3. **设置环境变量** (在 Cloudflare Dashboard)
   - 访问 Cloudflare Pages 项目设置
   - 在 Environment variables 中添加：
     - `PUBLIC_SUPABASE_URL`: 你的 Supabase 项目 URL
     - `PUBLIC_SUPABASE_ANON_KEY`: Supabase Anon Key
     - (可选) AI API Keys

### 方式二：Vercel

1. **切换到 Vercel 适配器**
   ```bash
   npm install @sveltejs/adapter-vercel
   ```

2. **修改 svelte.config.js**
   ```javascript
   import adapter from '@sveltejs/adapter-vercel';
   
   export default {
     kit: {
       adapter: adapter()
     }
   };
   ```

3. **部署到 Vercel**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

### 方式三：GitHub + 自动部署

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **连接 Cloudflare Pages**
   - 在 Cloudflare Pages 中选择 "Connect to Git"
   - 选择你的 GitHub 仓库
   - 构建设置：
     - 构建命令: `npm run build`
     - 构建输出目录: `.svelte-kit/cloudflare`

## 📦 Supabase 生产环境配置

### 1. 创建 Supabase 云项目

1. 访问 [Supabase](https://supabase.com)
2. 创建新项目
3. 获取项目 URL 和 API Keys

### 2. 数据库迁移

```bash
# 本地链接到云项目
supabase link --project-ref your-project-ref

# 推送数据库结构
supabase db push

# 部署 Edge Functions
supabase functions deploy --no-verify-jwt
```

### 3. 设置环境变量

在你的部署平台中设置：

```bash
PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 可选 AI API Keys
ANTHROPIC_API_KEY=your_key
OPENAI_API_KEY=your_key
# ... 其他 API Keys
```

## 🔧 部署检查清单

- [ ] 项目构建成功 (`npm run build`)
- [ ] Supabase 云项目创建完成
- [ ] 数据库迁移完成
- [ ] Edge Functions 部署完成
- [ ] 环境变量配置完成
- [ ] DNS/域名设置完成

## 🌐 访问地址

部署完成后，你的 VStudio 将可以在以下地址访问：

- **Cloudflare Pages**: `https://vstudio.pages.dev`
- **Vercel**: `https://vstudio.vercel.app`
- **自定义域名**: 在部署平台中配置

## 📝 常见问题

### Q: 构建失败怎么办？
A: 检查 Node.js 版本 (>=18) 和依赖安装

### Q: 数据库连接失败？
A: 确认 Supabase URL 和 API Key 配置正确

### Q: AI 功能不工作？
A: 检查 AI API Keys 是否正确配置在环境变量中

---

**🎉 部署完成后，VStudio 就可以在线访问了！**