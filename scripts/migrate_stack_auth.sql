-- Replace clerk_id with stack_id in users table
-- Stack Auth (Neon Auth) uses its own user IDs

ALTER TABLE users ADD COLUMN IF NOT EXISTS stack_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- create unique index on stack_id for ON CONFLICT upsert
CREATE UNIQUE INDEX IF NOT EXISTS users_stack_id_idx ON users(stack_id) WHERE stack_id IS NOT NULL;

-- drop clerk-specific columns (safe to do after Stack Auth is live)
-- ALTER TABLE users DROP COLUMN IF EXISTS clerk_id;
-- (commented out — run manually after verifying Stack Auth works)
