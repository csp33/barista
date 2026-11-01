CREATE TABLE IF NOT EXISTS user_coffee_statuses (
  user_id VARCHAR(64) NOT NULL,
  coffee_id VARCHAR(128) NOT NULL REFERENCES coffees(id) ON DELETE CASCADE,
  status VARCHAR(32) NOT NULL DEFAULT 'bodega',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, coffee_id)
);

CREATE INDEX IF NOT EXISTS idx_user_coffee_statuses_user ON user_coffee_statuses(user_id);
