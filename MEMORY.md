# VStudio - 项目记忆

## 2026-02-13
- 完成功能规格说明书 v1.0（6 份文档），输出到 `doc/` 目录
- 基于 fuxi pipeline 的完整工作流设计：剧本→资产→分镜→关键帧→视频→音频→合成→导出
- 数据模型：14 个核心表，PostgreSQL + JSONB，兼容 fuxi 的 JSON 格式
- ~~技术栈决定：Next.js + FastAPI + PostgreSQL + Redis + Celery~~ → 已废弃
- **架构决策 (2026-02-13)：纯 Web + Supabase，无 Python 后台**
  - 所有 AI 能力通过第三方 HTTP API（Replicate/fal.ai/Anthropic/Fish Audio）
  - API Key 安全：前端 → Supabase Edge Function → 第三方 API
  - 异步任务：webhook 回调 → Edge Function → DB → Realtime
  - 将来自建 ComfyUI 也包装成 API，架构不变
- MVP 范围：单用户、第三方 AI API、完整 pipeline
- 下一步：开始前端项目搭建 + Supabase 初始化 + Edge Functions 开发
