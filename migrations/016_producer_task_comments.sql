-- D2.2: a compact internal working comment for each producer task.
ALTER TABLE production_tasks
  ADD COLUMN IF NOT EXISTS internal_comment TEXT NOT NULL DEFAULT '';
