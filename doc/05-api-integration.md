# VStudio — 外部 AI API 集成规范

## 1. 总览

VStudio 通过 Supabase Edge Functions 代理所有外部 AI API 调用。前端不直接调用第三方 API。

```
┌─────────────┐     ┌──────────────────────┐     ┌────────────────────┐
│  前端 (SPA)  │ ──→ │  Edge Functions      │ ──→ │  第三方 AI 服务     │
│             │ ←── │  (API 代理 + webhook) │ ←── │                    │
└─────────────┘     └──────────────────────┘     │  · Replicate       │
       ↕ Realtime                                │  · fal.ai          │
   任务状态推送                                    │  · Anthropic       │
                                                 │  · Fish Audio      │
                                                 └────────────────────┘
```

### 安全模型

```
前端 → Edge Function (验证 JWT) → 第三方 API (API Key 在 env)
第三方 API → webhook 回调 → Edge Function (验证 signature) → 更新 DB
```

- API Key 存储在 Edge Function 环境变量中，前端不可见
- Edge Function 验证用户 JWT，确保只有登录用户可调用
- webhook 回调验证签名，防止伪造

---

## 2. 图片生成（T2I / I2I）

### 2.1 提供商

| 提供商 | 模型 | 用途 |
|--------|------|------|
| **Replicate** | flux-1.1-pro / flux-dev | 资产参考图、关键帧生成 |
| **fal.ai** | flux-pro / flux-dev | 备选 |

### 2.2 Replicate API

#### 提交预测（异步 + webhook）

```http
POST https://api.replicate.com/v1/predictions
Authorization: Bearer {REPLICATE_API_TOKEN}
Content-Type: application/json

{
  "model": "black-forest-labs/flux-1.1-pro",
  "input": {
    "prompt": "cinematic film still, a young man standing in a data center...",
    "width": 1344,
    "height": 768,
    "num_outputs": 3,
    "seed": 42
  },
  "webhook": "https://<project>.supabase.co/functions/v1/webhook-callback",
  "webhook_events_filter": ["completed"]
}

Response:
{
  "id": "abc123",
  "status": "starting",
  "urls": { "get": "...", "cancel": "..." }
}
```

#### Webhook 回调

```json
{
  "id": "abc123",
  "status": "succeeded",
  "output": ["https://replicate.delivery/xxx/output-0.png", "..."],
  "metrics": { "predict_time": 12.5 }
}
```

### 2.3 fal.ai API

```http
POST https://queue.fal.run/fal-ai/flux-pro
Authorization: Key {FAL_KEY}
Content-Type: application/json

{
  "prompt": "...",
  "image_size": { "width": 1344, "height": 768 },
  "num_images": 3,
  "seed": 42
}
```

fal.ai 也支持 webhook 模式或轮询模式。

### 2.4 Edge Function: generate-image

