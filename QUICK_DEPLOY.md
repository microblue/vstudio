# 🚀 VStudio 一键部署

## 立即部署 (1分钟完成)

### 方法一：Vercel (推荐)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdawson1108%2Fvstudio&env=PUBLIC_SUPABASE_URL,PUBLIC_SUPABASE_ANON_KEY&envDescription=需要%20Supabase%20项目%20URL%20和%20API%20Key&project-name=vstudio&repository-name=vstudio)

1. 点击上方按钮
2. 连接 GitHub 账号
3. 设置环境变量（见下方）
4. 点击 Deploy

### 方法二：Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/dawson1108/vstudio)

1. 点击按钮部署
2. 在 Site settings → Environment variables 添加配置

### 方法三：命令行部署

```bash
# 克隆项目
git clone https://github.com/dawson1108/vstudio.git
cd vstudio

# 运行部署脚本
./deploy.sh
```

## 📝 环境变量配置

在部署平台中设置以下环境变量：

### 必需配置
```
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 可选配置 (AI功能)
```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
DEEPSEEK_API_KEY=sk-...
REPLICATE_API_TOKEN=r8_...
FAL_API_KEY=...
FISH_AUDIO_API_KEY=...
```

## 🗄️ 快速 Supabase 设置

1. 访问 [supabase.com](https://supabase.com)
2. 创建新项目
3. 在 Settings → API 获取：
   - Project URL
   - anon public key
4. 在 SQL Editor 运行数据库迁移（见 `supabase/migrations/`）

## ✅ 部署检查

部署完成后，访问你的网站：
- [ ] 首页加载正常
- [ ] 可以访问登录页面
- [ ] 使用演示账号 (test@vstudio.ai / password123) 登录
- [ ] Dashboard 显示正常

## 📞 需要帮助？

如果遇到问题：
1. 检查环境变量是否正确设置
2. 查看部署平台的错误日志
3. 确认 Supabase 项目配置正确

---

**🎉 部署成功后，VStudio 就可以在线使用了！**

演示地址：`https://your-project.vercel.app`