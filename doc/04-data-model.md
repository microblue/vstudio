# VStudio — 数据模型设计

## 1. ER 关系图

```
Project 1──N Episode
Project 1──N Character
Project 1──N Location
Project 1──N Prop
Project 1──1 StyleBible
Project 1──N VoiceProfile

Episode 1──1 Script
Episode 1──N Shot
Episode 1──1 RenderJob

Shot 1──N Keyframe
Shot N──1 Location (via location_ref)
Shot N──N Character (via character_refs)
Shot N──N Prop (via prop_refs)
Shot 1──N Dialogue

Keyframe 1──N KeyframeCandidate (生成的候选图)
Shot 1──N ShotVideo (生成的候选视频)
Shot 1──N AudioClip

Dialogue 1──1 AudioClip (TTS生成的音频)
```

---

## 2. 核心实体

### 2.1 Project（项目）

```sql
CREATE TABLE projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  cover_image   VARCHAR(500),       -- 封面图URL
  status        VARCHAR(50) DEFAULT 'active',  -- active, archived
  settings      JSONB DEFAULT '{}', -- 项目级设置
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);
```

**settings JSON 示例：**
```json
{
  "resolution": "1920x1080",
  "fps": 24,
  "aspect_ratio": "16:9",
  "default_t2i_candidates": 3,
  "negative_prompt": "anatomy error, face distortion...",
  "style_prefix": "cinematic film still, photorealistic..."
}
```

### 2.2 Episode（剧集）

```sql
CREATE TABLE episodes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID REFERENCES projects(id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL,   -- ep001 → 1
  title         VARCHAR(255),
  status        VARCHAR(50) DEFAULT 'draft',
  -- 状态: draft, script_ready, assets_ready, shots_ready,
  --       keyframes_ready, videos_ready, audio_ready,
  --       composing, final_ready, exported
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, episode_number)
);
```

### 2.3 Script（剧本）

```sql
CREATE TABLE scripts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id    UUID UNIQUE REFERENCES episodes(id) ON DELETE CASCADE,
  content       TEXT NOT NULL,         -- Markdown 格式的剧本内容
  version       INTEGER DEFAULT 1,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE script_versions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id     UUID REFERENCES scripts(id) ON DELETE CASCADE,
  version       INTEGER NOT NULL,
  content       TEXT NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW()
);
```

### 2.4 Character（角色）

```sql
CREATE TABLE characters (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID REFERENCES projects(id) ON DELETE CASCADE,
  asset_id      VARCHAR(100) NOT NULL, -- 英文ID: "hero_john"
  zh_name       VARCHAR(100),
  en_name       VARCHAR(100),
  gender        VARCHAR(20),           -- male, female, other
  age           VARCHAR(50),           -- "16岁少年"
  appearance    TEXT,                  -- 外貌描述
  costume       TEXT,                  -- 服装描述
  personality   TEXT,                  -- 性格描述
  visual_prompts TEXT[],              -- 补充生成提示词
  color_palette  TEXT[],              -- 代表色
  reference_image VARCHAR(500),       -- 主参考图URL
  metadata      JSONB DEFAULT '{}',   -- 扩展字段
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, asset_id)
);
```

### 2.5 Location（场景）

```sql
CREATE TABLE locations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID REFERENCES projects(id) ON DELETE CASCADE,
  asset_id      VARCHAR(100) NOT NULL,
  zh_name       VARCHAR(200),
  en_name       VARCHAR(200),
  type          VARCHAR(100),          -- "未来都市", "原始沼泽"
  atmosphere    TEXT,
  visual_style  TEXT,
  color_palette TEXT[],
  key_features  TEXT[],
  prompts       TEXT[],               -- 生成用提示词
  era           VARCHAR(100),
  reference_image VARCHAR(500),
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, asset_id)
);
```

### 2.6 Prop（道具）

```sql
CREATE TABLE props (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID REFERENCES projects(id) ON DELETE CASCADE,
  asset_id      VARCHAR(100) NOT NULL,
  zh_name       VARCHAR(200),
  en_name       VARCHAR(200),
  description   TEXT,
  visual_prompts TEXT[],
  reference_image VARCHAR(500),
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, asset_id)
);
```

