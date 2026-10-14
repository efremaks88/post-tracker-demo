-- PPT Tracker: persist manual series status selected in UI

ALTER TABLE series
  ADD COLUMN IF NOT EXISTS manual_status TEXT DEFAULT '';
