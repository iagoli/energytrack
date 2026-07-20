import { query } from '../db/pool.js';

const PUBLIC_FIELDS = 'id, email, name, avatar_url, email_verified, google_id, created_at, last_login_at';

export async function findByEmail(email) {
  const { rows } = await query(
    `SELECT id, email, name, avatar_url, email_verified, google_id, password_hash, created_at, last_login_at
       FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

export async function findById(id) {
  const { rows } = await query(
    `SELECT ${PUBLIC_FIELDS} FROM users WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function findByGoogleId(googleId) {
  const { rows } = await query(
    `SELECT ${PUBLIC_FIELDS} FROM users WHERE google_id = $1 LIMIT 1`,
    [googleId]
  );
  return rows[0] || null;
}

export async function createWithPassword({ email, name, passwordHash }) {
  const { rows } = await query(
    `INSERT INTO users (email, name, password_hash, email_verified)
     VALUES ($1, $2, $3, FALSE)
     RETURNING ${PUBLIC_FIELDS}`,
    [email, name || null, passwordHash]
  );
  return rows[0];
}

export async function createWithGoogle({ email, name, googleId, avatarUrl }) {
  const { rows } = await query(
    `INSERT INTO users (email, name, google_id, avatar_url, email_verified)
     VALUES ($1, $2, $3, $4, TRUE)
     RETURNING ${PUBLIC_FIELDS}`,
    [email, name || null, googleId, avatarUrl || null]
  );
  return rows[0];
}

export async function linkGoogleAccount(userId, { googleId, avatarUrl, name }) {
  const { rows } = await query(
    `UPDATE users
       SET google_id     = $2,
           avatar_url    = COALESCE($3, avatar_url),
           name          = COALESCE(name, $4),
           email_verified = TRUE
     WHERE id = $1
     RETURNING ${PUBLIC_FIELDS}`,
    [userId, googleId, avatarUrl || null, name || null]
  );
  return rows[0];
}

export async function touchLastLogin(userId) {
  await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [userId]);
}
