import { db } from "./pool.js";

export async function getReportesBySpot(spot_id) {
  const res = await db.query(
    `SELECT id, spot_id, estado_reportado, fecha_creacion, fecha_expiracion, confianza_positiva, confianza_negativa
     FROM reportes
     WHERE spot_id = $1
     ORDER BY fecha_creacion DESC`,
    [spot_id]
  );
  return res.rows;
}

export async function createReporte(spot_id, estado_reportado) {
  const res = await db.query(
    `INSERT INTO reportes (spot_id, estado_reportado, fecha_expiracion)
     VALUES ($1, $2, NOW() + INTERVAL '20 minutes')
     RETURNING *`,
    [spot_id, estado_reportado]
  );
  return res.rows[0];
}

export async function updateReporte(id, estado_reportado) {
  const res = await db.query(
    `UPDATE reportes
     SET estado_reportado = $1, fecha_expiracion = NOW() + INTERVAL '20 minutes'
     WHERE id = $2
     RETURNING *`,
    [estado_reportado, id]
  );
  return res.rows[0];
}

export async function deleteReporte(id) {
  const res = await db.query(
    "DELETE FROM reportes WHERE id = $1",
    [id]
  );
  return res.rowCount === 1;
}

