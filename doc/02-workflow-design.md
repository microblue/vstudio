# VStudio — 工作流设计

## 1. 总览

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         VStudio 创作工作流                                   │
│                                                                             │
│  [1] 剧本创作  →  [2] 资产生成  →  [3] 分镜规划  →  [4] 画面生成           │
│       ↓               ↓               ↓               ↓                    │
│  script.md      characters.json  shots.json      keyframe images           │
│                 locations.json   keyframes.json                             │
│                 props.json                                                  │
│                                                                             │
│  [5] 视频生成  →  [6] 音频生成  →  [7] 后期合成  →  [8] 导出               │
│       ↓               ↓               ↓               ↓                    │
│  shot videos     dialogue.wav    timeline         final.mp4                │
│                  sfx/bgm         preview                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

每个阶段都遵循统一模式：**AI 自动生成 → 人工审核/调整 → 确认进入下一阶段**

---

## 2. 阶段详细设计

### 阶段 1：剧本创作

**目的：** 创建或导入剧本文本

| 项目 | 说明 |
|------|------|
| **输入** | 用户创意/大纲，或已有剧本文件 |
| **输出** | `script.md`（标准化剧本格式） |
| **AI 能力** | LLM 辅助创作：大纲扩写、对话润色、场景补充 |
| **人工干预** | 编辑剧本内容、调整情节和对话 |

**UI 交互：**
- 富文本编辑器，支持场景/对话的结构化标记
- 「AI 辅助」按钮：选中文本 → AI 扩写/改写/翻译
- 导入功能：支持 .md / .txt / .fountain 格式粘贴导入
- 剧本模板：提供若干剧本结构模板

**API 调用：**
- `POST /api/llm/generate` — 调用 LLM 辅助创作
  - model: claude-sonnet / claude-opus
  - prompt: 用户选中文本 + 指令（扩写/改写/续写）
  - max_tokens: 4096

---

### 阶段 2：资产生成

**目的：** 从剧本自动提取并生成角色、场景、道具的定义和参考图

#### 2.1 资产提取

| 项目 | 说明 |
|------|------|
| **输入** | `script.md` |
| **输出** | `characters.json`, `locations.json`, `props.json` |
| **AI 能力** | LLM 分析剧本，提取所有实体并生成结构化描述 |
| **人工干预** | 审核/编辑每个资产的描述字段 |

**UI 交互：**
- 点击「提取资产」按钮，AI 自动分析剧本
- 分三个标签页展示：角色 / 场景 / 道具
- 每个资产卡片式展示，可编辑所有字段
- 支持手动新增/删除资产

**API 调用：**
- `POST /api/llm/extract-assets` — 从剧本提取资产
  - input: script 文本
  - output: { characters, locations, props }

#### 2.2 参考图生成

| 项目 | 说明 |
|------|------|
| **输入** | 资产 JSON 定义 |
| **输出** | 每个资产 3 张候选参考图（PNG） |
| **AI 能力** | ComfyUI T2I，基于资产描述生成参考图 |
| **人工干预** | 从候选中选择最佳图片，或重新生成 |

**UI 交互：**
- 每个资产卡片上显示「生成参考图」按钮
- 生成后以网格展示 3 张候选图
- 点击选择主参考图（starred）
- 「重新生成」可调整提示词和种子后再次生成
- 支持上传自定义参考图

**API 调用：**
- `POST /api/comfyui/generate-image` — 生成参考图
  - prompt: 从资产描述自动构建
  - num_candidates: 3
  - size: 1344×768
  - 返回: image URLs

---

### 阶段 3：分镜规划

**目的：** 将剧本拆分为镜头序列，生成完整的分镜表

#### 3.1 镜头拆分（Shots）

| 项目 | 说明 |
|------|------|
| **输入** | `script.md` + 资产定义 |
| **输出** | `shots.json`（镜头列表 + 资产关联） |
| **AI 能力** | LLM 分析剧本，拆分镜头，自动关联资产，生成视觉/运动提示词 |
| **人工干预** | 调整镜头顺序/时长/景别/提示词，增删镜头 |

