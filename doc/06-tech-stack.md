# VStudio — 技术栈

## 1. 架构总览

```
┌─────────────────────────────────────────────────────────┐
│                     客户端 (Browser)                     │
│  Next.js 15 (App Router) + React 19 + TypeScript        │
│  TailwindCSS + shadcn/ui + zustand                      │
│  Supabase Client (Auth, DB, Storage, Realtime)          │
└─────────────┬──────────────────────┬────────────────────┘
              │ 读写数据              │ AI 生成任务
              ▼                      ▼
┌──────────────────────┐  ┌──────────────────────────────┐
│     Supabase         │  │  Supabase Edge Functions     │
│  ├── Auth (JWT)      │  │  ├── /generate-image         │
│  ├── PostgreSQL+RLS  │  │  ├── /generate-video         │
│  ├── Storage         │  │  ├── /llm-proxy              │
│  └── Realtime        │  │  ├── /tts-proxy              │
│                      │  │  └── /webhook-callback       │
└──────────────────────┘  └──────────┬───────────────────┘
                                     │ HTTP API
                          ┌──────────▼───────────────────┐
                          │ 第三方 AI 服务                 │
                          │ ├── Replicate (图片/视频)     │
                          │ ├── fal.ai (图片/视频)        │
                          │ ├── Anthropic (LLM)           │
                          │ └── Fish Audio (TTS)          │
                          └──────────────────────────────┘
```

**核心原则：**
- **纯 Web + Supabase，无自建后台**
- 前端直连 Supabase 处理所有 CRUD
- 所有 AI 能力通过第三方 HTTP API 调用（Replicate、fal.ai 等）
- API Key 安全：前端 → Supabase Edge Function → 第三方 API
- 异步任务：第三方 API webhook 回调 → Edge Function → 写入 DB → Realtime 推送前端
- 即使将来自建 ComfyUI，也包装成 API 服务，对 VStudio 来说和第三方 API 无区别

---

## 2. 前端

| 项目 | 选择 | 理由 |
|------|------|------|
| 框架 | **Next.js 15** (App Router) | React 生态最成熟，SSR/SSG，AI 工具链完善 |
| 语言 | **TypeScript** | 类型安全，AI 代码生成质量高 |
| UI 库 | **shadcn/ui** + **TailwindCSS** | 可定制、轻量、AI 友好 |
| 状态管理 | **zustand** | 轻量、简单 |
| Supabase | **@supabase/supabase-js** | Auth、DB 查询、Storage、Realtime 一站式 |
| 编辑器 | **CodeMirror 6** 或 **Monaco** | Markdown 编辑 |
| 视频播放 | **video.js** 或原生 `<video>` | 视频预览 |
| 拖拽 | **@dnd-kit/core** | 镜头排序 |

### 关键前端组件

| 组件 | 说明 |
|------|------|
| `ScriptEditor` | Markdown 编辑器 + AI 辅助面板 |
| `AssetCard` | 资产卡片（图片 + 元数据） |
| `ShotTimeline` | 横向镜头时间轴（可拖拽） |
| `ShotEditor` | 镜头详情编辑表单 |
| `KeyframeGrid` | 关键帧候选图网格 |
| `VideoPreview` | 视频播放预览 |
| `ComposeTimeline` | 多轨时间轴（视频/音频/字幕） |
| `TaskQueue` | 任务队列状态面板 |
| `ImageSelector` | 多候选图选择器 |

---

## 3. Supabase

| 功能 | 用途 |
|------|------|
| **Auth** | 用户注册/登录，JWT，RLS 权限 |
| **PostgreSQL** | 所有业务数据（项目、剧本、镜头、资产、任务） |
| **RLS** | 行级安全策略，用户只能访问自己的数据 |
| **Storage** | 图片、视频、音频文件存储（公开 bucket 或签名 URL） |
| **Realtime** | 监听 tasks 表变化，前端实时更新生成进度 |
| **Edge Functions** | AI API 代理层，保护 API Key，接收 webhook 回调 |

### Edge Functions 职责

| 函数 | 用途 |
|------|------|
| `generate-image` | 代理调用 Replicate/fal.ai 图片生成 API |
| `generate-video` | 代理调用 Replicate/fal.ai 视频生成 API |
| `llm-proxy` | 代理调用 Anthropic/OpenAI LLM API |
| `tts-proxy` | 代理调用 Fish Audio TTS API |
| `webhook-callback` | 接收第三方 API 异步回调，更新 DB + Storage |

---

## 4. 第三方 AI 服务

| 服务 | 提供商 | 用途 |
|------|--------|------|
| 图片生成 (T2I) | **Replicate** / **fal.ai** | Flux 模型生成资产参考图、关键帧 |
| 视频生成 (I2V) | **Replicate** / **fal.ai** | 关键帧 → 视频 |
| LLM | **Anthropic** (Claude) | 剧本解析、分镜生成、AI 辅助写作 |
| TTS | **Fish Audio** | 角色配音 |
| TTS (备选) | **Edge TTS** (via Edge Function) | 免费备选 |

