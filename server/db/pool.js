import pg from 'pg';
import { env } from '../env.js';

const { Pool } = pg;

// O Supabase (e a maioria dos Postgres gerenciados em nuvem) exige SSL na
// conexão. Como o node-postgres NÃO habilita SSL por padrão, ativamos quando a
// DATABASE_URL aponta para o Supabase. Em localhost (docker-compose) o SSL fica
// desligado, preservando o comportamento de desenvolvimento.
const useSSL = /supabase/i.test(env.DATABASE_URL || '');

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
