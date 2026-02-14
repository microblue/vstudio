# VStudio — 功能规格

## 1. 页面结构

```
/                       → 项目列表（Dashboard）
/project/:id            → 项目概览
/project/:id/script     → 剧本编辑器
/project/:id/assets     → 资产管理
/project/:id/shots      → 分镜编辑器
/project/:id/generate   → 画面/视频生成
/project/:id/audio      → 音频工作台
/project/:id/compose    → 后期合成/时间轴
/project/:id/export     → 导出
/settings               → 系统设置（API keys, ComfyUI 配置等）
```

---

## 1.1 认证流程

### 登录方式

| 方式 | 说明 |
|------|------|
| **Email + Password** | Supabase Auth 内置，**不验证邮箱**（`email_confirm = false`） |

> **设计决策：** MVP 只支持 Email + Password 注册/登录，不做邮箱验证、Magic Link、OAuth。注册即可用，零摩擦。

### Supabase Auth 配置

在 Supabase Dashboard → Authentication → Settings：
- **Enable email confirmations** → **关闭**（`GOTRUE_MAILER_AUTOCONFIRM=true`）
- **Enable email signup** → 开启
- 不需要配置 SMTP（因为不发验证邮件）

### 认证架构

```
前端 (SvelteKit)
  ├── supabase.auth.signUp({ email, password })     → 注册（立即可用）
  ├── supabase.auth.signInWithPassword({ email, password })  → 登录
  ├── supabase.auth.signOut()                        → 登出
  └── supabase.auth.getSession()                     → 获取当前会话
       ↓ JWT
  Supabase (RLS 自动验证 auth.uid())
  Edge Functions (req.headers.Authorization → Bearer JWT)
```

> **注意：** Supabase Auth 的 `signUp` 需要 email 格式的字段，但因为关闭了邮箱验证，用户可以用任意 email 格式字符串注册（如 `user1@vstudio.local`）。如需纯用户名登录，前端可自动拼接 `@vstudio.local` 后缀。

### 未登录状态

- 未登录用户只能看到 Landing Page / 登录页
- 所有 `/project/*` 路由需要登录，SvelteKit `+layout.server.ts` 检查 session
- 未登录访问受保护路由 → 302 重定向到 `/auth/login`
- Edge Function 调用无有效 JWT → 401

### Storage RLS

```sql
-- Supabase Storage Policies (在 Dashboard 配置)
-- Bucket: media
-- SELECT: 用户只能读取自己项目下的文件
--   (storage.foldername(name))[2]::uuid IN (SELECT id FROM projects WHERE user_id = auth.uid())
-- INSERT: 同上
-- DELETE: 同上

-- Bucket: exports
-- SELECT: 同 media
-- INSERT: 仅 service_role（Edge Function 写入）
```

### Edge Function JWT 验证

```typescript
// 每个 Edge Function 统一验证模板
const authHeader = req.headers.get('Authorization')
if (!authHeader) return new Response('Unauthorized', { status: 401 })

const token = authHeader.replace('Bearer ', '')
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const { data: { user }, error } = await supabase.auth.getUser(token)
if (error || !user) return new Response('Unauthorized', { status: 401 })

// user.id 可用于后续操作
```

### SvelteKit Auth 集成

```typescript
// src/hooks.server.ts
import { createServerClient } from '@supabase/ssr'

export const handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(
    PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { get: (key) => event.cookies.get(key), ... } }
  )
  event.locals.getSession = async () => {
    const { data: { session } } = await event.locals.supabase.auth.getSession()
    return session
  }
  return resolve(event)
}
```

---

## 1.2 SvelteKit 路由文件映射