### 2.7 Shot（镜头）

```sql
CREATE TABLE shots (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id    UUID REFERENCES episodes(id) ON DELETE CASCADE,
  shot_id       VARCHAR(20) NOT NULL,  -- "S01", "S02"
  scene         VARCHAR(20),           -- "1-1"
  sort_order    INTEGER NOT NULL,      -- 排序序号
  duration_s    FLOAT NOT NULL DEFAULT 3.0,
  location_desc TEXT,                  -- 场景描述文本
  location_ref  VARCHAR(100),          -- → locations.asset_id
  character_refs TEXT[],               -- → characters.asset_id[]
  prop_refs     TEXT[],                -- → props.asset_id[]
  camera        TEXT,                  -- 景别/运镜
  action        TEXT,                  -- 画面动作描述
  emotion       VARCHAR(100),
  prompt_visual TEXT,                  -- T2I 提示词
  prompt_motion TEXT,                  -- I2V 提示词
  transition_out VARCHAR(50) DEFAULT 'cut', -- cut, fadewhite, dissolve, xfade
  transition_duration_s FLOAT DEFAULT 0,
  sfx_bgm       TEXT,                 -- 音效/BGM 描述
  speed         FLOAT DEFAULT 1.0,    -- 播放速度
  trim_start    FLOAT DEFAULT 0,
  trim_end      FLOAT,
  notes         TEXT,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW(),
  UNIQUE(episode_id, shot_id)
);
```

### 2.8 Dialogue（台词）

```sql
CREATE TABLE dialogues (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shot_id       UUID REFERENCES shots(id) ON DELETE CASCADE,
  sort_order    INTEGER NOT NULL,
  character_name VARCHAR(100),         -- 说话角色
  text          TEXT NOT NULL,         -- 台词文本
  emotion       VARCHAR(100),
  speed         FLOAT DEFAULT 1.0,
  audio_clip_id UUID,                 -- → audio_clips.id (TTS生成的音频)
  created_at    TIMESTAMP DEFAULT NOW()
);
```

### 2.9 Keyframe（关键帧）

```sql
CREATE TABLE keyframes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shot_id       UUID REFERENCES shots(id) ON DELETE CASCADE,
  keyframe_id   VARCHAR(20) NOT NULL,  -- "S01-KF1"
  frame_index   INTEGER NOT NULL,      -- 0, 1, 2...
  timestamp_s   FLOAT NOT NULL,        -- 在镜头内的时间点
  type          VARCHAR(10) NOT NULL,  -- "t2i" 或 "i2v"
  prompt        TEXT,                  -- 上下文提示词
  camera_state  TEXT,                  -- 镜头状态描述
  selected_candidate INTEGER,          -- 选中的候选图索引
  status        VARCHAR(20) DEFAULT 'pending', -- pending, generating, done, failed
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW(),
  UNIQUE(shot_id, keyframe_id)
);
```

### 2.10 KeyframeCandidate（关键帧候选图）

```sql
CREATE TABLE keyframe_candidates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyframe_id   UUID REFERENCES keyframes(id) ON DELETE CASCADE,
  candidate_index INTEGER NOT NULL,    -- 0, 1, 2
  image_path    VARCHAR(500) NOT NULL, -- 文件存储路径
  seed          BIGINT,
  is_selected   BOOLEAN DEFAULT FALSE,
  metadata      JSONB DEFAULT '{}',    -- denoise, steps 等参数
  created_at    TIMESTAMP DEFAULT NOW()
);
```

### 2.11 ShotVideo（镜头视频）

```sql
CREATE TABLE shot_videos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shot_id       UUID REFERENCES shots(id) ON DELETE CASCADE,
  video_path    VARCHAR(500) NOT NULL,
  seed          BIGINT,
  frames        INTEGER,
  fps           INTEGER,
  is_selected   BOOLEAN DEFAULT FALSE,
  status        VARCHAR(20) DEFAULT 'pending',
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMP DEFAULT NOW()
);
```

### 2.12 AudioClip（音频片段）

