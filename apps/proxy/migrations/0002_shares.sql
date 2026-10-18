-- Mentor sharing (docs/02, decision D36). Rows are found by the hash of the link's token and
-- updated only with the device's key; no device ID, name or IP is stored.
CREATE TABLE IF NOT EXISTS shares (
  token_hash TEXT PRIMARY KEY,
  key_hash TEXT NOT NULL,
  payload TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
