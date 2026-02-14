# VStudio — 架构决策

## 最终决策

**纯 Web + Supabase 架构，无自建后台。**

```
Browser (SvelteKit)
  ├──→ Supabase (Auth, DB, Storage, Realtime)
  └──→ Supabase Edge Functions
         ├──→ Replicate / fal.ai (图片/视频生成)
         ├──→ Anthropic API (LLM)
         └──→ Fish Audio API (TTS)
              │
              └──→ webhook 回调 → Edge Function → DB + Storage
```

---

## 核心原则

1. **VStudio 纯 Web + Supabase，不需要自建 Python 后台**
2. **所有 AI 能力通过第三方 HTTP API 调用**（Replicate、fal.ai 等）
3. **API Key 安全**：前端 → Supabase Edge Function → 第三方 API
4. **异步任务**：第三方 API webhook 回调 → Edge Function → 写入 DB → Realtime 推送前端
5. **即使将来自建 ComfyUI，也包装成 API 服务**，对 VStudio 来说和第三方 API 无区别

---

## 架构分工

| 层 | 负责方 | 说明 |
|---|--------|------|
| Auth | **Supabase Auth** | 登录、JWT、RLS |
| 数据库 | **Supabase PostgreSQL** | 项目、剧本、镜头等数据，RLS 权限控制 |
| 文件存储 | **Supabase Storage** | 图片/视频/音频（签名 URL） |
| 实时推送 | **Supabase Realtime** | 监听任务状态变化，前端自动更新 |
| AI API 代理 | **Supabase Edge Functions** | 保护 API Key，提交任务，接收 webhook |
| 图片/视频生成 | **Replicate / fal.ai** | Flux T2I, I2V 等模型 |
| 文本生成 | **Anthropic API** | 剧本解析、分镜、辅助写作 |
| 语音合成 | **Fish Audio** | 角色配音 |

---

## 数据流示例

### 生成关键帧

```
1. 用户点"生成关键帧"
2. 前端调用 Edge Function: generate-image
3. Edge Function:
   a. 验证 JWT
   b. 创建 task 记录 (status=pending)
   c. 调用 Replicate API (带 webhook URL)
   d. 返回 task_id
4. 前端通过 Supabase Realtime 监听 tasks 表
5. Replicate 生成完成 → webhook 回调 Edge Function
6. Edge Function (webhook-callback):
   a. 下载生成的图片
   b. 上传到 Supabase Storage
   c. 更新 tasks 表: status=done, result_url=...
7. 前端实时收到更新，显示结果
```

### LLM 文本生成（同步）

```
1. 用户点"AI 提取资产"
2. 前端调用 Edge Function: llm-proxy
3. Edge Function:
   a. 验证 JWT
   b. 调用 Anthropic API (streaming)
   c. 流式返回结果
4. 前端实时显示 AI 生成内容
```

---

## 为什么不要 Python 后台

| 考虑 | 结论 |
|------|------|
| ComfyUI 需要本地 GPU | MVP 用第三方 API，不需要本地 ComfyUI |
| GPU 任务队列管理 | 第三方 API 自带队列，无需自建 |
| FFmpeg 视频合成 | 云端合成 API 或 FFmpeg.wasm，将来自建服务也是 API |
| Python 后端 | 将来自建 ComfyUI 服务时再考虑，MVP 不需要 |
| 维护成本 | 少一个服务 = 少一半运维 |

---

## 将来扩展

```
MVP:  前端 → Edge Function → 第三方 API (Replicate/fal.ai)
V2:   前端 → Edge Function → 自建 ComfyUI API 服务 (包装成 HTTP API)
```

对 VStudio 前端和 Edge Function 来说，V2 只是换了一个 API endpoint，架构完全不变。这就是"一切皆 API"的好处。

---

## 技术栈汇总

| 组件 | 技术 |
|------|------|
| 前端 | SvelteKit + Svelte 5 + TypeScript + shadcn-svelte + Supabase Client |
| Auth | Supabase Auth |
| 数据库 | Supabase PostgreSQL + RLS |
| 文件存储 | Supabase Storage |
| 实时 | Supabase Realtime |
| AI 代理 | Supabase Edge Functions (Deno) |
| 图片/视频 | Replicate / fal.ai |
| LLM | Anthropic Claude |
| TTS | Fish Audio |
| 部署 | Vercel/Cloudflare Pages (前端) + Supabase (全托管) |