```
src/routes/
├── +layout.svelte                    # 根 layout（全局样式、Supabase 初始化）
├── +layout.server.ts                 # 服务端 session 加载
├── +page.svelte                      # Landing Page（未登录）/ 重定向（已登录）
│
├── auth/
│   ├── +layout.svelte                # Auth layout（居中卡片布局）
│   ├── login/+page.svelte            # 登录页
│   └── register/+page.svelte         # 注册页
│
├── (app)/                            # Group layout — 需要登录的所有页面
│   ├── +layout.svelte                # App layout（左侧导航 + 顶部状态栏 + 任务队列）
│   ├── +layout.server.ts             # 登录守卫（无 session → redirect /auth/login）
│   │
│   ├── +page.svelte                  # Dashboard — 项目列表 (/)
│   │
│   ├── project/[id]/
│   │   ├── +layout.svelte            # 项目 layout（项目侧边导航）
│   │   ├── +layout.server.ts         # 加载项目数据 + 权限校验
│   │   ├── +page.svelte              # 项目概览 (/project/:id)
│   │   │
│   │   ├── script/
│   │   │   ├── +page.svelte          # 剧本编辑器
│   │   │   └── create/+page.svelte   # AI 剧本创作
│   │   │
│   │   ├── assets/+page.svelte       # 资产管理
│   │   ├── shots/+page.svelte        # 分镜编辑器
│   │   ├── generate/+page.svelte     # 画面/视频生成工作台
│   │   ├── audio/+page.svelte        # 音频工作台
│   │   ├── compose/+page.svelte      # 后期合成/时间轴
│   │   └── export/+page.svelte       # 导出
│   │
│   └── settings/+page.svelte         # 系统设置
│
└── api/                              # SvelteKit API routes（如需要）
    └── health/+server.ts             # 健康检查
```

### Layout 层级

```
+layout.svelte (根: 全局样式、Supabase provider、主题)
  ├── auth/+layout.svelte (Auth: 居中卡片)
  └── (app)/+layout.svelte (App: 侧边导航 + 状态栏)
       └── project/[id]/+layout.svelte (项目: 项目侧边导航 + 阶段状态)
```

---

## 2. 模块详细设计

### 2.0 剧本创作（Screenplay Creation）

在现有工作流「阶段 1：剧本编辑器」之前，新增**剧本创作**环节。用户输入故事大纲（自然语言），系统调用 LLM 一键生成专业格式的完整剧本，用户可选择不同大模型。

**定位：** 降低创作门槛——用户不需要懂编剧，只需描述故事想法，AI 即可输出可用于后续 pipeline 的剧本。

```
[新] 剧本创作（大纲 → 剧本）  →  [现有] 剧本编辑器（精修）  →  资产生成  →  ...
```

#### 用户流程

```
1. 用户点击「新建项目」或进入项目后选择「AI 生成剧本」
2. 填写故事大纲表单：
   - 故事梗概（必填，文本域）
   - 类型/风格（可选：科幻、悬疑、爱情、喜剧、恐怖等）
   - 目标时长（可选：1分钟/3分钟/5分钟/10分钟）
   - 语言（中文/英文/双语）
   - 补充要求（可选，自由文本：角色设定、世界观、特殊约束等）
3. 选择大模型：
   - Claude Sonnet 4（默认，快速）
   - Claude Opus 4（高质量）
   - GPT-4o
   - DeepSeek R1
   - 自定义（用户输入 API endpoint + key）
4. 点击「生成剧本」
5. 系统 streaming 输出剧本内容，实时显示
6. 生成完毕后，用户可：
   - 「采用」→ 剧本自动填入剧本编辑器，进入精修环节
   - 「重新生成」→ 调整参数后再次生成
   - 「换个模型试试」→ 切换模型重新生成，可对比不同版本
```

#### UI 设计

**入口：**
- 新建项目时：创建项目后弹出选择「从大纲生成剧本」或「手动编写剧本」
- 项目内：剧本编辑器页面顶部增加「AI 生成剧本」按钮
- 路由：`/project/:id/script/create`

