// Runner de migrations simples baseado em arquivos SQL ordenados por nome.
// Registra cada migration aplicada em uma tabela schema_migrations.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function appliedSet() {
  const { rows } = await pool.query('SELECT name FROM schema_migrations');
  return new Set(rows.map((r) => r.name));
}

async function listPendingMigrations() {
  const files = (await fs.readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith('.sql'))
    .sort();
  const applied = await appliedSet();
  return files.filter((f) => !applied.has(f));
}

async function runMigration(name) {
  const filePath = path.join(MIGRATIONS_DIR, name);
  const sql = await fs.readFile(filePath, 'utf8');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('INSERT INTO schema_migrations(name) VALUES ($1)', [name]);
    await client.query('COMMIT');
    console.log(`[migrate] ✓ ${name}`);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(`[migrate] ✗ ${name}: ${e.message}`);
    throw e;
  } finally {
    client.release();
  }
}

async function main() {
  await ensureMigrationsTable();
  const pending = await listPendingMigrations();
  if (!pending.length) {
    console.log('[migrate] sem migrations pendentes.');
    return;
  }
  console.log(`[migrate] aplicando ${pending.length} migration(s)...`);
  for (const name of pending) await runMigration(name);
  console.log('[migrate] concluído.');
}

main()
  .catch((e) => {
    console.error('[migrate] falha:', e);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
