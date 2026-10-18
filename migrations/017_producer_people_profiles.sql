-- D2.6: self-authored producer profile details.
-- Workload remains derived from confirmed tasks and shifts; only the short
-- headline and personal highlights are stored on the person record.
ALTER TABLE people
  ADD COLUMN IF NOT EXISTS producer_headline TEXT NOT NULL DEFAULT '';

ALTER TABLE people
  ADD COLUMN IF NOT EXISTS producer_achievements JSONB NOT NULL DEFAULT '[]'::jsonb;
