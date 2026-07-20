import { query } from '../db/pool.js';

function rowToApi(row) {
  if (!row) return null;
  return {
    tariff:        Number(row.tariff),
    tariffSource:  row.tariff_source,
    uf:            row.uf,
    distribuidora: row.distribuidora,
    cep:           row.cep,
    solarRegion:   row.solar_region,
    location:      row.location_data,
    updatedAt:     row.updated_at,
  };
}

export async function getByUser(userId) {
  const { rows } = await query(
    `SELECT tariff, tariff_source, uf, distribuidora, cep, solar_region, location_data, updated_at
       FROM user_settings WHERE user_id = $1 LIMIT 1`,
    [userId]
  );
  return rowToApi(rows[0]);
}

export async function upsertForUser(userId, patch) {
  // UPSERT por user_id (PK). Aceita patch parcial — campos ausentes mantêm o
  // valor anterior via COALESCE.
  const { rows } = await query(
    `INSERT INTO user_settings
       (user_id, tariff, tariff_source, uf, distribuidora, cep, solar_region, location_data)
     VALUES
       ($1,
        COALESCE($2, 0.75),
        COALESCE($3, 'manual'),
        $4,
        $5,
        $6,
        COALESCE($7, 'sudeste'),
        $8)
     ON CONFLICT (user_id) DO UPDATE
       SET tariff        = COALESCE(EXCLUDED.tariff,        user_settings.tariff),
           tariff_source = COALESCE(EXCLUDED.tariff_source, user_settings.tariff_source),
           uf            = COALESCE(EXCLUDED.uf,            user_settings.uf),
           distribuidora = COALESCE(EXCLUDED.distribuidora, user_settings.distribuidora),
           cep           = COALESCE(EXCLUDED.cep,           user_settings.cep),
           solar_region  = COALESCE(EXCLUDED.solar_region,  user_settings.solar_region),
           location_data = COALESCE(EXCLUDED.location_data, user_settings.location_data)
     RETURNING tariff, tariff_source, uf, distribuidora, cep, solar_region, location_data, updated_at`,
    [
      userId,
      patch.tariff ?? null,
      patch.tariffSource ?? null,
      patch.uf ?? null,
      patch.distribuidora ?? null,
      patch.cep ?? null,
      patch.solarRegion ?? null,
      patch.location ? JSON.stringify(patch.location) : null,
    ]
  );
  return rowToApi(rows[0]);
}
