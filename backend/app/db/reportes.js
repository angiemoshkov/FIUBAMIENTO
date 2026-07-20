import { db } from "./pool.js";

export async function getReportesBySpot(spot_id) {
  const res = await db.query(
    `SELECT id, spot_id, estado_reportado, fecha_creacion, fecha_expiracion, veces_libre, veces_ocupado
     FROM reportes
     WHERE spot_id = $1
     ORDER BY fecha_creacion DESC`,
    [spot_id]
  );
  return res.rows;
}

export async function getAllReportes() {
  const res = await db.query(
    `SELECT r.id, r.spot_id, s.direccion_aproximada, r.estado_reportado,
            r.fecha_creacion, r.fecha_expiracion, r.veces_libre, r.veces_ocupado
     FROM reportes r
     JOIN spots s ON s.id = r.spot_id
     ORDER BY r.fecha_creacion DESC`
  );
  return res.rows;
}

export async function getReporteById(id) {
  const res = await db.query(
    `SELECT id, spot_id, estado_reportado, fecha_creacion, fecha_expiracion, veces_libre, veces_ocupado
     FROM reportes
     WHERE id = $1`,
    [id]
  );
  return res.rows[0];
}

export async function createReporte(spot_id, estado_reportado) {
  const vecesLibre   = estado_reportado === 'libre'   ? 1 : 0;
  const vecesOcupado = estado_reportado === 'ocupado' ? 1 : 0;

  const res = await db.query(
    `INSERT INTO reportes (spot_id, estado_reportado, fecha_expiracion, veces_libre, veces_ocupado)
     VALUES ($1, $2, NOW() + INTERVAL '3 hours', $3, $4)
     RETURNING *`,
    [spot_id, estado_reportado, vecesLibre, vecesOcupado]
  );
  return res.rows[0];
}

export async function updateReporte(id, estado_reportado) {
  const incLibre   = estado_reportado === 'libre'   ? 1 : 0;
  const incOcupado = estado_reportado === 'ocupado' ? 1 : 0;

  const res = await db.query(
    `UPDATE reportes
     SET estado_reportado = $2,
         fecha_creacion   = NOW(),
         fecha_expiracion = NOW() + INTERVAL '3 hours',
         veces_libre   = veces_libre   + $3,
         veces_ocupado = veces_ocupado + $4
     WHERE id = $1
     RETURNING *`,
    [id, estado_reportado, incLibre, incOcupado]
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

