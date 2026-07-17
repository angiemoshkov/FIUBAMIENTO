import { db } from "../db/pool.js";

//---CRUD completo, respetando el orden de las siglas"---//

//CREATE
export async function createRestriccion(spot_id, tipo_restriccion, dia_semana, hora_inicio, hora_fin, descripcion) {
  const res = await db.query(
    `INSERT INTO restricciones (spot_id, tipo, dia_semana, hora_inicio, hora_fin, descripcion)
    VALUES ($1, $2, $3, $4, $5, $6)`,
    [spot_id, tipo_restriccion, dia_semana, hora_inicio, hora_fin, descripcion],
  );

  return res.rowCount == 1;
}

//READ
export async function getAllRestricciones(spot_id) {
  const res = await db.query(
    `SELECT * FROM restricciones
     WHERE spot_id = $1;`,
     [spot_id],
  );
  return res.rows;
}

export async function getRestriccion(id) {
  const res = await db.query(
    "SELECT * FROM restricciones r WHERE r.id = $1",
    [id],
  );

  return res.rows[0];
}

//UPDATE
export async function updateRestriccion(id, tipo_restriccion, dia_semana, hora_inicio, hora_fin, descripcion) {
  const res = await db.query(
    `UPDATE restricciones SET tipo=$1, dia_semana=$2, hora_inicio=$3, hora_fin=$4, descripcion=$5 WHERE id = $6`,
    [tipo_restriccion, dia_semana, hora_inicio, hora_fin, descripcion, id],
  );

  return res.rowCount == 1;
}

//DELETE
export async function deleteRestriccion(id) {
  const res = await db.query("DELETE FROM restricciones WHERE id = $1", [id]);

  return res.rowCount == 1;
}