**页面布局：**
```
┌──────────────────────────────────────────────────────┐
│ ← 项目名  │  AI 剧本创作                    [历史版本] │
├────────────┼─────────────────────────────────────────┤
│            │  ┌─────────────────────────────────────┐│
│ 项目导航   │  │ 故事大纲 *                           ││
│            │  │ ┌─────────────────────────────────┐ ││
│ · 创作  ←  │  │ │ 一个少年发现自己生活在AI模拟的   │ ││
│ · 剧本     │  │ │ 世界中，他必须找到"源代码"才能   │ ││
│ · 资产     │  │ │ 回到现实...                      │ ││
│ · 分镜     │  │ └─────────────────────────────────┘ ││
│ · 生成     │  │                                      ││
│ · 音频     │  │ 类型: [科幻 ▼]  时长: [3分钟 ▼]     ││
│ · 合成     │  │ 语言: [中文 ▼]                       ││
│ · 导出     │  │                                      ││
│            │  │ 补充要求（可选）:                     ││
│            │  │ ┌─────────────────────────────────┐ ││
│            │  │ │ 主角16岁，名叫伏羲...            │ ││
│            │  │ └─────────────────────────────────┘ ││
│            │  │                                      ││
│            │  │ 模型: ○ Claude Sonnet  ● Claude Opus ││
│            │  │       ○ GPT-4o  ○ DeepSeek R1       ││
│            │  │       ○ 自定义...                    ││
│            │  │                                      ││
│            │  │        [生成剧本 ▶]                   ││
│            │  └─────────────────────────────────────┘│
│            │                                         │
│            │  ┌─────────────────────────────────────┐│
│            │  │ 生成结果（streaming 显示）            ││
│            │  │                                      ││
│            │  │ # 第一幕：觉醒                       ││
│            │  │ ## 场景1: 数据中枢                    ││
│            │  │ 黑暗的空间中，无数光点闪烁...         ││
│            │  │ ...                                   ││
│            │  │ █ (生成中...)                         ││
│            │  │                                      ││
│            │  │ [采用此剧本] [重新生成] [换模型对比]   ││
│            │  └─────────────────────────────────────┘│
└────────────┴─────────────────────────────────────────┘
```

**版本对比视图：**
```
┌────────────────────────┬────────────────────────┐
│ 版本 A (Claude Opus)   │ 版本 B (GPT-4o)        │
│                        │                        │
│ # 第一幕...            │ # 第一幕...            │
│ ...                    │ ...                    │
│                        │                        │
│ [采用此版本]            │ [采用此版本]            │
└────────────────────────┴────────────────────────┘
```

#### API 设计

**Edge Function: `screenplay-generate`**

```
POST /functions/v1/screenplay-generate
Authorization: Bearer <user_jwt>
Content-Type: application/json

{
  "project_id": "uuid",
  "outline": "故事大纲文本...",
  "genre": "sci-fi",
  "target_duration": "3min",
  "language": "zh",
  "extra_requirements": "主角16岁...",
  "model": "claude-opus-4",
  "stream": true
}
```

**响应（streaming SSE）：**
```
data: {"type": "chunk", "content": "# 第一幕：觉醒\n\n"}
data: {"type": "chunk", "content": "## 场景1: ..."}
...
data: {"type": "done", "draft_id": "uuid", "token_usage": {"input": 800, "output": 3200}}
```

**系统提示词：** 内置专业编剧 system prompt，要求标准 Markdown 剧本格式、视觉叙事、镜头建议等。

**模型路由：**

| 模型标识 | API | 备注 |
|---------|-----|------|
| `claude-sonnet-4` | Anthropic Messages API | 默认，快速 |
| `claude-opus-4` | Anthropic Messages API | 高质量 |
| `gpt-4o` | OpenAI Chat Completions API | 需配置 OpenAI key |
| `deepseek-r1` | DeepSeek API（OpenAI 兼容） | 性价比高 |
| `custom` | 用户自定义 endpoint | OpenAI 兼容格式 |

