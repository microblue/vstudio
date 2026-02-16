-- VStudio Database Schema
-- All tables in one migration for initial setup

-- 1. Projects
CREATE TABLE projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  cover_image   TEXT,
  status        VARCHAR(20) DEFAULT 'active',
  settings      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 2. Episodes
CREATE TABLE episodes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL,
  title         VARCHAR(255),
  status        VARCHAR(50) DEFAULT 'draft',
  meta          JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, episode_number)
);

-- 3. Scripts
CREATE TABLE scripts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id    UUID UNIQUE NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  content       TEXT NOT NULL DEFAULT '',
  version       INTEGER DEFAULT 1,
  meta          JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 4. Characters
CREATE TABLE characters (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  asset_id      VARCHAR(100) NOT NULL,
  zh_name       VARCHAR(100),
  en_name       VARCHAR(100),
  gender        VARCHAR(20),
  age           VARCHAR(50),
  appearance    TEXT,
  costume       TEXT,
  personality   TEXT,
  visual_prompts TEXT[],
  color_palette  TEXT[],
  reference_image VARCHAR(500),
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, asset_id)
);

-- 5. Locations
CREATE TABLE locations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  asset_id      VARCHAR(100) NOT NULL,
  zh_name       VARCHAR(200),
  en_name       VARCHAR(200),
  type          VARCHAR(100),
  atmosphere    TEXT,
  visual_style  TEXT,
  color_palette TEXT[],
  key_features  TEXT[],
  prompts       TEXT[],
  era           VARCHAR(100),
  reference_image VARCHAR(500),
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, asset_id)
);

-- 6. Props
CREATE TABLE props (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  asset_id      VARCHAR(100) NOT NULL,
  zh_name       VARCHAR(200),
  en_name       VARCHAR(200),
  description   TEXT,
  visual_prompts TEXT[],
  reference_image VARCHAR(500),
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, asset_id)
);

-- 7. Shots
CREATE TABLE shots (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id    UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  shot_id       VARCHAR(20) NOT NULL,
  scene         VARCHAR(20),
  sort_order    INTEGER NOT NULL,
  duration_s    FLOAT NOT NULL DEFAULT 3.0,
  location_desc TEXT,
  location_ref  VARCHAR(100),
  character_refs TEXT[],
  prop_refs     TEXT[],
  camera        TEXT,
  action        TEXT,
  emotion       VARCHAR(100),
  prompt_visual TEXT,
  prompt_motion TEXT,
  transition_out VARCHAR(50) DEFAULT 'cut',
  transition_duration_s FLOAT DEFAULT 0,
  sfx_bgm       TEXT,
  speed         FLOAT DEFAULT 1.0,
  trim_start    FLOAT DEFAULT 0,
  trim_end      FLOAT,
  notes         TEXT,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(episode_id, shot_id)
);

-- 8. Dialogues
CREATE TABLE dialogues (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shot_id       UUID NOT NULL REFERENCES shots(id) ON DELETE CASCADE,
  sort_order    INTEGER NOT NULL,
  character_name VARCHAR(100),
  text          TEXT NOT NULL,
  emotion       VARCHAR(100),
  speed         FLOAT DEFAULT 1.0,
  audio_clip_id UUID,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 9. Keyframes
CREATE TABLE keyframes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shot_id       UUID REFERENCES shots(id) ON DELETE CASCADE,
  keyframe_id   VARCHAR(20) NOT NULL,
  frame_index   INTEGER NOT NULL,
  timestamp_s   FLOAT NOT NULL,
  type          VARCHAR(10) NOT NULL DEFAULT 't2i',
  prompt        TEXT,
  camera_state  TEXT,
  selected_candidate INTEGER,
  status        VARCHAR(20) DEFAULT 'pending',
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(shot_id, keyframe_id)
);

-- 10. Keyframe Candidates
CREATE TABLE keyframe_candidates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyframe_id   UUID REFERENCES keyframes(id) ON DELETE CASCADE,
  candidate_index INTEGER NOT NULL,
  image_path    VARCHAR(500) NOT NULL,
  seed          BIGINT,
  is_selected   BOOLEAN DEFAULT FALSE,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 11. Shot Videos
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
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 12. Audio Clips
CREATE TABLE audio_clips (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id    UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  type          VARCHAR(20) NOT NULL,
  shot_id       UUID REFERENCES shots(id) ON DELETE SET NULL,
  file_path     VARCHAR(500) NOT NULL,
  duration_s    FLOAT,
  provider      VARCHAR(50),
  voice_id      VARCHAR(100),
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Add FK for dialogues.audio_clip_id
ALTER TABLE dialogues ADD CONSTRAINT fk_dialogues_audio_clip
  FOREIGN KEY (audio_clip_id) REFERENCES audio_clips(id) ON DELETE SET NULL;

-- 13. Voice Profiles
CREATE TABLE voice_profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  character_asset_id VARCHAR(100) NOT NULL,
  provider      VARCHAR(50) NOT NULL,
  voice_id      VARCHAR(200),
  speed         FLOAT DEFAULT 1.0,
  reference_audio VARCHAR(500),
  metadata      JSONB DEFAULT '{}',
  UNIQUE(project_id, character_asset_id)
);

