-- PPT Tracker: Project managers as separate table
-- NOTE: table already exists, this is idempotent

CREATE TABLE IF NOT EXISTS project_managers (
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_uid TEXT NOT NULL DEFAULT '',
  user_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (project_id, user_uid)
);

CREATE INDEX IF NOT EXISTS idx_project_managers_project ON project_managers(project_id);
CREATE INDEX IF NOT EXISTS idx_project_managers_user ON project_managers(user_uid);
