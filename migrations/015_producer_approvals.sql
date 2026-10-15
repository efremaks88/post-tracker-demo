-- D2: explicit approval requests for producer projects.
CREATE TABLE IF NOT EXISTS production_approvals (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  block_id TEXT NOT NULL REFERENCES production_blocks(id) ON DELETE CASCADE,
  task_id TEXT REFERENCES production_tasks(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  required BOOLEAN NOT NULL DEFAULT true,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','decided')),
  decision TEXT CHECK (decision IN ('approved','rejected')),
  requested_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  requested_by_name TEXT NOT NULL DEFAULT '',
  decided_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  decided_by_name TEXT NOT NULL DEFAULT '',
  decided_at TIMESTAMPTZ,
  decision_comment TEXT NOT NULL DEFAULT '',
  deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (status='pending' AND decision IS NULL AND decided_at IS NULL)
    OR (status='decided' AND decision IS NOT NULL AND decided_at IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_production_approvals_block
  ON production_approvals(block_id, deleted, status, due_date);
CREATE INDEX IF NOT EXISTS idx_production_approvals_project
  ON production_approvals(project_id, deleted, status);
CREATE INDEX IF NOT EXISTS idx_production_approvals_task
  ON production_approvals(task_id, deleted);
