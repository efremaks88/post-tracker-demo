-- A3: structured, append-only application audit events.
-- Legacy columns stay in place so old installations and exports remain readable.
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS event_id TEXT;
UPDATE audit_log SET event_id = 'legacy-' || id::text WHERE event_id IS NULL OR event_id = '';
ALTER TABLE audit_log ALTER COLUMN event_id SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_audit_event_id ON audit_log(event_id);

ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS occurred_at TIMESTAMPTZ;
UPDATE audit_log SET occurred_at = created_at AT TIME ZONE 'UTC' WHERE occurred_at IS NULL;
ALTER TABLE audit_log ALTER COLUMN occurred_at SET DEFAULT NOW();
ALTER TABLE audit_log ALTER COLUMN occurred_at SET NOT NULL;

ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS project_id TEXT;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS series_id TEXT;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS changes JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'user';
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS reason TEXT NOT NULL DEFAULT '';
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS request_id TEXT NOT NULL DEFAULT '';
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'standard';

CREATE INDEX IF NOT EXISTS idx_audit_occurred ON audit_log(occurred_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_audit_project ON audit_log(project_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_series ON audit_log(series_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action, occurred_at DESC);
