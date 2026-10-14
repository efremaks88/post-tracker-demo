CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '',
  image TEXT DEFAULT '',
  color TEXT DEFAULT '#38bdf8',
  rule_type TEXT NOT NULL DEFAULT 'shifts_count',
  threshold INTEGER NOT NULL DEFAULT 1,
  stage_id TEXT DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO achievements (id, title, description, icon, image, color, rule_type, threshold, stage_id, enabled) VALUES
  ('shifts_50','Полтинник','Отработал 50 смен','50','','#38bdf8','shifts_count',50,'',true),
  ('shifts_100','Сотня','100 смен в трекере','100','','#60a5fa','shifts_count',100,'',true),
  ('shifts_250','Железный сезон','250 смен','250','','#818cf8','shifts_count',250,'',true),
  ('hours_500','Марафонец','500 часов работы','500','','#14b8a6','hours_count',500,'',true),
  ('masters_10','Мастер сдач','10 смен на мастеринге','M10','','#22c55e','masters_count',10,'',true),
  ('projects_5','Широкий профиль','Работал на 5 проектах','5P','','#a78bfa','projects_count',5,'',true),
  ('projects_day_3','Три фронта','3 проекта за один день','3D','','#f59e0b','projects_one_day',3,'',true),
  ('montage_20','Монтажный двигатель','20 смен на этапе монтажа','ED','','#6366f1','stage_task_count',20,'монтаж',true)
ON CONFLICT (id) DO NOTHING;
