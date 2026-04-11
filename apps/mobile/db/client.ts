/**
 * Drizzle + expo-sqlite client singleton.
 *
 * Call openDatabase() once at app start (inside useMigrations) and reuse the
 * returned `db` everywhere via the repositories.  The module-level singleton
 * pattern is safe here because React Native bundles are single-process.
 *
 * Foreign keys are enabled immediately after opening so SQLite enforces
 * referential integrity on every write.
 */

import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';
import * as relations from './relations';

const DB_NAME = 'suki.db';

// Lazy singleton — created on first import, reused thereafter.
let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (_db) return _db;

  const sqlite = openDatabaseSync(DB_NAME, { enableChangeListener: true });

  // Connection-level settings applied every open (not in migrations).
  // WAL improves concurrent read performance; FK enforcement is off by default.
  sqlite.execSync('PRAGMA journal_mode = WAL;');
  sqlite.execSync('PRAGMA foreign_keys = ON;');

  _db = drizzle(sqlite, { schema: { ...schema, ...relations } });
  return _db;
}

/** Exported type alias — use wherever Drizzle's db type is needed. */
export type Db = ReturnType<typeof getDb>;
