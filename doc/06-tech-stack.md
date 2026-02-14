# VStudio — 技术栈

## 1. 架构总览

```
┌─────────────────────────────────────────────────────────┐
│                     客户端 (Browser)                     │
│  SvelteKit + Svelte 5 + TypeScript                      │
│  TailwindCSS + shadcn-svelte + Svelte Stores            │
│  Supabase Client (Auth, DB, Storage, Realtime)          │
└─────────────┬──────────────────────┬────────────────────┘
              │ 读写数据              │ AI 生成任务
              ▼                      ▼
┌──────────────────────┐  ┌──────────────────────────────┐
│     Supabase         │  │  Supabase Edge Functions     │
│  ├── Auth (JWT)      │  │  (7 函数，详见              │
│  ├── PostgreSQL+RLS  │  │   05-api-integration § 1.1) │
│  ├── Storage         │  │                              │
│  └── Realtime        │  │                              │
└──────────────────────┘  └──────────┬───────────────────┘
                                     │ HTTP API
                          ┌──────────▼───────────────────┐
                          │ 外部服务                       │
                          │ ├── Replicate (图片/视频)     │
                          │ ├── fal.ai (图片/视频)        │
                          │ ├── Anthropic (LLM)           │
                          │ ├── Fish Audio (TTS)          │
                          │ └── 自建 FFmpeg 服务 (合成)    │
                          └──────────────────────────────┘
```

**核心原则：**
- **纯 Web + Supabase，无自建后台**（FFmpeg 服务是唯一自管组件）
- 前端直连 Supabase 处理所有 CRUD
- 所有 AI 能力通过第三方 HTTP API 调用（Replicate、fal.ai 等）
- API Key 安全：前端 → Supabase Edge Function → 第三方 API
- 异步任务：第三方 API webhook 回调 → Edge Function → 写入 DB → Realtime 推送前端
- 即使将来自建 ComfyUI，也包装成 API 服务，对 VStudio 来说和第三方 API 无区别

---

## 2. 前端

| 项目 | 选择 | 理由 |
|------|------|------|
| 框架 | **SvelteKit** + **Svelte 5** | 更轻量、编译时优化、内置 SSR/SSG、开发体验优秀 |
| 语言 | **TypeScript** | 类型安全，AI 代码生成质量高 |
| UI 库 | **shadcn-svelte** + **TailwindCSS** | shadcn 的 Svelte 版，可定制、轻量 |
| 状态管理 | **Svelte Stores** (runes) | Svelte 5 内置响应式，无需额外状态库 |
| Supabase | **@supabase/supabase-js** | Auth、DB 查询、Storage、Realtime 一站式 |
| 编辑器 | **CodeMirror 6** 或 **Monaco** | Markdown 编辑 |
| 视频播放 | **video.js** 或原生 `<video>` | 视频预览 |
| 拖拽 | **svelte-dnd-action** | 镜头排序 |

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
| **Auth** | 用户注册/登录（Email+密码，不验证邮箱），JWT，RLS 权限 |
| **PostgreSQL** | 所有业务数据（项目、剧本、镜头、资产、任务） |
| **RLS** | 行级安全策略，用户只能访问自己的数据 |
| **Storage** | 图片、视频、音频文件存储（Private bucket + 签名 URL） |
| **Realtime** | 监听 tasks 表变化，前端实时更新生成进度 |
| **Edge Functions** | AI API 代理层，保护 API Key，接收 webhook 回调 |

### Edge Functions 职责

| 函数 | 用途 |
|------|------|
| `llm-proxy` | 通用 LLM 代理（辅助写作、资产提取、分镜生成、提示词优化等） |
| `screenplay-generate` | 剧本生成专用（多模型路由、写入 screenplay_drafts） |
| `generate-image` | 代理调用 Replicate/fal.ai 图片生成 API |
| `generate-video` | 代理调用 Replicate/fal.ai 视频生成 API |
| `tts-proxy` | 代理调用 Fish Audio TTS API |
| `render-compose` | 调用自建 FFmpeg 服务执行视频合成 |
| `webhook-callback` | 接收第三方 API / FFmpeg 服务异步回调，更新 DB + Storage |

> 完整 Edge Function request/response schema 详见 `doc/05-api-integration.md` § 1.1

---

## 4. 第三方 AI 服务

| 服务 | 提供商 | 用途 |
|------|--------|------|
| 图片生成 (T2I) | **Replicate** / **fal.ai** | Flux 模型生成资产参考图、关键帧 |
| 视频生成 (I2V) | **Replicate** / **fal.ai** | 关键帧 → 视频 |
| LLM | **Anthropic** (Claude) | 剧本解析、分镜生成、AI 辅助写作 |
| TTS | **Fish Audio** | 角色配音 |
| TTS (备选) | **Edge TTS** (via Edge Function) | 免费备选 |
| 视频合成 | **自建 FFmpeg 服务** | 转场、字幕、多轨音频合成 |

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

**确定方案：自建 FFmpeg HTTP API 服务。** 详见 `doc/05-api-integration.md` § 7。

Edge Function `render-compose` → FFmpeg 服务 → webhook 回调 → Storage。

---

## 5. 文件存储

| 类型 | 存储位置 | 说明 |
|------|----------|------|
| 参考图/关键帧 | **Supabase Storage** (`media` bucket) | 签名 URL 访问 |
| 生成视频 | **Supabase Storage** (`media` bucket) | 签名 URL 访问 |
| 音频/配音 | **Supabase Storage** (`media` bucket) | 签名 URL 访问 |
| 最终输出 | **Supabase Storage** (`exports` bucket) | 签名 URL 下载 |

