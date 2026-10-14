-- PPT Tracker: allow half-hour task times from the UI

ALTER TABLE tasks
  ALTER COLUMN "from" TYPE DOUBLE PRECISION USING "from"::double precision,
  ALTER COLUMN "to" TYPE DOUBLE PRECISION USING "to"::double precision;
