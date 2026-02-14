# AGENTS.md - VStudio 项目

## 项目简介
AI 驱动的电影短剧创作平台（Web），将 fuxi 项目的 AI 短剧制作 pipeline 产品化。

## 工作目录
`/home/dz/vstudio`

## 核心文件
- `doc/` — 功能规格说明书（6 份文档）
- `doc/01-product-overview.md` — 产品概述
- `doc/02-workflow-design.md` — 工作流设计
- `doc/03-feature-spec.md` — 功能规格
- `doc/04-data-model.md` — 数据模型
- `doc/05-api-integration.md` — AI API 集成规范
- `doc/06-tech-stack.md` — 技术栈
- `doc/07-architecture-analysis.md` — 架构决策

## 技术栈
- **前端：** Next.js 15 + React 19 + TypeScript + shadcn/ui + TailwindCSS
- **后端：** 无自建后台 — 纯 Supabase (Auth/DB/Storage/Realtime/Edge Functions)
- **AI 服务：** 全部第三方 API — Replicate/fal.ai (图片/视频)、Anthropic (LLM)、Fish Audio (TTS)
- **API 代理：** Supabase Edge Functions (Deno) — 保护 API Key、webhook 回调
- **部署：** Vercel (前端) + Supabase (全托管)

## 架构原则
1. 纯 Web + Supabase，不需要自建 Python 后台
2. 所有 AI 能力通过第三方 HTTP API 调用
3. API Key 安全：前端 → Edge Function → 第三方 API
4. 异步任务：webhook 回调 → Edge Function → DB → Realtime 推送前端
5. 将来自建 ComfyUI 也包装成 API，架构不变

## 关联项目
- **fuxi** (`/home/dz/fuxi`) — AI 短剧制作 pipeline（VStudio 的核心引擎）

## 规则
- 修改代码后必须测试
- 保持与 fuxi pipeline 的数据格式兼容（shots.json, keyframes.json 等）
- AI 服务都通过 HTTP API 调用，不嵌入模型
