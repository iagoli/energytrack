import pg from 'pg';
import { env } from '../env.js';

const { Pool } = pg;

// Postgres gerenciados em nuvem (Neon, Supabase, Render, etc.) exigem SSL na
// conexão. Como o node-postgres NÃO habilita SSL por padrão, ativamos para
// qualquer host remoto. Em localhost/127.0.0.1 (docker-compose) o SSL fica
// desligado, preservando o comportamento de desenvolvimento.
const isLocalDb = /@(localhost|127\.0\.0\.1)[:/]/i.test(env.DATABASE_URL || '');
const useSSL = !!env.DATABASE_URL && !isLocalDb;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  ssl: useSSL ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (err) => {
  console.error('[db] erro inesperado no pool:', err.message);
});

export function query(text, params) {
  return pool.query(text, params);
}

export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
