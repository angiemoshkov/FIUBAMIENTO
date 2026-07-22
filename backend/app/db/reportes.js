import { db } from "./pool.js";

export async function getAllReportes(dia_semana, hora) {
  const res = await db.query(
    `SELECT r.id, r.spot_id, s.direccion_aproximada, r.estado_reportado,
            r.fecha_creacion, r.fecha_expiracion, r.veces_libre, r.veces_ocupado,
            r.fecha_expiracion > NOW() AS vigente,

     (SELECT COUNT(*) FROM restricciones rest
        WHERE rest.spot_id = r.spot_id
        AND rest.dia_semana = $1
        AND $2 BETWEEN rest.hora_inicio AND rest.hora_fin
      ) AS restricciones_activas

     FROM reportes r
     JOIN spots s ON s.id = r.spot_id
     ORDER BY r.spot_id, r.fecha_creacion DESC`, [dia_semana, hora]
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
     SET estado_anterior = estado_reportado,
         fecha_creacion_anterior = fecha_creacion,
         estado_reportado = $2,
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
  const actual = await db.query(
    "SELECT estado_reportado, estado_anterior FROM reportes WHERE id = $1",
    [id]
  );
  if (actual.rowCount === 0) {
    return null; 
  }

  if (actual.rows[0].estado_anterior === null) {
    await db.query("DELETE FROM reportes WHERE id = $1", [id]);
    return { revertido: false };
  }

  const decLibre   = actual.rows[0].estado_reportado === 'libre'   ? 1 : 0;
  const decOcupado = actual.rows[0].estado_reportado === 'ocupado' ? 1 : 0;

  const res = await db.query(
    `UPDATE reportes
     SET estado_reportado = estado_anterior,
         fecha_creacion   = fecha_creacion_anterior,
         fecha_expiracion = fecha_creacion_anterior + INTERVAL '3 hours',
         veces_libre   = veces_libre   - $2,
         veces_ocupado = veces_ocupado - $3,
         estado_anterior = NULL,
         fecha_creacion_anterior = NULL
     WHERE id = $1
     RETURNING *`,
    [id, decLibre, decOcupado]
  );
  return { revertido: true, reporte: res.rows[0] };
}

