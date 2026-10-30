import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

const filename = resolve(process.env.DB_PATH || 'data/skillbridge.sqlite')
mkdirSync(dirname(filename), { recursive: true })

export const database = new DatabaseSync(filename)
database.exec(`
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    phone TEXT NOT NULL DEFAULT '',
    college TEXT NOT NULL DEFAULT '',
    education_level TEXT NOT NULL,
    email_verified INTEGER NOT NULL DEFAULT 0,
    terms_accepted_at TEXT NOT NULL DEFAULT '',
    privacy_accepted_at TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS sessions_user_id ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);

  CREATE TABLE IF NOT EXISTS auth_tokens (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    purpose TEXT NOT NULL CHECK (purpose IN ('verify_email', 'reset_password')),
    expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS auth_tokens_user_purpose ON auth_tokens(user_id, purpose);

  CREATE TABLE IF NOT EXISTS resumes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_name TEXT NOT NULL,
    target_role TEXT NOT NULL DEFAULT '',
    template TEXT NOT NULL DEFAULT 'modern',
    accent TEXT NOT NULL DEFAULT '#397bff',
    resume_data TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS resumes_user_updated ON resumes(user_id, updated_at DESC);
`)

const userColumns = new Set(database.prepare('PRAGMA table_info(users)').all().map(column => column.name))
for (const column of ['terms_accepted_at', 'privacy_accepted_at']) {
  if (!userColumns.has(column)) database.exec(`ALTER TABLE users ADD COLUMN ${column} TEXT NOT NULL DEFAULT ''`)
}