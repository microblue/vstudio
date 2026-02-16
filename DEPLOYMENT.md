# VStudio 部署指南

## 阶段一完成状态 ✅

基础设施已完善，包含：
- 完整数据库架构 (15张表)
- 5个核心Edge Functions
- TypeScript类型定义
- 环境变量配置

## 下一步部署流程

### 1. Supabase 项目设置

```bash
# 1. 创建 Supabase 项目
# 访问 https://supabase.com/dashboard
# 创建新项目，记录 Project URL 和 API Keys

# 2. 本地链接项目
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# 3. 推送数据库schema
supabase db push

# 4. 添加种子数据 (可选)
supabase db reset --with-seed
```

### 2. 环境变量配置

```bash
# 1. 复制环境变量模板
cp .env.example .env

# 2. 填写 Supabase 配置
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# 3. 配置 AI 服务 API Keys
ANTHROPIC_API_KEY=sk-ant-xxx
REPLICATE_API_TOKEN=r8_xxx
# ... 其余API Keys
```

### 3. Edge Functions 部署

```bash
# 设置 Supabase secrets (生产环境API Keys)
supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxx
supabase secrets set REPLICATE_API_TOKEN=r8_xxx
supabase secrets set FISH_AUDIO_API_KEY=xxx
# ... 设置所有必要的API Keys

# 部署所有 Edge Functions
supabase functions deploy generate-image
supabase functions deploy screenplay-generate
supabase functions deploy llm-proxy
supabase functions deploy tts-proxy
supabase functions deploy webhook-callback
```

### 4. 前端开发服务器

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 5. 生产部署

```bash
# 构建项目
pnpm build

# 部署到 Vercel (推荐)
vercel --prod

# 或部署到 Cloudflare Pages
pnpm pages:deploy
```

## 验证清单

- [ ] Supabase项目创建并链接
- [ ] 数据库迁移成功 (15张表)
- [ ] RLS策略生效 (用户只能访问自己的数据)
- [ ] Edge Functions部署成功 (5个函数)
- [ ] API Keys配置正确
- [ ] 前端可以连接Supabase
- [ ] 认证流程正常
- [ ] 种子数据加载 (可选)

## 下一阶段：核心功能开发

完成部署后，可以开始阶段二：
1. 剧本创作界面 (优先级最高)
2. 项目管理功能
3. 基础资产管理

## 常见问题

### Q: Edge Function 部署失败
A: 检查 API Keys 是否正确设置在 Supabase secrets 中

### Q: 数据库连接失败  
A: 确认 .env 文件中的 Supabase URL 和 Keys 正确

### Q: RLS 策略阻止访问
A: 确保用户已登录，检查 auth.users 表中是否有对应记录

## 监控和日志

- Supabase Dashboard: 数据库、认证、存储监控
- Edge Functions 日志: Supabase Dashboard → Functions → Logs
- 前端错误: 浏览器开发者工具 + Vercel Analytics

---

**当前状态**: 基础设施完成，准备部署测试 🚀