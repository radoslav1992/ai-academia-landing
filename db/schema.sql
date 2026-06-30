-- AI Академия — subscribers schema (Cloudflare D1 / SQLite)
-- Apply locally:  npm run db:init
-- Apply to prod:  npm run db:init:remote

CREATE TABLE IF NOT EXISTS subscribers (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  email       TEXT    NOT NULL,
  courses     TEXT    NOT NULL,                       -- JSON array of course ids, e.g. ["webdev","media"]
  consent     INTEGER NOT NULL DEFAULT 1,             -- 1 = explicit GDPR consent given
  source      TEXT,                                   -- which CTA opened the form (optional)
  ip          TEXT,                                   -- coarse network info for abuse prevention
  user_agent  TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- One logical subscriber per email; re-submitting merges/updates their record.
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_created_at ON subscribers(created_at);
