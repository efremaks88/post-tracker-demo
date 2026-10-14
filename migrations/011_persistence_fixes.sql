-- POST TRACKER: persist task and stage flags and user interface metadata.
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS cancelled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE stages ADD COLUMN IF NOT EXISTS no_impact BOOLEAN NOT NULL DEFAULT false;
CREATE TABLE IF NOT EXISTS app_state (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