**UI 交互：**
- 时间轴视图：横向排列所有镜头，拖拽调整顺序和时长
- 镜头详情面板：点击镜头展开编辑
  - 基础信息：shot_id, duration, camera, emotion
  - 资产关联：location_ref, character_refs, prop_refs（下拉选择）
  - 提示词：prompt_visual, prompt_motion（文本编辑）
  - 台词：dialogue 列表编辑
  - 转场：transition_out 类型和时长
- 「AI 生成分镜」按钮：一键从剧本生成整个 shots.json
- 批量操作：选中多个镜头批量修改属性

**API 调用：**
- `POST /api/llm/generate-shots` — 从剧本生成分镜
  - input: script + assets
  - output: shots.json 结构

#### 3.2 关键帧规划（Keyframes）

| 项目 | 说明 |
|------|------|
| **输入** | `shots.json` + 资产定义 |
| **输出** | `keyframes.json`（每个镜头的关键帧时间点和提示词） |
| **AI 能力** | 基于镜头时长和复杂度自动规划关键帧数量和分布 |
| **人工干预** | 调整关键帧数量、时间点、提示词 |

**关键帧数量规则：**
- ≤2s：2 帧
- 2-3s：2-3 帧
- 3-5s：3 帧
- >5s：4 帧

**UI 交互：**
- 在镜头详情中展示关键帧时间轴
- 每个关键帧可编辑 prompt 和 camera_state
- 自动从镜头属性继承资产关联

---

### 阶段 4：画面生成（关键帧图片）

**目的：** 为每个关键帧生成静态图片

| 项目 | 说明 |
|------|------|
| **输入** | `keyframes.json` + 资产参考图 |
| **输出** | 每个关键帧 N 张候选图片（PNG, 1920×1080） |
| **AI 能力** | ComfyUI I2I/T2I，使用参考图 + prompt 生成 |
| **人工干预** | 从候选中选择最佳图片，或重新生成 |

**生成策略：**
- 所有关键帧都基于原始参考图（location + character）独立生成
- 通过不同 prompt 实现运镜变化
- 无累积误差，每帧质量独立保证

**UI 交互：**
- 关键帧网格视图：每个关键帧位置显示候选图
- 点击图片放大预览
- 星标选择最佳候选
- 「重新生成」可调参（seed, denoise strength, prompt）
- 批量生成：一键生成整集所有关键帧
- 进度条显示生成状态（每帧约 1 分钟）

**API 调用：**
- `POST /api/comfyui/generate-keyframe` — 生成单个关键帧
  - prompt: contextual prompt
  - reference_images: [location_ref, character_refs...]
  - size: 1920×1080
  - num_candidates: 3
  - seed: optional
- `POST /api/comfyui/batch-generate-keyframes` — 批量生成
  - episode_id, shot_ids (optional)

---

### 阶段 5：视频生成

**目的：** 从关键帧图片生成镜头视频

| 项目 | 说明 |
|------|------|
| **输入** | 选定的关键帧图片序列 |
| **输出** | 每个镜头一个视频文件（MP4, ~4.8s） |
| **AI 能力** | ComfyUI I2V（LTX-2），关键帧→视频 |
| **人工干预** | 预览视频，不满意则调参重新生成 |

**UI 交互：**
- 镜头视频列表：每个镜头显示视频预览
- 视频播放器：点击播放预览
- 重新生成面板：调整 prompt_motion、seed、帧数等
- 批量生成：一键生成所有镜头视频
- 进度显示（每个镜头约 3 分钟）

**API 调用：**
- `POST /api/comfyui/generate-video` — 生成镜头视频
  - keyframe_images: [path1, path2, ...]
  - prompt_motion: 运动提示词
  - frames: 121 (default)
  - fps: 25
  - seed: optional

---

### 阶段 6：音频生成

**目的：** 生成配音、音效和背景音乐

#### 6.1 配音（TTS）

| 项目 | 说明 |
|------|------|
| **输入** | shots.json 中的 dialogue 字段 |
| **输出** | 每个镜头的对话音频（WAV） |
| **AI 能力** | TTS API（Fish Audio / Edge TTS），支持角色音色克隆 |
| **人工干预** | 预听配音，调整语速/情感/音色 |

