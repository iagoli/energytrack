import { query, withTransaction } from '../db/pool.js';

const FIELDS = 'id, appliance_id, nome, icone, potencia_w, horas_dia, dias_mes, quantidade, created_at, updated_at';

function rowToApi(row) {
  return {
    id:           row.id,
    applianceId:  row.appliance_id,
    nome:         row.nome,
    icone:        row.icone,
    potencia_w:   row.potencia_w,
    horas_dia:    Number(row.horas_dia),
    dias_mes:     row.dias_mes,
    quantidade:   row.quantidade,
    createdAt:    row.created_at,
    updatedAt:    row.updated_at,
  };
}

export async function listByUser(userId) {
  const { rows } = await query(
    `SELECT ${FIELDS} FROM user_appliances WHERE user_id = $1 ORDER BY created_at ASC`,
    [userId]
  );
  return rows.map(rowToApi);
}

export async function create(userId, data) {
  const { rows } = await query(
    `INSERT INTO user_appliances
       (user_id, appliance_id, nome, icone, potencia_w, horas_dia, dias_mes, quantidade)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING ${FIELDS}`,
    [
      userId,
      data.applianceId,
      data.nome,
      data.icone || null,
      data.potencia_w,
      data.horas_dia,
      data.dias_mes,
      data.quantidade ?? 1,
    ]
  );
  return rowToApi(rows[0]);
}

export async function updateById(userId, id, data) {
  const { rows } = await query(
    `UPDATE user_appliances
        SET potencia_w = $3,
            horas_dia  = $4,
            dias_mes   = $5,
            quantidade = $6
      WHERE id = $1 AND user_id = $2
      RETURNING ${FIELDS}`,
    [id, userId, data.potencia_w, data.horas_dia, data.dias_mes, data.quantidade ?? 1]
  );
  return rows[0] ? rowToApi(rows[0]) : null;
}

export async function deleteById(userId, id) {
  const { rowCount } = await query(
    'DELETE FROM user_appliances WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return rowCount > 0;
}

export async function bulkInsert(userId, items) {
  if (!items?.length) return [];
  return withTransaction(async (client) => {
    const inserted = [];
    for (const data of items) {
      const { rows } = await client.query(
        `INSERT INTO user_appliances
           (user_id, appliance_id, nome, icone, potencia_w, horas_dia, dias_mes, quantidade)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING ${FIELDS}`,
        [
          userId,
          data.applianceId,
          data.nome,
          data.icone || null,
          data.potencia_w,
          data.horas_dia,
          data.dias_mes,
          data.quantidade ?? 1,
        ]
      );
      inserted.push(rowToApi(rows[0]));
    }
    return inserted;
  });
}
