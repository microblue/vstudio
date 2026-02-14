# AGENTS.md - VStudio 项目

## 项目简介
AI 驱动的电影短剧创作平台（Web），完整的 AI 短剧制作 pipeline 产品化。

## 工作目录
`/home/dz/vstudio`

## 核心文件
- `doc/` — 功能规格说明书（7 份文档）+ LLM prompt 模板（5 个）
- `doc/01-product-overview.md` — 产品概述
- `doc/02-workflow-design.md` — 工作流设计
- `doc/03-feature-spec.md` — 功能规格
- `doc/04-data-model.md` — 数据模型
- `doc/05-api-integration.md` — AI API 集成规范
- `doc/06-tech-stack.md` — 技术栈
- `doc/07-architecture-analysis.md` — 架构决策

## 技术栈
- **前端：** SvelteKit + Svelte 5 + TypeScript + shadcn-svelte + TailwindCSS
- **后端：** 无自建后台 — 纯 Supabase (Auth/DB/Storage/Realtime/Edge Functions)
- **AI 服务：** 全部第三方 API — Replicate/fal.ai (图片/视频)、Anthropic (LLM)、Fish Audio (TTS)
- **API 代理：** Supabase Edge Functions (Deno) — 保护 API Key、webhook 回调
- **部署：** Vercel/Cloudflare Pages (前端) + Supabase (全托管)

## 架构原则
1. 纯 Web + Supabase，不需要自建 Python 后台
2. 所有 AI 能力通过第三方 HTTP API 调用
3. API Key 安全：前端 → Edge Function → 第三方 API
4. 异步任务：webhook 回调 → Edge Function → DB → Realtime 推送前端
5. **不使用本地 ComfyUI**，图片/视频生成全部通过 HTTP 调用外部服务（付费或自建远程服务均可）

## 数据设计原则（2026-02-14）
1. **结构化字段 + JSONB 灵活属性** — 每张表都采用此混合模式
2. 需要查询/索引/排序/JOIN 的字段 → 独立结构化列
3. 扩展属性、AI 生成参数、灵活配置 → JSONB 列
4. 每张表至少保留一个 `meta JSONB DEFAULT '{}'` 用于未来扩展
5. 统一数据库设计文档：`doc/database-design.md`

## 开发指南

### Supabase 初始化

```bash
# 1. 安装 CLI
pnpm add -g supabase

# 2. 初始化（在项目根目录）
supabase init

# 3. 关联远端项目
supabase link --project-ref YOUR_PROJECT_REF

# 4. 启动本地开发环境
supabase start
# 输出 API URL、anon key、service_role key → 写入 .env

# 5. 执行数据库迁移
supabase db push          # 推送本地 migrations 到远端
# 或
supabase migration up     # 本地执行迁移

# 6. 生成 TypeScript 类型
supabase gen types typescript --local > src/lib/database.types.ts

# 7. Edge Functions 本地开发
supabase functions serve   # 本地启动所有 Edge Functions

# 8. 部署 Edge Functions
supabase functions deploy generate-image
supabase functions deploy generate-video
supabase functions deploy llm-proxy
supabase functions deploy screenplay-generate
supabase functions deploy tts-proxy
supabase functions deploy webhook-callback
supabase functions deploy render-compose

# 9. 设置 Edge Function 环境变量（见 .env.example）
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set REPLICATE_API_TOKEN=r8_...
# ...其余变量同理
```

### 迁移文件规范

```
supabase/migrations/
├── 20260214_001_create_projects.sql
├── 20260214_002_create_episodes.sql
├── 20260214_003_create_scripts.sql
├── 20260214_004_create_characters.sql
├── 20260214_005_create_locations.sql
├── 20260214_006_create_props.sql
├── 20260214_007_create_shots.sql
├── 20260214_008_create_dialogues.sql
├── 20260214_009_create_keyframes.sql
├── 20260214_010_create_keyframe_candidates.sql
├── 20260214_011_create_shot_videos.sql
├── 20260214_012_create_audio_clips.sql
├── 20260214_013_create_voice_profiles.sql
├── 20260214_014_create_tasks.sql
├── 20260214_015_create_screenplay_drafts.sql
├── 20260214_016_create_indexes.sql
├── 20260214_017_create_rls_policies.sql
└── 20260214_018_seed_data.sql
```

### Seed Data

`supabase/seed.sql` 包含：
- 测试用户（通过 `auth.users` 或 Supabase Dashboard 创建）
- 示例项目 + 剧集
- 示例剧本（用于验证 pipeline）

### 环境变量

见 `.env.example`，详细说明见 `doc/06-tech-stack.md` § 7。

---

## 规则
- 修改代码后必须测试
- AI 服务都通过 HTTP API 调用，不嵌入模型
