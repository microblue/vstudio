# VStudio — 统一数据库设计

> **设计原则：结构化字段 + JSONB 灵活属性**
> - 需要查询、索引、JOIN、排序的字段 → 结构化列
> - 扩展属性、AI 参数、UI 配置 → JSONB 列
> - 每张表至少一个 `meta JSONB DEFAULT '{}'` 字段用于未来扩展

---

## 0. 通用约定

| 约定 | 说明 |
|------|------|
| 主键 | `id UUID DEFAULT gen_random_uuid()` |
| 时间 | `created_at / updated_at TIMESTAMPTZ DEFAULT now()` |
| 软删除 | 不使用，直接 `ON DELETE CASCADE` |
| 用户归属 | `user_id UUID REFERENCES auth.users(id)` 在顶层表 (projects) |
| RLS | 所有表启用，策略基于 `auth.uid() = user_id`（通过 project 链路） |
| JSONB 索引 | 对频繁查询的 JSONB 路径建 GIN 或 btree 表达式索引 |
| 命名 | 表名复数小写，字段 snake_case |

---

## 1. projects — 项目

```sql
CREATE TABLE projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  cover_image   TEXT,                    -- Storage URL
  status        VARCHAR(20) DEFAULT 'active',  -- active | archived
  -- JSONB: 项目级设置（分辨率、帧率、风格前缀、负面提示词等）
  settings      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY projects_owner ON projects
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**settings JSONB 示例：**
```jsonc
{
  "resolution": "1920x1080",
  "fps": 24,
  "aspect_ratio": "16:9",
  "default_t2i_candidates": 3,
  "negative_prompt": "anatomy error, face distortion...",
  "style_prefix": "cinematic film still, photorealistic...",
  "style_bible": { /* 风格圣经内容 */ }
}
```

---

## 2. episodes — 剧集

```sql
CREATE TABLE episodes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  episode_number  INTEGER NOT NULL,
  title           VARCHAR(255),
  status          VARCHAR(30) DEFAULT 'draft',
  -- draft | script_ready | assets_ready | shots_ready |
  -- keyframes_ready | videos_ready | audio_ready |
  -- composing | final_ready | exported
  meta            JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, episode_number)
);

CREATE INDEX idx_episodes_project ON episodes(project_id);
```

---

## 3. scripts — 剧本

```sql
CREATE TABLE scripts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id  UUID UNIQUE NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,           -- Markdown 格式
  version     INTEGER DEFAULT 1,
  meta        JSONB DEFAULT '{}',      -- word_count, structure_analysis 等
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE script_versions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id   UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  version     INTEGER NOT NULL,
  content     TEXT NOT NULL,
  meta        JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

---

## 4. screenplay_drafts — AI 剧本草稿

```sql
CREATE TABLE screenplay_drafts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id          UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version             INTEGER NOT NULL DEFAULT 1,
  status              VARCHAR(20) DEFAULT 'generating',
  -- generating | completed | failed | adopted
  -- 结构化：查询/筛选需要的字段
  outline             TEXT NOT NULL,           -- 用户输入的故事大纲
  genre               VARCHAR(50),
  target_duration     VARCHAR(20),
  language            VARCHAR(20) DEFAULT 'zh',
  model               VARCHAR(100) NOT NULL,   -- claude-opus-4, gpt-4o 等
  generated_script    TEXT,                     -- 生成的剧本 Markdown
  -- JSONB：灵活/扩展属性
  input_params        JSONB DEFAULT '{}',      -- extra_requirements, model_config 等
  generation_info     JSONB DEFAULT '{}',      -- token_usage, latency_ms, system_prompt_version
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_screenplay_drafts_project ON screenplay_drafts(project_id);
```

**input_params 示例：**
```jsonc
{
  "extra_requirements": "主角25岁，性格冷静...",
  "model_config": { "endpoint": "https://...", "api_key_ref": "..." },
  "system_prompt_override": null
}
```

