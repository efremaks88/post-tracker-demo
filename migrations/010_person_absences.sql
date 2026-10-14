CREATE TABLE IF NOT EXISTS person_absences (
  id TEXT PRIMARY KEY,
  person_id TEXT DEFAULT '',
  person_name TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'dayoff',
  start_day TEXT NOT NULL,
  end_day TEXT NOT NULL,
  note TEXT DEFAULT '',
  deleted BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_person_absences_person ON person_absences(person_name);
CREATE INDEX IF NOT EXISTS idx_person_absences_start ON person_absences(start_day);
CREATE INDEX IF NOT EXISTS idx_person_absences_end ON person_absences(end_day);
