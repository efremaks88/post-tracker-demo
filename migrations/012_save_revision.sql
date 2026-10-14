-- A shared revision prevents an old browser snapshot from overwriting newer data.
INSERT INTO app_state(key,value) VALUES('revision','0'::jsonb) ON CONFLICT(key) DO NOTHING;