**generation_info 示例：**
```jsonc
{
  "token_usage": { "input": 800, "output": 3200 },
  "latency_ms": 12500,
  "model_version": "claude-opus-4-20260213"
}
```

---

## 5. characters — 角色

```sql
CREATE TABLE characters (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  asset_id        VARCHAR(100) NOT NULL,     -- 英文标识 "hero_john"
  zh_name         VARCHAR(100),
  en_name         VARCHAR(100),
  gender          VARCHAR(20),
  reference_image TEXT,                       -- Storage URL
  -- JSONB：丰富的角色属性（外貌、服装、性格、提示词等）
  profile         JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, asset_id)
);
```

**profile JSONB 示例：**
```jsonc
{
  "age": "25岁青年",
  "appearance": "短发，深邃的眼睛...",
  "costume": "深蓝色外套，运动鞋",
  "personality": "冷静，善于分析",
  "visual_prompts": ["angular face", "short brown hair"],
  "color_palette": ["navy blue", "white"],
  "backstory": "..."
}
```

---

## 6. locations — 场景

```sql
CREATE TABLE locations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  asset_id        VARCHAR(100) NOT NULL,
  zh_name         VARCHAR(200),
  en_name         VARCHAR(200),
  type            VARCHAR(100),
  reference_image TEXT,
  -- JSONB：场景详细属性
  profile         JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, asset_id)
);
```

**profile JSONB：** `{ atmosphere, visual_style, color_palette[], key_features[], prompts[], era }`

---

## 7. props — 道具

```sql
CREATE TABLE props (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  asset_id        VARCHAR(100) NOT NULL,
  zh_name         VARCHAR(200),
  en_name         VARCHAR(200),
  reference_image TEXT,
  profile         JSONB DEFAULT '{}',      -- description, visual_prompts[] 等
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, asset_id)
);
```

---

## 8. shots — 镜头 ⭐ （典型示例）

**设计思路：** shots 是使用频率最高的表，查询模式多样。将排序、时长、关联引用等高频查询字段保留为结构化列；将 prompt、转场细节、音效等生成参数归入 JSONB。

```sql
CREATE TABLE shots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id      UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  shot_id         VARCHAR(20) NOT NULL,     -- "S01", "S02"
  scene           VARCHAR(20),              -- "1-1"
  sort_order      INTEGER NOT NULL,
  duration_s      REAL NOT NULL DEFAULT 3.0,

  -- 关联引用（用于 JOIN 和筛选）
  location_ref    VARCHAR(100),             -- → locations.asset_id
  character_refs  TEXT[],                   -- → characters.asset_id[]
  prop_refs       TEXT[],                   -- → props.asset_id[]

  -- 核心描述（编辑器显示 & 搜索）
  camera          TEXT,                     -- 景别/运镜
  action          TEXT,                     -- 画面动作描述

  -- 状态
  status          VARCHAR(20) DEFAULT 'draft',

  -- JSONB：生成参数 & 灵活属性
  prompts         JSONB DEFAULT '{}',       -- visual/motion prompt、负面提示词
  transition      JSONB DEFAULT '{}',       -- type, duration_s, params
  audio           JSONB DEFAULT '{}',       -- sfx_bgm 描述、bgm_ref
  playback        JSONB DEFAULT '{}',       -- speed, trim_start, trim_end
  display         JSONB DEFAULT '{}',       -- emotion, notes, UI 标记
  meta            JSONB DEFAULT '{}',       -- 任意扩展

  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(episode_id, shot_id)
);

-- 索引
CREATE INDEX idx_shots_episode ON shots(episode_id);
CREATE INDEX idx_shots_episode_order ON shots(episode_id, sort_order);
CREATE INDEX idx_shots_location ON shots(location_ref);
-- GIN 索引：按角色筛选镜头
CREATE INDEX idx_shots_characters ON shots USING GIN(character_refs);
-- JSONB 路径索引示例（按需添加）
CREATE INDEX idx_shots_prompts ON shots USING GIN(prompts jsonb_path_ops);
```