```sql
CREATE TABLE audio_clips (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id    UUID REFERENCES episodes(id) ON DELETE CASCADE,
  type          VARCHAR(20) NOT NULL,  -- "dialogue", "sfx", "bgm"
  shot_id       VARCHAR(20),           -- 关联镜头
  file_path     VARCHAR(500) NOT NULL,
  duration_s    FLOAT,
  provider      VARCHAR(50),           -- "fish_audio", "edge_tts"
  voice_id      VARCHAR(100),
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMP DEFAULT NOW()
);
```

### 2.13 VoiceProfile（角色音色配置）

```sql
CREATE TABLE voice_profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID REFERENCES projects(id) ON DELETE CASCADE,
  character_asset_id VARCHAR(100) NOT NULL, -- → characters.asset_id
  provider      VARCHAR(50) NOT NULL,  -- "fish_audio", "edge_tts"
  voice_id      VARCHAR(200),          -- 音色ID或名称
  speed         FLOAT DEFAULT 1.0,
  reference_audio VARCHAR(500),        -- 参考音频URL（音色克隆用）
  metadata      JSONB DEFAULT '{}',
  UNIQUE(project_id, character_asset_id)
);
```

### 2.14 Task（异步任务）

```sql
CREATE TABLE tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID REFERENCES projects(id) ON DELETE CASCADE,
  episode_id    UUID,
  type          VARCHAR(50) NOT NULL,
  -- 类型: generate_keyframe, generate_video, synthesize_voice,
  --       extract_assets, generate_shots, render_compose, generate_ref_image
  status        VARCHAR(20) DEFAULT 'pending',
  -- 状态: pending, queued, running, done, failed, cancelled
  priority      INTEGER DEFAULT 0,
  progress      FLOAT DEFAULT 0,       -- 0.0 ~ 1.0
  params        JSONB NOT NULL,        -- 任务参数
  result        JSONB,                 -- 任务结果
  error         TEXT,                  -- 错误信息
  started_at    TIMESTAMP,
  completed_at  TIMESTAMP,
  created_at    TIMESTAMP DEFAULT NOW()
);
```

---

## 3. 文件存储结构

所有生成的媒体文件存储在文件系统中，数据库只记录路径。

```
storage/
├── projects/
│   └── {project_id}/
│       ├── assets/
│       │   ├── characters/
│       │   │   └── {asset_id}/
│       │   │       ├── ref_000_seed12345.png
│       │   │       ├── ref_001_seed67890.png
│       │   │       └── ref_002_seed11111.png
│       │   ├── locations/
│       │   │   └── {asset_id}/
│       │   │       └── ref_*.png
│       │   └── props/
│       │       └── {asset_id}/
│       │           └── ref_*.png
│       └── episodes/
│           └── {episode_number}/
│               ├── keyframes/
│               │   ├── S01_KF1_000_seed42.png
│               │   ├── S01_KF1_001_seed99.png
│               │   └── ...
│               ├── videos/
│               │   ├── S01_video.mp4
│               │   ├── S02_video.mp4
│               │   └── ...
│               ├── audio/
│               │   ├── S01_dialogue.wav
│               │   ├── S03_sfx.wav
│               │   └── ...
│               ├── subtitles/
│               │   ├── subtitles.srt
│               │   └── subtitles.vtt
│               └── output/
│                   ├── final.mp4
│                   └── render_log.txt
```

---

## 4. JSON 数据导出

VStudio 数据库是 source of truth。支持通过 Edge Function 导出标准 JSON 格式，用于外部工具集成或备份：

- `GET /functions/v1/export-shots?episode_id=xxx` → 镜头数据 JSON
- `GET /functions/v1/export-characters?project_id=xxx` → 角色数据 JSON

导出格式由 VStudio 自行定义，按需扩展。

---

## 5. 索引设计

```sql
-- 常用查询索引
CREATE INDEX idx_episodes_project ON episodes(project_id);
CREATE INDEX idx_shots_episode ON shots(episode_id);
CREATE INDEX idx_shots_episode_order ON shots(episode_id, sort_order);
CREATE INDEX idx_keyframes_shot ON keyframes(shot_id);
CREATE INDEX idx_keyframe_candidates_kf ON keyframe_candidates(keyframe_id);
CREATE INDEX idx_dialogues_shot ON dialogues(shot_id);
CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_audio_clips_episode ON audio_clips(episode_id);
```
