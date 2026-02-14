# VStudio — TODO

## 待办
- [x] 技术栈确认：SvelteKit + Svelte 5 + TypeScript + shadcn-svelte + TailwindCSS + Supabase
- [ ] SvelteKit 项目初始化（`pnpm create svelte@latest`、TailwindCSS、shadcn-svelte、Supabase client）
- [ ] 产品调研和设计
- [ ] 剧本创作模块开发（doc/screenplay-creation.md）
  - [ ] P0: 大纲表单 + Claude Sonnet/Opus 生成 + streaming 输出 + 采用到编辑器
  - [ ] P1: 多模型支持（GPT-4o、DeepSeek）+ 版本管理
  - [ ] P2: 版本对比视图 + 自定义模型 endpoint
  - [ ] Edge Function: screenplay-generate（系统 prompt + 模型路由）
  - [ ] 数据表: screenplay_drafts
  - [ ] 前端组件 (Svelte): ScreenplayCreator, OutlineForm, ModelSelector, StreamingPreview
