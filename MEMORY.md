# VStudio - 项目记忆

## 2026-02-13
- 完成功能规格说明书 v1.0（6 份文档），输出到 `doc/` 目录
- 完整工作流设计：剧本→资产→分镜→关键帧→视频→音频→合成→导出
- 数据模型：14 个核心表，PostgreSQL + JSONB
- ~~技术栈决定：Next.js + FastAPI + PostgreSQL + Redis + Celery~~ → 已废弃
- **架构决策 (2026-02-13)：纯 Web + Supabase，无 Python 后台**
  - 所有 AI 能力通过第三方 HTTP API（Replicate/fal.ai/Anthropic/Fish Audio）
  - API Key 安全：前端 → Supabase Edge Function → 第三方 API
  - 异步任务：webhook 回调 → Edge Function → DB → Realtime
  - **不调用本地 ComfyUI**，图片/视频生成全部 HTTP 调用外部服务（付费 API 或自建远程服务）
- MVP 范围：单用户、第三方 AI API、完整 pipeline
- 下一步：开始前端项目搭建 + Supabase 初始化 + Edge Functions 开发

## 2026-02-14
- **技术栈决策：前端从 Next.js + React 切换为 SvelteKit + Svelte 5**
  - UI 组件库：shadcn/ui → shadcn-svelte
  - 状态管理：zustand → Svelte Stores (runes)
  - 拖拽：@dnd-kit → svelte-dnd-action
  - 部署：Vercel 或 Cloudflare Pages 均可
  - 更新了 AGENTS.md、doc/06-tech-stack.md、doc/07-architecture-analysis.md
- **架构决策更新：不使用本地 ComfyUI 作为图片/视频生成后端**
  - 所有生成类任务通过 HTTP 调用外部服务（Replicate、fal.ai 等付费 API，或自己搭建的远程服务）
  - 本机不需要 GPU/ComfyUI 环境，降低部署复杂度
  - 与现有 Supabase Edge Function 代理架构完全一致，无需额外适配
- **新增功能规格：剧本创作模块** (`doc/screenplay-creation.md`)
  - 用户输入故事大纲 → LLM 生成专业剧本 → 采用后进入编辑器精修
  - 支持多模型选择：Claude Sonnet/Opus、GPT-4o、DeepSeek R1、自定义
  - Streaming SSE 输出，版本管理，多版本对比
  - 新增数据表 `screenplay_drafts`，新增 Edge Function `screenplay-generate`
  - 插入工作流阶段 1 之前，作为创作起点