#### 前端组件

| 组件 | 说明 |
|------|------|
| `ScreenplayCreator` | 主容器，管理表单 + 生成流程 |
| `OutlineForm` | 大纲输入表单 |
| `ModelSelector` | 模型选择器 |
| `StreamingPreview` | streaming 输出的 Markdown 实时渲染 |
| `DraftVersionList` | 历史版本列表 |
| `DraftCompare` | 双栏版本对比视图 |

#### 与现有模块的关系

- **剧本编辑器（2.2）：** 采用后自动填入编辑器
- **资产生成（2.3）：** 无直接关联，资产提取仍从编辑器最终剧本执行
- **系统设置（2.9）：** 新增 LLM 模型配置区域

#### 实现优先级

- **P0（MVP）：** 大纲表单 + Claude Sonnet/Opus 生成 + streaming 输出 + 采用到编辑器
- **P1：** 多模型支持 + 版本管理
- **P2：** 版本对比视图 + 自定义模型 endpoint

---

### 2.1 项目管理（Dashboard）

**路由：** `/`

**功能：**
- 项目列表（卡片式），显示项目名、封面缩略图、最后更新时间、当前阶段
- 新建项目（输入项目名、描述、选择风格模板）
- 删除项目（二次确认）
- 搜索/筛选项目

**UI 组件：**
```
┌──────────────────────────────────────────────┐
│  VStudio                        [+ 新建项目]  │
├──────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐      │
│  │ 封面图   │  │ 封面图   │  │ 封面图   │      │
│  │         │  │         │  │         │      │
│  │ 项目名   │  │ 项目名   │  │ 项目名   │      │
│  │ 阶段状态 │  │ 阶段状态 │  │ 阶段状态 │      │
│  │ 更新时间 │  │ 更新时间 │  │ 更新时间 │      │
│  └─────────┘  └─────────┘  └─────────┘      │
└──────────────────────────────────────────────┘
```

**数据操作（前端直连 Supabase）：**
- `supabase.from('projects').select()` — 项目列表
- `supabase.from('projects').insert()` — 创建项目
- `supabase.from('projects').delete().eq('id', id)` — 删除项目
- `supabase.from('projects').update().eq('id', id)` — 更新项目信息

---

### 2.2 剧本编辑器

**路由：** `/project/:id/script`

**功能：**
- Markdown 编辑器（左右分栏：编辑 / 预览）
- AI 辅助写作：
  - 选中文本 → 右键菜单「AI 扩写 / 改写 / 续写 / 翻译」
  - 侧边 AI 对话面板：与 LLM 讨论剧情
- 剧本结构检查：自动识别场景、角色、对话
- 导入/导出：支持 .md 文件
- 自动保存（debounce 2s）
- 版本历史（每次手动保存创建版本）

**UI 布局：**
```
┌──────────────────────────────────────────────────────┐
│ ← 项目名  │  剧本编辑器            [AI 助手] [保存]  │
├────────────┼────────────────────────┬────────────────┤
│            │  Markdown 编辑区       │  预览区         │
│ 项目导航   │                        │                │
│            │  # 第一幕              │  渲染后的       │
│ · 剧本  ← │  ## 场景1: 数据中枢    │  格式化文本     │
│ · 资产     │                        │                │
│ · 分镜     │  **伏羲** 站在...      │                │
│ · 生成     │                        │                │
│ · 音频     │  > 伏羲：什么情况？     │                │
│ · 合成     │                        │                │
│ · 导出     │                        │                │
├────────────┴────────────────────────┴────────────────┤
│ AI 助手面板 (可折叠)                                   │
│ [用户] 帮我扩写第一幕的追逐戏                           │
│ [AI] 好的，我来帮你扩写...                             │
└──────────────────────────────────────────────────────┘
```