所有文件统一存储在 Supabase Storage，无本地文件系统依赖。Bucket 定义和 RLS 策略详见 `doc/04-data-model.md` § 3。

---

## 6. 部署

```
Vercel / Cloudflare Pages (免费):
  └── SvelteKit 前端

Supabase (免费额度):
  ├── Auth + DB + Storage + Realtime
  └── Edge Functions (AI API 代理 + webhook)

VPS (Hetzner / 自有服务器):
  └── FFmpeg 合成服务 (HTTP API)
```

**近零运维架构**：前端 + Supabase 全托管，唯一自管服务是 FFmpeg VPS（轻量 2C4G）。

---

## 7. 环境变量

所有环境变量定义在项目根目录 `.env.example`。

### 前端（SvelteKit，`PUBLIC_` 前缀）

| 变量 | 说明 | 必需 |
|------|------|------|
| `PUBLIC_SUPABASE_URL` | Supabase 项目 URL | ✅ |
| `PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名 Key（受 RLS 限制） | ✅ |

### Edge Function 环境变量（Supabase Dashboard → Edge Functions → Secrets）

| 变量 | 说明 | 必需 |
|------|------|------|
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key（绕过 RLS） | ✅ |
| `ANTHROPIC_API_KEY` | Anthropic Claude API Key | ✅ |
| `REPLICATE_API_TOKEN` | Replicate API Token | ✅ |
| `FAL_KEY` | fal.ai API Key | 可选 |
| `OPENAI_API_KEY` | OpenAI API Key | 可选 |
| `DEEPSEEK_API_KEY` | DeepSeek API Key | 可选 |
| `FISH_AUDIO_API_KEY` | Fish Audio TTS API Key | ✅ |
| `FFMPEG_SERVICE_URL` | 自建 FFmpeg 服务地址 | ✅ |
| `FFMPEG_SERVICE_SECRET` | FFmpeg 服务共享密钥 | ✅ |
| `WEBHOOK_BASE_URL` | Webhook 回调基础 URL | ✅ |

> **安全提示：** `SUPABASE_SERVICE_ROLE_KEY` 和所有第三方 API Key 仅在 Edge Function 环境变量中配置，**绝对不能**出现在前端代码或 `.env` 的 `PUBLIC_` 变量中。

---

## 8. 开发环境

| 工具 | 用途 |
|------|------|
| **pnpm** | 前端包管理 |
| **Supabase CLI** | 本地开发、迁移、Edge Functions 开发、类型生成 |
| **Vitest** + **Playwright** | 单元测试 + E2E 测试 |
| **ESLint + Prettier** + **svelte-check** | 前端规范 + Svelte 类型检查 |
| **Deno** | Edge Functions 本地开发 |

---

## 9. 关键技术决策

### 9.1 为什么纯 Supabase，不要 Python 后台？
- **简单**：只维护前端 + Edge Functions，无后端服务器
- **零运维**：Vercel/Cloudflare Pages + Supabase 全托管
- **成本低**：免费额度对 MVP 够用
- **开发快**：前端一把梭，不用维护两套代码
- 所有"重活"（图片/视频生成）交给第三方 API，自己不跑 GPU

### 9.2 为什么用第三方 AI API 而不是本地 ComfyUI？
- 本地 ComfyUI 需要 Python 后台调度 + GPU 机器常驻
- 第三方 API 即用即付，无需管理基础设施
- Replicate/fal.ai 已有现成的 Flux、视频生成模型
- 将来如需自建 ComfyUI，包装成 API 服务即可，架构无需改动

### 9.3 API Key 安全
- 前端不直接调用第三方 API（泄露 Key 风险）
- 所有调用经过 Supabase Edge Function 代理
- API Key 存储在 Supabase Edge Function 环境变量中
- Edge Function 验证 JWT，确保只有登录用户可调用

### 9.4 异步任务为什么用 webhook？
- 图片/视频生成耗时 30s-5min，超过 Edge Function 执行限制
- 第三方 API（Replicate/fal.ai）原生支持 webhook 回调
- 流程：提交任务 → 立即返回 → webhook 回调更新结果
- 前端通过 Supabase Realtime 实时获取状态

### 9.5 为什么自建 FFmpeg 服务？
- 云端合成 API（Creatomate/Shotstack）按量计费，长期成本高
- FFmpeg 合成逻辑完全可控（转场、字幕烧录、多轨混音）
- 部署极简：2C4G VPS + FFmpeg 即可
- 对 VStudio 架构无影响——和第三方 API 一样都是 HTTP 后端

---

## 10. 性能预估

| 操作 | 预计耗时 | 说明 |
|------|----------|------|
| 页面加载 | <1s | Vercel/Cloudflare CDN |
| LLM 资产提取 | 15-30s | Anthropic API |
| LLM 分镜生成 | 20-40s | Anthropic API |
| 单张关键帧 | 30-90s | Replicate/fal.ai |
| 单个镜头视频 | 2-5min | Replicate/fal.ai |
| TTS 单条 | 2-5s | Fish Audio API |
| 视频合成 | 30-120s | 自建 FFmpeg 服务 |

---

## 11. 将来扩展路径

| 阶段 | 扩展 | 方式 |
|------|------|------|
| MVP | 全部第三方 API + 自建 FFmpeg | Replicate/fal.ai + Anthropic + Fish Audio + FFmpeg VPS |
| V2 | 自建 ComfyUI | 包装成 HTTP API 服务，Edge Function 调用方式不变 |
| V3 | 多 GPU 调度 | API 服务内部处理，VStudio 架构不变 |

核心思想：**对 VStudio 来说，所有 AI 能力都是 HTTP API，无论是第三方还是自建。**