**prompts JSONB 示例：**
```jsonc
{
  "visual": "A vast futuristic cityscape at dawn, golden data streams...",
  "motion": "Slow dolly forward through the data streams",
  "negative": "blurry, low quality"
}
```

**transition JSONB 示例：**
```jsonc
{
  "type": "fadewhite",      // cut | fadewhite | dissolve | xfade
  "duration_s": 0.5,
  "params": {}
}
```

**playback JSONB 示例：**
```jsonc
{
  "speed": 1.0,
  "trim_start": 0,
  "trim_end": null
}
```

### 为什么这样拆分？

| 字段 | 为什么结构化 / 为什么 JSONB |
|------|---------------------------|
| `sort_order` | `ORDER BY`，拖拽排序 |
| `duration_s` | 时间轴计算、SUM 聚合 |
| `location_ref` / `character_refs` | JOIN 查询、按角色/场景筛选 |
| `camera` / `action` | 编辑器直接显示、全文搜索 |
| `prompts` | 多种 prompt 类型，格式可能扩展，不需要 SQL 查询 |
| `transition` | 结构灵活，不同转场类型有不同参数 |
| `playback` | 低频访问，仅渲染时使用 |

---

## 9. dialogues — 台词

```sql
CREATE TABLE dialogues (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shot_id         UUID NOT NULL REFERENCES shots(id) ON DELETE CASCADE,
  sort_order      INTEGER NOT NULL,
  character_name  VARCHAR(100),
  text            TEXT NOT NULL,
  audio_clip_id   UUID,                   -- → audio_clips.id
  -- JSONB：语音参数
  voice_params    JSONB DEFAULT '{}',     -- emotion, speed, pitch 等
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_dialogues_shot ON dialogues(shot_id);
```

---

## 10. keyframes — 关键帧

```sql
CREATE TABLE keyframes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shot_id             UUID NOT NULL REFERENCES shots(id) ON DELETE CASCADE,
  keyframe_id         VARCHAR(20) NOT NULL,   -- "S01-KF1"
  frame_index         INTEGER NOT NULL,
  timestamp_s         REAL NOT NULL,
  type                VARCHAR(10) NOT NULL,   -- "t2i" | "i2v"
  selected_candidate  INTEGER,
  status              VARCHAR(20) DEFAULT 'pending',
  -- JSONB：生成参数
  generation          JSONB DEFAULT '{}',     -- prompt, camera_state, ref_image, denoise, steps...
  meta                JSONB DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE(shot_id, keyframe_id)
);

CREATE INDEX idx_keyframes_shot ON keyframes(shot_id);
```

**generation JSONB 示例：**
```jsonc
{
  "prompt": "...",
  "camera_state": "中景，固定镜头",
  "ref_image": "/path/to/ref.png",
  "assets": {
    "location_ref": "lingzi_capital_data_core",
    "character_refs": ["hero_john"],
    "prop_refs": []
  },
  "duration_until_next_s": 1.33,
  "model_params": { "steps": 30, "cfg": 7.5, "denoise": 0.85 }
}
```

---

## 11. keyframe_candidates — 关键帧候选图

```sql
CREATE TABLE keyframe_candidates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyframe_id     UUID NOT NULL REFERENCES keyframes(id) ON DELETE CASCADE,
  candidate_index INTEGER NOT NULL,
  image_path      TEXT NOT NULL,
  seed            BIGINT,
  is_selected     BOOLEAN DEFAULT FALSE,
  meta            JSONB DEFAULT '{}',     -- model, steps, cfg, denoise 等
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_kf_candidates_keyframe ON keyframe_candidates(keyframe_id);
```

---

## 12. shot_videos — 镜头视频

