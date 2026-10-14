-- PPT Tracker: per-series custom project milestone dates

ALTER TABLE series
  ADD COLUMN IF NOT EXISTS custom_milestones JSONB DEFAULT '[]'::jsonb;
