import { Router } from "express";
import { pool } from "../pool.js";

export const endpointsTipos = Router()

endpointsTipos.get("/", async (req, res) => {
    const db_res = await pool.query(
    `SELECT * FROM tipos
    `)

    res.status(200).json(db_res.rows)
})

endpointsTipos.get("/:id", async (req, res) => {
    const id = req.params.id
    const db_res = await pool.query(
     `SELECT t.nombre as tipo FROM tipos t
     WHERE t.id = $1`, [id]   
    )

    if (db_res.rowCount === 0)
      return res.status(404).json({error: "No se encontro el tipo"})
    res.status(200).json(db_res.rows[0])
})

endpointsTipos.post("/", async (req, res) => {
    const nombre = req.body.nombre
    if (typeof nombre !== "string" || nombre.trim() === "")
        return res.status(400).json({error: "El nombre no puede estar vacio y debe ser un string"})

    try {
        const db_res = await pool.query(
            `INSERT INTO tipos (nombre) VALUES ($1)`, [nombre]
        )
       res.status(201).json("Tipo creado exitosamente")
    }

    catch(err) {
        if (err.code === "23505")
           return res.status(409).json({error: "El tipo ya existe"})
        
        res.status(500).json({error: "Error al crear el tipo"});
    }
})

endpointsTipos.put("/:id", async (req, res) => {
    const id = req.params.id
    const nombre = req.body.nombre
    if (typeof nombre !== "string" || nombre.trim() === "")
        return res.status(400).json({error: "El nombre no puede estar vacio y debe ser un string"})

    try {
        const db_res = await pool.query(
        `UPDATE tipos SET nombre = $2 WHERE id = $1`, [id, nombre]
        )
        if (db_res.rowCount === 0)
            return res.status(404).json({error: "No se encontro el tipo a actualizar"})

        res.status(200).json("Tipo actualizado exitosamente")
    }

    catch (err) {
        if (err.code === "23505")
           return res.status(409).json({error: "El tipo ya existe. Debes cambiarlo por uno nuevo."})
        res.status(500).json({error: "Error al actualizar el tipo"});
    }
})

endpointsTipos.delete("/:id", async (req, res) => {
    const id = req.params.id

    try {
    const db_res = await pool.query(
        `DELETE FROM tipos WHERE id = $1`, [id]
    )
    if (db_res.rowCount === 0)
        return res.status(404).json({error: "No se encontro el tipo a eliminar"})
    
    res.status(200).json({mensaje: "Tipo eliminado", tipo: db_res.rows[0]})
    }

    catch (err) {
        if (err.code === "23503")
         return res.status(409).json({error: "no se puede eliminar el tipo porque hay pokemones usandolo"})
        res.status(500).json({error: "Error al eliminar el tipo"});
    }
})

