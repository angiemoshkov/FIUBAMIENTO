import { db } from "../db/pool.js";

//---CRUD completo, respetando el orden de las siglas"---//

//CREATE
export async function createSpot(latitud, longitud, direccion_aproximada, referencia) {
  const res = await db.query(
    `INSERT INTO spots (latitud, longitud, direccion_aproximada, referencia) 
    VALUES ($1, $2, $3, $4)`,
    [latitud, longitud, direccion_aproximada, referencia],
  );

  return res.rowCount == 1;
}

//READ
export async function getAllSpots(dia_semana, hora) {
  const res = await db.query(
  `SELECT s.id, s.latitud, s.longitud, s.direccion_aproximada, s.referencia,
  (SELECT COUNT(*) FROM restricciones r
    WHERE r.spot_id = s.id
    AND r.dia_semana = $1
    AND $2 BETWEEN r.hora_inicio AND r.hora_fin) AS restricciones_activas,
  
  (SELECT rep.estado_reportado FROM reportes rep
    WHERE rep.spot_id = s.id
    AND rep.fecha_expiracion > NOW()
    ORDER BY rep.fecha_creacion DESC 
    LIMIT 1) AS ultimo_estado,

  (SELECT rep.id FROM reportes rep
    WHERE rep.spot_id = s.id
    AND rep.fecha_expiracion > NOW()
    ORDER BY rep.fecha_creacion DESC LIMIT 1)
    AS ultimo_reporte_id

  FROM spots s
  `, [dia_semana, hora],
  );
  return res.rows;
}

export async function getSpot(id) {
  const res = await db.query(
    "SELECT * FROM spots s WHERE s.id = $1",
    [id],
  );

  return res.rows[0];
}

//UPDATE
export async function updateSpot(id, latitud, longitud, direccion_aproximada, referencia) {
  const res = await db.query(
    `UPDATE spots SET latitud=$1, longitud=$2, direccion_aproximada=$3, referencia=$4 WHERE id = $5`,
    [latitud, longitud, direccion_aproximada, referencia, id],
  );

  return res.rowCount == 1;
}

export async function limpiarDatosDelSpot(id) {
  await db.query("DELETE FROM reportes WHERE spot_id = $1", [id]);
  await db.query("DELETE FROM restricciones WHERE spot_id = $1", [id]);
}

//DELETE
export async function deleteSpot(id) {
  const res = await db.query("DELETE FROM spots WHERE id = $1", [id]);

  return res.rowCount == 1;
}