```typescript
// supabase/functions/generate-image/index.ts
import { serve } from "https://deno.land/std/http/server.ts"
import { createClient } from "@supabase/supabase-js"

serve(async (req) => {
  // 1. 验证 JWT
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const { data: { user } } = await supabase.auth.getUser(token)

  // 2. 创建 task 记录
  const { data: task } = await supabase.from('tasks').insert({
    user_id: user.id,
    type: 'generate_image',
    status: 'pending',
    params: body,
  }).select().single()

  // 3. 调用 Replicate API (带 webhook)
  const prediction = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${REPLICATE_API_TOKEN}` },
    body: JSON.stringify({
      model: body.model || 'black-forest-labs/flux-1.1-pro',
      input: { prompt: body.prompt, width: body.width, height: body.height, ... },
      webhook: `${SUPABASE_URL}/functions/v1/webhook-callback?task_id=${task.id}`,
      webhook_events_filter: ['completed'],
    }),
  })

  // 4. 返回 task_id
  return new Response(JSON.stringify({ task_id: task.id }))
})
```

### 2.5 工作流模板

#### T2I 参考图生成
- **用途：** 资产参考图
- **模型：** flux-1.1-pro
- **参数：** prompt, width=1344, height=768, num_outputs=3, seed

#### I2I 关键帧生成（多参考图）
- **用途：** 基于参考图生成关键帧
- **模型：** flux-dev (with image input)
- **参数：** prompt, reference_images[], width=1920, height=1080, strength=0.55, seed

### 2.6 提示词模板

从 fuxi style_bible 继承的模块化结构：

```
[STYLE PREFIX]       ← 项目风格设置
[CHARACTER PREFIX]   ← 角色资产描述 + 性别强化
[LOCATION PREFIX]    ← 场景资产描述
[SHOT ACTION]        ← shot.action
[CAMERA LANGUAGE]    ← shot.camera
[LIGHTING]           ← 基于 emotion
[MOOD]               ← 基于 emotion
```

默认负向提示词：
```
anatomy error, face distortion, extra limbs, extra fingers, watermark,
text artifacts, oversharpen, uncanny look, blurry, low quality, cartoon,
anime, illustration style, deformed face, asymmetric eyes, bad proportions,
cropped, out of frame
```

---

## 3. 视频生成（I2V）

### 3.1 提供商

| 提供商 | 模型 | 用途 |
|--------|------|------|
| **Replicate** | wan-2.1 / ltx-video | 关键帧 → 视频 |
| **fal.ai** | kling / minimax | 备选 |

### 3.2 调用方式

同图片生成，异步 + webhook：

```typescript
// Edge Function: generate-video
const prediction = await fetch('https://api.replicate.com/v1/predictions', {
  method: 'POST',
  body: JSON.stringify({
    model: 'wan-ai/wan-2.1-i2v',
    input: {
      image: keyframe_url,       // 关键帧图片 URL
      prompt: motion_prompt,     // 运动描述
      num_frames: 121,
      fps: 25,
      seed: 42,
    },
    webhook: `${SUPABASE_URL}/functions/v1/webhook-callback?task_id=${task_id}`,
  }),
})
```

---

## 4. LLM API 集成（文本生成）

### 4.1 提供商

| 提供商 | 模型 | 用途 |
|--------|------|------|
| Anthropic | claude-opus-4 | 剧本解析、分镜生成（最强创意能力） |
| Anthropic | claude-sonnet-4 | AI 辅助写作、日常文本任务 |
| OpenAI | gpt-4o | 备选 |

### 4.2 调用场景

| 场景 | 模型 | 输入 | 输出 | 预计耗时 |
|------|------|------|------|----------|
| 剧本辅助写作 | sonnet | 选中文本 + 指令 | 扩写/改写文本 | 5-15s |
| 资产提取 | opus | script.md 全文 | characters/locations/props JSON | 15-30s |
| 分镜生成 | opus | script + assets | shots.json | 20-40s |
| 关键帧规划 | opus | shots.json + assets | keyframes.json | 15-30s |
| 提示词优化 | sonnet | 原始描述 | 优化后的 prompt | 3-5s |

### 4.3 Edge Function: llm-proxy

LLM 调用通常 < 2 分钟，可以在 Edge Function 内同步（streaming）完成：

```typescript
// supabase/functions/llm-proxy/index.ts
serve(async (req) => {
  // 验证 JWT
  // 调用 Anthropic API (streaming)
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: body.model || 'claude-sonnet-4-20250514',
      max_tokens: body.max_tokens || 4096,
      messages: body.messages,
      system: body.system,
      stream: true,
    }),
  })

  // 流式转发给前端
  return new Response(response.body, {
    headers: { 'Content-Type': 'text/event-stream' },
  })
})
```

---

## 5. TTS API 集成（语音合成）

### 5.1 提供商

| 提供商 | 特点 | 适用场景 |
|--------|------|----------|
| **Fish Audio** | 高质量中文 TTS，支持音色克隆 | 主要配音 |
| **Edge TTS** (通过第三方 API) | 免费 | 备选/测试 |

### 5.2 Fish Audio API

```http
POST https://api.fish.audio/v1/tts
Authorization: Bearer {FISH_AUDIO_API_KEY}
Content-Type: application/json

