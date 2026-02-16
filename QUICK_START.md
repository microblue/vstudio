# 🚀 VStudio 快速启动指南

## 环境恢复 (下次开发)

```bash
# 1. 启动 Supabase 本地实例
supabase start

# 2. 启动前端开发服务器  
pnpm dev --host

# 完成！访问 http://localhost:5173
```

## 服务地址

- **前端应用**: http://localhost:5173
- **Supabase Studio**: http://localhost:54323  
- **Supabase API**: http://127.0.0.1:54321
- **数据库**: postgresql://postgres:postgres@127.0.0.1:54322/postgres

## 开发工具

### 数据库操作
```bash
# 连接数据库
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres"

# 查看所有表
\dt

# 查看RLS策略
SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public';
```

### TypeScript类型更新
```bash
# 重新生成数据库类型 (数据库结构变更后)
supabase gen types typescript --local > src/lib/database-generated.types.ts
```

### Edge Functions测试  
```bash
# 部署单个函数
supabase functions deploy screenplay-generate

# 查看函数日志
supabase functions logs screenplay-generate
```

## 测试用户创建

1. 访问 http://localhost:54323 (Supabase Studio)
2. 进入 **Authentication > Users**
3. 点击 **Add User** 创建测试用户
4. 记录用户ID用于数据操作

## 下一步开发

### 当前优先级
1. **剧本创作界面** - 新功能模块
2. **用户认证流程** - 注册/登录完善  
3. **项目管理界面** - CRUD操作

### 技术要点
- 所有API调用通过Edge Functions代理
- 数据操作需要用户认证 (RLS策略)
- 充分利用TypeScript类型安全

准备好开始阶段二开发！ 💪