**数据操作（前端直连 Supabase）：**
- `supabase.from('scripts').select().eq('project_id', id)` — 获取剧本
- `supabase.from('scripts').upsert()` — 保存剧本
- `supabase.from('script_versions').select()` — 版本列表

**AI 操作（通过 Edge Function）：**
- `Edge Function: llm-proxy` — AI 辅助写作（streaming）
  - body: { action: "expand"|"rewrite"|"continue"|"translate", text, context }

---

### 2.3 资产管理

**路由：** `/project/:id/assets`

**功能：**
- 三个标签页：角色 / 场景 / 道具
- 一键从剧本提取资产（AI）
- 资产卡片展示：名称、描述、参考图
- 编辑资产属性（表单）
- 生成参考图（每个资产 3 张候选）
- 选择/上传主参考图
- 手动新增/删除资产

**UI 布局：**
```
┌──────────────────────────────────────────────────────┐
│ 资产管理      [从剧本提取]  [角色|场景|道具]           │
├──────────────────────────────────────────────────────┤
│ ┌───────────────────────┐  ┌───────────────────────┐ │
│ │ [参考图]              │  │ [参考图]              │ │
│ │ ★                     │  │ ★                     │ │
│ │ 主角 (Hero)           │  │ 导师 (Mentor)         │ │
│ │ 16岁少年，棱角分明... │  │ 神秘女性，全息投影... │ │
│ │ [编辑] [生成参考图]   │  │ [编辑] [生成参考图]   │ │
│ │                       │  │                       │ │
│ │ 候选图:               │  │ 候选图:               │ │
│ │ [img1] [img2] [img3]  │  │ [img1] [img2] [img3]  │ │
│ └───────────────────────┘  └───────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

**资产编辑表单字段（以角色为例）：**
- `id` — 英文 ID（自动生成，可修改）
- `zh_name` — 中文名
- `en_name` — 英文名
- `gender` — 性别
- `age` — 年龄
- `appearance` — 外貌描述（文本）
- `costume` — 服装描述
- `personality` — 性格描述
- `visual_prompts` — 生成参考图时的补充提示词
- `reference_image` — 主参考图（选择或上传）

**数据操作（前端直连 Supabase）：**
- `supabase.from('characters').select().eq('project_id', id)` — 角色列表
- `supabase.from('locations').select().eq('project_id', id)` — 场景列表
- `supabase.from('props').select().eq('project_id', id)` — 道具列表
- `supabase.from('characters').insert()` / `.update()` / `.delete()` — 角色 CRUD
- `supabase.from('locations').insert()` / `.update()` / `.delete()` — 场景 CRUD
- `supabase.from('props').insert()` / `.update()` / `.delete()` — 道具 CRUD
- `supabase.storage.from('media').upload()` — 上传自定义参考图

**AI 操作（通过 Edge Function）：**
- `Edge Function: llm-proxy` — AI 从剧本提取资产（streaming）
- `Edge Function: generate-image` — 生成参考图（异步 webhook）
  - body: { prompt, num_candidates: 3 }

---

### 2.4 分镜编辑器

**路由：** `/project/:id/shots`

**功能：**
- AI 一键生成分镜（从剧本 + 资产 → shots.json）
- 时间轴视图：横向排列镜头块
- 镜头详情编辑面板
- 关键帧规划视图
- 拖拽调整镜头顺序
- 批量操作

**UI 布局：**
```
┌──────────────────────────────────────────────────────┐
│ 分镜编辑器    [AI 生成分镜] [+ 添加镜头] [批量生成KF] │
├──────────────────────────────────────────────────────┤
│ 时间轴 (横向滚动):                                    │
│ ┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐┌────┐         │
│ │ S01││ S02││ S03││ S04││ S05││ S06││ S07│ ...      │
│ │ 4s ││ 3s ││ 2s ││ 5s ││ 3s ││ 4s ││ 3s │         │
│ │wide││CU  ││med ││wide││CU  ││OTS ││wide│         │
│ └────┘└────┘└────┘└────┘└────┘└────┘└────┘         │
│        ↑ 当前选中                                     │
├──────────────────────────────────────────────────────┤
│ 镜头详情: S02                                         │
│ ┌─────────────────────┬──────────────────────────┐   │
│ │ 基础信息            │ 提示词                    │   │
│ │ 时长: [3.0]s        │ Visual:                   │   │
│ │ 景别: [close-up ▼]  │ [cinematic film still...] │   │
│ │ 情绪: [震惊]        │                           │   │
│ │ 场景: [数据中枢 ▼]  │ Motion:                   │   │
│ │ 角色: [伏羲, ☑]     │ [camera slowly pushes...] │   │
│ │ 转场: [fadewhite ▼] │                           │   │
│ │ 速度: [1.0]         │                           │   │
│ ├─────────────────────┤                           │   │
│ │ 台词                │                           │   │
│ │ 伏羲: "什么情况？"  │                           │   │
│ │ [+ 添加台词]        │                           │   │
│ ├─────────────────────┴──────────────────────────┤   │
│ │ 关键帧 (3帧):                                   │   │
│ │ [KF1: 0.0s] ──── [KF2: 1.0s] ──── [KF3: 2.0s] │   │
│ │ prompt...     prompt...       prompt...          │   │
│ └─────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

