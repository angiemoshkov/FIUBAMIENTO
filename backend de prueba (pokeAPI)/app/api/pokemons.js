import { Router } from "express";
import { pool } from "../pool.js";

export const endpointsPokemons = Router();


endpointsPokemons.get("/", async (req, res) => {
  // JOIN con tipos para devolver el NOMBRE del tipo, no el id crudo.
  const db_res = await pool.query(
    `SELECT p.id, p.nombre, p.evolucion, t.nombre AS tipo, p.rareza
     FROM pokemones p
     JOIN tipos t ON p.tipo = t.id
     ORDER BY p.id`
  );
  res.json(db_res.rows);
});



endpointsPokemons.get("/:id", async (req, res) => {
  const id = req.params.id;
  const db_res = await pool.query(
    `SELECT p.id, p.nombre, p.evolucion, t.nombre AS tipo, p.rareza
     FROM pokemones p
     JOIN tipos t ON p.tipo = t.id
     WHERE p.id = $1`,
    [id]
  );
  if (db_res.rowCount === 0) {
    return res.status(404).json({ error: "Pokemon no encontrado" });
  }
  res.status(200).json(db_res.rows[0]);
});



endpointsPokemons.post("/", async (req, res) => {
  const { nombre, evolucion, tipo, rareza } = req.body;
  if (!nombre || evolucion === undefined || tipo === undefined) {
    return res.status(400).json({ error: "nombre, evolucion y tipo son obligatorios" });
  }

  try {
    const db_res = await pool.query(
      `INSERT INTO pokemones (nombre, evolucion, tipo, rareza)
       VALUES ($1, $2, $3, $4)`,
      [nombre, evolucion, tipo, rareza ?? 0]
    );
    res.status(201).json(db_res.rows[0]);

  } catch (err) {
    // Postgres rechaza solo si rompés una regla. Capturo los dos casos:
        if (err.code === "23503") // FK: el tipo no existe en la tabla tipos
        return res.status(400).json({ error: "El tipo indicado no existe" });
        if (err.code === "23505") // UNIQUE: nombre repetido
        return res.status(409).json({ error: "Ya existe ese pokemon" });
        
        res.status(500).json({ error: "Error al crear el pokemon" });
  }
});



// PUT /api/v1/pokemons/:id  -> actualiza
endpointsPokemons.put("/:id", async (req, res) => {
  const id = req.params.id;
  const { nombre, evolucion, tipo, rareza } = req.body;

  if (!nombre || evolucion === undefined || tipo === undefined) {
    return res.status(400).json({ error: "nombre, evolucion y tipo son obligatorios" });
  }

  try {
    const db_res = await pool.query(
      `UPDATE pokemones
       SET nombre = $1, evolucion = $2, tipo = $3, rareza = $4
       WHERE id = $5
       RETURNING *`,
      [nombre, evolucion, tipo, rareza, id]
    );
    if (db_res.rowCount === 0) {
      return res.status(404).json({ error: "Pokemon no encontrado" });
    }
    res.status(200).json(db_res.rows[0]);

  } catch (err) {
    if (err.code === "23503")
      return res.status(400).json({ error: "El tipo indicado no existe" });
    if (err.code === "23505")
      return res.status(409).json({ error: "Ya existe ese pokemon" });
    
    res.status(500).json({ error: "Error al actualizar el pokemon" });
  }
});



endpointsPokemons.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const db_res = await pool.query(
    "DELETE FROM pokemones WHERE id = $1",
    [id]
  );
  if (db_res.rowCount === 0) {
    return res.status(404).json({ error: "Pokemon no encontrado" });
  }
  res.status(200).json({ mensaje: "Pokemon eliminado", pokemon: db_res.rows[0] });
});