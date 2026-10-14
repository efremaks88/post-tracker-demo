-- D0: producer workspace entities. These are deliberately separate from
-- post-production shifts stored in the legacy tasks table.
CREATE TABLE IF NOT EXISTS production_blocks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  series_id TEXT REFERENCES series(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  owner_person_id TEXT REFERENCES people(id) ON DELETE SET NULL,
  owner_name TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'planned',
  start_date DATE,
  deadline DATE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#7c6f64',
  deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS production_task_groups (
  id TEXT PRIMARY KEY,
  block_id TEXT NOT NULL REFERENCES production_blocks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS production_tasks (
  id TEXT PRIMARY KEY,
  block_id TEXT NOT NULL REFERENCES production_blocks(id) ON DELETE CASCADE,
  group_id TEXT REFERENCES production_task_groups(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  assignee_person_id TEXT REFERENCES people(id) ON DELETE SET NULL,
  assignee_name TEXT NOT NULL DEFAULT '',
  responsible_person_id TEXT REFERENCES people(id) ON DELETE SET NULL,
  responsible_name TEXT NOT NULL DEFAULT '',
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'todo',
  sort_order INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_production_blocks_project ON production_blocks(project_id, deleted, sort_order);
CREATE INDEX IF NOT EXISTS idx_production_blocks_series ON production_blocks(series_id, deleted, sort_order);
CREATE INDEX IF NOT EXISTS idx_production_blocks_deadline ON production_blocks(deadline, deleted);
CREATE INDEX IF NOT EXISTS idx_production_groups_block ON production_task_groups(block_id, deleted, sort_order);
CREATE INDEX IF NOT EXISTS idx_production_tasks_block ON production_tasks(block_id, deleted, sort_order);
CREATE INDEX IF NOT EXISTS idx_production_tasks_group ON production_tasks(group_id, deleted, sort_order);
CREATE INDEX IF NOT EXISTS idx_production_tasks_assignee ON production_tasks(assignee_person_id, status, deleted);
CREATE INDEX IF NOT EXISTS idx_production_tasks_deadline ON production_tasks(deadline, status, deleted);