**镜头字段（shots.json 单条）：**
```json
{
  "shot_id": "S01",
  "scene": "1-1",
  "duration_s": 4,
  "location": "描述文本",
  "location_ref": "asset_id",
  "characters": ["名称"],
  "character_refs": ["asset_id"],
  "prop_refs": ["asset_id"],
  "camera": "景别/运镜描述",
  "action": "画面动作描述",
  "dialogue": [
    { "character": "角色名", "text": "台词", "emotion": "情感", "speed": 1.0 }
  ],
  "emotion": "情绪标签",
  "prompt_visual": "T2I 提示词",
  "prompt_motion": "I2V 提示词",
  "transition_out": "cut|fadewhite|dissolve|xfade",
  "transition_duration_s": 0.5,
  "sfx_bgm": "音效/BGM 描述",
  "speed": 1.0,
  "trim_start": 0,
  "trim_end": null,
  "notes": "备注"
}
```

**数据操作（前端直连 Supabase）：**
- `supabase.from('shots').select().eq('episode_id', eid)` — 分镜列表
- `supabase.from('shots').upsert()` — 保存/更新镜头
- `supabase.from('shots').insert()` — 插入镜头
- `supabase.from('shots').delete().eq('id', shotId)` — 删除镜头
- `supabase.from('keyframes').select()` — 关键帧规划

**AI 操作（通过 Edge Function）：**
- `Edge Function: llm-proxy` — AI 生成分镜 / 关键帧规划（streaming）

---

### 2.5 画面/视频生成工作台

**路由：** `/project/:id/generate`

**功能：**
- 关键帧图片生成（T2I / I2I）
- 镜头视频生成（I2V）
- 候选图/视频预览和选择
- 批量生成和进度跟踪
- 任务队列管理

