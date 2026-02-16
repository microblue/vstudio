-- VStudio Seed Data (Simplified)
-- 注释掉依赖真实用户的数据，可以在有真实用户后手动添加

-- Note: 由于外键约束，实际的业务数据需要：
-- 1. 先在 Supabase Auth 中创建用户
-- 2. 然后使用真实的 user_id 创建项目数据

-- 这里只包含不依赖用户的配置数据，或者在应用中动态创建

-- 示例：系统配置数据 (如果有的话)
-- INSERT INTO system_config (key, value) VALUES 
-- ('default_resolution', '1920x1080'),
-- ('default_fps', '24');

-- 测试数据将在用户注册后通过应用界面创建
-- 或者可以手动在 Supabase Dashboard 中添加

-- 为开发测试，可以先创建一个用户：
-- 1. 访问 http://localhost:54323 (Supabase Studio)
-- 2. 在 Authentication > Users 中创建用户
-- 3. 复制用户 ID，替换下面的示例数据

/*
-- 示例项目数据 (需要替换 user_id)
INSERT INTO projects (id, user_id, name, description, status, settings) VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  '替换为真实用户ID',
  '测试短剧：都市爱情故事',
  '一个关于现代都市年轻人爱情故事的短剧',
  'active',
  '{"resolution": "1920x1080", "fps": 24, "aspect_ratio": "16:9"}'
);
*/