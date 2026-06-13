import { db } from "./pool.js";

export async function getAllTipos() {
  const res = await db.query("SELECT nombre FROM tipos");
  return res.rows;
}

export async function getTipoByName(nombre) {
  const res = await db.query("SELECT * FROM tipos WHERE nombre = $1", [nombre]);
  console.log(res);
  return res.rows[0];
}