**UI 布局：**
```
┌──────────────────────────────────────────────────────┐
│ 生成工作台    [批量生成关键帧] [批量生成视频]          │
├──────────────────────────────────────────────────────┤
│ 任务队列:  ● 3 运行中  ○ 12 等待中  ✓ 5 已完成       │
├──────────────────────────────────────────────────────┤
│ S01                                                   │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 关键帧: [KF1 ✓]  [KF2 ✓]  [KF3 ⏳ 生成中...]   │   │
│ │                                                  │   │
│ │ KF1 候选:                                        │   │
│ │ ┌──────┐ ┌──────┐ ┌──────┐                      │   │
│ │ │ ★    │ │      │ │      │  [重新生成]           │   │
│ │ │ img1 │ │ img2 │ │ img3 │                      │   │
│ │ └──────┘ └──────┘ └──────┘                      │   │
│ │                                                  │   │
│ │ 视频: [▶ 预览]  状态: ✓ 已生成                    │   │
│ │       [重新生成视频]                              │   │
│ └─────────────────────────────────────────────────┘   │
│                                                       │
│ S02                                                   │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 关键帧: [KF1 ○]  [KF2 ○]   状态: 未开始         │   │
│ │ [生成关键帧]                                     │   │
│ └─────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

**数据操作（前端直连 Supabase）：**
- `supabase.from('keyframes').update().eq('id', kfId)` — 选择候选图
- `supabase.from('tasks').select()` — 任务队列状态
- **Supabase Realtime** — 监听 tasks 表变化，实时更新进度

**AI 操作（通过 Edge Function）：**
- `Edge Function: generate-image` — 生成关键帧图片（异步 webhook）
  - body: { shot_id, keyframe_id, num_candidates: 3, seed: null }
- `Edge Function: generate-video` — 生成镜头视频（异步 webhook）
  - body: { shot_id, seed: null }
- 批量操作：前端循环调用，每个任务独立跟踪

---

### 2.6 音频工作台

**路由：** `/project/:id/audio`

**功能：**
- 角色音色配置
- 逐条台词 TTS 生成和预听
- 音效/BGM 管理
- 字幕自动生成

**UI 布局：**
```
┌──────────────────────────────────────────────────────┐
│ 音频工作台    [批量生成配音] [生成字幕]                │
├──────────────────────────────────────────────────────┤
│ 角色音色:                                             │
│ ┌──────────────────────────────────────────────────┐  │
│ │ 伏羲  → [Fish Audio: 少年音色 ▼] [试听]          │  │
│ │ 女娲  → [Fish Audio: 女性空灵 ▼] [试听]          │  │
│ │ 旁白  → [Edge TTS: 男声沉稳 ▼]  [试听]          │  │
│ └──────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────┤
│ 台词列表:                                             │
│ ┌───┬────────┬──────────────┬──────┬───────────────┐  │
│ │ # │ 镜头   │ 台词          │ 状态 │ 操作          │  │
│ ├───┼────────┼──────────────┼──────┼───────────────┤  │
│ │ 1 │ S03    │ 什么情况？    │ ✓   │ [▶] [重新生成]│  │
│ │ 2 │ S05    │ 女娲在吗？    │ ✓   │ [▶] [重新生成]│  │
│ │ 3 │ S08    │ 你的代码...   │ ⏳   │ [生成中...]   │  │
│ └───┴────────┴──────────────┴──────┴───────────────┘  │
└──────────────────────────────────────────────────────┘
```

**数据操作（前端直连 Supabase）：**
- `supabase.from('voice_profiles').select().eq('project_id', id)` — 角色音色配置列表
- `supabase.from('voice_profiles').upsert()` — 设置角色音色
- `supabase.from('dialogues').select()` + `supabase.from('audio_clips').select()` — 获取台词和音频数据，前端生成字幕

**AI 操作（通过 Edge Function）：**
- `Edge Function: tts-proxy` — 生成单条配音（同步，返回 Storage URL）
  - body: { text, voice_id, provider }
- 批量配音：前端循环调用
- 字幕生成：前端根据对话数据 + 音频时长自动生成

---

### 2.7 后期合成/时间轴

**路由：** `/project/:id/compose`

**功能：**
- 简化版 NLE 时间轴
- 视频轨 + 音频轨 + 字幕轨可视化
- 转场编辑
- 预览播放
- 一键合成

**UI 布局：**
```
┌──────────────────────────────────────────────────────┐
│ 后期合成    [预览] [合成输出]                          │
├──────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────┐  │
│ │                视频预览播放器                      │  │
│ │         [◀] [▶/⏸] [▶] 00:12 / 01:05             │  │
│ └──────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────┤
│ 时间轴:  0s    5s    10s   15s   20s   25s   30s     │
│ ─────────────────────────────────────────────────────│
│ 视频: ┃S01┃S02┃ S03 ┃  S04  ┃S05┃ S06 ┃S07┃        │
│          ╳fade    ╳dissolve                          │
│ 对话: ┃   ┃♪  ┃     ┃  ♪   ┃♪  ┃     ┃   ┃        │
│ SFX:  ┃♪♪ ┃   ┃ ♪♪  ┃  ♪   ┃   ┃ ♪♪  ┃♪  ┃        │
│ BGM:  ┃━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃        │
│ 字幕: ┃   ┃txt┃     ┃ txt  ┃txt┃     ┃   ┃        │
└──────────────────────────────────────────────────────┘
```

**数据操作（前端直连 Supabase）：**
- `supabase.from('shots').select().eq('episode_id', eid).order('sort_order')` — 获取镜头序列（即时间轴数据）
- `supabase.from('shots').update()` — 更新镜头转场/速度/裁剪等合成参数
- `supabase.from('audio_clips').select().eq('episode_id', eid)` — 获取音频轨道
- `supabase.from('shot_videos').select()` — 获取镜头视频

**合成操作（通过 Edge Function 或云端 API）：**
- `Edge Function: render-video` — 调用云端视频合成 API（Creatomate/Shotstack）
  - body: { episode_id, resolution: "1080p", include_subtitles: true }
- 异步 webhook 回调，Realtime 推送进度

---

### 2.8 导出

**路由：** `/project/:id/export`

**功能：**
- 下载最终视频
- 选择导出规格
- 导出项目资源包（JSON + 所有素材）

**导出选项：**
- 分辨率：1080p (默认) / 720p / 4K
- 字幕：烧录 / 外挂 SRT / 无
- 音频：混合输出 / 分轨输出
- 格式：MP4 (H.264) / MOV (ProRes)

**操作：**
- 导出 = 合成的最终输出，文件存储在 Supabase Storage
- 前端通过 Storage 签名 URL 下载

---

### 2.9 系统设置

**路由：** `/settings`

**功能：**
- AI 服务配置：
  - LLM API Key（Anthropic / OpenAI）
  - ComfyUI 地址和状态检查
  - TTS 配置（Fish Audio API Key / Edge TTS）
- 默认参数：
  - 默认分辨率、帧率
  - 默认 T2I 候选数
  - 负向提示词模板
- 存储路径配置

**数据操作（前端直连 Supabase）：**
- `supabase.from('projects').select('settings').eq('id', projectId)` — 获取项目设置
- `supabase.from('projects').update({ settings: {...} }).eq('id', projectId)` — 更新项目设置

**说明：**
- API Key 等敏感配置存储在 Supabase Edge Function 环境变量中（Dashboard 配置）
- 用户级设置（默认参数等）存储在 `projects.settings` JSONB 字段中
- MVP 阶段 AI 服务配置由管理员在 Supabase Dashboard 设置，不在前端暴露

---

## 3. 全局组件

### 3.1 左侧导航栏

固定显示，包含：
- 项目名称
- 各阶段入口（剧本、资产、分镜、生成、音频、合成、导出）
- 当前阶段高亮 + 每个阶段完成状态图标

### 3.2 任务状态栏

页面顶部/底部固定，显示：
- 当前运行中的 AI 任务数量
- 点击展开任务队列详情
- 实时进度更新（Supabase Realtime）

### 3.3 通知系统

- 任务完成通知（浏览器通知 + 页面内 toast）
- 错误报告（红色 toast + 错误详情弹窗）

### 3.4 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+S` | 保存当前页面 |
| `Space` | 播放/暂停预览 |
| `←` / `→` | 上一个/下一个镜头 |
| `Ctrl+Z` | 撤销 |
| `Ctrl+Shift+Z` | 重做 |
| `Ctrl+G` | 打开生成面板 |