**UI 交互：**
- 角色音色管理：每个角色绑定音色（选择预设或上传参考音频）
- 逐条台词预览和重新生成
- 调节参数：语速（speed）、情感（emotion）
- 批量生成整集配音

#### 6.2 音效 & BGM

| 项目 | 说明 |
|------|------|
| **输入** | shots.json 中的 sfx_bgm 字段 |
| **输出** | 音效文件、背景音乐轨道 |
| **AI 能力** | 音效库匹配 + AI 音效生成（未来） |
| **人工干预** | 选择/替换音效，调整音量和时间点 |

**API 调用：**
- `POST /api/tts/synthesize` — 生成单条配音
  - text: 台词文本
  - voice_id: 角色音色 ID
  - speed: 语速倍数
  - emotion: 情感标签
- `POST /api/tts/batch-synthesize` — 批量配音

---

### 阶段 7：后期合成

**目的：** 将视频、音频、字幕合成为最终成片

| 项目 | 说明 |
|------|------|
| **输入** | 镜头视频 + 音频 + 字幕 + 转场配置 |
| **输出** | `final.mp4`（1920×1080, 24fps, H.264+AAC） |
| **AI 能力** | 自动时间轴对齐、转场应用 |
| **人工干预** | 预览完整时间轴，微调转场和音频同步 |

**合成步骤：**
1. 镜头规格化（缩放→1920×1080, 统一帧率）
2. 应用速度调整（slow motion）和裁剪（trim）
3. 应用转场（hard_cut / fadewhite / dissolve / xfade）
4. 字幕生成（SRT/VTT，中文 ≤16 字/行）
5. 多轨音频混合（对话 + SFX + BGM，时间对齐）
6. 最终编码输出

**UI 交互：**
- 时间轴编辑器（类 NLE）：
  - 视频轨：镜头序列 + 转场
  - 音频轨：对话、音效、BGM 分轨显示
  - 字幕轨：字幕时间线
- 实时预览播放器
- 转场编辑：拖拽调整转场类型和时长
- 音频混合：调节各轨音量

**API 调用：**
- `POST /api/render/compose` — 执行最终合成
  - episode_id
  - shots_config (转场、速度、裁剪等)
  - audio_tracks
  - subtitle_config

---

### 阶段 8：导出

**目的：** 输出最终成品

| 项目 | 说明 |
|------|------|
| **输入** | 合成后的视频 |
| **输出** | 可下载的 MP4 文件 |
| **参数** | 分辨率、码率、格式可选 |

**导出规格：**
- 默认：1920×1080, 24fps, H.264, CRF=18, AAC 192kbps
- 可选：720p / 4K / 竖版(9:16) / 字幕烧录

---

## 3. 工作流状态机

每个剧集有一个生产状态：

```
DRAFT → SCRIPT_READY → ASSETS_READY → SHOTS_READY → 
KEYFRAMES_READY → VIDEOS_READY → AUDIO_READY → 
COMPOSING → FINAL_READY → EXPORTED
```

状态转换规则：
- 前一阶段完成才能进入下一阶段
- 可以回退到任意前序阶段重做（会标记后续阶段为 stale）
- 每个阶段内部允许反复迭代（重新生成、编辑、审核）

## 4. 异步任务管理

AI 生成任务耗时较长（秒到分钟级），需要异步处理：

| 任务类型 | 预计耗时 | 并发策略 |
|----------|----------|----------|
| LLM 文本生成 | 5-30s | 可并发 |
| 参考图生成（ComfyUI） | 30-60s/张 | GPU 串行 |
| 关键帧生成（ComfyUI） | 60s/帧 | GPU 串行 |
| 视频生成（ComfyUI I2V） | 3-5min/镜头 | GPU 串行 |
| TTS 配音 | 2-5s/条 | 可并发 |
| 视频合成（FFmpeg） | 30-60s | CPU，可并发 |

**任务队列设计：**
- GPU 任务（ComfyUI）：单队列串行执行，避免显存冲突
- CPU 任务（FFmpeg、字幕）：可并行
- API 任务（LLM、TTS）：可并发，受 API rate limit 约束
- 前端通过 WebSocket 接收任务进度更新