```sql
CREATE TABLE shot_videos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shot_id     UUID NOT NULL REFERENCES shots(id) ON DELETE CASCADE,
  video_path  TEXT NOT NULL,
  seed        BIGINT,
  is_selected BOOLEAN DEFAULT FALSE,
  status      VARCHAR(20) DEFAULT 'pending',
  meta        JSONB DEFAULT '{}',     -- frames, fps, model, params...
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_shot_videos_shot ON shot_videos(shot_id);
```

---

## 13. audio_clips — 音频片段

```sql
CREATE TABLE audio_clips (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id  UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  type        VARCHAR(20) NOT NULL,    -- dialogue | sfx | bgm
  shot_id     VARCHAR(20),
  file_path   TEXT NOT NULL,
  duration_s  REAL,
  -- JSONB：提供者信息和参数
  provider    JSONB DEFAULT '{}',     -- { name, voice_id, params... }
  meta        JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audio_clips_episode ON audio_clips(episode_id);
```

---

## 14. voice_profiles — 角色音色配置

```sql
CREATE TABLE voice_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id          UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  character_asset_id  VARCHAR(100) NOT NULL,
  provider            VARCHAR(50) NOT NULL,   -- fish_audio | edge_tts
  voice_id            VARCHAR(200),
  reference_audio     TEXT,
  config              JSONB DEFAULT '{}',     -- speed, pitch, emotion_map 等
  UNIQUE(project_id, character_asset_id)
);
```

---

## 15. tasks — 异步任务

```sql
CREATE TABLE tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  episode_id    UUID,
  type          VARCHAR(50) NOT NULL,
  -- generate_keyframe | generate_video | synthesize_voice |
  -- extract_assets | generate_shots | render_compose | generate_ref_image |
  -- screenplay_generate
  status        VARCHAR(20) DEFAULT 'pending',
  -- pending | queued | running | done | failed | cancelled
  priority      INTEGER DEFAULT 0,
  progress      REAL DEFAULT 0,          -- 0.0 ~ 1.0
  error         TEXT,
  -- JSONB：任务参数和结果
  params        JSONB NOT NULL DEFAULT '{}',
  result        JSONB DEFAULT '{}',
  -- 第三方回调追踪
  external_id   VARCHAR(255),            -- Replicate prediction ID 等
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_external ON tasks(external_id) WHERE external_id IS NOT NULL;
```

---

## 16. RLS 策略模式

所有表通过 project 链路归属到用户：

```sql
-- 子表 RLS 模板（以 episodes 为例）
CREATE POLICY episodes_owner ON episodes
  USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

-- 更深层子表（以 shots 为例）
CREATE POLICY shots_owner ON shots
  USING (
    episode_id IN (
      SELECT e.id FROM episodes e
      JOIN projects p ON e.project_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );
```

> **性能提示：** 深层嵌套 RLS 可能较慢。可在子表冗余 `project_id` 或使用 `security definer` 函数优化。

---

## 17. JSONB 索引最佳实践

```sql
-- GIN 索引：支持 @>, ?, ?| 等操作符
CREATE INDEX idx_shots_prompts ON shots USING GIN(prompts jsonb_path_ops);

-- 表达式索引：频繁查询特定路径
CREATE INDEX idx_tasks_type_from_params ON tasks((params->>'shot_id'));

-- 部分索引：只索引特定状态
CREATE INDEX idx_tasks_running ON tasks(status) WHERE status = 'running';
```

---

## 18. 存储路径约定（Supabase Storage）

```
projects/{project_id}/
├── assets/
│   ├── characters/{asset_id}/ref_*.png
│   ├── locations/{asset_id}/ref_*.png
│   └── props/{asset_id}/ref_*.png
└── episodes/{episode_number}/
    ├── keyframes/S01_KF1_*.png
    ├── videos/S01_video.mp4
    ├── audio/S01_dialogue.wav
    ├── subtitles/
    └── output/final.mp4
```

---

## 19. 迁移文件命名

```
supabase/migrations/
├── 20260214_001_create_projects.sql
├── 20260214_002_create_episodes.sql
├── 20260214_003_create_scripts.sql
├── ...
```
