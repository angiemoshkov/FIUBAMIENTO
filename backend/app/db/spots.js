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
export async function getAllSpots() {
  const res = await db.query(
    "SELECT * FROM spots",
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

//DELETE
export async function deleteSpot(id) {
  const res = await db.query("DELETE FROM spots WHERE id = $1", [id]);

  return res.rowCount == 1;
}



