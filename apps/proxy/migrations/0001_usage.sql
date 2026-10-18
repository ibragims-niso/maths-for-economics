-- Daily AI calls per device and per network (docs/02 D1 tables). Network keys are hashed with
-- the day, so no IP address is stored.
CREATE TABLE IF NOT EXISTS usage (
  device_id TEXT NOT NULL,
  day TEXT NOT NULL,
  ai_calls INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (device_id, day)
);
