import { db } from "./pool.js";

export async function getAllPokemons() {
  const res = await db.query(
    "SELECT p.nombre, p.evolucion, t.nombre as tipo, p.rareza FROM pokemons p, tipos t WHERE p.tipo = t.id",
  );
  return res.rows;
}

export async function getPokemon(id) {
  const res = await db.query(
    "SELECT p.nombre, p.evolucion, t.nombre as tipo, p.rareza FROM pokemons p, tipos t WHERE p.tipo = t.id AND p.id = $1",
    [id],
  );

  return res.rows[0];
}

export async function removePokemon(id) {
  const res = await db.query("DELETE FROM pokemons WHERE id = $1", [id]);

  return res.rowCount == 1;
}

export async function updatePokemon(id, nombre, evolucion, tipo, rareza) {
  const res = await db.query(
    "UPDATE pokemons SET nombre=$1, evolucion=$2, tipo=$3, rareza=$4 WHERE id = $5",
    [nombre, evolucion, tipo, rareza, id],
  );

  return res.rowCount == 1;
}

export async function createPokemon(nombre, evolucion, tipo, rareza) {
  const res = await db.query(
    "INSERT INTO pokemons (nombre, evolucion, tipo, rareza) VALUES ($1, $2, $3, $4)",
    [nombre, evolucion, tipo, rareza],
  );

  return res.rowCount == 1;
}
