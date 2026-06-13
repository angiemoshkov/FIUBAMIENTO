import { Router } from "express";
import { pool } from "../db/pool.js";

export const endpointsReportes = Router();
endpointsReportes.get("/", async (req, res) => {
  const { spot_id } = req.query;
  if (!spot_id) {
    return res.status(400).json({ error: "spot_id es obligatorio" });
  }
  const db_res = await pool.query(
    `SELECT id, spot_id, estado_reportado, fecha_creacion, fecha_expiracion, confianza_positiva, confianza_negativa
     FROM reportes
     WHERE spot_id = $1
     ORDER BY fecha_creacion DESC`,
    [spot_id]
  );
  res.json(db_res.rows);
});