-- 14. Tasks
CREATE TABLE tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  episode_id    UUID REFERENCES episodes(id) ON DELETE SET NULL,
  type          VARCHAR(50) NOT NULL,
  status        VARCHAR(20) DEFAULT 'pending',
  provider      VARCHAR(50),
  external_id   VARCHAR(255),
  priority      INTEGER DEFAULT 0,
  progress      FLOAT DEFAULT 0,
  params        JSONB NOT NULL DEFAULT '{}',
  result        JSONB,
  error         TEXT,
  retry_count   INTEGER DEFAULT 0,
  max_retries   INTEGER DEFAULT 3,
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 15. Screenplay Drafts
CREATE TABLE screenplay_drafts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id          UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version             INTEGER NOT NULL DEFAULT 1,
  status              VARCHAR(20) DEFAULT 'generating',
  outline             TEXT NOT NULL,
  genre               VARCHAR(50),
  target_duration     VARCHAR(20),
  language            VARCHAR(20) DEFAULT 'zh',
  model               VARCHAR(100) NOT NULL,
  generated_script    TEXT,
  input_params        JSONB DEFAULT '{}',
  generation_info     JSONB DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_episodes_project ON episodes(project_id);
CREATE INDEX idx_shots_episode ON shots(episode_id);
CREATE INDEX idx_shots_episode_order ON shots(episode_id, sort_order);
CREATE INDEX idx_keyframes_shot ON keyframes(shot_id);
CREATE INDEX idx_keyframe_candidates_kf ON keyframe_candidates(keyframe_id);
CREATE INDEX idx_dialogues_shot ON dialogues(shot_id);
CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_external ON tasks(external_id) WHERE external_id IS NOT NULL;
CREATE INDEX idx_audio_clips_episode ON audio_clips(episode_id);
CREATE INDEX idx_screenplay_drafts_project ON screenplay_drafts(project_id);

-- RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE props ENABLE ROW LEVEL SECURITY;
ALTER TABLE shots ENABLE ROW LEVEL SECURITY;
ALTER TABLE dialogues ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyframes ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyframe_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE shot_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE screenplay_drafts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY projects_owner ON projects
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY episodes_owner ON episodes
  FOR ALL USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY scripts_owner ON scripts
  FOR ALL USING (episode_id IN (SELECT e.id FROM episodes e JOIN projects p ON e.project_id = p.id WHERE p.user_id = auth.uid()));

CREATE POLICY characters_owner ON characters
  FOR ALL USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY locations_owner ON locations
  FOR ALL USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY props_owner ON props
  FOR ALL USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY shots_owner ON shots
  FOR ALL USING (episode_id IN (SELECT e.id FROM episodes e JOIN projects p ON e.project_id = p.id WHERE p.user_id = auth.uid()));

CREATE POLICY dialogues_owner ON dialogues
  FOR ALL USING (shot_id IN (SELECT s.id FROM shots s JOIN episodes e ON s.episode_id = e.id JOIN projects p ON e.project_id = p.id WHERE p.user_id = auth.uid()));

CREATE POLICY keyframes_owner ON keyframes
  FOR ALL USING (shot_id IN (SELECT s.id FROM shots s JOIN episodes e ON s.episode_id = e.id JOIN projects p ON e.project_id = p.id WHERE p.user_id = auth.uid()));

CREATE POLICY keyframe_candidates_owner ON keyframe_candidates
  FOR ALL USING (keyframe_id IN (SELECT k.id FROM keyframes k JOIN shots s ON k.shot_id = s.id JOIN episodes e ON s.episode_id = e.id JOIN projects p ON e.project_id = p.id WHERE p.user_id = auth.uid()));

CREATE POLICY shot_videos_owner ON shot_videos
  FOR ALL USING (shot_id IN (SELECT s.id FROM shots s JOIN episodes e ON s.episode_id = e.id JOIN projects p ON e.project_id = p.id WHERE p.user_id = auth.uid()));

CREATE POLICY audio_clips_owner ON audio_clips
  FOR ALL USING (episode_id IN (SELECT e.id FROM episodes e JOIN projects p ON e.project_id = p.id WHERE p.user_id = auth.uid()));

CREATE POLICY voice_profiles_owner ON voice_profiles
  FOR ALL USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY tasks_owner ON tasks
  FOR ALL USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY screenplay_drafts_owner ON screenplay_drafts
  FOR ALL USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));