{
  "text": "什么情况？",
  "reference_id": "voice_id_xxx",
  "format": "wav",
  "latency": "normal"
}

Response: audio/wav binary
```

TTS 通常 2-5s 完成，可在 Edge Function 内同步调用，将结果上传 Storage 后返回 URL。

### 5.3 Edge Function: tts-proxy

```typescript
serve(async (req) => {
  // 验证 JWT
  // 调用 Fish Audio API
  const audioResponse = await fetch('https://api.fish.audio/v1/tts', { ... })
  const audioBlob = await audioResponse.blob()

  // 上传到 Supabase Storage
  const { data } = await supabase.storage
    .from('audio')
    .upload(`${user.id}/${task_id}.wav`, audioBlob)

  // 返回 Storage URL
  return new Response(JSON.stringify({ audio_url: data.path }))
})
```

---

## 6. Webhook 回调处理

### 6.1 Edge Function: webhook-callback

统一处理所有第三方 API 的异步回调：

```typescript
// supabase/functions/webhook-callback/index.ts
serve(async (req) => {
  const task_id = new URL(req.url).searchParams.get('task_id')
  const body = await req.json()

  // 1. 验证回调签名（防伪造）
  // 2. 根据状态处理
  if (body.status === 'succeeded') {
    // 下载输出文件
    const outputs = body.output // URL 列表
    const storagePaths = []
    for (const url of outputs) {
      const file = await fetch(url)
      const blob = await file.blob()
      const path = `tasks/${task_id}/${filename}`
      await supabase.storage.from('outputs').upload(path, blob)
      storagePaths.push(path)
    }

    // 更新 task 记录
    await supabase.from('tasks').update({
      status: 'done',
      result: { paths: storagePaths },
      completed_at: new Date().toISOString(),
    }).eq('id', task_id)
  } else if (body.status === 'failed') {
    await supabase.from('tasks').update({
      status: 'failed',
      error: body.error,
    }).eq('id', task_id)
  }

  return new Response('ok')
})
```

### 6.2 前端实时监听

```typescript
// 前端监听 task 状态变化
const channel = supabase
  .channel('task-updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'tasks',
    filter: `user_id=eq.${userId}`,
  }, (payload) => {
    const task = payload.new
    if (task.status === 'done') {
      // 显示生成结果
    } else if (task.status === 'failed') {
      // 显示错误
    }
  })
  .subscribe()
```

---

## 7. 视频合成

MVP 阶段视频合成方案：

| 方案 | 说明 | 适用 |
|------|------|------|
| **Creatomate API** | 云端视频合成 | 转场、字幕叠加、多轨合成 |
| **Shotstack API** | 云端视频合成 | 备选 |
| **FFmpeg.wasm** | 浏览器端 FFmpeg | 轻量操作（裁剪、拼接） |
| **自建 FFmpeg 服务** | 将来扩展 | 包装成 API，Edge Function 调用 |

---

## 8. 错误处理与重试

### 8.1 通用策略

| 服务 | 重试次数 | 重试间隔 | 可重试错误 |
|------|----------|----------|-----------|
| Replicate | 3 | 10s, 30s, 60s | 超时、5xx |
| fal.ai | 3 | 10s, 30s, 60s | 超时、5xx |
| LLM API | 3 | 2s, 5s, 10s | rate limit (429)、5xx |
| TTS API | 3 | 2s, 5s, 10s | rate limit、5xx |

### 8.2 超时设置

| 操作 | 超时时间 | 说明 |
|------|----------|------|
| LLM 文本生成 | 120s | Edge Function 内同步 |
| TTS 语音合成 | 30s | Edge Function 内同步 |
| 图片生成 | 300s | webhook 异步，不受 Edge Function 限制 |
| 视频生成 | 1200s | webhook 异步 |
| webhook 最大等待 | 30min | 超时标记 task 为 timeout |