### 异步任务流程

```
1. 前端提交生成请求 → Edge Function
2. Edge Function 调用第三方 API（带 webhook URL）
3. Edge Function 创建 task 记录（status=pending），返回 task_id
4. 前端通过 Supabase Realtime 监听 task 状态变化
5. 第三方 API 完成后 webhook 回调 → Edge Function (webhook-callback)
6. webhook-callback: 下载结果 → 上传 Storage → 更新 task 状态为 done
7. 前端实时收到更新，显示结果
```

### 视频合成

视频合成（FFmpeg 类操作）方案：
- **MVP：** 使用云端视频处理 API（如 Creatomate、Shotstack）
- **备选：** 浏览器端 FFmpeg.wasm（轻量级操作）
- **将来：** 自建 FFmpeg 服务包装成 API

---

## 5. 文件存储

| 类型 | 存储位置 | 说明 |
|------|----------|------|
| 参考图/关键帧 | **Supabase Storage** | 通过 URL 访问 |
| 生成视频 | **Supabase Storage** | 通过 URL 访问 |
| 音频/配音 | **Supabase Storage** | 通过 URL 访问 |
| 最终输出 | **Supabase Storage** | 导出下载 |

所有文件统一存储在 Supabase Storage，无本地文件系统依赖。

---

## 6. 部署

```
Vercel (免费):
  └── Next.js 前端

Supabase (免费额度):
  ├── Auth + DB + Storage + Realtime
  └── Edge Functions (AI API 代理 + webhook)
```

**零运维架构**：无需管理服务器、Docker、GPU 机器。全部托管在 Vercel + Supabase。

---

## 7. 开发环境

| 工具 | 用途 |
|------|------|
| **pnpm** | 前端包管理 |
| **Supabase CLI** | 本地开发、迁移、Edge Functions 开发、类型生成 |
| **Vitest** | 前端测试 |
| **ESLint + Prettier** | 前端规范 |
| **Deno** | Edge Functions 本地开发 |

---

## 8. 关键技术决策

### 8.1 为什么纯 Supabase，不要 Python 后台？
- **简单**：只维护前端 + Edge Functions，无后端服务器
- **零运维**：Vercel + Supabase 全托管
- **成本低**：免费额度对 MVP 够用
- **开发快**：前端一把梭，不用维护两套代码
- 所有"重活"（图片/视频生成）交给第三方 API，自己不跑 GPU

### 8.2 为什么用第三方 AI API 而不是本地 ComfyUI？
- 本地 ComfyUI 需要 Python 后台调度 + GPU 机器常驻
- 第三方 API 即用即付，无需管理基础设施
- Replicate/fal.ai 已有现成的 Flux、视频生成模型
- 将来如需自建 ComfyUI，包装成 API 服务即可，架构无需改动

### 8.3 API Key 安全
- 前端不直接调用第三方 API（泄露 Key 风险）
- 所有调用经过 Supabase Edge Function 代理
- API Key 存储在 Supabase Edge Function 环境变量中
- Edge Function 验证 JWT，确保只有登录用户可调用

### 8.4 异步任务为什么用 webhook？
- 图片/视频生成耗时 30s-5min，超过 Edge Function 执行限制
- 第三方 API（Replicate/fal.ai）原生支持 webhook 回调
- 流程：提交任务 → 立即返回 → webhook 回调更新结果
- 前端通过 Supabase Realtime 实时获取状态

---

## 9. 性能预估

| 操作 | 预计耗时 | 说明 |
|------|----------|------|
| 页面加载 | <1s | Vercel CDN |
| LLM 资产提取 | 15-30s | Anthropic API |
| LLM 分镜生成 | 20-40s | Anthropic API |
| 单张关键帧 | 30-90s | Replicate/fal.ai |
| 单个镜头视频 | 2-5min | Replicate/fal.ai |
| TTS 单条 | 2-5s | Fish Audio API |
| 视频合成 | 30-120s | 云端合成 API |

---

## 10. 将来扩展路径

| 阶段 | 扩展 | 方式 |
|------|------|------|
| MVP | 全部第三方 API | Replicate/fal.ai + Anthropic + Fish Audio |
| V2 | 自建 ComfyUI | 包装成 HTTP API 服务，Edge Function 调用方式不变 |
| V2 | 自建 FFmpeg 服务 | 同上，API 化 |
| V3 | 多 GPU 调度 | API 服务内部处理，VStudio 架构不变 |

核心思想：**对 VStudio 来说，所有 AI 能力都是 HTTP API，无论是第三方还是自建。**
