import { Router } from "express";
import { getReportesBySpot, createReporte, updateReporte, deleteReporte } from "../db/reportes.js";

export const endpointsReportes = Router();

endpointsReportes.get("/", async (req, res) => {
  const { spot_id } = req.query;
  if (!spot_id) {
    return res.status(400).json({ error: "spot_id es obligatorio" });
  }

  const reportes = await getReportesBySpot(spot_id);
  res.json(reportes);
});

endpointsReportes.post("/", async (req, res) => {
  const { spot_id, estado_reportado } = req.body;

  if (!spot_id || !estado_reportado) {
    return res.status(400).json({ error: "spot_id y estado_reportado son obligatorios" });
  }

  const estados_validos = ["libre", "ocupado", "me_yendo"];
  if (!estados_validos.includes(estado_reportado)) {
    return res.status(400).json({ error: "estado_reportado debe ser: libre, ocupado o me_yendo" });
  }

  const reporte = await createReporte(spot_id, estado_reportado);
  res.status(201).json(reporte);
});

endpointsReportes.put("/:id", async (req, res) => {
  const id = req.params.id;
  const { estado_reportado } = req.body;

  if (!estado_reportado) {
    return res.status(400).json({ error: "estado_reportado es obligatorio" });
  }

  const estados_validos = ["libre", "ocupado", "me_yendo"];
  if (!estados_validos.includes(estado_reportado)) {
    return res.status(400).json({ error: "estado_reportado debe ser: libre, ocupado o me_yendo" });
  }

  const reporte = await updateReporte(id, estado_reportado);
  if (!reporte) {
    return res.status(404).json({ error: "Reporte no encontrado" });
  }
  res.json(reporte);
});

endpointsReportes.delete("/:id", async (req, res) => {
  const id = req.params.id;

  const eliminado = await deleteReporte(id);
  if (!eliminado) {
    return res.status(404).json({ error: "Reporte no encontrado" });
  }
  res.json({ mensaje: "Reporte eliminado" });
});